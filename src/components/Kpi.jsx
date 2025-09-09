export default function Kpi({
  title,
  value,
  valueClassName = "",   
  className = "",
}) {
  return (
    <div className={`bg-[#0d0d0d] rounded-xl p-4 border border-white/10 ${className}`}>
      <div className="text-sm ">{title}</div>
      <div className={`mt-1 text-3xl font-semibold ${valueClassName}`}>
        {value ?? 0}
      </div>
    </div>
  );
}
