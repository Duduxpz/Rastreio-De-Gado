interface StatCardProps {
  readonly label: string;
  readonly value: number | string;
  readonly delta?: string;
  readonly deltaPositive?: boolean;
}

export function StatCard({
  label,
  value,
  delta,
  deltaPositive,
}: readonly StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      {delta && (
        <p
          className={`text-xs mt-1 ${
            deltaPositive ? 'text-primary-500' : 'text-red-500'
          }`}
        >
          {deltaPositive ? '↑' : '↓'} {delta}
        </p>
      )}
    </div>
  );
}
