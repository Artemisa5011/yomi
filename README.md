# ⸸ Yomi No Hana - Templo Fúnebre ⸸

Aplicación web para gestión de servicios fúnebres y cementerio. React + Vite + Tailwind + Supabase.  
**SPA** – Single Page Application: cambia entre vistas sin recargar, actualizando la URL dinámicamente.

---

## Requisitos

- Node.js 18+
- Cuenta Supabase

---

## Setup paso a paso

### Paso 1: Clonar e instalar dependencias

```bash
cd yomi-no-hana
npm install
npm install tailwindcss @tailwindcss/vite
```

### Paso 2: Configurar variables de entorno

1. Copia `.env.example` a `.env` (o `.env.local`)
2. Crea un proyecto en [Supabase](https://supabase.com)
3. En Supabase: **Settings** → **API** → copia `Project URL` y `anon public` key
4. En `.env` (sin comillas en los valores):

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### Paso 3: Crear la base de datos

En Supabase: **SQL Editor** → ejecuta en orden los archivos de `db/`:

| Orden | Archivo | Descripción |
|-------|---------|-------------|
| 1 | `001_schema.sql` | Tablas base |
| 2 | `002_rls.sql` | Políticas RLS |
| 3 | `003_realtime.sql` | Suscripción Realtime |
| 4 | `004_reglas_negocio.sql` | Reglas de negocio |
| 5 | `005_hora_24h.sql` | Formato hora 24h (opcional si ya tienes datos) |
| 6 | `006_valor_total.sql` | Campo valor_total |
| 7 | `007_roles_portal.sql` | Roles 666/2/3, portal cliente |
| 8 | `008_test_sombra.sql` | Test de la Sombra, resultado espiritual |
| 9 | `009_fix_role_trigger.sql` | Solo si al asignar admin sale "No puedes cambiar tu rol" |
| 10 | `010_fix_stack_depth_rls.sql` | Corrige "stack depth limit exceeded" |
| 11 | `011_calendario_vendedores_ver_todos.sql` | Calendario completo para vendedores |
| 12 | `012_get_portal_user_id.sql` | RPC vincular reservas con clientes portal |
| 13 | `013_update_lotes_valores.sql` | Actualizar valores lotes (opcional) |
| 14 | `014_servicios_cliente_user_id.sql` | Cliente portal ve sus servicios |
| 15 | `015_cedula_ya_registrada.sql` | RPC validar cédula duplicada |
| 16 | `016_vinculacion_cliente_portal.sql` | Vinculación masiva existente |
| 17 | `017_admin_vinculacion_cedula.sql` | RPC admin vincular por cédula |
| 18 | `019_fix_trigger_vinculacion.sql` | Fix trigger 3 servicios/día |
| 19 | `020_restrict_delete_cliente_con_servicios.sql` | No eliminar cliente con servicios |
| 20 | `021_get_display_name.sql` | Nombre en header tras login |
| 21 | `023_crear_empleado_admin_rpc.sql` | RPC guardar empleado al registrar vendedor |
| 22 | `024_empleados_estado_inactivo.sql` | Estado activo/inactivo vendedores |

> Ver `docs/MIGRACIONES_DB.md` para el orden completo y descripciones.

### Paso 4: Configurar Auth en Supabase

1. **Authentication** → **Providers**: Email habilitado
2. **URLs de redirección**: `http://localhost:5173` (y tu URL de producción)
3. Contraseña: Supabase puede exigir mayúscula, minúscula, número y símbolo (mín. 6 caracteres)

### Paso 5: Crear el primer admin (rol 666)

1. En Supabase: **Authentication** → **Users** → Add user
2. Crea un usuario con el correo que usarás como admin (ej. `contactoinfernal@yominohana.com`) y asigna contraseña
3. En **SQL Editor**, ejecuta:

```sql
INSERT INTO public.user_profiles (user_id, rol)
SELECT id, 666
FROM auth.users
WHERE email = 'contactoinfernal@yominohana.com'
ON CONFLICT (user_id) DO UPDATE SET rol = 666;
```

4. Ese usuario verá el panel completo (Admin + Dashboard) y podrá crear vendedores

**Si sale "No puedes cambiar tu rol"**: ejecuta primero `db/009_fix_role_trigger.sql` y luego el `INSERT` de arriba.

### Paso 5b (opcional): Eliminar vendedor por completo

Para que el botón **Eliminar** borre la cuenta auth del vendedor (correo liberado para usarse luego como cliente):

```bash
npm install
npm run supabase:login
npm run supabase:link
npm run supabase:deploy
```

(O usa `npx supabase` en lugar de los scripts si ya tienes la CLI instalada con Scoop.)

- La función usa `SUPABASE_SERVICE_ROLE_KEY` (se configura automáticamente en Supabase).
- El deploy incluye `--no-verify-jwt` para evitar 401 del gateway (la función valida auth internamente).
- **Verificar eliminación:** Supabase → Authentication → Users y Table Editor → `empleados`, `user_profiles`.

Ver `docs/EDGE_FUNCTION_DELETE_VENDEDOR.md` para guía completa, troubleshooting y mensajes de error.

Si no despliegas la función, el botón **Eliminar** no funcionará; usa **Desactivar** para vendedores.

### Paso 6: Ejecutar la aplicación

```bash
npm run dev
```

Abre `http://localhost:5173` en el navegador.

### Si aparece "Error al verificar perfil" o "Failed to fetch" al iniciar sesión

1. **Proyecto Supabase pausado**: En Supabase → Dashboard, si ves "Project paused", haz clic en **Restore** (proyectos gratis se pausan tras inactividad).
2. **Variables de entorno**: Revisa `.env` – `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` correctos (Settings → API en Supabase).
3. **Reiniciar**: Tras cambiar `.env`, reinicia con `npm run dev`.
4. **Perfiles faltantes**: Ejecuta en Supabase SQL Editor:
   ```sql
   -- Ver usuarios y roles
   SELECT u.email, p.rol FROM auth.users u
   LEFT JOIN public.user_profiles p ON p.user_id = u.id;
   -- Crear/actualizar admin
   INSERT INTO public.user_profiles (user_id, rol)
   SELECT id, 666 FROM auth.users WHERE email = 'TU_EMAIL_ADMIN'
   ON CONFLICT (user_id) DO UPDATE SET rol = 666;
   ```

5. **Admin no ve vendedores**: Si el panel Admin muestra "No hay vendedores" pero tienes usuarios con rol 2, ejecuta `db/027_crear_empleados_para_vendedores_existentes.sql` para crear las filas faltantes en `empleados`.
6. **Vendedores con datos placeholder** (NOMBRE_REAL, CÉDULA_REAL): Ejecuta `db/028_actualizar_empleados_desde_metadata.sql` para recuperar datos reales desde la metadata del registro.

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo (puerto 5173) |
| `npm run build` | Build de producción |
| `npm run preview` | Vista previa del build |
| `npm run supabase:login` | Login CLI Supabase (una vez) |
| `npm run supabase:link` | Vincular proyecto Supabase (una vez) |
| `npm run supabase:deploy` | Desplegar Edge Function delete-vendedor-auth |

---

## CRUD mínimo (2 entidades)

La app implementa CRUD completo para **Clientes** y **Empleados** (vendedores).

### 1. Clientes

| Operación | API | Página / Ruta | Notas |
|-----------|-----|---------------|-------|
| **C**reate | `clientesApi.createCliente` | `/clientes/nuevo` (ClienteNuevo) | Tras buscar cédula inexistente en Dashboard |
| **R**ead | `listClientes`, `getClienteById`, `getClienteByCedula` | Dashboard (lista y búsqueda), `/clientes/detalle/:id` | Detalle incluye servicios y reservas |
| **U**pdate | `clientesApi.updateCliente` | `/clientes/editar/:id` (ClienteEditar) | Teléfono, correo, departamento, ciudad |
| **D**elete | `clientesApi.deleteCliente` | Dashboard (botón Eliminar) | Bloqueado si cliente es verdugo (tiene servicios) |

### 2. Empleados (vendedores)

| Operación | API | Página / Ruta | Notas |
|-----------|-----|---------------|-------|
| **C**reate | `empleadosApi.createEmpleadoRpc` | `/registro` (Registro) | Solo admin. Crea empleado + user_profile rol 2 |
| **R**ead | `listEmpleados`, `getEmpleadoById` | `/admin` (lista vendedores), `/empleados/editar/:id` | Admin ve todos |
| **U**pdate | `updateEmpleado`, `updateEmpleadoEstado` | `/empleados/editar/:id`, Admin (Desactivar/Reactivar) | Editar: cédula, nombre, teléfono, correo |
| **D**elete | `deleteVendedorCompleto` (sin ventas) / `updateEmpleadoEstado` (con ventas) | `/admin` (Eliminar o Desactivar) | Sin ventas: borra cuenta completa. Con ventas: solo desactivar |

---

## Prueba manual (smoke test) paso a paso

### 1. Registro y login (admin y vendedor)

- [ ] Ir a `/login` e iniciar sesión como admin (correo con rol 666)
- [ ] Ver en el menú **ADMIN** → ir a `/admin`
- [ ] Click en **Registrar vendedor** (`/registro`)
- [ ] Crear vendedor: cédula, nombre, teléfono, correo, contraseña
- [ ] Cerrar sesión e iniciar con el vendedor
- [ ] Verificar: Dashboard, Funeraria, Cementerio visibles
- [ ] Verificar: nombre del usuario visible en header (debajo de Cerrar sesión)

### 2. Ruta protegida

- [ ] Cerrar sesión
- [ ] Intentar acceder a `/dashboard` → debe redirigir a **Inicio** (/)
- [ ] La app abre siempre en Inicio; login es opcional desde el menú

### 3. CRUD Clientes

- [ ] Login → Dashboard
- [ ] Buscar cédula inexistente → registrar cliente
- [ ] Crear cliente: cédula, nombre, teléfono, correo, departamento, ciudad
- [ ] Buscar cliente por cédula
- [ ] **Ver detalle** (`/clientes/detalle/:id`): datos, servicios, reservas
- [ ] Editar cliente (teléfono, correo, departamento, ciudad)
- [ ] **Eliminar**: cliente sin servicios se puede eliminar; cliente verdugo (con servicios) → botón deshabilitado

### 4. Funeraria

- [ ] Buscar cliente activo
- [ ] Agregar servicios: **Rituales ($100.000)**, **Ofrendas ($500.000)**, **Sombras ($1.000.000)**
- [ ] Máximo 3 por día
- [ ] Seleccionar fecha, hora (00:00 o 03:00), nombre del difunto
- [ ] Método de pago: efectivo, tarjeta, con la vida (nombre condenado)
- [ ] Confirmar pago → mensaje "Pago recibido. Alma condenada con éxito"
- [ ] Si el cliente tiene cuenta portal (misma cédula), se vincula automáticamente
- [ ] Ver calendario con servicios confirmados (Realtime)
- [ ] Cliente pasa a estado "verdugo" tras comprar

### 5. Cementerio + Test de la Sombra

- [ ] Buscar cliente
- [ ] Responder pregunta de pecado → asignar lote
- [ ] (Opcional) Cambio manual de lote (+$1.000.000)
- [ ] Elegir "Con difunto" o "Sin difunto"
- [ ] Responder **Test de la Sombra** (7 preguntas A–G)
- [ ] Método de pago → confirmar
- [ ] Ver tabla de reservas con `Resultado espiritual` (pecado dominante)
- [ ] Verificar: lote no se puede cambiar después del juicio

### 6. Portal cliente (rol 3)

- [ ] Cerrar sesión
- [ ] "Regístrate como cliente" o ir a `/registro-cliente`
- [ ] Registrar: cédula, correo, contraseña (mín. 6 caracteres: mayúscula, minúscula, número, símbolo)
- [ ] Las ventas se vinculan automáticamente si la cédula coincide
- [ ] Iniciar como cliente → redirección a `/mi-cementerio`
- [ ] **Mis Difuntos**: servicios funerarios y reservas (solo lectura)
- [ ] Si no ve nada: admin vincula por cédula en Panel Admin

### 7. Panel Admin

- [ ] Registrar vendedor
- [ ] Dashboard
- [ ] **Vendedores**: listar, Editar, Eliminar por completo (sin ventas: borra cuenta; correo liberado), Desactivar/Reactivar (con ventas)
- [ ] **Vincular cliente portal**: ingresar cédula para vincular servicios/reservas

### 8. Reglas de negocio

- [ ] **Cuentas nuevas**: Admin, vendedor y cliente quedan activas al crearse. Solo el admin puede Desactivar/Reactivar vendedores.
- [ ] Registrar cliente con cédula duplicada → error
- [ ] Más de 3 servicios funerarios por día → error
- [ ] Cliente pasa a "verdugo" al contratar servicio
- [ ] No eliminar cliente verdugo → botón deshabilitado
- [ ] Vendedor inactivo intenta login → mensaje "Cuenta desactivada"

### 9. Optimistic update con rollback

Actualización optimista: la UI cambia al instante; si la petición falla, se revierten los cambios y se muestra toast.

| Acción | Dónde | Prueba |
|--------|-------|--------|
| Editar cliente (formulario) | ClienteEditar | Guardar con red desconectada → formulario revierte, toast "Cambios revertidos" |
| Editar vendedor (formulario) | EmpleadoEditar | Idem |
| Eliminar cliente de la lista | Dashboard | Eliminar con red desconectada → cliente vuelve a la lista, toast |
| Eliminar vendedor | Admin | Idem |
| Desactivar/Reactivar vendedor | Admin | Cambiar estado con red desconectada → estado revierte, toast |

- [ ] Desconectar red (DevTools → Network → Offline)
- [ ] Probar una acción (editar, eliminar, desactivar)
- [ ] Ver que la UI revierte y aparece toast "Cambios revertidos"

---

## Despliegue en Netlify paso a paso

### 1. Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

### 2. Crear sitio en Netlify

1. Ir a [netlify.com](https://www.netlify.com) e iniciar sesión
2. **Add new site** → **Import an existing project**
3. Conectar **GitHub** y elegir el repositorio

### 3. Configuración del build

- **Branch to deploy**: `main`
- **Base directory**: vacío (o `yomi-no-hana` si está en subcarpeta)
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### 4. Variables de entorno

- `VITE_SUPABASE_URL` = `https://tu-proyecto.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = tu anon key

### 5. Deploy

- Click en **Deploy site**

### 6. Configurar Supabase para producción

- **Authentication** → **URL Configuration**
- **Site URL**: URL de Netlify (ej. `https://tu-sitio.netlify.app`)
- **Redirect URLs**: `https://tu-sitio.netlify.app/**`

**Checklist post-deploy:**

- [ ] App carga en la URL de Netlify
- [ ] Login y registro funcionan
- [ ] Dashboard, Funeraria, Cementerio visibles al estar logueado
- [ ] No hay `service_role` ni keys secretas expuestas

---

## Resumen de cambios

| Cambio | Descripción |
|--------|-------------|
| **Página inicial** | App abre en Inicio (/). Rutas sin sesión redirigen a Inicio |
| **Login** | Enlace "Regístrate como cliente". Redirección según rol |
| **Nombre en header** | Tras login se muestra el nombre del usuario (debajo de Cerrar sesión) |
| **Registro cliente** | Validación contraseña, cédula duplicada, correo existente |
| **Detalle cliente** | Datos, servicios funerarios, reservas cementerio |
| **Mis Difuntos** | Cliente ve servicios y reservas (solo lectura). Vinculación automática o manual |
| **Panel Admin** | Vendedores (CRUD: Editar, Eliminar/Desactivar), Vincular cliente portal |
| **CRUD mínimo** | Clientes y Empleados: Create, Read, Update, Delete (ver sección anterior) |
| **Cliente verdugo** | No se puede eliminar (FK RESTRICT, botón deshabilitado) |
| **Vendedor inactivo** | Admin desactiva; no puede ingresar; ventas se conservan |
| **Montos** | Formato legible ($100.000) con toLocaleString es-CO |
| **Scripts db/** | 014-019 base. 020-028: migraciones y correcciones. Ver `docs/MIGRACIONES_DB.md` |
| **Edge Function delete-vendedor** | Elimina cuenta auth (correo liberado). Deploy con `--no-verify-jwt`. Ver `docs/EDGE_FUNCTION_DELETE_VENDEDOR.md` |
| **Optimistic update** | Eliminar cliente, vendedor; Editar cliente/vendedor; Desactivar/Reactivar vendedor. Rollback + toast en error |

---

## Estructura

```
yomi-no-hana/
├── db/              # SQL: tablas, RLS, triggers, realtime (orden en docs/MIGRACIONES_DB.md)
├── docs/            # Guías, checklists, migraciones
│   ├── EDGE_FUNCTION_DELETE_VENDEDOR.md  # Edge Function eliminar vendedor, verificación, troubleshooting
│   ├── MIGRACIONES_DB.md                 # Orden de scripts SQL
│   └── ...
├── supabase/functions/
│   └── delete-vendedor-auth/   # Edge Function para eliminar cuenta auth
└── src/              # React, páginas, contextos, componentes
```

**Rutas y menú** (`App.jsx`, protección con `RoleRoute`):

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Inicio (página de aterrizaje) |
| `/login` | Público | Iniciar sesión |
| `/registro` | Admin (666) | Registrar vendedor |
| `/registro-cliente` | Público | Registrar cliente portal |
| `/dashboard` | Vendedor/Admin | Panel vendedor |
| `/admin` | Admin (666) | Panel admin |
| `/empleados/editar/:id` | Admin (666) | Editar vendedor |
| `/funeraria`, `/cementerio` | Vendedor/Admin | Venta |
| `/mi-cementerio` | Cliente (3) | Mis Difuntos |
| `/clientes/nuevo`, `/editar/:id`, `/detalle/:id` | Vendedor/Admin | CRUD clientes |

**Scripts de diagnóstico y corrección:**

| Archivo | Uso |
|---------|-----|
| `018_diagnostico_vinculacion.sql` | Servicios/reservas sin vincular, cédulas en portal |
| `025_fix_admin_rol_666.sql` | Corregir rol admin si aparece "Cuenta desactivada" |
| `026_crear_empleado_faltante.sql` | Crear empleado para UN vendedor (reemplazar placeholders) |
| `027_crear_empleados_para_vendedores_existentes.sql` | Crear empleados para TODOS los vendedores (rol 2) sin fila |
| `028_actualizar_empleados_desde_metadata.sql` | Actualizar empleados con datos reales desde metadata |

**Documentación adicional:**

| Documento | Descripción |
|-----------|-------------|
| `docs/EDGE_FUNCTION_DELETE_VENDEDOR.md` | Edge Function eliminar vendedor, deploy, verificación en Supabase, troubleshooting |
