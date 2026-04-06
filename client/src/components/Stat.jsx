function Stat({ label, value }) {
  return (
    <div className="space-y-1">
      <strong className="block font-display text-3xl font-bold text-slate-50">{value}</strong>
      <span className="text-sm text-slate-400">{label}</span>
    </div>
  );
}

export default Stat;
