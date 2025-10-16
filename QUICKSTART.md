# 🚀 Gemelli IT - Guía de Inicio Rápido

## ⚡ Inicio Rápido (5 minutos)

### 1. Clonar y configurar

```bash
# Clonar repositorio
git clone https://github.com/tu-org/gemelli-it.git
cd gemelli-it

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores reales
```

### 2. Configurar Supabase

```bash
# Ir a https://supabase.com y crear un proyecto

# Ejecutar esquema
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" < infra/supabase.sql

# Cargar datos de prueba
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" < infra/seed.sql
```

### 3. Desplegar Smart Contract

```bash
# Obtener MATIC gratis en https://faucet.polygon.technology/

cd apps/chain
pnpm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network amoy

# Copiar CONTRACT_ADDRESS al .env
```

### 4. Iniciar desarrollo

```bash
# En la raíz del proyecto
pnpm dev

# Esto inicia:
# - Frontend en http://localhost:4321
# - Backend en http://localhost:8000
# - MCP Server en http://localhost:8001
```

### 5. Acceder a la aplicación

```
URL: http://localhost:4321
Usuario: admin@gemelli.edu.co
Password: Admin123!
```

---

## 📋 Checklist de Configuración

- [ ] Node.js >= 18 instalado
- [ ] Python >= 3.10 instalado
- [ ] pnpm >= 8 instalado
- [ ] Cuenta en Supabase creada
- [ ] Proyecto Supabase configurado
- [ ] Variables de entorno en .env
- [ ] OpenAI API Key configurada
- [ ] Wallet con MATIC en Amoy
- [ ] Smart Contract desplegado
- [ ] Base de datos inicializada

---

## 🔧 Comandos Esenciales

### Desarrollo

```bash
pnpm dev              # Iniciar todo
pnpm dev:web          # Solo frontend
pnpm dev:api          # Solo backend
pnpm dev:mcp          # Solo MCP server
```

### Base de Datos

```bash
pnpm db:push          # Aplicar schema
pnpm db:seed          # Cargar datos de prueba
pnpm db:reset         # Resetear completamente
```

### Blockchain

```bash
pnpm contract:compile  # Compilar contrato
pnpm contract:deploy   # Desplegar a Amoy
pnpm contract:verify   # Verificar en PolygonScan
pnpm contract:test     # Ejecutar tests
```

### Testing

```bash
pnpm test             # Todos los tests
pnpm test:web         # Tests de frontend
pnpm test:api         # Tests de backend
pnpm test:e2e         # Tests end-to-end
```

### Build y Deploy

```bash
pnpm build            # Build completo
pnpm deploy           # Deploy a Netlify
pnpm deploy:contract  # Deploy solo contrato
```

---

## 🎯 Casos de Uso Rápidos

### Crear un Nuevo Dispositivo

```bash
curl -X POST http://localhost:8000/inventory/devices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "PC-TEST-001",
    "tipo": "PC",
    "estado": "ACTIVO",
    "ubicacion": "Sala 101"
  }'
```

### Crear un Ticket

```bash
curl -X POST http://localhost:8000/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Problema de red",
    "descripcion": "No hay internet en la sala 302",
    "prioridad": "ALTA"
  }'
```

### Obtener Triage con AI

```bash
curl -X POST http://localhost:8001/tools/summarize_and_triage \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id": "123",
    "titulo": "Internet lento",
    "descripcion": "La conexión está muy lenta",
    "prioridad": "ALTA",
    "estado": "ABIERTO",
    "mensajes": [
      {
        "autor": "Juan",
        "rol": "DOCENTE",
        "contenido": "No puedo cargar videos",
        "timestamp": "2025-10-16T10:00:00Z"
      }
    ]
  }'
```

---

## 🐛 Solución de Problemas Comunes

### Error: "Cannot connect to Supabase"

```bash
# Verificar variables de entorno
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Probar conexión
curl $SUPABASE_URL/rest/v1/
```

**Solución:** Verifica que las URLs y keys estén correctas en `.env`

### Error: "Contract deployment failed"

```bash
# Verificar balance
npx hardhat run scripts/check-balance.js --network amoy

# Obtener MATIC gratis
# https://faucet.polygon.technology/
```

**Solución:** Asegúrate de tener al menos 0.1 MATIC en tu wallet

### Error: "Python module not found"

```bash
# Crear entorno virtual
cd apps/api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### Error: "Port already in use"

```bash
# Matar procesos en puertos
kill -9 $(lsof -ti:8000)  # Backend
kill -9 $(lsof -ti:4321)  # Frontend
kill -9 $(lsof -ti:8001)  # MCP
```

### Error: "OpenAI API rate limit"

**Solución:** 
1. Espera 60 segundos
2. Verifica tu plan de OpenAI
3. Considera usar GPT-3.5-turbo para desarrollo

---

## 📊 Estructura de URLs

### Frontend (Astro)
- `/` - Landing page / Login
- `/dashboard` - Dashboard principal
- `/inventory` - Listado de dispositivos
- `/inventory/:id` - Hoja de vida del dispositivo
- `/helpdesk` - Tickets
- `/helpdesk/:id` - Detalle de ticket
- `/backups` - Calendario de backups
- `/admin/users` - Gestión de usuarios

### Backend (FastAPI)
- `GET /` - Info de la API
- `GET /health` - Health check
- `GET /auth/profile` - Perfil del usuario
- `GET /inventory/devices` - Listar dispositivos
- `POST /inventory/devices` - Crear dispositivo
- `GET /inventory/devices/:id/cv` - Hoja de vida
- `GET /tickets` - Listar tickets
- `POST /tickets` - Crear ticket
- `POST /tickets/:id/comments` - Comentar
- `GET /dashboard/metrics` - Métricas
- `POST /chain/hash` - Registrar en blockchain

### MCP Server
- `GET /` - Info del servidor
- `GET /health` - Health check
- `GET /tools` - Listar herramientas
- `POST /tools/summarize_and_triage` - Triage automático
- `POST /tools/suggest_solution` - Sugerir solución
- `POST /tools/classify_ticket` - Clasificar ticket

---

## 🔐 Usuarios de Prueba

| Email | Password | Rol | Permisos |
|-------|----------|-----|----------|
| admin@gemelli.edu.co | Admin123! | LIDER_TI | Todos |
| ana.lopez@gemelli.edu.co | Tech123! | TI | Gestión IT |
| maria.garcia@gemelli.edu.co | Prof123! | DOCENTE | Ver y crear tickets |
| director@gemelli.edu.co | Dir123! | DIRECTOR | Dashboard y reportes |

---

## 📝 Flujos de Trabajo

### Flujo 1: Registrar Nuevo Equipo

1. Login como LIDER_TI
2. Ir a `/inventory`
3. Click en "Nuevo Dispositivo"
4. Completar formulario:
   - Nombre, tipo, ubicación
   - Especificaciones técnicas
   - Usuario asignado (opcional)
5. Guardar
6. ✅ Evento registrado en blockchain automáticamente

### Flujo 2: Crear y Resolver Ticket

1. Login como DOCENTE
2. Ir a `/helpdesk`
3. Click en "Nuevo Ticket"
4. Describir el problema
5. Adjuntar evidencias (opcional)
6. Enviar

**Como TI:**
1. Ver ticket en dashboard
2. Click en el ticket
3. Ver sugerencia AI automática
4. Agregar comentarios
5. Cambiar estado a "EN_PROCESO"
6. Resolver problema
7. Marcar como "RESUELTO"
8. ✅ Cierre registrado en blockchain

### Flujo 3: Programar Backup

1. Login como TI
2. Ir a `/backups`
3. Seleccionar dispositivo
4. Configurar:
   - Tipo (incremental/completa)
   - Almacenamiento (nube/local)
   - Frecuencia
5. Guardar
6. Sistema ejecuta según programación
7. ✅ Registro en blockchain al completar

---

## 🎨 Personalización

### Cambiar Colores

Edita `apps/web/tailwind.config.cjs`:

```javascript
colors: {
  primary: {
    50: '#f0f9ff',
    // ... tus colores
  }
}
```

### Agregar Logo

Coloca tu logo en `apps/web/public/logo.png` y actualiza:

```tsx
<img src="/logo.png" alt="Logo" />
```

### Modificar Textos

Edita `apps/web/src/config/texts.ts` (crear si no existe):

```typescript
export const TEXTS = {
  appName: "Tu Nombre",
  welcomeMessage: "Bienvenido a...",
  // ...
}
```

---

## 📈 Monitoreo en Producción

### Logs de Netlify

```bash
netlify logs
```

### Logs de Supabase

Ve a: https://app.supabase.com/project/YOUR_PROJECT/logs/explorer

### Verificar Transacciones Blockchain

https://amoy.polygonscan.com/address/YOUR_CONTRACT_ADDRESS

### Métricas de OpenAI

https://platform.openai.com/usage

---

## 🔄 Actualizar el Sistema

```bash
# Pull cambios
git pull origin main

# Reinstalar dependencias si es necesario
pnpm install

# Aplicar migraciones de DB
pnpm db:push

# Rebuild
pnpm build

# Deploy
pnpm deploy
```

---

## 🆘 Soporte y Recursos

### Documentación
- [README Principal](./README.md)
- [API Reference](./docs/api.md)
- [Database Schema](./docs/schema.md)

### Links Útiles
- **Supabase Docs:** https://supabase.com/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **Astro Docs:** https://docs.astro.build
- **Polygon Docs:** https://docs.polygon.technology
- **OpenAI Docs:** https://platform.openai.com/docs

### Comunidad
- GitHub Issues: https://github.com/tu-org/gemelli-it/issues
- Discord: [Tu servidor Discord]
- Email: soporte@gemelli.edu.co

---

## 🎯 Próximos Pasos Recomendados

1. ✅ Completar la configuración inicial
2. 🧪 Probar todos los flujos de trabajo
3. 👥 Crear usuarios reales para tu organización
4. 📊 Importar inventario existente
5. 🎨 Personalizar colores y branding
6. 📧 Configurar notificaciones por email
7. 📱 Probar en dispositivos móviles
8. 🚀 Desplegar a producción
9. 📈 Configurar monitoreo
10. 🔒 Revisar políticas de seguridad

---

## 💡 Tips Pro

### Desarrollo más Rápido

```bash
# Usar nodemon para auto-restart
pnpm add -D nodemon
nodemon --exec "pnpm dev:api"
```

### Debugging

```bash
# Backend con debug
cd apps/api
python -m debugpy --listen 5678 --wait-for-client -m uvicorn app.main:app --reload
```

### Performance

- Usa `React.memo()` para componentes pesados
- Implementa lazy loading: `const Component = lazy(() => import('./Component'))`
- Optimiza imágenes con https://squoosh.app
- Usa índices en queries frecuentes de DB

### Seguridad

- Nunca hagas commit del `.env`
- Rota las claves cada 90 días
- Usa diferentes claves para dev/prod
- Habilita 2FA en Supabase y Netlify
- Revisa dependencias: `pnpm audit`

---

**¡Listo para empezar! 🚀**

Si tienes problemas, revisa la sección de troubleshooting o abre un issue en GitHub.