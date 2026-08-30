const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const money = n =>
  new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(n) || 0) + ' LDS';

function openModal(id) {
  $(id).classList.remove('hidden');
}

function closeModal(el) {
  const modal = el.closest('.modal');
  if (modal) modal.classList.add('hidden');

  if (modal && modal.id === 'scannerModal') {
    stopScanner();
  }
}

$$('[data-close]').forEach(b => {
  b.onclick = () => closeModal(b);
});

$$('.modal').forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) {
      m.classList.add('hidden');

      if (m.id === 'scannerModal') {
        stopScanner();
      }
    }
  });
});

function findStudent(raw) {
  let c = (raw || '').trim().toUpperCase();

  const match = c.match(/LDS[-_ ]?EST[-_ ]?(\d{1,3})/);

  if (match) {
    c = `LDS-EST-${match[1].padStart(3, '0')}`;
  }

  return STUDENTS.find(s => s.codigo === c);
}

function showStudent(s) {
  if (!s) {
    alert('No se encontró ese estudiante.');
    return;
  }

  $('#profileContent').innerHTML = `
    <div class="profile-head">
      <div class="avatar">
        ${
          s.foto
            ? `<img src="assets/${s.foto}" onerror="this.style.display='none'">`
            : ''
        }
      </div>

      <div>
        <span class="badge">${s.codigo}</span>
        <h2>${s.nombres || 'Estudiante'} ${s.apellidos || ''}</h2>
        <p>${s.grado || 'Sin grado'} · ${s.seccion || 'Sin sección'}</p>
      </div>
    </div>

    <div class="balance">
      <small>Saldo disponible</small>
      <strong>${money(s.saldo)}</strong>
    </div>

    <div class="grid">
      <div>
        <span>Sueldo base</span>
        <b>${money(s.sueldo)}</b>
      </div>

      <div>
        <span>Ingresos adicionales</span>
        <b>${money(s.ingresos)}</b>
      </div>

      <div>
        <span>Bonificaciones</span>
        <b>${money(s.bonificaciones)}</b>
      </div>

      <div>
        <span>Egresos</span>
        <b>${money(s.egresos)}</b>
      </div>

      <div>
        <span>Ahorro</span>
        <b>${money(s.ahorro)}</b>
      </div>

      <div>
        <span>Consecuencias</span>
        <b>${money(s.consecuencias)}</b>
      </div>
    </div>

    <button class="primary" onclick="alert('Módulo de movimientos: lo conectaremos a Google Sheets en la siguiente fase.')">
      Ver movimientos
    </button>
  `;

  openModal('#profileModal');
}


/* =========================================================
   LECTOR QR AUTOMÁTICO
   ========================================================= */

let scanner = null;
let scannerRunning = false;
let processingQR = false;

async function stopScanner() {
  if (!scanner) {
    scannerRunning = false;
    processingQR = false;
    return;
  }

  try {
    if (scannerRunning) {
      await scanner.stop();
    }
  } catch (error) {
    console.warn('No fue posible detener el lector:', error);
  }

  try {
    scanner.clear();
  } catch (error) {
    console.warn('No fue posible limpiar el lector:', error);
  }

  scanner = null;
  scannerRunning = false;
  processingQR = false;

  const reader = $('#reader');
  if (reader) {
    reader.innerHTML = '';
  }
}

async function startScanner() {
  if (scannerRunning) return;

  const status = $('#scanStatus');

  try {
    status.textContent = 'Activando cámara…';

    if (typeof Html5Qrcode === 'undefined') {
      status.textContent = 'Cargando lector QR…';

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (typeof Html5Qrcode === 'undefined') {
        throw new Error('La librería QR no se cargó.');
      }
    }

    scanner = new Html5Qrcode('reader');

    status.textContent = 'Solicitando acceso a la cámara…';

    /*
      Primero obtenemos las cámaras disponibles.
      Elegimos automáticamente la cámara trasera
      cuando el teléfono la identifica.
    */
    const cameras = await Html5Qrcode.getCameras();

    if (!cameras || cameras.length === 0) {
      throw new Error('No se encontró ninguna cámara.');
    }

    let cameraId = cameras[0].id;

    const backCamera = cameras.find(camera =>
      /back|rear|environment|trasera|posterior/i.test(camera.label || '')
    );

    if (backCamera) {
      cameraId = backCamera.id;
    }

    status.textContent = 'Cámara activa. Buscando código QR…';

    await scanner.start(
      cameraId,
      {
        fps: 15,
        qrbox: {
          width: 280,
          height: 280
        },
        aspectRatio: 1.0
      },

      async decodedText => {
        if (processingQR) return;

        processingQR = true;

        status.textContent = '¡Código QR detectado!';

        const student = findStudent(decodedText);

        await stopScanner();

        $('#scannerModal').classList.add('hidden');

        showStudent(student);
      },

      errorMessage => {
        /*
          Los errores normales de búsqueda se ignoran.
          El lector continúa buscando automáticamente.
        */
      }
    );

    scannerRunning = true;

    status.textContent = 'Cámara activa. Apunta al código QR del estudiante.';

  } catch (error) {
    console.error('Error del lector QR:', error);

    await stopScanner();

    status.textContent =
      'No se pudo iniciar el lector QR. Comprueba que el navegador tenga permiso para usar la cámara.';
  }
}


/* BOTÓN ESCANEAR QR */

$('#scanBtn').onclick = async () => {
  openModal('#scannerModal');

  $('#scanStatus').textContent = 'Preparando cámara…';

  await startScanner();
};


/* =========================================================
   INGRESAR CÓDIGO
   ========================================================= */

$('#codeBtn').onclick = () => {
  openModal('#codeModal');

  setTimeout(() => {
    $('#codeInput').focus();
  }, 100);
};

$('#findCode').onclick = () => {
  const student = findStudent($('#codeInput').value);

  if (!student) {
    $('#codeStatus').textContent =
      'No se encontró un estudiante con ese código.';
    return;
  }

  $('#codeStatus').textContent = '';

  $('#codeModal').classList.add('hidden');

  showStudent(student);
};

$('#codeInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    $('#findCode').click();
  }
});


/* =========================================================
   ADMINISTRADOR
   ========================================================= */

$('#adminBtn').onclick = () => {
  openModal('#adminModal');
};

$('#adminLogin').onclick = () => {
  if ($('#pinInput').value === CONFIG.PIN_ADMIN) {
    $('#adminModal').classList.add('hidden');

    alert(
      'Acceso de administrador correcto. El panel administrativo lo construiremos en la siguiente fase.'
    );
  } else {
    $('#adminStatus').textContent = 'PIN incorrecto.';
  }
};
