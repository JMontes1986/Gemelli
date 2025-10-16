from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Any, Dict
import hashlib, json, datetime, os
from .supabase_client import get as sb_get, insert as sb_insert, update as sb_update
from .chain_client import record as chain_record

app = FastAPI(title="Gemelli IT API")

class DeviceIn(BaseModel):
    name: str; type: str; status: str = "ACTIVO"
    asset_tag: Optional[str] = None; org_unit_id: Optional[str] = None; location: Optional[str] = None
class DeviceSpec(BaseModel):
    device_id: str; section: str; key: str; value: str
class BackupIn(BaseModel):
    device_id: str; frequency: str; storage: str; last_run_at: Optional[str] = None; next_run_at: Optional[str] = None; evidence_url: Optional[str] = None; notes: Optional[str] = None
class TicketIn(BaseModel):
    title: str; description: Optional[str] = None; priority: str = "MEDIA"; role_at_creation: str; created_by: str; device_id: Optional[str] = None
class TicketPatch(BaseModel):
    status: Optional[str] = None; assigned_to: Optional[str] = None; device_id: Optional[str] = None
class CommentIn(BaseModel):
    ticket_id: str; author_id: str; body: str; attachments: Optional[List[Dict[str, Any]]] = []
class CloseTicket(BaseModel):
    ticket_id: str; closer_id: str; resolution: str

@app.get("/inventory/devices")
async def devices_list():
    return await sb_get("devices", {"select":"*","order":"created_at.desc"})
@app.post("/inventory/devices")
async def devices_create(body: DeviceIn): return (await sb_insert("devices", body.model_dump()))[0]
@app.post("/inventory/specs")
async def specs_add(body: DeviceSpec): return (await sb_insert("device_specs", body.model_dump()))[0]
@app.get("/inventory/devices/{device_id}/cv")
async def device_cv(device_id: str):
    d = await sb_get("devices", {"id": f"eq.{device_id}"}); 
    if not d: raise HTTPException(404, "Dispositivo no encontrado")
    return {"device": d[0], "specs": await sb_get("device_specs", {"device_id": f"eq.{device_id}"}),
            "logs": await sb_get("device_logs", {"device_id": f"eq.{device_id}", "order": "created_at.desc"}),
            "backups": await sb_get("backups", {"device_id": f"eq.{device_id}"}),
            "attachments": await sb_get("attachments", {"owner_table":"devices","owner_id": f"eq.{device_id}"})}
@app.post("/backups")
async def backups_create(body: BackupIn):
    row = (await sb_insert("backups", body.model_dump()))[0]
    try: await sb_insert("device_logs", {"device_id": body.device_id, "action":"RESPALDO", "description": f"Backup {body.frequency} en {body.storage}", "performed_by": None})
    except Exception: pass
    return row
@app.get("/backups")
async def backups_list(): return await sb_get("backups", {"select":"*"})
@app.get("/tickets")
async def tickets_list(status: Optional[str] = None, mine: Optional[str] = None, id: Optional[str] = None):
    params = {"select":"*","order":"created_at.desc"}
    if status: params["status"] = f"eq.{status}"
    if mine: params["created_by"] = f"eq.{mine}"
    if id: params["id"] = f"eq.{id}"
    return await sb_get("tickets", params)
@app.post("/tickets")
async def tickets_create(body: TicketIn): return (await sb_insert("tickets", body.model_dump()))[0]
@app.patch("/tickets/{ticket_id}")
async def tickets_patch(ticket_id: str, body: TicketPatch): return (await sb_update("tickets", {"id": ticket_id}, body.model_dump(exclude_none=True)))[0]
@app.post("/tickets/{ticket_id}/comments")
async def ticket_comment(ticket_id: str, body: CommentIn):
    if ticket_id != body.ticket_id: raise HTTPException(400, "ticket_id no coincide")
    return (await sb_insert("ticket_comments", body.model_dump()))[0]
@app.post("/tickets/{ticket_id}/close_and_anchor")
async def close_and_anchor(ticket_id: str, body: CloseTicket):
    _ = await sb_update("tickets", {"id": ticket_id}, {"status": "CERRADO"})
    payload = {"ticket_id": ticket_id, "resolution": body.resolution, "closed_at": datetime.datetime.utcnow().isoformat()}
    digest = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
    tx_hash = chain_record("0x"+digest, 1, "0x"+digest[:64]) or "0xMOCK"
    await sb_insert("audit_chain", {"entity_type":"ticket","entity_id": ticket_id,"action":"CERRADO","sha256": "0x"+digest,"tx_hash": tx_hash,"chain_id": int(os.getenv("CHAIN_ID","80002")),"created_by": body.closer_id})
    return {"ok": True, "tx_hash": tx_hash, "sha256": "0x"+digest}

class CloseFromWallet(BaseModel):
    ticket_id: str
    closer_id: str
    resolution: str
    tx_hash: str
    sha256: str
    chain_id: int = int(os.getenv("CHAIN_ID", "80002"))

@app.post("/tickets/{ticket_id}/close_from_wallet")
async def close_from_wallet(ticket_id: str, body: CloseFromWallet):
    if ticket_id != body.ticket_id:
        raise HTTPException(400, "ticket_id no coincide")
    _ = await sb_update("tickets", {"id": ticket_id}, {"status": "CERRADO"})
    await sb_insert("audit_chain", {
        "entity_type": "ticket",
        "entity_id": ticket_id,
        "action": "CERRADO",
        "sha256": body.sha256,
        "tx_hash": body.tx_hash,
        "chain_id": body.chain_id,
        "created_by": body.closer_id
    })
    return {"ok": True, "ticket_id": ticket_id, "tx_hash": body.tx_hash}

class _Att(BaseModel): owner_table: str; owner_id: str; url: str; name: str; mime: Optional[str]=None
@app.post("/attachments")
async def att_create(body: _Att): return (await sb_insert("attachments", body.model_dump()))[0]
class MCPIn(BaseModel): ticket_id: str; messages: List[str]
@app.post("/mcp/summarize-ticket")
async def mcp(body: MCPIn):
    import httpx; url = os.getenv("MCP_SERVER_URL","http://localhost:7070")
    try:
        async with httpx.AsyncClient(timeout=20) as c:
            r = await c.post(f"{url}/summarize_and_triage", json=body.model_dump()); r.raise_for_status(); return r.json()
    except Exception: return {"summary":"No disponible","probable_cause":"Desconocida","next_steps":["Verificar MCP"],"suggested_priority":"MEDIA"}
