# Conectar la agenda con Google Calendar

Este script se publica desde la **cuenta de Google de Los Ficus** (por ejemplo `lficussalon@gmail.com`). Así, cada cita que agenda un cliente se crea en el calendario de la empresa, sin que el cliente tenga que iniciar sesión.

Es gratis y no necesita servidor ni API key.

## Pasos (una sola vez, ~10 minutos)

1. Inicia sesión con la cuenta de Los Ficus y entra a <https://script.google.com>. Crea un **Nuevo proyecto** y ponle de nombre `Agenda Los Ficus`.
2. Borra el contenido de `Código.gs` y pega todo el contenido de [`Code.gs`](Code.gs).
3. Configura el manifiesto:
   - Ve a **Configuración del proyecto** (ícono de engranaje) y activa *Mostrar el archivo de manifiesto "appsscript.json"*.
   - Vuelve al editor, abre `appsscript.json` y reemplázalo con el de esta carpeta.
4. Da los permisos:
   - En el editor, elige la función `autorizar` en el menú desplegable y pulsa **Ejecutar**.
   - Acepta los permisos de Calendar y Gmail. Si aparece "Google no verificó esta app", entra a *Configuración avanzada* y luego a *Ir a Agenda Los Ficus*. Es normal porque el script es tuyo.
5. Publícalo:
   - Pulsa **Implementar → Nueva implementación**, elige el tipo **Aplicación web** y configura:
     - *Ejecutar como*: **Yo** (la cuenta de Los Ficus)
     - *Quién tiene acceso*: **Cualquier usuario**
   - Pulsa **Implementar** y copia la **URL de la aplicación web**. Termina en `/exec`.
6. Pega esa URL en `js/config.js`, dentro de `appsScriptUrl: ""`, y sube el cambio.

Para probar que funciona, abre `TU_URL/exec?accion=disponibilidad&fecha=2026-10-17` en el navegador. Debe devolver la lista de horarios.

## Cambiar horarios o días de atención

Los horarios se editan en el bloque `CONFIG` al inicio de `Code.gs`:

- `HORARIOS`: las horas de inicio de cada cita.
- `DIAS_ATENCION`: los días en que se atiende.
- `DURACION_MIN`: cuánto dura cada cita.

Mantén `diasAtencion` y `diasMaximos` de `js/config.js` iguales a los de `Code.gs`, así el formulario avisa al cliente antes de consultar.

Después de editar el script, ve a **Implementar → Gestionar implementaciones**. Allí edita la implementación, elige **Nueva versión** y vuelve a implementar. La URL no cambia.

## Cómo funciona

- El formulario consulta los horarios libres de ese día. Un horario aparece ocupado si ya existe **cualquier** evento del calendario en ese rango. Así, si bloqueas una hora manualmente en Google Calendar, deja de ofrecerse.
- Al confirmar, el script crea el evento con los datos del cliente y le envía un correo de confirmación.
- Si dos personas intentan reservar la misma hora al mismo tiempo, el bloqueo (`LockService`) deja pasar solo a la primera.
- Las cuentas Gmail gratuitas pueden enviar unos 100 correos al día desde scripts, lo que sobra para este uso.

Para usar un calendario separado solo para citas, créalo en Google Calendar. Luego copia su *ID de calendario* desde la configuración del calendario y pégalo en `CALENDAR_ID`.
