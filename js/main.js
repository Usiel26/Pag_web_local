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

  /* ---------- Testimonios con galería ---------- */
  var MAX_MINIATURAS = 3; // fotos pequeñas bajo la principal

  function normalizarFotos(fotos, t) {
    return (fotos || []).map(function (f, i) {
      if (typeof f === "string") f = { src: f };
      return { src: f.src, alt: f.alt || ("Decoración del evento de " + t.nombre + ", foto " + (i + 1)) };
    }).filter(function (f) { return f.src; });
  }

  function crearFoto(foto, indice, total, clase, extra) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "t-photo " + clase;
    btn.dataset.index = indice;
    btn.setAttribute("aria-label", "Ver foto " + (indice + 1) + " de " + total + " en grande");
    var img = document.createElement("img");
    img.src = foto.src;
    img.alt = foto.alt;
    img.loading = "lazy";
    btn.appendChild(img);
    if (extra) {
      var mas = document.createElement("span");
      mas.className = "t-more";
      mas.textContent = "+" + extra;
      btn.appendChild(mas);
    }
    return btn;
  }

  var testimonios = (CFG.testimonios || []).filter(function (t) { return t && t.texto && t.nombre; });
  if (testimonios.length) {
    var lista = document.getElementById("testimonios-lista");
    testimonios.forEach(function (t) {
      var fotos = normalizarFotos(t.fotos, t);
      var art = document.createElement("article");
      art.className = "testimonial" + (fotos.length ? " has-photos" : "");

      var fig = document.createElement("figure");
      fig.className = "t-quote";
      var quote = document.createElement("blockquote");
      var p = document.createElement("p");
      p.textContent = t.texto;
      quote.appendChild(p);
      var cap = document.createElement("figcaption");
      var nombre = document.createElement("strong");
      nombre.textContent = t.nombre;
      cap.appendChild(nombre);
      if (t.evento) {
        var ev = document.createElement("span");
        ev.textContent = t.evento;
        cap.appendChild(ev);
      }
      fig.append(quote, cap);

      if (fotos.length) {
        var gal = document.createElement("div");
        gal.className = "t-gallery";
        if (fotos.length === 2) {
          // dos fotos: lado a lado, del mismo tamaño
          var par = document.createElement("div");
          par.className = "t-thumbs t-pair";
          fotos.forEach(function (f, i) { par.appendChild(crearFoto(f, i, 2, "t-thumb")); });
          gal.appendChild(par);
        } else {
          gal.appendChild(crearFoto(fotos[0], 0, fotos.length, "t-main"));
          var resto = fotos.slice(1, 1 + MAX_MINIATURAS);
          if (resto.length) {
            var thumbs = document.createElement("div");
            thumbs.className = "t-thumbs";
            thumbs.style.setProperty("--cols", resto.length);
            resto.forEach(function (f, i) {
              var ultimo = i === resto.length - 1;
              var ocultas = fotos.length - 1 - MAX_MINIATURAS;
              thumbs.appendChild(crearFoto(f, i + 1, fotos.length, "t-thumb", ultimo && ocultas > 0 ? ocultas : 0));
            });
            gal.appendChild(thumbs);
          }
        }
        gal.addEventListener("click", function (e) {
          var b = e.target.closest(".t-photo");
          if (b) abrirVisor(fotos, Number(b.dataset.index), t.evento ? t.nombre + ", " + t.evento : t.nombre);
        });
        art.appendChild(gal);
      }
      art.appendChild(fig);
      art.setAttribute("aria-roledescription", "testimonio");
      lista.appendChild(art);
    });
    document.getElementById("testimonios").hidden = false;
    iniciarCarrusel(lista);
  } else {
    // sin testimonios: quitar el enlace del menú
    var navT = document.querySelector('[data-nav="testimonios"]');
    if (navT) navT.remove();
  }

  /* ---------- Carrusel de testimonios ---------- */
  function iniciarCarrusel(track) {
    var slides = Array.prototype.slice.call(track.children);
    var prev = document.getElementById("t-prev");
    var next = document.getElementById("t-next");
    var dotsBox = document.getElementById("t-dots");
    var total = slides.length;

    slides.forEach(function (sl, i) { sl.setAttribute("aria-label", (i + 1) + " de " + total); });

    if (total < 2) {
      document.querySelector(".t-nav").hidden = true;
      return;
    }

    var dots = slides.map(function (sl, i) {
      var d = document.createElement("button");
      d.type = "button";
      d.className = "t-dot";
      d.setAttribute("aria-label", "Ir al testimonio " + (i + 1));
      d.addEventListener("click", function () { ir(i); });
      dotsBox.appendChild(d);
      return d;
    });

    function actual() {
      return Math.round(track.scrollLeft / track.clientWidth);
    }
    function ir(i) {
      i = Math.max(0, Math.min(total - 1, i));
      track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
    }
    function actualizar() {
      var i = actual();
      prev.disabled = i <= 0;
      next.disabled = i >= total - 1;
      dots.forEach(function (d, k) {
        d.classList.toggle("is-active", k === i);
        if (k === i) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
      slides.forEach(function (sl, k) { sl.inert = k !== i; });
    }

    prev.addEventListener("click", function () { ir(actual() - 1); });
    next.addEventListener("click", function () { ir(actual() + 1); });
    track.addEventListener("keydown", function (e) {
      if (e.target !== track) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); ir(actual() - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); ir(actual() + 1); }
    });
    var espera;
    track.addEventListener("scroll", function () {
      clearTimeout(espera);
      espera = setTimeout(actualizar, 60);
    }, { passive: true });
    window.addEventListener("resize", function () { ir(actual()); });
    actualizar();
  }

  /* ---------- Visor de fotos ---------- */
  var visor = document.getElementById("lightbox");
  var visorImg = document.getElementById("lb-img");
  var visorCap = document.getElementById("lb-cap");
  var visorFotos = [], visorIndice = 0, visorTitulo = "", visorOrigen = null;

  function mostrarFoto(i) {
    visorIndice = (i + visorFotos.length) % visorFotos.length;
    var f = visorFotos[visorIndice];
    visorImg.src = f.src;
    visorImg.alt = f.alt;
    visorCap.textContent = visorTitulo + " · " + (visorIndice + 1) + " de " + visorFotos.length;
    visor.classList.toggle("single", visorFotos.length < 2);
  }
  function abrirVisor(fotos, i, titulo) {
    visorFotos = fotos;
    visorTitulo = titulo;
    visorOrigen = document.activeElement;
    mostrarFoto(i);
    if (typeof visor.showModal === "function") visor.showModal();
    else visor.setAttribute("open", "");
  }
  function cerrarVisor() {
    if (visor.open) visor.close();
  }
  var galeriaSalon = document.getElementById("galeria");
  if (galeriaSalon) {
    var botonesSalon = Array.prototype.slice.call(galeriaSalon.querySelectorAll(".s-photo"));
    var fotosSalon = botonesSalon.map(function (btn, i) {
      var img = btn.querySelector("img");
      btn.setAttribute("aria-label", "Ver foto " + (i + 1) + " de " + botonesSalon.length + " en grande: " + img.alt);
      return { src: btn.dataset.full || img.src, alt: img.alt };
    });
    galeriaSalon.addEventListener("click", function (e) {
      var b = e.target.closest(".s-photo");
      if (b) abrirVisor(fotosSalon, botonesSalon.indexOf(b), "El salón");
    });
  }

  if (visor) {
    visor.querySelector(".lb-prev").addEventListener("click", function () { mostrarFoto(visorIndice - 1); });
    visor.querySelector(".lb-next").addEventListener("click", function () { mostrarFoto(visorIndice + 1); });
    visor.querySelector(".lb-close").addEventListener("click", cerrarVisor);
    visor.addEventListener("click", function (e) { if (e.target === visor) cerrarVisor(); });
    visor.addEventListener("close", function () {
      visorImg.removeAttribute("src");
      if (visorOrigen) visorOrigen.focus();
    });
    visor.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") mostrarFoto(visorIndice - 1);
      if (e.key === "ArrowRight") mostrarFoto(visorIndice + 1);
    });
    var toqueX = null;
    visor.addEventListener("touchstart", function (e) { toqueX = e.touches[0].clientX; }, { passive: true });
    visor.addEventListener("touchend", function (e) {
      if (toqueX === null) return;
      var dx = e.changedTouches[0].clientX - toqueX;
      if (Math.abs(dx) > 50) mostrarFoto(visorIndice + (dx < 0 ? 1 : -1));
      toqueX = null;
    });
  }

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
      : "Elige una hora.";
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
