-- infra/supabase.sql
-- Schema para Gemelli IT - Inventario & HelpDesk

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== ENUMS ====================

CREATE TYPE user_role AS ENUM ('DOCENTE', 'ADMINISTRATIVO', 'TI', 'DIRECTOR', 'LIDER_TI');
CREATE TYPE device_type AS ENUM ('PC', 'LAPTOP', 'IMPRESORA', 'RED', 'OTRO');
CREATE TYPE device_status AS ENUM ('ACTIVO', 'REPARACIÓN', 'RETIRADO');
CREATE TYPE log_type AS ENUM ('ASIGNACION', 'MANTENIMIENTO', 'REPARACION', 'BACKUP', 'OTRO');
CREATE TYPE backup_type AS ENUM ('INCREMENTAL', 'COMPLETA', 'DIFERENCIAL');
CREATE TYPE storage_type AS ENUM ('NUBE', 'LOCAL', 'HIBRIDO');
CREATE TYPE ticket_priority AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');
CREATE TYPE ticket_status AS ENUM ('ABIERTO', 'EN_PROCESO', 'RESUELTO', 'CERRADO');

-- ==================== TABLES ====================

-- Unidades Organizacionales
CREATE TABLE org_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    rol user_role NOT NULL DEFAULT 'DOCENTE',
    org_unit_id UUID REFERENCES org_units(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dispositivos
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(200) NOT NULL,
    tipo device_type NOT NULL,
    estado device_status NOT NULL DEFAULT 'ACTIVO',
    org_unit_id UUID REFERENCES org_units(id) ON DELETE CASCADE,
    usuario_actual_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ubicacion VARCHAR(300),
    imagen TEXT,
    serial VARCHAR(200),
    marca VARCHAR(100),
    modelo VARCHAR(100),
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    fecha_garantia DATE,
    notas TEXT,
    creado_por UUID REFERENCES users(id) ON DELETE SET NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Especificaciones de Dispositivos
CREATE TABLE device_specs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    cpu VARCHAR(200),
    ram VARCHAR(100),
    disco VARCHAR(100),
    os VARCHAR(100),
    licencias JSONB,
    red JSONB,
    perifericos JSONB,
    otros JSONB,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(device_id)
);

-- Logs de Dispositivos (Historial)
CREATE TABLE device_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    tipo log_type NOT NULL,
    descripcion TEXT NOT NULL,
    realizado_por UUID REFERENCES users(id) ON DELETE SET NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backups
CREATE TABLE backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    tipo backup_type NOT NULL,
    almacenamiento storage_type NOT NULL,
    frecuencia VARCHAR(100),
    proximo_backup DATE,
    fecha_backup TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    exitoso BOOLEAN DEFAULT TRUE,
    tamanio_mb NUMERIC(10, 2),
    evidencia_url TEXT,
    notas TEXT,
    realizado_por UUID REFERENCES users(id) ON DELETE SET NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets (HelpDesk)
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(300) NOT NULL,
    descripcion TEXT NOT NULL,
    prioridad ticket_priority NOT NULL DEFAULT 'MEDIA',
    estado ticket_status NOT NULL DEFAULT 'ABIERTO',
    org_unit_id UUID REFERENCES org_units(id) ON DELETE CASCADE,
    solicitante_id UUID REFERENCES users(id) ON DELETE SET NULL,
    asignado_a UUID REFERENCES users(id) ON DELETE SET NULL,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_asignacion TIMESTAMP WITH TIME ZONE,
    fecha_resolucion TIMESTAMP WITH TIME ZONE,
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    tiempo_respuesta_minutos INTEGER,
    tiempo_resolucion_minutos INTEGER
);

-- Comentarios de Tickets
CREATE TABLE ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES users(id) ON DELETE SET NULL,
    comentario TEXT NOT NULL,
    adjunto_url TEXT,
    es_sistema BOOLEAN DEFAULT FALSE,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auditoría con Cadena de Hash (reemplazo de blockchain)
CREATE TABLE audit_chain (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hash VARCHAR(64) NOT NULL UNIQUE,
    content_hash VARCHAR(64) NOT NULL,
    previous_hash VARCHAR(64) NOT NULL,
    signature VARCHAR(64) NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    block_number BIGINT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Archivos Adjuntos
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(300) NOT NULL,
    tipo_mime VARCHAR(100),
    tamanio_bytes BIGINT,
    url TEXT NOT NULL,
    entidad_tipo VARCHAR(50),
    entidad_id UUID,
    subido_por UUID REFERENCES users(id) ON DELETE SET NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== INDEXES ====================

CREATE INDEX idx_devices_org_unit ON devices(org_unit_id);
CREATE INDEX idx_devices_estado ON devices(estado);
CREATE INDEX idx_devices_usuario ON devices(usuario_actual_id);
CREATE INDEX idx_device_logs_device ON device_logs(device_id);
CREATE INDEX idx_device_logs_fecha ON device_logs(fecha DESC);
CREATE INDEX idx_backups_device ON backups(device_id);
CREATE INDEX idx_backups_fecha ON backups(fecha_backup DESC);
CREATE INDEX idx_tickets_org_unit ON tickets(org_unit_id);
CREATE INDEX idx_tickets_solicitante ON tickets(solicitante_id);
CREATE INDEX idx_tickets_asignado ON tickets(asignado_a);
CREATE INDEX idx_tickets_estado ON tickets(estado);
CREATE INDEX idx_tickets_fecha ON tickets(fecha_creacion DESC);
CREATE INDEX idx_ticket_comments_ticket ON ticket_comments(ticket_id);
CREATE INDEX idx_audit_chain_entity ON audit_chain(entity_id);
CREATE INDEX idx_audit_chain_hash ON audit_chain(hash);

-- ==================== ROW LEVEL SECURITY (RLS) ====================

-- Habilitar RLS en todas las tablas
ALTER TABLE org_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_chain ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Políticas para USERS
CREATE POLICY "Los usuarios pueden ver su propio perfil"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden ver otros usuarios de su org_unit"
    ON users FOR SELECT
    USING (org_unit_id IN (
        SELECT org_unit_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Solo LIDER_TI puede actualizar usuarios"
    ON users FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol = 'LIDER_TI'
        )
    );

-- Políticas para DEVICES
CREATE POLICY "Los usuarios ven dispositivos de su org_unit"
    ON devices FOR SELECT
    USING (
        org_unit_id IN (
            SELECT org_unit_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Solo TI y LIDER_TI pueden crear dispositivos"
    ON devices FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol IN ('TI', 'LIDER_TI')
        )
    );

CREATE POLICY "Solo TI y LIDER_TI pueden actualizar dispositivos"
    ON devices FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol IN ('TI', 'LIDER_TI')
        )
        AND org_unit_id IN (
            SELECT org_unit_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Solo LIDER_TI puede eliminar dispositivos"
    ON devices FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol = 'LIDER_TI'
        )
    );

-- Políticas para DEVICE_SPECS
CREATE POLICY "Los usuarios ven specs de dispositivos de su org_unit"
    ON device_specs FOR SELECT
    USING (
        device_id IN (
            SELECT id FROM devices WHERE org_unit_id IN (
                SELECT org_unit_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Solo TI puede modificar specs"
    ON device_specs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol IN ('TI', 'LIDER_TI')
        )
    );

-- Políticas para DEVICE_LOGS
CREATE POLICY "Los usuarios ven logs de su org_unit"
    ON device_logs FOR SELECT
    USING (
        device_id IN (
            SELECT id FROM devices WHERE org_unit_id IN (
                SELECT org_unit_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Solo TI puede crear logs"
    ON device_logs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol IN ('TI', 'LIDER_TI')
        )
    );

-- Políticas para BACKUPS
CREATE POLICY "Los usuarios ven backups de su org_unit"
    ON backups FOR SELECT
    USING (
        device_id IN (
            SELECT id FROM devices WHERE org_unit_id IN (
                SELECT org_unit_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Solo TI puede gestionar backups"
    ON backups FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol IN ('TI', 'LIDER_TI')
        )
    );

-- Políticas para TICKETS
CREATE POLICY "Los usuarios ven sus propios tickets"
    ON tickets FOR SELECT
    USING (
        solicitante_id = auth.uid()
        OR asignado_a = auth.uid()
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol IN ('TI', 'LIDER_TI', 'DIRECTOR')
        )
    );

CREATE POLICY "Todos los usuarios pueden crear tickets"
    ON tickets FOR INSERT
    WITH CHECK (
        solicitante_id = auth.uid()
    );

CREATE POLICY "Solo TI puede actualizar tickets"
    ON tickets FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol IN ('TI', 'LIDER_TI')
        )
    );

-- Políticas para TICKET_COMMENTS
CREATE POLICY "Los usuarios ven comentarios de tickets que pueden ver"
    ON ticket_comments FOR SELECT
    USING (
        ticket_id IN (
            SELECT id FROM tickets WHERE 
            solicitante_id = auth.uid()
            OR asignado_a = auth.uid()
            OR EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() AND rol IN ('TI', 'LIDER_TI', 'DIRECTOR')
            )
        )
    );

CREATE POLICY "Los usuarios pueden comentar en sus tickets"
    ON ticket_comments FOR INSERT
    WITH CHECK (
        ticket_id IN (
            SELECT id FROM tickets WHERE 
            solicitante_id = auth.uid()
            OR asignado_a = auth.uid()
            OR EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() AND rol IN ('TI', 'LIDER_TI')
            )
        )
    );

-- Políticas para AUDIT_CHAIN
CREATE POLICY "Todos pueden ver registros de auditoría"
    ON audit_chain FOR SELECT
    USING (true);

CREATE POLICY "Solo el sistema puede insertar en audit_chain"
    ON audit_chain FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol IN ('TI', 'LIDER_TI')
        )
    );

-- Políticas para ATTACHMENTS
CREATE POLICY "Los usuarios ven attachments relacionados a recursos que pueden ver"
    ON attachments FOR SELECT
    USING (true);

CREATE POLICY "Los usuarios pueden subir attachments"
    ON attachments FOR INSERT
    WITH CHECK (subido_por = auth.uid());
