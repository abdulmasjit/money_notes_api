const os = require('os');
const swaggerAutogen = require('swagger-autogen')();

// Helper to get local IP address
const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || process.env.SWAGGER_HOST || getLocalIp();

const doc = {
  info: {
    title: 'Money Note API',
    description: 'API sederhana untuk registrasi, login dan sinkronisasi data transaksi catatan keuangan (Money Note).',
    version: '1.0.0'
  },
  host: `${HOST}:${PORT}`,
  basePath: '/api',
  schemes: ['http'],
  definitions: {
    User: {
      id: 0,
      name: "",
      username: "",
      email: "",
      created_at: ""
    },
    Transaction: {
      id: 0,
      tanggal: "2026-07-25 16:08:00",
      nominal: 0,
      keterangan: "",
      jenis: ""
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/apiRoutes.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);

