function DataStateBanner({ loading, error, loadingText }) {
  if (loading) {
    return <div className="data-banner info">{loadingText}</div>;
  }

  if (error) {
    return <div className="data-banner warning">{error}</div>;
  }

  return <div className="data-banner success">Live data connected successfully.</div>;
}

export default DataStateBanner;
