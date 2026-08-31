/* =========================================================
   BANCO LDS 360 — APP.JS
   Acceso de administrador + consultas + QR
   ========================================================= */

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/* =========================================================
   UTILIDADES
   ========================================================= */

const money = (n) =>
  new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(n) || 0) + " LDS";

function openModal(id) {
  const el = $(id);
  if (el) el.classList.remove("hidden");
}

function closeModal(el) {
  const modal = el.closest(".modal");
  if (modal) modal.classList.add("hidden");
}

$$("[data-close]").forEach((b) => {
  b.onclick = () => closeModal(b);
});

$$(".modal").forEach((m) => {
  m.addEventListener("click", (e) => {
    if (e.target === m) m.classList.add("hidden");
  });
});

/* =========================================================
   ESTUDIANTES
   ========================================================= */

function findStudent(raw) {
  let c = String(raw || "").trim().toUpperCase();

  const match = c.match(
    /LDS[-_ ]?EST[-_ ]?(\d{1,3})/
  );

  if (match) {
    c = `LDS-EST-${match[1].padStart(3, "0")}`;
  }

  return STUDENTS.find((s) => s.codigo === c);
}

/* =========================================================
   GUARDAR CAMBIOS LOCALES
   ========================================================= */

function saveStudents() {
  localStorage.setItem(
    "BANCO_LDS_360_STUDENTS",
    JSON.stringify(STUDENTS)
  );
}

function loadStudents() {
  const saved = localStorage.getItem(
    "BANCO_LDS_360_STUDENTS"
  );

  if (!saved) return;

  try {
    const data = JSON.parse(saved);

    if (Array.isArray(data)) {
      data.forEach((savedStudent) => {
        const original = STUDENTS.find(
          (s) => s.codigo === savedStudent.codigo
        );

        if (original) {
          Object.assign(original, savedStudent);
        }
      });
    }
  } catch (error) {
    console.error("No se pudieron cargar los datos:", error);
  }
}

loadStudents();

/* =========================================================
   PERFIL DEL ESTUDIANTE
   ========================================================= */

function showStudent(s) {
  if (!s) {
    alert("No se encontró ese estudiante.");
    return;
  }

  $("#profileContent").innerHTML = `
    <div class="profile-head">

      <div class="avatar">
        ${
          s.foto
            ? `<img src="assets/${s.foto}"
                    onerror="this.style.display='none'">`
            : ""
        }
      </div>

      <div>
        <span class="badge">${s.codigo}</span>

        <h2>
          ${s.nombres || "Estudiante"}
          ${s.apellidos || ""}
        </h2>

        <p>
          ${s.grado || "Sin grado"}
          ·
          ${s.seccion || "Sin sección"}
        </p>
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

    <button
      class="primary"
      type="button"
      onclick="showAdminStudent('${s.codigo}')"
    >
      Administrar cuenta
    </button>
  `;

  openModal("#profileModal");
}

/* =========================================================
   LECTOR QR
   ========================================================= */

$("#scanBtn").onclick = async () => {

  openModal("#scannerModal");

  $("#scanStatus").textContent =
    "Solicitando cámara…";

  if (!window.Html5Qrcode) {

    $("#scanStatus").textContent =
      "Cargando lector QR…";

    setTimeout(() => startScanner(), 500);

  } else {

    startScanner();

  }
};

let scanner = null;

async function startScanner() {

  if (scanner) return;

  scanner = new Html5Qrcode("reader");

  try {

    await scanner.start(
      {
        facingMode: "environment"
      },
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250
        }
      },

      async (text) => {

        try {
          await scanner.stop();
        } catch (e) {}

        scanner = null;

        $("#scannerModal").classList.add("hidden");

        showStudent(findStudent(text));

      },

      () => {}
    );

    $("#scanStatus").textContent =
      "Cámara activa. Enfoca el código QR.";

  } catch (e) {

    $("#scanStatus").textContent =
      "No se pudo abrir la cámara. Usa “Ingresar código” o revisa los permisos.";

    console.error(e);

  }
}

/* =========================================================
   INGRESAR CÓDIGO
   ========================================================= */

$("#codeBtn").onclick = () => {
  openModal("#codeModal");
};

$("#findCode").onclick = () => {

  const student = findStudent(
    $("#codeInput").value
  );

  showStudent(student);
};

$("#codeInput").addEventListener(
  "keydown",
  (e) => {

    if (e.key === "Enter") {
      $("#findCode").click();
    }

  }
);

/* =========================================================
   ADMINISTRADOR
   ========================================================= */

$("#adminBtn").onclick = () => {

  $("#pinInput").value = "";
  $("#adminStatus").textContent = "";

  openModal("#adminModal");

  setTimeout(() => {
    $("#pinInput").focus();
  }, 100);

};

/* =========================================================
   LOGIN ADMIN
   ========================================================= */

$("#adminLogin").onclick = () => {

  const pin = $("#pinInput").value.trim();

  if (pin === CONFIG.PIN_ADMIN) {

    $("#adminModal").classList.add("hidden");

    openAdminPanel();

  } else {

    $("#adminStatus").textContent =
      "PIN incorrecto.";

    $("#pinInput").focus();

  }

};

$("#pinInput").addEventListener(
  "keydown",
  (e) => {

    if (e.key === "Enter") {
      $("#adminLogin").click();
    }

  }
);

/* =========================================================
   CREAR PANEL ADMINISTRATIVO
   ========================================================= */

function createAdminModal() {

  if ($("#adminPanelModal")) return;

  const modal = document.createElement("div");

  modal.className = "modal hidden";

  modal.id = "adminPanelModal";

  modal.innerHTML = `

    <div
      class="modal-card"
      style="
        width:min(1100px,96vw);
        max-height:94vh;
        padding:30px;
      "
    >

      <button
        class="close"
        id="closeAdminPanel"
        type="button"
      >
        ×
      </button>

      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:20px;
          padding-right:35px;
          margin-bottom:25px;
        "
      >

        <div>

          <span
            style="
              display:inline-block;
              background:#e9eff7;
              color:#071a34;
              padding:5px 10px;
              border-radius:20px;
              font-size:12px;
              font-weight:700;
            "
          >
            ADMINISTRADOR
          </span>

          <h2
            style="
              margin:8px 0 4px;
              color:#071a34;
            "
          >
            Panel administrativo
          </h2>

          <p
            style="
              margin:0;
              color:#666;
            "
          >
            Banco LDS 360
          </p>

        </div>

        <button
          id="adminLogout"
          type="button"
          style="
            background:#9f1017;
            color:white;
            border:0;
            border-radius:10px;
            padding:11px 18px;
            font-weight:700;
            cursor:pointer;
          "
        >
          Cerrar sesión
        </button>

      </div>

      <!-- ESTADÍSTICAS -->

      <div
        id="adminStats"
        style="
          display:grid;
          grid-template-columns:
            repeat(4,minmax(0,1fr));
          gap:12px;
          margin-bottom:25px;
        "
      ></div>

      <!-- BUSCADOR -->

      <div
        style="
          display:flex;
          gap:10px;
          margin-bottom:18px;
        "
      >

        <input
          id="adminSearch"
          type="text"
          placeholder="Buscar por código o nombre..."
          autocomplete="off"
          style="
            margin:0;
            flex:1;
          "
        >

      </div>

      <!-- LISTA -->

      <div
        id="adminStudentList"
        style="
          display:grid;
          gap:10px;
          max-height:48vh;
          overflow:auto;
        "
      ></div>

    </div>

  `;

  document.body.appendChild(modal);

  $("#closeAdminPanel").onclick = () => {
    modal.classList.add("hidden");
  };

  $("#adminLogout").onclick = () => {
    modal.classList.add("hidden");
  };

  modal.addEventListener("click", (e) => {

    if (e.target === modal) {
      modal.classList.add("hidden");
    }

  });

  $("#adminSearch").addEventListener(
    "input",
    renderAdminStudents
  );
}

/* =========================================================
   ABRIR PANEL
   ========================================================= */

function openAdminPanel() {

  createAdminModal();

  renderAdminStats();

  renderAdminStudents();

  $("#adminPanelModal").classList.remove(
    "hidden"
  );

}

/* =========================================================
   ESTADÍSTICAS
   ========================================================= */

function renderAdminStats() {

  const totalStudents = STUDENTS.length;

  const totalBalance = STUDENTS.reduce(
    (sum, s) => sum + Number(s.saldo || 0),
    0
  );

  const totalIncome = STUDENTS.reduce(
    (sum, s) =>
      sum +
      Number(s.ingresos || 0) +
      Number(s.bonificaciones || 0),
    0
  );

  const totalExpenses = STUDENTS.reduce(
    (sum, s) =>
      sum +
      Number(s.egresos || 0),
    0
  );

  $("#adminStats").innerHTML = `

    <div style="
      padding:18px;
      border-radius:14px;
      background:#071a34;
      color:white;
    ">
      <small>Estudiantes</small>
      <strong style="
        display:block;
        font-size:25px;
        margin-top:5px;
      ">
        ${totalStudents}
      </strong>
    </div>

    <div style="
      padding:18px;
      border-radius:14px;
      background:#f3f5f8;
      color:#071a34;
    ">
      <small>Saldo total</small>
      <strong style="
        display:block;
        font-size:20px;
        margin-top:5px;
      ">
        ${money(totalBalance)}
      </strong>
    </div>

    <div style="
      padding:18px;
      border-radius:14px;
      background:#f3f5f8;
      color:#071a34;
    ">
      <small>Ingresos</small>
      <strong style="
        display:block;
        font-size:20px;
        margin-top:5px;
      ">
        ${money(totalIncome)}
      </strong>
    </div>

    <div style="
      padding:18px;
      border-radius:14px;
      background:#f3f5f8;
      color:#071a34;
    ">
      <small>Egresos</small>
      <strong style="
        display:block;
        font-size:20px;
        margin-top:5px;
      ">
        ${money(totalExpenses)}
      </strong>
    </div>

  `;
}

/* =========================================================
   LISTA DE ESTUDIANTES
   ========================================================= */

function renderAdminStudents() {

  const container = $("#adminStudentList");

  if (!container) return;

  const search = (
    $("#adminSearch")?.value || ""
  )
    .trim()
    .toUpperCase();

  const filtered = STUDENTS.filter((s) => {

    const text = `
      ${s.codigo}
      ${s.nombres}
      ${s.apellidos}
      ${s.grado}
      ${s.seccion}
    `.toUpperCase();

    return text.includes(search);

  });

  if (!filtered.length) {

    container.innerHTML = `
      <div style="
        padding:30px;
        text-align:center;
        color:#777;
      ">
        No se encontraron estudiantes.
      </div>
    `;

    return;
  }

  container.innerHTML = filtered.map((s) => `

    <div
      style="
        display:flex;
        align-items:center;
        gap:15px;
        padding:14px;
        border:1px solid #e1e5eb;
        border-radius:14px;
        background:white;
      "
    >

      <div
        style="
          width:52px;
          height:52px;
          flex:0 0 52px;
          border-radius:50%;
          overflow:hidden;
          background:#e8edf4;
          display:grid;
          place-items:center;
        "
      >
        ${
          s.foto
            ? `<img
                src="assets/${s.foto}"
                style="
                  width:100%;
                  height:100%;
                  object-fit:cover;
                "
                onerror="this.style.display='none'"
              >`
            : "👤"
        }
      </div>

      <div style="flex:1;min-width:0;">

        <div
          style="
            font-size:12px;
            font-weight:700;
            color:#9f1017;
          "
        >
          ${s.codigo}
        </div>

        <strong
          style="
            display:block;
            margin-top:3px;
            color:#071a34;
          "
        >
          ${s.nombres || "Sin nombre"}
          ${s.apellidos || ""}
        </strong>

        <small style="color:#777;">
          ${s.grado || "Sin grado"}
          ·
          ${s.seccion || "Sin sección"}
        </small>

      </div>

      <div
        style="
          text-align:right;
          min-width:120px;
        "
      >

        <small style="color:#777;">
          Saldo
        </small>

        <strong
          style="
            display:block;
            color:#071a34;
          "
        >
          ${money(s.saldo)}
        </strong>

      </div>

      <button
        type="button"
        onclick="showAdminStudent('${s.codigo}')"
        style="
          border:0;
          border-radius:9px;
          padding:10px 13px;
          background:#071a34;
          color:white;
          cursor:pointer;
          font-weight:700;
        "
      >
        Gestionar
      </button>

    </div>

  `).join("");

}

/* =========================================================
   GESTIONAR CUENTA
   ========================================================= */

function showAdminStudent(codigo) {

  const s = findStudent(codigo);

  if (!s) return;

  createAdminEditModal();

  $("#adminEditContent").innerHTML = `

    <span class="badge">
      ${s.codigo}
    </span>

    <h2 style="
      color:#071a34;
      margin-bottom:5px;
    ">
      ${s.nombres || "Estudiante"}
      ${s.apellidos || ""}
    </h2>

    <p style="
      margin-top:0;
      color:#777;
    ">
      ${s.grado || "Sin grado"}
      ·
      ${s.seccion || "Sin sección"}
    </p>

    <div class="balance">

      <small>Saldo actual</small>

      <strong>
        ${money(s.saldo)}
      </strong>

    </div>

    <h3>
      Registrar movimiento
    </h3>

    <label
      style="
        display:block;
        font-weight:700;
        margin-top:12px;
      "
    >
      Tipo
    </label>

    <select
      id="movementType"
      style="
        width:100%;
        padding:13px;
        border:1px solid #bbb;
        border-radius:10px;
        margin:7px 0 12px;
      "
    >
      <option value="ingresos">
        Ingreso
      </option>

      <option value="bonificaciones">
        Bonificación
      </option>

      <option value="egresos">
        Egreso
      </option>

      <option value="ahorro">
        Ahorro
      </option>

      <option value="consecuencias">
        Consecuencia
      </option>
    </select>

    <label
      style="
        display:block;
        font-weight:700;
      "
    >
      Monto
    </label>

    <input
      id="movementAmount"
      type="number"
      min="0"
      step="0.01"
      placeholder="0.00"
    >

    <label
      style="
        display:block;
        font-weight:700;
      "
    >
      Concepto
    </label>

    <input
      id="movementConcept"
      type="text"
      placeholder="Ej. Premio, ahorro, multa..."
    >

    <button
      id="saveMovement"
      class="primary"
      type="button"
    >
      Registrar movimiento
    </button>

    <div
      id="movementStatus"
      class="status"
    ></div>

    <hr style="
      margin:25px 0;
      border:0;
      border-top:1px solid #ddd;
    ">

    <h3>
      Información de la cuenta
    </h3>

    <div class="grid">

      <div>
        <span>Sueldo base</span>
        <b>${money(s.sueldo)}</b>
      </div>

      <div>
        <span>Ingresos</span>
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

  `;

  $("#adminEditModal").classList.remove(
    "hidden"
  );

  $("#saveMovement").onclick = () => {

    const type =
      $("#movementType").value;

    const amount = Number(
      $("#movementAmount").value
    );

    const concept =
      $("#movementConcept").value.trim();

    if (!amount || amount <= 0) {

      $("#movementStatus").textContent =
        "Ingresa un monto válido.";

      return;
    }

    if (!concept) {

      $("#movementStatus").textContent =
        "Escribe el concepto.";

      return;
    }

    if (
      type === "ingresos" ||
      type === "bonificaciones"
    ) {

      s[type] =
        Number(s[type] || 0) +
        amount;

      s.saldo =
        Number(s.saldo || 0) +
        amount;

    } else {

      s[type] =
        Number(s[type] || 0) +
        amount;

      s.saldo =
        Number(s.saldo || 0) -
        amount;

    }

    saveStudents();

    $("#movementStatus").style.color =
      "#087443";

    $("#movementStatus").textContent =
      `Movimiento registrado: ${concept} — ${money(amount)}.`;

    $("#movementAmount").value = "";
    $("#movementConcept").value = "";

    renderAdminStats();
    renderAdminStudents();

    setTimeout(() => {
      showAdminStudent(s.codigo);
    }, 500);

  };

}

/* =========================================================
   MODAL DE EDICIÓN
   ========================================================= */

function createAdminEditModal() {

  if ($("#adminEditModal")) return;

  const modal = document.createElement("div");

  modal.className = "modal hidden";

  modal.id = "adminEditModal";

  modal.innerHTML = `

    <div
      class="modal-card small"
      style="
        max-height:92vh;
        overflow:auto;
      "
    >

      <button
        class="close"
        id="closeAdminEdit"
        type="button"
      >
        ×
      </button>

      <div id="adminEditContent"></div>

    </div>

  `;

  document.body.appendChild(modal);

  $("#closeAdminEdit").onclick = () => {
    modal.classList.add("hidden");
  };

}

/* =========================================================
   EXPONER FUNCIÓN
   ========================================================= */

window.showAdminStudent =
  showAdminStudent;
