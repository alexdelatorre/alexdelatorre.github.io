# Portfolio — Alejandro de la Torre

Sitio estático (HTML, CSS y JavaScript sin dependencias ni compilación).

```
index.html            Portada, trabajo, más allá del producto, sobre mí y contacto
caso-01/index.html    Caso 01: la misión simulada de FE
assets/css/           site.css (común) y mission.css (caso)
assets/js/            site.js (menú), home.js (portada), mission.js (simulación)
assets/img/           fe/ demo/ role/ ingrid/ lince/
assets/cv/            CV en español e inglés (sin teléfono)
```

Para verlo en local: `python3 -m http.server` dentro de esta carpeta y abrir http://localhost:8000
(abrir index.html con doble clic también funciona, salvo algún detalle de rutas).

## Publicar en GitHub Pages (gratis)

1. En GitHub, crea un repositorio nuevo llamado **alexdelatorre.github.io** (público).
2. Pulsa **uploading an existing file** y arrastra **todo el contenido de esta carpeta** (no la carpeta en sí: `index.html` tiene que quedar en la raíz del repositorio). Pulsa **Commit changes**.
3. Ve a **Settings → Pages** y comprueba que la fuente es **Deploy from a branch**, rama **main**, carpeta **/ (root)**.
4. En uno o dos minutos estará en **https://alexdelatorre.github.io**

Para cambiar algo después, edita o vuelve a subir el archivo en GitHub y se republica solo.

## Conectar un dominio propio (cuando lo compres)

1. En **Settings → Pages → Custom domain**, escribe el dominio (por ejemplo `alexdelatorre.com`) y guarda.
2. En tu registrador, crea estos registros DNS:
   - Cuatro registros **A** para `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Un registro **CNAME** para `www` apuntando a `alexdelatorre.github.io`
3. Cuando GitHub verifique el dominio, marca **Enforce HTTPS**.

Comprueba estos valores en la documentación de GitHub Pages antes de configurarlos, por si han cambiado.
