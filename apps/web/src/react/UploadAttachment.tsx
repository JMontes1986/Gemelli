import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
export default function UploadAttachment({ bucket='evidencias', owner_table, owner_id, onDone }:{ bucket?:string, owner_table:string, owner_id:string, onDone?:()=>void }){
  const [file, setFile] = useState<File | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const upload = async (e:React.FormEvent)=>{ e.preventDefault(); setOk(null); setErr(null);
    if(!file) return;
    const path = `${owner_table}/${owner_id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
    if (error){ setErr(error.message); return; }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    const resp = await fetch('/api/attachments', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ owner_table, owner_id, url: data.publicUrl, name: file.name, mime: file.type }) });
    if(!resp.ok){ setErr(await resp.text()); return; }
    setOk('Subido y registrado.'); setFile(null); onDone && onDone();
  };
  return (<form onSubmit={upload} className="grid gap-2">
    <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
    <button className="bg-blue-600 text-white rounded px-3 py-1">Subir</button>
    {ok && <div className="text-green-700">{ok}</div>}{err && <div className="text-red-700">{err}</div>}
  </form>);
}
