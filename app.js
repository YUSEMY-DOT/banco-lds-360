/**
 * BANCO LDS 360 - FLUJO ORDENADO Y DEFINITIVO
 * IEP La Salle del Sur
 */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLINzmjri8dTZx4T-ZIe2TwthpuX7bjbKPCeZhCEa9WQGMjxmgK9QpJKb7cDGJ_8fovg/exec";

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

// EFECTOS DE SONIDO Y VOZ PARLANTE
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
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.rate = 1.0;
    utterance.pitch = 1.2;
    const voces = window.speechSynthesis.getVoices();
    let vozEs = voces.find(v => v.lang.startsWith('es'));
    if (vozEs) utterance.voice = vozEs;
    setTimeout(() => { window.speechSynthesis.speak(utterance); }, 100);
  }
}

// 1. VALIDACIÓN MAESTRA DESDE LA PORTADA (`index.html`)
function validarAdmin() {
  const input = document.getElementById('adminPin');
  const error = document.getElementById('adminError');
  const pin = (input ? input.value : '').trim();

  if (!pin) {
    if (error) error.textContent = 'Ingresa la clave de administrador.';
    hablarTextoVoz("Ingresa la clave de administrador.");
    return;
  }

  if (pin.toUpperCase() !== '360LDS') {
    if (error) error.textContent = 'Clave de administrador incorrecta.';
    hablarTextoVoz("Clave de administrador incorrecta.");
    return;
  }

  if (error) error.textContent = '';
  reproducirSonidoExito();
  hablarTextoVoz("Acceso concedido al panel administrativo.");
  window.location.href = 'administrador.html';
}

// 2. BÚSQUEDA Y VOZ EN EL PANEL (`administrador.html`)
function buscarEstudiante() {
  const inputs = document.querySelectorAll('input');
  let codigo = "";
  
  for (let inp of inputs) {
    if (inp.value && inp.value.trim() !== "" && inp.type !== 'password') {
      codigo = inp.value.trim().toUpperCase();
      break;
    }
  }

  if (!codigo) {
    alert("Por favor ingrese o escanee un código de estudiante.");
    hablarTextoVoz("Por favor ingrese un código de estudiante.");
    return;
  }

  hablarTextoVoz("Consultando base de datos.");

  hacerPeticionJSONP({ accion: 'CONSULTAR_ALUMNO', codigo: codigo }, function(res) {
    if (!res || !(res.success || res.ok)) {
      alert("No se encontró al estudiante con código: " + codigo);
      hablarTextoVoz("No se encontró el estudiante.");
      return;
    }

    const est = res.estudiante || res;
    const nombre = est.nombreCompleto || est.nombre || 'Estudiante';
    const saldo = Number(res.saldoActual || res.saldo || 0).toFixed(2);

    reproducirSonidoExito();
    hablarTextoVoz(`Estudiante ${nombre}. Saldo actual: ${saldo} LDS.`);
    alert(`¡Estudiante Encontrado!\nNombre: ${nombre}\nSaldo: ${saldo} LDS`);
  });
}

// ACTIVADORES AUTOMÁTICOS DE CLICS Y TECLAS
document.addEventListener("DOMContentLoaded", function() {
  const botones = document.querySelectorAll('button');
  botones.forEach(btn => {
    const texto = btn.textContent.toUpperCase();
    if (texto.includes('BUSCAR') || texto.includes('INGRESAR')) {
      btn.onclick = function(e) {
        e.preventDefault();
        if (texto.includes('BUSCAR')) {
          buscarEstudiante();
        } else if (document.getElementById('adminPin')) {
          validarAdmin();
        }
      };
    }
  });

  const inputs = document.querySelectorAll('input');
  inputs.forEach(inp => {
    inp.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (inp.id === 'adminPin') {
          validarAdmin();
        } else {
          buscarEstudiante();
        }
      }
    });
  });
});
