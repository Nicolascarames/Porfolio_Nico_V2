# ContactChat

El formulario de contacto como una conversación: Nico pregunta nombre, email y mensaje uno a uno, valida cada respuesta, ofrece respuestas rápidas y enseña un resumen antes de enviar.

**Sustituye a** `ContactForm`; envía el mismo `{ name, email, message }`.

## Qué aporta quien lo usa
- `steps` (pregunta, placeholder, validación, respuestas rápidas opcionales) y `onSubmit(data)`.

## Interacción
- Indicador "escribiendo…" de 700 ms antes de cada pregunta; barra de progreso de 3 pasos en la cabecera.
- Cada respuesta tiene "editar"; el resumen permite "Enviar" o "Empezar de nuevo".
- Respuestas rápidas en el paso del mensaje: Una web · Una app con IA · Automatizar un flujo · Solo saludar.
- Todo lo que escribe el usuario se escapa antes de pintarlo.

## Do / Don't
- Do: dejar claro que es un formulario (no un bot de IA) si alguien pregunta.
- Don't: más de 4 pasos.
