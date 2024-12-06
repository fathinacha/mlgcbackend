const Hapi = require('@hapi/hapi');
const { predictHandler } = require('./handlers/predictHandler');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 8080,
    host: '0.0.0.0',
    routes: {
      cors: {
        origin: ['*']
      }
    }
  });

  // Route untuk prediksi
  server.route({
    method: 'POST',
    path: '/predict',
    options: {
      payload: {
        maxBytes: 1000000, // 1MB limit
        output: 'stream',
        parse: true,
        multipart: true,
        allow: 'multipart/form-data'
      }
    },
    handler: predictHandler
  });

  // Error handling global
  server.ext('onPreResponse', (request, h) => {
    const response = request.response;
    
    if (!response.isBoom) {
      return h.continue;
    }

    // Handle payload too large
    if (response.output.statusCode === 413) {
      return h.response({
        status: 'fail',
        message: 'Payload content length greater than maximum allowed: 1000000'
      }).code(413);
    }

    // Handle other errors
    return h.response({
      status: 'fail',
      message: 'Terjadi kesalahan dalam melakukan prediksi'
    }).code(400);
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init(); 