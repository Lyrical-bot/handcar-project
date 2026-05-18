const { geocodeAddress } = require('../_shared/azureMapsClient');

module.exports = async function (context, req) {
  try {
    const address = req.query.address || req.body?.address;

    if (!address) {
      context.res = {
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: {
          error: 'address query parameter is required.',
          example: '/api/geocode?address=서울특별시 관악구 봉천로 412',
        },
      };
      return;
    }

    const result = await geocodeAddress(address);

    context.res = {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: result,
    };
  } catch (error) {
    context.log.error(error);

    context.res = {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: {
        error: error.message,
      },
    };
  }
};
