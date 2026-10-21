export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-[#F1F0EC] text-[#66736B]',
    success: 'bg-[#E6F4EA] text-[#176344]',
    warning: 'bg-[#FFF1D6] text-[#9A6700]',
    danger: 'bg-[#FDE8E8] text-[#B42318]',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        variants[variant] ?? variants.default
      }`}
    >
      {children}
    </span>
  );
}
