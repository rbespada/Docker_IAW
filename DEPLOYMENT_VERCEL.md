# Guía de Despliegue en Vercel

## Descripción General

Vercel es una plataforma de despliegue serverless optimizada para aplicaciones frontend y backend ligeros. La arquitectura WebStack puede desplegarse en Vercel de varias formas:

1. **Frontend React** en Vercel (recomendado)
2. **Strapi CMS** en Vercel (usando PostgreSQL externo)
3. **Microservicios** como funciones Serverless de Vercel

Esta guía cubre las configuraciones principales.

---

## 1. Despliegue de Frontend React

### 1.1 Requisitos Previos

- Cuenta en [Vercel](https://vercel.com)
- Repositorio GitHub con el código del proyecto
- Git instalado localmente

### 1.2 Pasos

#### A. Conectar GitHub a Vercel

1. Ir a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Hacer clic en **"New Project"**
3. Seleccionar **"Import Git Repository"**
4. Buscar y seleccionar el repositorio `Docker_IAW`
5. Vercel detectará automáticamente que es un proyecto Vite/React

#### B. Configurar Ambiente de Construcción

Vercel debería detectar automáticamente:
- **Framework Preset:** Vite
- **Build Command:** `npm run build` (configurado en vite.config.js)
- **Output Directory:** `dist`
- **Install Command:** `npm install`

Si es necesario modificar manualmente:

```
Build Command:    npm run build
Output Directory: dist
Node.js Version:  18.x (recomendado)
```

#### C. Variables de Entorno para Frontend

En la dashboard de Vercel, ir a **"Settings" → "Environment Variables"** y agregar:

| Variable | Valor | Ejemplo |
|----------|-------|---------|
| VITE_API_URL | URL del API Gateway o Strapi | `https://api.example.com` |

**Nota:** Si el API está en otro servicio Vercel, usar la URL del servicio.

#### D. Deployment

1. Hacer clic en **"Deploy"**
2. Vercel construirá el proyecto automáticamente
3. Una vez completado, recibirá una URL pública

**Resultado:** 
- URL generada: `https://webstack-{id}.vercel.app`
- Cada commit a la rama principal genera nuevo deployment

---

## 2. Despliegue de Strapi CMS en Vercel

### 2.1 Preparación

Strapi requiere una base de datos PostgreSQL externa. Opciones:

- **Vercel Postgres** (integración nativa, recomendado)
- **AWS RDS**
- **Supabase** (PostgreSQL gestionado)
- **Neon** (PostgreSQL serverless)

#### Opción A: Usar Vercel Postgres (Recomendado)

1. En [vercel.com/dashboard](https://vercel.com/dashboard), ir a **"Storage"**
2. Hacer clic en **"Create Database"** y seleccionar **"Postgres"**
3. Dale un nombre (ej: `webstack-db`)
4. Conectar a un proyecto Vercel
5. Copiar las credenciales de conexión

#### Opción B: Usar Supabase

1. Ir a [supabase.com](https://supabase.com) y crear cuenta
2. Crear proyecto nuevo
3. En **"Settings" → "Database"**, copiar las credenciales

### 2.2 Configurar Strapi para Vercel

#### A. Instalar dependencias de producción

```bash
cd services/cms

# Instalar dependencias requeridas para Vercel
npm install pg --save
npm install better-sqlite3 --save-dev  # Solo para desarrollo local
```

#### B. Crear archivo de configuración Vercel

Ya existe `/services/cms/vercel.json`. Asegurarse de que contenga:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "NODE_ENV": "production",
    "DATABASE_CLIENT": "postgres"
  }
}
```

#### C. Actualizar archivo de configuración de base de datos

Editar `services/cms/src/config/database.js`:

```javascript
module.exports = ({ env }) => {
  if (env('NODE_ENV') === 'production') {
    // Usar PostgreSQL en producción
    return {
      client: 'postgres',
      connection: {
        host: env('DATABASE_HOST'),
        port: env('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME'),
        user: env('DATABASE_USERNAME'),
        password: env('DATABASE_PASSWORD'),
      },
      useNullAsDefault: true,
    };
  }
  
  // SQLite para desarrollo
  return {
    client: 'better-sqlite3',
    connection: { filename: env('DATABASE_FILENAME', '.tmp/db.sqlite') },
    useNullAsDefault: true,
  };
};
```

### 2.3 Desplegar en Vercel

#### A. Push del código a GitHub

```bash
cd services/cms
git add .
git commit -m "Add Strapi CMS configuration for Vercel"
git push origin main
```

#### B. Crear proyecto en Vercel

1. Ir a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Hacer clic en **"New Project"**
3. Seleccionar el repositorio (`Docker_IAW`)
4. Seleccionar **"Other"** como framework (o directamente Next.js si lo detecta)
5. En **"Root Directory"**, establecer: `services/cms`

#### C. Configurar Variables de Entorno en Vercel

Ir a **"Settings" → "Environment Variables"** y agregar:

```
DATABASE_HOST      = [De Vercel Postgres/Supabase]
DATABASE_PORT      = 5432
DATABASE_NAME      = [Nombre de la base de datos]
DATABASE_USERNAME  = [Usuario PostgreSQL]
DATABASE_PASSWORD  = [Contraseña PostgreSQL]
JWT_SECRET         = [Generar con: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"]
ADMIN_JWT_SECRET   = [Generar igual]
API_TOKEN_SALT     = [Generar igual]
NODE_ENV           = production
```

**Nota:** Para generar secretos:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

#### D. Deploy

1. Hacer clic en **"Deploy"**
2. Vercel ejecutará `npm run build` y desplegará a URLs serverless

**Resultado:**
- URL de Strapi: `https://webstack-cms-{id}.vercel.app`
- Admin panel: `https://webstack-cms-{id}.vercel.app/admin`

---

## 3. Despliegue de Microservicios como Serverless Functions

### 3.1 Convertir Express a Vercel Functions

Strapi usa Vercel Functions internamente. Para otros microservicios (Product, Cart, etc.), puede usar `/api` routes:

#### Estructura de carpetas (ejemplo para Product Service)

```
services/product/
├── api/
│   ├── products.js
│   └── health.js
├── README.md
├── package.json
└── vercel.json
```

#### Crear archivo de ruta (`api/products.js`)

```javascript
// services/product/api/products.js
import Pool from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export default async (req, res) => {
  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM products');
      return res.status(200).json(result.rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { name, description, price, stock } = req.body;
      const result = await pool.query(
        'INSERT INTO products (name, description, price, stock) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, description, price, stock]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
```

#### Crear vercel.json para Functions

```json
{
  "version": 2,
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@DATABASE_URL"
  }
}
```

### 3.2 Variables de Entorno

En Vercel dashboard **"Settings" → "Environment Variables"**:

| Variable | Valor |
|----------|-------|
| DATABASE_URL | URL completa del PostgreSQL (ej: `postgresql://user:pass@host:5432/db`) |

---

## 4. Arquitectura Completa en Vercel

### Opción 1: Frontend + CMS (Recomendado)

```
Frontend (React)         → Vercel (Static/SSR)
↓
API Gateway             → Strapi CMS (Vercel Functions)
↓
PostgreSQL              → Vercel Postgres o Supabase
```

**Ventajas:**
- Despliegue fácil y rápido
- Base de datos integrada
- CDN global de Vercel

**Desventajas:**
- Microservicios no escalables separadamente
- Cold starts en Functions

### Opción 2: Frontend + CMS + Microservicios en Vercel

Cada microservicio como proyecto Vercel separado:

```
Frontend Project    → Vercel A
Strapi CMS         → Vercel B
Product Service    → Vercel C
Cart Service       → Vercel D
```

Actualizar URLs del API Gateway para que apunte a cada proyecto Vercel.

---

## 5. Conexión Frontend a Backend en Vercel

### 5.1 Actualizar VITE_API_URL

En el frontend, crear archivo `.env.production`:

```
VITE_API_URL=https://webstack-cms-{id}.vercel.app
```

O configurar en Vercel dashboard:
- **Settings → Environment Variables**
- `VITE_API_URL` = `https://webstack-cms-{id}.vercel.app`

### 5.2 Configurar CORS en Strapi

Editar `/services/cms/src/config/middlewares.js`:

```javascript
module.exports = [
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: ['https://webstack-{id}.vercel.app', 'http://localhost:5173'],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'app::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

---

## 6. Observabilidad y Logs

### 6.1 Ver Logs en Vercel

En [vercel.com/dashboard](https://vercel.com/dashboard):
1. Seleccionar el proyecto
2. Ir a **"Deployments"**
3. Hacer clic en un deployment
4. Ver **"Logs"** en tiempo real

### 6.2 Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `DATABASE_URL is not defined` | Variable de entorno no establecida | Agregarlo en Vercel → Settings → Environment Variables |
| `Module not found` | Dependencia no instalada | Agregar a `package.json` y hacer push |
| `Cold start timeout` | Function tarda > 30s en iniciar | Optimizar código o aumentar memory en vercel.json |
| `CORS error` | Origen no autorizado | Actualizar CORS config en Strapi |

---

## 7. Dominios Personalizados

### 7.1 Agregar dominio a Vercel

1. En **Dashboard → Settings → Domains**
2. Agregar dominio propio (ej: `webstack.com`)
3. Seguir instrucciones para configurar DNS
4. Vercel provision SSL automáticamente

### 7.2 URLs finales

```
Frontend:   https://webstack.com
Strapi CMS: https://api.webstack.com (o /cms)
```

---

## 8. Backup y Datos

### 8.1 Backup de PostgreSQL

```bash
# Si usa Vercel Postgres
pg_dump postgresql://user:pass@host/db > backup.sql

# Restore
psql postgresql://user:pass@host/db < backup.sql
```

### 8.2 Backup de Media/Uploads de Strapi

Los uploads NO se persisten en Vercel (serverless ephemeral). Opciones:

1. **Usar AWS S3** para uploads
2. **Usar Cloudinary** para imágenes
3. **Configurar ECS/Render** para Strapi persistente

Editar `/services/cms/config/plugins.js`:

```javascript
module.exports = {
  upload: {
    provider: 'aws-s3',
    providerOptions: {
      accessKeyId: env('AWS_ACCESS_KEY_ID'),
      secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
      region: env('AWS_REGION'),
      params: {
        Bucket: env('AWS_BUCKET'),
      },
    },
  },
};
```

---

## 9. Pricing y Límites

### Vercel Free Tier
- Deploys ilimitados
- CDN global
- up to 10 Serverless Functions
- 100GB requests/mes
- Cold start penalties

### Vercel Pro
- Todas las características Free
- Unlimited Functions
- Analytics avanzado
- $20/mes + bandwidth adicional

### Sugerencias
- **Frontend:** Vercel Free (static, muy rápido)
- **CMS:** Vercel Pro o Render (mejor para aplicaciones backend)
- **BD:** Vercel Postgres o Supabase Free (5GB)

---

## 10. Referencias

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js/Vite Deployment](https://vercel.com/guides)
- [Strapi Vercel Deployment](https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/vercel.html)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase](https://supabase.com/docs)
