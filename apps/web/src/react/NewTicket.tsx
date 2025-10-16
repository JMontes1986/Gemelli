import React, { useState } from 'react';
export default function NewTicket(){
  const [title, setTitle] = useState(''); const [description, setDescription] = useState('');
  const [role, setRole] = useState('DOCENTE'); const [priority, setPriority] = useState('MEDIA');
  const [createdBy, setCreatedBy] = useState('11111111-1111-1111-1111-111111111111');
  const [ok, setOk] = useState<string | null>(null); const [err, setErr] = useState<string | null>(null);
  const submit = async (e:React.FormEvent)=>{ e.preventDefault(); setOk(null); setErr(null);
    try { const r = await fetch('/api/tickets', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title, description, priority, role_at_creation: role, created_by: createdBy }) });
      if(!r.ok) throw new Error(await r.text()); setOk('Ticket creado'); setTitle(''); setDescription(''); } catch(e:any){ setErr(e.message); } };
  return (<form onSubmit={submit} className="bg-white p-4 rounded-2xl shadow max-w-xl grid gap-3">
    <label className="grid gap-1"><span>Rol</span><select value={role} onChange={e=>setRole(e.target.value)} className="border rounded p-2">
      <option>DOCENTE</option><option>ADMINISTRATIVO</option><option>TI</option><option>DIRECTOR</option></select></label>
    <label className="grid gap-1"><span>Título</span><input value={title} onChange={e=>setTitle(e.target.value)} required className="border rounded p-2"/></label>
    <label className="grid gap-1"><span>Descripción</span><textarea value={description} onChange={e=>setDescription(e.target.value)} className="border rounded p-2" rows={4}/></label>
    <label className="grid gap-1"><span>Prioridad</span><select value={priority} onChange={e=>setPriority(e.target.value)} className="border rounded p-2">
      <option>BAJA</option><option>MEDIA</option><option>ALTA</option><option>CRITICA</option></select></label>
    <button className="bg-blue-600 text-white rounded p-2">Crear ticket</button>
    {ok && <div className="text-green-700">{ok}</div>}{err && <div className="text-red-700">{err}</div>}
  </form>);
}
