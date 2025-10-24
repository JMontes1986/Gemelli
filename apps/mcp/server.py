# apps/mcp/server.py
"""
MCP Server para Gemelli IT - Integración con ChatGPT
Proporciona herramientas de triage automático y resúmenes de tickets
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
import openai
import os
from datetime import datetime
import json

# Configuración
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY no configurada")

openai.api_key = OPENAI_API_KEY

app = FastAPI(
    title="Gemelli IT MCP Server",
    description="Model Context Protocol Server para análisis de tickets",
    version="1.0.0"
)

# ==================== MODELS ====================

class TicketMessage(BaseModel):
    """Mensaje individual en el hilo del ticket"""
    autor: str
    rol: str
    contenido: str
    timestamp: str

class TicketThread(BaseModel):
    """Hilo completo del ticket"""
    ticket_id: str
    titulo: str
    descripcion: str
    prioridad: str
    estado: str
    mensajes: List[TicketMessage]

class TriageResult(BaseModel):
    """Resultado del análisis de triage"""
    resumen: str = Field(description="Resumen conciso del problema")
    causa_probable: str = Field(description="Causa más probable del problema")
    pasos_siguientes: List[str] = Field(description="Lista de pasos recomendados")
    prioridad_sugerida: Literal["BAJA", "MEDIA", "ALTA", "CRITICA"]
    requiere_escalamiento: bool = Field(default=False)
    tiempo_estimado_minutos: Optional[int] = None
    categoria: str = Field(description="Categoría del problema")

class KnowledgeBaseQuery(BaseModel):
    """Query para base de conocimiento"""
    problema: str
    contexto: Optional[str] = None

# ==================== MCP TOOLS ====================

@app.post("/tools/summarize_and_triage", response_model=TriageResult)
async def summarize_and_triage(thread: TicketThread) -> TriageResult:
    """
    Herramienta principal de MCP: Analiza un ticket y proporciona
    resumen, causa probable, pasos siguientes y prioridad sugerida.
    
    Esta herramienta usa GPT-4 para analizar el contexto completo del ticket.
    """
    try:
        # Construir prompt con el contexto completo
        prompt = _build_triage_prompt(thread)
        
        # Llamar a OpenAI
        response = openai.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {
                    "role": "system",
                    "content": """Eres un experto en soporte técnico TI para instituciones educativas.
                    Analiza tickets de helpdesk y proporciona análisis estructurados.
                    Responde SIEMPRE en formato JSON válido con las claves exactas solicitadas."""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        # Parsear respuesta
        result = json.loads(response.choices[0].message.content)
        
        return TriageResult(
            resumen=result.get("resumen", "Sin resumen disponible"),
            causa_probable=result.get("causa_probable", "Causa desconocida"),
            pasos_siguientes=result.get("pasos_siguientes", ["Investigar más a fondo"]),
            prioridad_sugerida=result.get("prioridad_sugerida", "MEDIA"),
            requiere_escalamiento=result.get("requiere_escalamiento", False),
            tiempo_estimado_minutos=result.get("tiempo_estimado_minutos"),
            categoria=result.get("categoria", "General")
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar triage: {str(e)}"
        )

@app.post("/tools/suggest_solution")
async def suggest_solution(query: KnowledgeBaseQuery) -> dict:
    """
    Sugiere soluciones basadas en problemas similares previos
    """
    try:
        prompt = f"""
        Basándote en tu conocimiento de soporte técnico TI en instituciones educativas,
        proporciona una solución paso a paso para el siguiente problema:
        
        Problema: {query.problema}
        {f"Contexto adicional: {query.contexto}" if query.contexto else ""}
        
        Proporciona:
        1. Diagnóstico rápido
        2. Pasos de solución detallados
        3. Prevención futura
        4. Enlaces o recursos útiles (si aplica)
        
        Responde en formato JSON con claves: diagnostico, pasos, prevencion, recursos
        """
        
        response = openai.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {
                    "role": "system",
                    "content": "Eres un experto técnico en TI educativa. Proporciona soluciones prácticas y probadas."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.4,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar solución: {str(e)}"
        )

@app.post("/tools/classify_ticket")
async def classify_ticket(descripcion: str) -> dict:
    """
    Clasifica un ticket automáticamente en categorías
    """
    try:
        prompt = f"""
        Clasifica el siguiente ticket en las categorías apropiadas:
        
        Ticket: {descripcion}
        
        Categorías disponibles:
        - HARDWARE (problemas físicos de equipos)
        - SOFTWARE (problemas de aplicaciones/sistema operativo)
        - RED (problemas de conectividad)
        - ACCESO (problemas de contraseñas/permisos)
        - IMPRESORA (problemas de impresión)
        - OTRO
        
        Responde en JSON con:
        - categoria_principal: la categoría más relevante
        - categorias_secundarias: lista de otras categorías relevantes
        - nivel_urgencia: BAJO, MEDIO, ALTO, CRITICO
        - requiere_presencial: boolean
        """
        
        response = openai.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "Eres un clasificador experto de tickets de soporte TI."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al clasificar ticket: {str(e)}"
        )

@app.post("/tools/generate_report")
async def generate_report(tickets_data: dict) -> dict:
    """
    Genera un reporte analítico de múltiples tickets
    """
    try:
        prompt = f"""
        Analiza los siguientes datos de tickets y genera un reporte ejecutivo:
        
        {json.dumps(tickets_data, indent=2)}
        
        Proporciona:
        1. Resumen ejecutivo
        2. Problemas más comunes
        3. Tendencias identificadas
        4. Recomendaciones de mejora
        5. Métricas clave
        
        Responde en formato JSON estructurado.
        """
        
        response = openai.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {
                    "role": "system",
                    "content": "Eres un analista de datos de TI. Genera reportes concisos y accionables."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar reporte: {str(e)}"
        )

# ==================== HELPER FUNCTIONS ====================

def _build_triage_prompt(thread: TicketThread) -> str:
    """Construye el prompt para el análisis de triage"""
    
    mensajes_texto = "\n\n".join([
        f"[{msg.timestamp}] {msg.autor} ({msg.rol}): {msg.contenido}"
        for msg in thread.mensajes
    ])
    
    prompt = f"""
    Analiza el siguiente ticket de soporte técnico TI:
    
    INFORMACIÓN DEL TICKET:
    - ID: {thread.ticket_id}
    - Título: {thread.titulo}
    - Estado actual: {thread.estado}
    - Prioridad actual: {thread.prioridad}
    
    DESCRIPCIÓN INICIAL:
    {thread.descripcion}
    
    CONVERSACIÓN:
    {mensajes_texto if mensajes_texto else "No hay conversación adicional"}
    
    TAREA:
    Proporciona un análisis estructurado en formato JSON con las siguientes claves:
    
    {{
        "resumen": "Resumen conciso del problema en 2-3 oraciones",
        "causa_probable": "Diagnóstico técnico de la causa más probable",
        "pasos_siguientes": [
            "Paso 1 específico y accionable",
            "Paso 2 específico y accionable",
            "Paso 3 específico y accionable"
        ],
        "prioridad_sugerida": "BAJA|MEDIA|ALTA|CRITICA",
        "requiere_escalamiento": true o false,
        "tiempo_estimado_minutos": número estimado de minutos para resolver,
        "categoria": "HARDWARE|SOFTWARE|RED|ACCESO|IMPRESORA|OTRO"
    }}
    
    Considera:
    - Impacto en usuarios
    - Urgencia técnica
    - Complejidad de la solución
    - Recursos necesarios
    """
    
    return prompt

# ==================== HEALTH & INFO ====================

@app.get("/")
async def root():
    return {
        "service": "Gemelli IT MCP Server",
        "version": "1.0.0",
        "status": "running",
        "tools": [
            "summarize_and_triage",
            "suggest_solution",
            "classify_ticket",
            "generate_report"
        ]
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "openai_configured": bool(OPENAI_API_KEY)
    }

@app.get("/tools")
async def list_tools():
    """Lista todas las herramientas disponibles del MCP"""
    return {
        "tools": [
            {
                "name": "summarize_and_triage",
                "description": "Analiza un ticket y proporciona triage automático",
                "input": "TicketThread",
                "output": "TriageResult"
            },
            {
                "name": "suggest_solution",
                "description": "Sugiere soluciones paso a paso para un problema",
                "input": "KnowledgeBaseQuery",
                "output": "dict"
            },
            {
                "name": "classify_ticket",
                "description": "Clasifica automáticamente un ticket",
                "input": "str (descripcion)",
                "output": "dict"
            },
            {
                "name": "generate_report",
                "description": "Genera reportes analíticos de múltiples tickets",
                "input": "dict (tickets_data)",
                "output": "dict"
            }
        ]
    }

# ==================== ERROR HANDLERS ====================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {
        "error": exc.detail,
        "status_code": exc.status_code,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return {
        "error": "Error interno del servidor",
        "detail": str(exc),
        "status_code": 500,
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("MCP_PORT", 8001)),
        log_level="info"
    )
