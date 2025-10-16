import React, { useState } from 'react';
import { RequireRole } from './AuthContext';
export default function BackupForm(){
  const [form, setForm] = useState<any>({ device_id:'', frequency:'INCREMENTAL', storage:'NUBE_EXTERNA' });
  const [ok, setOk] = useState<string | null>(null); const [err, setErr] = useState<string | null>(null);
  const onChange = (e:any)=> setForm((f:any)=>({ ...f, [e.target.name]: e.target.value }));
  const submit = async (e:React.FormEvent)=>{ e.preventDefault(); setOk(null); setErr(null);
    try{ const r = await fetch('/api/backups', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) }); if(!r.ok) throw new Error(await r.text()); setOk('Backup configurado'); setForm({ device_id:'', frequency:'INCREMENTAL', storage:'NUBE_EXTERNA' }); } catch(e:any){ setErr(e.message);} };
  return (<RequireRole role="LIDER_TI" fallback={<div className="text-red-600">Solo el Líder TI puede crear backups.</div>}>
    <form onSubmit={submit} className="bg-white p-4 rounded-2xl shadow max-w-xl grid gap-3">
      <label className="grid gap-1"><span>ID Dispositivo</span><input name="device_id" value={form.device_id} onChange={onChange} className="border rounded p-2" required/></label>
      <label className="grid gap-1"><span>Tipo</span><select name="frequency" value={form.frequency} onChange={onChange} className="border rounded p-2"><option>INCREMENTAL</option><option>COMPLETA</option></select></label>
      <label className="grid gap-1"><span>Almacenamiento</span><select name="storage" value={form.storage} onChange={onChange} className="border rounded p-2"><option>LOCAL_PC</option><option>EXTERNO</option><option>NUBE_EXTERNA</option></select></label>
      <label className="grid gap-1"><span>Próxima ejecución (next_run_at)</span><input type="datetime-local" name="next_run_at" value={form.next_run_at||''} onChange={onChange} className="border rounded p-2"/></label>
      <button className="bg-blue-600 text-white rounded p-2">Guardar</button>
      {ok && <div className="text-green-700">{ok}</div>}{err && <div className="text-red-700">{err}</div>}
    </form></RequireRole>);
}
