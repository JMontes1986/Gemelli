-- infra/seed.sql
-- Datos iniciales para Gemelli IT

-- ==================== UNIDADES ORGANIZACIONALES ====================

INSERT INTO org_units (id, nombre, descripcion) VALUES
('11111111-1111-1111-1111-111111111111', 'Colegio', 'Área educativa y docente'),
('22222222-2222-2222-2222-222222222222', 'Administración', 'Área administrativa y directiva');

-- ==================== USUARIOS ====================

-- Primero, necesitas crear estos usuarios en Supabase Auth manualmente o via API
-- Aquí solo insertamos los datos complementarios

-- LIDER_TI
INSERT INTO users (id, nombre, email, rol, org_unit_id) VALUES
('33333333-3333-3333-3333-333333333333', 'Carlos Mendoza', 'admin@gemelli.edu.co', 'LIDER_TI', '22222222-2222-2222-2222-222222222222');

-- Técnicos TI
INSERT INTO users (id, nombre, email, rol, org_unit_id) VALUES
('44444444-4444-4444-4444-444444444444', 'Ana López', 'ana.lopez@gemelli.edu.co', 'TI', '22222222-2222-2222-2222-222222222222'),
('55555555-5555-5555-5555-555555555555', 'Diego Ramírez', 'diego.ramirez@gemelli.edu.co', 'TI', '11111111-1111-1111-1111-111111111111');

-- Docentes
INSERT INTO users (id, nombre, email, rol, org_unit_id) VALUES
('66666666-6666-6666-6666-666666666666', 'María García', 'maria.garcia@gemelli.edu.co', 'DOCENTE', '11111111-1111-1111-1111-111111111111'),
('77777777-7777-7777-7777-777777777777', 'Carlos Pérez', 'carlos.perez@gemelli.edu.co', 'DOCENTE', '11111111-1111-1111-1111-111111111111'),
('88888888-8888-8888-8888-888888888888', 'Ana Martínez', 'ana.martinez@gemelli.edu.co', 'DOCENTE', '11111111-1111-1111-1111-111111111111');

-- Administrativos
INSERT INTO users (id, nombre, email, rol, org_unit_id) VALUES
('99999999-9999-9999-9999-999999999999', 'Luis Rodríguez', 'luis.rodriguez@gemelli.edu.co', 'ADMINISTRATIVO', '22222222-2222-2222-2222-222222222222'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Patricia Silva', 'patricia.silva@gemelli.edu.co', 'ADMINISTRATIVO', '22222222-2222-2222-2222-222222222222');

-- Director
INSERT INTO users (id, nombre, email, rol, org_unit_id) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Roberto Gómez', 'director@gemelli.edu.co', 'DIRECTOR', '22222222-2222-2222-2222-222222222222');

-- ==================== DISPOSITIVOS ====================

-- PCs de Administración
INSERT INTO devices (id, nombre, tipo, estado, org_unit_id, usuario_actual_id, ubicacion, serial, marca, modelo, fecha_ingreso, fecha_garantia) VALUES
('d1111111-1111-1111-1111-111111111111', 'PC-ADM-001', 'PC', 'ACTIVO', '22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999', 'Administración - Oficina 201', 'SN2024ADM001', 'Dell', 'OptiPlex 7090', '2024-01-15', '2027-01-15'),
('d2222222-2222-2222-2222-222222222222', 'PC-ADM-002', 'PC', 'ACTIVO', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Administración - Oficina 203', 'SN2024ADM002', 'HP', 'ProDesk 600 G6', '2024-01-15', '2027-01-15');

-- Laptops de Docentes
INSERT INTO devices (id, nombre, tipo, estado, org_unit_id, usuario_actual_id, ubicacion, serial, marca, modelo, fecha_ingreso, fecha_garantia) VALUES
('d3333333-3333-3333-3333-333333333333', 'LPT-DOC-001', 'LAPTOP', 'ACTIVO', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'Sala de Profesores', 'SN2023LPT001', 'Lenovo', 'ThinkPad E14', '2023-08-20', '2026-08-20'),
('d4444444-4444-4444-4444-444444444444', 'LPT-DOC-002', 'LAPTOP', 'ACTIVO', '11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 'Sala de Profesores', 'SN2023LPT002', 'Lenovo', 'ThinkPad E14', '2023-08-20', '2026-08-20'),
('d5555555-5555-5555-5555-555555555555', 'LPT-DOC-003', 'LAPTOP', 'REPARACIÓN', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888', 'Mantenimiento TI', 'SN2022LPT003', 'HP', 'EliteBook 840', '2022-05-10', '2025-05-10');

-- Impresoras
INSERT INTO devices (id, nombre, tipo, estado, org_unit_id, ubicacion, serial, marca, modelo, fecha_ingreso, fecha_garantia) VALUES
('d6666666-6666-6666-6666-666666666666', 'IMP-ADM-001', 'IMPRESORA', 'ACTIVO', '22222222-2222-2222-2222-222222222222', 'Administración - Pasillo Principal', 'SN2023IMP001', 'HP', 'LaserJet Pro M404dn', '2023-03-12', '2026-03-12'),
('d7777777-7777-7777-7777-777777777777', 'IMP-COL-001', 'IMPRESORA', 'ACTIVO', '11111111-1111-1111-1111-111111111111', 'Colegio - Sala de Profesores', 'SN2023IMP002', 'Epson', 'EcoTank L3250', '2023-03-15', '2025-03-15');

-- Equipos de Red
INSERT INTO devices (id, nombre, tipo, estado, org_unit_id, ubicacion, serial, marca, modelo, fecha_ingreso, notas) VALUES
('d8888888-8888-8888-8888-888888888888', 'SWITCH-CORE-01', 'RED', 'ACTIVO', '22222222-2222-2222-2222-222222222222', 'Cuarto de Telecomunicaciones', 'SN2024NET001', 'Cisco', 'Catalyst 2960-X', '2024-02-01', 'Switch principal del colegio - 48 puertos');

-- ==================== ESPECIFICACIONES ====================

INSERT INTO device_specs (device_id, cpu, ram, disco, os, licencias) VALUES
('d1111111-1111-1111-1111-111111111111', 'Intel Core i5-11400', '16GB DDR4', '512GB SSD NVMe', 'Windows 11 Pro', 
    '{"windows": "OEM", "office": "Microsoft 365 E3", "antivirus": "Windows Defender"}'::jsonb),
('d2222222-2222-2222-2222-222222222222', 'Intel Core i5-10500', '16GB DDR4', '256GB SSD + 1TB HDD', 'Windows 11 Pro',
    '{"windows": "OEM", "office": "Microsoft 365 E3", "antivirus": "Windows Defender"}'::jsonb),
('d3333333-3333-3333-3333-333333333333', 'Intel Core i7-1165G7', '8GB DDR4', '256GB SSD', 'Windows 10 Pro',
    '{"windows": "OEM", "office": "Office 2021", "antivirus": "Kaspersky"}'::jsonb),
('d4444444-4444-4444-4444-444444444444', 'Intel Core i7-1165G7', '8GB DDR4', '256GB SSD', 'Windows 10 Pro',
    '{"windows": "OEM", "office": "Office 2021", "antivirus": "Kaspersky"}'::jsonb),
('d5555555-5555-5555-5555-555555555555', 'Intel Core i7-10750H', '8GB DDR4', '512GB SSD', 'Windows 10 Pro',
    '{"windows": "OEM", "office": "Office 2019", "antivirus": "Kaspersky"}'::jsonb);
-- ==================== LOGS DE DISPOSITIVOS ====================

INSERT INTO device_logs (device_id, tipo, descripcion, realizado_por, fecha) VALUES
-- PC-ADM-001
('d1111111-1111-1111-1111-111111111111', 'ASIGNACION', 'Equipo asignado a Luis Rodríguez', '33333333-3333-3333-3333-333333333333', '2024-01-15'),
('d1111111-1111-1111-1111-111111111111', 'MANTENIMIENTO', 'Mantenimiento preventivo: Limpieza física y actualización de software', '44444444-4444-4444-4444-444444444444', '2024-09-15'),

-- LPT-DOC-003 (en reparación)
('d5555555-5555-5555-5555-555555555555', 'REPARACION', 'Pantalla con pixeles muertos, se envía a garantía', '55555555-5555-5555-5555-555555555555', '2025-10-10'),
('d5555555-5555-5555-5555-555555555555', 'REPARACION', 'En espera de respuesta del fabricante', '55555555-5555-5555-5555-555555555555', '2025-10-12'),

-- IMP-ADM-001
('d6666666-6666-6666-6666-666666666666', 'MANTENIMIENTO', 'Cambio de toner y limpieza de rodillos', '44444444-4444-4444-4444-444444444444', '2025-09-01'),

-- SWITCH-CORE-01
('d8888888-8888-8888-8888-888888888888', 'OTRO', 'Configuración inicial: VLANs y QoS', '33333333-3333-3333-3333-333333333333', '2024-02-01'),
('d8888888-8888-8888-8888-888888888888', 'MANTENIMIENTO', 'Actualización de firmware a versión 15.2(7)E10', '33333333-3333-3333-3333-333333333333', '2025-08-15');

-- ==================== BACKUPS ====================

INSERT INTO backups (device_id, tipo, almacenamiento, frecuencia, proximo_backup, fecha_backup, exitoso, tamanio_mb, evidencia_url, realizado_por) VALUES
('d1111111-1111-1111-1111-111111111111', 'COMPLETA', 'NUBE', 'Semanal', '2025-10-29', '2025-10-22', TRUE, 45600.50, 'https://backup.gemelli.edu.co/ADM001-20251022', '44444444-4444-4444-4444-444444444444'),
('d2222222-2222-2222-2222-222222222222', 'COMPLETA', 'NUBE', 'Semanal', '2025-10-29', '2025-10-22', TRUE, 38200.30, 'https://backup.gemelli.edu.co/ADM002-20251022', '44444444-4444-4444-4444-444444444444'),
('d3333333-3333-3333-3333-333333333333', 'INCREMENTAL', 'HIBRIDO', 'Diaria', '2025-10-23', '2025-10-22', TRUE, 2400.10, 'https://backup.gemelli.edu.co/DOC001-20251022', '55555555-5555-5555-5555-555555555555'),
('d4444444-4444-4444-4444-444444444444', 'INCREMENTAL', 'HIBRIDO', 'Diaria', '2025-10-23', '2025-10-22', TRUE, 1800.75, 'https://backup.gemelli.edu.co/DOC002-20251022', '55555555-5555-5555-5555-555555555555'),
('d8888888-8888-8888-8888-888888888888', 'COMPLETA', 'LOCAL', 'Mensual', '2025-11-01', '2025-10-01', TRUE, 250.00, '/backups/configs/SWITCH-CORE-01-config-20251001.txt', '33333333-3333-3333-3333-333333333333');

-- ==================== TICKETS ====================

-- Ticket 1: Alta prioridad - Internet lento
INSERT INTO tickets (id, titulo, descripcion, prioridad, estado, org_unit_id, solicitante_id, asignado_a, device_id, fecha_creacion, fecha_asignacion) VALUES
('t1111111-1111-1111-1111-111111111111', 
 'Conexión a internet muy lenta en sala 302',
 'Los estudiantes y profesores reportan que la conexión a internet está extremadamente lenta desde hace 2 días. Es imposible cargar videos educativos o acceder a plataformas en línea. Afecta a aproximadamente 35 estudiantes.',
 'ALTA',
 'EN_PROCESO',
 '11111111-1111-1111-1111-111111111111',
 '88888888-8888-8888-8888-888888888888',
 '55555555-5555-5555-5555-555555555555',
 'd8888888-8888-8888-8888-888888888888',
 '2025-10-15 08:30:00',
 '2025-10-15 09:15:00');

-- Ticket 2: Media prioridad - Impresora con problemas
INSERT INTO tickets (id, titulo, descripcion, prioridad, estado, org_unit_id, solicitante_id, asignado_a, device_id, fecha_creacion, fecha_asignacion) VALUES
('t2222222-2222-2222-2222-222222222222',
 'Impresora no reconoce papel en bandeja',
 'La impresora de administración muestra error de atasco constantemente, aunque no hay papel atorado. Se ha intentado reiniciar sin éxito.',
 'MEDIA',
 'EN_PROCESO',
 '22222222-2222-2222-2222-222222222222',
 '99999999-9999-9999-9999-999999999999',
 '44444444-4444-4444-4444-444444444444',
 'd6666666-6666-6666-6666-666666666666',
 '2025-10-14 10:20:00',
 '2025-10-14 11:00:00');

-- Ticket 3: Baja prioridad - Solicitud de software
INSERT INTO tickets (id, titulo, descripcion, prioridad, estado, org_unit_id, solicitante_id, fecha_creacion) VALUES
('t3333333-3333-3333-3333-333333333333',
 'Solicitud de instalación de software educativo',
 'Necesito que se instale el software GeoGebra en mi laptop para las clases de matemáticas del próximo mes.',
 'BAJA',
 'ABIERTO',
 '11111111-1111-1111-1111-111111111111',
 '66666666-6666-6666-6666-666666666666',
 '2025-10-16 14:30:00');

-- Ticket 4: Media prioridad - Pantalla parpadeante
INSERT INTO tickets (id, titulo, descripcion, prioridad, estado, org_unit_id, solicitante_id, asignado_a, device_id, fecha_creacion, fecha_asignacion) VALUES
('t4444444-4444-4444-4444-444444444444',
 'Pantalla de laptop parpadea intermitentemente',
 'La pantalla de mi laptop tiene parpadeos frecuentes, especialmente cuando se mueve. Hace difícil trabajar.',
 'MEDIA',
 'ABIERTO',
 '11111111-1111-1111-1111-111111111111',
 '77777777-7777-7777-7777-777777777777',
 '55555555-5555-5555-5555-555555555555',
 'd4444444-4444-4444-4444-444444444444',
 '2025-10-15 16:45:00',
 '2025-10-16 08:00:00');

-- Ticket 5: Resuelto - Problema de contraseña
INSERT INTO tickets (id, titulo, descripcion, prioridad, estado, org_unit_id, solicitante_id, asignado_a, fecha_creacion, fecha_asignacion, fecha_resolucion) VALUES
('t5555555-5555-5555-5555-555555555555',
 'No puedo acceder al sistema de correo',
 'Olvidé mi contraseña del correo institucional y no puedo recuperarla.',
 'MEDIA',
 'RESUELTO',
 '22222222-2222-2222-2222-222222222222',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 '44444444-4444-4444-4444-444444444444',
 '2025-10-13 09:00:00',
 '2025-10-13 09:30:00',
 '2025-10-13 10:15:00');

-- Ticket 6: Cerrado - Mantenimiento completado
INSERT INTO tickets (id, titulo, descripcion, prioridad, estado, org_unit_id, solicitante_id, asignado_a, fecha_creacion, fecha_asignacion, fecha_resolucion, fecha_cierre) VALUES
('t6666666-6666-6666-6666-666666666666',
 'Solicitud de mantenimiento preventivo PC',
 'El equipo está funcionando lento. Solicito mantenimiento preventivo.',
 'BAJA',
 'CERRADO',
 '22222222-2222-2222-2222-222222222222',
 '99999999-9999-9999-9999-999999999999',
 '44444444-4444-4444-4444-444444444444',
 '2025-10-10 08:00:00',
 '2025-10-10 10:00:00',
 '2025-10-11 15:30:00',
 '2025-10-11 16:00:00');

-- ==================== COMENTARIOS DE TICKETS ====================

-- Comentarios Ticket 1 (Internet lento)
INSERT INTO ticket_comments (ticket_id, usuario_id, comentario, es_sistema, fecha) VALUES
('t1111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 
 'He recibido el ticket. Voy a revisar el switch principal y los puntos de acceso en esa área.', 
 FALSE, '2025-10-15 09:20:00'),
('t1111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555',
 'Detecté congestión en el puerto 24 del switch. Un equipo estaba consumiendo ancho de banda excesivo. He reconfigurado QoS.',
 FALSE, '2025-10-15 11:45:00'),
('t1111111-1111-1111-1111-111111111111', NULL,
 '🤖 Sugerencia AI: Causa probable: Congestión en switch de red. Pasos siguientes: 1) Verificar configuración QoS, 2) Identificar dispositivos con alto consumo, 3) Actualizar firmware si es necesario. Prioridad sugerida: ALTA',
 TRUE, '2025-10-15 09:25:00');

-- Comentarios Ticket 2 (Impresora)
INSERT INTO ticket_comments (ticket_id, usuario_id, comentario, es_sistema, fecha) VALUES
('t2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444',
 'Voy a revisar los sensores de papel de la impresora. Puede ser un problema mecánico.',
 FALSE, '2025-10-14 11:05:00'),
('t2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444',
 'Encontré que el sensor de papel estaba sucio. Lo limpié y recalibré. Realizando pruebas.',
 FALSE, '2025-10-14 14:30:00');

-- Comentarios Ticket 5 (Resuelto)
INSERT INTO ticket_comments (ticket_id, usuario_id, comentario, es_sistema, fecha) VALUES
('t5555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444',
 'He restablecido tu contraseña. La nueva contraseña temporal se envió a tu correo personal registrado.',
 FALSE, '2025-10-13 10:00:00'),
('t5555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 'Perfecto, ya pude acceder. Gracias por la ayuda rápida.',
 FALSE, '2025-10-13 10:15:00');

-- Comentarios Ticket 6 (Cerrado)
INSERT INTO ticket_comments (ticket_id, usuario_id, comentario, es_sistema, fecha) VALUES
('t6666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444',
 'Mantenimiento completado. Se realizó: limpieza física, desfragmentación de disco, actualización de drivers y limpieza de archivos temporales. El equipo ahora funciona correctamente.',
 FALSE, '2025-10-11 15:30:00'),
('t6666666-6666-6666-6666-666666666666', '99999999-9999-9999-9999-999999999999',
 'Excelente trabajo. El equipo está mucho más rápido. Gracias.',
 FALSE, '2025-10-11 15:50:00');

-- ==================== AUDITORÍA CON CADENA DE HASH ====================

INSERT INTO audit_chain (hash, content_hash, previous_hash, signature, action, entity_id, user_id, timestamp, block_number) VALUES
('a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2', 
 '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
 '0000000000000000000000000000000000000000000000000000000000000000',
 'sig1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
 'CLOSE_TICKET', 
 't6666666-6666-6666-6666-666666666666', 
 '44444444-4444-4444-4444-444444444444',
 '2025-10-11 16:00:00',
 1),

('b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
 'sig567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
 'UPDATE_DEVICE',
 'd1111111-1111-1111-1111-111111111111',
 '44444444-4444-4444-4444-444444444444',
 '2024-09-15 10:30:00',
 2),

('c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
 'fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
 'sigabcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
 'BACKUP',
 'd1111111-1111-1111-1111-111111111111',
 '44444444-4444-4444-4444-444444444444',
 '2025-10-22 02:00:00',
 3);

-- ==================== ATTACHMENTS ====================

INSERT INTO attachments (nombre, tipo_mime, tamanio_bytes, url, entidad_tipo, entidad_id, subido_por) VALUES
('evidencia_internet_lento.png', 'image/png', 245600, 'https://storage.gemelli.edu.co/tickets/t1111111/evidencia_internet_lento.png', 
 'ticket', 't1111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888'),
 
('foto_impresora_error.jpg', 'image/jpeg', 189400, 'https://storage.gemelli.edu.co/tickets/t2222222/foto_impresora_error.jpg',
 'ticket', 't2222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999'),
 
('manual_PC_ADM_001.pdf', 'application/pdf', 3456780, 'https://storage.gemelli.edu.co/devices/d1111111/manual.pdf',
 'device', 'd1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333'),
 
('backup_report_20251022.pdf', 'application/pdf', 128900, 'https://storage.gemelli.edu.co/backups/report_20251022.pdf',
 'backup', NULL, '44444444-4444-4444-4444-444444444444');

-- ==================== ACTUALIZAR CONTADORES ====================

-- Actualizar tiempos de respuesta y resolución en tickets
UPDATE tickets 
SET tiempo_respuesta_minutos = EXTRACT(EPOCH FROM (fecha_asignacion - fecha_creacion)) / 60
WHERE fecha_asignacion IS NOT NULL;

UPDATE tickets 
SET tiempo_resolucion_minutos = EXTRACT(EPOCH FROM (fecha_resolucion - fecha_creacion)) / 60
WHERE fecha_resolucion IS NOT NULL;

-- ==================== VERIFICACIÓN ====================

-- Contar registros insertados
DO $$
DECLARE
    org_count INTEGER;
    user_count INTEGER;
    device_count INTEGER;
    ticket_count INTEGER;
    backup_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO org_count FROM org_units;
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO device_count FROM devices;
    SELECT COUNT(*) INTO ticket_count FROM tickets;
    SELECT COUNT(*) INTO backup_count FROM backups;
    
    RAISE NOTICE 'Datos insertados exitosamente:';
    RAISE NOTICE '  - Unidades organizacionales: %', org_count;
    RAISE NOTICE '  - Usuarios: %', user_count;
    RAISE NOTICE '  - Dispositivos: %', device_count;
    RAISE NOTICE '  - Tickets: %', ticket_count;
    RAISE NOTICE '  - Backups: %', backup_count;
END $$;

-- ==================== NOTAS ====================

-- IMPORTANTE: Antes de ejecutar este script, asegúrate de:
-- 1. Crear los usuarios correspondientes en Supabase Auth
-- 2. Los IDs de usuarios deben coincidir con los IDs de auth.users
-- 3. Ajustar las fechas según sea necesario
-- 4. Configurar las URLs de almacenamiento correctas

-- Usuario de prueba:
-- Email: admin@gemelli.edu.co
-- Password: Admin123!
-- Rol: LIDER_TI

-- ==================== FIN SEED DATA ====================
