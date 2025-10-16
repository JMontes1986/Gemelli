import React, { useState } from 'react';
import { RequireRole } from './AuthContext';
export default function LogForm({ deviceId }:{ deviceId:string }){
  const [action, setAction] = useState('MANTENIMIENTO'); const [description, setDescription] = useState('');
  const [ok, setOk] = useState<string | null>(null); const [err, setErr] = useState<string | null>(null);
  const submit = async (e:React.FormEvent)=>{ e.preventDefault(); setOk(null); setErr(null);
    try { const r = await fetch('/api/inventory/specs', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ device_id: deviceId, section:'HARDWARE', key:`LOG:${action}`, value: description }) });
      if(!r.ok) throw new Error(await r.text()); setOk('Log registrado'); setDescription(''); } catch(e:any){ setErr(e.message); } };
  return (<RequireRole role="LIDER_TI" fallback={<div className="text-red-600">Solo el Líder TI puede registrar logs.</div>}>
    <form onSubmit={submit} className="bg-white p-4 rounded-2xl shadow max-w-xl grid gap-3">
      <label className="grid gap-1"><span>Acción</span><select value={action} onChange={e=>setAction(e.target.value)} className="border rounded p-2">
        <option>ASIGNACION</option><option>MANTENIMIENTO</option><option>CAMBIO_SOFTWARE</option><option>RESPALDO</option><option>OTRO</option></select></label>
      <label className="grid gap-1"><span>Descripción</span><textarea value={description} onChange={e=>setDescription(e.target.value)} className="border rounded p-2" rows={3}/></label>
      <button className="bg-blue-600 text-white rounded p-2">Guardar</button>
      {ok && <div className="text-green-700">{ok}</div>}{err && <div className="text-red-700">{err}</div>}
    </form></RequireRole>);
}
