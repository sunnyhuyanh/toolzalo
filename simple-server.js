const express = require('express');
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static('.'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});