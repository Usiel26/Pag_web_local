/*
 * Configuración del sitio: lo único que necesitas editar para
 * cambiar números, redes o conectar la agenda con Google Calendar.
 */
window.LOS_FICUS_CONFIG = {
  // Número de WhatsApp con código de país (51), sin "+" ni espacios.
  whatsapp: "51941497280",
  whatsappMensaje: "Hola, quisiera información sobre el salón de eventos Los Ficus.",

  // Enlace completo al perfil de Instagram.
  // TODO: reemplazar por el perfil real, p. ej. "https://www.instagram.com/losficus.ica/"
  instagram: "https://www.instagram.com/",

  // URL del Web App de Google Apps Script (ver apps-script/README.md).
  // Mientras esté vacía, las citas se envían por WhatsApp en lugar de
  // ir directo al Google Calendar.
  appsScriptUrl: "",

  // Solo se usan mientras appsScriptUrl esté vacía. Cuando el
  // Apps Script esté conectado, los horarios salen de allí.
  horarios: ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"],
  diasAtencion: [1, 2, 3, 4, 5, 6], // 0 = domingo, 1 = lunes … 6 = sábado
  diasMaximos: 60                    // hasta cuántos días adelante se puede agendar
};
