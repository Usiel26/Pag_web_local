/* Los Ficus · movimiento e interacción
   Reglas que sigue este archivo:
   - Cada animación tiene un propósito: orientar, responder o revelar.
   - Solo se anima transform, opacity y clip-path (fluido en celulares).
   - Nada se repite en cada sección y nada bloquea la lectura.
   - Con "reducir movimiento" activado todo queda visible y quieto. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hayIO = "IntersectionObserver" in window;

  /* ---------- Menú: línea dorada en la sección donde estás ---------- */
  var nav = document.querySelector(".site-nav");
  var escritorio = window.matchMedia("(min-width: 960px)");
  if (nav && hayIO) {
    var linea = document.createElement("span");
    linea.className = "nav-indicator";
    linea.setAttribute("aria-hidden", "true");
    nav.appendChild(linea);

    var enlaces = {};
    nav.querySelectorAll('ul a[href^="#"]').forEach(function (a) { enlaces[a.getAttribute("href").slice(1)] = a; });
    var activo = null;

    var mover = function (a) {
      Object.keys(enlaces).forEach(function (k) {
        if (enlaces[k] === a) enlaces[k].setAttribute("aria-current", "location");
        else enlaces[k].removeAttribute("aria-current");
      });
      if (!a || !escritorio.matches || !a.isConnected) { linea.style.opacity = "0"; return; }
      var n = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
      linea.style.opacity = "1";
      linea.style.transform = "translate(" + (r.left - n.left) + "px, " + (r.bottom - n.top - 8) + "px) scaleX(" + r.width + ")";
    };

    var vistas = {};
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { vistas[e.target.id] = e.isIntersecting; });
      var id = null;
      document.querySelectorAll("main > section[id]").forEach(function (s) { if (vistas[s.id]) id = s.id; });
      var a = id ? enlaces[id] || null : null;
      if (a !== activo) { activo = a; mover(a); }
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main > section[id]").forEach(function (s) { io.observe(s); });
    window.addEventListener("resize", function () { mover(activo); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { mover(activo); });
  }

  /* ---------- El salón: las fotos se descubren como una cortina ---------- */
  var grilla = document.querySelector(".salon-grid");
  if (grilla && hayIO && !reduce) {
    grilla.classList.add("reveal-ready");
    new IntersectionObserver(function (entradas, obs) {
      if (entradas[0].isIntersecting) {
        grilla.classList.add("is-in");
        obs.disconnect();
      }
    }, { threshold: 0.2 }).observe(grilla);
  }

  /* ---------- Frase: las palabras se encienden al bajar ---------- */
  var frase = document.getElementById("frase");
  if (frase && !reduce) {
    // separa cada palabra en un <span> sin perder los acentos ni el texto
    var palabras = [];
    var partir = function (nodo) {
      Array.prototype.slice.call(nodo.childNodes).forEach(function (hijo) {
        if (hijo.nodeType === 3) {
          var frag = document.createDocumentFragment();
          hijo.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            var s = document.createElement("span");
            s.className = "sw";
            s.textContent = t;
            palabras.push(s);
            frag.appendChild(s);
          });
          nodo.replaceChild(frag, hijo);
        } else if (hijo.nodeType === 1) {
          partir(hijo);
        }
      });
    };
    partir(frase);
    frase.classList.add("is-scrub");

    var encendidas = -1, pendiente = false;
    var pintar = function () {
      pendiente = false;
      var r = frase.getBoundingClientRect(), vh = window.innerHeight;
      var p = (vh * 0.8 - r.top) / (r.height + vh * 0.3);
      var n = Math.round(Math.max(0, Math.min(1, p)) * palabras.length);
      if (n === encendidas) return;
      encendidas = n;
      palabras.forEach(function (w, i) { w.classList.toggle("on", i < n); });
    };
    window.addEventListener("scroll", function () {
      if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); }
    }, { passive: true });
    window.addEventListener("resize", pintar);
    pintar();
  }

  /* ---------- Agenda: los pasos se marcan mientras llenas el formulario ---------- */
  var form = document.getElementById("booking-form");
  var hecho = document.getElementById("booking-done");
  var pasos = document.querySelectorAll(".steps [data-paso]");
  if (form && pasos.length) {
    var valor = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
    var invalido = function (id) { var el = document.getElementById(id); return el && el.getAttribute("aria-invalid") === "true"; };
    var revisar = function () {
      var p1 = valor("fecha-cita") && !invalido("fecha-cita") && form.querySelector('input[name="hora"]:checked');
      var cel = valor("celular").replace(/[\s-]/g, "").replace(/^\+?51/, "");
      var correo = document.getElementById("correo");
      var p2 = valor("nombre").length >= 3 && /^9\d{8}$/.test(cel) &&
        correo && correo.value.trim() && correo.checkValidity() && valor("tipo");
      var p3 = hecho && !hecho.hidden;
      [p1, p2, p3].forEach(function (ok, i) {
        if (pasos[i]) pasos[i].classList.toggle("is-done", Boolean(ok));
      });
    };
    form.addEventListener("input", revisar);
    form.addEventListener("change", revisar);
    if (hecho && "MutationObserver" in window) {
      new MutationObserver(revisar).observe(hecho, { attributes: true, attributeFilter: ["hidden"] });
    }
  }

  /* ---------- Horarios: aparecen en una cascada corta ---------- */
  var slots = document.getElementById("slots");
  if (slots && "MutationObserver" in window) {
    new MutationObserver(function () {
      Array.prototype.forEach.call(slots.children, function (el, i) { el.style.setProperty("--i", i); });
    }).observe(slots, { childList: true });
  }
})();
