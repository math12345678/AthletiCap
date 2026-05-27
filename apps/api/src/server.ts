import app from './app.js';

const PORT = process.env.API_PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});
