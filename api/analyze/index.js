module.exports = async function (context, req) {
  const predictionKey = process.env.AZURE_CUSTOM_VISION_KEY;
  const predictionUrl = process.env.AZURE_CUSTOM_VISION_URL;

  if (!predictionKey || !predictionUrl) {
    context.res = {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Missing Azure Custom Vision configuration.' },
    };
    return;
  }

  const imageBuffer = req.body;
  if (!imageBuffer || imageBuffer.length === 0) {
    context.res = {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Image payload is required.' },
    };
    return;
  }

  const https = require('https');

  return new Promise((resolve, reject) => {
    const url = new URL(predictionUrl);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Prediction-Key': predictionKey,
        'Content-Type': 'application/octet-stream',
        'Content-Length': imageBuffer.length
      }
    };

    const request = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const parsedData = data ? JSON.parse(data) : {};
          context.res = {
            status: response.statusCode,
            headers: { 'Content-Type': 'application/json' },
            body: parsedData,
          };
          resolve();
        } catch (e) {
          context.log.error('Parse error:', e);
          context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: { error: 'Failed to parse Custom Vision response.' },
          };
          resolve();
        }
      });
    });

    request.on('error', (error) => {
      context.log.error('Custom Vision proxy failed:', error);
      context.res = {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: { error: 'Failed to call Azure Custom Vision.' },
      };
      resolve();
    });

    request.write(imageBuffer);
    request.end();
  });
};
