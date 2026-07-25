const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Money Note API',
    description: 'API sederhana untuk registrasi, login dan sinkronisasi data transaksi catatan keuangan (Money Note).',
    version: '1.0.0'
  },
  host: 'localhost:3000',
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
