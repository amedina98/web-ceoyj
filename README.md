# Cerrá el Orto y Jugá

Sitio de una sola página para GitHub Pages. La carpeta `outputs` contiene el Excel para importar y el ZIP de la web.

## Publicar en GitHub Pages

1. Descomprimí el ZIP y subí su contenido a la raíz de la rama de publicación. `index.html` tiene que quedar en la raíz, junto a las carpetas `img` y `fonts`.
2. En **Settings → Pages → Build and deployment**, elegí **Deploy from a branch**, seleccioná la rama y **/(root)**. Guardá.

[Instrucciones de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Conectar Google Sheets

1. Subí el Excel a Drive, abrilo con Hojas de cálculo de Google y usá **Archivo → Guardar como Hojas de cálculo de Google**.
2. Revisá los resultados y fechas de demostración heredados. El WhatsApp y el correo de contacto ya están en `Config`. Agregá tus sponsors vigentes en `Sponsors` con estado `activo`.
3. En **Compartir**, elegí **Cualquier persona con el enlace → Lector**. El libro contiene datos públicos. Guardá las respuestas de postulantes en un formulario y una planilla privada aparte.
4. Pegá el enlace de edición/lectura de Google Sheets en `sheets-config.js`. Conservá el formato `https://docs.google.com/spreadsheets/d/ID/edit` y subí el archivo a GitHub.

La web consulta las pestañas al abrir o recargar. Conservá sus nombres y encabezados. Si la planilla está sin configurar o Google no responde, la web indica que muestra el respaldo original.

La agenda usa la hora argentina. Los partidos confirmados con fecha y hora pueden aparecer en la cuenta regresiva. Las fechas provisionales aparecen en la agenda con esa etiqueta. La tabla se calcula con los dos marcadores de cada partido.

Para recibir inscripciones podés usar el WhatsApp del equipo o cargar un enlace público de Google Forms en `Config → formulario_sponsors`. Mientras ambos estén vacíos, el sitio lleva a Instagram. Usá URLs HTTPS directas para fotos nuevas.

[Conexión de Google Sheets como fuente de datos](https://developers.google.com/chart/interactive/docs/spreadsheets)
