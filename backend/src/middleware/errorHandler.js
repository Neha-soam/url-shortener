function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.isOperational) return res.status(err.status).json({ error: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON' });
  console.error('[error]', err);
  res.status(500).json({ error: 'Internal server error' }); // never leak stack traces
}

module.exports = { notFound, errorHandler };
