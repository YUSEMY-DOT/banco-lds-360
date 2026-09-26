/**
 * BANCO LDS 360 - Núcleo de Conexión y Seguridad
 * IEP La Salle del Sur
 */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxnYxKgOh3xPibLHQIsLoCM9JYDj48hnY9OQVT0499MzZbZ1G34XfpPfsT29ieVAhFK/exec";

function hacerPeticionJSONP(parametros, callback) {
  const nombreCallback = 'jsonp_callback_' + Math.round(100000 * Math.random());
  let respuestaEnviada = false;

  const timeoutSeguridad = setTimeout(() => {
    if (!respuestaEnviada) {
      respuestaEnviada = true;
      delete window[nombreCallback];
      if (script && script.parentNode) document.body.removeChild(script);
      callback({ success: false, message: "El servidor tardó demasiado. Intenta otra vez." });
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
  hacerPeticionJSONP({ action: 'CONSULTAR_ALUMNO', codigo: codigo }, function(datosRed) {
    callback(datosRed);
  });
}

function ejecutarLoginSistema(codigo, clave, callback) {
  // Petición directa al servidor de Google Sheets para validar código y clave de forma estricta
  hacerPeticionJSONP({ action: 'LOGINALUMNO', codigo: codigo, clave: clave }, function(data) {
    if (data && (data.success === true || data.ok === true)) {
      // Verificación adicional de seguridad por si el servidor devuelve éxito pero la clave no coincide
      const est = data.estudiante || data;
      const claveReal = String(est.clave || est.password || est.pin || "").trim();
      
      if (claveReal && claveReal !== "" && claveReal !== String(clave).trim()) {
        callback({ success: false, message: "Clave de acceso incorrecta." });
        return;
      }
      
      localStorage.setItem('LDS_SESION_' + codigo, JSON.stringify(data));
      callback(data);
    } else {
      callback(data || { success: false, message: "Credenciales incorrectas o código no registrado." });
    }
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
    callback(res || { success: false });
  });
}
