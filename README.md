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
```

No usa frameworks ni dependencias: HTML, CSS y JavaScript puros.

## Ver el sitio en tu computadora

1. Abre la carpeta en VS Code.
2. Instala la extensión **Live Server**.
3. Haz clic derecho en `index.html` y elige **Open with Live Server**.

Para verlo en tu celular, conéctalo a la misma red wifi y abre la IP que muestra Live Server.

## Agenda de citas

- **Sin configurar** (`appsScriptUrl` vacío): el formulario arma un mensaje de WhatsApp con los datos de la cita.
- **Configurada**: la cita se crea directamente en Google Calendar, se bloquea ese horario y el cliente recibe un correo de confirmación.

Los pasos para configurarla están en [`apps-script/README.md`](apps-script/README.md).

## Publicar gratis con GitHub Pages

1. En el repositorio, ve a **Settings → Pages**.
2. En *Source*, elige **Deploy from a branch**, la rama `main` y la carpeta `/ (root)`.
3. En un par de minutos el sitio estará en `https://usiel26.github.io/Pag_web_local/`.

Más adelante se puede conectar un dominio propio, por ejemplo `losficus.pe`.

## Pendientes de contenido

- [ ] Enlace real de Instagram en `js/config.js`.
- [ ] Confirmar el número de WhatsApp. Ahora es el mismo celular de contacto, 941 497 280.
- [ ] Dirección exacta y ubicación del mapa.
- [ ] Datos del salón: capacidad, servicios incluidos y estacionamiento (sección "El salón" en `index.html`).
- [ ] Fotos de eventos reales y una foto de portada con el salón terminado.
