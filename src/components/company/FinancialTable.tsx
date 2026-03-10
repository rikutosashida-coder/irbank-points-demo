interface ColumnDef<T> {
  key: keyof T;
  label: string;
  format?: 'currency' | 'percent' | 'yoy' | 'number' | 'yen';
}

interface FinancialTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  rowKey: keyof T;
  onRowClick?: (row: T) => void;
}

function formatValue(value: unknown, format?: string): string {
  if (value == null) return '—';
  const num = value as number;

  switch (format) {
    case 'currency': {
      // 百万円 → 表示用に変換
      if (Math.abs(num) >= 1000000) {
        return `${(num / 1000000).toFixed(1)}兆`;
      } else if (Math.abs(num) >= 10000) {
        return `${Math.round(num / 100).toLocaleString()}億`;
      }
      return `${num.toLocaleString()}百万`;
    }
    case 'percent':
      return `${num}%`;
    case 'yoy':
      if (num > 0) return `+${num}%`;
      return `${num}%`;
    case 'yen':
      return `${num.toLocaleString()}円`;
    case 'number':
      return num.toLocaleString();
    default:
      return String(value);
  }
}

function getYoYColor(value: unknown): string {
  if (value == null) return '';
  const num = value as number;
  if (num > 0) return 'text-green-600';
  if (num < 0) return 'text-red-600';
  return 'text-gray-500';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FinancialTable<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  onRowClick,
}: FinancialTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, rowIdx) => (
            <tr
              key={String(row[rowKey])}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`hover:bg-gray-50 transition-colors ${
                rowIdx === data.length - 1 ? 'bg-blue-50/50 font-medium' : ''
              } ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col) => {
                const value = row[col.key];
                const isYoY = col.format === 'yoy';
                return (
                  <td
                    key={String(col.key)}
                    className={`px-3 py-3 whitespace-nowrap ${
                      isYoY ? getYoYColor(value) : 'text-gray-900'
                    }`}
                  >
                    {formatValue(value, col.format)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
