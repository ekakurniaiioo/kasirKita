export default function Table({ columns = [], data = [] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E5E3DD] bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[#F6F5F1]">
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className="px-4 py-3 font-semibold text-[#1F2B24]">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length || 1} className="px-4 py-8 text-center text-[#66736B]">
                Belum ada data.
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={row.id ?? index} className="border-t border-[#E5E3DD] transition-colors hover:bg-[#FAF9F6]">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-[#66736B]">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
