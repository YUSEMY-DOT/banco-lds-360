// ============================================================
// BANCO LDS 360
// APP.JS COMPLETO Y CORREGIDO
// IEP LA SALLE DEL SUR
// ============================================================

const BANCO_LDS_API_URL =
  "https://script.google.com/macros/s/AKfycbyybdIHgP7-e7wklexc5koIw1atMWxIIFrrzZGHYB4g2Vr8Q3zakdL4Zhs8FRrWNADu/exec";

let estudianteActual = null;


// ============================================================
// CONSULTAR ESTUDIANTE
// ============================================================

async function consultarEstudiante(codigo) {

  codigo = String(codigo || "")
    .trim()
    .toUpperCase();

  if (!codigo) {
    alert("Ingrese el código del estudiante.");
    return;
  }

  try {

    const url =
      BANCO_LDS_API_URL +
      "?codigo=" +
      encodeURIComponent(codigo) +
      "&t=" +
      Date.now();

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

    console.log(
      "Banco LDS 360:",
      datos
    );

    if (!datos.ok) {
      alert(
        datos.mensaje ||
        "Ocurrió un error."
      );
      return;
    }

    if (!datos.encontrado) {
      alert(
        "No se encontró el estudiante:\n\n" +
        codigo
      );
      return;
    }

    estudianteActual = datos;

    mostrarFichaEstudiante(datos);

  } catch (error) {

    console.error(
      "Error Banco LDS 360:",
      error
    );

    alert(
      "No se pudo conectar con Banco LDS 360.\n\n" +
      "Verifica tu conexión a Internet."
    );
  }
}


// ============================================================
// MOSTRAR FICHA DEL ESTUDIANTE
// ============================================================

function mostrarFichaEstudiante(datos) {

  const estudiante =
    datos.estudiante || {};

  const cuenta =
    datos.cuenta || {};

  const movimientos =
    datos.movimientos || [];


  const nombre =
    estudiante.nombreCompleto ||
    (
      String(estudiante.nombre || "") +
      " " +
      String(estudiante.apellido || "")
    ).trim();


  const codigo =
    estudiante.codigo || "";


  const grado =
    estudiante.grado || "";


  const seccion =
    estudiante.seccion || "";


  const docente =
    estudiante.docente || "";


  const ingresos =
    Number(
      cuenta.totalIngresos || 0
    );


  const egresos =
    Number(
      cuenta.totalEgresos || 0
    );


  const saldo =
    Number(
      cuenta.saldoActual || 0
    );


  const foto =
    prepararURLFoto(
      estudiante.fotoUrl ||
      estudiante.foto ||
      ""
    );


  const contenedor =
    document.getElementById(
      "profileContent"
    );


  if (!contenedor) {

    console.error(
      "No existe #profileContent en index.html."
    );

    return;
  }


  // ==========================================================
  // FOTO
  // ==========================================================

  const htmlFoto = foto

    ? `
      <img
        src="${escaparHTML(foto)}"
        alt="Foto del estudiante"
        class="lds-student-photo"
        onerror="fotoNoDisponible(this)"
      >
    `

    : `
      <div class="lds-photo-placeholder">
        <span>👤</span>
        <small>Foto no disponible</small>
      </div>
    `;


  // ==========================================================
  // CONTENIDO
  // ==========================================================

  contenedor.innerHTML = `

    <div class="lds-profile">


      <!-- ================================================
           DATOS DEL ESTUDIANTE
      ================================================= -->

      <section class="lds-student-header">


        <!-- FOTO -->

        <div class="lds-photo-column">

          <div class="lds-photo-frame">
            ${htmlFoto}
          </div>

          <div class="lds-photo-caption">
            ESTUDIANTE LDS
          </div>

        </div>


        <!-- INFORMACIÓN -->

        <div class="lds-student-info">

          <h1>
            ${escaparHTML(nombre)}
          </h1>


          <div class="lds-student-code">
            ${escaparHTML(codigo)}
          </div>


          <div class="lds-info-list">


            <!-- GRADO -->

            <div class="lds-info-item">

              <div class="lds-info-icon">
                🎓
              </div>

              <div class="lds-info-text">

                <span>
                  Grado
                </span>

                <strong>
                  ${escaparHTML(grado)}
                </strong>

              </div>

            </div>


            <!-- SECCIÓN -->

            <div class="lds-info-item">

              <div class="lds-info-icon">
                🏫
              </div>

              <div class="lds-info-text">

                <span>
                  Sección
                </span>

                <strong>
                  ${escaparHTML(seccion)}
                </strong>

              </div>

            </div>


            <!-- DOCENTE -->

            <div class="lds-info-item">

              <div class="lds-info-icon">
                👩‍🏫
              </div>

              <div class="lds-info-text">

                <span>
                  Docente
                </span>

                <strong>
                  ${escaparHTML(docente)}
                </strong>

              </div>

            </div>


          </div>

        </div>

      </section>


      <!-- ================================================
           CUENTA LDS
      ================================================= -->

      <section class="lds-account">

        <div class="lds-account-title">
          💰 CUENTA LDS
        </div>


        <div class="lds-account-grid">


          <!-- INGRESOS -->

          <div class="lds-money income">

            <div class="lds-money-icon">
              ↑
            </div>

            <div class="lds-money-data">

              <span>
                Total ingresos
              </span>

              <strong>
                ${formatearLDS(ingresos)} LDS
              </strong>

            </div>

          </div>


          <!-- EGRESOS -->

          <div class="lds-money expense">

            <div class="lds-money-icon">
              ↓
            </div>

            <div class="lds-money-data">

              <span>
                Total egresos
              </span>

              <strong>
                ${formatearLDS(egresos)} LDS
              </strong>

            </div>

          </div>


          <!-- SALDO -->

          <div class="lds-money balance">

            <div class="lds-money-icon">
              🪙
            </div>

            <div class="lds-money-data">

              <span>
                Saldo actual
              </span>

              <strong>
                ${formatearLDS(saldo)} LDS
              </strong>

            </div>

          </div>


        </div>

      </section>


      <!-- ================================================
           BOTONES
      ================================================= -->

      <section class="lds-actions">


        <button
          type="button"
          class="lds-action cobrar"
          onclick="abrirOperacion('INGRESO')"
        >

          <span class="lds-action-icon">
            💰
          </span>

          <span class="lds-action-text">

            <strong>
              COBRAR
            </strong>

            <small>
              Registrar ingreso
            </small>

          </span>

        </button>


        <button
          type="button"
          class="lds-action pagar"
          onclick="abrirOperacion('EGRESO')"
        >

          <span class="lds-action-icon">
            💸
          </span>

          <span class="lds-action-text">

            <strong>
              PAGAR
            </strong>

            <small>
              Registrar egreso
            </small>

          </span>

        </button>


      </section>


      <!-- ================================================
           MOVIMIENTOS
      ================================================= -->

      <section class="lds-movimientos">

        <div class="lds-movimientos-header">

          <strong>
            📋 MOVIMIENTOS
          </strong>

          <span class="lds-contador">
            ${movimientos.length}
          </span>

        </div>


        <div class="lds-lista-movimientos">

          ${
            movimientos.length

            ? movimientos
                .map(generarMovimiento)
                .join("")

            : `
              <div class="lds-sin-movimientos">

                <span>
                  📭
                </span>

                <strong>
                  No hay movimientos
                </strong>

                <small>
                  Esta cuenta todavía no tiene operaciones.
                </small>

              </div>
            `
          }

        </div>

      </section>


      <!-- ================================================
           SEGURIDAD
      ================================================= -->

      <div class="lds-security">

        <span>
          🛡️
        </span>

        <span>
          Sistema seguro, confiable y diseñado para el
          bienestar financiero de nuestros estudiantes.
        </span>

      </div>


    </div>

  `;


  agregarEstilosFicha();

  abrirFicha();
}


// ============================================================
// FOTO GOOGLE DRIVE
// ============================================================

function prepararURLFoto(url) {

  if (!url) {
    return "";
  }

  url =
    String(url).trim();


  let match =
    url.match(
      /\/d\/([a-zA-Z0-9_-]+)/
    );


  if (!match) {

    match =
      url.match(
        /id=([a-zA-Z0-9_-]+)/
      );

  }


  if (match && match[1]) {

    return (
      "https://drive.google.com/thumbnail" +
      "?id=" +
      encodeURIComponent(match[1]) +
      "&sz=w600"
    );

  }


  return url;
}


// ============================================================
// FOTO NO DISPONIBLE
// ============================================================

function fotoNoDisponible(img) {

  if (
    !img ||
    !img.parentElement
  ) {
    return;
  }


  img.parentElement.innerHTML = `

    <div class="lds-photo-placeholder">

      <span>
        👤
      </span>

      <small>
        Foto no disponible
      </small>

    </div>

  `;
}


// ============================================================
// GENERAR MOVIMIENTO
// ============================================================

function generarMovimiento(
  movimiento
) {

  const tipo =
    String(
      movimiento.tipoMovimiento ||
      movimiento.tipo ||
      ""
    ).toUpperCase();


  const esIngreso =
    tipo === "INGRESO";


  const concepto =
    movimiento.concepto ||
    "Sin concepto";


  const monto =
    Number(
      movimiento.monto ||
      movimiento.montoLDS ||
      0
    );


  const responsable =
    movimiento.responsable ||
    "";


  const observacion =
    movimiento.observacion ||
    "";


  const fecha =
    movimiento.timestamp ||
    movimiento.fecha ||
    "";


  const clase =
    esIngreso
      ? "mov-ingreso"
      : "mov-egreso";


  const signo =
    esIngreso
      ? "+"
      : "-";


  const icono =
    esIngreso
      ? "💰"
      : "💸";


  return `

    <article
      class="lds-movimiento ${clase}"
    >

      <div class="lds-mov-icon">
        ${icono}
      </div>


      <div class="lds-mov-info">

        <strong>
          ${escaparHTML(concepto)}
        </strong>


        ${
          fecha
            ? `
              <span>
                ${escaparHTML(
                  formatearFecha(fecha)
                )}
              </span>
            `
            : ""
        }


        ${
          responsable
            ? `
              <small>
                👤 Responsable:
                ${escaparHTML(responsable)}
              </small>
            `
            : ""
        }


        ${
          observacion
            ? `
              <small>
                📝
                ${escaparHTML(observacion)}
              </small>
            `
            : ""
        }

      </div>


      <div class="lds-mov-monto">

        <strong>
          ${signo}${formatearLDS(monto)} LDS
        </strong>

        <span>
          ${escaparHTML(tipo)}
        </span>

      </div>


    </article>

  `;
}
// ============================================================
// ABRIR FICHA
// ============================================================

function abrirFicha() {

  const overlay =
    document.getElementById(
      "profileOverlay"
    );


  if (overlay) {

    overlay.classList.add(
      "active"
    );


    document.documentElement
      .classList.add(
        "lds-modal-open"
      );


    document.body.classList.add(
      "lds-modal-open"
    );

  }
}


// ============================================================
// CERRAR FICHA
// ============================================================

function cerrarFicha() {

  const overlay =
    document.getElementById(
      "profileOverlay"
    );


  if (overlay) {

    overlay.classList.remove(
      "active"
    );


    document.documentElement
      .classList.remove(
        "lds-modal-open"
      );


    document.body.classList.remove(
      "lds-modal-open"
    );

  }
}


// ============================================================
// PERFIL
// ============================================================

function abrirPerfil() {
  abrirFicha();
}


function cerrarPerfil() {
  cerrarFicha();
}


// ============================================================
// INGRESAR CÓDIGO
// ============================================================

function ingresarCodigo() {

  const codigo =
    prompt(
      "Ingrese el código del estudiante:"
    );


  if (!codigo) {
    return;
  }


  consultarEstudiante(
    codigo
  );
}


// ============================================================
// ESCÁNER QR
// ============================================================

function abrirEscaner() {

  alert(
    "📷 ESCÁNER QR\n\n" +
    "El escáner QR se conectará " +
    "con la ficha del estudiante."
  );

}


// ============================================================
// COBRAR / PAGAR
// ============================================================

function abrirOperacion(tipo) {

  if (!estudianteActual) {

    alert(
      "Primero seleccione un estudiante."
    );

    return;
  }


  const estudiante =
    estudianteActual.estudiante ||
    {};


  const cuenta =
    estudianteActual.cuenta ||
    {};


  const nombre =
    estudiante.nombreCompleto ||
    "";


  const codigo =
    estudiante.codigo ||
    "";


  const saldo =
    Number(
      cuenta.saldoActual ||
      0
    );


  if (
    tipo === "INGRESO"
  ) {

    alert(
      "💰 COBRAR\n\n" +
      "Estudiante:\n" +
      nombre +
      "\n\nCódigo: " +
      codigo +
      "\n\n" +
      "El formulario de COBRAR " +
      "se conectará con MOVIMIENTOS " +
      "en el siguiente módulo."
    );


  } else {


    alert(
      "💸 PAGAR\n\n" +
      "Estudiante:\n" +
      nombre +
      "\n\nCódigo: " +
      codigo +
      "\n\n" +
      "Saldo disponible: " +
      formatearLDS(saldo) +
      " LDS\n\n" +
      "El formulario de PAGAR " +
      "se conectará con MOVIMIENTOS " +
      "en el siguiente módulo."
    );

  }

}


// ============================================================
// FORMATEAR LDS
// ============================================================

function formatearLDS(
  numero
) {

  return Number(
    numero || 0
  ).toLocaleString(
    "es-PE",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );

}


// ============================================================
// FORMATEAR FECHA
// ============================================================

function formatearFecha(
  fecha
) {

  if (!fecha) {
    return "";
  }


  try {

    const objeto =
      new Date(fecha);


    if (
      isNaN(
        objeto.getTime()
      )
    ) {

      return String(
        fecha
      );

    }


    return objeto.toLocaleString(
      "es-PE",
      {
        dateStyle: "short",
        timeStyle: "short"
      }
    );


  } catch (error) {

    return String(
      fecha
    );

  }

}


// ============================================================
// SEGURIDAD HTML
// ============================================================

function escaparHTML(
  valor
) {

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
// ESTILOS COMPLETOS DE LA FICHA
// ============================================================

function agregarEstilosFicha() {

  if (
    document.getElementById(
      "estilosBancoLDS360"
    )
  ) {

    return;
  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "estilosBancoLDS360";


  style.textContent = `

    /* ==========================================================
       CONTROL GLOBAL
    ========================================================== */

    html.lds-modal-open,
    body.lds-modal-open {

      overflow-x: hidden !important;

    }


    #profileOverlay,
    #profileOverlay *,
    #profileOverlay *::before,
    #profileOverlay *::after {

      box-sizing: border-box !important;

    }


    /* ==========================================================
       OVERLAY
    ========================================================== */

    #profileOverlay {

      position: fixed !important;

      inset: 0 !important;

      width: 100vw !important;
      max-width: 100vw !important;

      height: 100dvh !important;

      margin: 0 !important;

      padding: 18px !important;

      display: none !important;

      align-items: center !important;
      justify-content: center !important;

      overflow: hidden !important;

      z-index: 99999 !important;

      background:
        rgba(2, 12, 27, .80) !important;

      backdrop-filter:
        blur(4px);

    }


    #profileOverlay.active {

      display: flex !important;

    }


    /* ==========================================================
       VENTANA
    ========================================================== */

    #profileOverlay #profileContent {

      position: relative !important;

      display: block !important;

      width:
        min(
          1200px,
          calc(100vw - 36px)
        ) !important;

      max-width:
        calc(100vw - 36px) !important;

      min-width: 0 !important;

      height:
        min(
          900px,
          calc(100dvh - 36px)
        ) !important;

      max-height:
        calc(100dvh - 36px) !important;

      min-height: 0 !important;

      margin: 0 !important;

      padding: 0 !important;

      overflow-x: hidden !important;

      overflow-y: auto !important;

      border-radius: 28px !important;

      background: #ffffff !important;

      box-shadow:
        0 25px 80px
        rgba(0,0,0,.38) !important;

    }


    /* ==========================================================
       PERFIL
    ========================================================== */

    .lds-profile {

      display: block !important;

      width: 100% !important;

      max-width: 100% !important;

      min-width: 0 !important;

      margin: 0 !important;

      padding:
        28px
        32px
        35px !important;

      overflow: hidden !important;

      color: #071d3a;

      font-family:
        Arial,
        Helvetica,
        sans-serif;

    }


    /* ==========================================================
       CABECERA
    ========================================================== */

    .lds-student-header {

      width: 100% !important;

      max-width: 100% !important;

      min-width: 0 !important;

      display: grid !important;

      grid-template-columns:
        minmax(230px, 270px)
        minmax(0, 1fr) !important;

      gap: 28px !important;

      align-items: center !important;

      margin: 0 0 25px !important;

    }


    /* ==========================================================
       FOTO
    ========================================================== */

    .lds-photo-column {

      width: 100% !important;

      max-width: 100% !important;

      min-width: 0 !important;

      text-align: center;

    }


    .lds-photo-frame {

      width: 260px !important;

      height: 205px !important;

      max-width: 100% !important;

      margin: 0 auto !important;

      padding: 6px !important;

      border-radius: 25px !important;

      background: #f4c400 !important;

      box-shadow:
        0 9px 25px
        rgba(7,29,58,.18) !important;

      overflow: hidden !important;

      display: flex !important;

      align-items: center !important;

      justify-content: center !important;

    }


    .lds-student-photo,
    .lds-photo-placeholder {

      width: 100% !important;

      height: 100% !important;

      max-width: 100% !important;

      min-width: 0 !important;

      border-radius: 19px !important;

      object-fit: cover !important;

      object-position: center !important;

      display: block !important;

      background: #eef2f6 !important;

    }


    .lds-photo-placeholder {

      display: flex !important;

      flex-direction: column !important;

      align-items: center !important;

      justify-content: center !important;

      gap: 7px !important;

    }


    .lds-photo-placeholder span {

      font-size: 58px;

    }


    .lds-photo-placeholder small {

      font-size: 13px;

      font-weight: 800;

    }


    .lds-photo-caption {

      margin-top: 10px;

      color: #687284;

      font-size: 12px;

      font-weight: 900;

      letter-spacing: 2px;

    }


    /* ==========================================================
       INFORMACIÓN
    ========================================================== */

    .lds-student-info {

      width: 100% !important;

      max-width: 100% !important;

      min-width: 0 !important;

      overflow: hidden !important;

    }


    .lds-student-info h1 {

      width: 100% !important;

      max-width: 100% !important;

      min-width: 0 !important;

      margin:
        0 0 11px !important;

      color: #071d3a;

      font-family:
        Georgia,
        "Times New Roman",
        serif;

      font-size:
        clamp(
          28px,
          3vw,
          42px
        ) !important;

      line-height: 1.08 !important;

      text-align: center;

      overflow-wrap: anywhere !important;

      word-break: break-word !important;

    }


    .lds-student-code {

      display: block !important;

      width: max-content !important;

      max-width: 100% !important;

      margin:
        0 auto 18px !important;

      padding:
        9px 16px !important;

      border-radius: 25px !important;

      background: #edf2f7 !important;

      font-size: 14px;

      font-weight: 900;

      overflow-wrap: anywhere;

    }


    /* ==========================================================
       TARJETAS DE GRADO / SECCIÓN / DOCENTE
    ========================================================== */

    .lds-info-list {

      width: 100% !important;

      max-width: 100% !important;

      min-width: 0 !important;

      display: grid !important;

      grid-template-columns:
        repeat(
          3,
          minmax(0, 1fr)
        ) !important;

      gap: 10px !important;

    }


    .lds-info-item {

      width: 100% !important;

      max-width: 100% !important;

      min-width: 0 !important;

      min-height: 86px !important;

      padding: 10px !important;

      border-radius: 18px !important;

      background: #f4f6f9 !important;

      display: flex !important;

      align-items: center !important;

      gap: 8px !important;

      overflow: hidden !important;

    }


    .lds-info-icon {

      width: 50px !important;

      height: 50px !important;

      min-width: 50px !important;

      flex: 0 0 50px !important;

      border-radius: 50% !important;

      background: #ffffff !important;

      display: flex !important;

      align-items: center !important;

      justify-content: center !important;

      font-size: 26px !important;

      box-shadow:
        0 3px 10px
        rgba(7,29,58,.08);

    }


    .lds-info-text {

      width: 100% !important;

      max-width: 100% !important;

      min-width: 0 !important;

      overflow: hidden !important;

    }


    .lds-info-item span {

      display: block;

      color: #7a8390;

      font-size: 11px;

      font-weight: 700;

      margin-bottom: 4px;

    }


    .lds-info-item strong {

      display: block;

      width: 100%;

      max-width: 100%;

      color: #071d3a;

      font-size: 14px;

      line-height: 1.18;

      overflow-wrap: anywhere !important;

      word-break: break-word !important;

    }


    /* ==========================================================
       CUENTA
    ========================================================== */

    .lds-account {

      width: 100% !important;

      max-width: 100% !important;

      min-width: 0 !important;

      padding: 20px !important;

      border-radius: 25px !important;

      background: #071d3a !important;

      box-shadow:
        0 9px 25px
        rgba(7,29,58,.15);

      overflow: hidden !important;

    }


    .lds-account-title {

      margin-bottom: 16px;

      color: #ffffff;

      text-align: center;

      font-size: 23px;

      font-weight: 900;

    }


    .lds-account-grid {

      width: 100% !important;

      max-width: 100% !important;

      min-width: 0 !important;

      display: grid !important;

      grid-template-columns:
        repeat(
          3,
          minmax(0, 1fr)
        ) !important;

      gap: 10px !important;

    }


    .lds-money {

      width: 100% !important;

      max-width: 100% !important;

      min-width: 0 !important;

      min-height: 90px;

      padding: 12px;

      border-radius: 18px;

      background:
        rgba(255,255,255,.08);

      color: #ffffff;

      display: flex;

      align-items: center;

      gap: 9px;

      overflow: hidden;

    }


    .lds-money.balance {

      background: #f4c400;

      color: #071d3a;

    }


    .lds-money-icon {

      width: 50px;

      height: 50px;

      min-width: 50px;

      flex: 0 0 50px;

      border-radius: 50%;

      display: flex;

      align-items: center;

      justify-content: center;

      font-size: 28px;

      font-weight: 900;

    }


    .income
    .lds-money-icon {

      background: #18a765;

    }


    .expense
    .lds-money-icon {

      background: #cf142b;

    }


    .balance
    .lds-money-icon {

      background:
        rgba(255,255,255,.30);

    }


    .lds-money-data {

      min-width: 0;

      max-width: 100%;

      overflow: hidden;

    }


    .lds-money span {

      display: block;

      font-size: 11px;

      opacity: .82;

      margin-bottom: 4px;

    }


    .lds-money strong {

      display: block;

      max-width: 100%;

      font-size: 18px;

      white-space: nowrap;

    }


    .income strong {

      color: #55e49a;

    }


    .expense strong {

      color: #ff7d8b;

    }


    .balance strong {

      color: #071d3a;

    }

  `;


  document.head.appendChild(
    style
  );
}
// ============================================================
// ESTILOS RESPONSIVE
// ============================================================

(function agregarResponsiveBancoLDS360() {

  const style =
    document.createElement(
      "style"
    );


  style.id =
    "responsiveBancoLDS360";


  style.textContent = `

    /* ==========================================================
       TABLET / PANTALLAS MEDIANAS
    ========================================================== */

    @media (max-width: 1050px) {

      #profileOverlay {

        padding: 12px !important;

      }


      #profileOverlay #profileContent {

        width:
          calc(100vw - 24px) !important;

        max-width:
          calc(100vw - 24px) !important;

        height:
          calc(100dvh - 24px) !important;

        max-height:
          calc(100dvh - 24px) !important;

        border-radius:
          23px !important;

      }


      .lds-profile {

        padding:
          22px !important;

      }


      .lds-student-header {

        grid-template-columns:
          220px
          minmax(0,1fr) !important;

        gap: 18px !important;

      }


      .lds-photo-frame {

        width: 210px !important;

        height: 170px !important;

      }


      .lds-info-list {

        grid-template-columns:
          repeat(
            3,
            minmax(0,1fr)
          ) !important;

        gap: 7px !important;

      }


      .lds-info-item {

        padding: 8px !important;

        gap: 6px !important;

      }


      .lds-info-icon {

        width: 43px !important;

        height: 43px !important;

        min-width: 43px !important;

        flex-basis: 43px !important;

        font-size: 23px !important;

      }


      .lds-info-item strong {

        font-size: 12px !important;

      }


      .lds-account {

        padding: 15px !important;

      }


      .lds-money {

        padding: 10px !important;

      }


      .lds-money-icon {

        width: 43px !important;

        height: 43px !important;

        min-width: 43px !important;

        flex-basis: 43px !important;

        font-size: 24px !important;

      }


      .lds-money strong {

        font-size: 15px !important;

      }

    }


    /* ==========================================================
       TABLET PEQUEÑA
    ========================================================== */

    @media (max-width: 820px) {

      .lds-student-header {

        grid-template-columns:
          1fr !important;

        text-align: center;

      }


      .lds-photo-frame {

        width:
          min(78vw, 320px) !important;

        height:
          min(58vw, 215px) !important;

      }


      .lds-student-info {

        text-align: center;

      }


      .lds-info-list {

        grid-template-columns:
          1fr !important;

        text-align: left;

      }


      .lds-account-grid {

        grid-template-columns:
          1fr !important;

      }


      .lds-money {

        min-height: 75px;

      }

    }


    /* ==========================================================
       CELULAR
    ========================================================== */

    @media (max-width: 600px) {

      #profileOverlay {

        padding: 0 !important;

      }


      #profileOverlay #profileContent {

        width: 100vw !important;

        max-width: 100vw !important;

        height: 100dvh !important;

        max-height: 100dvh !important;

        border-radius: 0 !important;

      }


      .lds-profile {

        width: 100% !important;

        max-width: 100% !important;

        padding:
          16px
          12px
          25px !important;

      }


      .lds-student-header {

        grid-template-columns:
          1fr !important;

        gap: 16px !important;

      }


      .lds-photo-frame {

        width:
          min(90vw, 330px) !important;

        height:
          min(62vw, 225px) !important;

      }


      .lds-student-info h1 {

        font-size:
          26px !important;

        line-height:
          1.08 !important;

      }


      .lds-student-code {

        font-size:
          13px !important;

      }


      .lds-info-list {

        grid-template-columns:
          1fr !important;

      }


      .lds-info-item {

        min-height:
          78px !important;

        padding:
          10px !important;

      }


      .lds-info-icon {

        width:
          50px !important;

        height:
          50px !important;

        min-width:
          50px !important;

        flex-basis:
          50px !important;

        font-size:
          27px !important;

      }


      .lds-info-item strong {

        font-size:
          14px !important;

      }


      .lds-account {

        padding:
          14px !important;

        border-radius:
          20px !important;

      }


      .lds-account-title {

        font-size:
          21px !important;

      }


      .lds-account-grid {

        grid-template-columns:
          1fr !important;

      }


      .lds-money {

        min-height:
          76px !important;

      }


      .lds-money-icon {

        width:
          50px !important;

        height:
          50px !important;

        min-width:
          50px !important;

        flex-basis:
          50px !important;

      }


      .lds-actions {

        grid-template-columns:
          1fr !important;

      }


      .lds-action {

        min-height:
          70px !important;

      }


      .lds-movimiento {

        grid-template-columns:
          45px
          minmax(0,1fr) !important;

      }


      .lds-mov-monto {

        grid-column:
          2 !important;

        max-width:
          100% !important;

        text-align:
          left !important;

        flex-direction:
          row !important;

        flex-wrap:
          wrap !important;

        align-items:
          center !important;

      }


      .lds-security {

        font-size:
          10px !important;

      }

    }


    /* ==========================================================
       CELULAR MUY PEQUEÑO
    ========================================================== */

    @media (max-width: 380px) {

      .lds-profile {

        padding-left:
          9px !important;

        padding-right:
          9px !important;

      }


      .lds-photo-frame {

        width:
          min(92vw, 300px) !important;

        height:
          190px !important;

      }


      .lds-student-info h1 {

        font-size:
          23px !important;

      }


      .lds-info-item {

        min-height:
          74px !important;

      }


      .lds-action {

        min-height:
          66px !important;

      }

    }

  `;


  document.head.appendChild(
    style
  );

})();


// ============================================================
// CARGAR CÓDIGO DESDE ?codigo=
// ============================================================

function cargarCodigoDesdeURL() {

  const parametros =
    new URLSearchParams(
      window.location.search
    );


  const codigo =
    parametros.get(
      "codigo"
    );


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
      "🏦 Banco LDS 360 iniciado correctamente."
    );


    cargarCodigoDesdeURL();

  }
);


// ============================================================
// FUNCIONES GLOBALES
// ============================================================

window.consultarEstudiante =
  consultarEstudiante;


window.mostrarFichaEstudiante =
  mostrarFichaEstudiante;


window.ingresarCodigo =
  ingresarCodigo;


window.abrirEscaner =
  abrirEscaner;


window.abrirOperacion =
  abrirOperacion;


window.abrirFicha =
  abrirFicha;


window.cerrarFicha =
  cerrarFicha;


window.abrirPerfil =
  abrirPerfil;


window.cerrarPerfil =
  cerrarPerfil;


window.fotoNoDisponible =
  fotoNoDisponible;


// ============================================================
// FIN APP.JS
// ============================================================
