-- ============================================================
-- ORION NEXUS STUDIO — Seed de Documentación
-- Ejecutar en tu base de datos PostgreSQL
-- ============================================================

-- Crear tablas si no existen
CREATE TABLE IF NOT EXISTS doc_articles (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  content      TEXT NOT NULL,
  excerpt      TEXT DEFAULT '',
  category     VARCHAR(50) NOT NULL,
  slug         VARCHAR(255) UNIQUE NOT NULL,
  tags         TEXT[] DEFAULT '{}',
  order_index  INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doc_faqs (
  id           SERIAL PRIMARY KEY,
  question     TEXT NOT NULL,
  answer       TEXT NOT NULL,
  category     VARCHAR(50) DEFAULT 'general',
  order_index  INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ARTÍCULOS — Primeros Pasos
-- ============================================================

INSERT INTO doc_articles (title, excerpt, content, category, slug, tags, order_index) VALUES
(
  'Bienvenido a Orion Nexus Studio',
  'Descubre qué es Orion Nexus Studio y cómo puede transformar tu forma de desarrollar aplicaciones web con inteligencia artificial.',
  '## ¿Qué es Orion Nexus Studio?

Orion Nexus Studio es una plataforma de desarrollo web potenciada por inteligencia artificial que te permite **crear aplicaciones completas** simplemente describiendo lo que necesitas en lenguaje natural.

Con Orion puedes:
- Generar código React, Vue, Angular o HTML/CSS en segundos
- Editar tu proyecto en un editor Monaco integrado
- Colaborar con tu equipo en tiempo real
- Exportar tu código listo para producción

## ¿Para quién es?

Orion está diseñado para:
- **Desarrolladores** que quieren acelerar su flujo de trabajo
- **Diseñadores** que quieren convertir sus ideas en código
- **Emprendedores** que necesitan prototipos rápidos
- **Estudiantes** que están aprendiendo desarrollo web

## Tu primer proyecto

Para comenzar, solo necesitas:
1. Crear una cuenta gratuita
2. Ir al **Chat IA** desde el menú lateral
3. Describir lo que quieres construir
4. ¡Listo! El código se genera automáticamente

## Soporte

Si tienes dudas, visita nuestro Centro de Ayuda o escríbenos al soporte.',
  'getting_started', 'bienvenido-a-orion', ARRAY['introducción', 'inicio', 'plataforma'], 1
),
(
  'Cómo crear tu cuenta',
  'Aprende a registrarte en Orion Nexus Studio y configurar tu perfil para empezar a crear proyectos.',
  '## Registro en Orion Nexus Studio

Puedes crear tu cuenta de dos formas:

### Registro con email
1. Ve a la página de inicio y haz clic en **Empezar gratis**
2. Ingresa tu nombre, email y contraseña
3. Verifica tu email con el enlace que recibirás
4. ¡Ya puedes ingresar!

### Registro con GitHub
1. Haz clic en **Continuar con GitHub**
2. Autoriza a Orion Nexus en tu cuenta de GitHub
3. Tu perfil se crea automáticamente con tu foto y nombre de GitHub

## Configurar tu perfil

Una vez dentro, ve a **Configuración** para:
- Cambiar tu foto de perfil
- Actualizar tu nombre y biografía
- Vincular tus redes sociales
- Configurar tus preferencias de idioma y tema

## Plan gratuito

Al registrarte obtienes automáticamente:
- **100 créditos** para generación IA al mes
- Hasta **3 proyectos** activos
- Acceso a la **comunidad**
- Editor de código integrado',
  'getting_started', 'como-crear-tu-cuenta', ARRAY['registro', 'cuenta', 'github', 'perfil'], 2
),
(
  'Navegación por la plataforma',
  'Conoce todas las secciones de Orion Nexus Studio y para qué sirve cada una.',
  '## El menú lateral

El menú lateral izquierdo es tu punto de partida. Desde ahí accedes a todas las secciones:

### Dashboard
Tu panel principal. Muestra:
- Resumen de tus proyectos recientes
- Créditos disponibles
- Actividad reciente
- Accesos rápidos

### Chat IA
El corazón de Orion. Aquí describes lo que quieres construir y la IA genera el código por ti.

**Ejemplo de prompts:**
- `Crea una landing page moderna para una startup de tecnología`
- `Genera un formulario de contacto con validaciones`
- `Diseña un dashboard con gráficas de ventas`

### Editor
Editor de código Monaco (el mismo de VS Code) para editar tu proyecto directamente. Soporta:
- Resaltado de sintaxis
- Autocompletado inteligente
- Vista previa en tiempo real

### Proyectos
Gestiona todos tus proyectos. Puedes:
- Crear nuevos proyectos
- Ver el historial de cambios
- Exportar el código

### Componentes
Biblioteca de componentes listos para usar. Filtra por categoría y agrégalos directamente a tu proyecto.

### Comunidad
Conecta con otros usuarios, comparte tus proyectos y aprende de la comunidad.

### Configuración
Personaliza tu experiencia, gestiona tu equipo y administra tu suscripción.',
  'getting_started', 'navegacion-por-la-plataforma', ARRAY['navegación', 'menú', 'secciones', 'interfaz'], 3
),
(
  'Sistema de créditos',
  'Entiende cómo funciona el sistema de créditos de Orion y cómo aprovecharlos al máximo.',
  '## ¿Qué son los créditos?

Los créditos son la moneda interna de Orion Nexus. Se consumen cada vez que usas la **generación IA** para crear o modificar código.

## ¿Cuántos créditos consume cada acción?

| Acción | Créditos |
|--------|----------|
| Chat con IA (mensaje) | 1 |
| Generar código simple | 2 |
| Generar componente completo | 5 |
| Generar proyecto desde cero | 15 |
| Analizar código existente | 1 |

## Créditos por plan

Los créditos funcionan en dos capas: **créditos diarios** que se renuevan cada día, más un **pool mensual** de respaldo.

| Plan | Diarios | Pool Mensual |
|------|---------|-------------|
| Free | 5 | — |
| Pro | 10 | 500 |
| Enterprise | 50 | 2,000 |

### ¿Cómo funcionan los diarios?

Cada día a medianoche se recargan tus créditos diarios según tu plan. Si tienes Pro y no usaste los 10 de hoy, **no se acumulan** al día siguiente.

### ¿Cuándo se usa el pool mensual?

Cuando agotas tus créditos diarios, el sistema descuenta del pool mensual automáticamente. Esto te da flexibilidad para días de mucho trabajo.

## ¿Qué pasa cuando se agotan?

Si agotaste tanto los créditos diarios como el pool mensual:
- El **editor** sigue funcionando sin límites
- Puedes seguir navegando y exportando proyectos
- La generación IA se reactiva al día siguiente con tus créditos diarios

## Consejos para optimizar tus créditos

- Sé específico en tus prompts: más precisión = mejor código en menos intentos
- Usa el **chat** (1 crédito) para preguntas y el generador solo cuando vayas a construir
- Aprovecha el editor para ajustes pequeños en lugar de regenerar todo
- Analiza el código existente antes de pedir modificaciones',
  'getting_started', 'sistema-de-creditos', ARRAY['créditos', 'planes', 'límites', 'IA'], 4
);

-- ============================================================
-- ARTÍCULOS — Tutoriales
-- ============================================================

INSERT INTO doc_articles (title, excerpt, content, category, slug, tags, order_index) VALUES
(
  'Crea tu primera landing page',
  'Tutorial paso a paso para crear una landing page profesional usando el Chat IA de Orion.',
  '## Objetivo

En este tutorial crearás una **landing page completa** con héroe, características, testimonios y formulario de contacto usando solo el Chat IA.

## Paso 1: Accede al Chat IA

1. Inicia sesión en Orion Nexus Studio
2. Haz clic en **Chat IA** en el menú lateral
3. Verás el área de mensajes y el prompt vacío

## Paso 2: Escribe tu primer prompt

Escribe algo como:

```
Crea una landing page moderna para una app de productividad llamada "TaskFlow".
Incluye: hero con CTA, sección de características (3 features), testimonios de clientes
y formulario de contacto. Usa colores azul y blanco, estilo profesional.
```

## Paso 3: Revisa el código generado

La IA generará el código React automáticamente. Verás:
- El código en el panel derecho
- Una preview en tiempo real

## Paso 4: Refina con prompts de seguimiento

Si quieres cambiar algo, simplemente díselo:
- `Cambia el color del botón CTA a verde`
- `Agrega una sección de precios con 3 planes`
- `Haz el hero más grande y agrega una imagen de fondo`

## Paso 5: Guarda tu proyecto

Haz clic en **Guardar proyecto** y ponle un nombre. Desde ahí puedes:
- Continuar editando en el Editor
- Exportar el código
- Compartir con tu equipo

## Resultado esperado

Al finalizar tendrás una landing page responsive, lista para desplegar.',
  'tutorial', 'crea-tu-primera-landing-page', ARRAY['landing page', 'tutorial', 'principiantes', 'IA'], 1
),
(
  'Cómo exportar y desplegar tu proyecto',
  'Aprende a exportar el código generado y desplegarlo en plataformas como Vercel, Netlify o GitHub Pages.',
  '## Exportar tu proyecto

### Desde la vista de Proyectos
1. Ve a **Proyectos** en el menú lateral
2. Abre el proyecto que quieres exportar
3. Haz clic en el botón **Exportar** (esquina superior derecha)
4. Se descargará un `.zip` con todos los archivos

### Estructura del proyecto exportado

```
mi-proyecto/
├── src/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── main.tsx
├── public/
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Desplegar en Vercel

1. Instala las dependencias: `npm install`
2. Prueba localmente: `npm run dev`
3. Sube a GitHub: `git init && git add . && git commit -m "init"`
4. Ve a [vercel.com](https://vercel.com) y conecta tu repositorio
5. Vercel detecta automáticamente la configuración y despliega

## Desplegar en Netlify

1. Ejecuta el build: `npm run build`
2. Arrastra la carpeta `dist/` al dashboard de Netlify
3. ¡Tu sitio está en vivo en segundos!

## Variables de entorno

Si tu proyecto usa variables de entorno, agrégalas en el panel de tu plataforma de despliegue antes de hacer deploy.',
  'tutorial', 'exportar-y-desplegar-tu-proyecto', ARRAY['exportar', 'deploy', 'vercel', 'netlify', 'producción'], 2
),
(
  'Colaboración en equipo',
  'Aprende cómo invitar colaboradores y trabajar en proyectos compartidos con edición en tiempo real.',
  '## Invitar miembros a tu workspace

1. Ve a **Configuración** en el menú lateral
2. Selecciona la pestaña **Equipo**
3. Ingresa el email de tu colaborador
4. Elige su rol:
   - **Editor:** puede editar proyectos
   - **Viewer:** solo puede ver
5. Haz clic en **Enviar invitación**

El colaborador recibirá un email con un enlace para unirse.

## Edición en tiempo real

Cuando varios usuarios editan el mismo proyecto:
- Verás el **cursor** de cada colaborador en tiempo real
- Los cambios se sincronizan instantáneamente via WebSocket
- Cada usuario tiene un color distinto

## Permisos por proyecto

Puedes controlar el acceso a nivel de proyecto:
- **Público:** cualquier miembro del workspace puede ver y editar
- **Privado:** solo los miembros invitados explícitamente

## Comentarios y revisiones

En el editor puedes:
- Dejar comentarios en líneas específicas del código
- Ver el historial de cambios por usuario
- Revertir a versiones anteriores

## Plan requerido

La colaboración en equipo está disponible en los planes **Pro** y **Enterprise**.',
  'tutorial', 'colaboracion-en-equipo', ARRAY['equipo', 'colaboración', 'tiempo real', 'invitar'], 3
);

-- ============================================================
-- ARTÍCULOS — Documentación
-- ============================================================

INSERT INTO doc_articles (title, excerpt, content, category, slug, tags, order_index) VALUES
(
  'Referencia de la API REST',
  'Documentación técnica completa de todos los endpoints de la API de Orion Nexus Studio.',
  '## Base URL

```
https://api.orionnexus.com/api
```

Todos los endpoints requieren el header:
```
Authorization: Bearer <tu_token>
Content-Type: application/json
```

## Autenticación

### POST /auth/login
Inicia sesión y obtiene un token JWT.

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "tu_contraseña"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": { "id": 1, "email": "usuario@ejemplo.com" }
  }
}
```

### POST /auth/register
Registra un nuevo usuario.

**Body:**
```json
{
  "username": "miusuario",
  "email": "usuario@ejemplo.com",
  "password": "tu_contraseña"
}
```

## Proyectos

### GET /projects
Lista todos tus proyectos.

### POST /projects
Crea un nuevo proyecto.

**Body:**
```json
{
  "name": "Mi Proyecto",
  "description": "Descripción opcional",
  "framework": "react",
  "template": "blank"
}
```

### GET /projects/:id
Obtiene un proyecto por ID.

### DELETE /projects/:id
Elimina un proyecto.

## Generación IA

### POST /ai/generate
Genera código con IA.

**Body:**
```json
{
  "prompt": "Crea un formulario de contacto moderno",
  "framework": "react",
  "projectId": 123
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "code": "import React from...",
    "creditsUsed": 5,
    "creditsRemaining": 95
  }
}
```

## Códigos de respuesta

| Código | Significado |
|--------|-------------|
| 200 | Éxito |
| 201 | Creado |
| 400 | Solicitud inválida |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | No encontrado |
| 429 | Demasiadas solicitudes |
| 500 | Error del servidor |',
  'documentation', 'referencia-api-rest', ARRAY['API', 'REST', 'endpoints', 'autenticación', 'técnico'], 1
),
(
  'Frameworks compatibles',
  'Conoce todos los frameworks y lenguajes que soporta la generación IA de Orion Nexus Studio.',
  '## Frameworks de Frontend

### React
El framework más popular. Orion genera:
- Componentes funcionales con hooks
- TypeScript por defecto
- Styled con TailwindCSS o CSS Modules

**Ejemplo de prompt:**
```
Crea un componente React para una tarjeta de producto con imagen, título, precio y botón de compra
```

### Vue 3
Orion genera componentes con la Composition API:
- `<script setup>` por defecto
- TypeScript compatible
- Props y emits tipados

### Angular
Generación de:
- Componentes standalone
- Servicios e inyección de dependencias
- Módulos y routing

### HTML/CSS Vanilla
Para proyectos sin frameworks:
- HTML5 semántico
- CSS3 con variables y Flexbox/Grid
- JavaScript ES6+

## Frameworks de Backend (próximamente)

- **Node.js + Express**
- **Python + FastAPI**
- **Django**

## Plantillas disponibles

Al crear un proyecto puedes elegir una plantilla base:

| Plantilla | Descripción |
|-----------|-------------|
| `blank` | Proyecto vacío |
| `landing` | Landing page con hero y secciones |
| `dashboard` | Panel de administración |
| `ecommerce` | Tienda en línea básica |
| `blog` | Blog con listado y detalle |
| `portfolio` | Portafolio personal |

## Configuración del proyecto

Puedes especificar en tu prompt:
- **Framework:** `usando Vue 3`, `en Angular`
- **Estilos:** `con Tailwind`, `usando Bootstrap`
- **TypeScript:** `en TypeScript`, `sin TypeScript`
- **Tema:** `modo oscuro`, `colores corporativos azul y gris`',
  'documentation', 'frameworks-compatibles', ARRAY['react', 'vue', 'angular', 'html', 'frameworks'], 2
),
(
  'Editor de código integrado',
  'Aprende todas las funcionalidades del editor Monaco integrado en Orion Nexus Studio.',
  '## Sobre el Editor Monaco

Orion usa **Monaco Editor**, el mismo motor que impulsa Visual Studio Code, con todas sus funcionalidades.

## Características principales

### Resaltado de sintaxis
Soporta más de 50 lenguajes incluyendo:
- JavaScript / TypeScript
- HTML / CSS / SCSS
- Python, Go, Rust
- JSON, Markdown, YAML

### Autocompletado inteligente
- Sugerencias de código en tiempo real
- Importaciones automáticas
- Documentación inline al hacer hover

### Atajos de teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl+S` | Guardar archivo |
| `Ctrl+Z` | Deshacer |
| `Ctrl+Shift+Z` | Rehacer |
| `Ctrl+/` | Comentar línea |
| `Alt+↑/↓` | Mover línea |
| `Ctrl+D` | Duplicar selección |
| `Ctrl+F` | Buscar en archivo |
| `Ctrl+H` | Buscar y reemplazar |

### Gestión de archivos

El panel izquierdo del editor muestra el árbol de archivos:
- Haz clic en un archivo para abrirlo
- Clic derecho para renombrar o eliminar
- Arrastra para reorganizar

### Vista previa en tiempo real

El panel derecho muestra una preview en vivo de tu aplicación. Los cambios en el editor se reflejan automáticamente.

## Integración con IA

Mientras editas, puedes usar el Chat IA para:
- Explicar el código seleccionado
- Refactorizar una función
- Generar tests para tu código
- Corregir errores automáticamente',
  'documentation', 'editor-de-codigo-integrado', ARRAY['editor', 'Monaco', 'VS Code', 'atajos', 'código'], 3
);

-- ============================================================
-- FAQs
-- ============================================================

INSERT INTO doc_faqs (question, answer, category, order_index) VALUES
(
  '¿Cómo empiezo a crear mi primer proyecto?',
  'Ve al Chat IA desde el menú lateral y describe lo que quieres construir. Por ejemplo: "Crea una página de login moderna con formulario de email y contraseña". El asistente generará el código automáticamente. Luego puedes refinarlo con más prompts o editarlo directamente en el editor.',
  'general', 1
),
(
  '¿Qué frameworks son compatibles?',
  'Orion soporta React (con TypeScript y TailwindCSS por defecto), Vue 3, Angular y HTML/CSS Vanilla. Próximamente añadiremos soporte para frameworks de backend como Node.js/Express y FastAPI. Puedes especificar el framework en tu prompt.',
  'general', 2
),
(
  '¿Cómo funciona el sistema de créditos?',
  'Los créditos funcionan en dos capas: créditos diarios que se renuevan cada día + un pool mensual de respaldo. Plan Free: 5 créditos/día (sin pool mensual). Plan Pro: 10 créditos/día + 500 de pool mensual. Plan Enterprise: 50 créditos/día + 2,000 de pool mensual. Cuando agotas los créditos diarios se descuenta del pool. El editor y exportación nunca consumen créditos.',
  'general', 3
),
(
  '¿Puedo exportar mi código?',
  'Sí. Ve a tu proyecto y haz clic en "Exportar" para descargar todo el código fuente como un archivo .zip. El proyecto incluye package.json, configuración de Vite o el bundler correspondiente, y todos los archivos fuente listos para ejecutar con npm install && npm run dev.',
  'general', 4
),
(
  '¿Cómo colaboro con mi equipo?',
  'Invita miembros a tu workspace desde Configuración > Equipo. Los colaboradores podrán ver y editar proyectos compartidos en tiempo real. La colaboración está disponible en los planes Pro y Enterprise.',
  'general', 5
),
(
  '¿El código generado es de mi propiedad?',
  'Sí, todo el código generado a través de Orion es 100% tuyo. No tenemos ninguna restricción sobre el uso comercial del código que generes con nuestra plataforma.',
  'general', 6
),
(
  '¿Puedo conectar mi cuenta de GitHub?',
  'Sí. Puedes registrarte directamente con GitHub o vincularlo desde Configuración > Integraciones. Esto te permite hacer push de tus proyectos directamente a tus repositorios de GitHub.',
  'general', 7
),
(
  '¿Qué pasa si me quedan sin créditos?',
  'Cuando se agotan tus créditos diarios, el sistema usa tu pool mensual automáticamente (disponible en Pro y Enterprise). Si también se agota el pool, la generación IA queda pausada hasta el día siguiente cuando se recargan los créditos diarios. El editor, navegación y exportación de proyectos siguen funcionando sin límites. También puedes actualizar tu plan en cualquier momento.',
  'general', 8
),
(
  '¿Hay una app móvil disponible?',
  'Actualmente Orion Nexus Studio es una plataforma web optimizada para escritorio. Estamos trabajando en una versión adaptada para tablets. La app móvil está en nuestra hoja de ruta para el próximo año.',
  'general', 9
),
(
  '¿Cómo cancelo mi suscripción?',
  'Puedes cancelar tu suscripción en cualquier momento desde Configuración > Plan > Cancelar suscripción. Al cancelar, mantienes acceso al plan Pro hasta el final del período pagado. Luego, tu cuenta pasa automáticamente al plan Free.',
  'general', 10
);
