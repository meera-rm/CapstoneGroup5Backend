// Turns a thrown database error into the right HTTP response.
//   23xxx (missing required field, duplicate, bad reference) or 22P02 (bad id format)
//     → 400: the request was wrong
//   anything else → 500: a server/database problem (details only in the server log)
function sendDbError(res, error, message) {
  console.error(message, error);
  const code = error && typeof error.code === 'string' ? error.code : '';
  if (code.startsWith('23') || code === '22P02') {
    return res.status(400).json({ success: false, message, detail: error.message });
  }
  return res.status(500).json({ success: false, message });
}

module.exports = { sendDbError };
