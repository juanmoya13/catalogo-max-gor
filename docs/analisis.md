# Documento de Análisis Funcional — MVP Catálogo de Productos

**Versión:** 1.0  
**Fecha:** 10 de agosto de 2026  
**Estado:** Análisis funcional — MVP

---

# 1. Introducción

El presente documento define el alcance funcional del MVP de un sistema de catálogo de productos orientado a la consulta de productos y generación de pedidos mediante WhatsApp.

El sistema tendrá dos tipos de usuarios:

- **Administrador:** responsable de gestionar los productos y los filtros del catálogo.
- **Usuario final:** persona que consulta el catálogo, busca productos, utiliza filtros, arma un carrito y envía el pedido mediante WhatsApp.

El sistema será público para los usuarios finales y **solamente requerirá autenticación para el administrador**.

El pago, la coordinación del envío y la atención posterior al pedido serán gestionados fuera del sistema, principalmente mediante WhatsApp.

El objetivo de esta definición es mantener el proyecto deliberadamente acotado para un MVP, evitando incorporar funcionalidades que no sean necesarias para validar el funcionamiento principal del catálogo.

---

# 2. Objetivo del sistema

El objetivo principal es proporcionar un catálogo público que permita:

1. Mostrar productos disponibles.
2. Permitir la búsqueda de productos.
3. Permitir filtrar y ordenar los productos.
4. Permitir consultar el detalle de un producto y sus imágenes.
5. Permitir agregar productos a un carrito.
6. Permitir modificar las cantidades del carrito.
7. Calcular el total del carrito considerando los precios vigentes.
8. Generar un pedido mediante un mensaje prearmado.
9. Enviar dicho pedido a un número de WhatsApp predefinido.
10. Permitir al administrador gestionar productos y filtros.

El sistema **no será responsable de gestionar el pago ni de administrar internamente los pedidos**.

---

# 3. Alcance del MVP

## 3.1. Funcionalidades incluidas

### Catálogo público

- Visualización pública de productos.
- Visualización de productos en cantidades limitadas inicialmente.
- Carga incremental mediante un botón "Cargar más".
- Búsqueda por texto.
- Filtrado por filtros configurados por el administrador.
- Combinación de búsqueda y filtros.
- Ordenamiento de resultados.
- Visualización del detalle de un producto.
- Visualización de todas las fotografías asociadas al producto.

### Carrito

- Agregar productos.
- Agregar nuevamente un producto incrementando su cantidad.
- Modificar cantidades.
- Eliminar productos.
- Visualizar el total.
- Mantener el carrito solamente durante la navegación actual.
- Eliminar del carrito productos que hayan sido eliminados del catálogo.
- Actualizar automáticamente el precio de un producto si el administrador modifica su precio.

### WhatsApp

- Envío del pedido a un único número de WhatsApp predefinido.
- Generación automática de un mensaje con el contenido del carrito.
- Apertura de WhatsApp para continuar la conversación.
- Posibilidad de contactar al administrador sin necesidad de crear un pedido.

### Administración

- Inicio de sesión del administrador.
- Alta de productos.
- Modificación de productos.
- Eliminación permanente de productos.
- Carga de una o varias fotografías.
- Modificación y eliminación de fotografías.
- Creación de filtros.
- Modificación de filtros.
- Eliminación de filtros.
- Asociación de un valor de filtro a cada producto.

---

# 4. Fuera de alcance del MVP

Las siguientes funcionalidades quedan explícitamente fuera del alcance inicial:

- Registro de usuarios finales.
- Inicio de sesión para usuarios finales.
- Perfiles de usuarios.
- Historial de pedidos.
- Gestión de pedidos dentro del sistema.
- Estados de pedidos.
- Gestión de pagos.
- Integración con plataformas de pago.
- Gestión del costo de envío.
- Gestión de stock.
- Código SKU.
- Descuentos.
- Promociones.
- Precios especiales.
- Múltiples administradores.
- Roles y permisos administrativos.
- Recuperación de contraseña.
- Cambio de contraseña desde la aplicación.
- Notificaciones internas de pedidos.
- Sistema de mensajería propio.
- Gestión de clientes.
- Base de datos de clientes.
- Administración de datos de envío.
- Sistema de favoritos.
- Comparación de productos.
- Reviews o calificaciones.
- Variantes de producto.
- Más de un valor para un mismo filtro en un producto.
- Búsqueda inteligente o semántica.
- Recomendaciones de productos.
- Funcionalidades de inteligencia artificial.
- Promociones o cupones.
- Historial del carrito.
- Persistencia del carrito después de abandonar la navegación.

Estas funcionalidades podrán evaluarse posteriormente, pero **no forman parte del MVP**.

---

# 5. Actores

## 5.1. Administrador

Es el responsable de mantener actualizado el catálogo.

Puede:

- Autenticarse.
- Crear productos.
- Modificar productos.
- Eliminar productos.
- Administrar fotografías.
- Crear filtros.
- Modificar filtros.
- Eliminar filtros.
- Buscar productos.
- Aplicar filtros.
- Ordenar productos.

El MVP contempla **un único administrador**.

---

## 5.2. Usuario final

Es el visitante público del catálogo.

No necesita registrarse ni iniciar sesión.

Puede:

- Navegar por el catálogo.
- Buscar productos.
- Filtrar productos.
- Ordenar productos.
- Consultar productos.
- Visualizar fotografías.
- Agregar productos al carrito.
- Modificar cantidades.
- Eliminar productos del carrito.
- Consultar el total.
- Enviar un pedido mediante WhatsApp.
- Contactar directamente al administrador mediante WhatsApp.

---

# 6. Modelo conceptual

El sistema tendrá conceptualmente las siguientes entidades principales:

## 6.1. Producto

Un producto tendrá:

- Nombre — obligatorio.
- Descripción — opcional.
- Precio — opcional.
- Fotografías — al menos una obligatoria.
- Filtros — opcionales.
- Fecha de creación — necesaria para ordenar por productos más recientes.

No tendrá:

- Stock.
- SKU.
- Descuento.
- Promoción.
- Estado activo/inactivo.

La eliminación de un producto será permanente.

---

## 6.2. Fotografía

Cada producto puede tener una o varias fotografías.

El administrador podrá:

- Agregar fotografías.
- Reemplazar fotografías.
- Eliminar fotografías.

Un producto siempre deberá conservar al menos una fotografía.

El usuario final podrá visualizar todas las fotografías asociadas al producto.

---

## 6.3. Filtro

Un filtro representa una característica utilizada para clasificar y buscar productos.

Ejemplos:

- Categoría
- Color
- Talle
- Marca

El administrador podrá crear filtros libremente.

Cada filtro tendrá un conjunto de valores.

Ejemplo:

**Filtro:** Color

**Valores:**

- Negro
- Blanco
- Rojo
- Azul

---

## 6.4. Valor de filtro

Cada producto podrá tener como máximo **un valor de cada filtro**.

Ejemplo:

**Producto:** Remera básica

- Categoría → Remeras
- Color → Negro
- Talle → M

No será posible asignar simultáneamente:

- Color → Negro
- Color → Azul

al mismo producto.

Los filtros no son obligatorios para los productos.

---

## 6.5. Carrito

El carrito representa temporalmente la selección de productos realizada por el usuario.

Características:

- No requiere autenticación.
- No persiste después de abandonar la navegación.
- Puede contener múltiples productos.
- Un mismo producto aparece una sola vez.
- Agregar nuevamente un producto incrementa su cantidad.
- La cantidad puede ser modificada.
- Los productos pueden ser eliminados.
- El total se calcula utilizando los precios vigentes.

---

# 7. Requerimientos funcionales

## RF-01 — Autenticación del administrador

El sistema deberá permitir que el administrador se autentique.

No habrá registro de administradores desde la aplicación.

El MVP tendrá un único administrador.

La modificación de las credenciales quedará fuera de la interfaz funcional del sistema y podrá realizarse mediante mecanismos externos al flujo normal de la aplicación.

---

## RF-02 — Alta de productos

El administrador podrá crear un producto.

Datos:

- Nombre — obligatorio.
- Fotografías — obligatorio, mínimo una.
- Descripción — opcional.
- Precio — opcional.
- Filtros — opcionales.

El producto será visible públicamente una vez creado.

---

## RF-03 — Modificación de productos

El administrador podrá modificar:

- Nombre.
- Descripción.
- Precio.
- Fotografías.
- Valores de filtros asociados.

Los cambios deberán reflejarse en el catálogo público.

---

## RF-04 — Eliminación de productos

El administrador podrá eliminar permanentemente un producto.

Una vez eliminado:

- No deberá aparecer en el catálogo.
- No deberá aparecer en los resultados de búsqueda.
- No deberá aparecer mediante filtros.
- No podrá ser agregado nuevamente al carrito.
- Si se encontraba en un carrito existente, deberá desaparecer del carrito.

---

## RF-05 — Gestión de fotografías

El administrador podrá:

- Cargar múltiples fotografías.
- Reemplazar fotografías.
- Eliminar fotografías.

El sistema deberá impedir que un producto quede sin fotografías.

---

## RF-06 — Creación de filtros

El administrador podrá crear filtros libremente.

Ejemplo:

> Color

y posteriormente asociar valores:

> Negro, Blanco, Rojo, Azul.

---

## RF-07 — Modificación de filtros

El administrador podrá modificar los filtros existentes y sus valores.

Los cambios deberán reflejarse en la utilización de los filtros del catálogo.

---

## RF-08 — Eliminación de filtros

El administrador podrá eliminar filtros.

Al eliminar un filtro:

- El filtro dejará de estar disponible para los usuarios.
- Los productos conservarán su existencia.
- Se eliminará la asociación de dicho filtro de los productos que lo utilizaban.

No se eliminarán los productos afectados.

---

## RF-09 — Consulta del catálogo

El usuario podrá acceder al catálogo sin autenticarse.

Los productos serán mostrados públicamente.

Inicialmente se mostrará una cantidad limitada de productos para evitar cargar innecesariamente todos los resultados.

---

## RF-10 — Cargar más productos

El usuario podrá presionar:

> **Cargar más productos**

para obtener un nuevo conjunto de productos.

Por ejemplo:

- Primera carga → 10 productos.
- "Cargar más" → 10 productos adicionales.
- "Cargar más" → 10 productos adicionales.

La cantidad exacta será una decisión posterior de implementación, pero conceptualmente se utilizará una carga incremental.

No se utilizará paginación tradicional con páginas numeradas.

---

## RF-11 — Búsqueda de productos

El usuario podrá buscar productos mediante una barra de búsqueda.

La búsqueda será simple y textual.

La búsqueda deberá considerar:

- Nombre.
- Descripción.

Ejemplo:

> "remera"

deberá encontrar productos cuyo nombre o descripción contengan ese término.

No se incorporará búsqueda semántica ni inteligencia artificial.

---

## RF-12 — Filtrado de productos

El usuario podrá aplicar filtros configurados por el administrador.

Los filtros podrán combinarse con la búsqueda textual.

Ejemplo:

> Búsqueda: "remera"  
> Categoría: Remeras  
> Color: Negro  
> Talle: M

Los resultados deberán cumplir las condiciones seleccionadas.

---

## RF-13 — Ordenamiento

El usuario podrá ordenar los resultados mediante:

- Más recientes.
- Nombre A-Z.
- Precio menor a mayor.
- Precio mayor a menor.

Los productos sin precio requerirán un comportamiento definido para los ordenamientos por precio durante la implementación funcional.

---

## RF-14 — Consulta de producto

El usuario podrá acceder al detalle de un producto.

El detalle deberá mostrar:

- Nombre.
- Descripción, si existe.
- Precio, si existe.
- Filtros asociados, si existen.
- Todas las fotografías disponibles.

---

## RF-15 — Productos sin precio

El precio de un producto será opcional.

Un producto sin precio:

- Podrá ser visualizado.
- Podrá ser agregado al carrito.
- No sumará ningún importe al total.

Ejemplo:

> Producto A — $10.000  
> Producto B — sin precio

Total:

> **$10.000**

El producto sin precio seguirá formando parte del pedido enviado por WhatsApp.

---

## RF-16 — Agregar producto al carrito

El usuario podrá agregar un producto al carrito.

Si el producto ya existe en el carrito, una nueva incorporación no creará una segunda línea, sino que incrementará la cantidad.

Ejemplo:

Primera acción:

> Remera × 1

Segunda acción:

> Remera × 2

Resultado:

> Remera × 3

---

## RF-17 — Modificación de cantidad

El usuario podrá modificar la cantidad de un producto desde el carrito.

La cantidad deberá ser válida.

Ante una cantidad inválida se deberá informar al usuario mediante un mensaje de aviso.

---

## RF-18 — Eliminación del carrito

El usuario podrá eliminar productos individualmente del carrito.

---

## RF-19 — Cálculo del total

El carrito mostrará un único total.

El total será calculado a partir de los productos que tengan precio.

Los productos sin precio no sumarán importe.

El costo de envío no será incluido.

No habrá descuentos ni promociones.

---

## RF-20 — Actualización de precios

El precio vigente será determinado por el administrador.

Si un producto cambia de precio mientras se encuentra en el carrito:

- El carrito deberá utilizar el nuevo precio.
- No será necesario informar explícitamente al usuario que el precio fue modificado.

Ejemplo:

1. Producto agregado a $10.000.
2. Administrador modifica el precio a $12.000.
3. El carrito deberá mostrar $12.000.

El estado actual del catálogo prevalece sobre el estado anterior del carrito.

---

## RF-21 — Producto eliminado mientras está en el carrito

Si un producto que forma parte de un carrito es eliminado por el administrador:

- El producto deberá desaparecer del carrito.
- No deberá poder enviarse como parte del pedido.
- El resto del carrito deberá permanecer disponible.

La acción del administrador prevalece sobre el estado anterior del carrito.

---

## RF-22 — Generación del pedido

El usuario podrá presionar:

> **Enviar pedido por WhatsApp**

si el carrito contiene productos.

El sistema deberá generar un mensaje prearmado que contenga como mínimo la información necesaria para identificar:

- Productos.
- Cantidades.
- Precios disponibles.
- Total.

El pedido será enviado al único número de WhatsApp predefinido.

---

## RF-23 — Envío del pedido por WhatsApp

El sistema no gestionará internamente el pedido.

El flujo será:

**Catálogo → Carrito → Generación del mensaje → WhatsApp → Atención humana**

Una vez abierto WhatsApp, la comunicación y coordinación posterior quedarán fuera del sistema.

---

## RF-24 — Carrito vacío

El botón para enviar el pedido estará deshabilitado cuando el carrito esté vacío.

Al agregar al menos un producto, el botón se habilitará.

No se generará un pedido vacío.

---

## RF-25 — Contactar al administrador

Existirá un segundo mecanismo independiente del carrito para contactar al administrador.

Este mecanismo permitirá al usuario abrir WhatsApp y comunicarse con el administrador **sin necesidad de armar un pedido**.

Este flujo será independiente del botón de envío del carrito.

---

## RF-26 — Sin resultados

Cuando una búsqueda o combinación de filtros no produzca resultados, el sistema deberá informar al usuario, por ejemplo:

> **No se encontraron productos.**

La barra de búsqueda y los filtros deberán continuar disponibles para permitir modificar la consulta.

---

# 8. Flujos principales

## Flujo 1 — Consulta del catálogo

1. Usuario ingresa al catálogo.
2. El sistema muestra una cantidad inicial limitada de productos.
3. El usuario navega entre los productos.
4. Puede cargar más productos.
5. Puede acceder al detalle de cualquiera de ellos.

---

## Flujo 2 — Búsqueda

1. Usuario ingresa un término.
2. El sistema busca coincidencias en nombre y descripción.
3. Se muestran los productos coincidentes.
4. Si no existen coincidencias, se muestra el mensaje correspondiente.

---

## Flujo 3 — Búsqueda + filtros

1. Usuario realiza una búsqueda.
2. Selecciona uno o más filtros.
3. El sistema combina ambos criterios.
4. Se muestran únicamente los productos que cumplen las condiciones.

---

## Flujo 4 — Agregar al carrito

1. Usuario consulta un producto.
2. Selecciona una cantidad válida.
3. Agrega el producto.
4. El producto aparece en el carrito.
5. Si ya existía, se incrementa su cantidad.

---

## Flujo 5 — Modificar carrito

1. Usuario abre el carrito.
2. Visualiza los productos.
3. Modifica cantidades o elimina productos.
4. El sistema recalcula el total.

---

## Flujo 6 — Generar pedido

1. Usuario tiene productos en el carrito.
2. Presiona "Enviar pedido por WhatsApp".
3. El sistema obtiene el estado vigente de los productos.
4. Se eliminan del pedido los productos que ya no existen.
5. Se utilizan los precios actualmente vigentes.
6. Se genera el mensaje.
7. Se abre WhatsApp con el número predefinido.
8. El usuario continúa la comunicación con el administrador.

---

## Flujo 7 — Contacto directo

1. Usuario presiona "Contactar al administrador".
2. El sistema abre WhatsApp.
3. El usuario puede iniciar una conversación sin haber armado un carrito.

---

## Flujo 8 — Gestión de producto

1. Administrador inicia sesión.
2. Accede a la gestión de productos.
3. Crea, modifica o elimina productos.
4. Los cambios impactan sobre el catálogo público.

---

## Flujo 9 — Gestión de filtros

1. Administrador inicia sesión.
2. Accede a la gestión de filtros.
3. Crea/modifica/elimina filtros.
4. Los filtros disponibles para el usuario se actualizan.
5. Las asociaciones existentes se actualizan según corresponda.

---

# 9. Reglas de negocio

## RN-01 — Autenticación

Solamente el administrador requiere autenticación.

---

## RN-02 — Administrador único

El MVP contempla un único administrador.

---

## RN-03 — Producto válido

Un producto requiere obligatoriamente:

- Nombre.
- Al menos una fotografía.

---

## RN-04 — Precio opcional

El precio puede no estar definido.

Los productos sin precio pueden formar parte del catálogo y del carrito, pero no suman al total.

---

## RN-05 — Filtros opcionales

Un producto puede existir sin filtros.

---

## RN-06 — Un valor por filtro

Un producto podrá tener como máximo un valor asociado a cada filtro.

---

## RN-07 — Eliminación de filtro

Eliminar un filtro elimina su asociación con los productos, pero no elimina los productos.

---

## RN-08 — Eliminación de producto

Eliminar un producto implica eliminación permanente.

---

## RN-09 — Estado del administrador

El estado actual del catálogo prevalece sobre el estado previo del usuario.

Por lo tanto:

- Si cambia el precio → prevalece el nuevo precio.
- Si elimina el producto → desaparece del carrito.
- Si el producto ya no existe → no puede agregarse.

---

## RN-10 — Carrito temporal

El carrito existe únicamente durante la navegación actual.

No existe persistencia posterior.

---

## RN-11 — Producto duplicado

Un producto no puede aparecer como dos líneas independientes dentro del carrito.

Agregarlo nuevamente incrementa su cantidad.

---

## RN-12 — Envío

El costo de envío no es gestionado por el sistema.

---

## RN-13 — Pago

El pago no es gestionado por el sistema.

---

## RN-14 — Pedido

El sistema no almacenará pedidos como entidad propia en el MVP.

El pedido se materializa funcionalmente mediante el mensaje generado para WhatsApp.

---

## RN-15 — WhatsApp

Todos los pedidos y consultas serán dirigidos a un único número predefinido.

---

# 10. Comportamiento ante cambios de datos

El sistema debe considerar que el administrador puede modificar el catálogo mientras existen usuarios navegando.

La regla general será:

> **El catálogo vigente siempre tiene prioridad sobre el estado anterior del usuario.**

### Caso: cambio de precio

Producto:

> $10.000 → $12.000

El carrito utilizará:

> $12.000

---

### Caso: eliminación

Producto eliminado:

> El producto desaparece del carrito.

---

### Caso: eliminación de filtro

Filtro eliminado:

> El producto continúa existiendo, pero pierde la asociación con dicho filtro.

---

### Caso: intento de agregar producto eliminado

El producto no se agregará al carrito.

---

# 11. Experiencia general del usuario

El recorrido principal esperado será:

**Ingresar al catálogo**

↓

**Explorar / buscar / filtrar**

↓

**Consultar producto**

↓

**Agregar al carrito**

↓

**Continuar navegando**

↓

**Abrir carrito**

↓

**Modificar cantidades**

↓

**Ver total**

↓

**Enviar pedido por WhatsApp**

↓

**Continuar atención por WhatsApp**

En paralelo, el usuario podrá realizar:

**Ingresar al catálogo**

↓

**Contactar al administrador**

↓

**WhatsApp**

sin necesidad de crear un pedido.

---

# 12. Interfaz funcional conceptual

No se define todavía diseño visual, pero funcionalmente el catálogo deberá contemplar:

## Catálogo

- Barra de búsqueda.
- Filtros.
- Ordenamiento.
- Lista/grilla de productos.
- Botón "Cargar más productos".
- Acceso al carrito.
- Botón "Contactar al administrador".

---

## Producto

- Fotografías.
- Nombre.
- Descripción.
- Precio, cuando exista.
- Filtros asociados.
- Acción para agregar al carrito.

---

## Carrito

- Productos seleccionados.
- Cantidad.
- Precio vigente.
- Eliminación de productos.
- Modificación de cantidades.
- Total.
- Botón "Enviar pedido por WhatsApp".

El botón de envío permanecerá deshabilitado mientras el carrito esté vacío.

---

## Administración

Deberá existir una interfaz para:

- Productos.
- Filtros.

La administración de productos permitirá gestionar todos los atributos definidos.

La administración de filtros permitirá gestionar filtros y sus valores.

---

# 13. Criterios de aceptación principales

El MVP podrá considerarse funcionalmente completo cuando se cumplan, como mínimo, las siguientes condiciones:

### Productos

- [ ] El administrador puede crear un producto.
- [ ] No se puede crear un producto sin nombre.
- [ ] No se puede crear un producto sin al menos una fotografía.
- [ ] El precio puede quedar vacío.
- [ ] La descripción puede quedar vacía.
- [ ] Los filtros pueden quedar vacíos.
- [ ] El administrador puede modificar un producto.
- [ ] El administrador puede modificar sus fotografías.
- [ ] El administrador puede eliminar un producto permanentemente.

### Filtros

- [ ] El administrador puede crear un filtro.
- [ ] Puede definir sus valores.
- [ ] Puede modificarlo.
- [ ] Puede eliminarlo.
- [ ] La eliminación de un filtro no elimina productos.
- [ ] Los productos pierden la asociación con el filtro eliminado.
- [ ] Un producto no puede tener más de un valor del mismo filtro.

### Catálogo

- [ ] El catálogo es público.
- [ ] No requiere login.
- [ ] Se muestran productos inicialmente en cantidad limitada.
- [ ] Existe "Cargar más".
- [ ] Se puede buscar por nombre.
- [ ] Se puede buscar por descripción.
- [ ] Se pueden aplicar filtros.
- [ ] Se puede combinar búsqueda y filtros.
- [ ] Se puede ordenar por fecha.
- [ ] Se puede ordenar por nombre.
- [ ] Se puede ordenar por precio ascendente.
- [ ] Se puede ordenar por precio descendente.
- [ ] Se muestran todas las fotografías del producto.
- [ ] Se informa cuando no existen resultados.

### Carrito

- [ ] Se puede agregar un producto.
- [ ] Agregar nuevamente incrementa su cantidad.
- [ ] Se puede modificar la cantidad.
- [ ] Se validan cantidades.
- [ ] Se puede eliminar un producto.
- [ ] Se calcula el total.
- [ ] Productos sin precio no suman al total.
- [ ] El carrito no persiste después de abandonar la navegación.
- [ ] Los cambios de precio del administrador se reflejan en el carrito.
- [ ] Los productos eliminados desaparecen del carrito.
- [ ] El carrito vacío no permite enviar un pedido.

### WhatsApp

- [ ] El pedido puede enviarse a un número predefinido.
- [ ] El mensaje contiene los productos.
- [ ] El mensaje contiene las cantidades.
- [ ] El mensaje contiene los precios disponibles.
- [ ] El mensaje contiene el total.
- [ ] No se gestiona el pago.
- [ ] No se gestiona el envío.
- [ ] Existe un mecanismo de contacto directo independiente del carrito.

---

# 14. Decisiones de alcance importantes

Las siguientes decisiones son particularmente importantes porque evitan que el MVP crezca innecesariamente.

### 14.1. No existe sistema de usuarios

No se almacenan cuentas ni datos de compradores.

Esto simplifica significativamente el flujo de compra.

---

### 14.2. No existe sistema interno de pedidos

El pedido termina funcionalmente cuando se genera y envía el mensaje a WhatsApp.

No se requiere:

- historial,
- estado,
- seguimiento,
- administración,
- cancelación,
- modificación.

---

### 14.3. WhatsApp es el canal de atención

El sistema funciona como catálogo y generador de pedidos, mientras que WhatsApp funciona como canal de comunicación comercial.

---

### 14.4. No existe stock

El sistema no garantiza disponibilidad de productos.

La disponibilidad real será responsabilidad del administrador y/o de la persona que atienda los pedidos.

---

### 14.5. No existe gestión de envío

El catálogo no calcula ni informa costos de envío.

---

### 14.6. No existe gestión de pago

El pago ocurre fuera del sistema.

---

### 14.7. El catálogo es la fuente actual de verdad

Los cambios realizados por el administrador tienen prioridad sobre el estado anterior del usuario.

---

# 15. Backlog funcional inicial

## Épica 1 — Administración

### Productos
- Crear producto.
- Listar productos.
- Buscar productos.
- Modificar producto.
- Eliminar producto.
- Gestionar fotografías.

### Filtros
- Crear filtro.
- Crear valores de filtro.
- Modificar filtro.
- Modificar valores.
- Eliminar filtro.
- Gestionar asociaciones con productos.

### Autenticación
- Login del administrador.

---

## Épica 2 — Catálogo público

- Listar productos.
- Cargar productos inicialmente.
- Cargar más productos.
- Buscar productos.
- Filtrar productos.
- Combinar búsqueda y filtros.
- Ordenar productos.
- Mostrar detalle.
- Mostrar fotografías.

---

## Épica 3 — Carrito

- Agregar producto.
- Incrementar cantidad.
- Modificar cantidad.
- Eliminar producto.
- Calcular total.
- Actualizar precios.
- Eliminar productos que ya no existen.

---

## Épica 4 — WhatsApp

- Generar mensaje de pedido.
- Abrir WhatsApp con pedido.
- Botón de contacto directo.
- Manejar carrito vacío.

---

# 16. Casos que deliberadamente no se resolverán en el MVP

Para proteger el alcance, las siguientes situaciones no tendrán lógica adicional:

- Qué sucede si un producto no tiene stock.
- Reservas de productos.
- Precios especiales.
- Variaciones de un mismo producto.
- Múltiples administradores.
- Pedidos simultáneos.
- Historial de compras.
- Clientes registrados.
- Confirmación de pago.
- Confirmación de recepción del pedido.
- Seguimiento de entrega.
- Facturación.
- Gestión de promociones.
- Notificaciones.

Cuando aparezcan necesidades relacionadas con estos puntos durante el desarrollo, deberán considerarse **nuevos requerimientos** y no modificaciones implícitas del MVP.

---

# 17. Definición funcional del MVP

En términos simples, el producto final del MVP será:

> **Un catálogo público de productos administrado por una única persona, donde los visitantes pueden buscar, filtrar, ordenar y consultar productos, agregarlos temporalmente a un carrito y enviar el pedido resultante a un número de WhatsApp.**

El administrador podrá mantener actualizado el catálogo mediante la creación, modificación y eliminación permanente de productos, así como mediante la gestión de filtros y sus valores.

El sistema no gestionará usuarios finales, stock, pagos, envíos ni pedidos internamente.

La responsabilidad del sistema finaliza funcionalmente al generar y abrir el pedido en WhatsApp.

---

# 18. Frontera del sistema

La frontera funcional del MVP queda definida de la siguiente manera:

**DENTRO DEL SISTEMA**

Catálogo  
→ Productos  
→ Fotografías  
→ Filtros  
→ Búsqueda  
→ Ordenamiento  
→ Carrito  
→ Cálculo del total  
→ Generación del pedido  
→ Apertura de WhatsApp

**FUERA DEL SISTEMA**

→ Conversación con el cliente  
→ Confirmación del pedido  
→ Disponibilidad real  
→ Costo de envío  
→ Pago  
→ Facturación  
→ Entrega  
→ Seguimiento del pedido

Esta frontera es fundamental para mantener el MVP pequeño y evitar convertir el catálogo en un sistema completo de comercio electrónico.

---

# 19. Estado del análisis

Con las decisiones tomadas hasta este punto, **el alcance funcional principal del MVP se considera definido**.

No se considera necesario tomar decisiones tecnológicas, de infraestructura, arquitectura, base de datos o implementación durante esta etapa.

El siguiente paso del análisis puede consistir en transformar estos requerimientos en:

1. **Casos de uso completos.**
2. **Historias de usuario.**
3. **Flujos detallados por pantalla.**
4. **Modelo conceptual de datos.**
5. **Matriz de permisos.**
6. **Backlog priorizado del MVP.**
7. **Criterios de aceptación por historia de usuario.**
8. **Definición de los estados y reglas de transición relevantes.**

Esto permitirá llegar a una especificación suficientemente precisa antes de comenzar a tomar decisiones de diseño técnico.