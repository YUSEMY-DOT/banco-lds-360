/**
 * BANCO LDS 360 - Núcleo de Conexión Unificado
 * IEP La Salle del Sur
 */

// URL principal desplegada de tu Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLINzmjri8dTZx4T-ZIe2TwthpuX7bjbKPCeZhCEa9WQGMjxmgK9QpJKb7cDGJ_8fovg/exec";

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

// Consultar datos de estudiante por código o QR
function consultarDatosEstudiante(codigo, callback) {
  hacerPeticionJSONP({ accion: 'CONSULTAR_ALUMNO', codigo: codigo }, callback);
}

// Iniciar sesión del estudiante con PIN de 6 dígitos
function ejecutarLoginSistema(codigo, clave, callback) {
  hacerPeticionJSONP({ accion: 'LOGINALUMNO', codigo: codigo, clave: clave }, callback);
}

// Registrar abonos o gastos de un estudiante
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
