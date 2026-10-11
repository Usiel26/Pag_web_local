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
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbwQBcLiyDNJ1Vf6cSV4cmDKN1UkcPQ2dZu3ZaWLG0l-f0R4KsrqrSciY1ROxOBYIIBo/exec",

  // Solo se usan mientras appsScriptUrl esté vacía. Cuando el
  // Apps Script esté conectado, los horarios salen de allí.
  horarios: ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"],
  diasAtencion: [1, 2, 3, 4, 5, 6], // 0 = domingo, 1 = lunes … 6 = sábado
  diasMaximos: 60,                   // hasta cuántos días adelante se puede agendar

  // Testimonios de clientes reales (con su permiso). La sección solo
  // aparece en la página cuando hay al menos uno. "fotos" es opcional:
  // guarda las fotos de cada evento en su propia carpeta dentro de
  // assets/img/testimonios/ (ver README). La primera foto es la grande.
  //   {
  //     texto: "Lo que el cliente dijo, en sus palabras.",
  //     nombre: "Nombre A.",
  //     evento: "Boda · marzo 2026",
  //     fotos: [
  //       "assets/img/testimonios/boda-nombre/01.webp",
  //       "assets/img/testimonios/boda-nombre/02.webp"
  //     ]
  //   },
  testimonios: [
    // ===== EJEMPLOS PARA PROBAR EL DISEÑO: BORRAR ANTES DE PUBLICAR =====
    {
      texto: "(Ejemplo) Celebramos nuestra boda en Los Ficus y todo salió como lo imaginamos. La decoración, la pista y la atención del equipo hicieron que nuestros invitados no dejaran de bailar.",
      nombre: "Cliente de ejemplo",
      evento: "Boda · ejemplo",
      fotos: [
        "assets/img/testimonios/ejemplo-boda/01.webp",
        "assets/img/salon-principal-sm.webp",
        "assets/img/salon-pista.webp",
        "assets/img/salon-lamparas.webp",
        "assets/img/salon-escalera.webp"
      ]
    },
    {
      texto: "(Ejemplo) El quinceañero de mi hija fue precioso. Nos ayudaron con la decoración en rosado y el salón se veía elegante desde la entrada.",
      nombre: "Cliente de ejemplo",
      evento: "Quinceañero · ejemplo",
      fotos: [
        "assets/img/testimonios/ejemplo-quince/01.webp",
        "assets/img/testimonios/ejemplo-quince/02.webp",
        "assets/img/salon-lamparas.webp"
      ]
    },
    {
      texto: "(Ejemplo) Hicimos el bautizo de nuestro hijo con toda la familia. Espacio amplio, cómodo y muy bien atendido.",
      nombre: "Cliente de ejemplo",
      evento: "Bautizo · ejemplo",
      fotos: [
        "assets/img/testimonios/ejemplo-bautizo/01.webp",
        "assets/img/salon-escalera.webp"
      ]
    },
    {
      texto: "(Ejemplo) Nuestra fiesta de promoción fue un éxito. Cabía toda la promoción con sus familias y la música se escuchaba perfecto.",
      nombre: "Cliente de ejemplo",
      evento: "Graduación · ejemplo",
      fotos: ["assets/img/testimonios/ejemplo-graduacion/01.webp"]
    }
    // ===== FIN DE LOS EJEMPLOS =====
  ]
};
