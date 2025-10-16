import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
export default function MyTickets(){
  const { user } = useAuth(); const [rows, setRows] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  useEffect(()=>{ (async()=>{ if(!user){ setLoading(false); return; } const r = await fetch('/api/tickets?mine='+encodeURIComponent(user.id)); setRows(await r.json()); setLoading(false); })(); }, [user]);
  if (!user) return <div>Inicia sesión para ver tus tickets.</div>;
  if (loading) return <div>Cargando...</div>;
  return (<div className="bg-white p-4 rounded-2xl shadow">
    <table className="min-w-full text-sm"><thead className="bg-gray-100 text-left"><tr><th className="p-2">Título</th><th className="p-2">Estado</th></tr></thead>
      <tbody>{rows.map((t:any)=>(<tr key={t.id} className="border-t"><td className="p-2"><a className="text-blue-600 underline" href={`/ticket/${t.id}`}>{t.title}</a></td><td className="p-2">{t.status}</td></tr>))}</tbody>
    </table>
  </div>);
}
