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
curl -X POST http://localhost:8001/tools/summarize_and_t