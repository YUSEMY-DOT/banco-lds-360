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

    const respuesta =
      await fetch(url, {
        method: "GET",
        cache: "no-store"
      });

    if (!respuesta.ok) {
      throw new Error(
        "Error de conexión con Banco LDS 360."
      );
    }

    const datos =
      await respuesta.json();

    console.log(
      "Respuesta Banco LDS 360:",
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

    estudianteActual =
      datos;

    mostrarFichaEstudiante(
      datos
    );

  } catch (error) {

    console.error(error);

    alert(
      "No se pudo conectar con Banco LDS 360."
    );
  }
}


// ============================================================
// MOSTRAR FICHA
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


  // ----------------------------------------------------------
  // OBTENER FOTO
  // ----------------------------------------------------------

  const foto =
    prepararURLFoto(
      estudiante.fotoUrl ||
      estudiante.foto ||
      ""
    );


  // ----------------------------------------------------------
  // CONTENEDOR
  // ----------------------------------------------------------

  const contenedor =
    document.getElementById(
      "profileContent"
    );

  if (!contenedor) {

    console.error(
      "No existe el elemento #profileContent."
    );

    return;
  }


  // ----------------------------------------------------------
  // HTML COMPLETO
  // ----------------------------------------------------------

  contenedor.innerHTML = `

    <div class="lds-ficha">


      <!-- ================================================
           ENCABEZADO
      ================================================= -->

      <div class="lds-ficha-top">

        <div class="lds-ficha-titulo">

          <span class="lds-bank-icon">
            🏦
          </span>

          <div>

            <h2>
              Cuenta Banco LDS 360
            </h2>

            <p>
              IEP LA SALLE DEL SUR
            </p>

          </div>

        </div>


        <button
          type="button"
          class="lds-cerrar"
          onclick="cerrarFicha()"
        >
          ×
        </button>

      </div>


      <!-- ================================================
           DATOS DEL ESTUDIANTE
      ================================================= -->

      <div class="lds-student-header">


        <!-- FOTO -->

        <div class="lds-photo-column">

          <div class="lds-photo-circle">

            ${
              foto
              ?
              `
                <img
                  src="${escaparHTML(foto)}"
                  alt="Foto del estudiante"
                  class="lds-student-photo"
                  onerror="fotoNoDisponible(this)"
                >
              `
              :
              `
                <div class="lds-photo-placeholder">
                  <span>👤</span>
                  <small>Foto no disponible</small>
                </div>
              `
            }

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


          <div class="lds-info-grid">


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

        <div class="lds-account-heading">

          <span>
            💰
          </span>

          <strong>
            CUENTA LDS
          </strong>

        </div>


        <div class="lds-account-grid">


          <!-- INGRESOS -->

          <div class="lds-money income">

            <div class="lds-money-icon">
              ↑
            </div>

            <div class="lds-money-info">

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

            <div class="lds-money-info">

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

            <div class="lds-money-info">

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

            <span>
              📋
            </span>

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
            movimientos.length
            ?
            movimientos.map(
              generarMovimiento
            ).join("")
            :
            `
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
           PIE
      ================================================= -->

      <div class="lds-security">

        <span>
          🛡️
        </span>

        <span>
          Sistema seguro, confiable y diseñado para
          el bienestar financiero de nuestros estudiantes.
        </span>

      </div>


    </div>

  `;


  agregarEstilosFicha();

  abrirFicha();

}


// ============================================================
// PREPARAR FOTO DE GOOGLE DRIVE
// ============================================================

function prepararURLFoto(url) {

  if (!url) {
    return "";
  }

  url = String(url).trim();

  // ----------------------------------------------------------
  // Si es enlace de Google Drive con ID
  // ----------------------------------------------------------

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

    const id =
      match[1];

    /*
      Thumbnail de Google Drive.

      Es mucho más estable para mostrar
      imágenes dentro de la página que
      /uc?export=view
    */

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
// FOTO NO DISPONIBLE
// ============================================================

function fotoNoDisponible(img) {

  const contenedor =
    img.parentElement;

  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = `

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

    <article class="lds-movimiento ${clase}">


      <div class="lds-mov-icon">

        ${icono}

      </div>


      <div class="lds-mov-info">

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
          ?
          `
            <small>
              👤 Responsable:
              ${escaparHTML(responsable)}
            </small>
          `
          :
          ""
        }

        ${
          observacion
          ?
          `
            <small>
              📝 ${escaparHTML(observacion)}
            </small>
          `
          :
          ""
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
    document.getElementById(
      "profileOverlay"
    );

  if (overlay) {

    overlay.classList.add(
      "active"
    );

  }

}


function cerrarFicha() {

  const overlay =
    document.getElementById(
      "profileOverlay"
    );

  if (overlay) {

    overlay.classList.remove(
      "active"
    );

  }

}


// Compatibilidad con código anterior

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
    "📷 Escáner QR\n\n" +
    "El módulo de escaneo se conectará " +
    "con la ficha del estudiante."
  );

}


// ============================================================
// OPERACIONES
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
      "Aquí conectaremos el formulario " +
      "real para registrar el ingreso."
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
      "Aquí conectaremos el formulario " +
      "real para registrar el egreso."
    );

  }

}


// ============================================================
// FORMATO DINERO
// ============================================================

function formatearLDS(numero) {

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
// FORMATO FECHA
// ============================================================

function formatearFecha(fecha) {

  if (!fecha) {
    return "";
  }

  try {

    const fechaObjeto =
      new Date(fecha);

    if (
      isNaN(
        fechaObjeto.getTime()
      )
    ) {

      return String(fecha);

    }

    return fechaObjeto.toLocaleString(
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

    /* =====================================================
       FICHA PRINCIPAL
    ===================================================== */

    .lds-ficha {

      width: 100%;

      max-width: 1050px;

      margin: 0 auto;

      padding: 20px 28px 30px;

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      color: #071d3a;

    }


    /* =====================================================
       CABECERA
    ===================================================== */

    .lds-ficha-top {

      display: flex;

      align-items: center;

      justify-content: space-between;

      margin-bottom: 25px;

    }


    .lds-ficha-titulo {

      display: flex;

      align-items: center;

      gap: 14px;

    }


    .lds-bank-icon {

      font-size: 36px;

    }


    .lds-ficha-titulo h2 {

      margin: 0;

      font-family: Georgia, serif;

      font-size: 27px;

      color: #071d3a;

    }


    .lds-ficha-titulo p {

      margin: 3px 0 0;

      color: #777;

      font-size: 11px;

      font-weight: 800;

      letter-spacing: 3px;

    }


    .lds-cerrar {

      width: 48px;

      height: 48px;

      border: none;

      border-radius: 50%;

      background: #071d3a;

      color: white;

      font-size: 34px;

      line-height: 1;

      cursor: pointer;

    }


    .lds-cerrar:hover {

      transform: scale(1.05);

    }


    /* =====================================================
       ESTUDIANTE
    ===================================================== */

    .lds-student-header {

      display: grid;

      grid-template-columns:
        245px
        1fr;

      gap: 35px;

      align-items: center;

      padding: 5px 20px 30px;

    }


    /* =====================================================
       FOTO
    ===================================================== */

    .lds-photo-column {

      text-align: center;

    }


    .lds-photo-circle {

      width: 210px;

      height: 210px;

      margin: 0 auto;

      padding: 6px;

      border-radius: 50%;

      background: #f4c400;

      box-shadow:
        0 8px 25px
        rgba(0,0,0,.15);

      display: flex;

      align-items: center;

      justify-content: center;

      overflow: hidden;

    }


    .lds-student-photo {

      width: 198px;

      height: 198px;

      border-radius: 50%;

      object-fit: cover;

      display: block;

      background: #eef2f6;

    }


    .lds-photo-placeholder {

      width: 198px;

      height: 198px;

      border-radius: 50%;

      background: #eef2f6;

      display: flex;

      flex-direction: column;

      align-items: center;

      justify-content: center;

      color: #071d3a;

      gap: 6px;

    }


    .lds-photo-placeholder span {

      font-size: 70px;

    }


    .lds-photo-placeholder small {

      font-size: 13px;

      font-weight: 800;

    }


    .lds-photo-caption {

      margin-top: 12px;

      color: #687284;

      font-size: 12px;

      font-weight: 900;

      letter-spacing: 2px;

    }


    /* =====================================================
       DATOS
    ===================================================== */

    .lds-student-info h1 {

      margin: 0 0 10px;

      font-family: Georgia, serif;

      font-size: clamp(
        25px,
        3vw,
        40px
      );

      line-height: 1.08;

      color: #071d3a;

    }


    .lds-student-code {

      display: inline-block;

      padding: 8px 15px;

      border-radius: 25px;

      background: #edf2f7;

      font-size: 14px;

      font-weight: 900;

      margin-bottom: 20px;

    }


    .lds-info-grid {

      display: grid;

      grid-template-columns:
        repeat(3, 1fr);

      gap: 12px;

    }


    .lds-info-item {

      min-height: 78px;

      padding: 12px;

      border-radius: 17px;

      background: #f4f6f9;

      display: flex;

      align-items: center;

      gap: 10px;

    }


    .lds-info-icon {

      width: 40px;

      height: 40px;

      border-radius: 50%;

      background: white;

      display: flex;

      align-items: center;

      justify-content: center;

      font-size: 21px;

      flex-shrink: 0;

    }


    .lds-info-item div:last-child {

      min-width: 0;

    }


    .lds-info-item span {

      display: block;

      color: #7a8390;

      font-size: 11px;

      font-weight: 700;

      margin-bottom: 3px;

    }


    .lds-info-item strong {

      display: block;

      color: #071d3a;

      font-size: 14px;

      line-height: 1.1;

    }


    /* =====================================================
       CUENTA
    ===================================================== */

    .lds-account {

      padding: 25px;

      border-radius: 27px;

      background: #071d3a;

      box-shadow:
        0 10px 30px
        rgba(7,29,58,.17);

    }


    .lds-account-heading {

      display: flex;

      align-items: center;

      justify-content: center;

      gap: 10px;

      color: white;

      font-size: 20px;

      margin-bottom: 20px;

    }


    .lds-account-grid {

      display: grid;

      grid-template-columns:
        repeat(3, 1fr);

      gap: 13px;

    }


    .lds-money {

      border-radius: 19px;

      padding: 18px;

      display: flex;

      align-items: center;

      gap: 14px;

      background:
        rgba(255,255,255,.08);

      color: white;

    }


    .lds-money.balance {

      background: #f4c400;

      color: #071d3a;

    }


    .lds-money-icon {

      width: 48px;

      height: 48px;

      border-radius: 50%;

      background: rgba(255,255,255,.15);

      display: flex;

      align-items: center;

      justify-content: center;

      font-size: 28px;

      font-weight: 900;

      flex-shrink: 0;

    }


    .income .lds-money-icon {

      background: #18a765;

    }


    .expense .lds-money-icon {

      background: #cf142b;

    }


    .lds-money-info span {

      display: block;

      font-size: 12px;

      opacity: .8;

      margin-bottom: 4px;

    }


    .lds-money-info strong {

      font-size: 22px;

    }


    .income .lds-money-info strong {

      color: #55e49a;

    }


    .expense .lds-money-info strong {

      color: #ff7d8b;

    }


    .balance .lds-money-info strong {

      color: #071d3a;

    }


    /* =====================================================
       BOTONES
    ===================================================== */

    .lds-actions {

      display: grid;

      grid-template-columns:
        1fr 1fr;

      gap: 15px;

      margin: 18px 0;

    }


    .lds-action {

      border: none;

      border-radius: 19px;

      padding: 17px 25px;

      color: white;

      cursor: pointer;

      display: flex;

      align-items: center;

      justify-content: center;

      gap: 13px;

      transition:
        transform .2s,
        box-shadow .2s;

    }


    .lds-action:hover {

      transform:
        translateY(-2px);

      box-shadow:
        0 8px 20px
        rgba(0,0,0,.15);

    }


    .lds-action.cobrar {

      background: #198754;

    }


    .lds-action.pagar {

      background: #cf142b;

    }


    .lds-action-icon {

      font-size: 27px;

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


    /* =====================================================
       MOVIMIENTOS
    ===================================================== */

    .lds-movimientos {

      padding: 20px;

      border-radius: 23px;

      background: #f3f6fa;

    }


    .lds-movimientos-header {

      display: flex;

      align-items: center;

      justify-content: space-between;

      margin-bottom: 13px;

    }


    .lds-movimientos-header > div {

      display: flex;

      align-items: center;

      gap: 9px;

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
        1fr
        auto;

      align-items: center;

      gap: 13px;

      padding: 14px;

      border-radius: 16px;

      background: white;

      box-shadow:
        0 2px 9px
        rgba(0,0,0,.05);

    }


    .lds-mov-icon {

      width: 46px;

      height: 46px;

      border-radius: 14px;

      display: flex;

      align-items: center;

      justify-content: center;

      font-size: 22px;

    }


    .mov-ingreso .lds-mov-icon {

      background: #dcf8e9;

    }


    .mov-egreso .lds-mov-icon {

      background: #ffe5e9;

    }


    .lds-mov-info {

      display: flex;

      flex-direction: column;

      gap: 3px;

      min-width: 0;

    }


    .lds-mov-info strong {

      color: #071d3a;

      font-size: 14px;

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

      gap: 4px;

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

      font-size: 9px;

      font-weight: 900;

      color: #778190;

    }


    /* =====================================================
       SIN MOVIMIENTOS
    ===================================================== */

    .lds-sin-movimientos {

      padding: 30px;

      text-align: center;

      display: flex;

      flex-direction: column;

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


    /* =====================================================
       SEGURIDAD
    ===================================================== */

    .lds-security {

      margin-top: 18px;

      padding: 15px 20px;

      border-radius: 20px;

      background: #f1f5fa;

      color: #17477f;

      display: flex;

      align-items: center;

      justify-content: center;

      gap: 9px;

      text-align: center;

      font-size: 12px;

      font-weight: 700;

    }


    .lds-security span:first-child {

      font-size: 20px;

    }


    /* =====================================================
       RESPONSIVE
    ===================================================== */

    @media(max-width: 800px) {

      .lds-student-header {

        grid-template-columns: 1fr;

        text-align: center;

      }


      .lds-info-grid {

        grid-template-columns: 1fr;

        text-align: left;

      }


      .lds-account-grid {

        grid-template-columns: 1fr;

      }


      .lds-money.balance {

        order: -1;

      }

    }


    @media(max-width: 600px) {

      .lds-ficha {

        padding: 15px;

      }


      .lds-student-header {

        padding-left: 0;

        padding-right: 0;

      }


      .lds-actions {

        grid-template-columns: 1fr;

      }


      .lds-movimiento {

        grid-template-columns:
          45px
          1fr;

      }


      .lds-mov-monto {

        grid-column: 2;

        text-align: left;

        flex-direction: row;

        align-items: center;

      }


      .lds-ficha-titulo h2 {

        font-size: 21px;

      }

    }

  `;


  document.head.appendChild(
    style
  );

}


// ============================================================
// CARGAR CÓDIGO DESDE LA URL
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
