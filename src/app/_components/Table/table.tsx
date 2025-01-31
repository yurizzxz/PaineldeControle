import { ReactNode } from "react";

interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => ReactNode;
}

interface TableProps {
  data: any[];
  columns: TableColumn[];
}

export default function Table({ data, columns }: TableProps) {
  return (
    <table className="w-full border-collapse border border-gray-300 rounded-md overflow-hidden">
      <thead>
        <tr className="bg-[#00BB83] text-white">
          {columns.map((column) => (
            <th
              key={column.key}
              className="border border-gray-300 px-3 py-1.5 text-left text-sm"
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index} className="bg-[#101010]">
            {columns.map((column) => (
              <td
                key={column.key}
                className="border border-[#252525] px-3 py-1.5 text-sm"
              >
                {column.render
                  ? column.render(row[column.key], row)
                  : row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
