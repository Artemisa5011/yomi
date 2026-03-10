-- Actualizar valores y capacidades de lotes según especificación
-- Ejecutar en Supabase SQL Editor (para corregir datos ya insertados)

UPDATE lotes SET capacidad_total = 100,  valor = 200000  WHERE codigo = 'LUJURIA_10';
UPDATE lotes SET capacidad_total = 300,  valor = 210000  WHERE codigo = 'GULA_30';
UPDATE lotes SET capacidad_total = 120,  valor = 300000  WHERE codigo = 'AVARICIA_12';
UPDATE lotes SET capacidad_total = 150,  valor = 500000  WHERE codigo = 'PEREZA_15';
UPDATE lotes SET capacidad_total = 500,  valor = 800000  WHERE codigo = 'IRA_50';
UPDATE lotes SET capacidad_total = 800,  valor = 320000  WHERE codigo = 'ENVIDIA_80';
UPDATE lotes SET capacidad_total = 210,  valor = 420000  WHERE codigo = 'SOBERBIA_21';
UPDATE lotes SET capacidad_total = 1500, valor = 500000  WHERE codigo = 'ALMAS_INOCENTES_50';

-- Si tienes IRA_2 e IRA_35 (versión anterior), actualízalos o elimínalos:
-- UPDATE lotes SET valor = 800000 WHERE codigo IN ('IRA_2', 'IRA_35');
-- O para eliminarlos: DELETE FROM lotes WHERE codigo IN ('IRA_2', 'IRA_35');
