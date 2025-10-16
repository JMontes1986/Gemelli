import React, { useState } from 'react';
import { RequireRole } from './AuthContext';
export default function SpecForm({ deviceId }:{ deviceId:string }){
  const [section, setSection] = useState('HARDWARE'); const [key, setKey] = useState(''); const [value, setValue] = useState('');
  const [ok, setOk] = useState<string | null>(null); const [err, setErr] = useState<string | null>(null);
  const submit = async (e:React.FormEvent)=>{ e.preventDefault(); setOk(null); setErr(null);
    try { const r = await fetch('/api/inventory/specs', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ device_id: deviceId, section, key, value }) });
      if(!r.ok) throw new Error(await r.text()); setOk('Especificación guardada'); setKey(''); setValue(''); } catch(e:any){ setErr(e.message); } };
  return (<RequireRole role="LIDER_TI" fallback={<div className="text-red-600">Solo el Líder TI puede editar especificaciones.</div>}>
    <form onSubmit={submit} className="bg-white p-4 rounded-2xl shadow max-w-xl grid gap-3">
      <label className="grid gap-1"><span>Sección</span><select value={section} onChange={e=>setSection(e.target.value)} className="border rounded p-2"><option>HARDWARE</option><option>SOFTWARE</option></select></label>
      <label className="grid gap-1"><span>Clave</span><input value={key} onChange={e=>setKey(e.target.value)} className="border rounded p-2" required/></label>
      <label className="grid gap-1"><span>Valor</span><input value={value} onChange={e=>setValue(e.target.value)} className="border rounded p-2" required/></label>
      <button className="bg-blue-600 text-white rounded p-2">Agregar</button>
      {ok && <div className="text-green-700">{ok}</div>}{err && <div className="text-red-700">{err}</div>}
    </form></RequireRole>);
}
