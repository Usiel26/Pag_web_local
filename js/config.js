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
    // Vacío a propósito: la sección aparece sola cuando agregas el primero.
    // Los ejemplos anteriores usaban fotos de otros locales y no deben
    // publicarse. Usa el formato de arriba con fotos de eventos reales.
  ],

  // Ficha del salón. Cada dato aparece en "El salón por dentro" solo cuando
  // tiene "valor". Completa con datos reales; no inventes cifras.
  ficha: [
    { dato: "Capacidad", valor: "" },        // p. ej. "Hasta 250 invitados sentados"
    { dato: "Área del salón", valor: "" },   // p. ej. "400 m²"
    { dato: "Estacionamiento", valor: "" },  // p. ej. "Para 20 autos"
    { dato: "Incluye", valor: "" }           // p. ej. "Mesas, sillas, mantelería y sonido"
  ],

  // Preguntas frecuentes. Solo se muestran las que tienen "respuesta".
  // Las vacías son las preguntas que más hacen los clientes: complétalas.
  preguntas: [
    {
      pregunta: "¿Puedo ver el salón antes de reservar?",
      respuesta: "Sí. Agenda una visita en esta página o escríbenos por WhatsApp. Te atendemos de lunes a sábado, de 10:00 a 13:00 y de 15:00 a 18:00."
    },
    {
      pregunta: "¿Cómo cotizo mi evento?",
      respuesta: "En la visita revisamos contigo la fecha, el número de invitados y lo que necesitas, y te damos la cotización. Si prefieres, adelántanos esos datos por WhatsApp."
    },
    {
      pregunta: "¿Qué eventos realizan?",
      respuesta: "Bodas, quinceañeros, bautizos, primeras comuniones, fiestas de promoción, cumpleaños y aniversarios. Si tu evento es otro, cuéntanos."
    },
    {
      pregunta: "¿Dónde queda el local?",
      respuesta: "En el cruce de la Av. Cutervo, en Ica. En la sección Cómo llegar tienes el mapa y el enlace a Google Maps."
    },
    { pregunta: "¿Cuántos invitados entran en el salón?", respuesta: "" },
    { pregunta: "¿Qué incluye el alquiler del local?", respuesta: "" },
    { pregunta: "¿Puedo traer mi propio catering, decoración o DJ?", respuesta: "" },
    { pregunta: "¿Cómo separo la fecha y cuánto es el adelanto?", respuesta: "" },
    { pregunta: "¿Hasta qué hora puede durar el evento?", respuesta: "" },
    { pregunta: "¿Tienen estacionamiento?", respuesta: "" }
  ]
};
