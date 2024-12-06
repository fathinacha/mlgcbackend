const tf = require('@tensorflow/tfjs-node');

const processImage = async (imageBuffer) => {
  // Decode image
  const image = tf.node.decodeImage(imageBuffer);
  
  // Resize ke 224x224 (sesuai kebutuhan model)
  const resized = tf.image.resizeBilinear(image, [224, 224]);
  
  // Normalize pixel values
  const normalized = resized.div(255.0);
  
  // Reshape untuk batch size 1
  const batched = normalized.expandDims(0);
  
  return batched;
};

module.exports = { processImage }; 