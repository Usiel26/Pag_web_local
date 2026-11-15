# Los Ficus · Centro de eventos

Sitio web del salón de eventos Los Ficus (Ica, Perú). Es una sola página responsive con botones de WhatsApp e Instagram y un formulario para agendar citas que se guardan en el Google Calendar de la empresa.

## Estructura

```
index.html            Página única: inicio, eventos, el salón, testimonios, agenda, preguntas y cómo llegar
css/styles.css        Estilos (mobile-first)
js/config.js          ← Datos editables: WhatsApp, Instagram, agenda, horarios, ficha, preguntas y testimonios
js/main.js            Menú, enlaces, visor de fotos y formulario de citas
js/motion.js          Animaciones al bajar y progreso de la agenda
assets/img/           Imágenes optimizadas en WebP
apps-script/          Script de Google que crea las citas en Google Calendar
herramientas/         Utilidades (optimizar fotos de testimonios)
```

No usa frameworks ni dependencias: HTML, CSS y JavaScript puros.

## Ver el sitio en tu computadora

1. Abre la carpeta en VS Code.
2. Instala la extensión **Live Server**.
3. Haz clic derecho en `index.html` y elige **Open with Live Server**.

Para verlo en tu celular, conéctalo a la misma red wifi y abre la IP que muestra Live Server.

## Si no ves los cambios

El navegador guarda copias de los archivos. Si después de un Pull no ves lo último:

1. Recarga forzando: **Ctrl + F5** (o **Ctrl + Shift + R**).
2. Al publicar cambios en CSS o JS, sube el número `?v=...` en `index.html`. Por ejemplo, cambia `styles.css?v=2026-10-11` a `styles.css?v=2026-10-12`.

## Agenda de citas

- **Sin configurar** (`appsScriptUrl` vacío): el formulario arma un mensaje de WhatsApp con los datos de la cita.
- **Configurada**: la cita se crea directamente en Google Calendar, se bloquea ese horario y el cliente recibe un correo de confirmación.

Los pasos para configurarla están en [`apps-script/README.md`](apps-script/README.md).

## Fotos del salón

Las fotos que se abren en grande llevan `data-gallery="salon"` en `index.html` (la de "Celebraciones" y las tres de "El salón por dentro"). Para cambiar una, reemplaza la imagen, su versión grande (`data-full`) y su descripción (`alt`). Optimiza las fotos antes con `herramientas/optimizar_fotos.py`.

**Evita fotos con andamios, escaleras de obra o el salón vacío en construcción.** `salon-principal.webp` tiene andamios: ya no se usa entera, solo dos recortes (`salon-lamparas-oro` y `salon-pista-vista`).

## Ficha del salón y preguntas frecuentes

Ambas se editan en `js/config.js`, sin tocar el HTML:

- **`ficha`**: capacidad, área, estacionamiento y lo que incluye. Cada dato aparece en "El salón por dentro" solo cuando tiene `valor`.
- **`preguntas`**: cada pregunta aparece solo cuando tiene `respuesta`. Ya hay cuatro respondidas y seis vacías: son las que más hacen los clientes de un local de eventos (aforo, qué incluye, catering propio, adelanto, hora de cierre, estacionamiento). Complétalas con datos reales.

## Diseño

- Tipografías: Bodoni Moda (títulos) y Figtree (texto), guardadas en `assets/fonts/` para no depender de Google Fonts.
- Colores en `:root` de `css/styles.css`: blanco mármol, verde del logo y dorado del techo.
- Las animaciones respetan la opción "reducir movimiento" del celular o la computadora.
- La carpeta `assets/img/deco/` ya no se usa.

## Movimiento

Todo el movimiento vive en `css/styles.css` y `js/motion.js` (el visor de fotos está en `js/main.js`). Cada animación tiene un propósito y usa solo `transform`, `opacity` y `clip-path`, para que vaya fluida en celulares:

- **Portada:** el título sube palabra por palabra y la foto se descubre de arriba abajo; al bajar, la foto se acerca despacio (Chrome y Edge; en otros navegadores queda quieta).
- **Menú:** una línea dorada marca la sección donde estás.
- **Eventos:** al pasar el mouse, cada fila dibuja un filete dorado.
- **El salón:** las fotos se descubren como una cortina al llegar; en celular se deslizan con el dedo.
- **Frase:** sus palabras se encienden al bajar. Para cambiarla, edita el `<p id="frase">` en `index.html`.
- **Visor de fotos:** la foto crece desde su miniatura. Arrástrala a los lados para cambiar y hacia abajo para cerrar.
- **Agenda:** los pasos se marcan mientras llenas el formulario, los horarios aparecen en cascada y al confirmar se dibuja un check.

Si en el celular o la computadora está activada la opción **reducir movimiento**, todo se muestra quieto y completo.

## Testimonios

La sección "Lo que dicen nuestros clientes" aparece sola cuando hay al menos un testimonio en `js/config.js`. Cada testimonio puede llevar una galería con las fotos de la decoración de ese evento. Al tocar una foto, se abre en grande.

**1. Optimiza las fotos del evento.** Las fotos del celular pesan varios MB; esto las reduce a ~150 KB sin que se note:

```
pip install pillow
python herramientas/optimizar_fotos.py "C:/Users/tu-usuario/Fotos/boda-maria" boda-maria
```

Quedan en `assets/img/testimonios/boda-maria/` y el comando imprime la lista de fotos lista para pegar.

**2. Agrega el testimonio en `js/config.js`:**

```js
testimonios: [
  {
    texto: "Lo que dijo el cliente.",
    nombre: "María G.",
    evento: "Boda · marzo 2026",
    fotos: [
      "assets/img/testimonios/boda-maria/01.webp",
      "assets/img/testimonios/boda-maria/02.webp"
    ]
  },
]
```

La primera foto es la grande. Se muestran hasta 4 en el recuadro y el resto se ve en el visor. Los testimonios aparecen de uno en uno y se pasan con las flechas o deslizando en celular. Usa solo testimonios y fotos reales, con permiso del cliente. Basta con el nombre y la inicial del apellido.

## Publicar gratis con GitHub Pages

1. En el repositorio, ve a **Settings → Pages**.
2. En *Source*, elige **Deploy from a branch**, la rama `main` y la carpeta `/ (root)`.
3. En un par de minutos el sitio estará en `https://usiel26.github.io/Pag_web_local/`.

Más adelante se puede conectar un dominio propio, por ejemplo `losficus.pe`.

## Pendientes de contenido

- [ ] Enlace real de Instagram en `js/config.js`.
- [x] WhatsApp y celular confirmados: 941 497 280.
- [x] Dirección y ubicación del mapa.
- [ ] Confirmar el horario de visitas (Contacto, pie de página y datos para Google en `index.html`).
- [ ] Datos del salón: `ficha` en `js/config.js`.
- [ ] Responder las preguntas frecuentes vacías: `preguntas` en `js/config.js`.
- [x] Testimonios de ejemplo retirados de `js/config.js` (usaban fotos de otros locales). Falta borrar `assets/img/testimonios/ejemplo-*` y agregar testimonios reales.
- [ ] Cuando haya dominio propio: poner la URL completa en `og:image` y agregar `url` en los datos para Google (`index.html`).
- [ ] Fotos de eventos reales y una foto de portada con el salón terminado.
