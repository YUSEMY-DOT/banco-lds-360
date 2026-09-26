/**
 * BANCO LDS 360 - Núcleo de Integración y Caché
 * IEP La Salle del Sur
 */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxnYxKgOh3xPibLHQIsLoCM9JYDj48hnY9OQVT0499MzZbZ1G34XfpPfsT29ieVAhFK/exec";

// Función JSONP para saltar el bloqueo CORS de Google de forma transparente
function hacerPeticionJSONP(parametros, callback) {
  const nombreCallback = 'jsonp_callback_' + Math.round(100000 * Math.random());
  
  window[nombreCallback] = function(data) {
    delete window[nombreCallback];
    document.body.removeChild(script);
    callback(data);
  };

  let url = SCRIPT_URL + '?callback=' + nombreCallback;
  for (let clave in parametros) {
    url += '&' + clave + '=' + encodeURIComponent(parametros[clave]);
  }

  const script = document.createElement('script');
  script.src = url;
  
  script.onerror = function() {
    callback({ success: false, message: "Error de red o conexión." });
  };

  document.body.appendChild(script);
}

function consultarDatosEstudiante(codigo, callback) {
  const cacheKey = 'LDS_DATA_' + codigo;
  const cacheGuardada = localStorage.getItem(cacheKey);

  if (cacheGuardada) {
    try { callback(JSON.parse(cacheGuardada)); } catch(e) {}
  }

  hacerPeticionJSONP({ action: 'CONSULTAR_ALUMNO', codigo: codigo }, function(datosRed) {
    if (datosRed && datosRed.success) {
      localStorage.setItem(cacheKey, JSON.stringify(datosRed));
      callback(datosRed);
    }
  });
}

function ejecutarLoginSistema(codigo, clave, callback) {
  // Envía el código y la clave directamente a Google Apps Script para su validación en el servidor
  hacerPeticionJSONP({ action: 'LOGINALUMNO', codigo: codigo, clave: clave }, function(data) {
    if (data && data.success) {
      localStorage.setItem('LDS_DATA_' + codigo, JSON.stringify(data));
    }
    callback(data);
  });
}

function registrarTransaccionSistema(codigo, tipo, monto, concepto, callback) {
  hacerPeticionJSONP({ 
    action: 'REGISTRAR_TRANSACCION', 
    codigo: codigo, 
    tipo: tipo, 
    monto: monto, 
    concepto: concepto || 'General' 
  }, function(res) {
    if (res && res.success) {
      const cacheKey = 'LDS_DATA_' + codigo;
      const cache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
      cache.saldo = res.nuevoSaldo;
      localStorage.setItem(cacheKey, JSON.stringify(cache));
    }
    callback(res || { success: false });
  });
}
