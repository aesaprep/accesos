/* =====================================================================
   AESA Prep Academy · MODO PRUEBA (sin servidor, con alumnos ficticios)
   ---------------------------------------------------------------------
   Solo se usa si en app.js pones  API_URL: 'PRUEBA'.
   Sirve para probar los carteles QR y las pegatinas NFC con el móvil
   antes de montar Google Sheets. Todo se guarda en el propio móvil.
   Cuando pegues en app.js la URL real de la API, este archivo deja de
   usarse (puedes borrarlo del repositorio).
   Las reglas de abajo son copia exacta de apps-script-api/Code.gs.
   ===================================================================== */
(function () {
  'use strict';

  function estadoDesdeMovs_(movs) {
    var dentro = false, ultimo = null;
    (movs || []).forEach(function (m) {
      if (m.resultado === 'DENEGADO') return;
      if (m.tipo === 'ENTRADA') { dentro = true; ultimo = m; }
      else if (m.tipo.indexOf('SALIDA') === 0) { dentro = false; ultimo = m; }
    });
    return { dentro: dentro, ultimoEfectivo: ultimo };
  }
  function bloquesDe_(bloquesAlumno, dia) {
    return (bloquesAlumno || [])
      .filter(function (b) { return b.dia === dia; })
      .map(function (b) { return { desde: b.desde, hasta: b.hasta }; })
      .sort(function (a, b) { return a.desde - b.desde; });
  }
  function fusionar_(bloques) {
    var out = [];
    bloques.slice().sort(function (a, b) { return a.desde - b.desde; }).forEach(function (b) {
      var u = out[out.length - 1];
      if (u && b.desde <= u.hasta) u.hasta = Math.max(u.hasta, b.hasta);
      else out.push({ desde: b.desde, hasta: b.hasta });
    });
    return out;
  }
  function bloqueEn_(bloques, min) {
    return bloques.filter(function (b) { return b.desde <= min && min < b.hasta; })[0] || null;
  }
  function cubre_(permisos, min) {
    return (permisos || []).filter(function (p) { return p.desde <= min && min <= p.hasta; })[0] || null;
  }
  function refLlegada_(ref, permisos) {
    var cambiado = true, n = 0;
    while (cambiado && n++ < 20) {
      cambiado = false;
      (permisos || []).forEach(function (p) {
        if (p.desde <= ref && ref < p.hasta) { ref = p.hasta; cambiado = true; }
      });
    }
    return ref;
  }
  function decidir_(c) {
    var bl = (c.bloques || []).slice().sort(function (a, b) { return a.desde - b.desde; });
    var fus = fusionar_(bl), ahora = c.ahora, perms = c.permisos || [];

    // ---------- ENTRADA: siempre se permite ----------
    if (!c.dentro) {
      var ref = null;
      if (c.primeraEntrada) { if (bl.length) ref = bl[0].desde; }
      else { var b = bloqueEn_(bl, ahora); if (b) ref = b.desde; }
      if (ref !== null) {
        var esperada = refLlegada_(ref, perms);
        if (esperada < 24 * 60 && ahora > esperada + c.margen) {
          return { tipo: 'ENTRADA', resultado: 'AUTORIZADO', codigo: 'TARDE', tarde: true,
            params: { desde: fmtHora_(ref) }, motivoTexto: 'TARDE (clase desde ' + fmtHora_(ref) + ')' };
        }
      }
      return { tipo: 'ENTRADA', resultado: 'AUTORIZADO', codigo: 'BIENVENIDA', tarde: false, params: {}, motivoTexto: '' };
    }

    // ---------- SALIDA ----------
    var p = cubre_(perms, ahora);
    function S(res, codigo, params, texto) {
      return { tipo: 'SALIDA', resultado: res, codigo: codigo, tarde: false, params: params || {}, motivoTexto: texto };
    }
    function conPermiso() {
      return S('AUTORIZADO', 'PERMISO', { motivo: p.motivo, hasta: p.hasta >= 24 * 60 ? '' : fmtHora_(p.hasta) },
        'Permiso' + (p.motivo ? ': ' + p.motivo : ''));
    }
    if (!fus.length) return S('AUTORIZADO', 'SIN_CLASES', {}, 'Sin clases hoy');

    var actual = bloqueEn_(fus, ahora);
    if (actual) {
      if (p) return conPermiso();
      return S('DENEGADO', 'EN_CLASE', { hasta: fmtHora_(actual.hasta) }, 'En clase hasta las ' + fmtHora_(actual.hasta));
    }
    if (ahora < fus[0].desde) {
      return S('AUTORIZADO', 'ANTES_CLASES', { desde: fmtHora_(fus[0].desde) }, 'Antes de su primera clase (' + fmtHora_(fus[0].desde) + ')');
    }
    if (ahora >= fus[fus.length - 1].hasta) return S('AUTORIZADO', 'FIN_CLASES', {}, 'Ha terminado sus clases');

    var prox = fus.filter(function (x) { return x.desde > ahora; })[0];
    if (c.horasLibres) {
      return S('AUTORIZADO', 'HORA_LIBRE', { proxima: fmtHora_(prox.desde) }, 'Hora libre (próxima clase ' + fmtHora_(prox.desde) + ')');
    }
    if (p) return conPermiso();
    return S('DENEGADO', 'HUECO', { proxima: fmtHora_(prox.desde) }, 'Hora libre sin autorización (próxima clase ' + fmtHora_(prox.desde) + ')');
  }
  function parseHora_(v) {
    if (v === null || v === undefined) return null;
    var s = String(v).trim().toLowerCase().replace(/\s+/g, '');
    if (!s) return null;
    var m = s.match(/^(\d{1,2})(?:[:.h](\d{1,2})?)?(?::\d{1,2})?h?$/);
    if (!m) return null;
    var h = parseInt(m[1], 10), mi = m[2] ? parseInt(m[2], 10) : 0;
    if (h > 24 || mi > 59 || (h === 24 && mi > 0)) return null;
    return h * 60 + mi;
  }
  function fmtHora_(min) {
    if (min === null || min === undefined) return '';
    var h = Math.floor(min / 60), m = min % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  var CODIGO = '123456', MARGEN = 10, DOMINIO = 'tucentro.es';
  var PUERTAS = { principal: 'Puerta principal', lateral: 'Puerta lateral', patio: 'Puerta del patio' };
  var CENTRO = { lat: 41.3874, lon: 2.1686, radio: 150 };
  var ALUMNOS = [
    { id: 'P1', email: 'clase@' + DOMINIO, nombre: 'Prueba', apellidos: 'En Clase', curso: 'Siempre tiene clase ahora', horasLibres: false, dinamico: 'clase' },
    { id: 'P2', email: 'hueco@' + DOMINIO, nombre: 'Prueba', apellidos: 'Hora Libre', curso: 'Ahora está en una hora libre', horasLibres: false, dinamico: 'hueco' },
    { id: 'P3', email: 'tarde@' + DOMINIO, nombre: 'Prueba', apellidos: 'Llega Tarde', curso: 'Su clase empezó hace 20 min', horasLibres: false, dinamico: 'tarde' },
    { id: 'P4', email: 'libre@' + DOMINIO, nombre: 'Prueba', apellidos: 'Sin Clases', curso: 'Hoy no tiene clases', horasLibres: false, dinamico: 'libre' },
    { id: 'A001', email: 'ana.garcia@' + DOMINIO, nombre: 'Ana', apellidos: 'García Soler', curso: '2º Bachillerato', horasLibres: false },
    { id: 'A002', email: 'marc.puig@' + DOMINIO, nombre: 'Marc', apellidos: 'Puig Ferrer', curso: '1º Bachillerato', horasLibres: false },
    { id: 'A003', email: 'laura.martinez@' + DOMINIO, nombre: 'Laura', apellidos: 'Martínez Rius', curso: 'Acceso Universidad +25', horasLibres: true },
    { id: 'A004', email: 'jordi.serra@' + DOMINIO, nombre: 'Jordi', apellidos: 'Serra Vidal', curso: '2º Bachillerato', horasLibres: true },
    { id: 'A005', email: 'sofia.lopez@' + DOMINIO, nombre: 'Sofía', apellidos: 'López Camps', curso: 'Preparación Selectividad', horasLibres: false }
  ];
  var HORARIOS = {};
  (function () {
    var LV = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    function add(id, dias, d, h) { dias.forEach(function (dia) { (HORARIOS[id] = HORARIOS[id] || []).push({ dia: dia, desde: parseHora_(d), hasta: parseHora_(h) }); }); }
    add('A001', LV, '08:30', '14:30');
    add('A002', LV, '09:00', '11:00'); add('A002', LV, '12:00', '14:00');
    add('A003', ['lunes', 'miercoles', 'viernes'], '10:00', '13:00'); add('A003', ['martes', 'jueves'], '16:00', '19:00');
    add('A004', ['lunes', 'martes', 'miercoles', 'jueves'], '09:00', '10:30');
    add('A004', ['lunes', 'martes', 'miercoles', 'jueves'], '11:00', '13:00');
    add('A004', ['lunes', 'martes', 'miercoles', 'jueves'], '15:00', '17:00');
    add('A004', ['viernes'], '09:00', '12:00');
    add('A005', LV, '15:30', '20:00');
  })();

  /* ---------- hora de Madrid ---------- */
  function ahora() {
    var p = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short', hour12: false })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    var h = p.hour === '24' ? '00' : p.hour;
    var dia = { Mon: 'lunes', Tue: 'martes', Wed: 'miercoles', Thu: 'jueves', Fri: 'viernes', Sat: 'sabado', Sun: 'domingo' }[p.weekday];
    return { fecha: p.year + '-' + p.month + '-' + p.day, min: parseInt(h, 10) * 60 + parseInt(p.minute, 10), hms: h + ':' + p.minute + ':' + p.second, dia: dia };
  }

  function bloquesHoy(a, n) {
    var lim = function (m) { return Math.max(0, Math.min(1439, m)); };
    switch (a.dinamico) {
      case 'clase': return [{ desde: lim(n.min - 5), hasta: lim(n.min + 120) }];
      case 'tarde': return [{ desde: lim(n.min - 20), hasta: lim(n.min + 90) }];
      case 'hueco': return [{ desde: lim(n.min - 120), hasta: lim(n.min - 30) }, { desde: lim(n.min + 30), hasta: lim(n.min + 120) }];
      case 'libre': return [];
      default: return bloquesDe_(HORARIOS[a.id], n.dia);
    }
  }

  /* ---------- datos guardados en el móvil ---------- */
  function leer(k, def) { try { var v = localStorage.getItem('aesa.prueba.' + k); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function guardar(k, v) { try { localStorage.setItem('aesa.prueba.' + k, JSON.stringify(v)); } catch (e) { /* nada */ } }
  function datosHoy() {
    var d = leer('datos', null), n = ahora();
    if (!d || d.fecha !== n.fecha) d = { fecha: n.fecha, registro: [], permisos: [] };
    return d;
  }

  var intentos = 0;
  function fallo(codigo, datos) { return { ok: false, codigo: codigo, datos: datos || {} }; }
  function publico(a) { return { id: a.id, nombre: a.nombre, apellidos: a.apellidos, curso: a.curso, fotoVer: '' }; }
  function porEmail(e) { return ALUMNOS.filter(function (a) { return a.email === e; })[0]; }
  function porId(id) { return ALUMNOS.filter(function (a) { return a.id === id; })[0]; }

  /* ---------- la "API" de prueba: mismas respuestas que la real ---------- */
  function api(accion, b) {
    var n = ahora(), email = String(b.email || '').trim().toLowerCase(), a;
    switch (accion) {
      case 'solicitarCodigo':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fallo('EMAIL_INVALIDO');
        if (email.split('@')[1] !== DOMINIO) return fallo('EMAIL_DOMINIO', { dominio: DOMINIO });
        if (!porEmail(email)) return fallo('EMAIL_NO_ENCONTRADO');
        intentos = 0;
        abrirBarra(true);
        return { ok: true, email: email, minutos: 10 };

      case 'verificarCodigo':
        a = porEmail(email);
        if (!a) return fallo('EMAIL_NO_ENCONTRADO');
        if (intentos >= 5) return fallo('CODIGO_BLOQUEADO');
        if (String(b.codigo || '').replace(/\D/g, '') !== CODIGO) { intentos++; return intentos >= 5 ? fallo('CODIGO_BLOQUEADO') : fallo('CODIGO_INCORRECTO', { restantes: 5 - intentos }); }
        return { ok: true, token: 'PRUEBA.' + a.id + '.' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2), alumno: publico(a), centro: CENTRO };

      case 'desvincular':
        return { ok: true };

      case 'fichar':
        var puerta = String(b.puerta || '').toLowerCase();
        if (!PUERTAS[puerta]) return fallo('PUERTA_INVALIDA');
        var m = /^PRUEBA\.([A-Z0-9]+)\./.exec(String(b.token || ''));
        a = m && porId(m[1]);
        if (!a) return fallo('TOKEN_INVALIDO');
        var d = datosHoy(), ts = Date.now();
        var movs = d.registro.filter(function (x) { return x.alumnoId === a.id; });
        var est = estadoDesdeMovs_(movs);
        var perms = d.permisos.filter(function (p) { return p.alumnoId === a.id; });
        var ctx = { dentro: est.dentro, bloques: bloquesHoy(a, n), permisos: perms, ahora: n.min, margen: MARGEN, horasLibres: a.horasLibres,
          primeraEntrada: a.dinamico !== 'hueco' && !movs.some(function (x) { return x.tipo === 'ENTRADA' && x.resultado !== 'DENEGADO'; }) };
        var u = est.ultimoEfectivo, r, repetido = false, horaRegistro = n.hms;
        if (u && ts - u.ts < 60000) {
          ctx.dentro = u.tipo !== 'ENTRADA';
          ctx.primeraEntrada = a.dinamico !== 'hueco' && u.tipo === 'ENTRADA' && movs.filter(function (x) { return x.tipo === 'ENTRADA' && x.resultado !== 'DENEGADO'; }).length === 1;
          r = decidir_(ctx); repetido = true; horaRegistro = u.hms;
        } else {
          r = decidir_(ctx);
          var ult = movs[movs.length - 1];
          if (!(r.resultado === 'DENEGADO' && ult && ult.resultado === 'DENEGADO' && ts - ult.ts < 60000)) {
            d.registro.push({ ts: ts, hms: n.hms, alumnoId: a.id, nombre: a.nombre + ' ' + a.apellidos, tipo: r.tipo, resultado: r.resultado, motivo: r.motivoTexto, puerta: puerta, ubic: b.ubicacion || 'DESCONOCIDO' });
            guardar('datos', d);
          }
        }
        return { ok: true, tipo: r.tipo, resultado: r.resultado, codigo: r.codigo, params: r.params, tarde: r.tarde, repetido: repetido,
          horaRegistro: horaRegistro, ahoraMs: Date.now(), puerta: { id: puerta, nombre: PUERTAS[puerta] }, alumno: publico(a), centro: CENTRO };
    }
    return fallo('ACCION_DESCONOCIDA');
  }

  window.APIPrueba = function (accion, datos) {
    return new Promise(function (ok) { setTimeout(function () { ok(api(accion, datos || {})); }, 450); });
  };

  /* ---------- barra "MODO PRUEBA" con herramientas ---------- */
  var css = '' +
    '#mp{position:fixed;top:calc(8px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);z-index:50;font:13px system-ui,-apple-system,sans-serif;color:#1b2430;width:min(94vw,420px)}' +
    '#mp-boton{display:block;margin:0 auto;border:0;border-radius:999px;background:#ffc107;color:#3a2b00;font-weight:800;padding:6px 14px;letter-spacing:.04em;box-shadow:0 4px 14px rgba(0,0,0,.25);cursor:pointer}' +
    '#mp-hoja{margin-top:8px;background:#fff;border-radius:14px;padding:14px;box-shadow:0 12px 40px rgba(0,0,0,.35);max-height:70vh;overflow:auto;text-align:left}' +
    '#mp-hoja h4{margin:10px 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#5f6b7a}#mp-hoja h4:first-child{margin-top:0}' +
    '#mp-hoja p{margin:0 0 6px;line-height:1.4}#mp-hoja code{background:#eef1f5;border-radius:5px;padding:1px 5px;font-size:12.5px}' +
    '#mp-hoja button.acc{display:block;width:100%;margin-top:6px;border:1px solid #c8d0da;background:#f6f8fb;border-radius:9px;padding:9px;font-weight:600;cursor:pointer;color:#1b2430}' +
    '#mp-hoja table{width:100%;border-collapse:collapse;font-size:12px}#mp-hoja td{padding:3px 4px;border-bottom:1px solid #eef1f5;vertical-align:top}' +
    '#mp-hoja .codigo{font-size:22px;font-weight:800;letter-spacing:.2em}#mp-aviso{color:#0b7d41;font-weight:600;min-height:1em}';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function pintarHoja() {
    var d = datosHoy(), al = null;
    try { al = JSON.parse(localStorage.getItem('aesa.alumno') || 'null'); } catch (e) { /* nada */ }
    var vinculado = al && al.id && porId(al.id);
    var correos = ALUMNOS.map(function (a) { return '<tr><td><code>' + esc(a.email) + '</code></td><td>' + esc(a.curso) + '</td></tr>'; }).join('');
    var reg = d.registro.slice().reverse().map(function (r) {
      return '<tr><td>' + esc(r.hms.slice(0, 5)) + '</td><td>' + esc(r.nombre) + '</td><td>' + esc(r.tipo) + ' · <b>' + esc(r.resultado) + '</b><br>' + esc(r.motivo) + '</td></tr>';
    }).join('') || '<tr><td>Todavía no hay fichajes hoy.</td></tr>';
    document.getElementById('mp-hoja').innerHTML =
      '<h4>Qué es esto</h4><p>Modo prueba: alumnos ficticios, sin Google. Todo se guarda solo en este móvil.</p>' +
      '<h4>Código para vincular</h4><p class="codigo">' + CODIGO + '</p>' +
      '<h4>Correos de prueba</h4><table>' + correos + '</table>' +
      '<h4>Secretaría (simulada)</h4>' +
      (vinculado ? '<p>Móvil vinculado como <b>' + esc(al.nombre + ' ' + al.apellidos) + '</b>.</p>' +
        '<button class="acc" type="button" id="mp-permiso">Dar permiso para salir (30 min)</button>' : '<p>Vincula el móvil para poder darle permisos.</p>') +
      '<button class="acc" type="button" id="mp-borrar">Borrar los fichajes de hoy (empezar de cero)</button>' +
      '<p id="mp-aviso"></p>' +
      '<h4>Registro de hoy en este móvil</h4><table>' + reg + '</table>';
    var bp = document.getElementById('mp-permiso');
    if (bp) bp.onclick = function () {
      var dd = datosHoy(), n = ahora();
      dd.permisos.push({ alumnoId: al.id, desde: n.min, hasta: Math.min(n.min + 30, 1439), motivo: 'Permiso de prueba' });
      guardar('datos', dd);
      document.getElementById('mp-aviso').textContent = 'Permiso creado hasta las ' + fmtHora_(Math.min(n.min + 30, 1439)) + '. Vuelve a escanear la puerta.';
    };
    document.getElementById('mp-borrar').onclick = function () {
      guardar('datos', { fecha: ahora().fecha, registro: [], permisos: [] });
      pintarHoja();
      document.getElementById('mp-aviso').textContent = 'Fichajes borrados. El próximo escaneo será una entrada.';
    };
  }

  function abrirBarra(abrir) {
    var hoja = document.getElementById('mp-hoja');
    if (!hoja) return;
    hoja.hidden = !abrir;
    if (abrir) pintarHoja();
  }

  function montar() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var div = document.createElement('div'); div.id = 'mp';
    div.innerHTML = '<button type="button" id="mp-boton">MODO PRUEBA · datos ficticios ▾</button><div id="mp-hoja" hidden></div>';
    document.body.appendChild(div);
    document.getElementById('mp-boton').onclick = function () { abrirBarra(document.getElementById('mp-hoja').hidden); };
  }
  if (document.body) montar(); else document.addEventListener('DOMContentLoaded', montar);
})();
