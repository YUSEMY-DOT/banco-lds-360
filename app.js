/**
 * BANCO LDS 360 - Lógica Integrada Unificada
 * IEP La Salle del Sur
 */

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

// CATALOGOS DE OPCIONES
let catalogoGlobal = {
  "AHORROS_E_INVERSIONES": [
    "Depósito a cuenta de ahorros (Ahorro voluntario)", 
    "Inversión en fondo común del aula", 
    "Retiro de ahorros (Emergencia o meta cumplida)"
  ],
  "PAGOS_Y_GASTOS": [
    "Pago Compra en la tienda escolar / cafetín", 
    "Pago de alquiler / mantenimiento de carpeta", 
    "Pago de servicios del aula: Agua", 
    "Pago de servicios del aula: Energía", 
    "Compra de material escolar de emergencia", 
    "Gasto médico imprevisto menor", 
    "Alquiler de libros de la biblioteca", 
    "Pago por custodia de equipos tecnológicos", 
    "Pago por copias extras", 
    "Comprar stickers", 
    "Pagar para una actividad extra", 
    "Pagar por jugar 10 minutos más"
  ],
  "SANCIONES_Y_MULTAS": [
    "Multa por llevar mal el uniforme o incompleto", 
    "Incumplimiento de tareas o asignaciones a tiempo", 
    "Llegada tarde al aula o formación", 
    "Uso no autorizado de dispositivos electrónicos", 
    "Desorden o indisciplina leve", 
    "Falta de respeto o modales", 
    "No traer el material escolar requerido", 
    "Descuido o daño leve al mobiliario", 
    "Basura fuera de su lugar / No respetar áreas verdes", 
    "Inasistencia injustificada a reuniones", 
    "No ponerse al día en sus pendientes", 
    "Malograr los cuadernos u objetos personales", 
    "Faltar a la verdad", 
    "Llevarse objetos del compañero"
  ],
  "COSTOS_Y_OTROS": [
    "Impuesto escolar mensual por uso de instalaciones", 
    "Cuota extraordinaria de mantenimiento grupal", 
    "Transacción personalizada / Ajuste de caja"
  ]
};

let catalogoAbonosAdmin = {
  "INGRESOS_Y_SUELDOS": [
    "Ingreso Sueldo Base Mensual", 
    "Ingreso Sueldo por Rol de Liderazgo", 
    "Ingreso Bono por desempeño"
  ],
  "PREMIOS_Y_BONIFICACIONES": [
    "Bono por llevar el uniforme impecable y reglamentario", 
    "Bono Participación destacada en clase", 
    "Bono Premio por primer lugar en concurso académico o deportivo", 
    "Bono Puntualidad y asistencia perfecta", 
    "Bono Apoyo destacado en limpieza", 
    "Bono por ayuda solidaria", 
    "Bono Creatividad e innovación", 
    "Bono Representar dignamente al colegio", 
    "Bono Leer un libro y presentar evidencia", 
    "Bono Completar un reto educativo"
  ]
};

let missActual = "";

// FUNCIONES DE AUDIO Y VOZ
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

// ACCIONES ESTUDIANTE
function procesarLoginAlumno() {
  const codigo = document.getElementById('loginCodigo').value.trim().toUpperCase();
  const clave = document.getElementById('loginClave').value.trim();
  const errorDiv = document.getElementById('loginError');
  errorDiv.textContent = "";

  if (!codigo || !clave) {
    errorDiv.textContent = "Por favor complete todos los campos.";
    hablarTextoVoz("Por favor complete todos los campos.");
    return;
  }

  errorDiv.textContent = "Verificando acceso...";
  ejecutarLoginSistema(codigo, clave, function(res) {
    if (res && (res.success === true || res.ok === true) && res.estudiante) {
      document.getElementById('estudianteLogin').classList.add('hidden');
      document.getElementById('estudianteDashboard').classList.remove('hidden');

      const est = res.estudiante;
      const cuenta = res.cuenta || res;
      const nombreCompleto = est.nombreCompleto || est.nombre || 'Estudiante';
      const primerNombre = nombreCompleto.split(' ')[0];

      document.getElementById('alumnoNombre').textContent = nombreCompleto;
      document.getElementById('alumnoGrado').textContent = (est.grado || '') + ' ' + (est.seccion || '');
      document.getElementById('saldoLDS').textContent = Number(cuenta.saldoActual || cuenta.saldo || 0).toFixed(2);
      
      let fotoUrl = est.fotoUrl || est.foto || "";
      if (fotoUrl) document.getElementById('alumnoFoto').src = fotoUrl;

      renderizarMovimientos(res.movimientos || []);
      reproducirSonidoExito();

      setTimeout(() => {
        hablarTextoVoz(`Hola ${primerNombre}, bienvenida a tu banca móvil.`);
      }, 300);

    } else {
      const mensajeError = res.mensaje || res.message || "Código o clave incorrecta.";
      errorDiv.textContent = mensajeError;
      hablarTextoVoz("Acceso denegado. Código o clave incorrecta.");
    }
  });
}

function accionBotonPagar() {
  document.getElementById('seccionOperacion').classList.remove('hidden');
  document.getElementById('seccionMovimientos').classList.add('hidden');
  document.getElementById('tituloOperacion').textContent = "💸 Registrar Pago, Gasto o Multa";
  
  const selectCat = document.getElementById('selectCategoria');
  selectCat.innerHTML = '<option value="">Seleccione categoría</option>';

  ["AHORROS_E_INVERSIONES", "PAGOS_Y_GASTOS", "SANCIONES_Y_MULTAS", "COSTOS_Y_OTROS"].forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat.replace(/_/g, " ");
    selectCat.appendChild(opt);
  });

  document.getElementById('selectConcepto').innerHTML = '<option value="">Seleccione concepto</option>';
  document.getElementById('inputMonto').value = '';
  document.getElementById('selectResponsable').value = '';
  document.getElementById('inputObservacion').value = '';
  document.getElementById('mensajeOperacion').textContent = '';

  hablarTextoVoz("Selecciona la categoría y el concepto de tu pago.");
}

function alCambiarCategoria() {
  const cat = document.getElementById('selectCategoria').value;
  const selectCon = document.getElementById('selectConcepto');
  selectCon.innerHTML = '<option value="">Seleccione concepto</option>';

  if (!cat || !catalogoGlobal[cat]) return;

  catalogoGlobal[cat].forEach(con => {
    const opt = document.createElement('option');
    opt.value = con;
    opt.textContent = con;
    selectCon.appendChild(opt);
  });
}

function accionBotonMovimientos() {
  document.getElementById('seccionOperacion').classList.add('hidden');
  document.getElementById('seccionMovimientos').classList.remove('hidden');
  hablarTextoVoz("Aquí están tus movimientos recientes.");
}

function registrarMovimientoOperacion() {
  const codigo = document.getElementById('loginCodigo').value.trim().toUpperCase();
  const cat = document.getElementById('selectCategoria').value;
  const con = document.getElementById('selectConcepto').value;
  const monto = document.getElementById('inputMonto').value.trim();
  const resp = document.getElementById('selectResponsable').value;
  const obs = document.getElementById('inputObservacion').value.trim();
  const msg = document.getElementById('mensajeOperacion');

  if (!cat || !con || !monto || !resp) {
    msg.className = "text-xs text-red-600 font-bold";
    msg.textContent = "Complete categoría, concepto, monto y responsable.";
    hablarTextoVoz("Por favor completa todos los campos.");
    return;
  }

  msg.className = "text-xs text-blue-600 font-bold";
  msg.textContent = "Registrando pago...";

  registrarTransaccionSistema(codigo, 'EGRESO', monto, con, resp, obs, function(res) {
    if (res && (res.success || res.ok)) {
      msg.className = "text-xs text-emerald-600 font-extrabold";
      msg.textContent = "¡Pago registrado con éxito!";

      reproducirSonidoExito();
      hablarTextoVoz("Pago registrado con éxito.");
      
      if(res.nuevoSaldo !== undefined) {
        document.getElementById('saldoLDS').textContent = Number(res.nuevoSaldo).toFixed(2);
      }
      if(res.movimientos) {
        renderizarMovimientos(res.movimientos);
      }

      setTimeout(() => {
        document.getElementById('seccionOperacion').classList.add('hidden');
        document.getElementById('seccionMovimientos').classList.remove('hidden');
        msg.textContent = '';
      }, 2500);

    } else {
      msg.className = "text-xs text-red-600 font-bold";
      msg.textContent = res.mensaje || res.message || "Error al registrar la transacción.";
    }
  });
}

function renderizarMovimientos(movs) {
  const contenedor = document.getElementById('listaMovimientos');
  contenedor.innerHTML = '';

  if (!movs || movs.length === 0) {
    contenedor.innerHTML = '<p class="text-gray-400 text-center italic py-2">Sin movimientos recientes.</p>';
    return;
  }

  movs.forEach(m => {
    const tipo = String(m.tipo || "").toUpperCase();
    const monto = Number(m.monto || 0);
    const positivo = tipo.includes('INGRESO') || monto >= 0;

    const item = document.createElement('div');
    item.className = "flex justify-between items-center p-2 rounded-lg bg-gray-50 border-l-4 " + 
      (positivo ? 'border-emerald-500' : 'border-rose-500');
    item.innerHTML = `
      <div>
        <p class="font-bold text-xs text-gray-800">${m.concepto || 'Movimiento'}</p>
        <p class="text-[10px] text-gray-400">${m.fecha || m.fechaTexto || ''}</p>
      </div>
      <span class="font-extrabold ${positivo ? 'text-emerald-600' : 'text-rose-600'}">
        ${positivo ? '+' : '-'}${Math.abs(monto).toFixed(2)} LDS
      </span>
    `;
    contenedor.appendChild(item);
  });
}

function cerrarSesionAlumno() {
  document.getElementById('estudianteDashboard').classList.add('hidden');
  document.getElementById('estudianteLogin').classList.remove('hidden');
  document.getElementById('loginCodigo').value = '';
  document.getElementById('loginClave').value = '';
  document.getElementById('loginError').textContent = '';
}

// ACCIONES DOCENTES / MISES
function procesarLoginAdmin() {
  const docente = document.getElementById('loginDocente').value;
  const clave = document.getElementById('loginClaveDocente').value.trim();
  const errorDiv = document.getElementById('errorAdminLogin');
  errorDiv.textContent = "";

  if (!docente || !clave) {
    errorDiv.textContent = "Seleccione su nombre y escriba su clave.";
    hablarTextoVoz("Por favor seleccione su nombre y escriba su clave.");
    return;
  }

  if (clave.toUpperCase() !== "360LDS") {
    errorDiv.textContent = "Clave de acceso incorrecta.";
    hablarTextoVoz("Clave de acceso incorrecta.");
    return;
  }

  missActual = docente;
  document.getElementById('docenteLogin').classList.add('hidden');
  document.getElementById('docenteDashboard').classList.remove('hidden');
  document.getElementById('nombreMissActiva').textContent = missActual;
  document.getElementById('inputResponsableAuto').value = missActual;

  hablarTextoVoz(`Bienvenida ${missActual} al panel de administración.`);
}

function cerrarSesionAdmin() {
  missActual = "";
  document.getElementById('docenteDashboard').classList.add('hidden');
  document.getElementById('docenteLogin').classList.remove('hidden');
  document.getElementById('loginDocente').value = "";
  document.getElementById('loginClaveDocente').value = "";
  document.getElementById('fichaAlumno').classList.add('hidden');
  hablarTextoVoz("Turno cerrado correctamente.");
}

function cargarConceptosAbonoAdmin() {
  const catSelect = document.getElementById('selectCategoriaAbono');
  const cat = catSelect.value;
  const selectCon = document.getElementById('selectConceptoAbono');
  selectCon.innerHTML = '<option value="">Seleccione concepto</option>';

  if (!cat || !catalogoAbonosAdmin[cat]) return;

  catalogoAbonosAdmin[cat].forEach(con => {
    const opt = document.createElement('option');
    opt.value = con;
    opt.textContent = con;
    selectCon.appendChild(opt);
  });
}

function ejecutarAbonoAdministrativo() {
  const codigo = document.getElementById('codigoEstudiante').value.trim().toUpperCase();
  const cat = document.getElementById('selectCategoriaAbono').value;
  const con = document.getElementById('selectConceptoAbono').value;
  const monto = document.getElementById('inputMontoAbono').value.trim();
  const obs = document.getElementById('inputObservacionAbono').value.trim();
  const msg = document.getElementById('mensajeAbonoAdmin');

  if (!codigo) {
    alert("Primero busque o escanee a un estudiante.");
    return;
  }

  if (!cat || !con || !monto) {
    msg.className = "text-xs text-red-600 font-bold";
    msg.textContent = "Complete categoría, concepto y monto.";
    return;
  }

  msg.className = "text-xs text-blue-600 font-bold";
  msg.textContent = "Procesando abono...";

  registrarTransaccionSistema(codigo, 'INGRESO', monto, con, missActual, obs, function(res) {
    if (res && (res.success || res.ok)) {
      msg.className = "text-xs text-emerald-600 font-extrabold";
      msg.textContent = "¡Abono registrado con éxito!";
      
      const nuevoSaldo = res.nuevoSaldo || res.saldoActual;
      if (nuevoSaldo !== undefined) {
        document.getElementById('saldoAlumno').textContent = Number(nuevoSaldo).toFixed(2);
      }

      hablarTextoVoz(`Abono de ${monto} LDS registrado con éxito.`);

      if (res.movimientos) {
        renderizarMovimientosAdmin(res.movimientos);
      } else {
        buscarEstudiante(true);
      }

      setTimeout(() => {
        document.getElementById('selectCategoriaAbono').value = "";
        document.getElementById('selectConceptoAbono').innerHTML = '<option value="">Seleccione concepto</option>';
        document.getElementById('inputMontoAbono').value = "";
        document.getElementById('inputObservacionAbono').value = "";
        msg.textContent = "";
      }, 3000);
    } else {
      msg.className = "text-xs text-red-600 font-bold";
      msg.textContent = res.mensaje || res.message || "Error al procesar el abono.";
    }
  });
}

let html5QrCode = null;
let escanerActivo = false;

function toggleEscaner() {
  const readerDiv = document.getElementById('reader');
  if (escanerActivo) {
    detenerEscaner();
  } else {
    readerDiv.classList.remove('hidden');
    if (!html5QrCode) html5QrCode = new Html5Qrcode("reader");
    
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length > 0) {
        html5QrCode.start(
          devices[0].id, 
          { fps: 10, qrbox: { width: 220, height: 220 } },
          onScanSuccess,
          onScanError
        ).then(() => { escanerActivo = true; });
      }
    });
  }
}

function onScanSuccess(decodedText) {
  document.getElementById('codigoEstudiante').value = decodedText;
  detenerEscaner();
  buscarEstudiante();
}

function onScanError(error) {}

function detenerEscaner() {
  if (html5QrCode && escanerActivo) {
    html5QrCode.stop().then(() => {
      document.getElementById('reader').classList.add('hidden');
      escanerActivo = false;
    });
  }
}

function buscarEstudiante(silencioso = false) {
  const codigo = document.getElementById('codigoEstudiante').value.trim();
  if (!codigo) return;

  consultarDatosEstudiante(codigo, function(data) {
    actualizarVistaAdmin(data, silencioso);
  });
}

function actualizarVistaAdmin(data, silencioso = false) {
  if (!data || !(data.success || data.ok)) {
    alert("No se encontraron datos para el estudiante.");
    return;
  }

  document.getElementById('fichaAlumno').classList.remove('hidden');

  const nombre = data.nombreCompleto || data.nombre || 'Estudiante';
  const grado = (data.grado || '') + ' ' + (data.seccion || '');
  const saldo = Number(data.saldoActual || data.saldo || 0).toFixed(2);

  document.getElementById('nombreAlumno').textContent = nombre;
  document.getElementById('gradoAlumno').textContent = grado;
  document.getElementById('saldoAlumno').textContent = saldo;

  if (data.fotoUrl) document.getElementById('fotoAlumno').src = data.fotoUrl;

  renderizarMovimientosAdmin(data.movimientos || []);

  if (!silencioso) {
    hablarTextoVoz(`Estudiante ${nombre}. Saldo: ${saldo} LDS.`);
  }
}

function renderizarMovimientosAdmin(movs) {
  const contenedor = document.getElementById('listaMovimientosAdmin');
  contenedor.innerHTML = '';

  if (!movs || movs.length === 0) {
    contenedor.innerHTML = '<p class="text-gray-400 text-center italic py-2">Sin movimientos recientes.</p>';
    return;
  }

  movs.forEach(m => {
    const tipo = String(m.tipo || "").toUpperCase();
    const monto = Number(m.monto || 0);
    const positivo = tipo.includes('INGRESO') || monto >= 0;

    const item = document.createElement('div');
    item.className = "flex justify-between items-center p-2 rounded-lg bg-gray-50 border-l-4 " + 
      (positivo ? 'border-emerald-500' : 'border-rose-500');
    item.innerHTML = `
      <div>
        <p class="font-bold text-xs text-gray-800">${m.concepto || 'Movimiento'}</p>
        <p class="text-[10px] text-gray-400">${m.fecha || m.fechaTexto || ''}</p>
      </div>
      <span class="font-extrabold ${positivo ? 'text-emerald-600' : 'text-rose-600'}">
        ${positivo ? '+' : '-'}${Math.abs(monto).toFixed(2)} LDS
      </span>
    `;
    contenedor.appendChild(item);
  });
}
