# 🔐 Sistema de Auditoría con Cadena de Hash

## 📋 Visión General

En lugar de utilizar blockchain (que requiere infraestructura costosa y compleja), Gemelli IT implementa un **sistema de cadena de hash criptográfica** que proporciona las mismas garantías de inmutabilidad y trazabilidad, pero de manera más eficiente y económica.

## 🔗 ¿Qué es una Cadena de Hash?

Una cadena de hash es una estructura de datos donde cada registro contiene:

1. **Content Hash**: Hash del contenido del evento
2. **Previous Hash**: Hash del registro anterior (crea la "cadena")
3. **Chain Hash**: Hash combinado que enlaza con el anterior
4. **Signature**: Firma HMAC para verificación de integridad
```
Block 1                  Block 2                  Block 3
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│ Prev: 0000  │────────►│ Prev: Hash1 │────────►│ Prev: Hash2 │
│ Content: X  │         │ Content: Y  │         │ Content: Z  │
│ Hash: Hash1 │         │ Hash: Hash2 │         │ Hash: Hash3 │
│ Sig: HMAC1  │         │ Sig: HMAC2  │         │ Sig: HMAC3  │
└─────────────┘         └─────────────┘         └─────────────┘
```

## ✅ Ventajas sobre Blockchain

| Característica | Hash Chain | Blockchain |
|----------------|------------|------------|
| **Costo** | $0 (incluido en DB) | $1-5/mes en gas fees |
| **Velocidad** | Instantáneo | 5-30 segundos |
| **Complejidad** | Simple | Alta |
| **Dependencias** | Ninguna | Wallet, RPC, MATIC |
| **Inmutabilidad** | ✅ Sí | ✅ Sí |
| **Verificable** | ✅ Sí | ✅ Sí |
| **Descentralizado** | ❌ No | ✅ Sí |

## 🔧 Implementación Técnica

### Estructura de un Registro
```sql
CREATE TABLE audit_chain (
    id UUID PRIMARY KEY,
    hash VARCHAR(64) NOT NULL UNIQUE,           -- Hash de la cadena
    content_hash VARCHAR(64) NOT NULL,          -- Hash del contenido
    previous_hash VARCHAR(64) NOT NULL,         -- Hash del bloque anterior
    signature VARCHAR(64) NOT NULL,             -- Firma HMAC
    action VARCHAR(50) NOT NULL,                -- Tipo de acción
    entity_id UUID NOT NULL,                    -- ID de la entidad
    user_id UUID,                               -- Usuario que realizó la acción
    timestamp TIMESTAMP NOT NULL,               -- Momento exacto
    block_number BIGINT NOT NULL,               -- Número secuencial
    metadata JSONB                              -- Datos adicionales
);
```

### Generación de Hash
```python
def generate_audit_hash(action, entity_id, user_id, data):
    # 1. Crear payload
    payload = {
        "action": action,
        "entity_id": entity_id,
        "user_id": user_id,
        "timestamp": datetime.utcnow().isoformat(),
        "data": data
    }
    
    # 2. Hash del contenido (SHA-256)
    content_hash = hashlib.sha256(
        json.dumps(payload, sort_keys=True).encode()
    ).hexdigest()
    
    # 3. Obtener hash del bloque anterior
    previous_hash = get_last_hash() or "0" * 64
    
    # 4. Hash de la cadena
    chain_hash = hashlib.sha256(
        f"{previous_hash}:{content_hash}".encode()
    ).hexdigest()
    
    # 5. Firma HMAC (con secreto)
    signature = hmac.new(
        SECRET_KEY.encode(),
        chain_hash.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return {
        "hash": chain_hash,
        "content_hash": content_hash,
        "previous_hash": previous_hash,
        "signature": signature
    }
```

## 🔍 Verificación de Integridad

### Verificar un Solo Registro
```python
def verify_single_record(record):
    # Reconstruir hash esperado
    expected_signature = hmac.new(
        SECRET_KEY.encode(),
        record.hash.encode(),
        hashlib.sha256
    ).hexdigest()
    
    # Comparar firmas
    return record.signature == expected_signature
```

### Verificar Toda la Cadena
```python
def verify_chain():
    records = get_all_records_ordered()
    previous_hash = "0" * 64
    corrupted = []
    
    for record in records:
        # Reconstruir payload
        payload = {
            "action": record.action,
            "entity_id": record.entity_id,
            "user_id": record.user_id,
            "timestamp": record.timestamp,
            "data": record.metadata
        }
        
        # Recalcular hashes
        content_hash = hashlib.sha256(
            json.dumps(payload, sort_keys=True).encode()
        ).hexdigest()
        
        expected_chain_hash = hashlib.sha256(
            f"{previous_hash}:{content_hash}".encode()
        ).hexdigest()
        
        expected_signature = hmac.new(
            SECRET_KEY.encode(),
            expected_chain_hash.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Verificar
        if (record.hash != expected_chain_hash or 
            record.signature != expected_signature):
            corrupted.append(record.block_number)
        
        previous_hash = record.hash
    
    return {
        "valid": len(corrupted) == 0,
        "corrupted_blocks": corrupted
    }
```

## 🎯 Eventos Auditados

El sistema registra automáticamente estos eventos críticos:

| Evento | Acción | Cuándo se registra |
|--------|--------|-------------------|
| **CREATE_DEVICE** | Creación de dispositivo | Al agregar equipo nuevo |
| **UPDATE_DEVICE** | Modificación de dispositivo | Al cambiar estado/ubicación |
| **DELETE_DEVICE** | Eliminación de dispositivo | Al dar de baja equipo |
| **BACKUP** | Copia de seguridad | Al completar backup |
| **CLOSE_TICKET** | Cierre de ticket | Al resolver/cerrar ticket |
| **ASSIGN_TICKET** | Asignación de ticket | Al asignar a técnico |

## 📊 Ejemplo de Registro

### Request API
```bash
POST /audit/hash
Authorization: Bearer <token>

{
  "action": "CLOSE_TICKET",
  "entity_id": "ticket-uuid-123",
  "metadata": {
    "final_status": "RESUELTO",
    "resolution_time_minutes": 45,
    "satisfaction_rating": 5
  }
}
```

### Response
```json
{
  "hash": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6...",
  "signature": "sig1234567890abcdef1234567890...",
  "block_number": 156,
  "message": "Evento registrado en cadena de auditoría"
}
```

### Registro en Base de Datos
```json
{
  "id": "uuid-xxx",
  "hash": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6...",
  "content_hash": "1234567890abcdef1234567890...",
  "previous_hash": "fedcba0987654321fedcba09...",
  "signature": "sig1234567890abcdef1234567890...",
  "action": "CLOSE_TICKET",
  "entity_id": "ticket-uuid-123",
  "user_id": "user-uuid-456",
  "timestamp": "2025-10-22T15:30:00Z",
  "block_number": 156,
  "metadata": {
    "final_status": "RESUELTO",
    "resolution_time_minutes": 45,
    "satisfaction_rating": 5
  }
}
```

## 🔐 Seguridad

### Características de Seguridad

1. **Inmutabilidad**: Cualquier cambio rompe la cadena
2. **Trazabilidad**: Historial completo de cambios
3. **Autenticidad**: Firma HMAC con clave secreta
4. **Integridad**: Hash criptográfico SHA-256
5. **Ordenamiento**: Números de bloque secuenciales

### ¿Cómo se Detecta la Manipulación?

**Escenario**: Un atacante intenta modificar un registro antiguo.
```
Estado Original:
Block 5: Hash = "abc123..." (válido)
Block 6: Prev = "abc123..." (válido)

Atacante modifica Block 5:
Block 5: Hash = "xyz789..." (DIFERENTE)
Block 6: Prev = "abc123..." (NO COINCIDE)
                    ↑
              ⚠️ CADENA ROTA
```

Al verificar la cadena, el sistema detectará:
- Hash de Block 5 no coincide con el esperado
- Block 6 apunta a un hash que ya no existe
- Firma HMAC inválida

## 🛠️ API Endpoints

### Generar Hash de Auditoría
```bash
POST /audit/hash
```

**Request:**
```json
{
  "action": "UPDATE_DEVICE",
  "entity_id": "device-uuid",
  "metadata": {
    "field_changed": "ubicacion",
    "old_value": "Sala 101",
    "new_value": "Sala 102"
  }
}
```

**Response:**
```json
{
  "hash": "a1b2c3d4...",
  "signature": "sig123...",
  "block_number": 157,
  "message": "Evento registrado"
}
```

### Verificar Hash Específico
```bash
GET /audit/verify/{hash}
```

**Response:**
```json
{
  "valid": true,
  "data": {
    "hash": "a1b2c3d4...",
    "action": "UPDATE_DEVICE",
    "timestamp": "2025-10-22T15:30:00Z",
    "user_id": "user-uuid",
    "block_number": 157
  },
  "verified": true
}
```

### Verificar Integridad Completa
```bash
GET /audit/chain/verify
```

**Response (cadena válida):**
```json
{
  "valid": true,
  "total_blocks": 1547,
  "corrupted_blocks": []
}
```

**Response (cadena corrupta):**
```json
{
  "valid": false,
  "total_blocks": 1547,
  "corrupted_blocks": [
    {
      "block_number": 856,
      "hash": "actual_hash...",
      "expected_hash": "expected_hash..."
    }
  ]
}
```

### Historial de Entidad
```bash
GET /audit/entity/{entity_id}
```

**Response:**
```json
{
  "data": [
    {
      "block_number": 150,
      "action": "CREATE_DEVICE",
      "timestamp": "2025-10-15T10:00:00Z",
      "user_id": "admin-uuid"
    },
    {
      "block_number": 157,
      "action": "UPDATE_DEVICE",
      "timestamp": "2025-10-22T15:30:00Z",
      "user_id": "tech-uuid"
    }
  ],
  "count": 2
}
```

## 🎓 Casos de Uso

### 1. Auditoría de Cambios

**Pregunta**: "¿Quién cambió el estado de este dispositivo?"
```bash
GET /audit/entity/device-uuid-123
```

**Respuesta**: Historial completo con usuario, fecha y cambios.

### 2. Compliance y Regulaciones

**Requisito**: Demostrar que los registros no han sido alterados.
```bash
GET /audit/chain/verify
```

**Resultado**: Certificado de integridad de toda la cadena.

### 3. Resolución de Conflictos

**Situación**: Discrepancia en datos.
```bash
GET /audit/entity/ticket-uuid-456
```

**Solución**: Ver historial exacto de cambios con timestamps.

### 4. Detección de Fraude

**Alerta**: Cambios sospechosos en registros.
```bash
GET /audit/chain/verify
```

**Acción**: Si la cadena está rota, investigar bloques corruptos.

## 🔄 Comparación con Blockchain

### Lo que TENEMOS (Hash Chain)

✅ Inmutabilidad (misma garantía que blockchain)  
✅ Trazabilidad completa  
✅ Verificación criptográfica  
✅ Costo $0  
✅ Velocidad instantánea  
✅ Sin dependencias externas  
✅ Fácil de implementar  
✅ Fácil de mantener  

### Lo que NO TENEMOS (vs Blockchain)

❌ Descentralización  
❌ Consenso distribuido  
❌ Resistencia a censura de un solo punto  
❌ Verificación externa independiente  

### ¿Cuándo usar cada uno?

**Hash Chain** (nuestra solución):
- ✅ Sistemas internos corporativos
- ✅ Auditorías internas
- ✅ Presupuesto limitado
- ✅ Rapidez de implementación

**Blockchain real**:
- Sistemas multi-organizacionales
- Desconfianza entre partes
- Requisito regulatorio específico
- Presupuesto para infraestructura

## 🧪 Testing

### Probar Generación de Hash
```python
# test_audit.py
def test_generate_hash():
    audit_data = generate_audit_hash(
        "TEST_ACTION",
        "test-entity-id",
        "test-user-id",
        {"test": True}
    )
    
    assert len(audit_data["hash"]) == 64
    assert len(audit_data["signature"]) == 64
    assert audit_data["block_number"] > 0
```

### Probar Detección de Manipulación
```python
def test_detect_tampering():
    # Crear cadena válida
    create_test_chain(5)
    
    # Manipular registro 3
    tamper_record(3)
    
    # Verificar
    result = verify_chain()
    
    assert result["valid"] == False
    assert 3 in result["corrupted_blocks"]
```

### Probar Verificación de Firma
```python
def test_signature_verification():
    record = create_test_record()
    
    # Firma válida
    assert verify_signature(record) == True
    
    # Modificar hash
    record.hash = "modified_hash"
    assert verify_signature(record) == False
```

## 📈 Monitoreo

### Métricas Importantes
```python
# Dashboard metrics
{
  "total_audit_records": 1547,
  "records_last_24h": 45,
  "chain_integrity": "VALID",
  "last_verification": "2025-10-22T16:00:00Z",
  "average_records_per_day": 52
}
```

### Alertas Configurables
```yaml
alerts:
  - name: "Chain Corruption Detected"
    condition: chain_integrity != "VALID"
    action: email_admin
    
  - name: "High Audit Volume"
    condition: records_per_hour > 100
    action: log_warning
    
  - name: "Verification Failed"
    condition: verification_error
    action: sms_admin
```

## 🎯 Mejores Prácticas

### 1. Protección del Secret Key
```python
# ❌ MAL
AUDIT_SECRET = "my-secret"

# ✅ BIEN
AUDIT_SECRET = os.getenv("AUDIT_SECRET")
if not AUDIT_SECRET:
    raise ValueError("AUDIT_SECRET must be set")
```

### 2. Verificación Regular
```python
# Tarea programada (diaria)
@cron.schedule("0 3 * * *")  # 3 AM
async def daily_chain_verification():
    result = verify_audit_chain()
    if not result["valid"]:
        alert_admin(result["corrupted_blocks"])
```

### 3. Backup de Auditoría
```bash
# Backup semanal
0 2 * * 0 pg_dump -t audit_chain > /backups/audit_$(date +%Y%m%d).sql
```

### 4. Documentación de Cambios
```python
# Siempre incluir metadata descriptivo
await register_audit_event(
    "UPDATE_DEVICE",
    device_id,
    user_id,
    {
        "reason": "Reubicación por mantenimiento",
        "old_location": "Sala 101",
        "new_location": "Taller TI",
        "approved_by": "supervisor_uuid"
    }
)
```

## 🔮 Futuro

### Posibles Mejoras

1. **Export a Blockchain**: Opción de sincronizar periódicamente con blockchain real para máxima seguridad
2. **Timestamping Externo**: Usar servicios como OpenTimestamps para verificación externa
3. **Firma Digital**: Agregar firmas digitales PKI además de HMAC
4. **Merkle Trees**: Implementar árboles de Merkle para verificación más eficiente

---

## 📚 Referencias

- [HMAC RFC 2104](https://tools.ietf.org/html/rfc2104)
- [SHA-256 Specification](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf)

---

**Conclusión**: El sistema de Hash Chain proporciona las garantías de inmutabilidad y trazabilidad necesarias para auditorías corporativas sin la complejidad y costo de blockchain real. Es la solución perfecta para Gemelli IT.

*Versión 1.0.0 - Octubre 2025*
