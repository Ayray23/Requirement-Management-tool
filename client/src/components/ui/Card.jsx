function joinClasses(...values) {
  return values.filter(Boolean).join(" ");
}

export function Card({ className = "", children }) {
  return (
    <section className={joinClasses("rounded-[28px] border border-white/10 bg-slate-950/50 p-6 shadow-glow backdrop-blur-xl", className)}>
      {children}
    </section>
  );
}

export function CardHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div>
        {eyebrow ? <p className="text-xs uppercase tracking-[0.24em] text-slate-300">{eyebrow}</p> : null}
        {title ? <h2 className="mt-2 text-3xl font-semibold text-white">{title}</h2> : null}
        {description ? <p className="mt-3 text-slate-400">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function InfoCard({ className = "", children }) {
  return <div className={joinClasses("rounded-2xl border border-white/10 bg-slate-950/30 p-4", className)}>{children}</div>;
}
