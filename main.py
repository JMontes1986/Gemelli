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

# Configuración
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE")
JWT_SECRET = os.getenv("JWT_SECRET")

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

# ==================== AUTH ====================

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
        
        return UserProfile(
            id=user_data.data["id"],
            nombre=user_data.data["nombre"],
            email=user_data.data["email"],
            rol=user_data.data["rol"],
            org_unit_id=user_data.data["org_unit_id"],
            org_unit_nombre=user_data.data["org_units"]["nombre"]
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Error de autenticación: {str(e)}")

def require_role(allowed_roles: List[str]):
    """Decorator para verificar roles"""
    def role_checker(user: UserProfile = Depends(get_current_user)):
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
        "status": "running"
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
    ).eq("org_unit_id", user.org_unit_id)
    
    if estado:
        query = query.eq("estado", estado)
    if tipo:
        query = query.eq("tipo", tipo)
    
    response = query.execute()
    return {"data": response.data, "count": len(response.data)}

@app.post("/inventory/devices", status_code=201)
async def create_device(
    device: DeviceCreate,
    user: UserProfile = Depends(require_role(["TI", "LIDER_TI"]))
):
    """Crear nuevo dispositivo (solo TI)"""
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
    
    return {"data": response.data[0], "message": "Dispositivo creado exitosamente"}

@app.get("/inventory/devices/{device_id}/cv")
async def get_device_cv(
    device_id: str,
    user: UserProfile = Depends(get_current_user)
):
    """Obtener hoja de vida completa del dispositivo"""
    # Verificar acceso
    device = supabase.table("devices").select("*").eq("id", device_id).eq(
        "org_unit_id", user.org_unit_id
    ).single().execute()
    
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
    
    # Obtener auditoría blockchain
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
    
    response = supabase.table("devices").update(update_data).eq("id", device_id).eq(
        "org_unit_id", user.org_unit_id
    ).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Dispositivo no encontrado")
    
    # Log de actualización
    supabase.table("device_logs").insert({
        "device_id": device_id,
        "tipo": "OTRO",
        "descripcion": f"Dispositivo actualizado por {user.nombre}",
        "realizado_por": user.id
    }).execute()
    
    # Registrar en blockchain
    await register_blockchain_event("UPDATE_DEVICE", device_id, user.id)
    
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
    ).eq("devices.org_unit_id", user.org_unit_id)
    
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
    
    # Blockchain
    await register_blockchain_event("BACKUP", backup.device_id, user.id)
    
    return {"data": response.data[0], "message": "Backup registrado"}

# --- TICKETS ---

@app.get("/tickets")
async def list_tickets(
    estado: Optional[str] = None,
    user: UserProfile = Depends(get_current_user)
):
    """Listar tickets"""
    # Los usuarios normales solo ven sus tickets
    # TI ve todos los tickets de su org_unit
    if user.rol in ["TI", "LIDER_TI", "DIRECTOR"]:
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
    
    # Si se cierra, registrar en blockchain
    if updates.estado in ["RESUELTO", "CERRADO"]:
        await register_blockchain_event("CLOSE_TICKET", ticket_id, user.id)
    
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
    devices = supabase.table("devices").select("estado", count="exact").eq(
        "org_unit_id", user.org_unit_id
    ).execute()
    
    # Tickets
    tickets = supabase.table("tickets").select("estado, prioridad", count="exact").eq(
        "org_unit_id", user.org_unit_id
    ).execute()
    
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

# --- BLOCKCHAIN ---

async def register_blockchain_event(action: str, entity_id: str, user_id: str):
    """Registrar evento en blockchain"""
    # Generar hash
    data = f"{action}:{entity_id}:{user_id}:{datetime.utcnow().isoformat()}"
    hash_value = hashlib.sha256(data.encode()).hexdigest()
    
    # Guardar en DB (simulación de blockchain por ahora)
    supabase.table("audit_chain").insert({
        "hash": hash_value,
        "action": action,
        "entity_id": entity_id,
        "user_id": user_id,
        "timestamp": datetime.utcnow().isoformat(),
        "tx_hash": f"0x{hash_value[:40]}",  # Simulado
        "block_number": 12345  # Simulado
    }).execute()
    
    return hash_value

@app.post("/chain/hash")
async def generate_hash(
    action: str,
    entity_id: str,
    user: UserProfile = Depends(require_role(["TI", "LIDER_TI"]))
):
    """Generar y registrar hash en blockchain"""
    hash_value = await register_blockchain_event(action, entity_id, user.id)
    return {"hash": hash_value, "message": "Evento registrado en blockchain"}

@app.get("/chain/verify/{hash}")
async def verify_hash(hash: str):
    """Verificar hash en blockchain"""
    response = supabase.table("audit_chain").select("*").eq("hash", hash).single().execute()
    
    if not response.data:
        return {"valid": False, "message": "Hash no encontrado"}
    
    return {"valid": True, "data": response.data}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)