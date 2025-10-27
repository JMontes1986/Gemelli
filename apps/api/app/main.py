# apps/api/app/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
import os
import hashlib
import json
import hmac
import unicodedata
import re

# Configuración
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE")
JWT_SECRET = os.getenv("JWT_SECRET")
AUDIT_SECRET = os.getenv("AUDIT_SECRET", "change-this-secret-key-in-production")

if not all([SUPABASE_URL, SUPABASE_KEY]):
    raise ValueError("Missing required environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(
    title="Gemelli IT API",
    description="API para gestión de inventario y HelpDesk",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4321", "https://*.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# ==================== MODELS ====================

class UserProfile(BaseModel):
    id: str
    nombre: str
    email: str
    rol: Literal["DOCENTE", "ADMINISTRATIVO", "TI", "DIRECTOR", "LIDER_TI"]
    org_unit_id: str
    org_unit_nombre: str

class DeviceCreate(BaseModel):
    nombre: str
    tipo: Literal["PC", "LAPTOP", "IMPRESORA", "RED", "OTRO"]
    estado: Literal["ACTIVO", "REPARACIÓN", "RETIRADO"]
    usuario_actual_id: Optional[str] = None
    ubicacion: str
    imagen: Optional[str] = None
    notas: Optional[str] = None

class DeviceUpdate(BaseModel):
    nombre: Optional[str] = None
    estado: Optional[Literal["ACTIVO", "REPARACIÓN", "RETIRADO"]] = None
    usuario_actual_id: Optional[str] = None
    ubicacion: Optional[str] = None
    notas: Optional[str] = None

class DeviceSpecs(BaseModel):
    device_id: str
    cpu: Optional[str] = None
    ram: Optional[str] = None
    disco: Optional[str] = None
    os: Optional[str] = None
    licencias: Optional[dict] = None

class DeviceLog(BaseModel):
    device_id: str
    tipo: Literal["ASIGNACION", "MANTENIMIENTO", "REPARACION", "BACKUP", "OTRO"]
    descripcion: str
    realizado_por: str

class BackupCreate(BaseModel):
    device_id: str
    tipo: Literal["INCREMENTAL", "COMPLETA", "DIFERENCIAL"]
    almacenamiento: Literal["NUBE", "LOCAL", "HIBRIDO"]
    frecuencia: str
    evidencia_url: Optional[str] = None
    notas: Optional[str] = None

class TicketCreate(BaseModel):
    titulo: str
    descripcion: str
    prioridad: Literal["BAJA", "MEDIA", "ALTA", "CRITICA"]
    device_id: Optional[str] = None

class TicketUpdate(BaseModel):
    estado: Optional[Literal["ABIERTO", "EN_PROCESO", "RESUELTO", "CERRADO"]] = None
    prioridad: Optional[Literal["BAJA", "MEDIA", "ALTA", "CRITICA"]] = None
    asignado_a: Optional[str] = None

class TicketComment(BaseModel):
    ticket_id: str
    comentario: str
    adjunto_url: Optional[str] = None

# ==================== AUDIT HASH SYSTEM ====================

def generate_audit_hash(action: str, entity_id: str, user_id: str, data: dict = None) -> dict:
    """
    Genera un hash de auditoría criptográfico para transacciones importantes.
    Este sistema reemplaza blockchain con una cadena de hash verificable.
    """
    timestamp = datetime.utcnow().isoformat()
    
    # Construir payload de la transacción
    payload = {
        "action": action,
        "entity_id": entity_id,
        "user_id": user_id,
        "timestamp": timestamp,
        "data": data or {}
    }
    
    # Generar hash SHA256 del payload
    payload_str = json.dumps(payload, sort_keys=True)
    content_hash = hashlib.sha256(payload_str.encode()).hexdigest()
    
    # Obtener hash del registro anterior (crear cadena)
    previous_record = supabase.table("audit_chain").select("hash").order(
        "created_at", desc=True
    ).limit(1).execute()
    
    previous_hash = previous_record.data[0]["hash"] if previous_record.data else "0" * 64
    
    # Generar hash de la cadena (previous_hash + content_hash)
    chain_data = f"{previous_hash}:{content_hash}"
    chain_hash = hashlib.sha256(chain_data.encode()).hexdigest()
    
    # Generar firma HMAC para verificación de integridad
    signature = hmac.new(
        AUDIT_SECRET.encode(),
        chain_hash.encode(),
        hashlib.sha256
    ).hexdigest()
    
    # Calcular número de bloque secuencial
    count_result = supabase.table("audit_chain").select("id", count="exact").execute()
    block_number = (count_result.count or 0) + 1
    
    return {
        "hash": chain_hash,
        "content_hash": content_hash,
        "previous_hash": previous_hash,
        "signature": signature,
        "block_number": block_number,
        "payload": payload
    }

def verify_audit_chain() -> dict:
    """
    Verifica la integridad de toda la cadena de auditoría.
    Retorna si la cadena es válida y cualquier hash corrupto.
    """
    records = supabase.table("audit_chain").select("*").order("block_number").execute()
    
    if not records.data:
        return {"valid": True, "message": "Cadena vacía"}
    
    corrupted = []
    previous_hash = "0" * 64
    
    for record in records.data:
        # Reconstruir hash esperado
        payload = {
            "action": record["action"],
            "entity_id": record["entity_id"],
            "user_id": record["user_id"],
            "timestamp": record["timestamp"],
            "data": record.get("metadata", {})
        }
        
        payload_str = json.dumps(payload, sort_keys=True)
        content_hash = hashlib.sha256(payload_str.encode()).hexdigest()
        
        chain_data = f"{previous_hash}:{content_hash}"
        expected_hash = hashlib.sha256(chain_data.encode()).hexdigest()
        
        # Verificar firma HMAC
        expected_signature = hmac.new(
            AUDIT_SECRET.encode(),
            expected_hash.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if record["hash"] != expected_hash or record["signature"] != expected_signature:
            corrupted.append({
                "block_number": record["block_number"],
                "hash": record["hash"],
                "expected_hash": expected_hash
            })
        
        previous_hash = record["hash"]
    
    return {
        "valid": len(corrupted) == 0,
        "total_blocks": len(records.data),
        "corrupted_blocks": corrupted
    }

async def register_audit_event(action: str, entity_id: str, user_id: str, metadata: dict = None):
    """Registra un evento en la cadena de auditoría"""
    audit_data = generate_audit_hash(action, entity_id, user_id, metadata)
    
    # Guardar en base de datos
    supabase.table("audit_chain").insert({
        "hash": audit_data["hash"],
        "content_hash": audit_data["content_hash"],
        "previous_hash": audit_data["previous_hash"],
        "signature": audit_data["signature"],
        "action": action,
        "entity_id": entity_id,
        "user_id": user_id,
        "timestamp": audit_data["payload"]["timestamp"],
        "block_number": audit_data["block_number"],
        "metadata": metadata or {}
    }).execute()
    
    return audit_data

# ==================== AUTH ====================

def normalize_role_value(role: Optional[str]) -> Optional[str]:
    """Normaliza un valor de rol proveniente de Supabase."""
    if role is None:
        return None

    # Remover acentos y normalizar caracteres
    normalized = unicodedata.normalize("NFKD", str(role))
    normalized = "".join(ch for ch in normalized if not unicodedata.combining(ch))

    # Limpiar espacios, guiones y mayúsculas
    normalized = normalized.strip().upper()
    normalized = normalized.replace("-", "_").replace(" ", "_")

    # Colapsar múltiples guiones bajos consecutivos
    normalized = re.sub(r"_+", "_", normalized)

    return normalized or None


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserProfile:
    """Obtener usuario autenticado desde JWT"""
    try:
        token = credentials.credentials
        user_response = supabase.auth.get_user(token)
        
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Usuario no autenticado")
        
        # Obtener datos completos del usuario
        user_data = supabase.table("users").select(
            "id, nombre, email, rol, org_unit_id, org_units(nombre)"
        ).eq("id", user_response.user.id).single().execute()
        
        allowed_roles = {"DOCENTE", "ADMINISTRATIVO", "TI", "DIRECTOR", "LIDER_TI"}
        raw_role = user_data.data.get("rol")
        normalized_role = normalize_role_value(raw_role)

        if normalized_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Rol en Supabase inválido: {raw_role}"
            )
            
        return UserProfile(
            id=user_data.data["id"],
            nombre=user_data.data["nombre"],
            email=user_data.data["email"],
            rol=normalized_role,
            org_unit_id=user_data.data["org_unit_id"],
            org_unit_nombre=user_data.data["org_units"]["nombre"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Error de autenticación: {str(e)}")

def require_role(allowed_roles: List[str], allowed_emails: Optional[List[str]] = None):
    """Decorator para verificar roles"""

    allowed_emails = allowed_emails or []
    
    def role_checker(user: UserProfile = Depends(get_current_user)):
        if user.rol == "LIDER_TI":
            return user
        if user.email in allowed_emails:
            return user
        if user.rol not in allowed_roles:
            raise HTTPException(status_code=403, detail="Permisos insuficientes")
        return user
        
    return role_checker

# ==================== ROUTES ====================

@app.get("/")
async def root():
    return {
        "app": "Gemelli IT API",
        "version": "1.0.0",
        "status": "running",
        "audit_system": "Hash Chain"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# --- AUTH ---

@app.get("/auth/profile", response_model=UserProfile)
async def get_profile(user: UserProfile = Depends(get_current_user)):
    """Obtener perfil del usuario autenticado"""
    return user

# --- INVENTORY ---

@app.get("/inventory/devices")
async def list_devices(
    estado: Optional[str] = None,
    tipo: Optional[str] = None,
    user: UserProfile = Depends(get_current_user)
):
    """Listar dispositivos (filtrados por org_unit del usuario)"""
    query = supabase.table("devices").select(
        "*, usuario_actual:users!usuario_actual_id(nombre, email)"
    )

    if user.rol != "LIDER_TI":
        query = query.eq("org_unit_id", user.org_unit_id)
    
    if estado:
        query = query.eq("estado", estado)
    if tipo:
        query = query.eq("tipo", tipo)
    
    response = query.execute()
    return {"data": response.data, "count": len(response.data)}

@app.post("/inventory/devices", status_code=201)
async def create_device(
    device: DeviceCreate,
    user: UserProfile = Depends(
        require_role(
            ["TI", "LIDER_TI"],
            allowed_emails=["sistemas@colgemelli.edu.co"],
        )
    )
):
    """Crear nuevo dispositivo (personal TI o Líder TI autorizado)"""
    device_data = device.model_dump()
    device_data["org_unit_id"] = user.org_unit_id
    device_data["creado_por"] = user.id
    device_data["fecha_ingreso"] = datetime.utcnow().isoformat()
    
    response = supabase.table("devices").insert(device_data).execute()
    
    # Log de creación
    supabase.table("device_logs").insert({
        "device_id": response.data[0]["id"],
        "tipo": "OTRO",
        "descripcion": f"Dispositivo creado por {user.nombre}",
        "realizado_por": user.id
    }).execute()
    
    # Registrar en auditoría
    await register_audit_event(
        "CREATE_DEVICE",
        response.data[0]["id"],
        user.id,
        {"device_name": device.nombre, "type": device.tipo}
    )
    
    return {"data": response.data[0], "message": "Dispositivo creado exitosamente"}

@app.get("/inventory/devices/{device_id}/cv")
async def get_device_cv(
    device_id: str,
    user: UserProfile = Depends(get_current_user)
):
    """Obtener hoja de vida completa del dispositivo"""
    # Verificar acceso
    device_query = supabase.table("devices").select("*").eq("id", device_id)

    if user.rol != "LIDER_TI":
        device_query = device_query.eq("org_unit_id", user.org_unit_id)

    device = device_query.single().execute()
    
    if not device.data:
        raise HTTPException(status_code=404, detail="Dispositivo no encontrado")
    
    # Obtener especificaciones
    specs = supabase.table("device_specs").select("*").eq("device_id", device_id).execute()
    
    # Obtener historial
    logs = supabase.table("device_logs").select(
        "*, usuario:users!realizado_por(nombre)"
    ).eq("device_id", device_id).order("fecha", desc=True).execute()
    
    # Obtener backups
    backups = supabase.table("backups").select("*").eq("device_id", device_id).order(
        "fecha_backup", desc=True
    ).execute()
    
    # Obtener auditoría
    audit = supabase.table("audit_chain").select("*").eq("entity_id", device_id).execute()
    
    return {
        "device": device.data,
        "specs": specs.data[0] if specs.data else None,
        "logs": logs.data,
        "backups": backups.data,
        "audit": audit.data
    }

@app.put("/inventory/devices/{device_id}")
async def update_device(
    device_id: str,
    updates: DeviceUpdate,
    user: UserProfile = Depends(require_role(["TI", "LIDER_TI"]))
):
    """Actualizar dispositivo"""
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    update_data["actualizado_en"] = datetime.utcnow().isoformat()
    
    update_query = supabase.table("devices").update(update_data).eq("id", device_id)

    if user.rol != "LIDER_TI":
        update_query = update_query.eq("org_unit_id", user.org_unit_id)

    response = update_query.execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Dispositivo no encontrado")
    
    # Log de actualización
    supabase.table("device_logs").insert({
        "device_id": device_id,
        "tipo": "OTRO",
        "descripcion": f"Dispositivo actualizado por {user.nombre}",
        "realizado_por": user.id
    }).execute()
    
    # Registrar en auditoría
    await register_audit_event(
        "UPDATE_DEVICE",
        device_id,
        user.id,
        {"changes": update_data}
    )
    
    return {"data": response.data[0], "message": "Dispositivo actualizado"}

# --- BACKUPS ---

@app.get("/backups")
async def list_backups(
    device_id: Optional[str] = None,
    user: UserProfile = Depends(get_current_user)
):
    """Listar backups"""
    query = supabase.table("backups").select(
        "*, device:devices!device_id(nombre, tipo)"
    )
    
    if device_id:
        query = query.eq("device_id", device_id)
    
    response = query.order("fecha_backup", desc=True).execute()
    return {"data": response.data}

@app.post("/backups", status_code=201)
async def create_backup(
    backup: BackupCreate,
    user: UserProfile = Depends(require_role(["TI", "LIDER_TI"]))
):
    """Registrar backup"""
    backup_data = backup.model_dump()
    backup_data["realizado_por"] = user.id
    backup_data["fecha_backup"] = datetime.utcnow().isoformat()
    
    response = supabase.table("backups").insert(backup_data).execute()
    
    # Log en device
    supabase.table("device_logs").insert({
        "device_id": backup.device_id,
        "tipo": "BACKUP",
        "descripcion": f"Backup {backup.tipo} realizado",
        "realizado_por": user.id
    }).execute()
    
    # Auditoría
    await register_audit_event(
        "BACKUP",
        backup.device_id,
        user.id,
        {"backup_type": backup.tipo, "storage": backup.almacenamiento}
    )
    
    return {"data": response.data[0], "message": "Backup registrado"}

# --- TICKETS ---

@app.get("/tickets")
async def list_tickets(
    estado: Optional[str] = None,
    user: UserProfile = Depends(get_current_user)
):
    """Listar tickets"""
    if user.rol == "LIDER_TI":
        query = supabase.table("tickets").select(
            "*, solicitante:users!solicitante_id(nombre, email), asignado:users!asignado_a(nombre)"
        )
    elif user.rol in ["TI", "DIRECTOR"]:
        query = supabase.table("tickets").select(
            "*, solicitante:users!solicitante_id(nombre, email), asignado:users!asignado_a(nombre)"
        ).eq("org_unit_id", user.org_unit_id)
    else:
        query = supabase.table("tickets").select("*").eq("solicitante_id", user.id)
    
    if estado:
        query = query.eq("estado", estado)
    
    response = query.order("fecha_creacion", desc=True).execute()
    return {"data": response.data}

@app.post("/tickets", status_code=201)
async def create_ticket(
    ticket: TicketCreate,
    user: UserProfile = Depends(get_current_user)
):
    """Crear ticket"""
    ticket_data = ticket.model_dump()
    ticket_data["solicitante_id"] = user.id
    ticket_data["org_unit_id"] = user.org_unit_id
    ticket_data["estado"] = "ABIERTO"
    ticket_data["fecha_creacion"] = datetime.utcnow().isoformat()
    
    response = supabase.table("tickets").insert(ticket_data).execute()
    
    return {"data": response.data[0], "message": "Ticket creado exitosamente"}

@app.get("/tickets/{ticket_id}")
async def get_ticket(
    ticket_id: str,
    user: UserProfile = Depends(get_current_user)
):
    """Obtener detalle de ticket con comentarios"""
    ticket = supabase.table("tickets").select(
        "*, solicitante:users!solicitante_id(nombre, email), asignado:users!asignado_a(nombre), device:devices(nombre, tipo)"
    ).eq("id", ticket_id).single().execute()
    
    if not ticket.data:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    
    # Verificar acceso
    if user.rol not in ["TI", "LIDER_TI", "DIRECTOR"]:
        if ticket.data["solicitante_id"] != user.id:
            raise HTTPException(status_code=403, detail="Acceso denegado")
    
    # Comentarios
    comments = supabase.table("ticket_comments").select(
        "*, usuario:users!usuario_id(nombre)"
    ).eq("ticket_id", ticket_id).order("fecha", desc=False).execute()
    
    return {
        "ticket": ticket.data,
        "comments": comments.data
    }

@app.put("/tickets/{ticket_id}")
async def update_ticket(
    ticket_id: str,
    updates: TicketUpdate,
    user: UserProfile = Depends(require_role(["TI", "LIDER_TI"]))
):
    """Actualizar ticket (solo TI)"""
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    
    response = supabase.table("tickets").update(update_data).eq("id", ticket_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    
    # Si se cierra, registrar en auditoría
    if updates.estado in ["RESUELTO", "CERRADO"]:
        await register_audit_event(
            "CLOSE_TICKET",
            ticket_id,
            user.id,
            {"final_status": updates.estado}
        )
    
    return {"data": response.data[0], "message": "Ticket actualizado"}

@app.post("/tickets/{ticket_id}/comments")
async def add_comment(
    ticket_id: str,
    comment: TicketComment,
    user: UserProfile = Depends(get_current_user)
):
    """Agregar comentario a ticket"""
    comment_data = {
        "ticket_id": ticket_id,
        "usuario_id": user.id,
        "comentario": comment.comentario,
        "adjunto_url": comment.adjunto_url,
        "fecha": datetime.utcnow().isoformat()
    }
    
    response = supabase.table("ticket_comments").insert(comment_data).execute()
    
    return {"data": response.data[0], "message": "Comentario agregado"}

# --- DASHBOARD ---

@app.get("/dashboard/metrics")
async def get_metrics(user: UserProfile = Depends(get_current_user)):
    """Obtener métricas del dashboard"""
    # Dispositivos
    devices_query = supabase.table("devices").select("estado", count="exact")
    if user.rol != "LIDER_TI":
        devices_query = devices_query.eq("org_unit_id", user.org_unit_id)
    devices = devices_query.execute()
    
    # Tickets
    tickets_query = supabase.table("tickets").select("estado, prioridad", count="exact")
    if user.rol != "LIDER_TI":
        tickets_query = tickets_query.eq("org_unit_id", user.org_unit_id)
    tickets = tickets_query.execute()
    
    # Backups
    backups = supabase.table("backups").select("id", count="exact").execute()
    
    return {
        "dispositivos": {
            "total": devices.count,
            "activos": len([d for d in devices.data if d["estado"] == "ACTIVO"]),
            "reparacion": len([d for d in devices.data if d["estado"] == "REPARACIÓN"])
        },
        "tickets": {
            "total": tickets.count,
            "abiertos": len([t for t in tickets.data if t["estado"] == "ABIERTO"]),
            "en_proceso": len([t for t in tickets.data if t["estado"] == "EN_PROCESO"])
        },
        "backups": {
            "total": backups.count
        }
    }

# --- AUDIT CHAIN ---

@app.post("/audit/hash")
async def generate_hash(
    action: str,
    entity_id: str,
    metadata: Optional[dict] = None,
    user: UserProfile = Depends(require_role(["TI", "LIDER_TI"]))
):
    """Generar y registrar hash en cadena de auditoría"""
    audit_data = await register_audit_event(action, entity_id, user.id, metadata)
    return {
        "hash": audit_data["hash"],
        "signature": audit_data["signature"],
        "block_number": audit_data["block_number"],
        "message": "Evento registrado en cadena de auditoría"
    }

@app.get("/audit/verify/{hash}")
async def verify_hash(hash: str):
    """Verificar hash en cadena de auditoría"""
    response = supabase.table("audit_chain").select("*").eq("hash", hash).single().execute()
    
    if not response.data:
        return {"valid": False, "message": "Hash no encontrado"}
    
    # Verificar firma HMAC
    expected_signature = hmac.new(
        AUDIT_SECRET.encode(),
        hash.encode(),
        hashlib.sha256
    ).hexdigest()
    
    signature_valid = response.data["signature"] == expected_signature
    
    return {
        "valid": signature_valid,
        "data": response.data,
        "verified": signature_valid
    }

@app.get("/audit/chain/verify")
async def verify_chain(user: UserProfile = Depends(require_role(["TI", "LIDER_TI"]))):
    """Verificar integridad de toda la cadena de auditoría"""
    result = verify_audit_chain()
    return result

@app.get("/audit/entity/{entity_id}")
async def get_entity_audit(entity_id: str, user: UserProfile = Depends(get_current_user)):
    """Obtener historial de auditoría de una entidad"""
    response = supabase.table("audit_chain").select("*").eq("entity_id", entity_id).order(
        "block_number", desc=True
    ).execute()
    
    return {"data": response.data, "count": len(response.data)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    
