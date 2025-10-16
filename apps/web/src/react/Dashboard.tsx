import React from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';
const data = [{ name:'Activos', value:10 }, { name:'En reparación', value:2 }, { name:'Retirados', value:1 }];
export default function Dashboard(){ return (<div className="grid gap-4 md:grid-cols-2">
  <div className="p-4 rounded-2xl shadow bg-white"><h2 className="font-semibold mb-2">Estado de dispositivos</h2>
    <div style={{ width: '100%', height: 240 }}><ResponsiveContainer><PieChart><Pie dataKey="value" data={data} label /><Tooltip/></PieChart></ResponsiveContainer></div></div>
  <div className="p-4 rounded-2xl shadow bg-white"><h2 className="font-semibold">KPIs</h2><ul className="mt-2 space-y-1"><li>Dispositivos totales: 13</li><li>Tickets abiertos: 6</li><li>Cumplimiento de backups: 78%</li></ul></div>
</div>); }
