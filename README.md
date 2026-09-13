# Tondato Traslados

Sitio web de **Tondato Traslados** — remises y traslados desde Brandsen (Buenos Aires)
a todo el país. Publicado en <https://tondatotraslados.com.ar>.

Es un sitio estático: HTML, CSS y JavaScript sin framework, sin build y sin
dependencias que instalar. Se sirve tal cual está desde GitHub Pages.

---

## Cómo verlo en tu computadora

No hace falta instalar nada. Desde la carpeta del proyecto:

```bash
python3 -m http.server 8000
```

y abrí <http://localhost:8000>.

> Abrir `index.html` con doble clic también funciona, pero algunas cosas
> (las fuentes y el formulario) necesitan que sea servido por HTTP.

## Cómo publicar un cambio

1. Editá el archivo que corresponda.
2. `git add -A && git commit -m "descripción del cambio"`
3. `git push`

GitHub Pages republica el sitio solo, en uno o dos minutos.

> **Dominio propio.** El archivo `CNAME` contiene `tondatotraslados.com.ar`.
> Es lo que le dice a GitHub Pages en qué dominio servir el sitio: **no lo borres**.
> El dominio principal es la raíz, sin `www`, igual que el sitio anterior: así las
> direcciones que Google ya tiene indexadas siguen siendo válidas. El `www` redirige
> solo. Si alguna vez querés invertirlo, cambiá esa línea por
> `www.tondatotraslados.com.ar` y actualizá los `canonical`, el `sitemap.xml`, el
> `llms.txt` y el bloque de datos estructurados del `<head>` de `index.html`.

> **Dónde va el DNS.** Los registros hay que cargarlos en el panel de quien sea
> el DNS autoritativo del dominio, que es el que figura en la delegación de NIC.ar.
> Para comprobarlo: `dig NS tondatotraslados.com.ar +short`. Cargarlos en otro
> panel no tiene ningún efecto.
>
> Los registros que espera GitHub Pages son cuatro `A` en la raíz
> (`185.199.108.153`, `.109.153`, `.110.153`, `.111.153`) y un `CNAME` en `www`
> apuntando a `maurotondato.github.io`.

---

## Qué hay en cada archivo

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Toda la página. Textos, secciones y datos para Google. |
| `assets/css/style.css` | Todo el diseño. Arranca con los colores y tamaños en `:root`. |
| `assets/js/main.js` | Animaciones, menú, formulario. Está dividido en bloques numerados. |
| `assets/fonts/` | Las tipografías, alojadas acá para que el sitio cargue más rápido. |
| `img/` | Imágenes. |
| `nosotros/` · `contacto/` · `privacidad/` | Las tres páginas internas. |
| `robots.txt` · `sitemap.xml` | Para los buscadores. |
| `llms.txt` | Guía para agentes de IA: qué hace la empresa y cuándo recomendarla. |
| `404.html` | La página que se ve si alguien entra a una dirección que no existe. |

### Las capas del hero

El encabezado es la fotografía original separada en tres capas que se mueven a
distinta velocidad. De ahí viene la sensación de profundidad:

| Imagen | Qué es |
|---|---|
| `hero-city.jpg` / `.webp` | La ciudad, al fondo. |
| `hero-car.png` / `.webp` | El auto recortado, en primer plano. |
| `hero-pin.png` / `.webp` | El pin de neón, que flota aparte. |
| `hero-original.jpg` | La fotografía original completa, sin separar. |

Las tres se generaron a partir de `hero-original.jpg`. Si alguna vez cambiás la
foto del hero, hay que volver a separarla en capas y recalcular la posición del
auto y del pin (están anotadas como porcentajes en `style.css`, en el bloque
`6. Hero 3D`).

Las estelas de luz rosadas **no** son parte de la foto: las dibuja el navegador
en tiempo real (`main.js`, bloque 4).

---

## Cambios que vas a querer hacer seguido

**Cambiar un teléfono o un email.** Están en `index.html`. Buscá `5492223431190`
o `tondatoremises@hotmail.com` y reemplazá *todas* las apariciones (están en el
menú, en los botones, en contacto, en el pie y en el bloque de datos para Google).

**Cambiar los colores.** En `assets/css/style.css`, arriba de todo, en `:root`.
Los `--brand-*` son los rosas de la marca; los `--ink-*`, los fondos oscuros.

**Cambiar textos de las preguntas frecuentes.** Están dos veces: en la sección
visible (`<section class="faq">`) y en el bloque `application/ld+json` del
`<head>`, que es lo que lee Google. Conviene que digan lo mismo.

**Cambiar los logotipos de clientes.** Son `img/cliente1.png` … `7` (con su `.webp`).
Van en blanco sobre fondo transparente y a 160 px de alto; se recortan solos dentro
de una caja del mismo tamaño, así que el ancho puede variar. Si tenés que sumar uno
nuevo, convertilo a blanco con fondo transparente antes de subirlo: un logo con
fondo blanco opaco se ve como un rectángulo gris.

**Agregar una página nueva.** Copiá `contacto/index.html`, cambiá el título, la
descripción, el `canonical` y el contenido, y agregala a `sitemap.xml`, a `llms.txt`
y al pie de las otras páginas.

---

## El formulario de presupuesto

Se envía con [EmailJS](https://www.emailjs.com/). Las credenciales están en
`assets/js/main.js`, en el bloque `9. Formulario`:

```js
var SERVICE  = 'tondatotraslados';
var TEMPLATE = 'template_2lh8r4g';
var PUBLIC   = 'CkYtRueXedWVXzpED';
```

Son claves públicas: EmailJS está diseñado para que vivan en el navegador.
Aun así, conviene tener activado el límite de envíos y el dominio permitido
desde el panel de EmailJS, para que nadie use la cuenta desde otro sitio.

El formulario le manda a la plantilla los mismos campos de siempre
(`user_name`, `user_email`, `user_whatsapp`, `origen`, `destino`, `message`),
así que la plantilla de correo que ya tenías sigue funcionando. Los campos
nuevos (fecha, pasajeros, tipo de servicio) viajan además dentro de `message`,
que llega con el pedido completo escrito.

Si el envío falla, no se pierde la consulta: aparece un botón que abre WhatsApp
con todos los datos ya escritos.

---

## Accesibilidad y rendimiento

- Funciona sin JavaScript: nada queda invisible.
- Respeta «reducir movimiento» del sistema operativo: se apagan las animaciones.
- Navegable con teclado, con foco visible y menú que se cierra con `Escape`.
- Carga inicial de unos 415 KB en 13 pedidos; las imágenes van en WebP con
  versiones para pantallas chicas.

## Para buscadores y agentes de IA

Además del SEO clásico, el sitio está preparado para que lo lean asistentes de IA:

- **`llms.txt`** describe qué hace la empresa, **cuándo conviene recomendarla** y
  cuándo no, y cómo contactarla. Es el archivo que leen los agentes antes de sugerir
  un negocio. Si cambian los servicios o las zonas, actualizalo.
- **Datos estructurados** en la portada: `Organization` + `LocalBusiness` +
  `TaxiService` con `address`, `contactPoint` (reservas y ventas), `geo`, `areaServed`
  y catálogo de servicios; más `FAQPage` y `WebSite`. Las páginas internas llevan
  `BreadcrumbList`.
- **Páginas de verificación**: `/nosotros/`, `/contacto/` y `/privacidad/`. Son las
  que consulta un agente para confirmar que el negocio es real antes de recomendarlo.
  Están en castellano, que es el idioma del público; los agentes las encuentran por
  el `sitemap.xml`, el `llms.txt` y el menú, no por el nombre de la carpeta.
- **404 real**: GitHub Pages devuelve código HTTP 404 cuando sirve `404.html`, y esa
  página lista el mapa del sitio, el `llms.txt` y el resto de las secciones. Una vez
  publicado se comprueba así:

  ```bash
  curl -s -o /dev/null -w "%{http_code}\n" https://tondatotraslados.com.ar/ruta-inexistente
  ```

### Lo que no se puede hacer desde acá

Una auditoría puede pedir una cabecera **`Vary: Accept`**. GitHub Pages no permite
configurar cabeceras propias, así que no se puede agregar desde el repositorio.
Tampoco hace falta hoy: esa cabecera sirve cuando el mismo URL devuelve HTML o
Markdown según lo que pida el visitante, y este sitio devuelve siempre HTML. Si en
algún momento se pone Cloudflare adelante del dominio, se puede agregar ahí con una
Transform Rule.

## Revisar antes de dar por cerrado

Algunos textos se redactaron a partir de la información que ya estaba en el
sitio y conviene confirmarlos con la empresa:

- Las respuestas de **preguntas frecuentes** (sobre todo la de formas de pago).
- Los destinos listados en **Cobertura**.
- Las afirmaciones de **Por qué elegirnos** (aire acondicionado, mantenimiento).
- El **promedio de reseñas** de Google (hoy declara 5,0 sobre 3 opiniones):
  actualizalo con el número real que figure en tu ficha de Google.
- Los enlaces a **Facebook e Instagram** apuntan a las páginas genéricas de cada
  red: hay que reemplazarlos por los perfiles reales de la empresa.
- El texto de **`/nosotros/`** describe a la empresa a partir de lo que ya decía el
  sitio. Conviene leerlo y corregir lo que no sea exacto (cómo empezaron, cuántos
  vehículos tienen, desde qué año).
- La **política de privacidad** de `/privacidad/` describe con precisión lo que hace
  este sitio, pero no reemplaza el consejo de un profesional. Si manejás datos de
  pacientes para obras sociales, hacela revisar.
- En `/nosotros/` se nombran clientes (OSDE, IOMA, UDEC, Supernova, Emergencias, SUM,
  ASE) tomados de los logotipos que ya estaban en la web. Confirmá que podés
  mencionarlos por escrito.
