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
        <XAxis dataKey="data" tick={{ fontSize: 12 }} />
        <YAxis unit="kg" tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => [`${v} kg`, 'Peso']} />
        <Line
          type="monotone"
          dataKey="peso"
          stroke="#1D9E75"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
