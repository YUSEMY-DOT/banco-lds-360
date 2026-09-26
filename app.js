/**
 * BANCO LDS 360 - Núcleo de Integración Optimizado (Velocidad Instantánea)
 * IEP La Salle del Sur
 */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxnYxKgOh3xPibLHQIsLoCM9JYDj48hnY9OQVT0499MzZbZ1G34XfpPfsT29ieVAhFK/exec";

function hacerPeticionJSONP(parametros, callback) {
  const nombreCallback = 'jsonp_callback_' + Math.round(100000 * Math.random());
  
  window[nombreCallback] = function(data) {
    delete window[nombreCallback];
    if (script && script.parentNode) {
      document.body.removeChild(script);
    }
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

  // Si hay datos guardados, se muestran al instante para cero esperas
  if (cacheGuardada) {
    try { callback(JSON.parse(cacheGuardada)); } catch(e) {}
  }

  hacerPeticionJSONP({ action: 'CONSULTAR_ALUMNO', codigo: codigo }, function(datosRed) {
    if (datosRed && (datosRed.success || datosRed.ok)) {
      localStorage.setItem(cacheKey, JSON.stringify(datosRed));
      callback(datosRed);
    }
  });
}

function ejecutarLoginSistema(codigo, clave, callback) {
  const cacheKey = 'LDS_LOGIN_' + codigo;
  const cacheGuardada = localStorage.getItem(cacheKey);

  // Respuesta flash usando caché local si ya ingresó antes
  if (cacheGuardada) {
    try { 
      const datosPrevios = JSON.parse(cacheGuardada);
      callback(datosPrevios); 
    } catch(e) {}
  }

  hacerPeticionJSONP({ action: 'LOGINALUMNO', codigo: codigo, clave: clave }, function(data) {
    if (data && (data.success || data.ok)) {
      localStorage.setItem(cacheKey, JSON.stringify(data));
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
    if (res && (res.success || res.ok)) {
      localStorage.removeItem('LDS_LOGIN_' + codigo); // Limpia caché para forzar actualización de saldo fresco
    }
    callback(res || { success: false });
  });
}
