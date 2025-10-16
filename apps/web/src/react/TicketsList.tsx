import React, { useEffect, useState } from 'react';
export default function TicketsList(){
  const [rows, setRows] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [err, setErr] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  useEffect(()=>{ (async()=>{ try{ const r = await fetch('/api/tickets' + (status?`?status=${status}`:'')); setRows(await r.json()); }catch(e:any){ setErr(e.message);} finally{ setLoading(false);} })(); }, [status]);
  if (loading) return <div>Cargando...</div>; if (err) return <div className="text-red-600">{err}</div>;
  return (<div className="bg-white p-4 rounded-2xl shadow">
    <div className="flex gap-2 mb-3"><select value={status} onChange={e=>setStatus(e.target.value)} className="border rounded p-2">
      <option value="">Todos</option><option>ABIERTO</option><option>EN_PROCESO</option><option>RESUELTO</option><option>CERRADO</option></select></div>
    <table className="min-w-full text-sm"><thead className="bg-gray-100 text-left"><tr><th className="p-2">Título</th><th className="p-2">Prioridad</th><th className="p-2">Estado</th></tr></thead>
      <tbody>{rows.map((t:any)=>(<tr key={t.id} className="border-t"><td className="p-2"><a className="text-blue-600 underline" href={`/ticket/${t.id}`}>{t.title}</a></td><td className="p-2">{t.priority}</td><td className="p-2">{t.status}</td></tr>))}</tbody>
    </table>
  </div>);
}
