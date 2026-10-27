export default function Input({
  label,
  id,
  type = "text",
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled = false,
  hideLabel = false,
  ...props
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={id}
          className={`text-sm font-medium text-[#1F2B24] ${
            hideLabel ? "sr-only" : ""
          }`}
        >
          {label}
        </label>
      )}

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
        className="min-h-11 w-full rounded-lg border border-[#E5E3DD] bg-white px-3 text-[#1F2B24] placeholder:text-[#9A9A94] outline-none transition-colors focus:border-[#176344] focus:ring-2 focus:ring-[#176344]/15 disabled:cursor-not-allowed disabled:bg-[#F6F5F1]"
      />
    </div>
  );
}
