// CORS middleware
// Simo Sjögren

const cors = require('cors');

const origin_ip = process.env.ORIGIN_IP_CORS || 'http://192.168.1.52:8081';

const corsOptions = {
  origin: origin_ip, // Replace with the actual origin of your frontend
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

module.exports = cors(corsOptions);