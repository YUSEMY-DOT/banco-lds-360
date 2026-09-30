(function() {
    let audioCtx = null;
    let iniciado = false;

    const FREQS = {
        "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23,
        "G4": 392.00, "A4": 440.00, "B4": 493.88, "C5": 523.25
    };

    const notasMelodia = [
        { n: "C4", d: 0.4 }, { n: "E4", d: 0.4 }, { n: "G4", d: 0.7 }, { n: "G4", d: 0.7 },
        { n: "A4", d: 0.4 }, { n: "G4", d: 0.4 }, { n: "F4", d: 0.4 }, { n: "E4", d: 0.4 }, { n: "D4", d: 0.7 }, { n: "C4", d: 0.7 },
        { n: "D4", d: 0.4 }, { n: "F4", d: 0.4 }, { n: "A4", d: 0.7 }, { n: "A4", d: 0.7 },
        { n: "B4", d: 0.4 }, { n: "A4", d: 0.4 }, { n: "G4", d: 0.4 }, { n: "F4", d: 0.4 }, { n: "E4", d: 0.7 }, { n: "D4", d: 0.7 },
        { n: "E4", d: 0.4 }, { n: "F4", d: 0.4 }, { n: "G4", d: 0.7 }, { n: "G4", d: 0.4 }, { n: "C5", d: 0.7 }, { n: "C5", d: 0.7 },
        { n: "B4", d: 0.4 }, { n: "A4", d: 0.4 }, { n: "G4", d: 0.4 }, { n: "F4", d: 0.4 }, { n: "E4", d: 0.7 },
        { n: "D4", d: 0.4 }, { n: "E4", d: 0.4 }, { n: "F4", d: 0.7 }, { n: "F4", d: 0.7 },
        { n: "F4", d: 0.4 }, { n: "E4", d: 0.4 }, { n: "D4", d: 0.4 }, { n: "D4", d: 0.4 }, { n: "C4", d: 1.5 }
    ];

    function sonarLira(ctx, freq, t) {
        if (!freq) return;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(freq, t);
        osc2.frequency.setValueAtTime(freq * 2, t);
        gain.gain.setValueAtTime(0.20, t); 
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 1.0);
        osc2.stop(t + 1.0);
    }

    function sonarTambor(ctx, t) {
        const bufferSize = ctx.sampleRate * 0.04;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1800;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(t);
    }

    function hablarTexto() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const texto = "¡Bienvenidos a la Institución Educativa Privada La Salle del Sur! Aprendiendo con metas y valores, cual nos diste tú mi gran maestro. Lasallista del Sur es nuestro ejemplo de enseñanza, disciplina y lealtad.";
            const mensaje = new SpeechSynthesisUtterance(texto);
            mensaje.lang = 'es-PE';
            mensaje.rate = 0.9;
            mensaje.pitch = 1.0;

            const configurarVoz = () => {
                const voces = window.speechSynthesis.getVoices();
                const vozEspañol = voces.find(v => v.lang.includes('es'));
                if (vozEspañol) mensaje.voice = vozEspañol;
            };

            configurarVoz();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = configurarVoz;
            }

            window.speechSynthesis.speak(mensaje);
        }
    }

    async function reproducirMelodia(ctx) {
        let t = ctx.currentTime + 0.1;
        notasMelodia.forEach(item => {
            const f = FREQS[item.n] || 261.63;
            sonarLira(ctx, f, t);
            sonarTambor(ctx, t);
            t += item.d;
        });
    }

    async function arrancarAudioYVoz() {
        if (iniciado) return;
        iniciado = true;

        hablarTexto();

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
            if (audioCtx.state === 'suspended') {
                await audioCtx.resume();
            }

            reproducirMelodia(audioCtx);
            setInterval(() => {
                if (audioCtx) reproducirMelodia(audioCtx);
            }, 16500);

        } catch (e) {
            console.log(e);
        }
    }

    window.addEventListener('load', arrancarAudioYVoz);
    document.addEventListener('touchstart', arrancarAudioYVoz, { once: true });
    document.addEventListener('click', arrancarAudioYVoz, { once: true });
    document.addEventListener('pointerdown', arrancarAudioYVoz, { once: true });
})();
