const tf = require('@tensorflow/tfjs-node');
const { Storage } = require('@google-cloud/storage');
const { Firestore } = require('@google-cloud/firestore');
const { v4: uuidv4 } = require('uuid');
const { processImage } = require('../utils/imageProcessor');

const storage = new Storage();
const firestore = new Firestore();

const loadModel = async () => {
  const bucket = storage.bucket('YOUR_BUCKET_NAME');
  const modelPath = 'gs://YOUR_BUCKET_NAME/model/model.json';
  return await tf.loadLayersModel(modelPath);
};

const predictHandler = async (request, h) => {
  try {
    const { image } = request.payload;
    
    if (!image) {
      return h.response({
        status: 'fail',
        message: 'Gambar tidak ditemukan'
      }).code(400);
    }

    // Proses gambar menjadi tensor
    const tensor = await processImage(image);
    
    // Load model dan lakukan prediksi
    const model = await loadModel();
    const prediction = await model.predict(tensor).data();
    
    // Tentukan hasil prediksi
    const result = prediction[0] > 0.5 ? 'Cancer' : 'Non-cancer';
    const suggestion = result === 'Cancer' 
      ? 'Segera periksa ke dokter!'
      : 'Penyakit kanker tidak terdeteksi.';

    // Buat data untuk disimpan
    const predictionData = {
      id: uuidv4(),
      result,
      suggestion,
      createdAt: new Date().toISOString()
    };

    // Simpan ke Firestore
    await firestore
      .collection('predictions')
      .doc(predictionData.id)
      .set(predictionData);

    return h.response({
      status: 'success',
      message: 'Model is predicted successfully',
      data: predictionData
    }).code(200);

  } catch (error) {
    console.error('Prediction error:', error);
    return h.response({
      status: 'fail',
      message: 'Terjadi kesalahan dalam melakukan prediksi'
    }).code(400);
  }
};

module.exports = { predictHandler }; 