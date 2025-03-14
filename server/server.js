const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const multer = require('multer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
//for login 
let users = [{ phone: '1234', password: '1234' }];  // Password should be hashed

// Endpoint for login
app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;

  const user = users.find(u => u.phone === phone);
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  if (user.password === password) {
    // Return user info without password for frontend
    res.status(200).json({ user:'new'});
  } else {
    res.status(400).json({ error: 'Invalid password' });
  }
});

//getting the keys from .env
const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: process.env.NVIDIA_BASE_URL
});

// NVIDIA API Route
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
          content: "You are an agricultural expert assistant. Provide helpful advice about farming, crops, and weather-related agricultural practices."
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
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Error communicating with NVIDIA API:', error.message);
    res.status(500).json({ 
      error: 'Error calling NVIDIA API',
      details: error.message
    });
  }
});

// // Multer setup for file uploads for ML mode
// const upload = multer({ dest: 'uploads/' });

// // Pest Detection API Route
// app.post('/api/predict', upload.single('image'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'No image uploaded' });
//   }

//   // Simulate ML model response (replace with actual model call)
//   res.json({ result: "पिकावर वाल्बीचा परिणाम झाल्याचे दिसते." });
// });

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
