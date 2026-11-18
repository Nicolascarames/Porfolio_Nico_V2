# ContactGlass

Formulario de vidrio esmerilado con etiquetas flotantes y un borde cromado que se ilumina siguiendo al cursor; al enviar, el botón se convierte en un 404 que late y termina en "Mensaje encontrado" con el logo.

**Sustituye a** `ContactForm`; mismos campos (`name`, `email`, `message`) y mismo `POST /api/contact`.

## Qué aporta quien lo usa
- `onSubmit(data) => Promise` — sustituye el `setTimeout` de la preview por el `fetch` actual de `ContactForm.tsx`; en error, quita `.sending` y muestra el mensaje con `signal-error`.

## Interacción
- Borde: capa `::before` con máscara de 1 px y gradiente radial en `--mx/--my`.
- Validación propia del email; el primer campo inválido recibe el foco.
- Estados: idle → sending (404 latiendo) → sent (overlay con logo y "Enviar otro").

## Do / Don't
- Do: mantener `autocomplete` en nombre y email.
- Don't: quitar las etiquetas; el placeholder vacío (`" "`) solo existe para el selector `:placeholder-shown`.
