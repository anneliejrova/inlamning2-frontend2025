export function globalErrorHandler(err, req, res, next) {

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      message: "Invalid JSON format. Make sure all text fields are in quotes and quantity/price are numbers."
    });
  }

  console.error("Unexpected error:", err);
  return res.status(500).json({ message: "Internal server error" });
}
