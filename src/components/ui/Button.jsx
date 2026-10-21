export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
}) {
  const variants = {
    primary: 'bg-[#176344] text-white hover:bg-[#125238]',
    secondary: 'border border-[#E5E3DD] bg-white text-[#1F2B24] hover:bg-[#F6F5F1]',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`min-h-11 rounded-lg px-4 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]}`}
    >
      {children}
    </button>
  );
}
