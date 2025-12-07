export function validateStockChange(req, res, next) {
  let { change } = req.body;

   if (typeof change === "string") change = Number(change);

  if (isNaN(change) || change === 0) {
    return res.status(400).json({
      message: "Field 'change' must be a non-zero number (positive or negative)."
    });
  }

  req.body.change = change;
  next();
}
