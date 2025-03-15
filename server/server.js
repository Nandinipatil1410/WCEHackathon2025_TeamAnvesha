const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const multer = require('multer');
// const tf = require('@tensorflow/tfjs-node');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 📌 User Login System
let users = [{ phone: '1234', password: '1234' }];  // Password should be hashed
app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;

  const user = users.find(u => u.phone === phone);
  if (!user) return res.status(400).json({ error: 'User not found' });

  if (user.password === password) {
    res.status(200).json({ user: 'new' });
  } else {
    res.status(400).json({ error: 'Invalid password' });
  }
});

// 📌 NVIDIA API Setup
const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: process.env.NVIDIA_BASE_URL
});

app.post('/api/nvidia', async (req, res) => {
  const { messages } = req.body;

  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const completion = await openai.chat.completions.create({
      model: "nvidia/llama-3.1-nemotron-70b-instruct",
      messages: [
        {
          role: "system",
          content: "You are an agricultural expert assistant. Provide helpful advice about farming, crops, and weather-related agricultural practices. If you are asked a question by transliterating, then answer in the original language only, not in the language in which the text is transliterated."
        },
        ...messages
      ],
      temperature: 0.5,
      top_p: 1,
      max_tokens: 1024,
      stream: true,
    });

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error communicating with NVIDIA API:', error.message);
    res.status(500).json({ error: 'Error calling NVIDIA API', details: error.message });
  }
});

// // 📌 TensorFlow.js Crop Prediction Model
// let model;
// const monthToNumber = { 'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5, 'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11, 'All Year': 12 };
// const soilTypeToNumber = { 'Neutral (Loamy)': 0, 'Alkaline (Clayey)': 1, 'Acidic (Sandy)': 2 };
// const cropToNumber = ['Rice', 'Maize', 'Chickpea', 'Kidneybeans', 'Pigeonpeas', 'Mothbeans', 'Mungbean', 'Blackgram', 'Lentil', 'Pomegranate', 'Banana', 'Mango', 'Grapes', 'Watermelon', 'Muskmelon', 'Apple', 'Orange', 'Papaya', 'Coconut', 'Cotton', 'Jute', 'Coffee'];

// async function loadModel() {
//     model = await tf.loadLayersModel('file://./model/model.json');
//     console.log("✅ ML Model Loaded Successfully");
// }
// loadModel();

// // 📌 Crop Prediction API
// app.post('/api/predict-crop', async (req, res) => {
//   const { month, soilType } = req.body;
//   if (!month || !soilType) return res.status(400).json({ error: 'Invalid input' });

//   try {
//       const input = tf.tensor2d([[monthToNumber[month], soilTypeToNumber[soilType]]]);
//       const prediction = model.predict(input);
//       const probabilities = await prediction.data();

//       // Get top 3 crop suggestions
//       const topCrops = probabilities
//           .map((prob, index) => ({ crop: cropToNumber[index], prob }))
//           .sort((a, b) => b.prob - a.prob)
//           .slice(0, 3)
//           .map(item => item.crop);

//       res.json({ crops: topCrops });
//   } catch (error) {
//       console.error('Error in crop prediction:', error);
//       res.status(500).json({ error: 'Prediction failed', details: error.message });
//   }
// });


// 📌 Pest Detection API (Optional, if needed later)
// const upload = multer({ dest: 'uploads/' });
// app.post('/api/predict-pest', upload.single('image'), (req, res) => {
//   if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
//   res.json({ result: "पिकावर वाल्बीचा परिणाम झाल्याचे दिसते." });
// });

// 📌 Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));