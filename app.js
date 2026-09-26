/**
 * BANCO LDS 360 - Núcleo con Seguridad de Tiempo (Anti-congelamiento)
 * IEP La Salle del Sur
 */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxnYxKgOh3xPibLHQIsLoCM9JYDj48hnY9OQVT0499MzZbZ1G34XfpPfsT29ieVAhFK/exec";

function hacerPeticionJSONP(parametros, callback) {
  const nombreCallback = 'jsonp_callback_' + Math.round(100000 * Math.random());
  let respuestaEnviada = false;

  // SEGURIDAD: Si Google tarda más de 8 segundos, desbloquea la pantalla automáticamente
  const timeoutSeguridad = setTimeout(() => {
    if (!respuestaEnviada) {
      respuestaEnviada = true;
      delete window[nombreCallback];
      if (script && script.parentNode) document.body.removeChild(script);
      callback({ success: false, message: "El servidor de Google tardó demasiado. Intenta otra vez." });
    }
  }, 8000);

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
    url += '&' + clave + '=' + encodeURIComponent(parametros[clave]);
  }

  const script = document.createElement('script');
  script.src = url;
  
  script.onerror = function() {
    if (respuestaEnviada) return;
    respuestaEnviada = true;
    clearTimeout(timeoutSeguridad);
    delete window[nombreCallback];
    if (script && script.parentNode) document.body.removeChild(script);
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
    if (datosRed && (datosRed.success || datosRed.ok)) {
      localStorage.setItem(cacheKey, JSON.stringify(datosRed));
      callback(datosRed);
    }
  });
}

function ejecutarLoginSistema(codigo, clave, callback) {
  const cacheKey = 'LDS_SESION_INSTANTANEA_' + codigo;
  const sesionCache = localStorage.getItem(cacheKey);

  if (sesionCache) {
    try {
      const datos = JSON.parse(sesionCache);
      callback(datos);
      
      hacerPeticionJSONP({ action: 'LOGINALUMNO', codigo: codigo, clave: clave }, function(resBackground) {
        if (resBackground && (resBackground.success || resBackground.ok)) {
          localStorage.setItem(cacheKey, JSON.stringify(resBackground));
        }
      });
      return;
    } catch(e) {}
  }

  hacerPeticionJSONP({ action: 'LOGINALUMNO', codigo: codigo, clave: clave }, function(data) {
    if (data && (data.success || data.ok)) {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    }
    callback(data);
  });
}

function registrarTransaccionSistema(codigo, tipo, monto, concepto, responsable, observacion, callback) {
  hacerPeticionJSONP({ 
    action: 'REGISTRAR_TRANSACCION', 
    codigo: codigo, 
    tipo: tipo, 
    monto: monto, 
    concepto: concepto || 'General',
    responsable: responsable || '',
    observacion: observacion || ''
  }, function(res) {
    if (res && (res.success || res.ok)) {
      localStorage.removeItem('LDS_SESION_INSTANTANEA_' + codigo);
    }
    callback(res || { success: false });
  });
}
