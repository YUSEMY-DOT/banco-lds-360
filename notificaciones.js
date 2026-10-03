/* =========================================================
   BANCO LDS 360
   NOTIFICACIONES
   Todo el sistema de notificaciones en este archivo.
   ========================================================= */

(() => {
  "use strict";

  const CONFIG = Object.freeze({
    nombre: "BANCO LDS 360",
    rutaBase: "/banco-lds-360/",
    serviceWorker: "/banco-lds-360/sw.js",
    icono: "/banco-lds-360/assets/insignia.png",
    badge: "/banco-lds-360/assets/icon-192.png"
  });

  const NotificacionesLDS = {

    config: CONFIG,

    /* =========================
       ESTADO
       ========================= */

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

    estado() {
      return {
        soportado: this.soportado(),
        permiso: this.permiso(),
        serviceWorker: "serviceWorker" in navigator,
        seguro: window.isSecureContext === true
      };
    },

    /* =========================
       PERMISO
       ========================= */

    async solicitarPermiso() {

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

    /* =========================
       SERVICE WORKER
       ========================= */

    async registrar() {

      if (!("serviceWorker" in navigator)) {
        return null;
      }

      try {

        const registro =
          await navigator.serviceWorker.register(
            CONFIG.serviceWorker,
            {
              scope: CONFIG.rutaBase
            }
          );

        return registro;

      } catch (error) {

        console.error(
          "BANCO LDS 360 - Error registrando Service Worker:",
          error
        );

        return null;
      }
    },

    async obtenerRegistro() {

      if (!("serviceWorker" in navigator)) {
        return null;
      }

      try {

        let registro =
          await navigator.serviceWorker.getRegistration(
            CONFIG.rutaBase
          );

        if (!registro) {
          registro = await this.registrar();
        }

        return registro;

      } catch (error) {

        console.error(
          "BANCO LDS 360 - Error obteniendo Service Worker:",
          error
        );

        return null;
      }
    },

    /* =========================
       MOSTRAR NOTIFICACIÓN
       ========================= */

    async mostrar(opciones = {}) {

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

      const registro =
        await this.obtenerRegistro();

      if (!registro) {
        return {
          ok: false,
          motivo: "service-worker-no-disponible"
        };
      }

      const titulo =
        opciones.titulo ||
        CONFIG.nombre;

      const mensaje =
        opciones.mensaje ||
        "";

      const tag =
        opciones.tag ||
        "lds360-notificacion";

      const url =
        opciones.url ||
        CONFIG.rutaBase;

      const datos =
        opciones.datos ||
        {};

      try {

        await registro.showNotification(
          titulo,
          {
            body: mensaje,

            icon:
              opciones.icono ||
              CONFIG.icono,

            badge:
              opciones.badge ||
              CONFIG.badge,

            tag,

            renotify: true,

            requireInteraction:
              opciones.requireInteraction === true,

            data: {
              ...datos,
              url
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
          motivo: "error-notificacion"
        };
      }
    },

    /* =========================
       MENSAJE GENERAL
       ========================= */

    async mensaje(titulo, mensaje, opciones = {}) {

      return await this.mostrar({
        ...opciones,
        titulo,
        mensaje
      });
    },

    /* =========================
       MOVIMIENTO
       ========================= */

    async movimiento(datos = {}) {

      const tipo =
        String(datos.tipo || "").toUpperCase();

      const concepto =
        datos.concepto ||
        "Movimiento registrado";

      const codigo =
        datos.codigo ||
        "";

      const monto =
        Number(datos.monto || 0);

      const anio =
        datos.anio ||
        new Date().getFullYear();

      let titulo =
        "🔔 BANCO LDS 360";

      if (tipo === "INGRESO") {
        titulo = "💰 BANCO LDS 360 - INGRESO";
      }

      if (tipo === "EGRESO") {
        titulo = "💳 BANCO LDS 360 - EGRESO";
      }

      const textoMonto =
        monto > 0
          ? `S/ ${monto.toFixed(2)}`
          : "";

      const partes = [
        concepto,
        textoMonto,
        codigo,
        anio
      ].filter(Boolean);

      return await this.mostrar({

        titulo,

        mensaje:
          partes.join(" · "),

        tag:
          `lds360-movimiento-${codigo || "general"}`,

        datos: {
          tipo,
          concepto,
          codigo,
          monto,
          anio
        }
      });
    },

    /* =========================
       PRUEBA
       ========================= */

    async prueba() {

      const permiso =
        await this.solicitarPermiso();

      if (permiso !== "granted") {
        return {
          ok: false,
          permiso
        };
      }

      return await this.mostrar({

        titulo:
          "🔔 BANCO LDS 360",

        mensaje:
          "Notificación de prueba funcionando correctamente.",

        tag:
          "lds360-prueba",

        requireInteraction:
          true,

        datos: {
          tipo: "PRUEBA"
        }
      });
    }
  };

  window.NotificacionesLDS =
    NotificacionesLDS;

})();
