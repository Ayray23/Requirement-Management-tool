export function errorHandler(error, req, res, next) {
  console.error(error);

  res.status(error.statusCode || 500).json({
    ok: false,
    message: error.message || "Unexpected server error"
  });
}
