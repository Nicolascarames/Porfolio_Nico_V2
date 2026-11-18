# ContactTerminal

Sección de contacto en clave 404: a la izquierda el logo y "Mensaje no encontrado.", a la derecha una terminal que pide `nombre ›`, `email ›`, `mensaje ›` y confirma con `[s/n]` antes del `POST /api/contact`.

**Sustituye a** `ContactForm`; mismo payload.

## Qué aporta quien lo usa
- `onSubmit(data)`; la respuesta `200 OK` muestra "mensaje encontrado" y la barra de progreso cromada.

## Interacción
- Arranca al entrar en pantalla con `GET /mensaje → 404 Not Found`.
- Errores de validación en `signal-error` y vuelve a preguntar el mismo campo.
- `otra` reinicia; `n` en la confirmación vuelve a empezar.

## Do / Don't
- Do: emparejar con AboutTerminal solo si quieres la estética consola en todo el sitio; si no, combina con AboutBadge o AboutBento.
- Don't: usarlo como único medio de contacto sin un email visible en el footer.
