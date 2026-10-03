/* BANCO LDS 360 - NOTIFICACIONES */

(() => {
  "use strict";

  const CONFIG = Object.freeze({
    nombre: "BANCO LDS 360",
    rutaBase: "/banco-lds-360/",
    serviceWorker: "/banco-lds-360/sw.js",
    icono: "/banco-lds-360/assets/insignia.png"
  });

  const NotificacionesLDS = {

    config: CONFIG,

    soportado() {
      return (
        "Notification" in window &&
        "serviceWorker" in navigator
      );
    },

    permiso() {
      if (!("Notification" in window)) {
        return "unsupported";
      }

      return Notification.permission;
    },

    async pedirPermiso() {
      if (!("Notification" in window)) {
        return "unsupported";
      }

      if (Notification.permission === "granted") {
        return "granted";
      }

      if (Notification.permission === "denied") {
        return "denied";
      }

      try {
        return await Notification.requestPermission();
      } catch (error) {
        console.error(
          "BANCO LDS 360 - Error solicitando permiso:",
          error
        );
        return "error";
      }
    },

    async registrarServiceWorker() {
      if (!("serviceWorker" in navigator)) {
        return null;
      }

      try {
        const registro = await navigator.serviceWorker.register(
          CONFIG.serviceWorker,
          {
            scope: CONFIG.rutaBase
          }
        );

        return registro;

      } catch (error) {
        console.error(
          "BANCO LDS 360 - Error registrando sw.js:",
          error
        );
        return null;
      }
    },

    async mostrar({
      titulo = CONFIG.nombre,
      mensaje = "",
      tag = "lds360",
      url = CONFIG.rutaBase,
      datos = {}
    } = {}) {

      if (!("Notification" in window)) {
        return {
          ok: false,
          motivo: "navegador-no-compatible"
        };
      }

      if (Notification.permission !== "granted") {
        return {
          ok: false,
          motivo: "permiso-no-concedido",
          permiso: Notification.permission
        };
      }

      try {
        let registro =
          await navigator.serviceWorker.getRegistration(
            CONFIG.rutaBase
          );

        if (!registro) {
          registro = await this.registrarServiceWorker();
        }

        if (!registro) {
          return {
            ok: false,
            motivo: "service-worker-no-disponible"
          };
        }

        const icono =
          new URL(
            CONFIG.icono,
            window.location.origin
          ).href;

        const destino =
          new URL(
            url,
            window.location.origin
          ).href;

        await registro.showNotification(
          titulo,
          {
            body: mensaje,
            icon: icono,
            badge: icono,
            tag: tag,
            renotify: true,
            data: {
              ...datos,
              url: destino
            }
          }
        );

        return {
          ok: true
        };

      } catch (error) {
        console.error(
          "BANCO LDS 360 - Error mostrando notificación:",
          error
        );

        return {
          ok: false,
          motivo: "error",
          error: String(error)
        };
      }
    },

    async mensaje(titulo, mensaje, opciones = {}) {
      return await this.mostrar({
        ...opciones,
        titulo,
        mensaje
      });
    },

    async movimiento(movimiento = {}) {

      const tipo =
        String(movimiento.tipo || "").toUpperCase();

      const concepto =
        movimiento.concepto ||
        "Movimiento registrado";

      const codigo =
        movimiento.codigo ||
        "";

      const monto =
        Number(movimiento.monto || 0);

      const anio =
        movimiento.anio ||
        new Date().getFullYear();

      let titulo =
        "BANCO LDS 360";

      if (tipo === "INGRESO") {
        titulo = "💰 Ingreso registrado";
      }

      if (tipo === "EGRESO") {
        titulo = "💳 Egreso registrado";
      }

      const textoMonto =
        monto > 0
          ? `S/ ${monto.toFixed(2)}`
          : "";

      const partes = [
        concepto,
        textoMonto,
        codigo,
        String(anio)
      ].filter(Boolean);

      return await this.mostrar({
        titulo,
        mensaje: partes.join(" · "),
        tag: `lds360-movimiento-${codigo || "general"}`,
        datos: {
          tipo,
          concepto,
          codigo,
          monto,
          anio
        }
      });
    },

    async estado() {
      let registro = null;

      if ("serviceWorker" in navigator) {
        registro =
          await navigator.serviceWorker.getRegistration(
            CONFIG.rutaBase
          );
      }

      return {
        soporte: this.soportado(),
        permiso: this.permiso(),
        serviceWorker: !!registro
      };
    }
  };

  window.NotificacionesLDS = NotificacionesLDS;

})();
