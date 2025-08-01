// Import necessary packages
const express = require('express');
const axios = require('axios');
const cors = require('cors');
// Load environment variables from a .env file for local development
require('dotenv').config();

// --- Configuration ---
const NODE_PORT = process.env.PORT || 3001;
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000/api/v1/itinerary';

// --- Express App Setup ---
const app = express();

// --- CORS Configuration ---
// Define your allowed origins
const allowedOrigins = ['https://tripmasterplan.com', 'https://www.tripmasterplan.com'];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'], // Explicitly allow methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Explicitly allow headers
};

// 1. First, handle preflight requests for all routes
app.options('*', cors(corsOptions));

// 2. Then, apply CORS for all other requests
app.use(cors(corsOptions));

// 3. Finally, use other middleware
app.use(express.json());


// --- API Routes ---

/**
 * A simple root endpoint to confirm the server is running.
 */
app.get('/', (req, res) => {
  res.send('Node.js proxy server for TasteTrail is running!');
});

/**
 * The main endpoint to generate an itinerary.
 */
app.post('/api/v1/itinerary', async (req, res) => {
  console.log('Received request on /api/v1/itinerary. Forwarding to Python backend...');
  console.log('Request Body:', req.body);

  try {
    const response = await axios.post(PYTHON_API_URL, req.body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Successfully received response from Python backend.');
    res.status(response.status).json(response.data);

  } catch (error) {
    console.error('Error forwarding request to Python backend:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error('Error:', error.message);
      res.status(500).json({ detail: 'Failed to connect to the backend Python service.' });
    }
  }
});


// --- Start the Server ---
app.listen(NODE_PORT, () => {
  console.log(`✅ TasteTrail Node.js proxy server listening on http://localhost:${NODE_PORT}`);
  console.log(`Forwarding requests to Python backend at: ${PYTHON_API_URL}`);
});