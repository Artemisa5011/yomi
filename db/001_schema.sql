-- ============================================
-- YOMI NO HANA - Esquema de base de datos
-- ============================================
-- Ejecutar en Supabase SQL Editor (en orden)

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: empleados (vendedores)
-- ============================================
CREATE TABLE empleados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  cedula VARCHAR(20) NOT NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  correo VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_empleados_cedula ON empleados(cedula);
CREATE INDEX idx_empleados_user_id ON empleados(user_id);

-- ============================================
-- TABLA: clientes
-- ============================================
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cedula VARCHAR(20) NOT NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  correo VARCHAR(255),
  departamento VARCHAR(100),
  ciudad VARCHAR(100),
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'verdugo')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cedula)
);

CREATE INDEX idx_clientes_user_id ON clientes(user_id);
CREATE UNIQUE INDEX idx_clientes_cedula_per_user ON clientes(user_id, cedula);

-- Regla de negocio DB: No duplicar cédula por usuario (UNIQUE ya lo garantiza)

-- ============================================
-- TABLA: lotes (catálogo cementerio)
-- ============================================
CREATE TABLE lotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  capacidad_total INT NOT NULL CHECK (capacidad_total > 0),
  capacidad_ocupada INT DEFAULT 0 CHECK (capacidad_ocupada >= 0),
  valor DECIMAL(12,2) NOT NULL
);

-- Lotes según especificación
INSERT INTO lotes (codigo, nombre, capacidad_total, valor) VALUES
  ('LUJURIA_10', 'LUJURIA', 10, 200),
  ('GULA_30', 'GULA', 30, 210),
  ('AVARICIA_12', 'AVARICIA', 12, 300),
  ('PEREZA_15', 'PEREZA', 15, 500),
  ('IRA_50', 'IRA', 50, 800),
  ('ENVIDIA_80', 'ENVIDIA', 80, 32),
  ('IRA_2', 'IRA', 2, 800),
  ('SOBERBIA_21', 'SOBERBIA', 21, 420),
  ('IRA_35', 'IRA', 35, 800),
  ('ALMAS_INOCENTES_50', 'ALMAS INOCENTES', 50, 10000);

-- ============================================
-- TABLA: servicios_funerarios (Rituales, Ofrendas, Sombras)
-- ============================================
CREATE TABLE servicios_funerarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ritual', 'ofrenda', 'sombra')),
  nombre_difunto VARCHAR(255),
  hora VARCHAR(20) CHECK (hora IN ('00:00', '03:00')),
  fecha DATE NOT NULL,
  estado_pago VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'confirmado')),
  metodo_pago VARCHAR(20),
  nombre_condenado VARCHAR(255),
  valor DECIMAL(12,2) NOT NULL,
  valor_total DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_servicios_funerarios_cliente ON servicios_funerarios(cliente_id);
CREATE INDEX idx_servicios_funerarios_user ON servicios_funerarios(user_id);
CREATE INDEX idx_servicios_funerarios_fecha ON servicios_funerarios(fecha);

-- Regla: max 3 servicios por cliente por día (trigger)
CREATE OR REPLACE FUNCTION fn_max_servicios_por_dia()
RETURNS TRIGGER AS $$
DECLARE
  cuenta INT;
BEGIN
  SELECT COUNT(*) INTO cuenta
  FROM servicios_funerarios
  WHERE cliente_id = NEW.cliente_id
    AND fecha = NEW.fecha
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  IF cuenta >= 3 THEN
    RAISE EXCEPTION 'Un cliente puede contratar máximo 3 servicios por día.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_max_servicios_por_dia
  BEFORE INSERT OR UPDATE ON servicios_funerarios
  FOR EACH ROW
  EXECUTE PROCEDURE fn_max_servicios_por_dia();

-- ============================================
-- TABLA: reservas_cementerio
-- ============================================
CREATE TABLE reservas_cementerio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  lote_id UUID NOT NULL REFERENCES lotes(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  estado VARCHAR(30) DEFAULT 'asignado' CHECK (estado IN ('asignado', 'reservado_sin_difunto', 'reservado_con_difunto', 'ocupado')),
  nombre_difunto VARCHAR(255),
  cambio_manual BOOLEAN DEFAULT FALSE,
  metodo_pago VARCHAR(20) CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'con_la_vida')),
  nombre_condenado VARCHAR(255),
  valor_base DECIMAL(12,2) NOT NULL,
  valor_adicional DECIMAL(12,2) DEFAULT 0,
  valor_total DECIMAL(12,2),
  estado_pago VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'confirmado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reservas_cliente ON reservas_cementerio(cliente_id);
CREATE INDEX idx_reservas_lote ON reservas_cementerio(lote_id);
CREATE INDEX idx_reservas_user ON reservas_cementerio(user_id);

-- Trigger: al confirmar pago, descontar capacidad del lote
CREATE OR REPLACE FUNCTION fn_confirmar_reserva_cementerio()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado_pago = 'confirmado' AND (OLD IS NULL OR OLD.estado_pago != 'confirmado') THEN
    UPDATE lotes
    SET capacidad_ocupada = capacidad_ocupada + 1
    WHERE id = NEW.lote_id
      AND capacidad_ocupada < capacidad_total;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'No hay capacidad disponible en el lote.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_confirmar_reserva_cementerio
  BEFORE INSERT OR UPDATE ON reservas_cementerio
  FOR EACH ROW
  EXECUTE PROCEDURE fn_confirmar_reserva_cementerio();
