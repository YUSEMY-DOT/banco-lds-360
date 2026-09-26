/**
 * BANCO LDS 360 - Núcleo de Integración y Caché
 * IEP La Salle del Sur
 */

// URL oficial de tu Web App de Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxnYxKgOh3xPibLHQIsLoCM9JYDj48hnY9OQVT0499MzZbZ1G34XfpPfsT29ieVAhFK/exec";

/**
 * Consulta la información del estudiante priorizando la caché de localStorage para máxima velocidad.
 */
function consultarDatosEstudiante(codigo, callback) {
  const cacheKey = 'LDS_DATA_' + codigo;
  const cacheGuardada = localStorage.getItem(cacheKey);

  // 1. Mostrar de inmediato la caché si existe
  if (cacheGuardada) {
    try {
      const datosLocales = JSON.parse(cacheGuardada);
      callback(datosLocales);
    } catch (e) {
      console.error("Error al leer la caché local:", e);
    }
  }

  // 2. Traer información actualizada de Google Apps Script
  const url = `${SCRIPT_URL}?action=CONSULTAR_ALUMNO&codigo=${encodeURIComponent(codigo)}`;

  fetch(url)
    .then(response => response.json())
    .then(datosRed => {
      if (datosRed && datosRed.success) {
        localStorage.setItem(cacheKey, JSON.stringify(datosRed));
        callback(datosRed);
      }
    })
    .catch(error => {
      console.error("Error en la conexión con Apps Script:", error);
    });
}

/**
 * Procesa el inicio de sesión del alumno con un solo viaje de red.
 */
function ejecutarLoginSistema(codigo, hashClave, callback) {
  const url = `${SCRIPT_URL}?action=LOGINALUMNO&codigo=${encodeURIComponent(codigo)}&hash=${encodeURIComponent(hashClave)}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data && data.success) {
        localStorage.setItem('LDS_DATA_' + codigo, JSON.stringify(data));
      }
      callback(data);
    })
    .catch(err => {
      console.error("Error al autenticar:", err);
      callback({ success: false, message: "Error de red o conexión." });
    });
}

/**
 * Registra una transacción (Cobro/Pago) y actualiza el saldo al instante.
 */
function registrarTransaccionSistema(codigo, tipo, monto, concepto, callback) {
  const payload = {
    action: 'REGISTRAR_TRANSACCION',
    codigo: codigo,
    tipo: tipo,
    monto: monto,
    concepto: concepto || 'General'
  };

  fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(() => {
    // Como no-cors no retorna JSON directo, descontamos/sumamos localmente
    const cacheKey = 'LDS_DATA_' + codigo;
    const cache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
    let saldoActual = parseFloat(cache.saldo || 0);

    if (tipo === 'COBRAR') {
      saldoActual += parseFloat(monto);
    } else {
      saldoActual -= parseFloat(monto);
    }

    cache.saldo = saldoActual.toFixed(2);
    localStorage.setItem(cacheKey, JSON.stringify(cache));

    callback({ success: true, nuevoSaldo: cache.saldo });
  })
  .catch(err => {
    console.error("Error registrando transacción:", err);
    callback({ success: false });
  });
}
