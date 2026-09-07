/* ============================================================
   BANCO LDS 360 - APP.JS
   IEP LA SALLE DEL SUR
   ============================================================ */

const BANCO_LDS_API_URL =
  "https://script.google.com/macros/s/AKfycbyybdIHgP7-e7wklexc5koIw1atMWxIIFrrzZGHYB4g2Vr8Q3zakdL4Zhs8FRrWNADu/exec";

let estudianteActual = null;

/* =========================
   UTILIDADES
   ========================= */

const $ = (id) => document.getElementById(id);

function esc(valor) {
  return String(valor ?? "").replace(/[&<>'"]/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[c]));
}

function normalizar(valor) {
  return String(valor ?? "").trim().toUpperCase();
}

function dinero(valor) {
  return Number(valor || 0).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " LDS";
}

/* =========================
   CONEXIÓN CON APPS SCRIPT
   ========================= */

async function api(parametros, tiempo = 15000) {

  const controlador = new AbortController();

  const temporizador = setTimeout(() => {
    controlador.abort();
  }, tiempo);

  try {

    const url =
      BANCO_LDS_API_URL +
      "?" +
      new URLSearchParams({
        ...parametros,
        _: Date.now()
      });

    const respuesta = await fetch(url, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      signal: controlador.signal,
      headers: {
        Accept: "application/json"
      }
    });

    const texto = await respuesta.text();

    if (!respuesta.ok) {
      throw new Error("HTTP " + respuesta.status);
    }

    let datos;

    try {
      datos = JSON.parse(texto);
    } catch (error) {
      console.error("Respuesta recibida:", texto);
      throw new Error(
        "El Web App no devolvió JSON válido."
      );
    }

    return datos;

  } finally {

    clearTimeout(temporizador);

  }
}

/* =========================
   CONSULTAR ESTUDIANTE
   ========================= */

async function consultarEstudiante(codigo) {

  codigo = normalizar(codigo);

  if (!codigo) {
    mostrarError("Ingrese el código del estudiante.");
    return;
  }

  mostrarCarga(
    true,
    "Consultando Banco LDS 360..."
  );

  try {

    const datos = await api({
      codigo: codigo
    });

    console.log("Respuesta estudiante:", datos);

    if (datos.ok === false) {
      throw new Error(
        datos.mensaje ||
        datos.message ||
        "Error del servidor."
      );
    }

    if (datos.encontrado !== true) {
      throw new Error(
        datos.mensaje ||
        "No se encontró el estudiante: " + codigo
      );
    }

    if (!datos.estudiante) {
      throw new Error(
        "La respuesta no contiene los datos del estudiante."
      );
    }

    estudianteActual = datos;

    renderFicha(datos);

  } catch (error) {

    console.error(error);

    mostrarError(
      error.name === "AbortError"
        ? "La consulta tardó demasiado."
        : error.message ||
          "No se pudo conectar con Banco LDS 360."
    );

  } finally {

    mostrarCarga(false);

  }
}

/* =========================
   MOSTRAR FICHA
   ========================= */

function renderFicha(datos) {

  const estudiante =
    datos.estudiante || {};

  const cuenta =
    datos.cuenta || {};

  const movimientos =
    Array.isArray(datos.movimientos)
      ? datos.movimientos
      : [];

  const modal = $("modal");
  const contenido = $("profileContent");

  if (!modal || !contenido) {
    console.error(
      "Faltan modal o profileContent en index.html"
    );
    return;
  }

  modal.classList.add("show");

  contenido.innerHTML = `

    <div class="profile">

      <button
        class="close"
        onclick="cerrarFicha()"
        type="button"
      >
        ×
      </button>

      <div class="studentHead">

        <div class="photo">

          ${
            estudiante.fotoUrl ||
            estudiante.foto
              ? `
                <img
                  src="${esc(
                    prepararFoto(
                      estudiante.fotoUrl ||
                      estudiante.foto
                    )
                  )}"
                  alt="Foto del estudiante"
                  onerror="
                    this.parentElement.innerHTML='👤'
                  "
                >
              `
              : "👤"
          }

        </div>

        <div>

          <div class="tag">
            ESTUDIANTE LDS
          </div>

          <h2>
            ${esc(
              estudiante.nombreCompleto ||
              (
                (estudiante.nombre || "") +
                " " +
                (estudiante.apellido || "")
              ).trim()
            )}
          </h2>

          <p>
            ${esc(estudiante.codigo || "")}
          </p>

        </div>

      </div>

      <div class="info">

        <div>
          <b>GRADO</b>
          <span>
            ${esc(estudiante.grado || "")}
          </span>
        </div>

        <div>
          <b>SECCIÓN</b>
          <span>
            ${esc(estudiante.seccion || "")}
          </span>
        </div>

        <div>
          <b>DOCENTE</b>
          <span>
            ${esc(estudiante.docente || "")}
          </span>
        </div>

      </div>

      <div class="balances">

        <div>
          <small>INGRESOS</small>
          <strong class="in">
            ${dinero(cuenta.totalIngresos)}
          </strong>
        </div>

        <div>
          <small>EGRESOS</small>
          <strong class="out">
            ${dinero(cuenta.totalEgresos)}
          </strong>
        </div>

        <div>
          <small>SALDO ACTUAL</small>
          <strong>
            ${dinero(cuenta.saldoActual)}
          </strong>
        </div>

      </div>

      <div class="actions">

        <button
          class="cobrar"
          type="button"
          onclick="abrirOperacion('INGRESO')"
        >
          💰 COBRAR
        </button>

        <button
          class="pagar"
          type="button"
          onclick="abrirOperacion('EGRESO')"
        >
          💳 PAGAR
        </button>

      </div>

      <h3>
        📋 MOVIMIENTOS
        <span>${movimientos.length}</span>
      </h3>

      <div class="movs">

        ${
          movimientos.length
            ? movimientos
                .map((movimiento) =>
                  movimientoHTML(movimiento)
                )
                .join("")
            : `
              <div class="empty">
                No hay movimientos registrados.
              </div>
            `
        }

      </div>

    </div>
  `;
}

/* =========================
   MOVIMIENTOS
   ========================= */

function movimientoHTML(movimiento) {

  const tipo =
    normalizar(
      movimiento.tipoMovimiento ||
      movimiento.tipo
    );

  const ingreso =
    tipo === "INGRESO";

  const monto =
    movimiento.monto ??
    movimiento.montoLDS ??
    0;

  return `

    <div class="mov">

      <div>
        ${ingreso ? "💰" : "💸"}
      </div>

      <section>

        <b>
          ${esc(
            movimiento.concepto ||
            "Sin concepto"
          )}
        </b>

        <small>
          ${esc(
            movimiento.responsable ||
            ""
          )}
        </small>

        ${
          movimiento.observacion
            ? `
              <small>
                ${esc(
                  movimiento.observacion
                )}
              </small>
            `
            : ""
        }

      </section>

      <strong class="${ingreso ? "in" : "out"}">

        ${ingreso ? "+" : "-"}

        ${dinero(monto)}

      </strong>

    </div>
  `;
}

/* =========================
   FOTO
   ========================= */

function prepararFoto(url) {

  const direccion =
    String(url || "").trim();

  if (!direccion) {
    return "";
  }

  const coincidencia =
    direccion.match(
      /(?:\/d\/|id=)([A-Za-z0-9_-]+)/
    );

  if (coincidencia) {

    return (
      "https://drive.google.com/thumbnail?id=" +
      encodeURIComponent(coincidencia[1]) +
      "&sz=w600"
    );

  }

  return direccion;
}

/* =========================
   ABRIR COBRAR / PAGAR
   ========================= */

async function abrirOperacion(tipo) {

  if (!estudianteActual) {
    return;
  }

  const modal =
    $("operationModal");

  if (!modal) {
    mostrarError(
      "No se encontró operationModal en index.html."
    );
    return;
  }

  const opciones =
    await obtenerOpciones();

  const saldo =
    Number(
      estudianteActual.cuenta?.saldoActual || 0
    );

  modal.classList.add("show");

  $("opTipo").textContent =
    tipo === "INGRESO"
      ? "COBRAR"
      : "PAGAR";

  $("opTipoHidden").value =
    tipo;

  $("opSaldo").textContent =
    dinero(saldo);

  $("opConcepto").innerHTML =
    '<option value="">Seleccione un concepto</option>';

  construirOpciones(
    $("opConcepto"),
    opciones,
    tipo
  );

  $("otroConcepto").value = "";
  $("otroWrap").style.display = "none";

  $("opMonto").value = "";
  $("opResponsable").value = "";
  $("opObservacion").value = "";
  $("opMensaje").textContent = "";

  $("opConcepto").onchange = function () {

    $("otroWrap").style.display =
      this.value === "Otro..."
        ? "block"
        : "none";

  };
}

/* =========================
   OBTENER OPCIONES
   ========================= */

async function obtenerOpciones() {

  try {

    const datos =
      await api({
        accion: "opciones"
      });

    console.log(
      "Opciones recibidas:",
      datos
    );

    /*
      Aceptamos las tres formas posibles
      para evitar incompatibilidades:
      - datos.opciones
      - datos.catalogo
      - datos directamente
    */

    if (
      datos &&
      datos.opciones !== undefined
    ) {
      return datos.opciones;
    }

    if (
      datos &&
      datos.catalogo !== undefined
    ) {
      return datos.catalogo;
    }

    return datos;

  } catch (error) {

    console.error(
      "Error obteniendo opciones:",
      error
    );

    return {};

  }
}

/* =========================
   CONSTRUIR CONCEPTOS
   ========================= */

function construirOpciones(
  select,
  opciones,
  tipo
) {

  if (!select) {
    return;
  }

  const grupos = {};

  /* FORMATO ARRAY */

  if (Array.isArray(opciones)) {

    opciones.forEach((fila) => {

      if (
        !fila ||
        typeof fila !== "object"
      ) {
        return;
      }

      Object.entries(fila)
        .forEach(([categoria, valor]) => {

          if (
            valor &&
            clasificarConcepto(
              categoria,
              valor
            ) === tipo
          ) {

            if (!grupos[categoria]) {
              grupos[categoria] = [];
            }

            grupos[categoria].push(
              String(valor)
            );
          }

        });

    });

  }

  /* FORMATO OBJETO */

  else if (
    opciones &&
    typeof opciones === "object"
  ) {

    Object.entries(opciones)
      .forEach(([categoria, valores]) => {

        const lista =
          Array.isArray(valores)
            ? valores
            : [valores];

        lista.forEach((valor) => {

          if (
            valor &&
            clasificarConcepto(
              categoria,
              valor
            ) === tipo
          ) {

            if (!grupos[categoria]) {
              grupos[categoria] = [];
            }

            grupos[categoria].push(
              String(valor)
            );
          }

        });

      });

  }

  Object.entries(grupos)
    .forEach(([categoria, valores]) => {

      const grupo =
        document.createElement(
          "optgroup"
        );

      grupo.label =
        categoria
          .replaceAll("_", " ");

      [
        ...new Set(valores)
      ].forEach((valor) => {

        const opcion =
          document.createElement(
            "option"
          );

        opcion.value = valor;
        opcion.textContent = valor;

        grupo.appendChild(
          opcion
        );

      });

      select.appendChild(
        grupo
      );

    });

  /* OTRO SIEMPRE DISPONIBLE */

  const otro =
    document.createElement(
      "option"
    );

  otro.value = "Otro...";
  otro.textContent = "Otro...";

  select.appendChild(
    otro
  );
}

/* =========================
   CLASIFICAR CONCEPTO
   ========================= */

function clasificarConcepto(
  categoria,
  valor
) {

  const c =
    normalizar(categoria);

  const v =
    normalizar(valor);

  if (
    c === "INGRESOS_Y_SUELDOS" ||
    c === "PREMIOS_Y_BONIFICACIONES"
  ) {
    return "INGRESO";
  }

  if (
    c === "AHORROS_E_INVERSIONES"
  ) {

    if (
      v.startsWith(
        "RETIRO DE AHORROS"
      )
    ) {
      return "INGRESO";
    }

    return "EGRESO";
  }

  if (
    c === "PAGOS_Y_GASTOS" ||
    c === "SANCIONES_Y_MULTAS" ||
    c === "COSTOS_Y_OTROS"
  ) {
    return "EGRESO";
  }

  return "";
}

/* =========================
   REGISTRAR OPERACIÓN
   ========================= */

async function registrarOperacion() {

  if (!estudianteActual) {
    return;
  }

  const tipo =
    $("opTipoHidden").value;

  let concepto =
    $("opConcepto").value;

  if (concepto === "Otro...") {

    concepto =
      $("otroConcepto")
        .value
        .trim();

  }

  const monto =
    Number(
      String(
        $("opMonto").value
      ).replace(",", ".")
    );

  const responsable =
    $("opResponsable")
      .value
      .trim() ||
    "BANCO LDS 360";

  const observacion =
    $("opObservacion")
      .value
      .trim();

  const saldo =
    Number(
      estudianteActual
        .cuenta
        ?.saldoActual || 0
    );

  /* VALIDAR CONCEPTO */

  if (!concepto) {

    $("opMensaje").textContent =
      "Seleccione o escriba un concepto.";

    return;
  }

  /* VALIDAR MONTO */

  if (
    !Number.isFinite(monto) ||
    monto <= 0
  ) {

    $("opMensaje").textContent =
      "Ingrese un monto válido mayor que 0.";

    return;
  }

  /* VALIDAR SALDO */

  if (
    tipo === "EGRESO" &&
    monto > saldo
  ) {

    $("opMensaje").textContent =
      "No puede pagar más que el saldo disponible.";

    return;
  }

  $("opMensaje").textContent =
    "Registrando movimiento...";

  try {

    const datos =
      await api({

        accion:
          "registrarmovimiento",

        codigo:
          estudianteActual
            .estudiante
            .codigo,

        tipo:
          tipo,

        concepto:
          concepto,

        monto:
          monto,

        responsable:
          responsable,

        observacion:
          observacion

      });

    console.log(
      "Respuesta registro:",
      datos
    );

    if (
      datos.ok === false ||
      datos.exito === false
    ) {

      throw new Error(
        datos.mensaje ||
        datos.message ||
        "No se pudo registrar el movimiento."
      );

    }

    cerrarOperacion();

    /*
      Volvemos a consultar al estudiante
      para actualizar inmediatamente:
      INGRESOS
      EGRESOS
      SALDO
      MOVIMIENTOS
    */

    await consultarEstudiante(
      estudianteActual
        .estudiante
        .codigo
    );

  } catch (error) {

    console.error(error);

    $("opMensaje").textContent =
      error.message ||
      "No se pudo registrar el movimiento.";

  }
}

/* =========================
   INGRESAR CÓDIGO
   ========================= */

function ingresarCodigo() {

  const codigo =
    prompt(
      "Ingrese el código del estudiante:"
    );

  if (codigo) {
    consultarEstudiante(
      codigo
    );
  }
}

/* =========================
   ESCÁNER
   ========================= */

function abrirEscaner() {

  alert(
    "📷 Para probar el sistema ahora, use INGRESAR CÓDIGO. El lector QR utilizará este mismo flujo de consulta."
  );

}

/* =========================
   CERRAR FICHA
   ========================= */

function cerrarFicha() {

  const modal =
    $("modal");

  if (modal) {
    modal.classList.remove(
      "show"
    );
  }

}

/* =========================
   CERRAR OPERACIÓN
   ========================= */

function cerrarOperacion() {

  const modal =
    $("operationModal");

  if (modal) {
    modal.classList.remove(
      "show"
    );
  }

}

/* =========================
   CARGANDO
   ========================= */

function mostrarCarga(
  mostrar,
  texto = ""
) {

  const loading =
    $("loading");

  const loadingText =
    $("loadingText");

  if (loading) {

    loading.classList.toggle(
      "show",
      mostrar
    );

  }

  if (loadingText) {

    loadingText.textContent =
      texto;

  }

}

/* =========================
   ERROR
   ========================= */

function mostrarError(
  mensaje
) {

  const errorText =
    $("errorText");

  const errorBox =
    $("errorBox");

  if (!errorText || !errorBox) {

    alert(mensaje);

    return;
  }

  errorText.textContent =
    mensaje;

  errorBox.classList.add(
    "show"
  );

  setTimeout(() => {

    errorBox.classList.remove(
      "show"
    );

  }, 5000);

}

/* =========================
   FUNCIONES GLOBALES
   ========================= */

window.consultarEstudiante =
  consultarEstudiante;

window.ingresarCodigo =
  ingresarCodigo;

window.abrirEscaner =
  abrirEscaner;

window.abrirOperacion =
  abrirOperacion;

window.cerrarFicha =
  cerrarFicha;

window.cerrarOperacion =
  cerrarOperacion;

window.registrarOperacion =
  registrarOperacion;
