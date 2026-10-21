export default function Select({ label, id, value, onChange, options = [], disabled = false }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-[#1F2B24]">
        {label}
      </label>

      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="min-h-11 w-full rounded-lg border border-[#E5E3DD] bg-white px-3 text-[#1F2B24] outline-none transition-colors focus:border-[#176344] focus:ring-2 focus:ring-[#176344]/15 disabled:cursor-not-allowed disabled:bg-[#F6F5F1]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
