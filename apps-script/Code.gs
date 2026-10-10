/**
 * Los Ficus · Agenda de citas
 *
 * Web App de Google Apps Script que conecta el formulario del sitio
 * con el Google Calendar de la empresa. Se publica desde la cuenta de
 * Los Ficus, así que los eventos se crean en SU calendario (no en el
 * del cliente). Instrucciones en apps-script/README.md.
 */

var CONFIG = {
  CALENDAR_ID: "primary",                 // o el ID de un calendario dedicado a citas
  ZONA: "America/Lima",
  HORARIOS: ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"],
  DURACION_MIN: 60,
  DIAS_ATENCION: [1, 2, 3, 4, 5, 6],      // 0 = domingo … 6 = sábado
  DIAS_MAXIMOS: 60,
  ANTICIPACION_MIN: 60,                   // no permitir citas que empiezan en menos de 1 hora
  ENVIAR_CONFIRMACION: true,              // correo de confirmación al cliente
  CORREO_AVISO: "",                       // correo extra para avisar de cada cita (opcional)
  NOMBRE_NEGOCIO: "Los Ficus · Centro de eventos",
  DIRECCION: "Cruce de Av. Cutervo, Ica",
  WHATSAPP: "+51 941 497 280"
};

/* GET ?accion=disponibilidad&fecha=YYYY-MM-DD */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.accion !== "disponibilidad") return json({ ok: true, servicio: "agenda-los-ficus" });

  var error = validarFecha(p.fecha);
  if (error) return json({ ok: false, mensaje: error });

  return json({ ok: true, fecha: p.fecha, horarios: horariosDelDia(p.fecha) });
}

/* POST con el JSON del formulario */
function doPost(e) {
  var d;
  try {
    d = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, mensaje: "Datos inválidos." });
  }
  if (d.website) return json({ ok: true }); // bot: fingir éxito

  var error = validarFecha(d.fechaCita) || validarDatos(d);
  if (error) return json({ ok: false, mensaje: error });
  if (CONFIG.HORARIOS.indexOf(d.hora) === -1) return json({ ok: false, mensaje: "Hora no válida." });

  // El bloqueo evita que dos personas reserven el mismo horario a la vez
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return json({ ok: false, mensaje: "La agenda está ocupada. Inténtalo en unos segundos." });

  try {
    var slot = horariosDelDia(d.fechaCita).filter(function (h) { return h.hora === d.hora; })[0];
    if (!slot || !slot.disponible) return json({ ok: false, error: "ocupado" });

    var inicio = fechaHora(d.fechaCita, d.hora);
    var fin = new Date(inicio.getTime() + CONFIG.DURACION_MIN * 60000);

    var descripcion = [
      "Cliente: " + d.nombre,
      "Celular: " + d.celular,
      "Correo: " + d.correo,
      "Tipo de evento: " + d.tipoEvento,
      d.invitados ? "Invitados aprox.: " + d.invitados : "",
      d.fechaEvento ? "Fecha del evento: " + d.fechaEvento : "",
      d.comentarios ? "Comentarios: " + d.comentarios : ""
    ].filter(Boolean).join("\n") +
      "\n\nWhatsApp: https://wa.me/51" + d.celular + "\nAgendado desde la página web";

    calendario().createEvent("Cita · " + d.tipoEvento + " · " + d.nombre, inicio, fin, {
      description: descripcion,
      location: CONFIG.DIRECCION
    });
  } finally {
    lock.releaseLock();
  }

  enviarCorreos(d);
  return json({ ok: true });
}

/* ---------- Utilidades ---------- */

function calendario() {
  var cal = CONFIG.CALENDAR_ID === "primary"
    ? CalendarApp.getDefaultCalendar()
    : CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
  if (!cal) throw new Error("No se encontró el calendario " + CONFIG.CALENDAR_ID);
  return cal;
}

function fechaHora(fecha, hora) {
  return Utilities.parseDate(fecha + " " + hora, CONFIG.ZONA, "yyyy-MM-dd HH:mm");
}

function horariosDelDia(fecha) {
  var desde = fechaHora(fecha, "00:00");
  var hasta = new Date(desde.getTime() + 24 * 3600000);
  var eventos = calendario().getEvents(desde, hasta);
  var limite = new Date(Date.now() + CONFIG.ANTICIPACION_MIN * 60000);

  return CONFIG.HORARIOS.map(function (h) {
    var ini = fechaHora(fecha, h);
    var fin = new Date(ini.getTime() + CONFIG.DURACION_MIN * 60000);
    var choca = eventos.some(function (ev) {
      if (ev.isAllDayEvent()) return false; // los eventos de todo el día no bloquean
      return ev.getStartTime() < fin && ev.getEndTime() > ini;
    });
    return { hora: h, disponible: !choca && ini > limite };
  });
}

function validarFecha(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || "")) return "Fecha no válida.";
  var dia = fechaHora(fecha, "12:00");
  var dow = Number(Utilities.formatDate(dia, CONFIG.ZONA, "u")) % 7; // u: 1 = lunes … 7 = domingo
  if (CONFIG.DIAS_ATENCION.indexOf(dow) === -1) return "Ese día no atendemos.";
  var hoy = Utilities.formatDate(new Date(), CONFIG.ZONA, "yyyy-MM-dd");
  if (fecha < hoy) return "La fecha ya pasó.";
  var max = new Date(Date.now() + CONFIG.DIAS_MAXIMOS * 86400000);
  if (fecha > Utilities.formatDate(max, CONFIG.ZONA, "yyyy-MM-dd")) return "Esa fecha todavía no está disponible.";
  return "";
}

function validarDatos(d) {
  if (!d.nombre || String(d.nombre).length < 3) return "Falta el nombre.";
  if (!/^9\d{8}$/.test(String(d.celular || ""))) return "El celular debe tener 9 dígitos.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(d.correo || ""))) return "El correo no es válido.";
  if (!d.tipoEvento) return "Falta el tipo de evento.";
  ["nombre", "correo", "tipoEvento", "comentarios", "fechaEvento", "invitados"].forEach(function (k) {
    if (d[k]) d[k] = String(d[k]).slice(0, k === "comentarios" ? 500 : 100);
  });
  return "";
}

function enviarCorreos(d) {
  var cuando = fechaLarga(d.fechaCita) + " a las " + d.hora;
  try {
    if (CONFIG.ENVIAR_CONFIRMACION) {
      MailApp.sendEmail({
        to: d.correo,
        name: CONFIG.NOMBRE_NEGOCIO,
        subject: "Tu cita en Los Ficus está agendada",
        body: "Hola " + d.nombre + ",\n\n" +
          "Agendamos tu cita para conocer el salón: " + cuando + ".\n" +
          "Dirección: " + CONFIG.DIRECCION + "\n\n" +
          "Si necesitas cambiar la hora, escríbenos por WhatsApp al " + CONFIG.WHATSAPP + ".\n\n" +
          CONFIG.NOMBRE_NEGOCIO
      });
    }
    if (CONFIG.CORREO_AVISO) {
      MailApp.sendEmail(CONFIG.CORREO_AVISO, "Nueva cita: " + d.nombre + " · " + cuando,
        "Tipo de evento: " + d.tipoEvento + "\nCelular: " + d.celular + "\nCorreo: " + d.correo);
    }
  } catch (err) {
    // La cita ya quedó en el calendario; un fallo de correo no debe anularla
    console.error(err);
  }
}

function fechaLarga(fecha) {
  var dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
    "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var p = fecha.split("-").map(Number);
  var dow = new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay();
  return dias[dow] + " " + p[2] + " de " + meses[p[1] - 1];
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Ejecuta esta función una vez desde el editor para dar los permisos. */
function autorizar() {
  Logger.log(calendario().getName());
  Logger.log(MailApp.getRemainingDailyQuota() + " correos disponibles hoy");
}
