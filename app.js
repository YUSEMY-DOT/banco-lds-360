// ============================================================
// BANCO LDS 360
// APP.JS COMPLETO
// IEP LA SALLE DEL SUR
// ============================================================

const BANCO_LDS_API_URL =
  "https://script.google.com/macros/s/AKfycbyybdIHgP7-e7wklexc5koIw1atMWxIIFrrzZGHYB4g2Vr8Q3zakdL4Zhs8FRrWNADu/exec";

let estudianteActual = null;
let fotoIntento = 0;


// ============================================================
// CONSULTAR ESTUDIANTE
// ============================================================

async function consultarEstudiante(codigo) {

  codigo = String(codigo || "")
    .trim()
    .toUpperCase();

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
      throw new Error(
        "No se pudo conectar con Banco LDS 360."
      );
    }

    const datos = await respuesta.json();

    if (!datos.ok) {
      throw new Error(
        datos.mensaje ||
        "Error en Banco LDS 360."
      );
    }

    if (!datos.encontrado) {

      mostrarMensaje(
        "No se encontró el estudiante: " +
        codigo
      );

      return null;
    }

    estudianteActual = datos;

    mostrarEstudiante(datos);

    return datos;

  } catch (error) {

    console.error(
      "Error Banco LDS 360:",
      error
    );

    mostrarMensaje(
      "❌ No se pudo conectar con Banco LDS 360."
    );

    return null;
  }
}


// ============================================================
// MOSTRAR ESTUDIANTE
// ============================================================

function mostrarEstudiante(datos) {

  const estudiante =
    datos.estudiante || {};

  const cuenta =
    datos.cuenta || {};

  const movimientos =
    datos.movimientos || [];

  const codigo =
    estudiante.codigo || "";

  const nombre =
    estudiante.nombreCompleto ||
    (
      String(estudiante.nombre || "") +
      " " +
      String(estudiante.apellido || "")
    ).trim();

  const grado =
    estudiante.grado || "";

  const seccion =
    estudiante.seccion || "";

  const docente =
    estudiante.docente || "";

  const fotoPrincipal =
    estudiante.fotoUrl ||
    estudiante.foto ||
    "";

  const fotoAlternativa =
    estudiante.foto ||
    estudiante.fotoUrl ||
    "";

  const ingresos =
    Number(cuenta.totalIngresos || 0);

  const egresos =
    Number(cuenta.totalEgresos || 0);

  const saldo =
    Number(cuenta.saldoActual || 0);

  const contenedor =
    document.getElementById(
      "profileContent"
    );

  if (!contenedor) {

    console.error(
      "No existe #profileContent."
    );

    return;
  }

  fotoIntento = 0;

  contenedor.innerHTML = `

    <div class="lds-profile">

      <!-- ==========================================
           CABECERA DEL ESTUDIANTE
      =========================================== -->

      <div class="lds-profile-header">

        <div class="lds-photo-container">

          <div class="lds-photo-frame">

            <img
              id="ldsStudentPhoto"
              src="${escaparHTML(fotoPrincipal)}"
              alt="Foto de ${escaparHTML(nombre)}"
              class="lds-student-photo"
              onerror="manejarErrorFoto(this, '${escaparJS(fotoAlternativa)}')"
            >

            <div
              id="ldsPhotoFallback"
              class="lds-photo-fallback"
              style="display:none;"
            >
              <div class="lds-photo-icon">
                👤
              </div>

              <span>
                Foto no disponible
              </span>
            </div>

          </div>

          <div class="lds-photo-label">
            ESTUDIANTE LDS
          </div>

        </div>


        <div class="lds-student-data">

          <div class="lds-student-name">
            ${escaparHTML(nombre)}
          </div>

          <div class="lds-code">
            ${escaparHTML(codigo)}
          </div>

          <div class="lds-student-details">

            <div class="lds-detail">
              <span>🎓</span>
              <div>
                <small>Grado</small>
                <strong>
                  ${escaparHTML(grado)}
                </strong>
              </div>
            </div>

            <div class="lds-detail">
              <span>🏫</span>
              <div>
                <small>Sección</small>
                <strong>
                  ${escaparHTML(seccion)}
                </strong>
              </div>
            </div>

            <div class="lds-detail">
              <span>👩‍🏫</span>
              <div>
                <small>Docente</small>
                <strong>
                  ${escaparHTML(docente)}
                </strong>
              </div>
            </div>

          </div>

        </div>

      </div>


      <!-- ==========================================
           CUENTA
      =========================================== -->

      <div class="lds-account-card">

        <div class="lds-account-title">
          <span>💰</span>
          <strong>CUENTA LDS</strong>
        </div>


        <div class="lds-account-values">

          <div class="lds-money-box">

            <span>
              Ingresos
            </span>

            <strong class="income">
              +${formatearLDS(ingresos)} LDS
            </strong>

          </div>


          <div class="lds-money-box">

            <span>
              Egresos
            </span>

            <strong class="expense">
              -${formatearLDS(egresos)} LDS
            </strong>

          </div>


          <div class="lds-money-box balance">

            <span>
              Saldo actual
            </span>

            <strong>
              ${formatearLDS(saldo)} LDS
            </strong>

          </div>

        </div>

      </div>


      <!-- ==========================================
           OPERACIONES
      =========================================== -->

      <div class="lds-operation-buttons">

        <button
          type="button"
          class="lds-operation income-button"
          onclick="abrirOperacion('INGRESO')"
        >
          <span>💰</span>
          <div>
            <strong>COBRAR</strong>
            <small>Registrar ingreso</small>
          </div>
        </button>


        <button
          type="button"
          class="lds-operation expense-button"
          onclick="abrirOperacion('EGRESO')"
        >
          <span>💸</span>
          <div>
            <strong>PAGAR</strong>
            <small>Registrar egreso</small>
          </div>
        </button>

      </div>


      <!-- ==========================================
           MOVIMIENTOS
      =========================================== -->

      <div class="lds-movements-card">

        <div class="lds-movements-title">

          <span>📋</span>

          <strong>
            MOVIMIENTOS
          </strong>

          <span class="lds-movement-count">
            ${movimientos.length}
          </span>

        </div>

        <div class="lds-movements-list">

          ${generarMovimientosHTML(movimientos)}

        </div>

      </div>

    </div>
  `;

  agregarEstilosFicha();

  abrirPerfil();

}


// ============================================================
// FOTO
// ============================================================

function manejarErrorFoto(imagen, fotoAlternativa) {

  fotoIntento++;

  if (
    fotoIntento === 1 &&
    fotoAlternativa &&
    imagen.src !== fotoAlternativa
  ) {

    imagen.src = fotoAlternativa;

    return;
  }

  imagen.style.display = "none";

  const fallback =
    document.getElementById(
      "ldsPhotoFallback"
    );

  if (fallback) {
    fallback.style.display = "flex";
  }
}


// ============================================================
// MOVIMIENTOS
// ============================================================

function generarMovimientosHTML(movimientos) {

  if (!movimientos.length) {

    return `
      <div class="lds-empty-movements">

        <div>
          📭
        </div>

        <strong>
          Sin movimientos registrados
        </strong>

        <span>
          Esta cuenta todavía no tiene operaciones.
        </span>

      </div>
    `;
  }

  return movimientos.map(
    function(movimiento) {

      const tipo =
        movimiento.tipoMovimiento ||
        movimiento.tipo ||
        "";

      const concepto =
        movimiento.concepto ||
        "Sin concepto";

      const monto =
        Number(
          movimiento.monto ||
          movimiento.montoLDS ||
          0
        );

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

      const esIngreso =
        String(tipo)
          .toUpperCase() === "INGRESO";

      const clase =
        esIngreso
          ? "movement-income"
          : "movement-expense";

      const signo =
        esIngreso
          ? "+"
          : "-";

      const icono =
        esIngreso
          ? "💰"
          : "💸";

      return `

        <div class="lds-movement ${clase}">

          <div class="lds-movement-icon">
            ${icono}
          </div>


          <div class="lds-movement-main">

            <strong>
              ${escaparHTML(concepto)}
            </strong>

            <span>
              ${escaparHTML(
                formatearFecha(fecha)
              )}
            </span>

            ${
              responsable
                ? `
                  <small>
                    Responsable:
                    ${escaparHTML(responsable)}
                  </small>
                `
                : ""
            }

            ${
              observacion
                ? `
                  <small>
                    ${escaparHTML(observacion)}
                  </small>
                `
                : ""
            }

          </div>


          <div class="lds-movement-amount">

            <strong>
              ${signo}${formatearLDS(monto)}
              LDS
            </strong>

            <span>
              ${escaparHTML(tipo)}
            </span>

          </div>

        </div>
      `;
    }
  ).join("");

}


// ============================================================
// BUSCAR POR CÓDIGO
// ============================================================

async function buscarPorCodigo() {

  const input =
    document.getElementById(
      "codigoInput"
    ) ||
    document.getElementById(
      "codeInput"
    );

  if (!input) {

    mostrarMensaje(
      "No se encontró el campo de código."
    );

    return;
  }

  const codigo =
    input.value.trim();

  await consultarEstudiante(codigo);
}


// ============================================================
// OPERACIONES
// ============================================================

function abrirOperacion(tipo) {

  if (!estudianteActual) {

    mostrarMensaje(
      "Primero selecciona un estudiante."
    );

    return;
  }

  const estudiante =
    estudianteActual.estudiante
      .nombreCompleto;

  const codigo =
    estudianteActual.estudiante
      .codigo;

  const saldo =
    Number(
      estudianteActual.cuenta
        ?.saldoActual || 0
    );

  const titulo =
    tipo === "INGRESO"
      ? "COBRAR"
      : "PAGAR";

  const mensaje =
    tipo === "INGRESO"
      ? "Registrar un ingreso para:"
      : "Registrar un pago para:";

  alert(
    titulo +
    "\n\n" +
    mensaje +
    "\n" +
    estudiante +
    "\n\n" +
    "Código: " +
    codigo +
    "\n" +
    "Saldo actual: " +
    formatearLDS(saldo) +
    " LDS"
  );

}


// ============================================================
// PERFIL
// ============================================================

function abrirPerfil() {

  const modal =
    document.getElementById(
      "profileOverlay"
    );

  if (modal) {

    modal.classList.add(
      "active"
    );

  }

}


function cerrarPerfil() {

  const modal =
    document.getElementById(
      "profileOverlay"
    );

  if (modal) {

    modal.classList.remove(
      "active"
    );

  }

}


// ============================================================
// MENSAJES
// ============================================================

function mostrarMensaje(mensaje) {

  console.log(
    "Banco LDS 360:",
    mensaje
  );

  const elementos = [

    document.getElementById(
      "connectionStatus"
    ),

    document.getElementById(
      "codeMessage"
    ),

    document.getElementById(
      "mensaje"
    ),

    document.getElementById(
      "message"
    ),

    document.getElementById(
      "status"
    )

  ];

  const elemento =
    elementos.find(
      function(el) {
        return el !== null;
      }
    );

  if (elemento) {
    elemento.textContent =
      mensaje;
  }

}


// ============================================================
// FORMATO LDS
// ============================================================

function formatearLDS(numero) {

  const valor =
    Number(numero || 0);

  return valor.toLocaleString(
    "es-PE",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );

}


// ============================================================
// FORMATO FECHA
// ============================================================

function formatearFecha(fecha) {

  if (!fecha) {
    return "";
  }

  try {

    const d =
      new Date(fecha);

    if (
      isNaN(
        d.getTime()
      )
    ) {

      return String(fecha);

    }

    return d.toLocaleString(
      "es-PE",
      {
        dateStyle: "short",
        timeStyle: "short"
      }
    );

  } catch (error) {

    return String(fecha);

  }

}


// ============================================================
// ESCAPAR HTML
// ============================================================

function escaparHTML(valor) {

  return String(
    valor ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


// ============================================================
// ESCAPAR JAVASCRIPT
// ============================================================

function escaparJS(valor) {

  return String(
    valor ?? ""
  )
    .replace(
      /\\/g,
      "\\\\"
    )
    .replace(
      /'/g,
      "\\'"
    )
    .replace(
      /"/g,
      '\\"'
    )
    .replace(
      /\n/g,
      "\\n"
    )
    .replace(
      /\r/g,
      "\\r"
    );

}


// ============================================================
// ESTILOS DE LA FICHA
// ============================================================

function agregarEstilosFicha() {

  if (
    document.getElementById(
      "ldsProfileStyles"
    )
  ) {
    return;
  }

  const style =
    document.createElement(
      "style"
    );

  style.id =
    "ldsProfileStyles";

  style.textContent = `

    /* ============================================
       PERFIL BANCO LDS 360
    ============================================ */

    .lds-profile {
      width: 100%;
      max-width: 760px;
      margin: 0 auto;
    }


    /* ============================================
       CABECERA
    ============================================ */

    .lds-profile-header {
      display: grid;
      grid-template-columns: 190px 1fr;
      gap: 28px;
      align-items: center;
      padding: 8px 8px 25px;
    }


    /* ============================================
       FOTO
    ============================================ */

    .lds-photo-container {
      text-align: center;
    }

    .lds-photo-frame {
      width: 170px;
      height: 170px;
      margin: 0 auto;
      border-radius: 50%;
      padding: 6px;
      background: #f4c400;
      box-shadow:
        0 8px 25px rgba(7,29,58,.18);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .lds-student-photo {
      width: 158px;
      height: 158px;
      border-radius: 50%;
      object-fit: cover;
      display: block;
      background: #eef2f6;
    }

    .lds-photo-fallback {
      width: 158px;
      height: 158px;
      border-radius: 50%;
      background: #eef2f6;
      color: #071d3a;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 5px;
      font-size: 12px;
      font-weight: bold;
      text-align: center;
    }

    .lds-photo-icon {
      font-size: 55px;
    }

    .lds-photo-label {
      margin-top: 9px;
      font-size: 11px;
      font-weight: 900;
      color: #6b7280;
      letter-spacing: 1.5px;
    }


    /* ============================================
       DATOS DEL ESTUDIANTE
    ============================================ */

    .lds-student-data {
      min-width: 0;
    }

    .lds-student-name {
      color: #071d3a;
      font-family: Georgia, serif;
      font-size: clamp(23px, 3vw, 34px);
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: 7px;
    }

    .lds-code {
      display: inline-block;
      background: #eef2f6;
      color: #071d3a;
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 800;
      margin-bottom: 18px;
    }

    .lds-student-details {
      display: grid;
      gap: 10px;
    }

    .lds-detail {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .lds-detail > span {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f4f6f9;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .lds-detail div {
      display: flex;
      flex-direction: column;
    }

    .lds-detail small {
      color: #7b8490;
      font-size: 11px;
      font-weight: 700;
    }

    .lds-detail strong {
      color: #071d3a;
      font-size: 14px;
    }


    /* ============================================
       CUENTA
    ============================================ */

    .lds-account-card {
      background: #071d3a;
      border-radius: 24px;
      padding: 22px;
      color: white;
      box-shadow:
        0 10px 25px rgba(7,29,58,.18);
    }

    .lds-account-title {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      margin-bottom: 18px;
    }

    .lds-account-values {
      display: grid;
      grid-template-columns: 1fr 1fr 1.25fr;
      gap: 10px;
    }

    .lds-money-box {
      background: rgba(255,255,255,.08);
      border-radius: 15px;
      padding: 13px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .lds-money-box span {
      font-size: 12px;
      opacity: .8;
    }

    .lds-money-box strong {
      font-size: 17px;
    }

    .lds-money-box .income {
      color: #67e8a3;
    }

    .lds-money-box .expense {
      color: #ff8794;
    }

    .lds-money-box.balance {
      background: #f4c400;
      color: #071d3a;
    }

    .lds-money-box.balance span {
      opacity: 1;
      font-weight: 700;
    }

    .lds-money-box.balance strong {
      font-size: 21px;
    }


    /* ============================================
       BOTONES
    ============================================ */

    .lds-operation-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin: 18px 0;
    }

    .lds-operation {
      border: none;
      border-radius: 18px;
      padding: 15px 18px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      transition:
        transform .2s,
        box-shadow .2s;
    }

    .lds-operation:hover {
      transform: translateY(-2px);
      box-shadow:
        0 8px 18px rgba(0,0,0,.16);
    }

    .lds-operation > span {
      font-size: 25px;
    }

    .lds-operation div {
      display: flex;
      flex-direction: column;
      text-align: left;
    }

    .lds-operation strong {
      font-size: 17px;
    }

    .lds-operation small {
      font-size: 11px;
      opacity: .85;
      margin-top: 2px;
    }

    .income-button {
      background: #198754;
    }

    .expense-button {
      background: #cf142b;
    }


    /* ============================================
       MOVIMIENTOS
    ============================================ */

    .lds-movements-card {
      background: #f4f6f9;
      border-radius: 22px;
      padding: 18px;
    }

    .lds-movements-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #071d3a;
      margin-bottom: 13px;
      font-size: 16px;
    }

    .lds-movement-count {
      margin-left: auto;
      min-width: 25px;
      height: 25px;
      padding: 0 8px;
      border-radius: 20px;
      background: #071d3a;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
    }

    .lds-movement {
      display: grid;
      grid-template-columns: 42px 1fr auto;
      gap: 12px;
      align-items: center;
      background: white;
      border-radius: 15px;
      padding: 13px;
      margin-bottom: 9px;
      box-shadow:
        0 2px 8px rgba(0,0,0,.05);
    }

    .lds-movement:last-child {
      margin-bottom: 0;
    }

    .lds-movement-icon {
      width: 42px;
      height: 42px;
      border-radius: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .movement-income .lds-movement-icon {
      background: #e8f8ef;
    }

    .movement-expense .lds-movement-icon {
      background: #ffedf0;
    }

    .lds-movement-main {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .lds-movement-main strong {
      color: #071d3a;
      font-size: 13px;
    }

    .lds-movement-main span {
      color: #7b8490;
      font-size: 10px;
    }

    .lds-movement-main small {
      color: #7b8490;
      font-size: 9px;
    }

    .lds-movement-amount {
      text-align: right;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .lds-movement-amount strong {
      font-size: 14px;
    }

    .movement-income .lds-movement-amount strong {
      color: #198754;
    }

    .movement-expense .lds-movement-amount strong {
      color: #cf142b;
    }

    .lds-movement-amount span {
      color: #7b8490;
      font-size: 9px;
      text-transform: uppercase;
      font-weight: bold;
    }


    /* ============================================
       SIN MOVIMIENTOS
    ============================================ */

    .lds-empty-movements {
      text-align: center;
      padding: 25px;
      color: #6b7280;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .lds-empty-movements div {
      font-size: 30px;
    }

    .lds-empty-movements strong {
      color: #071d3a;
    }

    .lds-empty-movements span {
      font-size: 12px;
    }


    /* ============================================
       RESPONSIVE
    ============================================ */

    @media (max-width: 650px) {

      .lds-profile-header {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .lds-student-details {
        text-align: left;
      }

      .lds-account-values {
        grid-template-columns: 1fr 1fr;
      }

      .lds-money-box.balance {
        grid-column: 1 / -1;
      }

    }


    @media (max-width: 500px) {

      .lds-operation-buttons {
        grid-template-columns: 1fr;
      }

      .lds-movement {
        grid-template-columns: 38px 1fr;
      }

      .lds-movement-amount {
        grid-column: 2;
        text-align: left;
        flex-direction: row;
        align-items: center;
        gap: 8px;
      }

      .lds-account-values {
        grid-template-columns: 1fr;
      }

      .lds-money-box.balance {
        grid-column: auto;
      }

    }

  `;

  document.head.appendChild(
    style
  );

}


// ============================================================
// CARGAR CÓDIGO DESDE URL
// ============================================================

function cargarCodigoDesdeURL() {

  const parametros =
    new URLSearchParams(
      window.location.search
    );

  const codigo =
    parametros.get("codigo");

  if (codigo) {

    consultarEstudiante(
      codigo
    );

  }

}


// ============================================================
// INICIO
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  function() {

    console.log(
      "🏦 Banco LDS 360 iniciado."
    );

  }
);


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

window.mostrarEstudiante =
  mostrarEstudiante;

window.manejarErrorFoto =
  manejarErrorFoto;
