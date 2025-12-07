export function validateId(req, res, next) {
  const { id } = req.params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    console.log("HTTP 400 - Invalid UUID:", id);
    return res.status(400).json({ message: "Invalid ID format. Must be a UUID." });
  }

  next();
}
