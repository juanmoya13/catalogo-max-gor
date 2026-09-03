<style>
pre, code {
    font-size: 10px; /* Ajusta este valor hasta que el diagrama encaje */
}
</style>
# Documento de Diseño Técnico de Software: MVP Catálogo de Productos WhatsApp

---

## Prefacio y Control de Versiones

Este documento técnico de diseño ha sido elaborado para guiar el desarrollo e implementación del **Mínimo Viable Producto (MVP) del Catálogo de Productos con Integración a WhatsApp** [205]. Traduce las especificaciones funcionales descritas en el documento de análisis funcional (`etapa-analisis.pdf`) en planos de construcción técnicos y estructurados [12, 176], utilizando como base los estándares del modelo de proceso de diseño propuesto por el autor **Ian Sommerville** en su obra *Ingeniería de Software* [12, 13].

### Control de Versiones

| Versión | Fecha | Estado / Cambios | Autor |
| :--- | :--- | :--- | :--- |
| **v1.0 (Iteración 1)** | 2 de septiembre de 2026 | Definición de los pilares indispensables: **Diseño Arquitectónico** y **Diseño de Base de Datos** [12, 14]. | Generado por Gemini Notebook en colaboración con el usuario |

---

## 1. Introducción y Fronteras del Sistema

El sistema tiene como objetivo principal servir de puente entre el descubrimiento digital de productos y la conversión de venta directa por interacción humana a través de WhatsApp [205, 206, 227]. Para mantener el MVP acotado y evitar la complejidad innecesaria de un comercio electrónico completo, se establece una clara distinción entre lo que ocurre dentro y fuera del sistema [248, 250].

### Frontera del Sistema (In / Out) [249, 250]

```
+------------------------------------------------------------+    +----------------------------+
|                    DENTRO DEL SISTEMA                      |    |     FUERA DEL SISTEMA      |
|                                                            |    |                            |
| [Navegación] -> [Búsqueda/Filtro] -> [Carrito Temporal]    |    | -> [Conversación WhatsApp] |
|                                             |              |    | -> [Disponibilidad Real]   |
| [Autenticación Admin]                       v              | -> | -> [Coordinación de Envío] |
| [Gestión de Productos] --------> [Generar Mensaje Pedido]  |    | -> [Procesamiento de Pago] |
| [Gestión de Filtros] ----------> [Redirección a WhatsApp]  |    | -> [Facturación y Entrega] |
+------------------------------------------------------------+    +----------------------------+
```

---

## 2. Diseño Arquitectónico (Arquitectura del Sistema)

De acuerdo con Ian Sommerville, el diseño arquitectónico identifica la estructura global del sistema, los componentes principales (o subsistemas) y cómo se distribuyen y comunican entre sí [12, 13, 176]. Para este MVP, se adopta un **patrón arquitectónico en capas distribuidas (Multi-tier / Layered Client-Server)** [101, 117], integrando **Next.js** en las capas de presentación y lógica intermedia, y **Supabase** como repositorio central de datos y almacenamiento [14, 55].

### 2.1. Diagrama de Bloques Arquitectónico

El flujo de información y control del sistema se organiza de la siguiente manera:

```
+--------------------------------------------------------------------------------------------------+
| 1. CAPA DE PRESENTACIÓN (Cliente - Navegador Web)                                                |
|                                                                                                  |
|   +----------------------------------+            +------------------------------------------+   |
|   |   Portal Público (Usuario)       |            |   Consola de Administración (Admin)      |   |
|   |   - Navegación, Búsqueda, Filtro |            |   - Gestión de Productos y Fotografías   |   |
|   |   - Carrito Temporal (Memory)    |            |   - Configuración de Filtros y Valores   |   |
|   +----------------------------------+            +------------------------------------------+   |
+-------------------------------------------------^------------------------------------------------+
                                                  | API / Server Actions (JSON / HTTPS)
+-------------------------------------------------v------------------------------------------------+
| 2. CAPA DE SERVICIO / LÓGICA (Next.js Server - Vercel / Node.js)                                  |
|                                                                                                  |
|   +-----------------------------------+          +-------------------------------------------+   |
|   |   Next.js Server Actions          |          |   Next.js Middleware                      |   |
|   |   - Renderizado del Catálogo (SSR) |          |   - Verificación de sesión de Admin       |   |
|   |   - Formateador de Pedidos WA     |          |   - Protección de rutas "/admin/*"        |   |
|   +-----------------------------------+          +-------------------------------------------+   |
+-------------------------------------------------^------------------------------------------------+
                                                  | Supabase SDK / PostgreSQL Connections
+-------------------------------------------------v------------------------------------------------+
| 3. CAPA DE DATOS Y ALMACENAMIENTO (Supabase BaaS)                                                |
|                                                                                                  |
|   +-----------------------------------+          +-------------------------------------------+   |
|   |   PostgreSQL Relational DB        |          |   Supabase Storage (Object Storage)       |   |
|   |   - Tablas de catálogo y filtros  |          |   - Bucket: "product-images"              |   |
|   |   - Reglas RLS y triggers de DB   |          |   - Almacenamiento de fotos (JPG/PNG)     |   |
|   +-----------------------------------+          +-------------------------------------------+   |
+--------------------------------------------------------------------------------------------------+
                                                                                  |
                                                                                  | WhatsApp Deep Links
                                                                                  v (wa.me/num?text=msg)
+--------------------------------------------------------------------------------------------------+
| 4. SERVICIOS EXTERNOS                                                                            |
|                                                                                                  |
|   +------------------------------------------------------------------------------------------+   |
|   |   WhatsApp Web / App (Dispositivo del Cliente o Vendedor)                                |   |
|   |   - Recepción de pedidos formateados e inicio de la atención humana fuera del sistema.   |   |
|   +------------------------------------------------------------------------------------------+   |
+--------------------------------------------------------------------------------------------------+
```

### 2.2. Descripción de Componentes y Decisiones de Diseño

*   **Next.js como Servidor y Cliente:** Se explota la arquitectura híbrida de Next.js (App Router). El renderizado inicial del catálogo público se realiza en el servidor (**Server-side Rendering - SSR**), asegurando un tiempo de carga rápido para dispositivos móviles y una optimización SEO base. La lógica interactiva (como el manejo del Carrito Temporal [216]) se gestiona del lado del cliente mediante componentes React interactivos.
*   **Supabase como Repositorio Central [55]:** Sommerville destaca que un repositorio central evita la duplicidad y mantiene la coherencia de los datos [55, 106]. Supabase gestiona tanto el motor relacional PostgreSQL como el sistema de archivos físicos de las fotos (*Supabase Storage*), centralizando la persistencia y la seguridad a través de sus políticas nativas.
*   **Next.js Middleware:** Actúa como un guardián de red perimetral que intercepta cualquier petición a rutas administrativas (`/admin/*`) y valida el token de sesión emitido por Supabase Auth, evitando la exposición no autorizada del backend.
*   **Carrito de Compras No Persistente (Volátil):** El carrito se almacena en el estado del cliente (React state / Context API) o en la sesión de navegación inmediata [216, 234]. No se almacena en la base de datos ni se persiste en `localStorage` tras abandonar la página, alineándose estrictamente con la simplicidad del MVP y reduciendo el consumo de escrituras en disco [211, 235].

---

## 3. Diseño de la Base de Datos (Especificación de Datos)

El diseño de la base de datos define las estructuras de almacenamiento de datos lógicas y físicas del sistema [14, 26]. Para cumplir con las reglas de negocio, se ha diseñado un esquema relacional normalizado en PostgreSQL (Supabase) que garantiza la consistencia de los datos y la aplicación estricta de las reglas del MVP [14, 233].

### 3.1. Modelo Entidad-Relación (Relacional)

```
  +------------------+             +-------------------+
  |    productos     |             |    fotografias    |
  +------------------+             +-------------------+
  | PK  id (UUID)    |<------------| PK  id (UUID)     |
  |     nombre       | 1         * | FK  producto_id   |
  |     descripcion  |             |     url_imagen    |
  |     precio       |             |     creado_at     |
  |     creado_at    |             +-------------------+
  +------------------+
          | 1
          |
          | *
  +----------------------------------+             +-------------------+
  |    producto_valores_filtros      |             |  valores_filtros  |
  +----------------------------------+             +-------------------+
  | PK,FK producto_id                |             | PK  id (UUID)     |
  | PK,FK filtro_id                  |*-----------1| FK  filtro_id     |
  | FK    valor_filtro_id            |             |     valor         |
  |       creado_at                  |             |     creado_at     |
  +----------------------------------+             +-------------------+
                                                             | *
                                                             |
                                                             | 1
                                                   +-------------------+
                                                   |      filtros      |
                                                   +-------------------+
                                                   | PK  id (UUID)     |
                                                   |     nombre        |
                                                   |     creado_at     |
                                                   +-------------------+
```

### 3.2. Especificación Técnica de Tablas (DDL en PostgreSQL)

A continuación, se detalla el código de definición de datos (DDL) con sus restricciones y llaves, diseñado para ejecutarse directamente en la consola de Supabase.

```sql
-- Habilitar extensión para UUIDs automáticos si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: productos
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL, -- Obligatorio [214, 233]
    descripcion TEXT,             -- Opcional [214, 218]
    precio NUMERIC(12, 2),        -- Opcional (puede ser nulo) [214, 224]
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL -- Para ordenar por fecha [214, 223]
);

-- 2. TABLA: fotografias
CREATE TABLE fotografias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE, -- Eliminación permanente del producto arrastra sus fotos [214, 218, 234]
    url_imagen TEXT NOT NULL,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. TABLA: filtros
CREATE TABLE filtros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL UNIQUE, -- Ej: "Categoría", "Talle", "Color" [215]
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. TABLA: valores_filtros
CREATE TABLE valores_filtros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filtro_id UUID NOT NULL REFERENCES filtros(id) ON DELETE CASCADE, -- Si se borra el filtro, se borran sus valores asociados [220]
    valor VARCHAR(100) NOT NULL, -- Ej: "Negro", "Blanco", "M", "L" [215, 216]
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT valor_unico_por_filtro UNIQUE (filtro_id, valor) -- Evita duplicidad de valores en un mismo filtro
);

-- 5. TABLA: producto_valores_filtros (Tabla puente que aplica la RN-06)
CREATE TABLE producto_valores_filtros (
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE, -- Si se elimina el producto, se eliminan sus asociaciones [218, 234]
    filtro_id UUID NOT NULL REFERENCES filtros(id) ON DELETE CASCADE, -- Si se elimina el filtro, se elimina la asociación pero no el producto (RN-07) [220, 234]
    valor_filtro_id UUID NOT NULL REFERENCES valores_filtros(id) ON DELETE CASCADE,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- LLAVE PRIMARIA COMPUESTA Y RESTRICCIÓN DE INTEGRIDAD CLAVE:
    -- Al definir la PK sobre (producto_id, filtro_id), garantizamos estructuralmente 
    -- que un producto puede tener "como máximo un valor de cada filtro" (RN-06) [216, 233, 241].
    PRIMARY KEY (producto_id, filtro_id)
);
```

### 3.3. Análisis de Decisiones de Diseño de Datos y Reglas de Negocio

1.  **Garantía Estructural de la Regla de Negocio `RN-06` ("Un valor por filtro"):**
    La llave primaria de la tabla puente `producto_valores_filtros` como el par `(producto_id, filtro_id)` rechaza automáticamente cualquier intento de insertar un segundo valor de un filtro ya asignado, arrojando un error de llave duplicada [216, 241].
2.  **Eliminación en Cascada vs. Preservación (`RN-07` y `RN-08`):**
    *   Si el administrador elimina un **Producto** (`RN-08`), la cláusula `ON DELETE CASCADE` de `fotografias` y `producto_valores_filtros` asegura que se limpien de inmediato todos sus registros asociados sin dejar datos huérfanos [214, 234].
    *   Si el administrador elimina un **Filtro** (`RN-07`), la relación en cascada con `producto_valores_filtros` limpia las asociaciones de los productos con ese filtro sin eliminarlos [220, 221, 234].
3.  **Restricción de Fotografía Mínima Obligatoria (`RN-03`):**
    La validación inicial se delega a la capa de lógica en Next.js (Server Actions), impidiendo la creación del registro si no se adjunta al menos una foto [233, 240]. Opcionalmente, se puede programar un trigger de PostgreSQL que impida borrar la última fotografía asociada a un producto [219, 240].

### 3.4. Políticas de Seguridad e Integridad de Datos (Row Level Security - RLS)

| Tabla | Acceso Público (Usuario Final - Anónimo) [205, 206] | Acceso de Administrador (Autenticado) [210, 212] |
| :--- | :--- | :--- |
| `productos` | `SELECT` habilitado (Lectura pública) | `ALL` (INSERT, UPDATE, DELETE, SELECT) |
| `fotografias` | `SELECT` habilitado (Lectura pública) | `ALL` (INSERT, UPDATE, DELETE, SELECT) |
| `filtros` | `SELECT` habilitado (Lectura pública) | `ALL` (INSERT, UPDATE, DELETE, SELECT) |
| `valores_filtros` | `SELECT` habilitado (Lectura pública) | `ALL` (INSERT, UPDATE, DELETE, SELECT) |
| `producto_valores_filtros` | `SELECT` habilitado (Lectura pública) | `ALL` (INSERT, UPDATE, DELETE, SELECT) |

---

## 4. Diseño de Interfaces (Especificación de Interfaces/Endpoints)

De acuerdo con Sommerville, el diseño de interfaces define cómo se comunican las distintas partes del sistema y garantiza que los componentes interactúen sin asunciones incompatibles [14, 176]. En una aplicación moderna de Next.js, se opta por **Server Actions** como el mecanismo de interfaz primario cliente-servidor (lógica síncrona/asíncrona directamente invocada desde componentes React), manteniendo contratos de datos estrictos en formato de datos nativos de TypeScript/JSON.

### 4.1. Interfaces de Lectura (Catálogo Público)

#### 4.1.1. Invocación de Productos Paginados (Carga Incremental)

Esta interfaz permite al portal público solicitar de forma interactiva segmentos de productos ordenados de forma descendente por fecha de creación [214, 223], aplicando filtros y búsquedas dinámicas de texto libre [208, 221, 222].

*   **Nombre de la interfaz:** `getPaginatedProducts` (Server Action)
*   **Parámetros de Entrada (TypeScript Interface):**
```typescript
interface GetProductsInput {
  searchQuery?: string;         // Término de búsqueda por texto libre [221]
  filterValues?: string[];      // Array de IDs de valores de filtros seleccionados [222]
  offset: number;              // Desplazamiento actual para carga incremental [208]
  limit: number;               // Cantidad de productos a recuperar por segmento
}
```

*   **Query SQL Equivalente ejecutada en Supabase:**
```sql
SELECT p.*, 
       coalesce(json_agg(distinct f.*) filter (where f.id is not null), '[]') as fotografias,
       coalesce(json_agg(distinct pv.*) filter (where pv.producto_id is not null), '[]') as filtros
FROM productos p
LEFT JOIN fotografias f ON f.producto_id = p.id
LEFT JOIN producto_valores_filtros pv ON pv.producto_id = p.id
WHERE 
  -- Búsqueda de texto libre por nombre o descripción (Case-insensitive)
  (p.nombre ILIKE '%' || :searchQuery || '%' OR p.descripcion ILIKE '%' || :searchQuery || '%')
  -- Intersección de filtros de producto si se seleccionan valores específicos
  AND (:filterValues IS NULL OR pv.valor_filter_id = ANY(:filterValues))
GROUP BY p.id
ORDER BY p.creado_at DESC
LIMIT :limit OFFSET :offset;
```

---

### 4.2. Interfaces de Escritura y Gestión (Solo Administrador)

Todas estas acciones requieren la verificación de un token JWT válido de Supabase Auth en la capa del servidor de Next.js antes de ejecutar operaciones en base de datos.

#### 4.2.1. Creación de Productos con Fotografías (`RN-03`)

*   **Nombre de la interfaz:** `createProductAction` (Server Action)
*   **Parámetros de Entrada:**
```typescript
interface CreateProductInput {
  nombre: string;
  descripcion?: string;
  precio?: number;
  fotografiasBase64: string[]; // Requiere al menos una imagen en Base64 para cumplir la RN-03 [214, 219, 233]
  filtrosAsociados?: Array<{ filtro_id: string; valor_filtro_id: string }>;
}
```
*   **Flujo y Validación Interna (Transaccional en DB):**
    1.  Verificar que el array `fotografiasBase64` contenga al menos 1 elemento. Si está vacío, lanzar una excepción controlada: `"El producto debe contener al menos una fotografía."` [214, 219].
    2.  Iniciar transacción en Supabase PostgreSQL.
    3.  Insertar registro en la tabla `productos` y recuperar el `UUID` generado.
    4.  Subir archivos de fotos al Supabase Storage Bucket `product-images` y recuperar las URLs públicas correspondientes.
    5.  Insertar las URLs en la tabla `fotografias` vinculadas al `UUID` del producto recién creado.
    6.  Insertar las asociaciones de filtros en `producto_valores_filtros`.
    7.  Confirmar transacción.

#### 4.2.2. Eliminación Definitiva de un Producto (`RN-08`)

*   **Nombre de la interfaz:** `deleteProductAction` (Server Action)
*   **Parámetros de Entrada:**
```typescript
interface DeleteProductInput {
  producto_id: string;
}
```
*   **Flujo Interno:**
    1.  Verificar sesión de administrador.
    2.  Ejecutar `DELETE FROM productos WHERE id = :producto_id`.
    3.  Debido a la restricción `ON DELETE CASCADE` en las tablas `fotografias` y `producto_valores_filtros`, la base de datos limpiará atómicamente la información relacional asociada [214, 234].
    4.  **Limpieza Física de Almacenamiento (Supabase Storage):** De forma asíncrona, el Server Action debe listar los nombres de archivos de fotos asignados al producto y solicitar al Storage Bucket la eliminación física de los archivos JPEG/PNG para evitar consumo de espacio huérfano.

#### 4.2.3. Completitud de Interfaces: Modificación de Productos (`updateProductAction`)

*   **Nombre de la interfaz:** `updateProductAction` (Server Action)
*   **Parámetros de Entrada:**
```typescript
interface UpdateProductInput {
  producto_id: string; // UUID del producto a modificar
  nombre?: string;     // Obligatorio si se envía (RF-02)
  descripcion?: string; // Opcional (admite null para limpiar)
  precio?: number | null; // Opcional (admite null para marcar "A consultar")
  
  // Fotografías:
  // Se envía la lista definitiva de imágenes. Las nuevas imágenes se envían como Base64.
  // Las imágenes existentes que se conservan se envían como URLs públicas ya existentes.
  fotografiasDefinitivas: Array<{
    id?: string;        // UUID si es una foto existente en la DB
    url?: string;       // URL si es una foto existente
    base64?: string;    // Cadena Base64 si es una foto nueva a subir
  }>;

  // Filtros:
  // Lista de asociaciones vigentes para este producto.
  filtrosAsociados?: Array<{
    filtro_id: string;
    valor_filtro_id: string;
  }>;
}

interface ActionResponse {
  success: boolean;
  message: string;
  error?: string;
}
```
*   **Flujo Interno:**
```
                     [Cliente] Invoca updateProductAction(data)
                                        |
                                        v
                        ¿Token JWT de Admin es Válido? [209]
                                /              \
                            (SÍ)                (NO) -> Retornar Error 401 Unauthorized
                              v
                Validación RN-03: ¿fotografiasDefinitivas.length >= 1? [238, 243]
                                /              \
                            (SÍ)                (NO) -> Retornar Error "Debe conservar al menos una foto"
                              v
                    Iniciar Transacción de Base de Datos
                              |
       1. Ejecutar UPDATE sobre tabla 'productos' con campos de texto y precio [198]
                              |
       2. Identificar fotos a eliminar (Fotos en DB que NO están en 'fotografiasDefinitivas')
                              |
       3. Subir nuevas fotos en Base64 a Supabase Storage Bucket ('product-images') [194]
                              |
       4. INSERT de nuevas URLs en tabla 'fotografias' y DELETE de las fotos removidas [198]
                              |
       5. Sincronizar Filtros (Eliminar mapeos anteriores en producto_valores_filtros
          para este producto_id e insertar las nuevas relaciones en filtrosAsociados) [199]
                              |
                  ¿Ocurrió algún error en los pasos?
                                /              \
                            (SÍ)                (NO)
                              v                  v
                 Abortar (Rollback) DB           Confirmar (Commit) Transacción [202]
             + Limpiar archivos subidos temporalmente    + Invocar Revalidación de Rutas Next.js
                              |                  + Ejecutar eliminación asíncrona de fotos
                              v                    físicas viejas en Supabase Storage [203]
                Retornar Error de Transacción            |
                                                         v
                                              Retornar { success: true }
```

### 4.3. Especificación del CRUD de Filtros y Valores (Solo Administrador)

El administrador único del MVP debe tener la capacidad autónoma de gestionar la taxonomía del catálogo (filtros y valores) sin depender de modificaciones manuales de código o base de datos (**RF-06, RF-07, RF-08**) [234, 236].

#### 4.3.1. Creación de Filtro y Valores Asociados (`createFilterAction`)

*   **Firma del Endpoint:**
    ```typescript
    interface CreateFilterInput {
      nombre: string;       // Ej: "Talle", "Color", "Categoría" [239]
      valoresIniciales?: string[]; // Ej: ["S", "M", "L"] [240]
    }
    ```
*   **Procedimiento SQL Transaccional:**
    1.  Verificar credenciales administrativas del token de sesión [209].
    2.  Insertar el registro base en la tabla `filtros`:
        ```sql
        INSERT INTO filtros (nombre) VALUES (:nombre) RETURNING id;
        ```
    3.  Si se especificaron `valoresIniciales`, realizar inserción en lote (Bulk Insert) en la tabla `valores_filtros`:
        ```sql
        INSERT INTO valores_filtros (filtro_id, valor)
        VALUES 
          (:filtro_id, 'S'),
          (:filtro_id, 'M'),
          (:filtro_id, 'L')
        ON CONFLICT (filtro_id, valor) DO NOTHING; -- Evita duplicados a nivel físico [198, 199]
        ```

#### 4.3.2. Modificación de Filtro y Valores Asociados (`updateFilterAction`)

*   **Firma del Endpoint:**
    ```typescript
    interface UpdateFilterInput {
      filtro_id: string;      // UUID del filtro a modificar
      nuevoNombre?: string;   // Opcional, para renombrar el filtro (Ej: de "Talle" a "Talla")
      valoresNuevos?: string[]; // Valores adicionales a agregar (Ej: ["XL", "XXL"])
      valoresAEliminar?: string[]; // IDs de valores a eliminar permanentemente
    }
    ```
*   **Procedimiento SQL Transaccional:**
    1.  Verificar sesión de administrador [209].
    2.  Si se provee `nuevoNombre`, ejecutar el UPDATE en la tabla `filtros`:
        ```sql
        UPDATE filtros SET nombre = :nuevoNombre WHERE id = :filtro_id;
        ```
    3.  Si hay `valoresAEliminar`, ejecutar DELETE sobre `valores_filtros`. *Nota de Ingeniería:* Debido al diseño de cascada referencial (`ON DELETE CASCADE`) definido en el DDL de la Iteración 1 [199], esta eliminación limpiará de forma inmediata todas las asociaciones de productos con estos valores específicos en la tabla `producto_valores_filtros`, manteniendo la consistencia global sin intervención adicional del software [199, 234].
    4.  Si hay `valoresNuevos`, ejecutar INSERT en `valores_filtros` mapeados a `filtro_id`.

#### 4.3.3. Eliminación Permanente de un Filtro (`deleteFilterAction`)

*   **Firma del Endpoint:**
    ```typescript
    interface DeleteFilterInput {
      filtro_id: string; // UUID del filtro a eliminar
    }
    ```
*   **Comportamiento de Cascada Estructural e Impacto en Productos (RN-07):**
    ```sql
    DELETE FROM filtros WHERE id = :filtro_id;
    ```
    *   *Análisis del impacto de cascada:* Ian Sommerville destaca la importancia de prever los efectos colaterales al diseñar las interfaces de borrado [104]. De acuerdo con la regla de negocio **RN-07** (La eliminación de un filtro no elimina productos) [244, 260], la base de datos ejecuta automáticamente el siguiente flujo atómico:
        1.  La tabla `valores_filtros` elimina en cascada todos los valores que tengan el `filtro_id` afectado [198].
        2.  La tabla puente `producto_valores_filtros` elimina en cascada todos los registros de asociación con dicho `filtro_id` o con los `valor_filtro_id` eliminados [199].
        3.  La tabla de entidades nucleares `productos` **se mantiene intacta** [199, 244]. Los productos que utilizaban ese filtro simplemente pierden dicha asociación y siguen mostrándose perfectamente en el catálogo sin el filtro obsoleto [244].

---

### 5.3. Interfaz Externa: Generación del Enlace de Pedido de WhatsApp

Esta es una interfaz sin base de datos, ejecutada en la capa de presentación (Cliente), que toma el estado actual del carrito y construye una dirección URI codificada de acuerdo con las especificaciones de integración de WhatsApp [209, 226].

*   **Firma del componente lógico:** `generateWhatsAppUrl(items: CartItem[], phone: string): string`
*   **Estructura del Formato del Mensaje:** El formato debe cumplir con la legibilidad requerida para una venta humana fluida [209, 226, 227]:
```
Hola, quiero realizar el siguiente pedido:

- [Cantidad] x [Nombre del Producto] ([ValorFiltro1], [ValorFiltro2]) - $[Precio Unitario] c/u

*Total estimado:* $[Suma Total]

¡Muchas gracias!
```
*   **Algoritmo de Codificación (TypeScript):**
```typescript
export function generateWhatsAppUrl(items: CartItem[], phoneNumber: string): string {
  let message = "Hola, quiero realizar el siguiente pedido:\n\n";
  let total = 0;

  items.forEach(item => {
    const filtersText = item.filtrosSelected.length > 0 
      ? ` (${item.filtrosSelected.map(f => f.valor).join(", ")})` 
      : "";
    
    const itemSubtotal = (item.producto.precio ?? 0) * item.cantidad;
    total += itemSubtotal;
    
    message += `- ${item.cantidad} x ${item.producto.nombre}${filtersText} - $${item.producto.precio ?? "N/A"} c/u\n`;
  });

  message += `\n*Total estimado:* $${total.toFixed(2)}\n\n¡Muchas gracias!`;
  
  // Codificar el texto plano para compatibilidad de URI
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedText}`;
}
```

---

## 5. Diseño de Componentes Clave

El diseño de componentes detalla cómo se gestionará el estado interno y la lógica de las entidades funcionales cruciales de la aplicación antes de traducirse en clases o funciones de React [14].

### 5.1. Componente de Gestión del Carrito Temporal (Volátil y en Memoria)

El análisis funcional prohíbe explícitamente almacenar el carrito en cuentas de usuario y promueve mantenerlo de forma temporal durante la sesión de navegación del usuario final para asegurar simplicidad y rapidez [209, 211, 216].

#### 5.1.1. Estructura de Estado de Cliente (State Management Pattern)

Se implementa utilizando React Context API o un micro-estado con **Zustand** que gestiona un store volátil:

```typescript
type CartItem = {
  producto: {
    id: string;
    nombre: string;
    precio: number | null;
    imagenPortada: string;
  };
  filtrosSelected: Array<{
    filtro_id: string;
    nombre_filtro: string;
    valor: string;
  }>;
  cantidad: number; // Mínimo 1
};

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productoId: string, uniqueSignature: string) => void;
  updateQuantity: (productoId: string, uniqueSignature: string, q: number) => void;
  clearCart: () => void;
}
```

#### 5.1.2. Reglas de Comportamiento Lógico del Carrito:

1.  **Firma Única por Combinación de Filtros:** Dado que los productos pueden tener filtros, dos productos idénticos en ID pero con diferente configuración de filtros seleccionados (Ej: *Remera Talle M* y *Remera Talle L*) deben tratarse como ítems independientes en el carrito.
    *   *Solución técnica:* Se calcula una firma hash SHA-1 o un string concatenado simple `id_producto:id_valor1_id_valor2` para actuar como llave de combinación única dentro de la lógica del carrito.
2.  **Verificación de Eliminación de Productos en Tiempo Real (Resiliencia):** 
    *   Si el administrador elimina o modifica un producto del catálogo de la base de datos mientras un usuario público lo tiene cargado en su carrito temporal en el navegador, el sistema podría intentar enviar un pedido de WhatsApp con información obsoleta o inválida [234, 236].
    *   *Solución de Diseño:* En el componente del catálogo del lado del cliente, o inmediatamente antes de generar el enlace wa.me, se realizará una comprobación silenciosa y ultrarrápida contra la base de datos mediante un query de validación por IDs. Si el producto ya no existe, el carrito lo elimina automáticamente y notifica al usuario con un banner de advertencia ("Un producto en tu carrito ya no está disponible y fue retirado").

---

### 5.2. Componente de Protección de Consola Administrativa (Next.js Middleware + Supabase Auth)

El único rol del administrador requiere autenticación para poder acceder a las vistas de modificación, creación y eliminación de recursos [210, 212].

#### 5.2.1. Arquitectura de Control de Acceso (Middleware Interceptor):

```
                       Petición del Usuario
                                |
                                v
                   [ Next.js Middleware.ts ]
                                |
              ¿La ruta comienza con "/admin"? 
                      /               \
                    SÍ                 NO
                    /                    \
     [ Supabase Auth Client SDK ]         Permitir Acceso Libre 
     ¿Hay token JWT válido activo?       (Renderizado Catálogo)
              /             \
            SÍ               NO
            /                 \
  Permitir acceso a        Redirección a "/login"
  Ruta Administrativa      (Parámetro: ?error=unauthorized)
```

#### 5.2.2. Diseño Técnico del Middleware (`middleware.ts`):

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Obtiene la sesión actual de forma segura validando el JWT del lado del servidor
  const { data: { session } } = await supabase.auth.getSession();

  const isAccessingAdmin = req.nextUrl.pathname.startsWith('/admin');

  if (isAccessingAdmin && !session) {
    // Si no está autenticado, redirige al inicio de sesión de administrador
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'], // Solo interceptar rutas bajo la consola administrativa
};
```

---

## 6. Lógica Dinámica de Ordenamiento y Gestión de Valores Nulos

El requerimiento **RF-13** especifica que el catálogo público debe poder ordenarse por: "Más recientes", "Nombre A-Z", "Precio menor a mayor" y "Precio mayor a menor" [247]. Adicionalmente, el requerimiento **RF-15** dictamina que existen "productos sin precio" (cuyo valor de precio en base de datos es `NULL`) y que requieren un comportamiento técnico determinado durante la ordenación por precio [247, 248].

### 6.1. Firma Extendida del Endpoint del Catálogo público (`getPaginatedProducts`)

```typescript
interface GetPaginatedProductsInput {
  searchQuery?: string;
  filterValues?: string[];
  offset: number;
  limit: number;
  sortBy: 'recientes' | 'alfabetico' | 'precio_asc' | 'precio_desc'; // Parámetro incorporado
}
```

### 6.2. Estrategia SQL para el Manejo de Nulos (`NULLS LAST` en PostgreSQL)

En PostgreSQL (el motor de Supabase), por defecto, los valores `NULL` se consideran mayores que cualquier valor no nulo durante una ordenación ascendente. En una ordenación descendente, los valores `NULL` se colocan al principio. 

Esto arruinaría la experiencia de usuario del catálogo, ya que en "Precio mayor a menor", los productos sin precio aparecerían arriba del todo, y en "Precio menor a mayor" podrían desordenar la paginación según el ordenamiento por defecto del motor de base de datos.

*   **Solución Técnica de Diseño:** Implementar la cláusula **`NULLS LAST`** explícita en las sentencias dinámicas de ordenamiento por precio. Esto garantiza que **todos los productos sin precio ("A consultar") se agrupen de manera consistente al final del catálogo**, priorizando siempre la visualización de los productos que sí cuentan con un precio vigente definido [247, 248].

### 6.3. Construcción Dinámica de la Consulta SQL (SQL Generator Map)

Dependiendo de la opción de ordenamiento seleccionada por el usuario en la UI, el backend de Next.js construirá la sección `ORDER BY` del query de base de datos de la siguiente manera [211]:

```sql
-- Query Base Común de Lectura [200]:
SELECT p.*,  
       coalesce(json_agg(distinct f.*) filter (where f.id is not null), '[]') as fotografias, 
       coalesce(json_agg(distinct pv.*) filter (where pv.producto_id is not null), '[]') as filtros_asociados 
FROM productos p
LEFT JOIN fotografias f ON f.producto_id = p.id
LEFT JOIN producto_valores_filtros pv ON pv.producto_id = p.id
WHERE (p.nombre ILIKE '%' || :searchQuery || '%' OR p.descripcion ILIKE '%' || :searchQuery || '%')
  AND (:filterValues IS NULL OR pv.valor_filtro_id = ANY(:filterValues))
GROUP BY p.id

-- SQL DINÁMICO INYECTADO PARA EL ORDENAMIENTO (RF-13 & RF-15) [247]:
-- 1. Si sortBy === 'recientes'
ORDER BY p.creado_at DESC, p.nombre ASC

-- 2. Si sortBy === 'alfabetico'
ORDER BY p.nombre ASC

-- 3. Si sortBy === 'precio_asc'
ORDER BY p.precio ASC NULLS LAST, p.creado_at DESC

-- 4. Si sortBy === 'precio_desc'
ORDER BY p.precio DESC NULLS LAST, p.creado_at DESC

LIMIT :limit OFFSET :offset;
```

---

## 7. Flujo de Autenticación de Administrador (`loginAction`)

Completando el Middleware de seguridad interceptor detallado en el diseño técnico anterior (`diseno-tecnico-v2.md`), definimos la acción responsable de realizar el proceso de login seguro contra el SDK de autenticación de Supabase [209].

### 7.1. Firma de Entrada y Salida (TypeScript)

```typescript
interface LoginInput {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  session?: {
    accessToken: string;
    expiresAt: number;
  };
}
```

### 7.2. Algoritmo de Autenticación y Generación de Cookies del Lado del Servidor

En Next.js (App Router), el proceso de inicio de sesión de Supabase Auth se ejecuta del lado del servidor de manera transparente para permitir que el Middleware intercepte las rutas administrativas (`/admin/*`) mediante cabeceras seguras de sesión de cookie [210].

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function loginAction(input: LoginInput): Promise<LoginResponse> {
  const { email, password } = input;
  const cookieStore = cookies();
  
  // Instanciar cliente de Supabase acoplado a las cabeceras de Next.js
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    // Intento de autenticación contra el tenant único de Supabase Auth (RF-01, RN-02) [241, 259]
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return {
        success: false,
        message: "Credenciales de administrador inválidas.",
        error: error.message
      };
    }

    // La sesión y las cookies JWT seguras se establecen automáticamente en el cookieStore.
    // El middleware interceptará de forma transparente las futuras llamadas administrativas.
    return {
      success: true,
      message: "Autenticación de administrador completada.",
      session: {
        accessToken: data.session?.access_token || '',
        expiresAt: data.session?.expires_at || 0
      }
    };
    
  } catch (err) {
    return {
      success: false,
      message: "Error crítico de comunicación con el servicio de autenticación.",
      error: err instanceof Error ? err.message : String(err)
    };
  }
}
```

---

## 8. Diseño de Tolerancia a Fallas en UI: Manejo de Errores de Red (RN-10 / RN-11)

Ian Sommerville postula en su capítulo sobre **Ingeniería de Confiabilidad y Seguridad** que siempre debemos diseñar el sistema asumiendo que ocurrirán fallas de hardware, software o red [41, 69, 71]. Ante situaciones imprevistas, el software debe degradarse de manera ordenada sin arruinar la experiencia de usuario [119, 164].

Para el MVP, las reglas **RN-10** (Carrito temporal en navegación) y **RN-11** (Sincronización en vivo con catálogo de la DB) requieren que se valide el carrito justo antes de transferir al usuario a WhatsApp para evitar vender productos eliminados o con precios desactualizados [218, 257, 260].

### 8.1. Escenario de Falla Crítica
Al pulsar "Enviar pedido por WhatsApp", el navegador del cliente inicia la llamada al Server Action `verifyCartBeforeCheckoutAction` para validar los IDs de productos. Sin embargo, en ese instante el usuario experimenta una **pérdida de conectividad móvil (error de red)** o la base de datos de Supabase experimenta un pico que produce un **timeout** [218].

### 8.2. Mapa del Algoritmo de Resiliencia y Control de UI

El sistema de presentación en el frontend (React/Next.js Client Component) implementará el siguiente árbol de decisiones y control de fallas lógicas:

```
          [Usuario] Pulsa el botón "Enviar pedido por WhatsApp" [213, 222]
                                      |
                                      v
                             Mostrar "Spinner"
                       Deshabilitar temporalmente UI
                                      |
         [Frontend] -> Invoca API /verifyCartBeforeCheckoutAction
                                      |
                      ¿Se recibió respuesta del Servidor?
                                /             \
                            (SÍ)               (NO - Error de Red / Timeout)
                             v                               v
                    ¿Hubo inconsistencias?           [Estrategia de Resiliencia]
                      /             \                1. Reintentar automáticamente 3 veces
                  (SÍ)               (NO)               (con retraso exponencial de backoff)
                   v                  v                              |
    1. Notificar en UI mediante   Abrir deep link                    v
       Toast/Modal interactivo.   de WhatsApp con            ¿Éxito en reintentos?
    2. Actualizar precios e       el pedido formateado.          /          \
       ítems eliminados de                                   (SÍ)           (NO)
       forma local [219].                                     v              v
    3. Retornar al paso de                               Proceder a   [Degradación de Servicio]
       re-confirmación [219].                            WhatsApp.    1. Detener el Spinner de carga.
                                                                      2. Mostrar Modal de Advertencia:
                                                                         "Sin Conexión Temporal"
                                                                      3. Ofrecer dos opciones al usuario:
                                                                         |
                                              +--------------------------+--------------------------+
                                              |                                                     |
                                              v                                                     v
                                    [ Opción A (Reintentar) ]                             [ Opción B (Forzar Envío) ]
                                    Reiniciar el proceso de                               Permitir bypass de validación,
                                    verificación en la DB.                                generar la URL de WhatsApp con el
                                                                                          estado del carrito local y advertir:
                                                                                          "El vendedor confirmará la validez
                                                                                          de tus artículos al iniciar el chat" [230, 233].
```

### 8.3. Especificación Visual del Modal de Error y Bypass

```
+-------------------------------------------------------------+
| ⚠️  Dificultades Técnicas Temporales                       |
+-------------------------------------------------------------+
| No pudimos verificar la disponibilidad de tus productos en  |
| tiempo real debido a un problema de conexión de red.        |
|                                                             |
| Para tu tranquilidad, tu carrito sigue intacto.             |
|                                                             |
| ¿Qué deseas hacer?                                          |
+-------------------------------------------------------------+
|                                                             |
|  [ 🔄 Reintentar Validación ]                               | <-- Acción Recomendada (Botón Principal)
|                                                             |
|  [ 📱 Enviar Pedido Igual ]                                 | <-- Bypass de Redundancia (Bajo riesgo para MVP)
|    Nota: El vendedor confirmará si los precios o el         |
|    inventario de los productos cambiaron.                   |
|                                                             |
+-------------------------------------------------------------+
```

## 9. Diseño de Interfaz de Usuario (UI Layouts y Flujo de Navegación)

De acuerdo con Sommerville, los bocetos de interfaces y los wireframes de papel o de baja fidelidad son métodos rápidos y económicos para refinar los requerimientos de interacción antes de comprometer esfuerzos de programación en frontend [20]. A continuación, se especifican los layouts lógicos estructurales optimizados para dispositivos móviles (mobile-first, dado que la redirección final es a WhatsApp de uso predominantemente móvil) [205, 235].

### 9.1. Vista 1: Catálogo Público de Productos (Página de Inicio)

Esta interfaz representa el portal público donde los usuarios finales descubren los productos [225, 227].

```
+---------------------------------------------------------+
| [=] NOMBRE DEL COMERCIO                     [🛒 Carrito] | <-- Barra Superior Flotante
+---------------------------------------------------------+
|                                                         |
|  🔍 Buscar productos por nombre o descripción...        | <-- Input de Búsqueda (RF-02)
|                                                         |
+---------------------------------------------------------+
|  Filtros Activos: [ Talle: L ✖ ] [ Borrar Todos ]       | <-- Pills de filtros aplicados
+---------------------------------------------------------+
|  ⚙️ Filtrar por: [ Categoría ▾ ] [ Talle ▾ ] [ Color ▾ ]  | <-- Selects de Filtros (RF-03)
|  ⇅ Ordenar:      [ Precio: Menor a Mayor ▾ ]             | <-- Select de Ordenamiento (RF-04)
+---------------------------------------------------------+
|                                                         |
|  +-----------------------+   +-----------------------+  |
|  | [ Imagen Producto A ] |   | [ Imagen Producto B ] |  | <-- Tarjeta de Producto responsiva
|  |                       |   |                       |  |     (Grilla de 2 columnas en mobile)
|  | **Remera Sport**      |   | **Jeans Slim**        |  |
|  | $12.500,00            |   | $24.000,00            |  | <-- Precio (opcional, RF-12)
|  | [ Ver Detalle ]       |   | [ Ver Detalle ]       |  |
|  | [➕ Agregar al Carro ] |   | [➕ Agregar al Carro ] |  | <-- Agregar al Carrito (RF-05)
|  +-----------------------+   +-----------------------+  |
|                                                         |
|                    [ Cargar más productos ]             | <-- Botón Carga Incremental (RF-01)
|                                                         |
+---------------------------------------------------------+
|           💬 ¿Dudas? [ Contactar al Vendedor ]           | <-- Botón de Contacto Directo (RF-21)
+---------------------------------------------------------+
```

### 9.2. Vista 2: Carrito de Compras (Modal / Side Drawer)

Esta pantalla interactiva detalla los productos preseleccionados antes de formalizar el envío al vendedor [236].

```
+---------------------------------------------------------+
| [⬅ Volver al Catálogo]                 CARRITO DE COMPRAS|
+---------------------------------------------------------+
|                                                         |
|  1. Remera Sport (Talle: L, Color: Azul)                | <-- Nombre con Filtros seleccionados
|     $12.500,00 c/u                                      |
|     [ ➖ ]  2  [ ➕ ]  |  Subtotal: $25.000,00    [🗑️]   | <-- Control de Cantidades (RF-06, RF-08)
|                                                         |
|  2. Jeans Slim (Talle: 42, Color: Negro)                 |
|     $24.000,00 c/u                                      |
|     [ ➖ ]  1  [ ➕ ]  |  Subtotal: $24.000,00    [🗑️]   |
|                                                         |
+---------------------------------------------------------+
|  Resumen del Pedido:                                    |
|  - Cantidad de artículos: 3                             |
|  - Costo de envío: "A coordinar con el vendedor"        | <-- Fuera de sistema para MVP (RF-22)
|                                                         |
|  TOTAL VIGENTE: $49.000,00                              | <-- Cálculo en tiempo real (RF-10)
+---------------------------------------------------------+
|                                                         |
|     🟢 [ ENVIAR PEDIDO POR WHATSAPP ]                    | <-- Acción Principal (RF-11)
|                                                         |
|   * Nota: Al presionar se abrirá la aplicación de       |
|     WhatsApp en su dispositivo con el mensaje listo.    |
+---------------------------------------------------------+
```

### 9.3. Vista 3: Consola de Administración (Ruta Protegida `/admin`)

Consola exclusiva y autenticada para el único administrador del MVP [228, 236].

```
+---------------------------------------------------------+
| [⚙️ Admin] CATALOGO DE PRODUCTOS          [🔓 Cerrar Sesión] |
+---------------------------------------------------------+
| [ Productos ]  |  [ Filtros y Valores ]                 | <-- Navegación de secciones
+---------------------------------------------------------+
|                                                         |
|  🔍 Buscar en inventario...        [➕ Crear Nuevo Producto] | <-- Acción CRUD
|                                                         |
+---------------------------------------------------------+
|  Listado de Productos en Catálogo:                      |
|                                                         |
|  [Foto]  **Remera Sport**  |  $12.500,00  |  Filtros: 2 |
|          Categoría: Indumentaria | Talle: L             |
|          [📝 Editar]  [🗑️ Eliminar Producto]             | <-- Acciones de gestión (RF-16)
|                                                         |
|  [Foto]  **Jeans Slim**    |  $24.000,00  |  Filtros: 2 |
|          Categoría: Indumentaria | Talle: 42            |
|          [📝 Editar]  [🗑️ Eliminar Producto]             |
|                                                         |
+---------------------------------------------------------+
```

### 9.4. Mapa de Flujo de Navegación del Usuario (Story Map)

El siguiente flujo lineal modela el recorrido óptimo del usuario desde el ingreso hasta la conversión final [234]:

```
+------------------+         +----------------------+         +---------------------+
| 1. HOME CATALOGO |-------->| 2. FILTRAR / BUSCAR  |-------->| 3. VER DETALLE PROD |
| - Carga inicial  |         | - Selección de pills |         | - Galería de fotos  |
| - Ver productos  |         | - Texto en input     |         | - Atributos técnicos|
+------------------+         +----------------------+         +---------------------+
         |                              |                                |
         | (Acción: Agregar)            | (Acción: Agregar)              | (Acción: Agregar)
         v                              v                                v
+-----------------------------------------------------------------------------------+
| 4. ESTADO DE CARRITO (En Memoria Volátil)                                         |
| - Sumatoria incremental / decremental de cantidades                               |
| - Validación automática de precios y existencia física                            |
+-----------------------------------------------------------------------------------+
         |
         | (Acción: Enviar pedido por WhatsApp)
         v
+-----------------------------------------------------------------------------------+
| 5. DEEP LINK WHATSAPP (wa.me/number?text=...)                                     |
| - Cierre funcional del sistema web.                                               |
| - Inicio de canal de atención, entrega y pago analógico humano (Conversión final) |
+-----------------------------------------------------------------------------------+
```

---

## 10. Estrategia de Verificación y Validación (V&V / Plan de Pruebas)

Ian Sommerville define que los procesos de Verificación y Validación persiguen objetivos complementarios [91, 222]:
*   **Verificación:** Asegurar que estamos construyendo el software correctamente de acuerdo con la especificación técnica ("*Are we building the product right?*") [91, 222].
*   **Validación:** Garantizar que el sistema cumpla con las verdaderas expectativas y requerimientos operativos del cliente ("*Are we building the right product?*") [91, 222].

Este plan estructura tanto las técnicas estáticas (inspección de código) como las dinámicas (pruebas de caja negra y unitarias) para el MVP [92, 104].

### 10.1. Pruebas de Desarrollo (Verificación de Software) [94]

Se ejecutarán de manera automatizada utilizando marcos modernos compatibles con Next.js (Vitest / Jest) y librerías de prueba de Base de Datos para Supabase.

#### A. Pruebas Unitarias de Lógica de Negocio (Unit Testing) [94]

1.  **Verificación del Formateador de Pedidos a WhatsApp:**
    *   *Objetivo:* Probar que la función puramente lógica `formatWhatsAppMessage` reciba un arreglo de items, calcule el total correcto y retorne una cadena con codificación de porcentaje (`URIencode`) perfectamente legible para la API de WhatsApp [232, 238].
    *   *Caso de Prueba UT-01:*
        *   *Entrada:*
            ```json
            [
              { "nombre": "Remera Sport", "precio": 10000, "cantidad": 2, "atributos": ["Talle: L", "Color: Azul"] },
              { "nombre": "Medias Tenis", "precio": 2500, "cantidad": 1, "atributos": [] }
            ]
            ```
        *   *Resultado Esperado:* Un string de URL formateado como:
            `https://wa.me/5491122334455?text=Hola%2C%20quiero%20hacer%20el%20siguiente%20pedido%3A%0A%0A-%202x%20Remera%20Sport%20%28Talle%3A%20L%2C%20Color%3A%20Azul%29%20-%20%2410.000%2C00%20c%2Fu%0A-%201x%20Medias%20Tenis%20-%20%242.500%2C00%20c%2Fu%0A%0A*TOTAL%3A%20%2422.500%2C00*`

2.  **Verificación del Estado React del Carrito (Suma Lógica):**
    *   *Objetivo:* Asegurar que la lógica en memoria del carrito compute adecuadamente las mutaciones de cantidad y maneje el tipo de dato decimal (`NUMERIC`) de los precios sin pérdida de centavos [236].
    *   *Caso de Prueba UT-02:*
        *   *Acción:* Agregar item de $10.000,00, incrementar a cantidad 3, decrementar a 2.
        *   *Resultado Esperado:* Total final exactamente igual a $20.000,00.

#### B. Pruebas de Integración y Reglas de Negocio en Vivo [94, 100]

1.  **Regla de Coexistencia de Cambios en Vivo (Regla `RN-10` / `RN-11`):**
    *   *Objetivo:* Validar la resiliencia del sistema cuando el administrador elimina un producto o cambia un precio mientras un usuario lo posee en su carrito temporal en el navegador [233].
    *   *Caso de Prueba IT-01 (Eliminación en Caliente):*
        1. El usuario tiene el producto "Jeans Slim" en el carrito local.
        2. El administrador elimina permanentemente "Jeans Slim" de la base de datos Supabase [233].
        3. El usuario pulsa "Enviar pedido por WhatsApp" [232].
        4. El Server Action de Next.js verifica la existencia actual del ID del producto en la DB antes de enviar.
        5. *Resultado Esperado:* El sistema detecta la eliminación física, limpia "Jeans Slim" del carrito del usuario silenciosamente, recalcula el total y notifica al usuario en la UI antes de abrir el enlace de WhatsApp para proteger la consistencia de la venta [232, 233].

2.  **Verificación de la Seguridad Perimetral de Datos (Políticas RLS de Supabase):**
    *   *Objetivo:* Asegurar que un atacante inteligente no pueda enviar peticiones directas de escritura a la base de datos a través de la API REST expuesta de Supabase sin token autenticado [145].
    *   *Caso de Prueba IT-02 (Ataque de Inyección de Producto):*
        *   *Acción:* Enviar un comando `POST` HTTP crudo a `https://<project>.supabase.co/rest/v1/productos` usando una llave pública anónima de cliente (`anon_key`) intentando registrar un producto falso.
        *   *Resultado Esperado:* Supabase retorna código de estado HTTP `401 Unauthorized` o `403 Forbidden` gracias a las políticas Row Level Security (RLS) activadas en la tabla.

### 10.2. Pruebas de Aceptación (Validación de Software con el Cliente) [94, 110]

Diseñadas como pruebas funcionales de caja negra basadas en escenarios de negocio del mundo real para garantizar la viabilidad comercial del MVP [104].

#### Escenario de Validación AV-01: El Recorrido de Descubrimiento y Compra del Comprador

*   **Descripción:** Simular paso a paso la navegación de un usuario final con baja alfabetización digital para asegurar que los elementos UI guíen la compra intuitivamente [234].
*   **Pasos a Ejecutar:**
    1. El usuario accede a la URL pública del catálogo móvil.
    2. Utiliza el filtro "Talle -> L" y escribe "Remera" en el buscador [231].
    3. Verifica que la grilla filtre y muestre exclusivamente los resultados correctos.
    4. Pulsa "➕ Agregar" en dos productos distintos.
    5. Abre el carrito flotante, incrementa la cantidad del primer producto, y observa que el total se actualice en tiempo real [236].
    6. Pulsa "Enviar pedido por WhatsApp" [230].
    7. *Condición de Éxito:* Se abre inmediatamente WhatsApp en primer plano con el chat del vendedor iniciado y el pedido redactado detallando de forma clara los artículos, talles, precios vigentes y sumatoria total sin intervención del usuario [230, 238].

#### Escenario de Validación AV-02: Integridad del Negocio del Administrador

*   **Descripción:** Validar que el administrador único no pueda violar de forma accidental o intencional las restricciones estructurales del catálogo de productos [228, 237].
*   **Pasos a Ejecutar:**
    1. El administrador inicia sesión en `/admin` con credenciales válidas.
    2. Intenta guardar un producto con descripción y precio en blanco [237].
       * *Resultado Esperado:* Éxito. El MVP lo permite (el precio nulo indica "A consultar" en la UI) [235, 237].
    3. Intenta guardar un producto con nombre vacío.
       * *Resultado Esperado:* Fallo. La UI de Next.js bloquea la acción y señala el campo obligatorio en color rojo [237].
    4. Intenta guardar un producto sin subir ninguna imagen.
       * *Resultado Esperado:* Fallo. El Server Action intercepta la petición y arroja un error controlado indicando que se requiere un mínimo de una fotografía para publicar el producto en el catálogo público [237].

---

## 11. Configuración de Entornos y Despliegue (CI/CD)

Siguiendo el enfoque de Sommerville sobre **Administración de la Configuración**, es indispensable controlar las versiones y los entornos donde se construye, prueba y despliega el código fuente para mitigar errores humanos y asegurar lanzamientos fiables [81].

### 11.1. Arquitectura de Entornos Separados

Para proteger la integridad de los datos reales del negocio, se prohibirá terminantemente realizar pruebas de código directamente sobre la infraestructura de producción. Se mantendrán dos entornos independientes aislados:

```
+------------------------------------+       +------------------------------------+
| 1. ENTORNO DE DESARROLLO (Dev/Local) |       | 2. ENTORNO DE PRODUCCIÓN (Prod)    |
|                                    |       |                                    |
| - Frontend: localhost:3000         |       | - Frontend: catalogo.vercel.app    |
| - Backend: Supabase Local CLI      |       | - Backend: Supabase Cloud Instance |
|   (PostgreSQL Dockerizado)         |       |   (Base de datos real)             |
| - Fotos: Almacenamiento local      |       | - Fotos: Cloud Storage Bucket      |
+------------------------------------+       +------------------------------------+
```

*   **Ventaja del entorno local en Supabase:** El uso de Supabase CLI permite ejecutar migraciones de base de datos a nivel local (`supabase migration new` y `supabase db reset`) para probar cambios destructivos en el esquema de tablas antes de desplegarlos de forma irreversible en producción.

### 11.2. Ciclo Automatizado de Integración y Despliegue Continuo (CI/CD)

El ciclo de desarrollo utiliza **Git** (alojado en GitHub) como el hub de control de versiones unificado, integrado con automatizaciones en la nube [81]:

```
                     Pull Request           Merge to 'main'
[Desarrollo Local] --------------> [GitHub] --------------> [Vercel Prod]
                                      |                         |
                                      v (GitHub Actions)        v (Automated Deployment)
                               +--------------+          +-------------------------+
                               | Pipeline CI  |          | Pipeline CD             |
                               | - Linter     |          | - Build estático de JS  |
                               | - Pruebas UT |          | - Despliegue atómico     |
                               +--------------+          +-------------------------+
```

#### Paso 1: Integración Continua (GitHub Actions - Pipeline de Compilación y Calidad)
Cada vez que el programador abre un *Pull Request* o envía código a la rama principal, se gatilla un flujo de trabajo automatizado en los servidores de GitHub:
1.  **Aislamiento:** Se levanta una máquina virtual temporal con Node.js v20.
2.  **Instalación:** Se clona el proyecto y se instalan las dependencias limpias (`npm ci`).
3.  **Auditoría Estática:** Se corre el linter (`npm run lint`) para garantizar la homogeneidad sintáctica y calidad estilística del código.
4.  **Ejecución de Pruebas:** Se corren las pruebas unitarias y de integración lógicas (`npm run test`) [80].
5.  **Verificación de Compilación:** Se ejecuta `npm run build` para garantizar que la compilación de Next.js complete exitosamente sin fallos de TypeScript o rutas mal resueltas.
6.  *Control de Calidad:* Si alguna prueba o verificación falla, el merge se bloquea automáticamente en la consola de GitHub, protegiendo la rama de producción contra regresiones no deseadas.

#### Paso 2: Despliegue Continuo (Vercel CD)
Una vez que el código pasa exitosamente el Pipeline de CI y se aprueba el merge en la rama `main`:
1.  **Despliegue Atómico de Next.js (Vercel):** Vercel detecta la actualización en GitHub, compila de forma aislada la aplicación de Next.js y actualiza el enrutado de producción instantáneamente.
2.  **Migración de Base de Datos (Supabase):** Los cambios aprobados en las tablas relacionales y políticas RLS se propagan a la base de datos de producción mediante un comando de migración automatizado que ejecuta las sentencias SQL estrictas diseñadas previamente, sin intervención manual de bases de datos desde consolas visuales.

---
