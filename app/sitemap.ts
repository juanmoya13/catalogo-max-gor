import { MetadataRoute } from 'next'
// Asegúrate de importar el cliente o la utilidad que usas en tu proyecto
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://catalogo-max-gor.vercel.app';

  // 1. Rutas estáticas de tu sitio
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    }
  ];

  // 2. Rutas dinámicas (Tus productos)
  // Reemplaza con tu configuración real de entorno o cliente de Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL!, 
    process.env.SUPABASE_ANON_KEY!
  );

  // Consulta a la tabla donde guardas el catálogo
  const { data: productos } = await supabase
    .from('productos')
    .select('id'); // Solo necesitas el identificador y la fecha de actualización

  // 3. Mapear los datos de Supabase al formato que requiere el sitemap
  const dynamicRoutes: MetadataRoute.Sitemap = productos?.map((producto) => ({
    url: `${baseUrl}/producto/${producto.id}`, 
    lastModified: new Date(new Date()),
    changeFrequency: 'weekly',
    priority: 0.7,
  })) || [];

  // 4. Retornar la unión de rutas estáticas y dinámicas
  return [...staticRoutes, ...dynamicRoutes];
}