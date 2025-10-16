import React, { useEffect, useState } from 'react';
import UploadAttachment from './UploadAttachment';
export default function DeviceCV({ id }:{ id:string }){
  const [data, setData] = useState<any>(null); const [loading, setLoading] = useState(true); const [err, setErr] = useState<string | null>(null);
  const load = async ()=>{ try{ const r = await fetch(`/api/inventory/devices/${id}/cv`); if(!r.ok) throw new Error(await r.text()); setData(await r.json()); }catch(e:any){ setErr(e.message);} finally{ setLoading(false);} };
  useEffect(()=>{ load(); }, [id]);
  if (loading) return <div>Cargando...</div>; if (err) return <div className="text-red-600">{err}</div>;
  const d = data.device;
  return (<div className="grid gap-4">
    <header className="bg-white p-4 rounded-2xl shadow"><h1 className="text-xl font-semibold">{d.name} <span className="text-sm text-gray-500">({d.asset_tag||'s/asset'})</span></h1>
      <div className="text-sm text-gray-600 mt-1">Tipo: {d.type} • Estado: {d.status} • Ubicación: {d.location||'-'}</div></header>
    <section className="grid md:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-2xl shadow"><h2 className="font-semibold mb-2">Hardware</h2><ul className="text-sm space-y-1">{data.specs.filter((s:any)=>s.section==='HARDWARE').map((s:any)=>(<li key={s.id}><b>{s.key}:</b> {s.value}</li>))}</ul></div>
      <div className="bg-white p-4 rounded-2xl shadow"><h2 className="font-semibold mb-2">Software</h2><ul className="text-sm space-y-1">{data.specs.filter((s:any)=>s.section==='SOFTWARE').map((s:any)=>(<li key={s.id}><b>{s.key}:</b> {s.value}</li>))}</ul></div>
    </section>
    <section className="bg-white p-4 rounded-2xl shadow"><h2 className="font-semibold mb-2">Historial / Logs</h2><ul className="text-sm space-y-2">{data.logs.map((l:any)=>(<li key={l.id}>[{new Date(l.created_at).toLocaleString()}] <b>{l.action}:</b> {l.description}</li>))}{data.logs.length===0 && <li>No hay eventos.</li>}</ul></section>
    <section className="bg-white p-4 rounded-2xl shadow"><h2 className="font-semibold mb-2">Backups</h2><ul className="text-sm space-y-2">{data.backups.map((b:any)=>(<li key={b.id}><b>{b.frequency}</b> en <b>{b.storage}</b> — Última: {b.last_run_at? new Date(b.last_run_at).toLocaleString():'N/A'} {b.evidence_url && (<a className="text-blue-600 underline ml-2" href={b.evidence_url} target="_blank">Evidencia</a>)}</li>))}{data.backups.length===0 && <li>No hay configuraciones de respaldo.</li>}</ul></section>
    <section className="bg-white p-4 rounded-2xl shadow"><h2 className="font-semibold mb-2">Adjuntos</h2><UploadAttachment owner_table="devices" owner_id={id} onDone={()=>load()} /><ul className="text-sm space-y-2 mt-3">{data.attachments.map((a:any)=>(<li key={a.id}><a className="text-blue-600 underline" target="_blank" href={a.url}>{a.name}</a> <span className="text-gray-500">({a.mime})</span></li>))}{data.attachments.length===0 && <li>No hay adjuntos.</li>}</ul></section>
  </div>);
}
