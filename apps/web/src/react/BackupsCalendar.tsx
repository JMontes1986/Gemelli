import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import es from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
const localizer = dateFnsLocalizer({ format, parse, startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), getDay, locales: { es } });
export default function BackupsCalendar(){
  const [items, setItems] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [err, setErr] = useState<string | null>(null);
  useEffect(()=>{ (async()=>{ try{ const r = await fetch('/api/backups'); setItems(await r.json()); }catch(e:any){ setErr(e.message);} finally{ setLoading(false);} })(); }, []);
  const events = useMemo(()=> (items||[]).filter((b:any)=>b.next_run_at).map((b:any)=>({ id:b.id, title:`${b.frequency} (${b.storage})`, start:new Date(b.next_run_at), end:new Date(b.next_run_at) })), [items]);
  if (loading) return <div>Cargando...</div>; if (err) return <div className="text-red-600">Error: {err}</div>;
  return (<div className="bg-white p-4 rounded-2xl shadow"><Calendar localizer={localizer} events={events} startAccessor="start" endAccessor="end" style={{ height: 600 }} /></div>);
}
