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
    if (script && script.parentNode) document.body.removeChild(script);
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

function consultarDatosEstudiante(codigo, callback) {
  hacerPeticionJSONP({ accion: 'CONSULTAR', codigo: codigo }, callback);
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

function procesarLoginAlumno() {
  const codigoInput = document.getElementById('loginCodigo');
  const claveInput = document.getElementById('loginClave');
  const errorDiv = document.getElementById('loginError');
  
  if (!codigoInput || !claveInput) return;

  const codigo = codigoInput.value.trim().toUpperCase();
  const clave = claveInput.value.trim();
  
  if (errorDiv) errorDiv.textContent = "";

  if (!codigo || !clave) {
    if (errorDiv) errorDiv.textContent = "Por favor complete todos los campos.";
    return;
  }

  if (errorDiv) errorDiv.textContent = "Verificando acceso...";

  ejecutarLoginSistema(codigo, clave, function(res) {
    if (res && (res.success === true || res.ok === true)) {
      consultarDatosEstudiante(codigo, function(data) {
        const vistaLogin = document.getElementById('vistaLogin');
        const vistaPrincipal = document.getElementById('vistaPrincipal');
        
        if (vistaLogin) vistaLogin.classList.add('hidden');
        if (vistaPrincipal) vistaPrincipal.classList.remove('hidden');

        const est = (data && data.estudiante) ? data.estudiante : (res.estudiante || res.alumno || {});
        const cuenta = (data && (data.cuenta || data)) ? (data.cuenta || data) : (res.cuenta || res);
        
        const nombreCompleto = est.nombreCompleto || est.nombre || 'Estudiante';
        const primerNombre = nombreCompleto.split(' ')[0];

        const elNombre = document.getElementById('alumnoNombre');
        const elGrado = document.getElementById('alumnoGrado');
        const elSaldo = document.getElementById('saldoLDS');
        const laFoto = document.getElementById('alumnoFoto');

        if (elNombre) elNombre.textContent = nombreCompleto;
        if (elGrado) elGrado.textContent = (est.grado || '') + ' ' + (est.seccion || '');
        
        const saldoFinal = Number(cuenta.saldoActual || cuenta.saldo || data.saldoActual || data.saldo || res.saldoActual || res.saldo || 0);
        if (elSaldo) elSaldo.textContent = saldoFinal.toFixed(2);
        
        let fotoUrl = est.fotoUrl || est.foto || "";
        if (fotoUrl && laFoto) laFoto.src = fotoUrl;

        const movs = (data && data.movimientos) ? data.movimientos : (res.movimientos || res.historial || []);
        if (typeof renderizarMovimientos === 'function') {
          renderizarMovimientos(movs);
        }

        if (typeof reproducirSonidoExito === 'function') reproducirSonidoExito();

        setTimeout(() => {
          if (typeof hablarTextoVoz === 'function') {
            hablarTextoVoz(`Hola ${primerNombre}, bienvenida a la banca móvil de La Salle del Sur.`);
          }
        }, 300);
      });

    } else {
      const mensajeError = res.mensaje || res.message || "Código o clave incorrecta.";
      if (errorDiv) errorDiv.textContent = mensajeError;
    }
  });
}
