// CORS middleware
// Simo Sjögren

const cors = require('cors');

const corsOptions = {
  origin: 'http://localhost:8080', // Replace with the actual origin of your frontend
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

module.exports = cors(corsOptions);