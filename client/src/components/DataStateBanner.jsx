function DataStateBanner({ loading, error, loadingText }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 font-semibold text-cyan-100">
        {loadingText}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 font-semibold text-amber-200">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 font-semibold text-emerald-200">
      Live data connected successfully.
    </div>
  );
}

export default DataStateBanner;
