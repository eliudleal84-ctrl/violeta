# EVENTOCAM CLONE (Mis XV Violeta)

Aplicación construida en Next.js 15, usando TailwindCSS y enfocada en almacenamiento gratuito en Cloudflare R2 sin base de datos nativa. Creada específicamente para permitir a invitados subir fotos de alta calidad a un evento y ser visualizadas al instante.

## Pasos para Desplegar en Vercel (Recomendado)

Dado que usas GitHub y Vercel, el proceso para que la aplicación de los XV de Violeta quede online es súper sencillo y 100% gratuito. Sigue estos 3 pasos:

### 1. Sube tu código a GitHub
1. Entra a [GitHub.com](https://github.com/) e inicia sesión.
2. Crea un **Nuevo Repositorio** (New Repository) en la esquina superior derecha.
3. Llámalo, por ejemplo, `mis-xv-violeta`. Ponlo en "Private" si quieres, no hay problema. No marques la casilla "Add a README". Dale a "Create repository".
4. Abre la Terminal dentro de tu editor en la carpeta `eventocam-clone`.
5. Ejecuta los siguientes comandos uno por uno para subir todo el proyecto (asegúrate de pegar el link correcto de tu repositorio en la línea 4):

```bash
git init
git add .
git commit -m "Proyecto final Mis XV Violeta"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/mis-xv-violeta.git
git push -u origin main
```

### 2. Conecta GitHub con Vercel
1. Ve a [Vercel.com](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..."** y luego en **"Project"**.
3. Verás una lista de tus repositorios de GitHub. Busca el que se llama `mis-xv-violeta` y presiona el botón **Import**.

### 3. Configura las Variables de Entorno (¡El paso más importante!)
Antes de darle al botón de desplegar (Deploy), Vercel necesita conocer tus contraseñas de Cloudflare para que la aplicación funcione.

1. Abre la pestaña desplegable que dice **"Environment Variables"**.
2. Necesitas copiar textualmente las 6 variables que tienes en tu archivo `.env.local` en tu computadora y agregarlas una por una en Vercel:
   - `R2_ACCOUNT_ID` -> (Tu ID de Cloudflare)
   - `R2_ACCESS_KEY_ID` -> (La llave que generaste)
   - `R2_SECRET_ACCESS_KEY` -> (El segundo código largo)
   - `NEXT_PUBLIC_R2_BUCKET_NAME` -> `eventocam`
   - `NEXT_PUBLIC_R2_WEBSITE_URL` -> (Por ejemplo: `https://pub-xxxxx.r2.dev`)
   - `ADMIN_TOKEN` -> `super-secreto-123`

3. Una vez añadidas las 6 variables, presiona el botón azul **Deploy**.

¡Vercel compilará tu aplicación en unos 2 minutos y te dará un enlace público! Ahora podrás enviarlo por WhatsApp a todos los invitados.

*Nota: Vercel soporta nativamente la librería `sharp` que usamos para optimizar las fotos de la galería cargando "thumbnails" pequeños, así que la aplicación volará de rápido.*
