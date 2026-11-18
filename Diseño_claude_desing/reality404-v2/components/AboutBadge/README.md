# AboutBadge

Credencial de vidrio esmerilado colgada de una cinta: se balancea con física de muelle al arrastrarla, refleja la luz donde está el cursor y al hacer clic gira 180° para mostrar el reverso con datos.

**Sustituye a** `About`.

## Qué aporta quien lo usa
- Foto (`nico.png`, recorte superior), nombre, rol, estado "Disponible", y para el reverso una lista `dt/dd` (base, rol, ciclo, extra, stack).
- El texto de la columna derecha: los dos párrafos actuales de `About.tsx`.
- Columna de 340 px de ancho y ~600 px de alto para que la cinta tenga recorrido.

## Interacción
- Arrastrar: la tarjeta sigue al puntero; al soltar vuelve con muelle (k .035, amortiguación .93) y gravedad; la cinta nunca supera 1,9× su largo.
- Clic sin arrastrar, Enter o Espacio: voltea (`duration-slow`, `ease-spring`).
- El logo 404 usa `mix-blend-mode: screen` para que su fondo negro desaparezca.

## Do / Don't
- Do: en móvil, cinta más corta y sin columna derecha (texto debajo).
- Don't: poner más de 5 filas en el reverso.
