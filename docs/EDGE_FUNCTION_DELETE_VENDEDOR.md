# ⸸ Edge Function: Eliminar vendedor por completo ⸸

Guía de la función `delete-vendedor-auth` que elimina la cuenta de Auth de un vendedor (sin ventas), liberando el correo para reutilizarlo.

---

## ¿Qué hace la función?

1. **Valida** que el solicitante sea admin (rol 666).
2. **Elimina** el usuario de Auth (`auth.admin.deleteUser`).
3. El **CASCADE** de la base de datos borra:
   - Fila en `empleados`
   - Fila en `user_profiles`

El correo queda liberado para usarse de nuevo (ej. como cliente portal).

---

## Despliegue

```bash
npm run supabase:login   # Una sola vez
npm run supabase:link   # Una sola vez, vincula al proyecto
npm run supabase:deploy # Sube la función
```

El script de deploy usa `--no-verify-jwt` para evitar 401 del gateway (ver sección siguiente).

---

## Por qué `--no-verify-jwt` (solución al 401)

**Problema:** El gateway de Supabase valida el JWT antes de entregar la petición a la función. Si esa validación falla, devuelve **401 Unauthorized** y la función no se ejecuta.

**Solución:** Desplegar con `--no-verify-jwt`:

```bash
npx supabase functions deploy delete-vendedor-auth --no-verify-jwt
```

Así la petición llega a la función, que hace su propia validación:
- Revisa el header `Authorization`
- Llama a `getUser()` para validar la sesión
- Comprueba que el usuario tenga rol 666

La seguridad se mantiene dentro de la función.

---

## Mensajes de error (frontend)

El cliente lee el body de la respuesta y muestra el mensaje real de la función:

| Mensaje | Causa |
|---------|-------|
| Falta Authorization | No se envió el token en el header |
| Sesión inválida | JWT expirado o inválido |
| Solo admin puede eliminar vendedores | Usuario no tiene rol 666 |
| Falta user_id | Body mal formado |
| Error al eliminar usuario | Fallo en `auth.admin.deleteUser` |

---

## Cómo verificar la eliminación en Supabase

### 1. Authentication → Users

- **Authentication** → **Users**
- Busca por correo o UUID del vendedor eliminado
- No debe aparecer en la lista

### 2. Table Editor → empleados

- **Table Editor** → tabla **empleados**
- Busca la fila del vendedor (nombre, cédula, correo)
- No debe existir

### 3. Table Editor → user_profiles

- **Table Editor** → tabla **user_profiles**
- Busca el perfil del usuario eliminado
- No debe existir

### 4. SQL Editor (opcional)

```sql
-- Listar empleados actuales
SELECT id, nombre_completo, correo, user_id, estado 
FROM empleados 
ORDER BY nombre_completo;

-- Buscar un empleado por user_id
SELECT * FROM empleados WHERE user_id = 'uuid-del-vendedor';
```

---

## Troubleshooting

| Síntoma | Acción |
|---------|--------|
| 401 en logs de la función | Redesplegar con `--no-verify-jwt` |
| "Falta Authorization" | Comprobar sesión: cerrar e iniciar sesión como admin |
| "Solo admin puede eliminar" | Comprobar rol 666 en `user_profiles` (script `025_fix_admin_rol_666.sql`) |
| "Error al eliminar usuario" | Revisar logs de la función; puede ser que el usuario ya no exista |
| Botón Eliminar no aparece | El vendedor tiene ventas; usar Desactivar en su lugar |

---

## Archivos relacionados

| Archivo | Descripción |
|---------|-------------|
| `supabase/functions/delete-vendedor-auth/index.ts` | Código de la función |
| `src/api/empleadosApi.js` | `deleteVendedorCompleto()` – invoca la función y maneja errores |
| `src/pages/Admin.jsx` | Botón Eliminar con optimistic update |
| `package.json` | Script `supabase:deploy` con `--no-verify-jwt` |
