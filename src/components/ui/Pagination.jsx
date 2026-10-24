export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  pageSize = 5,
  onPageSizeChange,
  itemLabel = 'transaksi',
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex flex-wrap items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
      <p className="text-sm text-[#66736B]">
        Menampilkan{' '}
        <span className="font-semibold text-[#1F2B24]">
          {startItem}–{endItem}
        </span>{' '}
        dari {totalItems} {itemLabel}
      </p>
        <label htmlFor="pagination-page-size" className="text-sm text-[#66736B]">
          Baris per halaman
        </label>

        <select
          id="pagination-page-size"
          value={pageSize}
          onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
          className="min-h-11 rounded-lg border border-[#E5E3DD] bg-white px-3 text-[#1F2B24] outline-none focus:border-[#176344] focus:ring-2 focus:ring-[#176344]/15"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          aria-label="Halaman sebelumnya"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#E5E3DD] bg-white text-[#1F2B24] hover:bg-[#F6F5F1] disabled:cursor-not-allowed disabled:opacity-50"
        >
          ‹
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-label={`Halaman ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
            className={`min-h-11 min-w-11 rounded-lg border px-3 font-medium transition-colors ${
              currentPage === page
                ? 'border-[#1F2B24] bg-[#1F2B24] text-white'
                : 'border-[#E5E3DD] bg-white text-[#1F2B24] hover:bg-[#F6F5F1]'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          aria-label="Halaman berikutnya"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#E5E3DD] bg-white text-[#1F2B24] hover:bg-[#F6F5F1] disabled:cursor-not-allowed disabled:opacity-50"
        >
          ›
        </button>
      </div>
    </nav>
  );
}
