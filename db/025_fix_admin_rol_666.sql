-- Corregir rol del admin si aparece bloqueado ("Cuenta desactivada")
-- Ejecutar en Supabase → SQL Editor
-- Reemplaza el email por el de tu admin

UPDATE public.user_profiles
SET rol = 666
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'contactoinfernal@yominohana.com');

-- Si no existía fila (por ejemplo usuario nuevo), créala:
INSERT INTO public.user_profiles (user_id, rol)
SELECT id, 666
FROM auth.users
WHERE email = 'contactoinfernal@yominohana.com'
ON CONFLICT (user_id) DO UPDATE SET rol = 666;
