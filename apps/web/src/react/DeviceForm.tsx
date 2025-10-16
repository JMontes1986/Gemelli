import React, { useState } from 'react';
import { RequireRole } from './AuthContext';
export default function DeviceForm(){
  const [form, setForm] = useState<any>({ name:'', type:'PC', status:'ACTIVO' });
  const [ok, setOk] = useState<string | null>(null); const [err, setErr] = useState<string | null>(null);
  const onChange = (e:any)=> setForm((f:any)=>({ ...f, [e.target.name]: e.target.value }));
  const submit = async (e:React.FormEvent)=>{ e.preventDefault(); setOk(null); setErr(null);
    try{ const r = await fetch('/api/inventory/devices', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) }); if(!r.ok) throw new Error(await r.text()); setOk('Dispositivo creado'); setForm({ name:'', type:'PC', status:'ACTIVO' }); } catch(e:any){ setErr(e.message);} };
  return (<RequireRole role="LIDER_TI" fallback={<div className="text-red-600">Solo el Líder TI puede crear equipos.</div>}>
    <form onSubmit={submit} className="bg-white p-4 rounded-2xl shadow max-w-xl grid gap-3">
      <label className="grid gap-1"><span>Nombre</span><input name="name" value={form.name} onChange={onChange} className="border rounded p-2" required/></label>
      <label className="grid gap-1"><span>Tipo</span><select name="type" value={form.type} onChange={onChange} className="border rounded p-2"><option>PC</option><option>LAPTOP</option><option>IMPRESORA</option><option>RED</option><option>OTRO</option></select></label>
      <label className="grid gap-1"><span>Estado</span><select name="status" value={form.status} onChange={onChange} className="border rounded p-2"><option>ACTIVO</option><option>EN_REPARACION</option><option>RETIRADO</option></select></label>
      <label className="grid gap-1"><span>Ubicación</span><input name="location" value={form.location||''} onChange={onChange} className="border rounded p-2"/></label>
      <button className="bg-blue-600 text-white rounded p-2">Guardar</button>
      {ok && <div className="text-green-700">{ok}</div>}{err && <div className="text-red-700">{err}</div>}
    </form></RequireRole>);
}
