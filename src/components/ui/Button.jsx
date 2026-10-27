export default function Button({
  children,
  onClick,
  type = 'button',
  form,
  variant = 'primary',
  disabled = false,
}) {
  const variants = {
    primary: 'bg-[#176344] text-white hover:bg-[#125238]',
    secondary: 'border border-[#E5E3DD] bg-white text-[#1F2B24] hover:bg-[#F6F5F1]',
    danger: 'bg-red-600 text-white hover:bg-red-700',

    textSuccess: 'text-[#176344] hover:underline',
    textMuted: 'text-[#737373]',
    textDanger: 'text-red-600 hover:underline',
  };
  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      disabled={disabled}
      className={`min-h-11 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        variant.startsWith('text') ? 'px-2' : 'px-4'
      } ${variants[variant]}`}
    >
      {children}
    </button>
  );
}
