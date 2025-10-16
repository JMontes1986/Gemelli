import React, { useEffect, useState } from 'react';
type Device = { id: string; asset_tag?: string; name: string; type: string; status: string; location?: string; };
export default function Inventory(){
  const [rows, setRows] = useState<Device[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(()=>{ (async()=>{ try{ const r = await fetch('/api/inventory/devices'); setRows(await r.json()); } catch(e:any){ setError(e.message);} finally{ setLoading(false);} })(); }, []);
  if (loading) return <div>Cargando...</div>; if (error) return <div className="text-red-600">Error: {error}</div>;
  return (<div className="overflow-x-auto bg-white rounded-2xl shadow">
    <table className="min-w-full text-sm"><thead className="bg-gray-100 text-left"><tr><th className="p-3">Asset</th><th className="p-3">Nombre</th><th className="p-3">Tipo</th><th className="p-3">Estado</th><th className="p-3">Ubicación</th><th className="p-3">Ver</th></tr></thead>
    <tbody>{rows.map((d)=>(<tr key={d.id} className="border-t"><td className="p-3">{d.asset_tag||'-'}</td><td className="p-3">{d.name}</td><td className="p-3">{d.type}</td><td className="p-3">{d.status}</td><td className="p-3">{d.location||'-'}</td>
    <td className="p-3"><a className="text-blue-600 underline" href={`/device/${d.id}`}>Hoja de Vida</a></td></tr>))}</tbody></table></div>);
}
