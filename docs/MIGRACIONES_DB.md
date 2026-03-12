# ⸸ Migraciones de base de datos – Yomi No Hana ⸸

Orden de ejecución en Supabase SQL Editor. Ejecutar en el orden indicado.

## Orden obligatorio

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | `001_schema.sql` | Tablas: empleados, clientes, lotes, servicios_funerarios, reservas_cementerio |
| 2 | `002_rls.sql` | Políticas RLS por user_id |
| 3 | `003_realtime.sql` | Suscripción Realtime |
| 4 | `004_reglas_negocio.sql` | Reglas de negocio y constraints |
| 5 | `005_hora_24h.sql` | Formato hora 24h en servicios |
| 6 | `006_valor_total.sql` | Campo valor_total |
| 7 | `007_roles_portal.sql` | user_profiles, roles 666/2/3, portal cliente |
| 8 | `008_test_sombra.sql` | Test de la Sombra, resultado espiritual |
| 9 | `009_fix_role_trigger.sql` | Solo si ya ejecutaste 007 y falla "No puedes cambiar tu rol" |
| 10 | `010_fix_stack_depth_rls.sql` | Corrige "stack depth limit exceeded" |
| 11 | `011_calendario_vendedores_ver_todos.sql` | Vendedores ven calendario completo |
| 12 | `012_get_portal_user_id.sql` | RPC vincular reservas con clientes portal |
| 13 | `013_update_lotes_valores.sql` | Actualizar valores de lotes (opcional) |
| 14 | `014_servicios_cliente_user_id.sql` | Cliente portal ve sus servicios |
| 15 | `015_cedula_ya_registrada.sql` | RPC validar cédula duplicada |
| 16 | `016_vinculacion_cliente_portal.sql` | Vinculación masiva existente |
| 17 | `017_admin_vinculacion_cedula.sql` | RPC admin vincular por cédula |
| 18 | `019_fix_trigger_vinculacion.sql` | Evita bloqueo trigger al vincular |

## Migraciones adicionales (características nuevas)

| # | Archivo | Descripción |
|---|---------|-------------|
| 19 | `020_restrict_delete_cliente_con_servicios.sql` | No eliminar cliente con servicios/reservas (ON DELETE RESTRICT) |
| 20 | `021_get_display_name.sql` | RPC: nombre para mostrar en header (admin/vendedor/cliente) |
| 21 | `022_crear_empleado_desde_auth.sql` | Script diagnóstico: crear empleado para usuario sin registro |
| 22 | `023_crear_empleado_admin_rpc.sql` | RPC: admin crea empleado al registrar vendedor |
| 23 | `024_empleados_estado_inactivo.sql` | Columna estado (activo/inactivo) en empleados |
| 24 | `029_solicitudes_contacto.sql` | Tabla solicitudes de contacto (formulario Inicio), RLS, RPC admin |

## Scripts de diagnóstico y corrección (no migraciones)

| Archivo | Uso |
|---------|-----|
| `018_diagnostico_vinculacion.sql` | Consultas para revisar servicios sin vincular |
| `025_fix_admin_rol_666.sql` | Corregir rol admin si aparece "Cuenta desactivada" |
| `026_crear_empleado_faltante.sql` | Crear empleado para UN vendedor específico (reemplazar placeholders) |
| `027_crear_empleados_para_vendedores_existentes.sql` | Crear empleados para vendedores (rol 2) sin fila en `empleados` |
| `028_actualizar_empleados_desde_metadata.sql` | Actualizar empleados con datos reales desde `raw_user_meta_data` |

## Notas

- **022**: Solo ejecutar si un usuario tiene cuenta en auth pero no aparece en `empleados` (diagnóstico y corrección).
- Los scripts 020–024 son independientes y pueden ejecutarse en cualquier orden después del 019.
- **025–028**: Scripts de corrección puntual. Solo ejecutar si hace falta.

## Ver también

- **Edge Function delete-vendedor-auth**: Para eliminar vendedores por completo (cuenta auth + empleado + user_profile), ver `EDGE_FUNCTION_DELETE_VENDEDOR.md`.
