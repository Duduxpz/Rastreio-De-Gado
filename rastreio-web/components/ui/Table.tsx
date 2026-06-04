import React from 'react';

interface TableColumn<T> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  loading = false,
  emptyMessage = 'Nenhum dado encontrado',
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-text-muted">Carregando...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-bg-border bg-bg-elevated">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-3 font-semibold text-sm text-text-primary ${alignClasses[col.align || 'left']} ${col.width || ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-bg-border ${onRowClick ? 'hover:bg-bg-elevated cursor-pointer' : ''} transition`}
            >
              {columns.map((col) => (
                <td
                  key={`${keyExtractor(row)}-${col.key}`}
                  className={`px-6 py-4 text-sm text-text-secondary ${alignClasses[col.align || 'left']}`}
                >
                  {col.render
                    ? col.render((row as any)[col.key], row)
                    : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
