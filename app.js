/**
 * BANCO LDS 360 - CONECTOR DIRECTO ADMINISTRATIVO
 * IEP La Salle del Sur
 */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLINzmjri8dTZx4T-ZIe2TwthpuX7bjbKPCeZhCEa9WQGMjxmgK9QpJKb7cDGJ_8fovg/exec";

let missActual = "";

// PETICIÓN JSONP
function hacerPeticionJSONP(parametros, callback) {
  const nombreCallback = 'jsonp_callback_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
  let respuestaEnviada = false;

  const timeoutSeguridad = setTimeout(() => {
    if (!respuestaEnviada) {
      respuestaEnviada = true;
      delete window[nombreCallback];
      if (script && script.parentNode) document.body.removeChild(script);
      callback({ success: false, ok: false, mensaje: "El servidor tardó demasiado. Intenta nuevamente." });
    }
  }, 12000);

  window[nombreCallback] = function(data) {
    if (respuestaEnviada) return;
    respuestaEnviada = true;
    clearTimeout(timeoutSeguridad);
    delete window[nombreCallback];
    if (script && script.parentNode) {
      document.body.removeChild(script);
    }
    callback(data);
  };

  let url = SCRIPT_URL + '?callback=' + nombreCallback;
  for (let clave in parametros) {
    if (parametros[clave] !== undefined && parametros[clave] !== null) {
      url += '&' + encodeURIComponent(clave) + '=' + encodeURIComponent(parametros[clave]);
    }
  }

  const script = document.createElement('script');
  script.src = url;

  script.onerror = function() {
    if (respuestaEnviada) return;
    respuestaEnviada = true;
    clearTimeout(timeoutSeguridad);
    delete window[nombreCallback];
    if (script && script.parentNode) document.body.removeChild(script);
    callback({ success: false, ok: false, mensaje: "Error de conexión con el servidor." });
  };

  document.body.appendChild(script);
}

// FUNCIONES DE VOZ Y SONIDO
function reproducirSonidoExito() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notas = [523.25, 659.25, 783.99, 1046.50];
    notas.forEach((frec, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = frec;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
    });
  } catch(e) {}
}

function hablarTextoVoz(texto) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const textoLimpio = texto.replace(/\./g, ',').replace(/\?/g, '').replace(/!/g, '');
    const utterance = new SpeechSynthesisUtterance(textoLimpio);
    utterance.rate = 1.0;
    utterance.pitch = 1.2;

    const voces = window.speechSynthesis.getVoices();
    let vozIdeal = voces.find(v => v.lang.startsWith('es'));
    if (vozIdeal) utterance.voice = vozIdeal;

    setTimeout(() => { window.speechSynthesis.speak(utterance); }, 100);
  }
}

// BÚSQUEDA DEL ALUMNO ADAPTADA A TU INTERFAZ
function buscarEstudiante() {
  // Detecta el input de texto en cualquiera de las versiones de la interfaz
  const inputElem = document.getElementById('codigoEstudiante') || 
                    document.getElementById('codigoEstudianteAdmin') || 
                    document.querySelector('input[type="text"]');

  const codigo = inputElem ? inputElem.value.trim().toUpperCase() : "";

  if (!codigo) {
    hablarTextoVoz("Por favor escribe o ingresa el código del estudiante.");
    return;
  }

  hablarTextoVoz("Consultando información del estudiante.");

  hacerPeticionJSONP({ accion: 'CONSULTAR_ALUMNO', codigo: codigo }, function(data) {
    if (!data || !(data.success || data.ok)) {
      alert("No se encontraron datos para el código: " + codigo);
      hablarTextoVoz("No se encontraron datos registrados para este estudiante.");
      return;
    }

    const est = data.estudiante || data;
    const nombre = est.nombreCompleto || est.nombre || 'Estudiante';
    const saldo = Number(data.saldoActual || data.saldo || 0).toFixed(2);

    // Muestra la ficha si estaba oculta
    const ficha = document.getElementById('fichaAlumno') || document.getElementById('fichaAlumnoAdmin');
    if (ficha) ficha.classList.remove('hidden');

    reproducirSonidoExito();

    setTimeout(() => {
      hablarTextoVoz(`Estudiante ${nombre}. Saldo disponible: ${saldo} LDS.`);
    }, 200);
  });
}

// ASIGNACIÓN AUTOMÁTICA DE EVENTOS AL CREGAR LA PÁGINA
document.addEventListener("DOMContentLoaded", function() {
  // Conecta automáticamente cualquier botón "Buscar" existente con la función de voz y consulta
  const botones = document.getElementsByTagName('button');
  for (let b of botones) {
    if (b.textContent.toLowerCase().includes('buscar')) {
      b.onclick = function(e) {
        e.preventDefault();
        buscarEstudiante();
      };
    }
  }

  // Activar búsqueda al presionar Enter en el cajón de texto
  const inputs = document.getElementsByTagName('input');
  for (let input of inputs) {
    input.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        buscarEstudiante();
      }
    });
  }
});
