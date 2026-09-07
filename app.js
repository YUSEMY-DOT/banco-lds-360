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

async function cargarConceptosOperacion(tipo, select) {
  if (!select) return false;

  select.innerHTML = '<option value="">Cargando conceptos...</option>';
  select.disabled = true;

  try {
    const url =
      BANCO_LDS_API_URL +
      '?accion=opciones&t=' +
      Date.now();

    const respuesta = await fetch(url, {
      method: 'GET',
      cache: 'no-store'
    });

    if (!respuesta.ok) {
      throw new Error('No se pudo cargar CONFIG_OPCIONES.');
    }

    const datos = await respuesta.json();

    if (!datos.ok || !Array.isArray(datos.opciones)) {
      throw new Error(datos.mensaje || 'CONFIG_OPCIONES no devolvió un catálogo válido.');
    }

    const grupos = {};

    datos.opciones.forEach(fila => {
      Object.keys(fila || {}).forEach(clave => {
        const valor = String(fila[clave] == null ? '' : fila[clave]).trim();
        if (!valor) return;

        const tipoOpcion = clasificarConceptoOperacion(clave, valor);
        if (tipoOpcion !== tipo) return;

        const nombreGrupo = nombreGrupoConcepto(clave);
        if (!grupos[nombreGrupo]) grupos[nombreGrupo] = [];
        if (!grupos[nombreGrupo].includes(valor)) {
          grupos[nombreGrupo].push(valor);
        }
      });
    });

    select.innerHTML = '<option value="">Seleccione un concepto</option>';

    Object.keys(grupos).forEach(grupo => {
      const valores = grupos[grupo];
      if (!valores.length) return;

      const optgroup = document.createElement('optgroup');
      optgroup.label = grupo;

      valores.forEach(valor => {
        const option = document.createElement('option');
        option.value = valor;
        option.textContent = valor;
        optgroup.appendChild(option);
      });

      select.appendChild(optgroup);
    });

    const otro = document.createElement('option');
    otro.value = 'Otro...';
    otro.textContent = 'Otro...';
    select.appendChild(otro);

    if (select.options.length <= 2) {
      throw new Error(
        'No hay conceptos configurados para ' +
        (tipo === 'INGRESO' ? 'COBRAR' : 'PAGAR') +
        ' en CONFIG_OPCIONES.'
      );
    }

    select.disabled = false;
    return true;

  } catch (error) {
    console.error('Error cargando CONFIG_OPCIONES:', error);
    select.innerHTML = '<option value="">No se pudieron cargar los conceptos</option>';

    const mensaje = document.getElementById('operacionMensaje');
    if (mensaje) {
      mensaje.textContent = error.message || 'No se pudieron cargar los conceptos.';
      mensaje.className = 'lds-operacion-mensaje error';
    }

    return false;
  }
}

function clasificarConceptoOperacion(clave, valor) {
  const categoria = String(clave || '').trim().toUpperCase();
  const texto = String(valor || '').trim().toUpperCase();

  if (categoria === 'INGRESOS_Y_SUELDOS') return 'INGRESO';
  if (categoria === 'PREMIOS_Y_BONIFICACIONES') return 'INGRESO';

  if (categoria === 'AHORROS_E_INVERSIONES') {
    if (texto.indexOf('RETIRO DE AHORROS') === 0) return 'INGRESO';
    return 'EGRESO';
  }

  if (categoria === 'PAGOS_Y_GASTOS') return 'EGRESO';
  if (categoria === 'SANCIONES_Y_MULTAS') return 'EGRESO';
  if (categoria === 'COSTOS_Y_OTROS') return 'EGRESO';

  return '';
  function nombreGrupoConcepto(clave) {
  const nombres = {
    INGRESOS_Y_SUELDOS: 'INGRESOS Y SUELDOS',
    PREMIOS_Y_BONIFICACIONES: 'PREMIOS Y BONIFICACIONES',
    AHORROS_E_INVERSIONES: 'AHORROS E INVERSIONES',
    PAGOS_Y_GASTOS: 'PAGOS Y GASTOS',
    SANCIONES_Y_MULTAS: 'SANCIONES Y MULTAS',
    COSTOS_Y_OTROS: 'COSTOS Y OTROS'
  };

  return nombres[String(clave || '').trim().toUpperCase()] || String(clave || 'OTROS');
}

// ============================================================
// COBRAR / PAGAR
// ============================================================

async function abrirOperacion(tipo) {
  tipo = String(tipo || '').toUpperCase();

  if (!estudianteActual || !estudianteActual.estudiante) {
    alert('Primero seleccione un estudiante.');
    return;
  }

  if (tipo !== 'INGRESO' && tipo !== 'EGRESO') {
    alert('Tipo de operación no válido.');
    return;
  }

  const estudiante = estudianteActual.estudiante || {};
  const cuenta = estudianteActual.cuenta || {};
  const nombre = estudiante.nombreCompleto || '';
  const codigo = estudiante.codigo || '';
  const saldo = Number(cuenta.saldoActual || 0);

  const titulo = tipo === 'INGRESO' ? '💰 COBRAR' : '💸 PAGAR';
  const textoTipo = tipo === 'INGRESO' ? 'Registrar ingreso' : 'Registrar egreso';

  const anterior = document.getElementById('operacionLDS360');
  if (anterior) anterior.remove();

  const overlay = document.createElement('div');
  overlay.id = 'operacionLDS360';
  overlay.innerHTML = `
    <div class="lds-operacion-box" role="dialog" aria-modal="true" aria-labelledby="tituloOperacionLDS">
      <button type="button" class="lds-operacion-cerrar" onclick="cerrarOperacion()" aria-label="Cerrar">×</button>

      <div class="lds-operacion-head">
        <div class="lds-operacion-icon">${tipo === 'INGRESO' ? '💰' : '💸'}</div>
        <div>
          <h2 id="tituloOperacionLDS">${titulo}</h2>
          <p>${escaparHTML(nombre)}</p>
          <small>${escaparHTML(codigo)}</small>
        </div>
      </div>

      <div class="lds-operacion-saldo">
        <span>Saldo actual</span>
        <strong>${formatearLDS(saldo)} LDS</strong>
      </div>

      <form onsubmit="guardarOperacion(event, '${tipo}')" autocomplete="off">
        <label for="operacionConcepto">Concepto</label>
        <select id="operacionConcepto" name="concepto" required disabled>
          <option value="">Cargando conceptos...</option>
        </select>

        <div id="operacionConceptoOtroWrap" style="display:none;">
          <label for="operacionConceptoOtro">Especifique el concepto</label>
          <input id="operacionConceptoOtro" name="conceptoOtro" type="text" maxlength="150" placeholder="Escriba el concepto">
        </div>

        <label for="operacionMonto">Monto LDS</label>
        <input id="operacionMonto" name="monto" type="number" min="0.01" step="0.01" inputmode="decimal" required placeholder="0.00">

        <label for="operacionResponsable">Responsable</label>
        <input id="operacionResponsable" name="responsable" type="text" maxlength="100" required placeholder="Nombre del responsable">

        <label for="operacionObservacion">Observación</label>
        <textarea id="operacionObservacion" name="observacion" maxlength="300" rows="3" placeholder="Observación (opcional)"></textarea>

        <div id="operacionMensaje" class="lds-operacion-mensaje" aria-live="polite">
          Cargando conceptos desde CONFIG_OPCIONES...
        </div>

        <button id="operacionGuardar" type="submit" class="lds-operacion-guardar" disabled>
          ${textoTipo}
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);
  agregarEstilosOperacion();

  const concepto = document.getElementById('operacionConcepto');
  const boton = document.getElementById('operacionGuardar');
  const mensaje = document.getElementById('operacionMensaje');

  if (concepto) {
    concepto.addEventListener('change', function () {
      const wrap = document.getElementById('operacionConceptoOtroWrap');
      const otro = document.getElementById('operacionConceptoOtro');
      const esOtro = this.value === 'Otro...';

      if (wrap) wrap.style.display = esOtro ? 'block' : 'none';
      if (otro) {
        otro.required = esOtro;
        if (!esOtro) otro.value = '';
        if (esOtro) otro.focus();
      }
    });
  }

  const cargado = await cargarConceptosOperacion(tipo, concepto);

  if (cargado) {
    if (mensaje) {
      mensaje.textContent = 'Conceptos cargados desde CONFIG_OPCIONES.';
      mensaje.className = 'lds-operacion-mensaje';
    }
    if (boton) boton.disabled = false;
  } else {
    if (boton) boton.disabled = true;
  }

  setTimeout(() => {
    const monto = document.getElementById('operacionMonto');
    if (monto) monto.focus();
  }, 50);
}

function cerrarOperacion() {
  const modal = document.getElementById('operacionLDS360');
  if (modal) modal.remove();
}

async function guardarOperacion(event, tipo) {
  event.preventDefault();

  if (!estudianteActual || !estudianteActual.estudiante) {
    alert('No hay un estudiante seleccionado.');
    return;
  }

  const estudiante = estudianteActual.estudiante || {};
  const cuenta = estudianteActual.cuenta || {};
  const codigo = estudiante.codigo || '';
  const saldo = Number(cuenta.saldoActual || 0);

  const conceptoSelect = document.getElementById('operacionConcepto');
  const conceptoOtro = document.getElementById('operacionConceptoOtro');
  const montoInput = document.getElementById('operacionMonto');
  const responsableInput = document.getElementById('operacionResponsable');
  const observacionInput = document.getElementById('operacionObservacion');
  const boton = document.getElementById('operacionGuardar');
  const mensaje = document.getElementById('operacionMensaje');

  let concepto = conceptoSelect ? conceptoSelect.value.trim() : '';
  const monto = Number(montoInput ? montoInput.value : 0);
  const responsable = responsableInput ? responsableInput.value.trim() : '';
  const observacion = observacionInput ? observacionInput.value.trim() : '';

  if (concepto === 'Otro...') {
    concepto = conceptoOtro ? conceptoOtro.value.trim() : '';
  }

  if (!concepto) {
    mostrarMensajeOperacion('Seleccione o escriba un concepto.', true);
    return;
  }

  if (!Number.isFinite(monto) || monto <= 0) {
    mostrarMensajeOperacion('El monto debe ser mayor que 0.', true);
    return;
  }

  if (!responsable) {
    mostrarMensajeOperacion('Ingrese el responsable.', true);
    return;
  }

  if (tipo === 'EGRESO' && monto > saldo) {
    mostrarMensajeOperacion(
      'No se puede registrar el pago. El monto supera el saldo disponible de ' + formatearLDS(saldo) + ' LDS.',
      true
    );
    return;
  }

  if (boton) {
    boton.disabled = true;
    boton.textContent = 'Guardando...';
  }
  mostrarMensajeOperacion('Registrando movimiento...', false);

  try {
    const parametros = new URLSearchParams();
    parametros.set('accion', 'registrarmovimiento');
    parametros.set('codigo', codigo);
    parametros.set('tipo', tipo);
    parametros.set('concepto', concepto);
    parametros.set('monto', String(monto));
    parametros.set('responsable', responsable);
    parametros.set('observacion', observacion);
    parametros.set('t', Date.now());

    const respuesta = await fetch(BANCO_LDS_API_URL + '?' + parametros.toString(), {
      method: 'GET',
      cache: 'no-store'
    });

    if (!respuesta.ok) {
      throw new Error('El servidor no respondió correctamente.');
    }

    const datos = await respuesta.json();
    console.log('Resultado registrar movimiento:', datos);

    if (!datos.ok || datos.exito === false) {
      throw new Error(datos.mensaje || 'No se pudo registrar el movimiento.');
    }

    cerrarOperacion();
    alert(
      (tipo === 'INGRESO' ? '💰 Ingreso' : '💸 Egreso') +
      ' registrado correctamente.\n\n' +
      'Estudiante: ' + (estudiante.nombreCompleto || '') + '\n' +
      'Monto: ' + formatearLDS(monto) + ' LDS\n' +
      'Concepto: ' + concepto
    );

    await consultarEstudiante(codigo);
  } catch (error) {
    console.error('Error al registrar movimiento:', error);
    mostrarMensajeOperacion(error.message || 'No se pudo registrar el movimiento.', true);
    if (boton) {
      boton.disabled = false;
      boton.textContent = tipo === 'INGRESO' ? 'Registrar ingreso' : 'Registrar egreso';
    }
  }
}

function mostrarMensajeOperacion(texto, error) {
  const mensaje = document.getElementById('operacionMensaje');
  if (!mensaje) return;
  mensaje.textContent = texto || '';
  mensaje.className = 'lds-operacion-mensaje ' + (error ? 'error' : 'info');
}

function agregarEstilosOperacion() {
  if (document.getElementById('estilosOperacionLDS360')) return;

  const style = document.createElement('style');
  style.id = 'estilosOperacionLDS360';
  style.textContent = `
    #operacionLDS360 {
      position: fixed;
      inset: 0;
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
      background: rgba(2, 12, 27, .78);
      backdrop-filter: blur(4px);
      overflow-y: auto;
      box-sizing: border-box;
    }
    #operacionLDS360 * { box-sizing: border-box; }
    .lds-operacion-box {
      position: relative;
      width: min(560px, 100%);
      max-height: calc(100dvh - 36px);
      overflow-y: auto;
      padding: 30px;
      border-radius: 26px;
      background: #fff;
      color: #071d3a;
      box-shadow: 0 25px 80px rgba(0,0,0,.38);
      font-family: Arial, Helvetica, sans-serif;
    }
    .lds-operacion-cerrar {
      position: absolute;
      top: 12px;
      right: 15px;
      width: 40px;
      height: 40px;
      border: 0;
      border-radius: 50%;
      background: #eef2f6;
      color: #071d3a;
      font-size: 28px;
      line-height: 1;
      cursor: pointer;
    }
    .lds-operacion-head {
      display: flex;
      align-items: center;
      gap: 15px;
      padding-right: 45px;
      margin-bottom: 20px;
    }
    .lds-operacion-icon {
      width: 58px;
      height: 58px;
      min-width: 58px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #f4c400;
      font-size: 30px;
    }
    .lds-operacion-head h2 { margin: 0 0 4px; font-size: 27px; }
    .lds-operacion-head p { margin: 0 0 3px; font-weight: 800; overflow-wrap: anywhere; }
    .lds-operacion-head small { color: #687284; font-weight: 800; }
    .lds-operacion-saldo {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 15px 17px;
      margin-bottom: 20px;
      border-radius: 17px;
      background: #071d3a;
      color: #fff;
    }
    .lds-operacion-saldo span { opacity: .8; font-size: 13px; }
    .lds-operacion-saldo strong { color: #f4c400; font-size: 20px; white-space: nowrap; }
    .lds-operacion-box form { display: grid; gap: 8px; }
    .lds-operacion-box label { margin-top: 7px; font-size: 13px; font-weight: 900; }
    .lds-operacion-box input,
    .lds-operacion-box select,
    .lds-operacion-box textarea {
      width: 100%;
      border: 1px solid #d5dce5;
      border-radius: 12px;
      padding: 12px 13px;
      background: #fff;
      color: #071d3a;
      font: inherit;
      outline: none;
    }
    .lds-operacion-box input:focus,
    .lds-operacion-box select:focus,
    .lds-operacion-box textarea:focus { border-color: #071d3a; box-shadow: 0 0 0 3px rgba(7,29,58,.08); }
    .lds-operacion-box textarea { resize: vertical; min-height: 80px; }
    .lds-operacion-mensaje { min-height: 20px; padding-top: 4px; font-size: 13px; font-weight: 800; }
    .lds-operacion-mensaje.error { color: #c51f35; }
    .lds-operacion-mensaje.info { color: #526174; }
    .lds-operacion-guardar {
      width: 100%;
      min-height: 52px;
      margin-top: 8px;
      border: 0;
      border-radius: 14px;
      background: #071d3a;
      color: #fff;
      font-size: 16px;
      font-weight: 900;
      cursor: pointer;
    }
    .lds-operacion-guardar:hover { opacity: .94; }
    .lds-operacion-guardar:disabled { opacity: .55; cursor: wait; }
    @media (max-width: 600px) {
      #operacionLDS360 { padding: 0; align-items: stretch; }
      .lds-operacion-box { width: 100%; max-height: 100dvh; border-radius: 0; padding: 24px 16px 25px; }
      .lds-operacion-head h2 { font-size: 24px; }
      .lds-operacion-saldo { align-items: flex-start; flex-direction: column; }
    }
  `;
  document.head.appendChild(style);
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

      color: #071d3a;

      font-size: 14px;

      font-weight: 900;

      line-height: 1.2;

      overflow-wrap: anywhere;

      word-break: break-word;

    }


    /* ==========================================================
       CUENTA
    ========================================================== */

    .lds-account {

      width: 100% !important;

      max-width: 100% !important;

      min-width: 0 !important;

      margin:
        0 0 25px !important;

      padding:
        20px !important;

      border-radius:
        23px !important;

      background:
        #f7f9fb !important;

      border:
        1px solid #e8edf2 !important;

    }


    .lds-account-title {

      margin:
        0 0 15px !important;

      color:
        #071d3a;

      font-size:
        15px;

      font-weight:
        900;

      letter-spacing:
        .5px;

    }


    .lds-account-grid {

      width: 100% !important;

      display: grid !important;

      grid-template-columns:
        repeat(
          3,
          minmax(0, 1fr)
        ) !important;

      gap:
        12px !important;

    }


    .lds-money {

      min-width: 0 !important;

      padding:
        16px !important;

      border-radius:
        18px !important;

      display:
        flex !important;

      align-items:
        center !important;

      gap:
        11px !important;

      overflow:
        hidden !important;

    }


    .lds-money.income {

      background:
        #eef9f1 !important;

    }


    .lds-money.expense {

      background:
        #fff1f1 !important;

    }


    .lds-money.balance {

      background:
        #fff9df !important;

    }


    .lds-money-icon {

      width:
        45px !important;

      height:
        45px !important;

      min-width:
        45px !important;

      border-radius:
        50% !important;

      background:
        #ffffff !important;

      display:
        flex !important;

      align-items:
        center !important;

      justify-content:
        center !important;

      font-size:
        22px !important;

    }


    .lds-money-data {

      min-width:
        0 !important;

      overflow:
        hidden !important;

    }


    .lds-money-data span {

      display:
        block;

      margin-bottom:
        4px;

      color:
        #687284;

      font-size:
        11px;

      font-weight:
        700;

    }


    .lds-money-data strong {

      display:
        block;

      color:
        #071d3a;

      font-size:
        clamp(
          15px,
          1.8vw,
          21px
        );

      font-weight:
        900;

      white-space:
        nowrap;

    }


    /* ==========================================================
       ACCIONES
    ========================================================== */

    .lds-actions {

      width:
        100% !important;

      max-width:
        100% !important;

      display:
        grid !important;

      grid-template-columns:
        repeat(
          2,
          minmax(0, 1fr)
        ) !important;

      gap:
        14px !important;

      margin:
        0 0 25px !important;

    }


    .lds-action {

      min-width:
        0 !important;

      min-height:
        88px !important;

      padding:
        15px 18px !important;

      border:
        0 !important;

      border-radius:
        20px !important;

      display:
        flex !important;

      align-items:
        center !important;

      gap:
        13px !important;

      cursor:
        pointer !important;

      transition:
        transform .15s ease,
        box-shadow .15s ease !important;

      text-align:
        left !important;

    }


    .lds-action:hover {

      transform:
        translateY(-2px);

    }


    .lds-action.cobrar {

      background:
        #eaf8ee !important;

      color:
        #176b35 !important;

      box-shadow:
        0 7px 18px
        rgba(23,107,53,.10) !important;

    }


    .lds-action.pagar {

      background:
        #fff0f0 !important;

      color:
        #a91d2e !important;

      box-shadow:
        0 7px 18px
        rgba(169,29,46,.10) !important;

    }


    .lds-action-icon {

      width:
        54px !important;

      height:
        54px !important;

      min-width:
        54px !important;

      border-radius:
        50% !important;

      background:
        #ffffff !important;

      display:
        flex !important;

      align-items:
        center !important;

      justify-content:
        center !important;

      font-size:
        27px !important;

    }


    .lds-action-text {

      min-width:
        0 !important;

      display:
        flex;

      flex-direction:
        column;

      gap:
        4px;

    }


    .lds-action-text strong {

      font-size:
        17px;

      font-weight:
        900;

    }


    .lds-action-text small {

      font-size:
        11px;

      opacity:
        .75;

      font-weight:
        700;

    }


    /* ==========================================================
       MOVIMIENTOS
    ========================================================== */

    .lds-movimientos {

      width:
        100% !important;

      max-width:
        100% !important;

      min-width:
        0 !important;

    }


    .lds-movimientos-header {

      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        10px;

      margin:
        0 0 12px;

      color:
        #071d3a;

      font-size:
        15px;

      font-weight:
        900;

    }


    .lds-contador {

      min-width:
        28px;

      height:
        28px;

      padding:
        0 8px;

      border-radius:
        20px;

      background:
        #edf2f7;

      display:
        flex;

      align-items:
        center;

      justify-content:
        center;

      font-size:
        12px;

      font-weight:
        900;

    }


    .lds-lista-movimientos {

      display:
        grid;

      gap:
        9px;

    }


    .lds-movimiento {

      width:
        100% !important;

      min-width:
        0 !important;

      display:
        grid !important;

      grid-template-columns:
        44px
        minmax(0,1fr)
        auto !important;

      align-items:
        center !important;

      gap:
        11px !important;

      padding:
        12px !important;

      border-radius:
        16px !important;

      overflow:
        hidden !important;

    }


    .lds-movimiento.mov-ingreso {

      background:
        #f0faf3 !important;

    }


    .lds-movimiento.mov-egreso {

      background:
        #fff3f3 !important;

    }


    .lds-mov-icon {

      width:
        44px;

      height:
        44px;

      border-radius:
        50%;

      background:
        #ffffff;

      display:
        flex;

      align-items:
        center;

      justify-content:
        center;

      font-size:
        21px;

    }


    .lds-mov-info {

      min-width:
        0;

      overflow:
        hidden;

    }


    .lds-mov-info strong {

      display:
        block;

      color:
        #071d3a;

      font-size:
        13px;

      font-weight:
        900;

      line-height:
        1.25;

      overflow-wrap:
        anywhere;

    }


    .lds-mov-info span {

      display:
        block;

      margin-top:
        3px;

      color:
        #7a8390;

      font-size:
        10px;

      font-weight:
        700;

    }


    .lds-mov-info small {

      display:
        block;

      margin-top:
        3px;

      color:
        #687284;

      font-size:
        10px;

      overflow-wrap:
        anywhere;

    }


    .lds-mov-monto {

      text-align:
        right;

      min-width:
        95px;

    }


    .lds-mov-monto strong {

      display:
        block;

      font-size:
        14px;

      font-weight:
        900;

      white-space:
        nowrap;

    }


    .mov-ingreso
    .lds-mov-monto strong {

      color:
        #176b35;

    }


    .mov-egreso
    .lds-mov-monto strong {

      color:
        #a91d2e;

    }


    .lds-mov-monto span {

      display:
        block;

      margin-top:
        3px;

      color:
        #7a8390;

      font-size:
        9px;

      font-weight:
        800;

      text-transform:
        uppercase;

    }


    /* ==========================================================
       SIN MOVIMIENTOS
    ========================================================== */

    .lds-sin-movimientos {

      padding:
        30px 20px;

      border-radius:
        18px;

      background:
        #f7f9fb;

      text-align:
        center;

      color:
        #687284;

    }


    .lds-sin-movimientos span {

      display:
        block;

      margin-bottom:
        7px;

      font-size:
        35px;

    }


    .lds-sin-movimientos strong {

      display:
        block;

      color:
        #071d3a;

      font-size:
        14px;

    }


    .lds-sin-movimientos small {

      display:
        block;

      margin-top:
        4px;

      font-size:
        11px;

    }


    /* ==========================================================
       SEGURIDAD
    ========================================================== */

    .lds-security {

      margin-top:
        22px;

      padding:
        12px 14px;

      border-radius:
        14px;

      background:
        #f7f9fb;

      color:
        #687284;

      display:
        flex;

      align-items:
        flex-start;

      gap:
        8px;

      font-size:
        10px;

      line-height:
        1.4;

    }


    .lds-security span:first-child {

      font-size:
        15px;

      line-height:
        1;

    }


    /* ==========================================================
       TABLET
    ========================================================== */

    @media (
      max-width: 850px
    ) {

      #profileOverlay {

        padding:
          10px !important;

      }


      #profileOverlay #profileContent {

        width:
          calc(100vw - 20px) !important;

        max-width:
          calc(100vw - 20px) !important;

        height:
          calc(100dvh - 20px) !important;

        max-height:
          calc(100dvh - 20px) !important;

        border-radius:
          22px !important;

      }


      .lds-profile {

        padding:
          22px !important;

      }


      .lds-student-header {

        grid-template-columns:
          200px
          minmax(0,1fr) !important;

        gap:
          20px !important;

      }


      .lds-photo-frame {

        width:
          200px !important;

        height:
          170px !important;

      }


      .lds-info-list {

        grid-template-columns:
          1fr !important;

      }


      .lds-info-item {

        min-height:
          64px !important;

      }


      .lds-account-grid {

        grid-template-columns:
          1fr !important;

      }


      .lds-money-data strong {

        font-size:
          18px;

      }

    }


    /* ==========================================================
       CELULAR
    ========================================================== */

    @media (
      max-width: 600px
    ) {

      #profileOverlay {

        padding:
          0 !important;

        align-items:
          stretch !important;

      }


      #profileOverlay #profileContent {

        width:
          100vw !important;

        max-width:
          100vw !important;

        height:
          100dvh !important;

        max-height:
          100dvh !important;

        border-radius:
          0 !important;

      }


      .lds-profile {

        padding:
          18px 14px 25px !important;

      }


      .lds-student-header {

        grid-template-columns:
          1fr !important;

        gap:
          15px !important;

        margin-bottom:
          18px !important;

      }


      .lds-photo-frame {

        width:
          min(
            240px,
            80vw
          ) !important;

        height:
          min(
            190px,
            65vw
          ) !important;

      }


      .lds-student-info h1 {

        font-size:
          27px !important;

      }


      .lds-student-code {

        font-size:
          12px;

      }


      .lds-actions {

        grid-template-columns:
          1fr !important;

      }


      .lds-action {

        min-height:
          76px !important;

      }


      .lds-movimiento {

        grid-template-columns:
          40px
          minmax(0,1fr) !important;

        align-items:
          start !important;

      }


      .lds-mov-icon {

        width:
          40px;

        height:
          40px;

      }


      .lds-mov-monto {

        grid-column:
          2;

        min-width:
          0;

        text-align:
          left;

        margin-top:
          3px;

      }


      .lds-mov-monto strong {

        font-size:
          13px;

      }


      .lds-security {

        font-size:
          9px;

      }

    }


    /* ==========================================================
       PANTALLAS MUY PEQUEÑAS
    ========================================================== */

    @media (
      max-width: 380px
    ) {

      .lds-profile {

        padding:
          14px 10px 20px !important;

      }


      .lds-photo-frame {

        width:
          210px !important;

        height:
          165px !important;

      }


      .lds-student-info h1 {

        font-size:
          23px !important;

      }


      .lds-money {

        padding:
          12px !important;

      }


      .lds-money-icon {

        width:
          39px !important;

        height:
          39px !important;

        min-width:
          39px !important;

      }

    }

  `;


  document.head.appendChild(
    style
  );

}


// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    console.log(
      "Banco LDS 360 iniciado correctamente."
    );


    const inputCodigo =
      document.getElementById(
        "codigoInput"
      );


    if (inputCodigo) {

      inputCodigo.addEventListener(
        "keydown",
        function (event) {

          if (
            event.key === "Enter"
          ) {

            event.preventDefault();

            consultarEstudiante(
              inputCodigo.value
            );

          }

        }
      );

    }


    const cerrarOverlay =
      document.getElementById(
        "profileOverlay"
      );


    if (cerrarOverlay) {

      cerrarOverlay.addEventListener(
        "click",
        function (event) {

          if (
            event.target ===
            cerrarOverlay
          ) {

            cerrarFicha();

          }

        }
      );

    }


    document.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Escape"
        ) {

          const operacion =
            document.getElementById(
              "operacionLDS360"
            );


          if (operacion) {

            cerrarOperacion();

            return;

          }


          cerrarFicha();

        }

      }
    );

  }
);


// ============================================================
// FIN DEL APP.JS
// ============================================================
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

window.cerrarOperacion =
  cerrarOperacion;

window.guardarOperacion =
  guardarOperacion;


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
