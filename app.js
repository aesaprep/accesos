/* =====================================================================
   AESA Prep Academy · Control de entradas y salidas — app del alumno
   ---------------------------------------------------------------------
   ⚙️  ÚNICO CAMBIO OBLIGATORIO: pega en API_URL la URL de la API
       (la que termina en /exec, de Implementar → Gestionar implementaciones).
       Mientras valga 'PRUEBA', la web funciona en MODO PRUEBA: sin Google,
       con alumnos ficticios (archivo modo-prueba.js). Sirve para probar
       los QR y las pegatinas NFC antes de montar todo lo demás.
   ===================================================================== */
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbzHHJPI6Nz0TV7zUZfQEDp41H-MROvDnY-wiOzK3O49EucSZhEeW2q_gfGISjb3fyC79A/exec',
  SEGUNDOS_VALIDEZ_PANTALLA: 120,   // pasado este tiempo la pantalla verde/roja se pone gris
  ZONA_HORARIA: 'Europe/Madrid',
};

/* ---------------------------------------------------------------------
   TEXTOS — para traducir solo hay que tocar estas frases.
   {algo} se sustituye por un dato (una hora, un correo...).
   --------------------------------------------------------------------- */
const TEXTOS = {
  es: {
    locale: 'es-ES',
    comprobando: 'Comprobando…',
    ubicando: 'Comprobando ubicación…',
    registrando: 'Registrando…',
    vincTitulo: 'Vincula tu móvil',
    vincIntro: 'Solo la primera vez. Te enviaremos un código a tu correo del centro.',
    emailEtiqueta: 'Tu correo del centro',
    enviarCodigo: 'Enviarme el código',
    enviando: 'Enviando…',
    codigoEnviado: 'Te hemos enviado un código de 6 cifras a {email}. Mira la bandeja de entrada (y la de spam).',
    codigoEtiqueta: 'Código de 6 cifras',
    validar: 'Vincular este móvil',
    otroEmail: 'Usar otro correo / pedir otro código',
    vincNota: 'Nunca te pediremos la contraseña de tu correo.',
    vinculadoSinPuerta: 'Móvil vinculado. Ya puedes fichar escaneando el código de la puerta.',
    noSoyYo: 'No soy yo / desvincular este móvil',
    privacidad: 'Aviso de privacidad',
    confirmarDesvincular: '¿Desvincular este móvil? Para volver a usarlo tendrás que vincularlo con un código.',
    desvinculado: 'Móvil desvinculado. Para fichar, vuelve a vincularlo.',
    tokenInvalido: 'Este móvil ya no está vinculado (te vinculaste en otro móvil o secretaría lo desvinculó). Vuelve a vincularlo.',
    bienvenida: '¡Bienvenido/a!',
    entradaRegistrada: 'Entrada registrada',
    tarde: 'Llegas tarde: tu clase empezaba a las {desde}',
    puedesSalir: 'Puedes salir',
    salida_FIN_CLASES: 'Has terminado tus clases de hoy. ¡Hasta pronto!',
    salida_HORA_LIBRE: 'Hora libre. Tu próxima clase es a las {proxima}.',
    salida_PERMISO: 'Tienes un permiso de secretaría.',
    salida_PERMISO_hasta: 'Tienes un permiso de secretaría hasta las {hasta}.',
    salida_ANTES_CLASES: 'Tus clases empiezan a las {desde}.',
    salida_SIN_CLASES: 'Hoy no tienes clases en tu horario.',
    noPuedesSalir: 'No puedes salir',
    denegado_EN_CLASE: 'Tienes clase hasta las {hasta}. Ve a secretaría.',
    denegado_HUECO: 'No tienes autorización para salir en horas libres. Tu próxima clase es a las {proxima}. Ve a secretaría.',
    ENTRADA: 'Entrada',
    SALIDA: 'Salida',
    registradoA: 'registrada a las {hora}',
    yaRegistrado: 'Ya lo habías registrado hace un momento.',
    caducadaTitulo: 'Pantalla caducada',
    caducadaMsg: 'Esta pantalla ya no es válida. Vuelve a escanear el código de la puerta.',
    sinPuertaTitulo: 'Escanea el código de la puerta',
    sinPuertaMsg: 'Para fichar, escanea el QR o acerca el móvil a la pegatina NFC de la puerta.',
    errConexionTitulo: 'Sin conexión',
    errTitulo: 'Algo no ha ido bien',
    reintentar: 'Reintentar',
    err_CONEXION: 'No se ha podido conectar. Comprueba los datos móviles o el wifi e inténtalo otra vez.',
    err_PUERTA_INVALIDA: 'Este código de puerta no es válido. Avisa en secretaría.',
    err_EMAIL_INVALIDO: 'Escribe un correo válido.',
    err_EMAIL_DOMINIO: 'Usa tu correo del centro (el que acaba en @{dominio}).',
    err_EMAIL_NO_ENCONTRADO: 'Ese correo no está dado de alta. Habla con secretaría.',
    err_ALUMNO_INACTIVO: 'Tu ficha no está activa. Habla con secretaría.',
    err_ESPERA: 'Espera {segundos} segundos antes de pedir otro código.',
    err_ERROR_CORREO: 'No se ha podido enviar el correo. Inténtalo en un momento.',
    err_CODIGO_INCORRECTO: 'Código incorrecto.',
    err_CODIGO_INCORRECTO_n: 'Código incorrecto. Te quedan {restantes} intentos.',
    err_CODIGO_CADUCADO: 'El código ha caducado. Pide uno nuevo.',
    err_CODIGO_BLOQUEADO: 'Demasiados intentos. Pide un código nuevo.',
    err_CODIGO_NO_SOLICITADO: 'Primero pide un código.',
    err_OCUPADO: 'El sistema está ocupado. Inténtalo otra vez.',
    err_ERROR_SERVIDOR: 'Error del servidor. Inténtalo otra vez o avisa en secretaría.',
    err_CONFIG: 'La aplicación no está bien configurada. Avisa en secretaría.',
    err_SIN_ALMACEN: 'Tu navegador no deja guardar datos (¿modo incógnito?). Abre el enlace en una ventana normal del navegador.',
    pronto_titulo: 'Aún es pronto',
    pronto: 'Puedes fichar la entrada a partir de las {desde}.',
    fueraTitulo: 'No estás en el colegio',
    err_FUERA_DEL_CENTRO: 'Solo se puede fichar desde el colegio. Si estás en la puerta y te sale este aviso, espera unos segundos y pulsa «Reintentar», o ve a secretaría.',
    ubicacionTitulo: 'Activa la ubicación',
    err_UBICACION_NECESARIA: 'Para fichar hay que permitir la ubicación. iPhone: Ajustes → Privacidad y seguridad → Localización → activada, y en Safari (o Chrome) «Al usar la app». Android: toca el candado junto a la dirección web → Permisos → Ubicación → Permitir. Después pulsa «Reintentar».',
  },
  ca: {
    locale: 'ca-ES',
    comprobando: 'Comprovant…',
    ubicando: 'Comprovant la ubicació…',
    registrando: 'Registrant…',
    vincTitulo: 'Vincula el teu mòbil',
    vincIntro: 'Només la primera vegada. T’enviarem un codi al teu correu del centre.',
    emailEtiqueta: 'El teu correu del centre',
    enviarCodigo: 'Envia’m el codi',
    enviando: 'Enviant…',
    codigoEnviado: 'T’hem enviat un codi de 6 xifres a {email}. Mira la safata d’entrada (i la de correu brossa).',
    codigoEtiqueta: 'Codi de 6 xifres',
    validar: 'Vincula aquest mòbil',
    otroEmail: 'Fes servir un altre correu / demana un altre codi',
    vincNota: 'Mai et demanarem la contrasenya del correu.',
    vinculadoSinPuerta: 'Mòbil vinculat. Ja pots fitxar escanejant el codi de la porta.',
    noSoyYo: 'No soc jo / desvincula aquest mòbil',
    privacidad: 'Avís de privacitat',
    confirmarDesvincular: 'Vols desvincular aquest mòbil? Per tornar-lo a fer servir l’hauràs de vincular amb un codi.',
    desvinculado: 'Mòbil desvinculat. Per fitxar, torna’l a vincular.',
    tokenInvalido: 'Aquest mòbil ja no està vinculat (et vas vincular en un altre mòbil o secretaria el va desvincular). Torna’l a vincular.',
    bienvenida: 'Benvingut/da!',
    entradaRegistrada: 'Entrada registrada',
    tarde: 'Arribes tard: la classe començava a les {desde}',
    puedesSalir: 'Pots sortir',
    salida_FIN_CLASES: 'Has acabat les classes d’avui. Fins aviat!',
    salida_HORA_LIBRE: 'Hora lliure. La pròxima classe és a les {proxima}.',
    salida_PERMISO: 'Tens un permís de secretaria.',
    salida_PERMISO_hasta: 'Tens un permís de secretaria fins a les {hasta}.',
    salida_ANTES_CLASES: 'Les teves classes comencen a les {desde}.',
    salida_SIN_CLASES: 'Avui no tens classes a l’horari.',
    noPuedesSalir: 'No pots sortir',
    denegado_EN_CLASE: 'Tens classe fins a les {hasta}. Ves a secretaria.',
    denegado_HUECO: 'No tens autorització per sortir a les hores lliures. La pròxima classe és a les {proxima}. Ves a secretaria.',
    ENTRADA: 'Entrada',
    SALIDA: 'Sortida',
    registradoA: 'registrada a les {hora}',
    yaRegistrado: 'Ja ho havies registrat fa un moment.',
    caducadaTitulo: 'Pantalla caducada',
    caducadaMsg: 'Aquesta pantalla ja no és vàlida. Torna a escanejar el codi de la porta.',
    sinPuertaTitulo: 'Escaneja el codi de la porta',
    sinPuertaMsg: 'Per fitxar, escaneja el QR o apropa el mòbil a l’adhesiu NFC de la porta.',
    errConexionTitulo: 'Sense connexió',
    errTitulo: 'Alguna cosa no ha anat bé',
    reintentar: 'Torna-ho a provar',
    err_CONEXION: 'No s’ha pogut connectar. Comprova les dades mòbils o el wifi i torna-ho a provar.',
    err_PUERTA_INVALIDA: 'Aquest codi de porta no és vàlid. Avisa a secretaria.',
    err_EMAIL_INVALIDO: 'Escriu un correu vàlid.',
    err_EMAIL_DOMINIO: 'Fes servir el correu del centre (el que acaba en @{dominio}).',
    err_EMAIL_NO_ENCONTRADO: 'Aquest correu no està donat d’alta. Parla amb secretaria.',
    err_ALUMNO_INACTIVO: 'La teva fitxa no està activa. Parla amb secretaria.',
    err_ESPERA: 'Espera {segundos} segons abans de demanar un altre codi.',
    err_ERROR_CORREO: 'No s’ha pogut enviar el correu. Torna-ho a provar d’aquí a una estona.',
    err_CODIGO_INCORRECTO: 'Codi incorrecte.',
    err_CODIGO_INCORRECTO_n: 'Codi incorrecte. Et queden {restantes} intents.',
    err_CODIGO_CADUCADO: 'El codi ha caducat. Demana’n un de nou.',
    err_CODIGO_BLOQUEADO: 'Massa intents. Demana un codi nou.',
    err_CODIGO_NO_SOLICITADO: 'Primer demana un codi.',
    err_OCUPADO: 'El sistema està ocupat. Torna-ho a provar.',
    err_ERROR_SERVIDOR: 'Error del servidor. Torna-ho a provar o avisa a secretaria.',
    err_CONFIG: 'L’aplicació no està ben configurada. Avisa a secretaria.',
    err_SIN_ALMACEN: 'El navegador no permet desar dades (mode d’incògnit?). Obre l’enllaç en una finestra normal.',
    pronto_titulo: 'Encara és aviat',
    pronto: 'Pots fitxar l’entrada a partir de les {desde}.',
    fueraTitulo: 'No ets a l’escola',
    err_FUERA_DEL_CENTRO: 'Només es pot fitxar des de l’escola. Si ets a la porta i et surt aquest avís, espera uns segons i prem «Torna-ho a provar», o ves a secretaria.',
    ubicacionTitulo: 'Activa la ubicació',
    err_UBICACION_NECESARIA: 'Per fitxar cal permetre la ubicació. iPhone: Configuració → Privacitat i seguretat → Localització → activada, i a Safari (o Chrome) «Mentre s’usa». Android: toca el cadenat al costat de l’adreça web → Permisos → Ubicació → Permetre. Després prem «Torna-ho a provar».',
  },
  en: {
    locale: 'en-GB',
    comprobando: 'Checking…',
    ubicando: 'Checking location…',
    registrando: 'Registering…',
    vincTitulo: 'Link your phone',
    vincIntro: 'Only the first time. We will send a code to your school email.',
    emailEtiqueta: 'Your school email',
    enviarCodigo: 'Send me the code',
    enviando: 'Sending…',
    codigoEnviado: 'We have sent a 6-digit code to {email}. Check your inbox (and spam folder).',
    codigoEtiqueta: '6-digit code',
    validar: 'Link this phone',
    otroEmail: 'Use another email / request another code',
    vincNota: 'We will never ask for your email password.',
    vinculadoSinPuerta: 'Phone linked. You can now check in by scanning the code at the door.',
    noSoyYo: 'Not me / unlink this phone',
    privacidad: 'Privacy notice',
    confirmarDesvincular: 'Unlink this phone? To use it again you will need to link it with a code.',
    desvinculado: 'Phone unlinked. To check in, link it again.',
    tokenInvalido: 'This phone is no longer linked (you linked another phone or the office unlinked it). Please link it again.',
    bienvenida: 'Welcome!',
    entradaRegistrada: 'Entry registered',
    tarde: 'You are late: your class started at {desde}',
    puedesSalir: 'You may leave',
    salida_FIN_CLASES: 'Your classes are over for today. See you soon!',
    salida_HORA_LIBRE: 'Free period. Your next class is at {proxima}.',
    salida_PERMISO: 'You have permission from the office.',
    salida_PERMISO_hasta: 'You have permission from the office until {hasta}.',
    salida_ANTES_CLASES: 'Your classes start at {desde}.',
    salida_SIN_CLASES: 'You have no classes on your timetable today.',
    noPuedesSalir: 'You can’t leave',
    denegado_EN_CLASE: 'You have class until {hasta}. Please go to the office.',
    denegado_HUECO: 'You are not authorised to leave during free periods. Your next class is at {proxima}. Please go to the office.',
    ENTRADA: 'Entry',
    SALIDA: 'Exit',
    registradoA: 'registered at {hora}',
    yaRegistrado: 'You had already registered this a moment ago.',
    caducadaTitulo: 'Screen expired',
    caducadaMsg: 'This screen is no longer valid. Scan the door code again.',
    sinPuertaTitulo: 'Scan the door code',
    sinPuertaMsg: 'To check in or out, scan the QR code or tap your phone on the NFC sticker at the door.',
    errConexionTitulo: 'No connection',
    errTitulo: 'Something went wrong',
    reintentar: 'Try again',
    err_CONEXION: 'Could not connect. Check your mobile data or wifi and try again.',
    err_PUERTA_INVALIDA: 'This door code is not valid. Please tell the office.',
    err_EMAIL_INVALIDO: 'Please enter a valid email.',
    err_EMAIL_DOMINIO: 'Use your school email (ending in @{dominio}).',
    err_EMAIL_NO_ENCONTRADO: 'That email is not registered. Please talk to the office.',
    err_ALUMNO_INACTIVO: 'Your record is not active. Please talk to the office.',
    err_ESPERA: 'Wait {segundos} seconds before requesting another code.',
    err_ERROR_CORREO: 'The email could not be sent. Please try again shortly.',
    err_CODIGO_INCORRECTO: 'Wrong code.',
    err_CODIGO_INCORRECTO_n: 'Wrong code. {restantes} attempts left.',
    err_CODIGO_CADUCADO: 'The code has expired. Request a new one.',
    err_CODIGO_BLOQUEADO: 'Too many attempts. Request a new code.',
    err_CODIGO_NO_SOLICITADO: 'Request a code first.',
    err_OCUPADO: 'The system is busy. Please try again.',
    err_ERROR_SERVIDOR: 'Server error. Try again or tell the office.',
    err_CONFIG: 'The app is not configured correctly. Please tell the office.',
    err_SIN_ALMACEN: 'Your browser does not allow saving data (private mode?). Open the link in a normal browser window.',
    pronto_titulo: 'Too early',
    pronto: 'You can check in from {desde}.',
    fueraTitulo: 'You are not at school',
    err_FUERA_DEL_CENTRO: 'You can only check in or out at school. If you are at the door and see this, wait a few seconds and tap "Try again", or go to the office.',
    ubicacionTitulo: 'Turn on location',
    err_UBICACION_NECESARIA: 'Location access is needed to check in. iPhone: Settings → Privacy & Security → Location Services → on, and Safari (or Chrome) "While Using". Android: tap the padlock next to the web address → Permissions → Location → Allow. Then tap "Try again".',
  },
};

/* =====================================================================
   A partir de aquí no hace falta tocar nada.
   ===================================================================== */
const $ =(id) => document.getElementById(id);
const PANTALLAS = ['cargando', 'vincular', 'resultado', 'error'];

class ErrorApp extends Error {
  constructor(codigo, datos) { super(codigo); this.codigo = codigo; this.datos = datos || {}; }
}

/* ---------- Almacenamiento local (token, datos del alumno, idioma) ---------- */
const almacen = {
  disponible: (() => {
    try { localStorage.setItem('aesa.prueba', '1'); localStorage.removeItem('aesa.prueba'); return true; } catch (e) { return false; }
  })(),
  get(k) { try { const v = localStorage.getItem('aesa.' + k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem('aesa.' + k, JSON.stringify(v)); } catch (e) { /* lleno o bloqueado */ } },
  del(k) { try { localStorage.removeItem('aesa.' + k); } catch (e) { /* nada */ } },
};

/* ---------- Estado ---------- */
const params = new URLSearchParams(location.search);
const puertaParam = (params.get('puerta') || '').trim().toLowerCase();
const puerta = /^[a-z0-9-]{1,40}$/.test(puertaParam) ? puertaParam : '';
let idioma = elegirIdioma();
let pantallaActual = 'cargando';
let ultimoResultado = null;
let mostradoEn = 0;
let desfaseReloj = 0;       // diferencia entre la hora del servidor y la del móvil
let temporizador = null;
let reintentarFn = null;
let emailPendiente = '';
let ultimoError = null;     // {titulo, mensaje} para repintar al cambiar de idioma

/* ---------- Idioma ---------- */
function elegirIdioma() {
  const q = (params.get('lang') || '').toLowerCase();
  if (TEXTOS[q]) return q;
  const guardado = almacen.get('idioma');
  if (guardado && TEXTOS[guardado]) return guardado;
  const nav = (navigator.language || 'es').slice(0, 2).toLowerCase();
  return TEXTOS[nav] ? nav : 'es';
}

function t(clave, datos) {
  let s = (TEXTOS[idioma] && TEXTOS[idioma][clave]) || TEXTOS.es[clave] || clave;
  if (datos) Object.keys(datos).forEach((k) => { s = s.split('{' + k + '}').join(datos[k] == null ? '' : datos[k]); });
  return s;
}

function aplicarIdioma() {
  document.documentElement.lang = idioma;
  document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
  document.querySelectorAll('[data-idioma]').forEach((b) => b.classList.toggle('activo', b.dataset.idioma === idioma));
  if (pantallaActual === 'resultado' && ultimoResultado) pintarResultado();
  if (pantallaActual === 'error' && ultimoError) pintarError();
}

/* ---------- Navegación entre pantallas ---------- */
function mostrar(nombre) {
  pantallaActual = nombre;
  PANTALLAS.forEach((p) => { $('p-' + p).hidden = p !== nombre; });
  $('b-desvincular').hidden = !almacen.get('token') || nombre === 'vincular';
  if (nombre !== 'resultado') pararReloj();
  window.scrollTo(0, 0);
}

function cargando(clave) {
  $('cargando-texto').textContent = t(clave);
  mostrar('cargando');
}

function mostrarError(titulo, mensaje, reintentar) {
  ultimoError = { titulo, mensaje };
  reintentarFn = reintentar || null;
  pintarError();
  mostrar('error');
}

function pintarError() {
  const e = ultimoError;
  $('err-titulo').textContent = typeof e.titulo === 'function' ? e.titulo() : e.titulo;
  $('err-mensaje').textContent = typeof e.mensaje === 'function' ? e.mensaje() : e.mensaje;
  $('b-reintentar').hidden = !reintentarFn;
}

function textoError(e) {
  const c = (e && e.codigo) || 'ERROR_SERVIDOR';
  if (c === 'CODIGO_INCORRECTO' && e.datos && e.datos.restantes != null) return t('err_CODIGO_INCORRECTO_n', e.datos);
  const s = t('err_' + c, e.datos);
  return s === 'err_' + c ? t('err_ERROR_SERVIDOR') : s;
}

/* ---------- Llamada a la API (POST text/plain: sin preflight CORS) ---------- */
const MODO_PRUEBA = CONFIG.API_URL === 'PRUEBA';
let cargaModoPrueba = null;
function cargarModoPrueba() {
  if (!cargaModoPrueba) {
    cargaModoPrueba = new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = 'modo-prueba.js';
      s.onload = ok;
      s.onerror = () => { cargaModoPrueba = null; ko(new ErrorApp('CONFIG')); };
      document.head.appendChild(s);
    });
  }
  return cargaModoPrueba;
}

async function api(accion, datos) {
  if (MODO_PRUEBA) {
    await cargarModoPrueba();
    const r = await window.APIPrueba(accion, datos);
    if (!r.ok) throw new ErrorApp(r.codigo, r.datos);
    return r;
  }
  const ctrl = new AbortController();
  const limite = setTimeout(() => ctrl.abort(), 20000);
  let resp;
  try {
    resp = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ accion }, datos)),
      signal: ctrl.signal,
      cache: 'no-store',
    });
  } catch (e) {
    throw new ErrorApp('CONEXION');
  } finally {
    clearTimeout(limite);
  }
  let json;
  try { json = await resp.json(); } catch (e) { throw new ErrorApp('CONFIG'); }
  if (!json || !json.ok) throw new ErrorApp((json && json.codigo) || 'ERROR_SERVIDOR', json && json.datos);
  return json;
}

/* ---------- Ubicación: se calcula AQUÍ y solo se envía SI / NO / DESCONOCIDO ---------- */
async function obtenerUbicacion() {
  const centro = almacen.get('centro');
  if (!centro || centro.lat == null || !('geolocation' in navigator)) return 'DESCONOCIDO';
  let permiso = 'prompt';
  try { permiso = (await navigator.permissions.query({ name: 'geolocation' })).state; } catch (e) { /* Safari antiguo */ }
  if (permiso === 'denied') return 'DESCONOCIDO';
  const espera = permiso === 'granted' ? 7000 : 15000;
  return new Promise((resolver) => {
    let hecho = false;
    const fin = (v) => { if (!hecho) { hecho = true; resolver(v); } };
    setTimeout(() => fin('DESCONOCIDO'), espera + 500);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const precision = pos.coords.accuracy || 0;
        if (precision > 1000) return fin('DESCONOCIDO');
        const d = distanciaMetros(pos.coords.latitude, pos.coords.longitude, centro.lat, centro.lon);
        fin(d <= centro.radio + Math.min(precision, 100) ? 'SI' : 'NO');
      },
      () => fin('DESCONOCIDO'),
      { enableHighAccuracy: false, timeout: espera, maximumAge: 60000 }
    );
  });
}

function distanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/* ---------- Fichar ---------- */
async function fichar() {
  const token = almacen.get('token');
  if (!token) return mostrarVincular();
  cargando('ubicando');
  const ubicacion = await obtenerUbicacion();
  cargando('registrando');
  const alumno = almacen.get('alumno') || {};
  try {
    const r = await api('fichar', { token, puerta, ubicacion, fotoVer: alumno.fotoVer || '' });
    guardarAlumno(r.alumno);
    if (r.centro) almacen.set('centro', r.centro);
    fichar.reintentado = false;
    mostrarResultado(r);
  } catch (e) {
    if (e.codigo === 'TOKEN_INVALIDO') {
      almacen.del('token');
      return mostrarVincular(t('tokenInvalido'));
    }
    // Si el móvil aún no conocía las coordenadas del colegio, las guarda y lo intenta una vez más
    if ((e.codigo === 'UBICACION_NECESARIA' || e.codigo === 'FUERA_DEL_CENTRO') && e.datos && e.datos.centro) {
      const antes = JSON.stringify(almacen.get('centro'));
      almacen.set('centro', e.datos.centro);
      if (antes !== JSON.stringify(e.datos.centro) && !fichar.reintentado) { fichar.reintentado = true; return fichar(); }
    }
    fichar.reintentado = false;
    const TITULOS = { CONEXION: 'errConexionTitulo', UBICACION_NECESARIA: 'ubicacionTitulo', FUERA_DEL_CENTRO: 'fueraTitulo' };
    const reintentable = ['CONEXION', 'OCUPADO', 'ERROR_SERVIDOR', 'UBICACION_NECESARIA', 'FUERA_DEL_CENTRO'].indexOf(e.codigo) >= 0;
    mostrarError(() => t(TITULOS[e.codigo] || 'errTitulo'), () => textoError(e), reintentable ? fichar : null);
  }
}

function guardarAlumno(a) {
  if (!a) return;
  const previo = almacen.get('alumno') || {};
  const nuevo = Object.assign({}, previo, a);
  if (!('foto' in a)) nuevo.foto = previo.foto || '';
  almacen.set('alumno', nuevo);
}

/* ---------- Pantalla de resultado ---------- */
function mostrarResultado(r) {
  ultimoResultado = r;
  mostradoEn = Date.now();
  desfaseReloj = (r.ahoraMs || Date.now()) - Date.now();
  pintarResultado();
  mostrar('resultado');
  iniciarReloj();
}

function pintarResultado() {
  const r = ultimoResultado, p = r.params || {}, ok = r.resultado !== 'DENEGADO';
  const caducada = Date.now() - mostradoEn > CONFIG.SEGUNDOS_VALIDEZ_PANTALLA * 1000;
  const sec = $('p-resultado');
  sec.className = 'pantalla resultado ' + (caducada ? 'caducada' : ok ? 'ok' : 'no');

  let titulo, mensaje, chip = '';
  if (caducada) {
    titulo = t('caducadaTitulo');
    mensaje = t('caducadaMsg');
  } else if (r.tipo === 'ENTRADA' && !ok) {
    titulo = t('pronto_titulo');
    mensaje = t('pronto', p);
  } else if (r.tipo === 'ENTRADA') {
    titulo = t('bienvenida');
    mensaje = t('entradaRegistrada');
    if (r.tarde) chip = t('tarde', p);
  } else if (ok) {
    titulo = t('puedesSalir');
    if (r.codigo === 'PERMISO') {
      mensaje = t(p.hasta ? 'salida_PERMISO_hasta' : 'salida_PERMISO', p) + (p.motivo ? ' (' + p.motivo + ')' : '');
    } else {
      mensaje = t('salida_' + r.codigo, p);
    }
  } else {
    titulo = t('noPuedesSalir');
    mensaje = t('denegado_' + r.codigo, p);
  }

  $('res-icono').textContent = caducada ? '⏱' : ok ? '✓' : '✕';
  $('res-titulo').textContent = titulo;
  $('res-mensaje').textContent = mensaje;
  $('res-chip').textContent = chip;
  $('res-chip').hidden = !chip;

  const al = almacen.get('alumno') || r.alumno || {};
  const img = $('res-foto');
  if (al.foto && !caducada) {
    if (img.getAttribute('src') !== al.foto) img.src = al.foto;
    img.hidden = false;
  } else {
    img.hidden = true;
  }
  img.onerror = () => { img.hidden = true; };
  $('res-iniciales').textContent = ((al.nombre || '?').charAt(0) + (al.apellidos || '').charAt(0)).toUpperCase();
  $('res-nombre').textContent = ((al.nombre || '') + ' ' + (al.apellidos || '')).trim();
  $('res-curso').textContent = al.curso || '';
  const registrada = !(r.tipo === 'ENTRADA' && !ok);   // «aún es pronto» no se registra
  $('res-meta').textContent = [r.puerta && r.puerta.nombre, t(r.tipo), registrada ? t('registradoA', { hora: r.horaRegistro || '' }) : ''].filter(Boolean).join(' · ');
  $('res-repetido').textContent = t('yaRegistrado');
  $('res-repetido').hidden = !r.repetido || caducada;
}

function iniciarReloj() {
  pararReloj();
  tic();
  temporizador = setInterval(tic, 250);
}

function pararReloj() {
  if (temporizador) clearInterval(temporizador);
  temporizador = null;
}

function tic() {
  if (pantallaActual !== 'resultado' || !ultimoResultado) return;
  const ahora = new Date(Date.now() + desfaseReloj);
  const loc = t('locale');
  $('res-reloj').textContent = new Intl.DateTimeFormat(loc, { timeZone: CONFIG.ZONA_HORARIA, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(ahora);
  $('res-fecha').textContent = new Intl.DateTimeFormat(loc, { timeZone: CONFIG.ZONA_HORARIA, weekday: 'long', day: 'numeric', month: 'long' }).format(ahora);
  const total = CONFIG.SEGUNDOS_VALIDEZ_PANTALLA * 1000;
  const queda = Math.max(0, total - (Date.now() - mostradoEn));
  $('res-barra').style.width = (100 * queda / total) + '%';
  const caducada = queda === 0;
  if (caducada !== $('p-resultado').classList.contains('caducada')) pintarResultado();
}

/* ---------- Vincular el móvil ---------- */
function mostrarVincular(aviso) {
  $('vinc-aviso').textContent = aviso || '';
  $('vinc-aviso').hidden = !aviso;
  $('vinc-error').hidden = true;
  $('f-email').hidden = false;
  $('f-codigo').hidden = true;
  $('email').value = almacen.get('email') || '';
  mostrar('vincular');
}

function errorVincular(e) {
  $('vinc-error').textContent = textoError(e);
  $('vinc-error').hidden = false;
}

async function enviarEmail(ev) {
  ev.preventDefault();
  const email = $('email').value.trim().toLowerCase();
  $('vinc-error').hidden = true;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return errorVincular(new ErrorApp('EMAIL_INVALIDO'));
  const b = $('b-enviar');
  b.disabled = true; b.textContent = t('enviando');
  try {
    await api('solicitarCodigo', { email });
    emailPendiente = email;
    almacen.set('email', email);
    $('codigo-enviado').textContent = t('codigoEnviado', { email });
    $('f-email').hidden = true;
    $('f-codigo').hidden = false;
    $('vinc-aviso').hidden = true;
    $('codigo').value = '';
    $('codigo').focus();
  } catch (e) {
    errorVincular(e);
  } finally {
    b.disabled = false; b.textContent = t('enviarCodigo');
  }
}

async function enviarCodigo(ev) {
  if (ev) ev.preventDefault();
  const codigo = $('codigo').value.replace(/\D/g, '');
  $('vinc-error').hidden = true;
  if (codigo.length !== 6) return errorVincular(new ErrorApp('CODIGO_INCORRECTO'));
  const b = $('b-validar');
  if (b.disabled) return;
  b.disabled = true; b.textContent = t('comprobando');
  try {
    const r = await api('verificarCodigo', { email: emailPendiente || almacen.get('email'), codigo, userAgent: navigator.userAgent });
    almacen.set('token', r.token);
    guardarAlumno(r.alumno);
    if (r.centro) almacen.set('centro', r.centro);
    if (puerta) {
      fichar();
    } else {
      mostrarError(() => t('vincTitulo') + ' ✓', () => t('vinculadoSinPuerta'), null);
    }
  } catch (e) {
    errorVincular(e);
    if (['CODIGO_CADUCADO', 'CODIGO_BLOQUEADO', 'CODIGO_NO_SOLICITADO'].indexOf(e.codigo) >= 0) {
      $('f-codigo').hidden = true;
      $('f-email').hidden = false;
    }
  } finally {
    b.disabled = false; b.textContent = t('validar');
  }
}

async function desvincular() {
  if (!confirm(t('confirmarDesvincular'))) return;
  const token = almacen.get('token');
  almacen.del('token');
  almacen.del('alumno');
  ultimoResultado = null;
  if (token) api('desvincular', { token }).catch(() => {});
  mostrarVincular(t('desvinculado'));
}

/* ---------- Arranque ---------- */
function iniciar() {
  $('f-email').addEventListener('submit', enviarEmail);
  $('f-codigo').addEventListener('submit', enviarCodigo);
  $('codigo').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
    if (e.target.value.length === 6) enviarCodigo();
  });
  $('b-otro-email').addEventListener('click', () => { $('f-codigo').hidden = true; $('f-email').hidden = false; $('vinc-error').hidden = true; });
  $('b-desvincular').addEventListener('click', desvincular);
  $('b-reintentar').addEventListener('click', () => { if (reintentarFn) reintentarFn(); });
  document.querySelectorAll('[data-idioma]').forEach((b) => b.addEventListener('click', () => {
    idioma = b.dataset.idioma;
    almacen.set('idioma', idioma);
    aplicarIdioma();
  }));
  // Si el navegador "congela" la pestaña y la recupera, se recalcula la caducidad al momento.
  window.addEventListener('pageshow', () => tic());
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tic(); });

  aplicarIdioma();

  if (MODO_PRUEBA) cargarModoPrueba().catch(() => {});
  if (!MODO_PRUEBA && (!CONFIG.API_URL || CONFIG.API_URL.indexOf('https://') !== 0)) {
    return mostrarError(() => t('errTitulo'), () => t('err_CONFIG'), null);
  }
  if (!almacen.disponible) {
    return mostrarError(() => t('errTitulo'), () => t('err_SIN_ALMACEN'), null);
  }
  if (!almacen.get('token')) return mostrarVincular();
  if (!puerta) return mostrarError(() => t('sinPuertaTitulo'), () => t('sinPuertaMsg'), null);
  fichar();
}

iniciar();
