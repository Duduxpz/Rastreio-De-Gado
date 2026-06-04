'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function GraficoEvolucao({
  dados,
}: {
  dados: { data: string; peso: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={dados}>
        <XAxis dataKey="data" tick={{ fontSize: 12, fill: '#86EFAC' }} />
        <YAxis unit="kg" tick={{ fontSize: 12, fill: '#86EFAC' }} />
        <Tooltip 
          formatter={(v) => [`${v} kg`, 'Peso']} 
          contentStyle={{ backgroundColor: '#112318', borderColor: '#1E3D28', color: '#F0FDF4' }} 
        />
        <Line
          type="monotone"
          dataKey="peso"
          stroke="#22C55E"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
