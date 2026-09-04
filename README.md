# Catálogo MVP

Aplicación Next.js para catálogo público, administración y envío de pedidos por WhatsApp.

## Requisitos

- Node.js 20+
- Cuenta de Supabase con proyecto configurado
- Número de WhatsApp comercial para el checkout público

## Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores reales:

```bash
cp .env.example .env.local
```

Variables obligatorias:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_WHATSAPP_PHONE`

Opcional:

- `SUPABASE_SERVICE_ROLE_KEY`

## Comandos

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
```

## Calidad y producción

- CI ejecuta lint, tests y build en cada pull request.
- El carrito se valida antes de abrir WhatsApp para descartar productos eliminados o con precios desactualizados.
- Las migraciones de Supabase quedan en `supabase/migrations` y las políticas RLS están definidas para lectura pública y administración autenticada.
