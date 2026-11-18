# AboutTerminal

Ventana de terminal de vidrio que escribe sola una sesión (`whoami`, `cat sobre-mi.txt`, `status`) bajo el arte ASCII 404 y después acepta comandos reales del visitante.

**Sustituye a** `About`.

## Qué aporta quien lo usa
- Un diccionario `comando → líneas HTML`. Incluidos: `whoami`, `cat sobre-mi.txt`, `ls stack/`, `ls proyectos/`, `status`, `contacto`, `help`, `clear`.
- Cualquier comando desconocido responde "comando no encontrado — error 404".

## Interacción
- La intro arranca al entrar en pantalla (55–95 ms por carácter).
- Chips de comandos debajo para quien no quiera teclear.
- El input escapa el HTML de lo que escribe el usuario.

## Do / Don't
- Do: `contacto` puede hacer `scrollToId('contacto')` en el sitio real.
- Don't: esconder información importante solo tras comandos; la intro ya muestra la bio completa.
