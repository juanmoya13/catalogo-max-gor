# Canvas — Implementación del MVP Catálogo

## Mapa general

| Incremento | Nombre                  | Resultado esperado                                                                |
| ---------- | ----------------------- | --------------------------------------------------------------------------------- |
| **1**      | 🏗️ Fundación           | Aplicación técnicamente preparada, base de datos, Storage y seguridad funcionando |
| **2**      | ⚙️ Backoffice           | Administrador capaz de gestionar filtros, productos y fotografías                 |
| **3**      | 🛍️ Catálogo público    | Usuario capaz de descubrir, buscar, filtrar y consultar productos                 |
| **4**      | 🛒 Compra y WhatsApp    | Usuario capaz de armar un carrito consistente y enviar el pedido                  |
| **5**      | 🚀 Calidad y Producción | MVP validado, seguro, automatizado y desplegado                                   |

---

# INCREMENTO 1 — 🏗️ FUNDACIÓN

### Objetivo

Construir la infraestructura técnica sobre la cual se desarrollarán todas las funcionalidades posteriores.

Al finalizar este incremento debe existir una aplicación Next.js conectada a Supabase, con el modelo de datos del catálogo, almacenamiento de imágenes, autenticación administrativa, RLS y entorno de desarrollo controlado.

La arquitectura definida utiliza **Next.js como capa de presentación/lógica y Supabase como repositorio central PostgreSQL + Storage**, con Middleware para proteger `/admin/*`. 

### Requerimientos técnicos

* Crear proyecto Next.js con App Router y TypeScript.
* Configurar Supabase.
* Configurar entorno local de desarrollo.
* Configurar variables de entorno.
* Configurar repositorio Git.
* Crear migraciones PostgreSQL.
* Crear tablas:

  * `productos`
  * `fotografias`
  * `filtros`
  * `valores_filtros`
  * `producto_valores_filtros`
* Configurar claves primarias y foráneas.
* Configurar `ON DELETE CASCADE` donde corresponde.
* Garantizar unicidad de valores dentro de cada filtro.
* Garantizar mediante PK `(producto_id, filtro_id)` que un producto tenga como máximo un valor por filtro. 
* Crear bucket `product-images`.
* Configurar Supabase Auth.
* Implementar Middleware para `/admin/*`.
* Configurar políticas RLS.
* Separar entorno de desarrollo/prueba de producción.
* Preparar estructura inicial para testing.

### Requerimientos funcionales

En este incremento todavía no se busca entregar una funcionalidad comercial completa.

Debe quedar establecida la infraestructura necesaria para soportar:

* Un único administrador autenticado.
* Catálogo público de productos.
* Fotografías asociadas a productos.
* Filtros configurables.
* Valores de filtros.
* Asociaciones producto/filtro.
* Acceso público de lectura.
* Acceso administrativo de escritura.

El análisis establece que el MVP tendrá un único administrador y que no habrá registro de administradores desde la aplicación. 

### Definition of Done

* [ ] La aplicación Next.js inicia correctamente en desarrollo.
* [ ] TypeScript compila sin errores.
* [ ] Supabase local está operativo.
* [ ] Las cinco tablas están creadas mediante migraciones.
* [ ] Las relaciones y constraints funcionan.
* [ ] Se verifica la restricción de un valor por filtro.
* [ ] Las eliminaciones en cascada funcionan correctamente.
* [ ] El bucket de fotografías existe.
* [ ] Supabase Auth está configurado.
* [ ] `/admin/*` está protegido.
* [ ] Un usuario anónimo puede consultar datos públicos.
* [ ] Un usuario no autenticado no puede realizar operaciones administrativas.
* [ ] RLS impide escrituras no autorizadas.
* [ ] El proyecto puede ejecutarse desde un entorno limpio siguiendo las instrucciones del proyecto.
* [ ] El build de Next.js finaliza correctamente.

**Salida del incremento:**

> Una **base técnica segura y funcional**, todavía sin necesidad de tener terminada la UI comercial.

---

# INCREMENTO 2 — ⚙️ BACKOFFICE

### Objetivo

Permitir que el administrador mantenga completamente el catálogo sin modificar manualmente la base de datos ni el código.

Al terminar este incremento, el administrador podrá crear, modificar y eliminar productos, fotografías, filtros y valores.

Esto cubre la totalidad del núcleo administrativo definido en RF-01 a RF-08. 

### Requerimientos técnicos

#### Autenticación

* `loginAction`.
* Manejo de sesión.
* Cookies de sesión.
* Middleware.
* Logout.
* Redirección a `/login` cuando corresponda.

El diseño plantea la autenticación mediante Supabase Auth y la utilización de la sesión por parte del Middleware. 

#### Filtros

Implementar:

* `createFilterAction`
* `updateFilterAction`
* `deleteFilterAction`

con operaciones transaccionales para filtro y valores. 

#### Productos

Implementar:

* `createProductAction`
* `updateProductAction`
* `deleteProductAction`

#### Fotografías

* Upload.
* Asociación a producto.
* Reemplazo.
* Eliminación.
* Limpieza de archivos físicos cuando corresponda.

La creación debe impedir productos sin fotografías. 

#### Seguridad

Todas las acciones administrativas deben validar sesión antes de modificar datos.

### Requerimientos funcionales

El administrador debe poder:

* iniciar sesión;
* crear productos;
* modificar productos;
* eliminar productos;
* cargar múltiples fotografías;
* reemplazar fotografías;
* eliminar fotografías;
* crear filtros;
* modificar filtros;
* eliminar filtros;
* agregar valores de filtros;
* eliminar valores;
* asociar como máximo un valor de cada filtro a un producto.

Reglas importantes:

**Producto**

* nombre obligatorio;
* mínimo una fotografía;
* descripción opcional;
* precio opcional;
* filtros opcionales. 

**Filtro eliminado**

* desaparece del catálogo;
* sus asociaciones desaparecen;
* los productos permanecen.

**Producto eliminado**

* desaparece del catálogo;
* desaparece de búsquedas;
* desaparece de filtros;
* no puede agregarse al carrito;
* debe eliminarse de carritos existentes. 

### Definition of Done

* [ ] Login administrativo funcionando.
* [ ] Rutas `/admin/*` protegidas.
* [ ] CRUD de filtros terminado.
* [ ] CRUD de valores terminado.
* [ ] CRUD de productos terminado.
* [ ] Upload de fotografías funcionando.
* [ ] Edición de fotografías funcionando.
* [ ] Eliminación de fotografías funcionando.
* [ ] No se puede guardar producto sin nombre.
* [ ] No se puede publicar producto sin fotografía.
* [ ] Se permite producto sin precio.
* [ ] Se pueden asociar filtros opcionalmente.
* [ ] La BD rechaza más de un valor del mismo filtro por producto.
* [ ] Eliminar un filtro no elimina productos.
* [ ] Eliminar un producto elimina sus relaciones.
* [ ] Se limpian archivos físicos asociados cuando corresponde.
* [ ] Un usuario anónimo no puede ejecutar operaciones administrativas.
* [ ] Se dispone de pruebas para las reglas críticas.

**Salida del incremento:**

> El **catálogo puede ser administrado completamente** sin intervención manual sobre Supabase.

---

# INCREMENTO 3 — 🛍️ CATÁLOGO PÚBLICO

### Objetivo

Construir la experiencia pública mediante la cual un usuario puede descubrir productos, buscar, filtrar, ordenar y consultar su información.

Debe ser **mobile-first**, dado que el flujo termina principalmente en WhatsApp. El diseño plantea además SSR para la carga inicial del catálogo. 

### Requerimientos técnicos

* Catálogo público sin autenticación.
* SSR/Server Components donde corresponda.
* Server Action/interfaz de consulta de productos.
* Carga incremental.
* Búsqueda textual.
* Filtrado.
* Ordenamiento.
* Consulta de detalle.
* Galería de fotografías.
* Manejo de productos sin precio.
* Queries optimizadas para PostgreSQL.
* Parámetro `sortBy`.
* `NULLS LAST` en ordenamiento por precio. 

La interfaz prevista utiliza una carga incremental en lugar de paginación tradicional. 

### Requerimientos funcionales

El usuario debe poder:

#### Catálogo

* acceder sin autenticarse;
* visualizar productos;
* recibir inicialmente una cantidad limitada;
* cargar automáticamente más productos al acercarse al final de la grilla mediante scroll infinito.

#### Búsqueda

Buscar por:

* nombre;
* descripción.

No se incorporará búsqueda semántica ni IA. 

#### Filtros

Aplicar filtros configurados por el administrador.

Ejemplo:

```text
Búsqueda: remera
Categoría: Remeras
Color: Negro
Talle: M
```

Los resultados deben respetar las condiciones seleccionadas. 

#### Ordenamiento

* Más recientes.
* Nombre A-Z.
* Precio menor a mayor.
* Precio mayor a menor.

Los productos sin precio deben quedar correctamente ubicados según la estrategia definida en diseño.

#### Detalle

Mostrar:

* nombre;
* descripción si existe;
* precio si existe;
* filtros asociados;
* todas las fotografías disponibles. 

### Definition of Done

* [ ] Catálogo accesible sin login.
* [ ] Productos reales provenientes de Supabase.
* [ ] Carga inicial limitada.
* [ ] "Cargar más" funciona.
* [ ] No existe paginación tradicional.
* [ ] Búsqueda por nombre funciona.
* [ ] Búsqueda por descripción funciona.
* [ ] Búsqueda + filtros funciona conjuntamente.
* [ ] Filtros dinámicos provienen de la configuración administrativa.
* [ ] Se puede ordenar por las cuatro opciones.
* [ ] `NULLS LAST` funciona en ordenamientos por precio.
* [ ] Producto sin precio se muestra correctamente.
* [ ] Detalle funciona.
* [ ] Todas las fotografías son visibles.
* [ ] UI responsive/mobile-first.
* [ ] Productos eliminados dejan de aparecer.
* [ ] Cambios administrativos se reflejan en el catálogo.
* [ ] El catálogo funciona con datos reales, no mocks.

**Salida del incremento:**

> Existe un **catálogo público completo**, pero todavía sin cerrar el proceso de compra.

---

# INCREMENTO 4 — 🛒 COMPRA Y WHATSAPP

### Objetivo

Completar el recorrido comercial del usuario:

> **Descubrir → seleccionar → revisar → validar → enviar pedido por WhatsApp.**

El carrito será temporal y permanecerá únicamente durante la navegación actual. No se persistirá en base de datos ni en `localStorage`. 

### Requerimientos técnicos

#### Estado del carrito

Implementar React Context o Zustand.

El diseño propone una estructura `CartItem` con:

* producto;
* imagen;
* precio;
* filtros seleccionados;
* cantidad. 

Operaciones:

* `addItem`
* `removeItem`
* `updateQuantity`
* `clearCart`

#### Identidad del ítem

Un mismo producto con diferentes combinaciones de filtros debe tratarse como ítems independientes.

Ejemplo:

```text
Remera + Talle M
Remera + Talle L
```

son dos líneas diferentes. 

#### Validación previa

Antes de enviar:

* verificar existencia;
* verificar información vigente;
* actualizar precios;
* eliminar productos inexistentes;
* mantener el resto del carrito.

#### WhatsApp

Implementar generador del mensaje y deep link:

```text
wa.me/<numero>?text=<mensaje>
```

El diseño establece que esta integración no necesita persistencia en DB. 

### Requerimientos funcionales

El usuario debe poder:

* agregar productos;
* volver a agregar un producto e incrementar cantidad;
* modificar cantidad;
* eliminar productos;
* visualizar subtotales;
* visualizar total;
* mantener carrito durante la navegación;
* agregar productos sin precio;
* ver productos sin precio sin sumarlos al total;
* recibir precios vigentes;
* perder automáticamente del carrito productos eliminados;
* enviar el pedido por WhatsApp;
* contactar al vendedor directamente.

Reglas:

```text
Precio NULL
→ se muestra
→ puede agregarse
→ no suma al total
→ sí aparece en WhatsApp
```



Si el administrador modifica el precio:

```text
precio anterior
      ↓
nuevo precio
      ↓
carrito utiliza nuevo precio
```

sin necesidad de mostrar explícitamente el cambio al usuario. 

### Resiliencia

Si falla la validación por problemas de red:

* detener spinner;
* mantener carrito intacto;
* permitir reintento;
* informar temporalmente al usuario;
* ofrecer el comportamiento alternativo definido en diseño.

El diseño contempla hasta tres reintentos automáticos con backoff y un flujo de degradación controlada. 

### Definition of Done

* [ ] Carrito funciona completamente en memoria.
* [ ] Agregar producto funciona.
* [ ] Agregar nuevamente incrementa cantidad.
* [ ] Combinaciones diferentes de filtros generan líneas independientes.
* [ ] Cantidades inválidas son rechazadas.
* [ ] Eliminar producto funciona.
* [ ] Total se recalcula correctamente.
* [ ] Productos sin precio no suman.
* [ ] Productos sin precio aparecen en WhatsApp.
* [ ] Cambios de precio se reflejan.
* [ ] Productos eliminados desaparecen del carrito.
* [ ] Un producto eliminado no puede enviarse.
* [ ] Existe validación previa al checkout.
* [ ] Fallos de red tienen manejo definido.
* [ ] El mensaje de WhatsApp contiene productos, cantidades, filtros y precios vigentes.
* [ ] Total enviado es correcto.
* [ ] Se abre WhatsApp correctamente.
* [ ] Contacto directo funciona sin carrito.
* [ ] El carrito no se persiste después de abandonar la navegación.

**Salida del incremento:**

> El MVP ya tiene un **flujo comercial de extremo a extremo**.

---

# INCREMENTO 5 — 🚀 CALIDAD Y PRODUCCIÓN

### Objetivo

Convertir la aplicación funcional en un MVP **validado, seguro, reproducible y desplegable en producción**.

Este incremento no agrega nuevas funcionalidades de negocio; busca garantizar que los cuatro incrementos anteriores sean confiables.

El diseño establece una estrategia V&V con pruebas unitarias, integración y aceptación. 

### Requerimientos técnicos

#### Testing

Implementar pruebas:

* unitarias;
* integración;
* reglas de negocio;
* aceptación.

Cubrir especialmente:

* carrito;
* cálculo de totales;
* productos sin precio;
* generador de WhatsApp;
* filtros;
* cascadas;
* autenticación;
* RLS;
* cambios de productos mientras están en carrito.

#### Seguridad

Validar:

* Middleware;
* Supabase Auth;
* RLS;
* permisos anónimos;
* permisos autenticados;
* Server Actions.

Debe comprobarse específicamente que un usuario con clave pública/anónima no pueda insertar productos directamente mediante la API de Supabase. 

#### CI/CD

Pipeline:

```text
Pull Request
    ↓
npm ci
    ↓
lint
    ↓
test
    ↓
build
    ↓
merge
    ↓
Vercel
```

El diseño propone precisamente este flujo automatizado y bloqueo del merge cuando fallan las verificaciones. 

#### Producción

* Vercel.
* Supabase producción.
* Migraciones.
* Variables de entorno.
* Smoke tests.
* Verificación final del flujo comercial.

### Requerimientos funcionales

El sistema en producción debe permitir completar exitosamente:

```text
Administrador
    ↓
Login
    ↓
Crear filtros
    ↓
Crear producto
    ↓
Subir fotos
    ↓
Publicación
    ↓
Usuario
    ↓
Buscar
    ↓
Filtrar
    ↓
Ver detalle
    ↓
Agregar al carrito
    ↓
Modificar cantidad
    ↓
Enviar por WhatsApp
```

Además debe superar los escenarios de aceptación definidos.

El documento plantea, por ejemplo, un escenario donde el usuario busca "Remera", aplica `Talle → L`, agrega productos, modifica cantidades y finalmente abre WhatsApp con el pedido correctamente formado. 

### Definition of Done

* [ ] Suite de tests automatizados ejecutándose.
* [ ] Tests unitarios críticos OK.
* [ ] Tests de integración OK.
* [ ] Tests de reglas de negocio OK.
* [ ] Tests de RLS OK.
* [ ] Test de producto eliminado mientras está en carrito OK.
* [ ] Test de modificación de precio mientras está en carrito OK.
* [ ] Test de productos sin precio OK.
* [ ] Test del generador de WhatsApp OK.
* [ ] Test de autenticación OK.
* [ ] Test de acceso no autorizado OK.
* [ ] CI ejecuta lint.
* [ ] CI ejecuta tests.
* [ ] CI ejecuta build.
* [ ] Merge bloqueado si falla CI.
* [ ] Deploy a producción funcionando.
* [ ] Migraciones aplicadas correctamente.
* [ ] Variables de entorno configuradas.
* [ ] Smoke test de producción OK.
* [ ] Flujo completo comprador → WhatsApp OK.
* [ ] Flujo completo administrador → catálogo OK.
* [ ] Validación final del MVP realizada.
* [ ] Eliminacion de los archivos que se realizaron para pruebas y que no afectan a la funcionalidad de la app.

**Salida del incremento:**

> MVP **listo para ser utilizado en producción**.

---

# Vista final del Canvas

```text
┌──────────────────────────────────────────────────────────────────────┐
│                    MVP — CATÁLOGO                                    │
└──────────────────────────────────────────────────────────────────────┘

       INCREMENTO 1
       FUNDACIÓN
            │
            ▼
    ┌─────────────────┐
    │ Next.js         │
    │ Supabase        │
    │ PostgreSQL      │
    │ Storage         │
    │ RLS             │
    │ Auth            │
    └────────┬────────┘
             │
             ▼
       INCREMENTO 2
       BACKOFFICE
            │
            ▼
    ┌─────────────────┐
    │ Filtros         │
    │ Productos       │
    │ Fotografías     │
    │ Administración  │
    └────────┬────────┘
             │
             ▼
       INCREMENTO 3
       CATÁLOGO
            │
            ▼
    ┌─────────────────┐
    │ Listado         │
    │ Detalle         │
    │ Búsqueda        │
    │ Filtros         │
    │ Ordenamiento    │
    │ Cargar más      │
    └────────┬────────┘
             │
             ▼
       INCREMENTO 4
       COMPRA
            │
            ▼
    ┌─────────────────┐
    │ Carrito         │
    │ Precios         │
    │ Validación      │
    │ Resiliencia     │
    │ WhatsApp        │
    └────────┬────────┘
             │
             ▼
       INCREMENTO 5
       PRODUCCIÓN
            │
            ▼
    ┌─────────────────┐
    │ Unit Tests      │
    │ Integration     │
    │ Acceptance      │
    │ Security / RLS  │
    │ CI/CD           │
    │ Vercel          │
    └─────────────────┘
```

## Criterio rector del Canvas

La dependencia fundamental que queda establecida es:

**Datos → Administración → Catálogo → Carrito → Conversión → Producción**

Esto evita desarrollar funcionalidades sobre datos ficticios y, al mismo tiempo, permite que cada incremento termine con un **resultado verificable y utilizable**.

También mantiene el alcance estrictamente dentro del MVP: quedan fuera usuarios finales autenticados, pedidos internos, pagos, stock, descuentos, promociones, múltiples administradores, variantes, favoritos, recomendaciones, IA y demás funcionalidades que el análisis excluye explícitamente. 

