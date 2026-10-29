# Sr. Robot Informática (1995)

Homenaje a las páginas web de mediados de los 90: la web ficticia de una tienda de
informática de Vilafranca del Penedès, tal y como podría haber sido en diciembre de 1995.

- **Frames** de verdad: cabecera, menú a la izquierda y contenido a la derecha.
- **HTML 3.2 sin CSS**: `<font>`, `<table>`, `<center>`, `<marquee>`, `<blink>`...
- **GIF animados** con la paleta segura de 216 colores.
- **Contador de visitas** con dígitos LED.
- **Reproductor "MIDI"**: una melodía original tocada con un sintetizador FM en JavaScript
  (los navegadores actuales ya no reproducen archivos `.mid`).
- Precios en **pesetas**, IVA del 16 % no incluido.

> Sr. Robot Informática no existe. Las marcas citadas pertenecen a sus propietarios y los
> precios son aproximados de la época.

## Estructura

```
index.html          ← conjunto de marcos (frameset)
cabecera.html       ← logo y texto en movimiento
menu.html           ← menú y reproductor de música
inicio.html, ordenadores.html, componentes.html, perifericos.html,
software.html, ofertas.html, libro.html, enlaces.html, contacto.html
img/                ← todos los GIF
js/retro.js         ← parpadeo, barra de estado y contador
js/musica.js        ← sintetizador y partitura
herramientas/generar_gifs.py  ← genera los GIF desde cero
```

## Verla en local

Basta con abrir `index.html` en el navegador. Si el contador o los marcos dan problemas
abriendo el archivo directamente, sírvela con:

```
python -m http.server 8095
```

y entra en <http://localhost:8095/>.

## Publicarla en GitHub Pages

1. Sube el contenido de esta carpeta a un repositorio de GitHub.
2. En **Settings → Pages**, elige la rama `main` y la carpeta `/ (root)`.
3. En unos minutos estará en `https://<usuario>.github.io/<repositorio>/`.

## Regenerar los GIF

Requiere Python 3 y Pillow (`pip install pillow`), y las fuentes de Windows
(Impact, Comic Sans, Arial y Courier):

```
python herramientas/generar_gifs.py
```

## Notas

- No usa cookies ni recoge datos: los formularios son de broma y solo muestran un aviso.
  El contador guarda tus visitas en el `localStorage` de tu navegador, nada más.
- Los enlaces externos llevan a copias de 1996 en la Wayback Machine de archive.org.
