module.exports = async function (context, req) {
  const predictionKey = process.env.AZURE_CUSTOM_VISION_KEY;
  const predictionUrl = process.env.AZURE_CUSTOM_VISION_URL;

  if (!predictionKey || !predictionUrl) {
    context.res = {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: {
        error: 'Missing Azure Custom Vision configuration.',
      },
    };
    return;
  }

  try {
    const imageBuffer = req.body;

    if (!imageBuffer || imageBuffer.length === 0) {
      context.res = {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: {
          error: 'Image payload is required.',
        },
      };
      return;
    }

    const response = await fetch(predictionUrl, {
      method: 'POST',
      headers: {
        'Prediction-Key': predictionKey,
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer,
    });

    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : {};

    context.res = {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: data,
    };
  } catch (error) {
    context.log.error('Custom Vision proxy failed', error);
    context.res = {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: {
        error: 'Failed to call Azure Custom Vision.',
      },
    };
  }
};
