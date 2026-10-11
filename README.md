# Los Ficus · Centro de eventos

Sitio web del salón de eventos Los Ficus (Ica, Perú). Es una sola página responsive con botones de WhatsApp e Instagram y un formulario para agendar citas que se guardan en el Google Calendar de la empresa.

## Estructura

```
index.html            Página única: inicio, salón, eventos, galería, agenda y contacto
css/styles.css        Estilos (mobile-first)
js/config.js          ← Datos editables: WhatsApp, Instagram, URL de la agenda, horarios
js/main.js            Menú, enlaces y lógica del formulario de citas
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
- [ ] Dirección exacta y ubicación del mapa.
- [ ] Datos del salón: capacidad, servicios incluidos y estacionamiento (sección "El salón" en `index.html`).
- [ ] Reemplazar los testimonios de ejemplo por reales (`js/config.js`) y borrar `assets/img/testimonios/ejemplo-*`.
- [ ] Fotos de eventos reales y una foto de portada con el salón terminado.
