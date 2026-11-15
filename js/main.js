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
  // Mientras no haya un perfil real de Instagram, se ocultan sus botones
  var igReal = CFG.instagram && !/^https?:\/\/(www\.)?instagram\.com\/?$/.test(CFG.instagram);
  document.querySelectorAll('[data-link="instagram"]').forEach(function (a) {
    if (igReal) a.href = CFG.instagram;
    else (a.closest("li") || a).remove();
  });

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Menú en celular ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("menu");

  function cerrarMenu() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.documentElement.style.overflow = "";
    actualizarBarra();
  }

  toggle.addEventListener("click", function () {
    var abierto = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(abierto));
    // con el menú abierto la página de atrás no se desplaza
    document.documentElement.style.overflow = abierto ? "hidden" : "";
    actualizarBarra();
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
  document.addEventListener("click", function (e) {
    if (nav.classList.contains("is-open") && !e.target.closest(".site-header")) cerrarMenu();
  });

  /* ---------- Barra de acciones: aparece después de la portada y se
     esconde sobre el formulario, para no repetir botones en pantalla ---------- */
  var barra = document.querySelector(".action-bar");
  var enPortada = true, enReserva = false;
  function actualizarBarra() {
    if (!barra) return;
    barra.classList.toggle("is-visible", !enPortada && !enReserva && !nav.classList.contains("is-open"));
  }
  if (barra && "IntersectionObserver" in window) {
    new IntersectionObserver(function (e) {
      enPortada = e[0].isIntersecting; actualizarBarra();
    }, { threshold: 0.05 }).observe(document.getElementById("inicio"));
    new IntersectionObserver(function (e) {
      enReserva = e[0].isIntersecting; actualizarBarra();
    }, { threshold: 0.1 }).observe(document.getElementById("reservar"));
  } else if (barra) {
    barra.classList.add("is-visible");
  }

  /* ---------- Encabezado: se oculta al bajar y vuelve al subir ---------- */
  var header = document.querySelector(".site-header");
  var ultimoY = window.scrollY;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    var bajando = y > ultimoY + 4;
    var subiendo = y < ultimoY - 4;
    if (bajando && y > 400 && !nav.classList.contains("is-open") && !header.contains(document.activeElement)) {
      header.classList.add("is-hidden");
    } else if (subiendo || y < 400) {
      header.classList.remove("is-hidden");
    }
    if (bajando || subiendo) ultimoY = y;
  }, { passive: true });
  // si el foco del teclado entra al encabezado, se vuelve a mostrar
  document.addEventListener("focusin", function (e) {
    if (header.contains(e.target)) header.classList.remove("is-hidden");
  });

  /* ---------- Ficha del salón (config.ficha) ---------- */
  var ficha = document.getElementById("ficha");
  var datosFicha = (CFG.ficha || []).filter(function (d) { return d && d.dato && d.valor; });
  if (ficha && datosFicha.length) {
    datosFicha.forEach(function (d) {
      var fila = document.createElement("div");
      var dt = document.createElement("dt");
      var dd = document.createElement("dd");
      dt.textContent = d.dato;
      dd.textContent = d.valor;
      fila.append(dt, dd);
      ficha.appendChild(fila);
    });
    ficha.classList.add("details");
    ficha.hidden = false;
  }

  /* ---------- Preguntas frecuentes (config.preguntas) ---------- */
  var faq = document.getElementById("faq-lista");
  var preguntas = (CFG.preguntas || []).filter(function (q) { return q && q.pregunta && q.respuesta; });
  if (faq && preguntas.length) {
    preguntas.forEach(function (q) {
      var fila = document.createElement("div");
      var dt = document.createElement("dt");
      var dd = document.createElement("dd");
      dt.textContent = q.pregunta;
      dd.textContent = q.respuesta;
      fila.append(dt, dd);
      faq.appendChild(fila);
    });
  } else if (faq) {
    document.getElementById("preguntas").hidden = true;
    var navP = document.querySelector('[data-nav="preguntas"]');
    if (navP) navP.remove();
  }

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
    btn.setAttribute("aria-label", (extra ? extra + (extra === 1 ? " foto más. " : " fotos más. ") : "") + "Ver foto " + (indice + 1) + " de " + total + " en grande");
    var img = document.createElement("img");
    // las miniaturas usan la versión "-mini" si existe (la crea optimizar_fotos.py)
    if (clase === "t-thumb" && /\.webp$/.test(foto.src)) {
      img.src = foto.src.replace(/\.webp$/, "-mini.webp");
      img.onerror = function () { img.onerror = null; img.src = foto.src; };
    } else {
      img.src = foto.src;
    }
    img.alt = foto.alt;
    img.loading = "lazy";
    btn.appendChild(img);
    if (extra) {
      // el "+N" se dibuja con CSS; el lector de pantalla lo escucha en aria-label
      btn.classList.add("has-more");
      btn.dataset.more = "+" + extra;
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
          if (!b) return;
          var botones = [];
          gal.querySelectorAll(".t-photo").forEach(function (x) { botones[Number(x.dataset.index)] = x; });
          abrirVisor(fotos, Number(b.dataset.index), t.evento ? t.nombre + ", " + t.evento : t.nombre, botones);
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

    // distancia entre un testimonio y el siguiente (en celular se asoma el siguiente)
    function paso() {
      return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth;
    }
    function actual() {
      return Math.round(track.scrollLeft / paso());
    }
    function ir(i) {
      i = Math.max(0, Math.min(total - 1, i));
      track.scrollTo({ left: i * paso(), behavior: reduceMotion.matches ? "auto" : "smooth" });
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

  /* ---------- Visor de fotos ----------
     La foto crece desde su miniatura y vuelve a ella al cerrar.
     Con el dedo: arrastrar a los lados cambia de foto, hacia abajo cierra.
     Mientras el dedo está abajo la foto lo sigue 1:1; al soltar decide
     por distancia o por velocidad (un toque rápido basta). */
  var visor = document.getElementById("lightbox");
  var visorImg = document.getElementById("lb-img");
  var visorCap = document.getElementById("lb-cap");
  var visorFig = visor ? visor.querySelector(".lb-figure") : null;
  var visorFotos = [], visorIndice = 0, visorTitulo = "", visorOrigen = null, visorBotones = [];
  var VACIO = visorImg ? visorImg.getAttribute("src") : "";
  var EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
  var FONDO = "rgba(16, 22, 17, 0.96)";
  var cerrando = false;
  var anima = function () { return !reduceMotion.matches && visorImg && typeof visorImg.animate === "function"; };

  function mostrarFoto(i, dir) {
    visorIndice = (i + visorFotos.length) % visorFotos.length;
    var f = visorFotos[visorIndice];
    visorImg.src = f.src;
    visorImg.alt = f.alt;
    visorCap.textContent = visorTitulo + " · " + (visorIndice + 1) + " de " + visorFotos.length;
    visor.classList.toggle("single", visorFotos.length < 2);
    if (dir && anima()) {
      // entra desde el lado hacia el que va el gesto
      visorImg.animate(
        [{ transform: "translateX(" + (dir * 56) + "px)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 320, easing: EASE }
      );
    }
  }

  // miniatura visible en la página para la foto actual (si la hay)
  function miniaturaActual() {
    var btn = visorBotones[visorIndice];
    var img = btn && btn.querySelector("img");
    if (!img) return null;
    var r = img.getBoundingClientRect();
    return (r.width && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth) ? img : null;
  }

  // transformación que lleva la foto grande al recuadro de la miniatura
  function haciaMiniatura(mini) {
    var de = mini.getBoundingClientRect(), a = visorImg.getBoundingClientRect();
    if (!a.width || !a.height) return null;
    var s = Math.max(de.width / a.width, de.height / a.height);
    var dx = de.left + de.width / 2 - (a.left + a.width / 2);
    var dy = de.top + de.height / 2 - (a.top + a.height / 2);
    var ix = Math.max(0, (a.width - de.width / s) / 2), iy = Math.max(0, (a.height - de.height / s) / 2);
    return {
      transform: "translate(" + dx + "px, " + dy + "px) scale(" + s + ")",
      clipPath: "inset(" + iy + "px " + ix + "px)"
    };
  }

  function abrirVisor(fotos, i, titulo, botones) {
    visorFotos = fotos;
    visorTitulo = titulo;
    visorBotones = botones || [];
    visorOrigen = visorBotones[i] || document.activeElement;
    cerrando = false;
    mostrarFoto(i);
    if (typeof visor.showModal === "function") visor.showModal();
    else visor.setAttribute("open", "");
    if (!anima()) return;
    var mini = miniaturaActual();
    visorImg.style.opacity = "0";
    var listo = visorImg.decode ? visorImg.decode().catch(function () {}) : Promise.resolve();
    listo.then(function () {
      visorImg.style.opacity = "";
      visor.animate([{ backgroundColor: "rgba(16, 22, 17, 0)" }, { backgroundColor: FONDO }], { duration: 280, easing: "ease" });
      visor.querySelectorAll(".lb-btn, figcaption").forEach(function (el) {
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: 160, easing: "ease", fill: "backwards" });
      });
      var desde = mini && haciaMiniatura(mini);
      if (desde) {
        visorImg.animate([desde, { transform: "none", clipPath: "inset(0px 0px)" }], { duration: 520, easing: EASE });
      } else {
        visorImg.animate([{ transform: "scale(0.96)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 300, easing: EASE });
      }
    });
  }

  function cerrarVisor() {
    if (!visor.open || cerrando) return;
    if (!anima()) { visor.close(); return; }
    cerrando = true;
    var mini = miniaturaActual();
    var hacia = mini && haciaMiniatura(mini);
    var actual = getComputedStyle(visorImg).transform;
    var inicio = { transform: actual === "none" ? "none" : actual, clipPath: "inset(0px 0px)", opacity: 1 };
    var fin = hacia ? hacia : { transform: "translateY(" + (visorImg.style.transform ? 220 : 24) + "px) scale(0.94)", clipPath: "inset(0px 0px)", opacity: 0 };
    // salir es más rápido que entrar
    var anim = visorImg.animate([inicio, fin], { duration: 300, easing: EASE, fill: "forwards" });
    visor.animate([{ backgroundColor: getComputedStyle(visor).backgroundColor }, { backgroundColor: "rgba(16, 22, 17, 0)" }], { duration: 300, easing: "ease", fill: "forwards" });
    visor.querySelectorAll(".lb-btn, figcaption").forEach(function (el) {
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: "forwards" });
    });
    anim.onfinish = function () { visor.close(); };
  }

  var botonesSalon = Array.prototype.slice.call(document.querySelectorAll('[data-gallery="salon"]'));
  var fotosSalon = botonesSalon.map(function (btn, i) {
    var img = btn.querySelector("img");
    btn.setAttribute("aria-label", "Ver foto " + (i + 1) + " de " + botonesSalon.length + " en grande: " + img.alt);
    btn.addEventListener("click", function () { abrirVisor(fotosSalon, i, "El salón", botonesSalon); });
    return { src: btn.dataset.full || img.src, alt: img.alt };
  });

  if (visor) {
    visor.querySelector(".lb-prev").addEventListener("click", function () { mostrarFoto(visorIndice - 1, -1); });
    visor.querySelector(".lb-next").addEventListener("click", function () { mostrarFoto(visorIndice + 1, 1); });
    visor.querySelector(".lb-close").addEventListener("click", cerrarVisor);
    visor.addEventListener("cancel", function (e) { e.preventDefault(); cerrarVisor(); });
    visor.addEventListener("close", function () {
      visor.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); });
      visorImg.style.transform = "";
      visorImg.style.transition = "";
      visor.style.backgroundColor = "";
      visorImg.src = VACIO;
      cerrando = false;
      if (visorOrigen) visorOrigen.focus({ preventScroll: true });
    });
    visor.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") mostrarFoto(visorIndice - 1, -1);
      if (e.key === "ArrowRight") mostrarFoto(visorIndice + 1, 1);
    });

    // tocar el fondo oscuro (no la foto ni los botones) cierra
    var huboArrastre = false;
    visor.addEventListener("click", function (e) {
      if (huboArrastre) { huboArrastre = false; return; }
      if (e.target === visor || e.target === visorFig) cerrarVisor();
    });

    var drag = null;
    function soltar(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag;
      drag = null;
      if (!d.eje) return;
      huboArrastre = true;
      var h = d.hist, v = 0;
      if (h.length > 1) {
        var dt = h[h.length - 1].t - h[0].t;
        if (dt > 0) v = (h[h.length - 1].v - h[0].v) / dt; // px por ms
      }
      visorImg.style.transition = "transform 320ms " + EASE;
      if (d.eje === "x") {
        var pasa = visorFotos.length > 1 && (Math.abs(d.d) > innerWidth * 0.22 || Math.abs(v) > 0.45);
        if (pasa) {
          var dir = (d.d !== 0 ? d.d : -v) < 0 ? 1 : -1;
          visorImg.style.transition = "transform 160ms ease-out";
          visorImg.style.transform = "translateX(" + (-dir * innerWidth * 0.5) + "px)";
          setTimeout(function () {
            visorImg.style.transition = "none";
            visorImg.style.transform = "";
            mostrarFoto(visorIndice + dir, dir);
          }, 160);
        } else {
          visorImg.style.transform = "";
        }
      } else {
        if (d.d > 120 || v > 0.5) {
          visorImg.style.transition = "";
          cerrarVisor();
        } else {
          visorImg.style.transform = "";
          visor.style.transition = "background-color 320ms ease";
          visor.style.backgroundColor = "";
        }
      }
    }
    visorImg.addEventListener("dragstart", function (e) { e.preventDefault(); });
    visorImg.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || cerrando) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, eje: null, d: 0, hist: [] };
    });
    visor.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.eje) {
        if (Math.hypot(dx, dy) < 10) return; // umbral antes de decidir la dirección
        drag.eje = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (drag.eje === "y" && dy < 0) { drag = null; return; }
        try { visorImg.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
        visorImg.style.transition = "none";
        visor.style.transition = "none";
      }
      var pos = drag.eje === "x" ? e.clientX : e.clientY;
      drag.hist.push({ v: pos, t: e.timeStamp });
      if (drag.hist.length > 5) drag.hist.shift();
      if (drag.eje === "x") {
        // con una sola foto, resistencia en lugar de un tope seco
        drag.d = visorFotos.length > 1 ? dx : dx * 0.25;
        visorImg.style.transform = "translateX(" + drag.d + "px)";
      } else {
        drag.d = Math.max(0, dy);
        var k = Math.min(drag.d / 500, 0.8);
        visorImg.style.transform = "translateY(" + drag.d + "px) scale(" + (1 - Math.min(drag.d / 1600, 0.2)) + ")";
        visor.style.backgroundColor = "rgba(16, 22, 17, " + (0.96 * (1 - k)) + ")";
      }
    });
    visor.addEventListener("pointerup", soltar);
    visor.addEventListener("pointercancel", soltar);
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

  /* Validación en línea: se revisa al salir de cada campo y el error
     desaparece apenas el dato se corrige (recomendación de Baymard). */
  var reglas = {
    nombre: function (v) { return v.trim().length >= 3 ? "" : "Escribe tu nombre y apellido."; },
    celular: function (v) {
      var c = v.replace(/[\s-]/g, "").replace(/^\+?51/, "");
      if (!c) return "Escribe tu número de celular.";
      return /^9\d{8}$/.test(c) ? "" : "El celular debe tener 9 dígitos y empezar con 9.";
    },
    correo: function (v, el) {
      if (!v.trim()) return "Escribe tu correo para enviarte la confirmación.";
      return el.checkValidity() ? "" : "Revisa el correo, por ejemplo: nombre@gmail.com";
    },
    tipo: function (v) { return v ? "" : "Elige el tipo de evento."; }
  };

  function revisarCampo(id) {
    var el = document.getElementById(id);
    var msg = reglas[id](el.value, el);
    var box = document.getElementById(id + "-error");
    if (msg) {
      el.setAttribute("aria-invalid", "true");
      box.textContent = msg;
      box.hidden = false;
    } else {
      el.removeAttribute("aria-invalid");
      box.hidden = true;
    }
    return !msg;
  }

  Object.keys(reglas).forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener("blur", function () { if (el.value) revisarCampo(id); });
    el.addEventListener(el.tagName === "SELECT" ? "change" : "input", function () {
      if (el.getAttribute("aria-invalid") === "true") revisarCampo(id);
    });
  });

  function validar(datos) {
    var faltan = [];
    if (!datos.fechaCita || fechaInput.getAttribute("aria-invalid") === "true") {
      fechaInput.setAttribute("aria-invalid", "true");
      faltan.push("el día");
    }
    if (!datos.hora) faltan.push("la hora");
    var camposOk = Object.keys(reglas).map(revisarCampo).every(Boolean);
    if (!camposOk) faltan.push("tus datos");
    datos.celular = (datos.celular || "").replace(/[\s-]/g, "").replace(/^\+?51/, "");
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
      mostrarError("Falta completar " + faltan.join(", ").replace(/, ([^,]*)$/, " y $1") + ".");
      var primero = form.querySelector('[aria-invalid="true"]') ||
        (!datos.hora && slotsBox.querySelector("input:not(:disabled)"));
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
        submitBtn.textContent = "Agendar visita";
      });
  });

  document.getElementById("new-booking").addEventListener("click", function () {
    form.reset();
    form.querySelectorAll(".field-error").forEach(function (el) { el.hidden = true; });
    form.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
    slotsBox.innerHTML = "";
    slotsStatus.textContent = "Primero elige un día.";
    done.hidden = true;
    form.hidden = false;
    fechaInput.focus();
  });
})();
