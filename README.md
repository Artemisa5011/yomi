# ⸸ Yomi No Hana - Templo Fúnebre ⸸

Aplicación web para gestión de servicios fúnebres y cementerio. React + Vite + Tailwind + Supabase. 
NOTA: 
La pagina es SPA - Single Page Applications Permite cambiar entre diferentes vistas o páginas sin recargar el navegador, actualizando la URL de forma dinámica y renderizando componentes específicos según la ruta

## Requisitos

- Node.js 18+
- Cuenta Supabase

## Setup

1. **Clonar e instalar dependencias**
   ```bash
   cd yomi-app
   npm install
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

4. **Configurar Auth en Supabase**
   - Authentication → Providers: Email habilitado
   - URLs de redirección: `http://localhost:5173` (y tu URL de producción)

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

2. **Ruta protegida**
   - Cerrar sesión
   - Intentar acceder a `/dashboard` → redirige a `/login`

3. **CRUD Clientes**
   - Login → Dashboard
   - Buscar cédula inexistente → registrar cliente
   - Crear cliente con cédula, nombre, teléfono, correo, departamento, ciudad
   - Buscar cliente por cédula
   - Editar cliente (solo teléfono, correo, departamento, ciudad)

4. **Funeraria**
   - Buscar cliente activo
   - Agregar servicios: Rituales (1000), Ofrendas (5000), Sombras (10000)
   - Máximo 3 por día
   - Seleccionar fecha, hora (00:00 o 03:00), nombre del difunto
   - Método de pago: efectivo, tarjeta, con la vida (nombre condenado)
   - Confirmar pago → mensaje "Pago recibido. Alma condenada con éxito"
   - Ver calendario con servicios confirmados (Realtime)

5. **Cementerio + Test de la Sombra**
   - Buscar cliente
   - Responder preguntas de pecado/presupuesto → asignar lote
   - (Opcional) Cambio manual de lote (+$1.000.000)
   - Elegir “Con difunto” o “Sin difunto”
   - Responder el **Test de la Sombra** (7 preguntas A–G)
   - Elegir método de pago y confirmar
   - Ver en la tabla de reservas el `Resultado espiritual` (pecado dominante) y comprobar que el lote ya no se puede cambiar después del juicio.

6. **Portal cliente (rol 3)**
   - Cierra sesión.
   - Ir a `/registro-cliente` y registrar un cliente con cédula y correo.
   - Vuelve a entrar como vendedor, crea una reserva de cementerio para un cliente cuya cédula coincida con la del cliente portal (así se vincula `cliente_user_id`).
   - Cierra sesión e inicia como cliente portal → ve `/mi-cementerio` (o desde el menú “MIS DIFUNTOS”).
   - Debe ver solo sus reservas, estado del lote, estado de pago y el **resultado espiritual** de cada difunto.

7. **Reglas de negocio**
   - Intentar registrar cliente con cédula duplicada → error
   - Intentar más de 3 servicios funerarios por día → error
   - Cliente pasa a "verdugo" al contratar servicio

8. **Optimistic update**
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
   - Elige el repositorio donde está `yomi-app` (o el repo que tenga el proyecto).

4. **Configuración del build**  
   - **Branch to deploy**: `main` (o la rama que uses).  
   - **Base directory**: si el proyecto está en una subcarpeta, escribe `yomi-app`. Si todo el repo es el proyecto, déjalo vacío.  
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

## Estructura

- `db/` – SQL: tablas, RLS, triggers, realtime
- `src/` – React, páginas, contextos, componentes

**Rutas y menú:** Todas las rutas del menú están conectadas en `App.jsx`. La protección se hace solo con `RoleRoute` (no se usa `ProtectedRoute`): `/` (Inicio), `/login`, `/registro` (solo admin), `/registro-cliente` (público), `/dashboard`, `/admin` (solo admin), `/funeraria`, `/cementerio`, `/mi-cementerio` (solo cliente portal), `/clientes/nuevo`, `/clientes/editar/:id`.