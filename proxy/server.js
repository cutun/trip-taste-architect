// Import necessary packages
const express = require('express');
const axios = require('axios');
const cors = require('cors');
// Load environment variables from a .env file for local development
require('dotenv').config();

// --- Configuration ---
// Read port from environment variable, or default to 3001
const NODE_PORT = process.env.PORT || 3001;
// Read Python API URL from environment variable, or default to local development URL
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000/api/v1/itinerary';

// --- Express App Setup ---
const app = express();
app.use(cors());
app.use(express.json());
app.use(cors({
  origin: ['https://tripmasterplan.com', 'https://www.tripmasterplan.com'],
  credentials: true // if using cookies or auth headers
}));


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