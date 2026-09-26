/**
 * BANCO LDS 360 - NÚCLEO DE CONEXIÓN UNIFICADO
 * IEP La Salle del Sur
 */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLINzmjri8dTZx4T-ZIe2TwthpuX7bjbKPCeZhCEa9WQGMjxmgK9QpJKb7cDGJ_8fovg/exec";

let codigoEstudianteTemporal = "";
let missActual = "";

// PETICIÓN BASE JSONP
function hacerPeticionJSONP(parametros, callback) {
  const nombreCallback = 'jsonp_callback_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
  let respuestaEnviada = false;

  const timeoutSeguridad = setTimeout(() => {
    if (!respuestaEnviada) {
      respuestaEnviada = true;
      delete window[nombreCallback];
      if (script && script.parentNode) document.body.removeChild(script);
      callback({ success: false, ok: false, mensaje: "El servidor tardó demasiado. Intenta nuevamente." });
    }
  }, 12000);

  window[nombreCallback] = function(data) {
    if (respuestaEnviada) return;
    respuestaEnviada = true;
    clearTimeout(timeoutSeguridad);
    delete window[nombreCallback];
    if (script && script.parentNode) {
      document.body.removeChild(script);
    }
    callback(data);
  };

  let url = SCRIPT_URL + '?callback=' + nombreCallback;
  for (let clave in parametros) {
    if (parametros[clave] !== undefined && parametros[clave] !== null) {
      url += '&' + encodeURIComponent(clave) + '=' + encodeURIComponent(parametros[clave]);
    }
  }

  const script = document.createElement('script');
  script.src = url;

  script.onerror = function() {
    if (respuestaEnviada) return;
    respuestaEnviada = true;
    clearTimeout(timeoutSeguridad);
    delete window[nombreCallback];
    if (script && script.parentNode) document.body.removeChild(script);
    callback({ success: false, ok: false, mensaje: "Error de conexión con el servidor." });
  };

  document.body.appendChild(script);
}

// FUNCIONES DE AUDIO Y VOZ
function reproducirPitidoScanner() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 1200;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch(e) {}
}

function reproducirSonidoExito() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notas = [523.25, 659.25, 783.99, 1046.50];
    notas.forEach((frec, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = frec;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
    });
  } catch(e) {}
}

function hablarTextoVoz(texto) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const textoLimpio = texto.replace(/\./g, ',').replace(/\?/g, '').replace(/!/g, '');
    const utterance = new SpeechSynthesisUtterance(textoLimpio);
    utterance.rate = 1.05;
    utterance.pitch = 1.25;

    const voces = window.speechSynthesis.getVoices();
    let vozIdeal = voces.find(v => v.lang.startsWith('es'));
    if (vozIdeal) utterance.voice = vozIdeal;

    setTimeout(() => { window.speechSynthesis.speak(utterance); }, 100);
  }
}

// CONEXIONES CON APPS SCRIPT
function consultarDatosEstudiante(codigo, callback) {
  hacerPeticionJSONP({ accion: 'CONSULTAR_ALUMNO', codigo: codigo }, callback);
}

function ejecutarLoginSistema(codigo, clave, callback) {
  hacerPeticionJSONP({ accion: 'LOGINALUMNO', codigo: codigo, clave: clave }, callback);
}

function registrarTransaccionSistema(codigo, tipo, monto, concepto, responsable, observacion, callback) {
  hacerPeticionJSONP({
    accion: 'REGISTRAR_TRANSACCION',
    codigo: codigo,
    tipo: tipo,
    monto: monto,
    concepto: concepto || 'General',
    responsable: responsable || 'MISS EN TURNO',
    observacion: observacion || ''
  }, callback);
}

// VALIDACIÓN DE CLAVE ADMINISTRATIVA (360LDS)
function validarAdmin() {
  const input = document.getElementById('adminPin');
  const error = document.getElementById('adminError');
  const pin = (input ? input.value : '').trim();

  if (!pin) {
    if (error) error.textContent = 'Ingresa la clave de administrador.';
    hablarTextoVoz("Ingresa la clave de administrador.");
    return;
  }

  if (pin.toUpperCase() !== '360LDS') {
    if (error) error.textContent = 'Clave de administrador incorrecta.';
    hablarTextoVoz("Clave de administrador incorrecta.");
    return;
  }

  if (error) error.textContent = '';
  reproducirSonidoExito();
  hablarTextoVoz("Acceso concedido al panel administrativo.");
  window.location.href = 'administrador.html';
}
