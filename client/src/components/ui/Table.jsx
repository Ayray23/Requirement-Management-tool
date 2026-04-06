function joinClasses(...values) {
  return values.filter(Boolean).join(" ");
}

export function TableShell({ children }) {
  return <div className="overflow-x-auto rounded-[28px] border border-white/10 bg-slate-950/50 p-4 shadow-glow backdrop-blur-xl">{children}</div>;
}

export function Table({ children }) {
  return <table className="min-w-full border-collapse">{children}</table>;
}

export function TableHead({ children }) {
  return <thead><tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.18em] text-slate-400">{children}</tr></thead>;
}

export function HeadCell({ children }) {
  return <th className="px-3 py-4">{children}</th>;
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, className = "" }) {
  return <tr className={joinClasses("border-b border-white/5 text-sm text-slate-200", className)}>{children}</tr>;
}

export function Cell({ children, className = "" }) {
  return <td className={joinClasses("px-3 py-4", className)}>{children}</td>;
}

export function EmptyRow({ colSpan, children }) {
  return (
    <tr>
      <td className="px-3 py-8 text-center text-slate-400" colSpan={colSpan}>
        {children}
      </td>
    </tr>
  );
}
