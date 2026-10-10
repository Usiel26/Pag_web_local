/* Los Ficus · interacción del sitio */
(function () {
  "use strict";

  var CFG = window.LOS_FICUS_CONFIG || {};
  var usaApi = Boolean(CFG.appsScriptUrl);

  /* ---------- Enlaces de WhatsApp e Instagram ---------- */
  function linkWhatsapp(texto) {
    return "https://wa.me/" + CFG.whatsapp + "?text=" + encodeURIComponent(texto || CFG.whatsappMensaje || "");
  }

  document.querySelectorAll('[data-link="whatsapp"]').forEach(function (a) {
    if (CFG.whatsapp) a.href = linkWhatsapp();
  });
  document.querySelectorAll('[data-link="instagram"]').forEach(function (a) {
    if (CFG.instagram) a.href = CFG.instagram;
  });

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Menú en celular ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("menu");

  function cerrarMenu() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", function () {
    var abierto = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(abierto));
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) cerrarMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      cerrarMenu();
      toggle.focus();
    }
  });

  /* ---------- Agenda de citas ---------- */
  var form = document.getElementById("booking-form");
  var fechaInput = document.getElementById("fecha-cita");
  var fechaHint = document.getElementById("fecha-hint");
  var slotsBox = document.getElementById("slots");
  var slotsStatus = document.getElementById("slots-status");
  var errorBox = document.getElementById("form-error");
  var submitBtn = document.getElementById("submit-btn");
  var done = document.getElementById("booking-done");
  var doneText = document.getElementById("done-text");
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

  function aISO(d) {
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var dia = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + dia;
  }
  function desdeISO(s) {
    var p = s.split("-").map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function fechaLarga(s) {
    return new Intl.DateTimeFormat("es-PE", { weekday: "long", day: "numeric", month: "long" }).format(desdeISO(s));
  }

  var hoy = new Date();
  var max = new Date();
  max.setDate(max.getDate() + (CFG.diasMaximos || 60));
  fechaInput.min = aISO(hoy);
  fechaInput.max = aISO(max);
  document.getElementById("fecha-evento").min = aISO(hoy);

  var diasAtencion = CFG.diasAtencion || [1, 2, 3, 4, 5, 6];
  fechaHint.textContent = "Atendemos " + describirDias(diasAtencion) + ".";

  function describirDias(dias) {
    var orden = dias.slice().sort(function (a, b) { return ((a + 6) % 7) - ((b + 6) % 7); });
    var consecutivos = orden.every(function (d, i) { return i === 0 || (orden[i - 1] + 1) % 7 === d; });
    if (consecutivos && orden.length > 2) return "de " + DIAS[orden[0]] + " a " + DIAS[orden[orden.length - 1]];
    return "los " + orden.map(function (d) { return DIAS[d] + (d === 0 || d === 6 ? "s" : ""); }).join(", ");
  }

  function pintarSlots(slots) {
    slotsBox.innerHTML = "";
    slots.forEach(function (s) {
      var label = document.createElement("label");
      label.className = "slot";
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "hora";
      input.value = s.hora;
      input.disabled = !s.disponible;
      var span = document.createElement("span");
      span.textContent = s.hora;
      if (!s.disponible) span.title = "Horario ocupado";
      label.append(input, span);
      slotsBox.appendChild(label);
    });
    var libres = slots.filter(function (s) { return s.disponible; }).length;
    slotsStatus.classList.toggle("is-error", libres === 0);
    slotsStatus.textContent = libres === 0
      ? "No quedan horarios libres ese día. Prueba con otra fecha."
      : "Elige una hora. Cada cita dura alrededor de una hora.";
  }

  function slotsLocales(fecha) {
    var esHoy = fecha === aISO(new Date());
    var ahora = new Date();
    return (CFG.horarios || []).map(function (h) {
      var p = h.split(":").map(Number);
      var pasado = esHoy && (p[0] < ahora.getHours() + 1);
      return { hora: h, disponible: !pasado };
    });
  }

  var consultaActual = 0;
  function cargarHorarios() {
    var fecha = fechaInput.value;
    slotsBox.innerHTML = "";
    fechaInput.removeAttribute("aria-invalid");
    fechaHint.classList.remove("is-error");
    if (!fecha) {
      slotsStatus.textContent = "Primero elige un día.";
      return;
    }
    if (fecha < fechaInput.min || fecha > fechaInput.max) {
      marcarFecha("Elige una fecha entre hoy y los próximos " + (CFG.diasMaximos || 60) + " días.");
      return;
    }
    if (diasAtencion.indexOf(desdeISO(fecha).getDay()) === -1) {
      marcarFecha("Ese día no atendemos. Atendemos " + describirDias(diasAtencion) + ".");
      return;
    }

    if (!usaApi) {
      pintarSlots(slotsLocales(fecha));
      return;
    }

    var id = ++consultaActual;
    slotsStatus.classList.remove("is-error");
    slotsStatus.textContent = "Buscando horarios libres…";
    fetch(CFG.appsScriptUrl + "?accion=disponibilidad&fecha=" + encodeURIComponent(fecha))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (id !== consultaActual) return; // el usuario ya eligió otra fecha
        if (!data.ok) throw new Error(data.mensaje || "Sin respuesta");
        pintarSlots(data.horarios);
      })
      .catch(function () {
        if (id !== consultaActual) return;
        slotsStatus.classList.add("is-error");
        slotsStatus.textContent = "No pudimos cargar los horarios. Revisa tu conexión o escríbenos por WhatsApp.";
      });
  }

  function marcarFecha(msg) {
    fechaInput.setAttribute("aria-invalid", "true");
    fechaHint.classList.add("is-error");
    fechaHint.textContent = msg;
    slotsStatus.textContent = "";
  }

  fechaInput.addEventListener("change", cargarHorarios);

  function datosFormulario() {
    var fd = new FormData(form);
    var datos = {};
    fd.forEach(function (v, k) { datos[k] = typeof v === "string" ? v.trim() : v; });
    return datos;
  }

  function validar(datos) {
    var faltan = [];
    form.querySelectorAll("[aria-invalid]").forEach(function (el) {
      if (el !== fechaInput) el.removeAttribute("aria-invalid");
    });
    function marcar(id, nombre) {
      document.getElementById(id).setAttribute("aria-invalid", "true");
      faltan.push(nombre);
    }
    if (!datos.fechaCita || fechaInput.getAttribute("aria-invalid") === "true") marcar("fecha-cita", "día de la cita");
    if (!datos.hora) faltan.push("hora");
    if (!datos.nombre || datos.nombre.length < 3) marcar("nombre", "nombre");
    var cel = (datos.celular || "").replace(/[\s-]/g, "").replace(/^\+?51/, "");
    if (!/^9\d{8}$/.test(cel)) marcar("celular", "celular (9 dígitos, empieza con 9)");
    else datos.celular = cel;
    if (!document.getElementById("correo").checkValidity() || !datos.correo) marcar("correo", "correo");
    if (!datos.tipoEvento) marcar("tipo", "tipo de evento");
    return faltan;
  }

  function mostrarError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }

  function terminar(titulo, texto) {
    done.querySelector("h3").textContent = titulo;
    doneText.textContent = texto;
    form.hidden = true;
    done.hidden = false;
    done.focus();
  }

  function mensajeWhatsapp(d) {
    return [
      "Hola, quiero agendar una cita en Los Ficus.",
      "Día: " + fechaLarga(d.fechaCita) + " a las " + d.hora,
      "Nombre: " + d.nombre,
      "Celular: " + d.celular,
      "Correo: " + d.correo,
      "Evento: " + d.tipoEvento + (d.invitados ? " (" + d.invitados + " invitados aprox.)" : ""),
      d.fechaEvento ? "Fecha del evento: " + fechaLarga(d.fechaEvento) : "",
      d.comentarios ? "Comentarios: " + d.comentarios : ""
    ].filter(Boolean).join("\n");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorBox.hidden = true;
    var datos = datosFormulario();
    if (datos.website) return; // trampa para bots

    var faltan = validar(datos);
    if (faltan.length) {
      mostrarError("Revisa estos campos: " + faltan.join(", ") + ".");
      var primero = form.querySelector('[aria-invalid="true"]');
      if (primero) primero.focus();
      return;
    }

    if (!usaApi) {
      window.open(linkWhatsapp(mensajeWhatsapp(datos)), "_blank", "noopener");
      terminar("Solicitud lista", "Te abrimos WhatsApp con los datos de tu cita. Envía el mensaje y te confirmamos el horario.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Agendando…";
    fetch(CFG.appsScriptUrl, {
      method: "POST",
      // text/plain evita la verificación CORS previa que Apps Script no admite
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(datos)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.ok) {
          terminar("Cita agendada", "Te esperamos el " + fechaLarga(datos.fechaCita) + " a las " + datos.hora +
            ". Te enviamos la confirmación a " + datos.correo + ".");
          return;
        }
        if (res.error === "ocupado") {
          mostrarError("Ese horario acaba de ocuparse. Elige otra hora.");
          cargarHorarios();
        } else {
          mostrarError(res.mensaje || "No pudimos agendar la cita. Inténtalo de nuevo o escríbenos por WhatsApp.");
        }
      })
      .catch(function () {
        mostrarError("No pudimos conectar con la agenda. Revisa tu conexión o escríbenos por WhatsApp.");
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Agendar cita";
      });
  });

  document.getElementById("new-booking").addEventListener("click", function () {
    form.reset();
    slotsBox.innerHTML = "";
    slotsStatus.textContent = "Primero elige un día.";
    done.hidden = true;
    form.hidden = false;
    fechaInput.focus();
  });
})();
