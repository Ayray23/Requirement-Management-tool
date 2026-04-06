function joinClasses(...values) {
  return values.filter(Boolean).join(" ");
}

const baseFieldClass =
  "w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-fuchsia-400/40";

export function Field({ label, children, className = "" }) {
  return (
    <label className={joinClasses("grid gap-2", className)}>
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {children}
    </label>
  );
}

export function TextInput({ className = "", ...props }) {
  return <input className={joinClasses(baseFieldClass, className)} {...props} />;
}

export function TextArea({ className = "", ...props }) {
  return <textarea className={joinClasses(baseFieldClass, className)} {...props} />;
}

export function SelectInput({ className = "", children, ...props }) {
  return (
    <select className={joinClasses(baseFieldClass, className)} {...props}>
      {children}
    </select>
  );
}
