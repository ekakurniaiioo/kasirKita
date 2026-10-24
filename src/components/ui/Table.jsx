export default function Table({ columns = [], data = [] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E5E4DE] bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-white">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-4 py-3 text-xs font-semibold uppercase text-[#787B75]"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length || 1}
                className="border-t border-[#E5E4DE] px-4 py-8 text-center text-[#787B75]"
              >
                Belum ada data.
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={row.id ?? index}
                className="border-t border-[#E5E4DE] transition-colors hover:bg-[#F6F5F1]"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 text-[#242824]">
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
