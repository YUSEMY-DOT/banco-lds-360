// ============================================================
// BANCO LDS 360
// APP.JS COMPLETO
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
      throw new Error("No se pudo conectar con Banco LDS 360.");
    }

    const datos = await respuesta.json();

    console.log("Banco LDS 360:", datos);

    if (!datos.ok) {
      alert(datos.mensaje || "Ocurrió un error.");
      return;
    }

    if (!datos.encontrado) {
      alert("No se encontró el estudiante:\n\n" + codigo);
      return;
    }

    estudianteActual = datos;

    mostrarFichaEstudiante(datos);

  } catch (error) {

    console.error("Error Banco LDS 360:", error);

    alert(
      "No se pudo conectar con Banco LDS 360.\n\n" +
      "Verifica tu conexión a Internet."
    );
  }
}


// ============================================================
// MOSTRAR FICHA
// IMPORTANTE:
// NO CREA OTRO ENCABEZADO NI OTRO BOTÓN X.
// SOLO LLENA profileContent.
// ============================================================

function mostrarFichaEstudiante(datos) {

  const estudiante = datos.estudiante || {};
  const cuenta = datos.cuenta || {};
  const movimientos = datos.movimientos || [];

  const nombre =
    estudiante.nombreCompleto ||
    (
      String(estudiante.nombre || "") +
      " " +
      String(estudiante.apellido || "")
    ).trim();

  const codigo = estudiante.codigo || "";
  const grado = estudiante.grado || "";
  const seccion = estudiante.seccion || "";
  const docente = estudiante.docente || "";

  const ingresos = Number(cuenta.totalIngresos || 0);
  const egresos = Number(cuenta.totalEgresos || 0);
  const saldo = Number(cuenta.saldoActual || 0);

  const foto = prepararURLFoto(
    estudiante.fotoUrl ||
    estudiante.foto ||
    ""
  );

  const contenedor =
    document.getElementById("profileContent");

  if (!contenedor) {

    console.error(
      "No existe el elemento profileContent en index.html."
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
        alt="Foto de ${escaparHTML(nombre)}"
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
  // FICHA
  // ==========================================================

  contenedor.innerHTML = `

    <div class="lds-profile">


      <!-- ================================================
           INFORMACIÓN DEL ESTUDIANTE
      ================================================= -->

      <div class="lds-student-header">


        <!-- FOTO -->

        <div class="lds-photo-column">

          <div class="lds-photo-circle">

            ${htmlFoto}

          </div>

          <div class="lds-photo-caption">
            ESTUDIANTE LDS
          </div>

        </div>


        <!-- DATOS -->

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

              <div>

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

              <div>

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

              <div>

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

      </div>


      <!-- ================================================
           CUENTA LDS
      ================================================= -->

      <section class="lds-account">

        <div class="lds-account-title">
          💰 &nbsp; CUENTA LDS
        </div>


        <div class="lds-account-grid">


          <!-- INGRESOS -->

          <div class="lds-money income">

            <div class="lds-money-icon">
              ↑
            </div>

            <div>

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

            <div>

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

            <div>

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
           COBRAR / PAGAR
      ================================================= -->

      <div class="lds-actions">


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


      </div>


      <!-- ================================================
           MOVIMIENTOS
      ================================================= -->

      <section class="lds-movimientos">


        <div class="lds-movimientos-header">

          <div>
            📋 &nbsp;
            <strong>
              MOVIMIENTOS
            </strong>
          </div>

          <span class="lds-contador">
            ${movimientos.length}
          </span>

        </div>


        <div class="lds-lista-movimientos">

          ${
            movimientos.length > 0
            ? movimientos.map(generarMovimiento).join("")
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

        🛡️

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
// FOTO DE GOOGLE DRIVE
// ============================================================

function prepararURLFoto(url) {

  if (!url) {
    return "";
  }

  url = String(url).trim();

  let match = url.match(
    /\/d\/([a-zA-Z0-9_-]+)/
  );

  if (!match) {

    match = url.match(
      /id=([a-zA-Z0-9_-]+)/
    );

  }

  if (match && match[1]) {

    const id = match[1];

    return (
      "https://drive.google.com/thumbnail" +
      "?id=" +
      encodeURIComponent(id) +
      "&sz=w600"
    );
  }

  return url;
}


// ============================================================
// FOTO CON ERROR
// ============================================================

function fotoNoDisponible(img) {

  if (!img || !img.parentElement) {
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
// MOVIMIENTO
// ============================================================

function generarMovimiento(movimiento) {

  const tipo = String(
    movimiento.tipoMovimiento ||
    movimiento.tipo ||
    ""
  ).toUpperCase();

  const esIngreso = tipo === "INGRESO";

  const concepto =
    movimiento.concepto ||
    "Sin concepto";

  const monto = Number(
    movimiento.monto ||
    movimiento.montoLDS ||
    0
  );

  const responsable =
    movimiento.responsable || "";

  const observacion =
    movimiento.observacion || "";

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

    <article class="lds-movimiento ${clase}">


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
              📝 ${escaparHTML(observacion)}
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
// ABRIR / CERRAR FICHA
// ============================================================

function abrirFicha() {

  const overlay =
    document.getElementById("profileOverlay");

  if (overlay) {
    overlay.classList.add("active");
  }
}


function cerrarFicha() {

  const overlay =
    document.getElementById("profileOverlay");

  if (overlay) {
    overlay.classList.remove("active");
  }
}


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

  consultarEstudiante(codigo);
}


// ============================================================
// ESCÁNER QR
// ============================================================

function abrirEscaner() {

  alert(
    "📷 ESCÁNER QR\n\n" +
    "El escáner QR se conectará con " +
    "la ficha del estudiante."
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
    estudianteActual.estudiante || {};

  const cuenta =
    estudianteActual.cuenta || {};

  const nombre =
    estudiante.nombreCompleto || "";

  const codigo =
    estudiante.codigo || "";

  const saldo =
    Number(
      cuenta.saldoActual || 0
    );


  if (tipo === "INGRESO") {

    alert(
      "💰 COBRAR\n\n" +
      "Estudiante:\n" +
      nombre +
      "\n\nCódigo: " +
      codigo +
      "\n\n" +
      "El formulario real de COBRAR " +
      "lo conectaremos en el siguiente paso."
    );

  } else {

    alert(
      "💸 PAGAR\n\n" +
      "Estudiante:\n" +
      nombre +
      "\n\nCódigo: " +
      codigo +
      "\n\nSaldo disponible: " +
      formatearLDS(saldo) +
      " LDS\n\n" +
      "El formulario real de PAGAR " +
      "lo conectaremos en el siguiente paso."
    );

  }

}


// ============================================================
// FORMATO LDS
// ============================================================

function formatearLDS(numero) {

  return Number(numero || 0).toLocaleString(
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

    const objeto =
      new Date(fecha);

    if (
      isNaN(
        objeto.getTime()
      )
    ) {
      return String(fecha);
    }

    return objeto.toLocaleString(
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
// ESTILOS
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
    document.createElement("style");

  style.id =
    "estilosBancoLDS360";


  style.textContent = `

    /* ======================================================
       CONTENEDOR
    ====================================================== */

    .lds-profile {

      width: 100%;

      max-width: 1080px;

      margin: 0 auto;

      padding: 20px 25px 30px;

      color: #071d3a;

      font-family:
        Arial,
        Helvetica,
        sans-serif;

    }


    /* ======================================================
       ESTUDIANTE
    ====================================================== */

    .lds-student-header {

      display: grid;

      grid-template-columns:
        230px
        minmax(0, 1fr);

      gap: 35px;

      align-items: center;

      margin-bottom: 25px;

    }


    /* ======================================================
       FOTO
    ====================================================== */

    .lds-photo-column {

      text-align: center;

    }


    .lds-photo-circle {

      width: 190px;

      height: 190px;

      margin: 0 auto;

      padding: 6px;

      border-radius: 50%;

      background: #f4c400;

      box-shadow:
        0 7px 22px
        rgba(0,0,0,.15);

      overflow: hidden;

      display: flex;

      align-items: center;

      justify-content: center;

    }


    .lds-student-photo {

      width: 178px;

      height: 178px;

      border-radius: 50%;

      object-fit: cover;

      display: block;

      background: #eef2f6;

    }


    .lds-photo-placeholder {

      width: 178px;

      height: 178px;

      border-radius: 50%;

      background: #eef2f6;

      display: flex;

      align-items: center;

      justify-content: center;

      flex-direction: column;

      gap: 6px;

    }


    .lds-photo-placeholder span {

      font-size: 55px;

    }


    .lds-photo-placeholder small {

      font-size: 12px;

      font-weight: 800;

    }


    .lds-photo-caption {

      margin-top: 10px;

      color: #687284;

      font-size: 12px;

      font-weight: 900;

      letter-spacing: 2px;

    }


    /* ======================================================
       DATOS
    ====================================================== */

    .lds-student-info {

      min-width: 0;

    }


    .lds-student-info h1 {

      margin: 0 0 10px;

      font-family: Georgia, serif;

      font-size: clamp(
        25px,
        3vw,
        39px
      );

      line-height: 1.08;

      color: #071d3a;

    }


    .lds-student-code {

      display: inline-block;

      background: #edf2f7;

      border-radius: 25px;

      padding: 8px 15px;

      margin-bottom: 18px;

      font-size: 14px;

      font-weight: 900;

    }


    .lds-info-list {

      display: grid;

      grid-template-columns:
        repeat(3, minmax(0, 1fr));

      gap: 10px;

    }


    .lds-info-item {

      min-width: 0;

      min-height: 68px;

      padding: 11px;

      border-radius: 16px;

      background: #f4f6f9;

      display: flex;

      align-items: center;

      gap: 9px;

    }


    .lds-info-icon {

      width: 38px;

      height: 38px;

      flex: 0 0 38px;

      border-radius: 50%;

      background: white;

      display: flex;

      align-items: center;

      justify-content: center;

      font-size: 19px;

    }


    .lds-info-item span {

      display: block;

      color: #7a8390;

      font-size: 10px;

      font-weight: 700;

      margin-bottom: 3px;

    }


    .lds-info-item strong {

      display: block;

      color: #071d3a;

      font-size: 13px;

      line-height: 1.15;

      word-break: break-word;

    }


    /* ======================================================
       CUENTA
    ====================================================== */

    .lds-account {

      background: #071d3a;

      border-radius: 27px;

      padding: 22px;

      box-shadow:
        0 9px 25px
        rgba(7,29,58,.15);

    }


    .lds-account-title {

      text-align: center;

      color: white;

      font-size: 21px;

      font-weight: 900;

      margin-bottom: 18px;

    }


    .lds-account-grid {

      display: grid;

      grid-template-columns:
        repeat(3, minmax(0, 1fr));

      gap: 13px;

    }


    .lds-money {

      min-width: 0;

      padding: 17px;

      border-radius: 19px;

      background: rgba(255,255,255,.08);

      color: white;

      display: flex;

      align-items: center;

      gap: 13px;

    }


    .lds-money.balance {

      background: #f4c400;

      color: #071d3a;

    }


    .lds-money-icon {

      width: 47px;

      height: 47px;

      flex: 0 0 47px;

      border-radius: 50%;

      display: flex;

      align-items: center;

      justify-content: center;

      font-size: 28px;

      font-weight: 900;

    }


    .income .lds-money-icon {

      background: #18a765;

    }


    .expense .lds-money-icon {

      background: #cf142b;

    }


    .balance .lds-money-icon {

      background: rgba(255,255,255,.25);

    }


    .lds-money span {

      display: block;

      font-size: 11px;

      opacity: .8;

      margin-bottom: 4px;

    }


    .lds-money strong {

      display: block;

      font-size: 21px;

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


    /* ======================================================
       BOTONES
    ====================================================== */

    .lds-actions {

      display: grid;

      grid-template-columns:
        1fr 1fr;

      gap: 15px;

      margin: 17px 0;

    }


    .lds-action {

      border: none;

      border-radius: 19px;

      min-height: 78px;

      padding: 14px 22px;

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


    .lds-action:hover {

      transform:
        translateY(-2px);

      box-shadow:
        0 7px 18px
        rgba(0,0,0,.16);

    }


    .lds-action.cobrar {

      background: #198754;

    }


    .lds-action.pagar {

      background: #cf142b;

    }


    .lds-action-icon {

      font-size: 26px;

    }


    .lds-action-text {

      display: flex;

      flex-direction: column;

      text-align: left;

    }


    .lds-action-text strong {

      font-size: 18px;

    }


    .lds-action-text small {

      font-size: 11px;

      opacity: .85;

      margin-top: 2px;

    }


    /* ======================================================
       MOVIMIENTOS
    ====================================================== */

    .lds-movimientos {

      background: #f3f6fa;

      border-radius: 22px;

      padding: 18px;

    }


    .lds-movimientos-header {

      display: flex;

      align-items: center;

      justify-content: space-between;

      margin-bottom: 12px;

      color: #071d3a;

      font-size: 17px;

    }


    .lds-contador {

      width: 29px;

      height: 29px;

      border-radius: 50%;

      background: #1672d4;

      color: white;

      display: flex;

      align-items: center;

      justify-content: center;

      font-size: 12px;

      font-weight: 900;

    }


    .lds-lista-movimientos {

      display: flex;

      flex-direction: column;

      gap: 9px;

    }


    .lds-movimiento {

      display: grid;

      grid-template-columns:
        50px
        minmax(0, 1fr)
        auto;

      align-items: center;

      gap: 12px;

      padding: 13px;

      border-radius: 16px;

      background: white;

      box-shadow:
        0 2px 8px
        rgba(0,0,0,.05);

    }


    .lds-mov-icon {

      width: 45px;

      height: 45px;

      border-radius: 14px;

      display: flex;

      align-items: center;

      justify-content: center;

      font-size: 21px;

    }


    .mov-ingreso .lds-mov-icon {

      background: #dcf8e9;

    }


    .mov-egreso .lds-mov-icon {

      background: #ffe5e9;

    }


    .lds-mov-info {

      min-width: 0;

      display: flex;

      flex-direction: column;

      gap: 3px;

    }


    .lds-mov-info strong {

      font-size: 14px;

      color: #071d3a;

      word-break: break-word;

    }


    .lds-mov-info span {

      color: #778190;

      font-size: 10px;

    }


    .lds-mov-info small {

      color: #778190;

      font-size: 9px;

    }


    .lds-mov-monto {

      text-align: right;

      display: flex;

      flex-direction: column;

      gap: 3px;

    }


    .lds-mov-monto strong {

      font-size: 15px;

    }


    .mov-ingreso .lds-mov-monto strong {

      color: #198754;

    }


    .mov-egreso .lds-mov-monto strong {

      color: #cf142b;

    }


    .lds-mov-monto span {

      color: #778190;

      font-size: 9px;

      font-weight: 900;

    }


    /* ======================================================
       SIN MOVIMIENTOS
    ====================================================== */

    .lds-sin-movimientos {

      padding: 28px;

      text-align: center;

      display: flex;

      flex-direction: column;

      align-items: center;

      gap: 5px;

      color: #6f7885;

    }


    .lds-sin-movimientos span {

      font-size: 30px;

    }


    .lds-sin-movimientos strong {

      color: #071d3a;

    }


    .lds-sin-movimientos small {

      font-size: 11px;

    }


    /* ======================================================
       SEGURIDAD
    ====================================================== */

    .lds-security {

      margin-top: 15px;

      padding: 13px 18px;

      border-radius: 18px;

      background: #f1f5fa;

      color: #17477f;

      display: flex;

      align-items: center;

      justify-content: center;

      gap: 8px;

      text-align: center;

      font-size: 11px;

      font-weight: 700;

    }


    /* ======================================================
       TABLET
    ====================================================== */

    @media(max-width: 850px) {

      .lds-student-header {

        grid-template-columns: 190px minmax(0,1fr);

        gap: 22px;

      }


      .lds-photo-circle {

        width: 170px;

        height: 170px;

      }


      .lds-student-photo,
      .lds-photo-placeholder {

        width: 158px;

        height: 158px;

      }


      .lds-info-list {

        grid-template-columns: 1fr;

      }

    }


    /* ======================================================
       CELULAR
    ====================================================== */

    @media(max-width: 600px) {

      .lds-profile {

        padding: 15px;

      }


      .lds-student-header {

        grid-template-columns: 1fr;

        text-align: center;

      }


      .lds-student-info h1 {

        font-size: 27px;

      }


      .lds-info-list {

        text-align: left;

      }


      .lds-account-grid {

        grid-template-columns: 1fr;

      }


      .lds-actions {

        grid-template-columns: 1fr;

      }


      .lds-movimiento {

        grid-template-columns:
          45px
          minmax(0,1fr);

      }


      .lds-mov-monto {

        grid-column: 2;

        text-align: left;

        flex-direction: row;

        align-items: center;

      }

    }

  `;


  document.head.appendChild(style);

}


// ============================================================
// CARGAR CÓDIGO DESDE ?codigo=
// ============================================================

function cargarCodigoDesdeURL() {

  const parametros =
    new URLSearchParams(
      window.location.search
    );

  const codigo =
    parametros.get("codigo");

  if (codigo) {
    consultarEstudiante(codigo);
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
