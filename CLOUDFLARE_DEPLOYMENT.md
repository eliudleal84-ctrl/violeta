# Despliegue en Cloudflare Pages

Dado que esta aplicación ya utiliza Cloudflare R2 para el almacenamiento de imágenes, alojar el frontend en **Cloudflare Pages** es la opción más natural y rápida bajo el mismo ecosistema.

Sigue estos pasos para subir tu proyecto hoy mismo:

## Paso 1: Subir el código a GitHub
Cloudflare Pages necesita leer tu código desde un repositorio.

1. Abre tu terminal en la carpeta del proyecto (`C:\Users\venta\Desktop\VIOLETA\eventocam-clone`).
2. Detén el servidor si está corriendo (presionando `Ctrl + C`).
3. Ejecuta los siguientes comandos para crear un repositorio local y guardar tus cambios:
   ```bash
   git init
   git add .
   git commit -m "Versión final Mis XV Violeta"
   ```
4. Entra a [GitHub.com](https://github.com/) y crea un repositorio nuevo llamado `mis-xv-violeta`.
5. GitHub te dará un comando que empieza con `git remote add origin...`. Cópialo y pégalo en tu terminal.
6. Finalmente, sube el código:
   ```bash
   git branch -M main
   git push -u origin main
   ```

## Paso 2: Conectar con Cloudflare Pages
1. Entra a tu cuenta de [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. En el menú izquierdo, ve a **Workers & Pages**.
3. Haz clic en el botón azul **"Crear"** y selecciona la pestaña **Pages**.
4. Elige **Connect to Git** (Conectar con Git) y autoriza a Cloudflare para acceder a tu cuenta de GitHub.
5. Selecciona el repositorio `mis-xv-violeta` que acabas de crear.

## Paso 3: Configurar el Entorno (¡Importante!)
En la pantalla de configuración del proyecto en Cloudflare, ajusta lo siguiente:

- **Nombre del proyecto**: `mis-xv-violeta` (o el que prefieras, esto definirá tu URL gratuita temporal, ej: `mis-xv-violeta.pages.dev`).
- **Framework preset**: Selecciona **Next.js**. El comando de build será automáticamente `npx @cloudflare/next-on-pages@1`.

**Variables de Entorno (Environment Variables):**
Al igual que en tu computadora con el archivo `.env.local`, debes agregar las variables secretas para que el servidor de Cloudflare pueda conectarse a R2.
Abre la sección "Variables de entorno (avanzado)" y añade las 5 variables TEXTUALMENTE como las tienes en tu PC:

1. `R2_ACCOUNT_ID`: (Tu ID)
2. `R2_ACCESS_KEY_ID`: (Tu Key)
3. `R2_SECRET_ACCESS_KEY`: (Tu Secret)
4. `NEXT_PUBLIC_R2_BUCKET_NAME`: `eventocam`
5. `NEXT_PUBLIC_R2_WEBSITE_URL`: `https://pub-tu-link-largo.r2.dev`
6. `ADMIN_TOKEN`: `super-secreto-123` (O el que prefieras)

## Paso 4: Desplegar
Haz clic en **Save and Deploy** (Guardar y Desplegar).
Cloudflare empezará a compilar tu aplicación. Este proceso dura unos 2 o 3 minutos. Al finalizar, te dará un enlace verde con tu sitio web público y en funcionamiento.

¡Y listo! Cada vez que hagas un cambio en tu computadora y lo subas a GitHub (`git push`), Cloudflare actualizará la página automáticamente.
