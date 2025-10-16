import React, { useEffect, useState } from 'react';
import TicketWalletAnchor from './TicketWalletAnchor';
export default function TicketDetail({ id }:{ id:string }){
  const [ticket, setTicket] = useState<any>(null); const [summary, setSummary] = useState<any>(null);
  const [res, setRes] = useState('Solución aplicada.'); const [ok, setOk] = useState<string | null>(null); const [err, setErr] = useState<string | null>(null);
  useEffect(()=>{ (async()=>{ try{ const t = await fetch(`/api/tickets?id=${id}`); const tj = await t.json(); setTicket(Array.isArray(tj)? tj[0]: null);}catch{}})(); }, [id]);
  const callMCP = async ()=>{ try { const r = await fetch('/api/mcp/summarize-ticket', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ticket_id: id, messages: [ticket?.description || ''] }) }); setSummary(await r.json()); } catch(e:any){ setErr(e.message);} };
  const closeAndAnchor = async ()=>{ setOk(null); setErr(null); try{ const r = await fetch(`/api/tickets/${id}/close_and_anchor`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ticket_id: id, closer_id: '11111111-1111-1111-1111-111111111111', resolution: res }) }); if(!r.ok) throw new Error(await r.text()); const j = await r.json(); setOk(`Cerrado. tx=${j.tx_hash}`);}catch(e:any){ setErr(e.message);} };
  return (<div className="grid gap-4">
    <div className="bg-white p-4 rounded-2xl shadow"><h1 className="text-xl font-semibold">Ticket {id}</h1>{ticket ? (<div className="text-sm text-gray-600"><div>Título: {ticket.title}</div><div>Estado: {ticket.status}</div><div>Prioridad: {ticket.priority}</div></div>): <div>Cargando ticket...</div>}</div>
    <div className="bg-white p-4 rounded-2xl shadow"><h2 className="font-semibold mb-2">Resumen MCP</h2><button onClick={callMCP} className="bg-indigo-600 text-white rounded px-3 py-1">Generar resumen</button>{summary && <pre className="mt-3 text-xs bg-gray-50 p-2 rounded">{JSON.stringify(summary, null, 2)}</pre>}</div>
    <div className="bg-white p-4 rounded-2xl shadow"><h2 className="font-semibold mb-2">Cerrar ticket y anclar (backend)</h2><textarea value={res} onChange={e=>setRes(e.target.value)} className="border rounded p-2 w-full" rows={3}/>
      <div className="mt-2"><button onClick={closeAndAnchor} className="bg-green-600 text-white rounded px-3 py-1">Cerrar & Anclar</button></div>{ok && <div className="text-green-700 mt-2">{ok}</div>}{err && <div className="text-red-700 mt-2">{err}</div>}</div>
    <div className="bg-white p-4 rounded-2xl shadow"><h2 className="font-semibold mb-2">Anclar con Wallet (Polygon Amoy)</h2><p className="text-sm text-gray-600 mb-2">Calcula el hash en el navegador, cambia de red a <b>Polygon Amoy</b> y firma hacia tu contrato <code>GemelliAuditLog</code>. Tras minar, se cierra el ticket en backend.</p><TicketWalletAnchor ticketId={id} resolution={res} /></div>
  </div>);
}
