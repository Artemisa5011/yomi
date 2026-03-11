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

### Paso 6: Ejecutar la aplicación

```bash
npm run dev
```

Abre `http://localhost:5173` en el navegador.

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo (puerto 5173) |
| `npm run build` | Build de producción |
| `npm run preview` | Vista previa del build |

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
- [ ] **Vendedores**: listar, Desactivar/Reactivar. Inactivo no puede ingresar; ventas se conservan
- [ ] **Vincular cliente portal**: ingresar cédula para vincular servicios/reservas

### 8. Reglas de negocio

- [ ] Registrar cliente con cédula duplicada → error
- [ ] Más de 3 servicios funerarios por día → error
- [ ] Cliente pasa a "verdugo" al contratar servicio
- [ ] No eliminar cliente verdugo → botón deshabilitado
- [ ] Vendedor inactivo intenta login → mensaje "Cuenta desactivada"

### 9. Optimistic update

- [ ] Editar cliente → Guardar
- [ ] Simular error (desconectar red) → rollback + toast

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
| **Panel Admin** | Vendedores (Desactivar/Reactivar), Vincular cliente portal |
| **Cliente verdugo** | No se puede eliminar (FK RESTRICT, botón deshabilitado) |
| **Vendedor inactivo** | Admin desactiva; no puede ingresar; ventas se conservan |
| **Montos** | Formato legible ($100.000) con toLocaleString es-CO |
| **Scripts db/** | 014-019 base. 020-024 nuevos. Ver `docs/MIGRACIONES_DB.md` |

---

## Estructura

```
yomi-no-hana/
├── db/          # SQL: tablas, RLS, triggers, realtime (orden en docs/MIGRACIONES_DB.md)
├── docs/        # Checklist, guía exposición, validación derroteros, migraciones
└── src/         # React, páginas, contextos, componentes
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
| `/funeraria`, `/cementerio` | Vendedor/Admin | Venta |
| `/mi-cementerio` | Cliente (3) | Mis Difuntos |
| `/clientes/nuevo`, `/editar/:id`, `/detalle/:id` | Vendedor/Admin | CRUD clientes |

**Scripts de diagnóstico:** `018_diagnostico_vinculacion.sql` – consultas para revisar servicios sin vincular y cédulas en portal.
