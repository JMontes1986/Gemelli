import os, httpx
SUPABASE_URL = os.getenv("SUPABASE_URL","")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY","")
POSTGREST_URL = SUPABASE_URL.rstrip('/') + '/rest/v1'
HEADERS = {"apikey": SUPABASE_ANON_KEY, "Authorization": f"Bearer {SUPABASE_ANON_KEY}", "Content-Type":"application/json","Accept":"application/json","Prefer":"return=representation"}
async def get(table, params=None):
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.get(f"{POSTGREST_URL}/{table}", headers=HEADERS, params=params or {}); r.raise_for_status(); return r.json()
async def insert(table, row):
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.post(f"{POSTGREST_URL}/{table}", headers=HEADERS, json=row); r.raise_for_status(); return r.json()
async def update(table, match, patch):
    params = {k: f"eq.{v}" for k,v in match.items()}
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.patch(f"{POSTGREST_URL}/{table}", headers=HEADERS, params=params, json=patch); r.raise_for_status(); return r.json()
