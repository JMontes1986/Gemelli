import React, { useState } from 'react';
import { ethers } from 'ethers';
import { sha256Hex } from './sha256';
import { ensurePolygonAmoy } from './web3net';
const ABI = [ { "inputs":[ { "internalType":"bytes32","name":"_hash","type":"bytes32" }, { "internalType":"uint8","name":"_action","type":"uint8" }, { "internalType":"bytes32","name":"_entityId","type":"bytes32" } ], "name":"record", "outputs":[], "stateMutability":"nonpayable", "type":"function" } ];
function toBytes32(hex: string): string { let h = hex.startsWith('0x') ? hex.slice(2) : hex; if (h.length > 64) h = h.slice(0, 64); return '0x' + h.padStart(64, '0'); }
export default function TicketWalletAnchor({ ticketId, resolution, closerId = '11111111-1111-1111-1111-111111111111' }:{ ticketId:string, resolution:string, closerId?:string }){
  const [contract, setContract] = useState<string>((import.meta.env.PUBLIC_CONTRACT_ADDRESS as string) || '');
  const [action] = useState<number>(1);
  const [payloadHashHex, setPayloadHashHex] = useState<string>(''); const [entityIdHex, setEntityIdHex] = useState<string>('');
  const [addr, setAddr] = useState<string | null>(null); const [tx, setTx] = useState<string | null>(null); const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState<boolean>(false); const [done, setDone] = useState<boolean>(false);
  const prepare = async ()=>{ try{ setErr(null); setTx(null); setDone(false); setBusy(true); const closed_at = new Date().toISOString(); const payload = { ticket_id: ticketId, resolution, closed_at }; const json = JSON.stringify(payload, Object.keys(payload).sort()); const digest = await sha256Hex(json); setPayloadHashHex(toBytes32(digest)); const idHash = await sha256Hex(ticketId); setEntityIdHex(toBytes32(idHash)); } catch(e:any){ setErr(e.message);} finally{ setBusy(false);} };
  const connect = async ()=>{ try{ setErr(null); setBusy(true); await ensurePolygonAmoy(); // @ts-ignore
    const provider = new ethers.BrowserProvider(window.ethereum); const signer = await provider.getSigner(); setAddr(await signer.getAddress()); } catch(e:any){ setErr(e.message);} finally{ setBusy(false);} };
  const send = async ()=>{ try{ setErr(null); setBusy(true); setTx(null); if(!contract) throw new Error('Ingresa la dirección del contrato'); // @ts-ignore
    const provider = new ethers.BrowserProvider(window.ethereum); const signer = await provider.getSigner(); const c = new ethers.Contract(contract, ABI, signer); const resp = await c.record(payloadHashHex, action, entityIdHex); const receipt = await resp.wait(); setTx(resp.hash); try{ await fetch(`/api/tickets/${ticketId}/close_from_wallet`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticket_id: ticketId, closer_id: closerId, resolution, tx_hash: resp.hash, sha256: payloadHashHex, chain_id: 80002 }) }); setDone(true);}catch(e:any){ console.error('close_from_wallet error', e);} } catch(e:any){ setErr(e.message);} finally{ setBusy(false);} };
  return (<div className="grid gap-2 bg-white p-4 rounded-2xl shadow">
    <label className="grid gap-1"><span>Contrato (GemelliAuditLog)</span><input className="border rounded p-2" value={contract} onChange={e=>setContract(e.target.value)} placeholder="0x..." /></label>
    <div className="grid md:grid-cols-3 gap-2">
      <button onClick={prepare} className="bg-slate-700 text-white rounded px-3 py-1" disabled={busy}>1) Preparar hash</button>
      <button onClick={connect} className="bg-purple-700 text-white rounded px-3 py-1" disabled={busy}>2) Conectar & cambiar red</button>
      <button onClick={send} className="bg-emerald-700 text-white rounded px-3 py-1" disabled={busy || !payloadHashHex || !addr}>3) Anclar y cerrar (solo wallet)</button>
    </div>
    <div className="text-sm"><div>Wallet: {addr || '—'}</div><div>payloadHashHex: <code className="break-all">{payloadHashHex || '—'}</code></div><div>entityIdHex: <code className="break-all">{entityIdHex || '—'}</code></div><div>action: {action}</div></div>
    {tx && <div className="text-green-700 break-all">tx: {tx}</div>}{done && <div className="text-green-800">✔ Operación completada (ticket cerrado)</div>}{err && <div className="text-red-700 break-all">{err}</div>}
  </div>);
}
