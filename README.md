# 🧠 Gemelli IT - Sistema de Inventario & HelpDesk

Sistema completo de gestión de inventario TI y mesa de ayuda con auditoría blockchain y AI-powered triage.

## 🎯 Características Principales

- ✅ **Gestión de Inventario TI**: Hoja de vida completa de cada dispositivo
- ✅ **HelpDesk Inteligente**: Sistema de tickets con triage automático vía ChatGPT MCP
- ✅ **Auditoría Blockchain**: Registro inmutable de cambios importantes
- ✅ **Dashboard Analítico**: Métricas y KPIs en tiempo real
- ✅ **Control de Backups**: Calendario y seguimiento de copias de seguridad
- ✅ **Multi-tenant**: Políticas RLS por dependencia organizacional
- ✅ **Mobile-First**: Totalmente responsivo

## 🏗️ Arquitectura

```
Frontend: Astro + React + TailwindCSS + shadcn/ui
Backend: FastAPI + Python
Database: PostgreSQL (Supabase)
Auth: Supabase Auth (Email/OAuth)
Blockchain: Solidity (Polygon Amoy)
AI: OpenAI + MCP Server
Deployment: Netlify + Supabase
```

## 📁 Estructura del Proyecto

```
gemelli-it/
├── apps/
│   ├── web/              # Frontend (Astro + React)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── layouts/
│   │   │   └── lib/
│   │   ├── astro.config.mjs
│   │   └── package.json
│   │
│   ├── api/              # Backend (FastAPI)
│   │   ├── app/
│   │   │   ├── routers/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   └── main.py
│   │   ├── requirements.txt
│   │   └── netlify.toml
│   │
│   ├── mcp/              # MCP Connector
│   │   ├── server.py
│   │   ├── tools/
│   │   └── requirements.txt
│   │
│   └── chain/            # Smart Contracts
│       ├── contracts/
│       ├── scripts/
│       ├── hardhat.config.js
│       └── package.json
│
├── infra/
│   ├── supabase.sql      # Schema + RLS
│   └── seed.sql          # Data inicial
│
├── .env.example
├── README.md
├── netlify.toml
└── package.json
```

## 🚀 Instalación y Configuración

### 1. Prerrequisitos

```bash
Node.js >= 18
Python >= 3.10
pnpm >= 8
PostgreSQL (o cuenta Supabase)
MetaMask o wallet Web3
```

### 2. Clonar y configurar

```bash
# Clonar repositorio
git clone https://github.com/tu-org/gemelli-it.git
cd gemelli-it

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env
```

### 3. Configurar variables de entorno (.env)

```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE=tu_service_role_key

# Auth
JWT_SECRET=tu_secreto_jwt_256bits

# OpenAI + MCP
OPENAI_API_KEY=sk-...
MCP_SERVER_URL=http://localhost:8001

# Blockchain
WEB3_RPC_URL=https://rpc-amoy.polygon.technology
CHAIN_ID=80002
CONTRACT_ADDRESS=0x...

# API
API_URL=http://localhost:8000
```

### 4. Configurar Base de Datos

```bash
# Ejecutar schema
pnpm db:push

# Cargar datos de prueba
pnpm db:seed
```

### 5. Desplegar Smart Contract

```bash
cd apps/chain
pnpm install
pnpm hardhat run scripts/deploy.js --network amoy
# Copiar CONTRACT_ADDRESS al .env
```

### 6. Ejecutar en desarrollo

```bash
# Terminal 1: Backend
cd apps/api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2: MCP Server
cd apps/mcp
source venv/bin/activate
python server.py

# Terminal 3: Frontend
cd apps/web
pnpm dev
```

Accede a: `http://localhost:4321`

## 📊 Modelo de Datos

### Tablas Principales

- **org_units**: Dependencias organizacionales
- **users**: Usuarios con roles (DOCENTE, ADMINISTRATIVO, TI, DIRECTOR, LIDER_TI)
- **devices**: Equipos de TI (PC, LAPTOP, IMPRESORA, RED, OTRO)
- **device_specs**: Especificaciones técnicas (CPU, RAM, disco, OS, licencias)
- **device_logs**: Historial de cambios y mantenimientos
- **backups**: Copias de seguridad (incremental, completa, nube, local)
- **tickets**: Requerimientos del HelpDesk
- **ticket_comments**: Comentarios y adjuntos
- **audit_chain**: Registro blockchain (hash, tx_hash, block_number)
- **attachments**: Archivos adjuntos

### Políticas RLS

```sql
-- Los usuarios solo ven registros de su org_unit
-- Solo LIDER_TI puede editar inventario
-- Todos los roles pueden crear tickets
-- Solo TI puede asignar y cerrar tickets
```

## 🔐 Roles y Permisos

| Rol | Crear Ticket | Ver Inventario | Editar Inventario | Asignar Tickets | Dashboard |
|-----|--------------|----------------|-------------------|-----------------|-----------|
| DOCENTE | ✅ | ✅ (limitado) | ❌ | ❌ | ❌ |
| ADMINISTRATIVO | ✅ | ✅ (limitado) | ❌ | ❌ | ❌ |
| DIRECTOR | ✅ | ✅ | ❌ | ❌ | ✅ |
| TI | ✅ | ✅ | ✅ | ✅ | ✅ |
| LIDER_TI | ✅ | ✅ | ✅ | ✅ | ✅ |

## 🤖 Integración MCP + ChatGPT

El sistema incluye un servidor MCP que expone herramientas para ChatGPT:

```python
# Tool: summarize_and_triage
Input: ticket_thread (conversación completa del ticket)
Output: {
  "resumen": "...",
  "causa_probable": "...",
  "pasos_siguientes": ["...", "..."],
  "prioridad_sugerida": "ALTA|MEDIA|BAJA"
}
```

## 🔗 API Endpoints

### Auth
- `POST /auth/login` - Autenticación
- `GET /auth/profile` - Perfil del usuario

### Inventario
- `GET /inventory/devices` - Listar dispositivos
- `POST /inventory/devices` - Crear dispositivo
- `GET /inventory/devices/{id}` - Detalle
- `GET /inventory/devices/{id}/cv` - Hoja de vida completa
- `PUT /inventory/devices/{id}` - Actualizar
- `DELETE /inventory/devices/{id}` - Eliminar

### HelpDesk
- `GET /tickets` - Listar tickets
- `POST /tickets` - Crear ticket
- `GET /tickets/{id}` - Detalle
- `PUT /tickets/{id}` - Actualizar estado
- `POST /tickets/{id}/comments` - Agregar comentario
- `POST /tickets/{id}/ai-triage` - Obtener sugerencias AI

### Backups
- `GET /backups` - Listar copias
- `POST /backups` - Registrar backup
- `GET /backups/calendar` - Vista de calendario

### Dashboard
- `GET /dashboard/metrics` - KPIs generales
- `GET /dashboard/devices-by-status` - Distribución de equipos
- `GET /dashboard/tickets-by-priority` - Distribución de tickets

### Blockchain
- `POST /chain/hash` - Generar y registrar hash
- `GET /chain/verify/{hash}` - Verificar integridad

## 🚢 Despliegue en Producción

### Netlify (Frontend + Functions)

```bash
# 1. Conectar repositorio en Netlify
# 2. Configurar build settings:
#    Build command: cd apps/web && pnpm build
#    Publish directory: apps/web/dist
#    Functions directory: apps/api/app

# 3. Agregar variables de entorno en Netlify UI
```

### Supabase (Database)

```bash
# 1. Crear proyecto en supabase.com
# 2. Ejecutar migrations:
supabase db push --db-url "postgresql://..."
```

### Render/Fly.io (Backend alternativo)

```bash
# render.yaml
services:
  - type: web
    name: gemelli-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Polygon Amoy (Smart Contract)

```bash
cd apps/chain
pnpm hardhat verify --network amoy <CONTRACT_ADDRESS>
```

## 🧪 Testing

```bash
# Backend tests
cd apps/api
pytest

# Frontend tests
cd apps/web
pnpm test

# E2E tests
pnpm test:e2e
```

## 📝 Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Inicia todo (frontend + backend)
pnpm dev:web          # Solo frontend
pnpm dev:api          # Solo backend
pnpm dev:mcp          # Solo MCP server

# Base de datos
pnpm db:push          # Aplicar schema
pnpm db:seed          # Cargar datos de prueba
pnpm db:reset         # Resetear DB

# Build
pnpm build            # Build completo
pnpm build:web        # Solo frontend
pnpm build:api        # Solo backend

# Testing
pnpm test             # Todos los tests
pnpm test:unit        # Unit tests
pnpm test:integration # Integration tests
pnpm test:e2e         # End-to-end tests

# Linting
pnpm lint             # Lint todo
pnpm lint:fix         # Auto-fix

# Deployment
pnpm deploy           # Deploy completo
pnpm deploy:contract  # Solo smart contract
```

## 🎨 Guía de Estilo UI

### Paleta de Colores

```css
/* Primarios */
--blue-600: #2563eb    /* Acciones principales */
--purple-600: #9333ea  /* Blockchain/Tech */
--green-600: #16a34a   /* Estados positivos */
--orange-600: #ea580c  /* Alertas */
--red-600: #dc2626     /* Errores/Crítico */

/* Neutros */
--gray-50: #f9fafb
--gray-900: #111827
```

### Componentes

- **Bordes redondeados**: `rounded-xl` (12px)
- **Sombras**: `shadow-md` para tarjetas
- **Animaciones**: Transiciones suaves de 200ms
- **Espaciado**: Sistema de 4px (gap-4, p-6, etc.)

## 📱 Responsividad

El sistema usa **mobile-first design**:

```tsx
// Breakpoints Tailwind
sm: 640px   // Móviles grandes
md: 768px   // Tablets
lg: 1024px  // Desktop
xl: 1280px  // Desktop grande
```

## 🔒 Seguridad

### Implementado

- ✅ JWT tokens con expiración
- ✅ Row Level Security (RLS) en Supabase
- ✅ CSP headers
- ✅ Rate limiting en API
- ✅ Validación de inputs (Pydantic)
- ✅ Sanitización de uploads
- ✅ HTTPS obligatorio en producción
- ✅ Hashing blockchain para auditoría

### Headers de Seguridad

```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com"
```

## 🌱 Datos de Prueba

El archivo `infra/seed.sql` incluye:

- **2 org_units**: Colegio, Administración
- **8 usuarios**:
  - 1 Líder TI: admin@gemelli.edu.co
  - 2 Técnicos TI
  - 3 Docentes
  - 2 Administrativos
  - 1 Director
- **8 dispositivos** con hojas de vida completas
- **6 tickets** en varios estados
- **3 registros de backup**
- **1 entrada blockchain**

**Usuario de prueba:**
```
Email: admin@gemelli.edu.co
Password: Admin123!
Rol: LIDER_TI
```

## 🐛 Troubleshooting

### Error: "Supabase connection failed"
```bash
# Verificar variables de entorno
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Probar conexión
curl $SUPABASE_URL/rest/v1/
```

### Error: "Contract deployment failed"
```bash
# Verificar fondos en wallet
# Obtener MATIC de faucet: https://faucet.polygon.technology/

# Verificar network
pnpm hardhat run scripts/check-network.js
```

### Error: "MCP server not responding"
```bash
# Verificar que el servidor esté corriendo
curl http://localhost:8001/health

# Ver logs
cd apps/mcp
tail -f logs/mcp.log
```

### Error de CORS en API
```python
# apps/api/app/main.py
# Verificar origins permitidos
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4321", "https://tu-dominio.netlify.app"],
    ...
)
```

## 📚 Documentación Adicional

- [Guía de Desarrollo Frontend](./docs/frontend.md)
- [API Reference](./docs/api.md)
- [Smart Contract ABI](./apps/chain/artifacts/abi.json)
- [MCP Tools Documentation](./docs/mcp.md)
- [Database Schema](./docs/schema.md)

## 🤝 Contribuir

```bash
# 1. Fork el repositorio
# 2. Crear rama feature
git checkout -b feature/nueva-funcionalidad

# 3. Commit con formato convencional
git commit -m "feat: agregar exportación de reportes"

# 4. Push y crear PR
git push origin feature/nueva-funcionalidad
```

### Convenciones de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato, sin cambios de código
refactor: refactorización de código
test: agregar o actualizar tests
chore: tareas de mantenimiento
```

## 📄 Licencia

MIT License - ver [LICENSE](./LICENSE) para detalles

## 👥 Equipo

Desarrollado para Colegio Gemelli

## 🆘 Soporte

- 📧 Email: soporte@gemelli.edu.co
- 📞 Tel: +57 (6) 123-4567
- 🌐 Web: https://gemelli.edu.co

## 🎯 Roadmap

### v1.0 (Actual)
- ✅ Gestión de inventario
- ✅ Sistema de tickets
- ✅ Auditoría blockchain
- ✅ MCP integration

### v1.1 (Próximo)
- [ ] Notificaciones push
- [ ] Reportes PDF
- [ ] QR codes para equipos
- [ ] App móvil nativa

### v2.0 (Futuro)
- [ ] IA predictiva para mantenimiento
- [ ] Integración con Active Directory
- [ ] Dashboard ejecutivo avanzado
- [ ] API pública documentada

---

**🚀 ¡Listo para producción!**

Para comenzar: `pnpm install && pnpm dev`