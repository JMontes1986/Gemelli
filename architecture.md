# 🏗️ Gemelli IT - Arquitectura del Sistema

## 📐 Visión General

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIOS                                 │
│  (Docentes, Administrativos, TI, Director, Líder TI)            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Astro + React)                      │
│  • Dashboard   • Inventario   • HelpDesk   • Backups           │
│  • Mobile-First   • PWA-Ready   • Tailwind CSS                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI + Python)                    │
│  • REST API   • Auth JWT   • Business Logic                     │
│  • File Upload   • Rate Limiting   • Validation                 │
└──────┬─────────────┬──────────────┬────────────────┬────────────┘
       │             │              │                │
       ▼             ▼              ▼                ▼
┌─────────┐  ┌──────────┐  ┌──────────────┐  ┌──────────────┐
│Supabase │  │MCP Server│  │   Blockchain │  │   Storage    │
│PostgreSQL│  │(ChatGPT) │  │   (Polygon)  │  │  (Supabase)  │
│  + Auth  │  │   AI     │  │   Audit Log  │  │   Files      │
└─────────┘  └──────────┘  └──────────────┘  └──────────────┘
```

---

## 🎯 Capas de la Arquitectura

### 1. Capa de Presentación (Frontend)

**Tecnologías:**
- **Astro 4.0:** Framework principal, SSR/SSG
- **React 18:** Componentes interactivos
- **TailwindCSS 3:** Estilos utility-first
- **shadcn/ui:** Componentes UI accesibles
- **Recharts:** Visualización de datos
- **Lucide React:** Iconografía

**Responsabilidades:**
- Renderizado de interfaces
- Validación de formularios
- State management local
- Interacción con APIs
- Responsive design

**Estructura:**
```
apps/web/
├── src/
│   ├── components/      # Componentes React
│   │   ├── ui/          # Componentes base (shadcn)
│   │   ├── dashboard/   # Componentes de dashboard
│   │   ├── inventory/   # Componentes de inventario
│   │   └── helpdesk/    # Componentes de tickets
│   ├── layouts/         # Layouts de Astro
│   ├── pages/           # Páginas/Rutas
│   ├── lib/             # Utilidades y helpers
│   │   ├── api.ts       # Cliente API
│   │   ├── auth.ts      # Autenticación
│   │   └── supabase.ts  # Cliente Supabase
│   └── styles/          # Estilos globales
└── public/              # Assets estáticos
```

---

### 2. Capa de Aplicación (Backend)

**Tecnologías:**
- **FastAPI 0.109:** Framework web
- **Pydantic 2:** Validación de datos
- **Python-JOSE:** JWT tokens
- **Supabase-py:** Cliente de Supabase

**Responsabilidades:**
- Lógica de negocio
- Validación de entrada
- Autorización y autenticación
- Orquestación de servicios
- Rate limiting y caching

**Estructura:**
```
apps/api/
├── app/
│   ├── main.py          # Entry point
│   ├── routers/         # Endpoints
│   │   ├── auth.py
│   │   ├── inventory.py
│   │   ├── tickets.py
│   │   ├── backups.py
│   │   └── dashboard.py
│   ├── models/          # Modelos Pydantic
│   │   ├── user.py
│   │   ├── device.py
│   │   └── ticket.py
│   ├── services/        # Lógica de negocio
│   │   ├── inventory_service.py
│   │   ├── ticket_service.py
│   │   └── blockchain_service.py
│   ├── middleware/      # Middlewares
│   │   ├── auth.py
│   │   ├── cors.py
│   │   └── rate_limit.py
│   └── utils/           # Utilidades
│       ├── crypto.py
│       ├── validators.py
│       └── helpers.py
└── tests/               # Tests
```

---

### 3. Capa de Datos

#### 3.1 Base de Datos (PostgreSQL en Supabase)

**Características:**
- Schemas normalizados
- Row Level Security (RLS)
- Triggers automáticos
- Funciones almacenadas
- Full-text search

**Tablas Principales:**
```sql
org_units          → Unidades organizacionales
users              → Usuarios y roles
devices            → Inventario de dispositivos
device_specs       → Especificaciones técnicas
device_logs        → Historial de cambios
backups            → Copias de seguridad
tickets            → Sistema HelpDesk
ticket_comments    → Comentarios de tickets
audit_chain        → Registro blockchain
attachments        → Archivos adjuntos
```

**Políticas RLS:**
- Aislamiento por `org_unit_id`
- Control de acceso basado en roles
- Solo propietarios pueden editar
- Logs inmutables (solo INSERT)

#### 3.2 Almacenamiento de Archivos

**Supabase Storage:**
- Imágenes de dispositivos
- Adjuntos de tickets
- Evidencias de backups
- Documentos y manuales

**Organización:**
```
gemelli-attachments/
├── devices/
│   └── {device_id}/
├── tickets/
│   └── {ticket_id}/
├── backups/
│   └── {backup_id}/
└── users/
    └── {user_id}/
```

---

### 4. Capa de Inteligencia (MCP Server)

**Tecnologías:**
- **FastAPI:** Servidor MCP
- **OpenAI GPT-4:** Motor de AI
- **LangChain:** (opcional para RAG)

**Herramientas MCP:**

1. **`summarize_and_triage`**
   - Input: Thread completo del ticket
   - Output: Resumen, causa, pasos, prioridad
   - Modelo: GPT-4 Turbo

2. **`suggest_solution`**
   - Input: Descripción del problema
   - Output: Solución paso a paso
   - Modelo: GPT-4

3. **`classify_ticket`**
   - Input: Descripción del ticket
   - Output: Categoría, urgencia
   - Modelo: GPT-4 (optimizado)

4. **`generate_report`**
   - Input: Datos de múltiples tickets
   - Output: Reporte analítico
   - Modelo: GPT-4 Turbo

**Flujo de Trabajo:**
```
Ticket creado
    ↓
Backend llama MCP
    ↓
MCP analiza con GPT-4
    ↓
Retorna JSON estructurado
    ↓
Backend guarda como comentario del sistema
    ↓
TI ve sugerencia en UI
```

---

### 5. Capa de Blockchain (Polygon Amoy)

**Smart Contract: `GemelliAuditLog`**

**Funciones Principales:**
```solidity
record(hash, action, entityId, metadata)
recordBatch(hashes[], actions[], entityIds[])
verify(hash) → (exists, record)
getRecordsByEntity(entityId) → records[]
```

**Eventos Auditados:**
- CREATE_DEVICE
- UPDATE_DEVICE
- DELETE_DEVICE
- CREATE_BACKUP
- CLOSE_TICKET
- UPDATE_SPECS

**Flujo de Auditoría:**
```
1. Acción importante ocurre (ej: cerrar ticket)
2. Backend genera hash SHA256
3. Backend llama a contract.record()
4. Transacción minada en Polygon
5. TX hash y block guardados en DB
6. Usuario puede verificar integridad
```

**Gas Optimization:**
- Uso de `recordBatch()` para múltiples registros
- Metadata en eventos, no en storage
- Índices optimizados

---

## 🔐 Seguridad

### Autenticación

```
Usuario → Login → Supabase Auth → JWT Token
                                      ↓
                         Token en localStorage/cookie
                                      ↓
                         Cada request incluye token
                                      ↓
                         Backend valida con Supabase
                                      ↓
                         RLS aplica automáticamente
```

### Row Level Security (RLS)

**Ejemplo de política:**
```sql
CREATE POLICY "users_see_own_org_devices"
ON devices FOR SELECT
USING (
  org_unit_id IN (
    SELECT org_unit_id 
    FROM users 
    WHERE id = auth.uid()
  )
);
```

### Protección de Datos Sensibles

- Passwords hasheados con bcrypt
- API keys en variables de entorno
- Private keys nunca en código
- HTTPS obligatorio en producción
- CSP headers estrictos

---

## 📊 Flujo de Datos

### Crear Dispositivo

```
1. Usuario (LIDER_TI) llena formulario
    ↓
2. Frontend valida campos
    ↓
3. POST /inventory/devices con JWT
    ↓
4. Backend valida rol y permisos
    ↓
5. Inserta en tabla devices
    ↓
6. RLS verifica org_unit_id
    ↓
7. Trigger crea log automático
    ↓
8. Backend genera hash
    ↓
9. Llama smart contract
    ↓
10. TX minada en Polygon
    ↓
11. Guarda TX hash en audit_chain
    ↓
12. Retorna dispositivo creado
    ↓
13. Frontend actualiza UI
```

### Resolver Ticket con AI

```
1. Usuario (TI) abre ticket
    ↓
2. Frontend carga thread completo
    ↓
3. GET /tickets/{id}
    ↓
4. Backend consulta DB
    ↓
5. Retorna ticket + comentarios
    ↓
6. Frontend muestra ticket
    ↓
7. TI click en "Obtener sugerencia AI"
    ↓
8. Frontend POST /tickets/{id}/ai-triage
    ↓
9. Backend construye payload para MCP
    ↓
10. POST /tools/summarize_and_triage al MCP
    ↓
11. MCP Server llama OpenAI GPT-4
    ↓
12. GPT-4 analiza y retorna JSON
    ↓
13. MCP parsea y valida respuesta
    ↓
14. Retorna TriageResult al backend
    ↓
15. Backend guarda como comentario del sistema
    ↓
16. Retorna sugerencia a frontend
    ↓
17. Frontend muestra sugerencia en UI
    ↓
18. TI decide acción basado en AI
```

---

## 🚀 Despliegue

### Ambientes

```
Development  → localhost
Staging      → staging.netlify.app
Production   → gemelli-it.netlify.app
```

### Pipeline CI/CD

```yaml
# .github/workflows/deploy.yml
on: [push]
jobs:
  test:
    - Lint code
    - Run unit tests
    - Run integration tests
  
  build:
    - Build frontend
    - Build Docker images
  
  deploy:
    - Deploy to Netlify
    - Update env vars
    - Run migrations
    - Smoke tests
```

### Infraestructura

```
Frontend:    Netlify Edge (CDN global)
Backend:     Netlify Functions / Render
Database:    Supabase (AWS)
Storage:     Supabase Storage (S3-compatible)
Blockchain:  Polygon Amoy / Mainnet
MCP:         Cloud Run / Fly.io
```

---

## 📈 Escalabilidad

### Optimizaciones Implementadas

1. **Frontend:**
   - Code splitting automático (Astro)
   - Lazy loading de imágenes
   - Service Worker para PWA
   - Preload de rutas críticas

2. **Backend:**
   - Connection pooling en Supabase
   - Rate limiting por IP/usuario
   - Caching con Redis (opcional)
   - Async/await en I/O operations

3. **Base de Datos:**
   - Índices en columnas frecuentes
   - Particionamiento de logs por fecha
   - Funciones almacenadas para queries complejas
   - Read replicas (Supabase Pro)

4. **Blockchain:**
   - Batch transactions
   - Off-chain storage (solo hashes)
   - Gas price optimization

### Límites Actuales

- **Usuarios concurrentes:** ~1000
- **Dispositivos:** ~10,000
- **Tickets/día:** ~500
- **Storage:** 100GB (Supabase)
- **AI requests:** Según plan OpenAI

### Próximos Pasos de Escalamiento

- Implementar Redis para caching
- Migrar a Kubernetes para backend
- Read replicas en DB
- CDN para assets estáticos
- WebSocket para tiempo real

---

## 🔧 Extensibilidad

### Agregar Nuevo Módulo

1. Crear tabla en SQL
2. Agregar modelo Pydantic
3. Crear router en FastAPI
4. Implementar servicio
5. Crear componentes React
6. Agregar ruta en Astro
7. Actualizar tests

### Integrar Nuevo Servicio

```python
# apps/api/app/services/nuevo_servicio.py
class NuevoServicio:
    def __init__(self, supabase_client):
        self.supabase = supabase_client
    
    async def metodo(self):
        # Implementación
        pass
```

### Agregar Herramienta MCP

```python
# apps/mcp/tools/nueva_herramienta.py
@app.post("/tools/nueva_herramienta")
async def nueva_herramienta(input: Model):
    # Llamar a OpenAI
    # Procesar respuesta
    # Retornar resultado estructurado
    pass
```

---

**🎉 Sistema diseñado para crecer y adaptarse a las necesidades del Colegio Gemelli**
