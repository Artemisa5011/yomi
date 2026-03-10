# ⸸ Yomi No Hana - Templo Fúnebre ⸸

Aplicación web para gestión de servicios fúnebres y cementerio. React + Vite + Tailwind + Supabase.  
**SPA** – Single Page Application: cambia entre vistas sin recargar, actualizando la URL dinámicamente.

## Requisitos

- Node.js 18+
- Cuenta Supabase

## Setup

1. **Clonar e instalar dependencias**
   ```bash
   cd yomi-no-hana
   npm install
   npm install tailwindcss @tailwindcss/vite
   ```

2. **Configurar variables de entorno**
   - Copia `.env.example` a `.env` (o `.env.local`)
   - Crea un proyecto en [Supabase](https://supabase.com)
   - En Supabase: Settings → API → copia `Project URL` y `anon public` key
   - En `.env` (sin comillas en los valores):
     ```
     VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
     VITE_SUPABASE_ANON_KEY=tu_anon_key
     ```

3. **Crear la base de datos**
   - En Supabase: SQL Editor
   - Ejecuta en orden los archivos de `db/`:
     - `001_schema.sql`
     - `002_rls.sql`
     - `003_realtime.sql`
     - `004_reglas_negocio.sql`
     - `005_hora_24h.sql` (si ya tenías datos y quieres pasar a formato 24h)
     - `006_valor_total.sql`
     - `007_roles_portal.sql` (roles 666/2/3, portal cliente, RLS extendida)
     - `008_test_sombra.sql` (resultado espiritual y bloqueo de lote)
     - `009_fix_role_trigger.sql` (solo si ya ejecutaste 007 antes y al asignar admin sale "No puedes cambiar tu rol")
     - `010_fix_stack_depth_rls.sql` (corrige "stack depth limit exceeded" al confirmar pago)
     - `011_calendario_vendedores_ver_todos.sql` (vendedores y admins ven el calendario completo)
     - `012_get_portal_user_id.sql` (RPC para vincular reservas con clientes del portal)
     - `013_update_lotes_valores.sql` (actualizar valores de lotes si ya tienes datos)
     - `014_servicios_cliente_user_id.sql` (columna y RLS para que cliente portal vea sus servicios)
     - `015_cedula_ya_registrada.sql` (RPC para validar cédula duplicada en registro)
     - `016_vinculacion_cliente_portal.sql` (vincula reservas y servicios existentes a usuarios portal)
     - `017_admin_vinculacion_cedula.sql` (RPC para admin vincular manualmente por cédula)
     - `019_fix_trigger_vinculacion.sql` (evita que el trigger de 3 servicios/día bloquee la vinculación)

4. **Configurar Auth en Supabase**
   - Authentication → Providers: Email habilitado
   - URLs de redirección: `http://localhost:5173` (y tu URL de producción)
   - Contraseña: Supabase puede exigir mayúscula, minúscula, número y símbolo (mín. 6 caracteres)

5. **Crear el primer admin (rol 666)**

   - En Supabase, crea un usuario (Authentication → Users) con el correo que usarás como admin y asigna una contraseña (ej. `contactoinfernal@yominohana.com`).
   - En SQL Editor, ejecuta:

   ```sql
   INSERT INTO public.user_profiles (user_id, rol)
   SELECT id, 666
   FROM auth.users
   WHERE email = 'contactoinfernal@yominohana.com'
   ON CONFLICT (user_id) DO UPDATE SET rol = 666;
   ```

   - A partir de ahí, ese usuario verá el panel completo (admin + Dashboard) y podrá crear vendedores.

   **Si sale "No puedes cambiar tu rol"** (porque ejecutaste `007_roles_portal.sql` antes de tener esta corrección): en SQL Editor ejecuta primero el archivo `db/009_fix_role_trigger.sql` y luego vuelve a ejecutar el `INSERT` de arriba.

## Scripts

- `npm run dev` – Desarrollo (puerto 5173)
- `npm run build` – Build de producción
- `npm run preview` – Vista previa del build

## Prueba manual (smoke test)

1. **Registro y login (admin y vendedor)**
   - Como admin (correo al que diste rol 666), entra a `/login` e inicia sesión.
   - En el menú verás **ADMIN** (lleva a `/admin`, panel con enlaces a Registrar vendedor y Dashboard). Ve a **Registrar vendedor** (`/registro`) y crea un vendedor: cédula, nombre, teléfono, correo, contraseña.
   - Cierra sesión, inicia sesión con el vendedor y comprueba que ve Dashboard, Funeraria y Cementerio.

2. **Ruta protegida y página inicial**
   - Cerrar sesión
   - Intentar acceder a `/dashboard` → redirige a **Inicio** (/) en lugar de Login
   - La app siempre abre en Inicio; el login es opcional desde el menú

3. **CRUD Clientes**
   - Login → Dashboard
   - Buscar cédula inexistente → registrar cliente
   - Crear cliente con cédula, nombre, teléfono, correo, departamento, ciudad
   - Buscar cliente por cédula
   - **Ver detalle** del cliente: datos, servicios funerarios y reservas cementerio (`/clientes/detalle/:id`)
   - Editar cliente (solo teléfono, correo, departamento, ciudad)

4. **Funeraria**
   - Buscar cliente activo
   - Agregar servicios: Rituales (1000), Ofrendas (5000), Sombras (10000)
   - Máximo 3 por día
   - Seleccionar fecha, hora (00:00 o 03:00), nombre del difunto
   - Método de pago: efectivo, tarjeta, con la vida (nombre condenado)
   - Confirmar pago → mensaje "Pago recibido. Alma condenada con éxito"
   - Si el cliente tiene cuenta en el portal (misma cédula), se vincula automáticamente
   - Ver calendario con servicios confirmados (Realtime)

5. **Cementerio + Test de la Sombra**
   - Buscar cliente
   - Responder pregunta de pecado → asignar lote
   - (Opcional) Cambio manual de lote (+$1.000.000)
   - Elegir “Con difunto” o “Sin difunto”
   - Responder el **Test de la Sombra** (7 preguntas A–G)
   - Elegir método de pago y confirmar
   - Ver en la tabla de reservas el `Resultado espiritual` (pecado dominante) y comprobar que el lote ya no se puede cambiar después del juicio.

6. **Portal cliente (rol 3)**
   - Cierra sesión.
   - En Login: "Regístrate como cliente" o ir a `/registro-cliente`. Registrar con cédula, correo y contraseña (mín. 6 caracteres: mayúscula, minúscula, número y símbolo).
   - Las ventas (Funeraria/Cementerio) se vinculan automáticamente si la cédula del cliente coincide.
   - Cierra sesión e inicia como cliente portal → redirección a `/mi-cementerio` (o desde el menú “MIS DIFUNTOS”).
   - **Mis Difuntos** muestra servicios funerarios y reservas. Si no ve nada, el admin vincula por cédula en Panel Admin.

7. **Panel Admin**
   - Registrar vendedor, Dashboard.
   - **Vincular cliente portal**: ingresa la cédula de un cliente que tiene servicios/reservas pero no los ve en "Mis Difuntos". Al vincular, el cliente podrá verlos al recargar.

8. **Reglas de negocio**
   - Intentar registrar cliente con cédula duplicada → error
   - Intentar más de 3 servicios funerarios por día → error
   - Cliente pasa a "verdugo" al contratar servicio

9. **Optimistic update**
   - Editar cliente → Guardar
   - Simular error (desconectar red) → rollback + toast

## Despliegue en Netlify

1. **Sube el proyecto a GitHub** (si no lo tienes):
   - Crea un repositorio en GitHub.
   - En la carpeta del proyecto ejecuta:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
     git push -u origin main
     ```

2. **Entra en Netlify**  
   - Ve a [netlify.com](https://www.netlify.com) e inicia sesión (puedes usar “Log in with GitHub”).

3. **Nuevo sitio desde Git**  
   - Click en **Add new site** → **Import an existing project**.  
   - Conecta **GitHub** y autoriza a Netlify.  
   - Elige el repositorio donde está `yomi-no-hana` (o el repo que tenga el proyecto).

4. **Configuración del build**  
   - **Branch to deploy**: `main` (o la rama que uses).  
   - **Base directory**: si el proyecto está en una subcarpeta, escribe `yomi-no-hana`. Si todo el repo es el proyecto, déjalo vacío.  
   - **Build command**: `npm run build`  
   - **Publish directory**: `dist`  
   - **Variables de entorno** (Importante):  
     - Click en **Add environment variables** / **Add variables** / **Options**.  
     - Añade:
       - `VITE_SUPABASE_URL` = `https://tu-proyecto.supabase.co`
       - `VITE_SUPABASE_ANON_KEY` = tu anon key de Supabase  

5. **Deploy**  
   - Click en **Deploy site**. Netlify instalará dependencias, ejecutará `npm run build` y publicará la carpeta `dist`.

6. **Supabase: URL de producción**  
   - En Supabase: **Authentication** → **URL Configuration**.  
   - En **Site URL** pon la URL de Netlify (ej. `https://tu-sitio.netlify.app`).  
   - En **Redirect URLs** agrega: `https://tu-sitio.netlify.app/**`  
   Así el login y el registro funcionarán en producción.

**Checklist rápido después del deploy:**
- [ ] La app carga en la URL de Netlify.
- [ ] Login y registro funcionan (Supabase Auth con la URL de producción).
- [ ] Dashboard, Funeraria y Cementerio se ven al estar logueado.
- [ ] No aparece `service_role` ni ninguna key secreta en el código ni en Netlify (solo `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`).

## Resumen de cambios

- **Página inicial**: la app abre en Inicio (`/`). Rutas protegidas sin sesión redirigen a Inicio (no a Login).
- **Login**: enlace "Regístrate como cliente" además de vendedor. Redirección según rol: cliente → `/mi-cementerio`, vendedor/admin → `/dashboard`.
- **Registro cliente**: validación de contraseña (mayúscula, minúscula, número, símbolo), verificación de cédula duplicada, mensaje si correo ya tiene cuenta.
- **Detalle del cliente** (`/clientes/detalle/:id`): Admin/Vendedor ven datos del cliente, sus servicios funerarios y reservas cementerio.
- **Mis Difuntos**: el cliente portal ve servicios funerarios y reservas (solo lectura). Vinculación automática si la cédula coincide; si no, Admin puede vincular desde el panel.
- **Panel Admin**: sección "Vincular cliente portal" para vincular manualmente por cédula.
- **Scripts db/**: 014 (cliente_user_id en servicios), 015 (cedula_ya_registrada), 016 (vinculación masiva), 017 (RPC vinculación admin), 018 (diagnóstico), 019 (fix trigger vinculación).

## Estructura

- `db/` – SQL: tablas, RLS, triggers, realtime
- `src/` – React, páginas, contextos, componentes

**Rutas y menú:** `App.jsx` define las rutas. Protección con `RoleRoute`:
- `/` – Inicio (público, página de aterrizaje)
- `/login` – Iniciar sesión
- `/registro` – Registrar vendedor (solo admin)
- `/registro-cliente` – Registrar cliente portal (público)
- `/dashboard` – Panel vendedor (rol 2, 666)
- `/admin` – Panel admin con vinculación de clientes (solo 666)
- `/funeraria`, `/cementerio` – Venta (rol 2, 666)
- `/mi-cementerio` – Mis Difuntos: servicios y reservas del cliente (rol 3)
- `/clientes/nuevo`, `/clientes/editar/:id`, `/clientes/detalle/:id` – CRUD y detalle de clientes

**Scripts de diagnóstico:** `018_diagnostico_vinculacion.sql` – consultas para revisar servicios sin vincular y cédulas en portal.