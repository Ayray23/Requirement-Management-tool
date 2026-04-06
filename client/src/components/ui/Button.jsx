function joinClasses(...values) {
  return values.filter(Boolean).join(" ");
}

const variantMap = {
  primary: "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-400 hover:to-fuchsia-400",
  secondary: "border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10",
  ghost: "border border-transparent bg-transparent text-slate-300 hover:border-white/10 hover:bg-white/5",
  icon: "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
};

const sizeMap = {
  md: "px-4 py-3",
  lg: "px-5 py-3.5",
  icon: "h-11 w-11"
};

function Button({
  as: Component = "button",
  className = "",
  variant = "primary",
  size = "md",
  children,
  ...props
}) {
  return (
    <Component
      className={joinClasses(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition",
        variantMap[variant],
        sizeMap[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Button;
