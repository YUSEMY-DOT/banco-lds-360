// ============================================================
// BANCO LDS 360 - CONEXIÓN CON GOOGLE APPS SCRIPT
// IEP LA SALLE DEL SUR
// ============================================================

const BANCO_LDS_API_URL =
  "https://script.google.com/macros/s/AKfycbyybdIHgP7-e7wklexc5koIw1atMWxIIFrrzZGHYB4g2Vr8Q3zakdL4Zhs8FRrWNADu/exec";

let estudianteActual = null;

// ============================================================
// CONEXIÓN CON APPS SCRIPT
// ============================================================

async function consultarEstudiante(codigo) {
  codigo = String(codigo || "").trim().toUpperCase();

  if (!codigo) {
    mostrarMensaje("Ingresa un código de estudiante.");
    return null;
  }

  try {
    mostrarMensaje("Consultando Banco LDS 360...");

    const url =
      BANCO_LDS_API_URL +
      "?codigo=" +
      encodeURIComponent(codigo);

    const respuesta = await fetch(url, {
      method: "GET",
      cache: "no-store"
    });

    if (!respuesta.ok) {
      throw new Error("No se pudo conectar con Apps Script.");
    }

    const datos = await respuesta.json();

    if (!datos.ok) {
      throw new Error(datos.mensaje || "Error en Banco LDS 360.");
    }

    if (!datos.encontrado) {
      mostrarMensaje("No se encontró el estudiante: " + codigo);
      return null;
    }

    estudianteActual = datos;

    mostrarEstudiante(datos);

    return datos;

  } catch (error) {
    console.error("Error Banco LDS 360:", error);

    mostrarMensaje(
      "No se pudo conectar con Banco LDS 360. Revisa la conexión."
    );

    return null;
  }
}

// ============================================================
// MOSTRAR ESTUDIANTE
// ============================================================

function mostrarEstudiante(datos) {

  const estudiante = datos.estudiante || {};
  const cuenta = datos.cuenta || {};
  const movimientos = datos.movimientos || [];

  const codigo = estudiante.codigo || "";
  const nombre = estudiante.nombreCompleto || "";
  const grado = estudiante.grado || "";
  const seccion = estudiante.seccion || "";
  const docente = estudiante.docente || "";
  const foto =
    estudiante.fotoUrl ||
    estudiante.foto ||
    "";

  const ingresos = Number(cuenta.totalIngresos || 0);
  const egresos = Number(cuenta.totalEgresos || 0);
  const saldo = Number(cuenta.saldoActual || 0);

  const contenedor =
    document.getElementById("profileContent");

  if (!contenedor) {
    console.warn("No existe #profileContent en index.html");
    return;
  }

  contenedor.innerHTML = `
    <div class="lds-student-card">

      <div class="lds-student-photo">
        ${
          foto
            ? `<img src="${escaparHTML(foto)}"
                    alt="Foto del estudiante"
                    onerror="this.style.display='none';">`
            : `<div class="lds-photo-placeholder">👤</div>`
        }
      </div>

      <div class="lds-student-info">

        <h2>${escaparHTML(nombre)}</h2>

        <p>
          <strong>Código:</strong>
          ${escaparHTML(codigo)}
        </p>

        <p>
          <strong>Grado:</strong>
          ${escaparHTML(grado)}
        </p>

        <p>
          <strong>Sección:</strong>
          ${escaparHTML(seccion)}
        </p>

        <p>
          <strong>Docente:</strong>
          ${escaparHTML(docente)}
        </p>

      </div>

      <div class="lds-account">

        <h3>💰 CUENTA LDS</h3>

        <div class="lds-account-row">
          <span>Ingresos</span>
          <strong>${formatearLDS(ingresos)} LDS</strong>
        </div>

        <div class="lds-account-row">
          <span>Egresos</span>
          <strong>${formatearLDS(egresos)} LDS</strong>
        </div>

        <div class="lds-account-balance">
          <span>Saldo actual</span>
          <strong>${formatearLDS(saldo)} LDS</strong>
        </div>

      </div>

      <div class="lds-actions">

        <button
          type="button"
          onclick="abrirOperacion('INGRESO')">
          💰 COBRAR
        </button>

        <button
          type="button"
          onclick="abrirOperacion('EGRESO')">
          💸 PAGAR
        </button>

      </div>

      <div class="lds-movimientos">

        <h3>📋 MOVIMIENTOS</h3>

        ${generarMovimientosHTML(movimientos)}

      </div>

    </div>
  `;

  abrirPerfil();

}

// ============================================================
// MOVIMIENTOS
// ============================================================

function generarMovimientosHTML(movimientos) {

  if (!movimientos.length) {
    return `
      <p class="lds-sin-movimientos">
        No hay movimientos registrados.
      </p>
    `;
  }

  return movimientos.map(function(movimiento) {

    const tipo =
      movimiento.tipoMovimiento ||
      movimiento.tipo ||
      "";

    const concepto =
      movimiento.concepto ||
      "";

    const monto =
      Number(movimiento.monto || movimiento.montoLDS || 0);

    const fecha =
      movimiento.timestamp ||
      movimiento.fecha ||
      "";

    const responsable =
      movimiento.responsable ||
      "";

    const observacion =
      movimiento.observacion ||
      "";

    const signo =
      tipo === "INGRESO" ? "+" : "-";

    return `
      <div class="lds-movimiento">

        <div>
          <strong>
            ${escaparHTML(concepto)}
          </strong>

          <small>
            ${escaparHTML(formatearFecha(fecha))}
          </small>
        </div>

        <div>
          <strong>
            ${signo}${formatearLDS(monto)} LDS
          </strong>

          <small>
            ${escaparHTML(tipo)}
          </small>
        </div>

        ${
          responsable
            ? `<small>Responsable: ${escaparHTML(responsable)}</small>`
            : ""
        }

        ${
          observacion
            ? `<small>${escaparHTML(observacion)}</small>`
            : ""
        }

      </div>
    `;

  }).join("");

}

// ============================================================
// BÚSQUEDA MANUAL POR CÓDIGO
// ============================================================

async function buscarPorCodigo() {

  const input =
    document.getElementById("codigoInput") ||
    document.getElementById("codeInput");

  if (!input) {
    mostrarMensaje("No se encontró el campo de código.");
    return;
  }

  const codigo = input.value.trim();

  await consultarEstudiante(codigo);
}

// ============================================================
// ABRIR OPERACIÓN
// ============================================================

function abrirOperacion(tipo) {

  if (!estudianteActual) {
    mostrarMensaje("Primero selecciona un estudiante.");
    return;
  }

  const codigo =
    estudianteActual.estudiante.codigo;

  const estudiante =
    estudianteActual.estudiante.nombreCompleto;

  const cuenta =
    estudianteActual.cuenta || {};

  const saldo =
    Number(cuenta.saldoActual || 0);

  const mensaje =
    tipo === "INGRESO"
      ? "Registrar COBRO para " + estudiante
      : "Registrar PAGO para " + estudiante;

  console.log({
    tipo,
    codigo,
    estudiante,
    saldo
  });

  /*
   * ESTA PARTE SE CONECTARÁ CON registrarMovimiento()
   * EN EL SIGUIENTE PASO.
   *
   * No modifica todavía Google Sheets.
   */

  alert(
    mensaje +
    "\n\nCódigo: " +
    codigo +
    "\nSaldo actual: " +
    formatearLDS(saldo) +
    " LDS"
  );
}

// ============================================================
// PERFIL
// ============================================================

function abrirPerfil() {

  const modal =
    document.getElementById("profileOverlay") ||
    document.getElementById("profileModal");

  if (modal) {
    modal.classList.add("active");
    modal.style.display = "flex";
  }

}

function cerrarPerfil() {

  const modal =
    document.getElementById("profileOverlay") ||
    document.getElementById("profileModal");

  if (modal) {
    modal.classList.remove("active");
    modal.style.display = "none";
  }

}

// ============================================================
// MENSAJES
// ============================================================

function mostrarMensaje(mensaje) {

  console.log("Banco LDS 360:", mensaje);

  const elementos = [
    document.getElementById("mensaje"),
    document.getElementById("message"),
    document.getElementById("status"),
    document.getElementById("resultado")
  ];

  const elemento =
    elementos.find(function(el) {
      return el !== null;
    });

  if (elemento) {
    elemento.textContent = mensaje;
  }

}

// ============================================================
// FORMATO LDS
// ============================================================

function formatearLDS(numero) {

  const valor = Number(numero || 0);

  return valor.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

}

// ============================================================
// FORMATO FECHA
// ============================================================

function formatearFecha(fecha) {

  if (!fecha) {
    return "";
  }

  try {

    const d = new Date(fecha);

    if (isNaN(d.getTime())) {
      return String(fecha);
    }

    return d.toLocaleString("es-PE");

  } catch (error) {
    return String(fecha);
  }

}

// ============================================================
// SEGURIDAD HTML
// ============================================================

function escaparHTML(valor) {

  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

// ============================================================
// CARGAR POR ?codigo=LDS-EST-001
// ============================================================

function cargarCodigoDesdeURL() {

  const parametros =
    new URLSearchParams(window.location.search);

  const codigo =
    parametros.get("codigo");

  if (codigo) {
    consultarEstudiante(codigo);
  }

}

// ============================================================
// INICIO
// ============================================================

document.addEventListener("DOMContentLoaded", function() {

  console.log("Banco LDS 360 iniciado.");

  cargarCodigoDesdeURL();

});

// ============================================================
// FUNCIONES GLOBALES
// ============================================================

window.consultarEstudiante =
  consultarEstudiante;

window.buscarPorCodigo =
  buscarPorCodigo;

window.abrirOperacion =
  abrirOperacion;

window.abrirPerfil =
  abrirPerfil;

window.cerrarPerfil =
  cerrarPerfil;
