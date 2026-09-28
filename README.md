# Tintero

Mesa de trabajo del Club de Informática UADE: ideas, proyectos, presupuestos en LaTeX, inventario, padrón, tablón y calendario.

## Correrlo en la máquina

```bash
npm install
npm run dev
```

Abrí http://localhost:3000. La primera vez se crea `data/store.json` con datos de ejemplo. La contraseña de esas cuentas sale de `SEED_PASSWORD` en `.env.local`; si no está, es `tintero-local`.

El PDF sale con el binario de Tectonic que está en `src/server/engine`. Si no puede compilar, igual se baja el `.tex`.

## Hosting

La base está en el proyecto Supabase [tintero](https://supabase.com/dashboard/project/xiqqdjlpundxbssfezcb), región São Paulo. Las claves están en `.env.local` y no se commitean.

En Vercel hacen falta estas variables, solo en el servidor:

```
SESSION_SECRET=un-secreto-largo
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=
```

En el plan gratis, Supabase pausa el proyecto si pasa una semana sin uso. Los datos quedan. Se reanuda desde el dashboard.

## Alta de gente

Quien no tiene ficha pide el alta desde el login. Queda pendiente hasta que alguien de la comisión lo pase a activo en el padrón. La primera ficha, si la base está vacía, nace como presidencia.
