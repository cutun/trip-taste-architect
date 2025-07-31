// Import necessary packages
const express = require('express');
const axios = require('axios');
const cors = require('cors');

// --- Configuration ---
const NODE_PORT = 3001;
const PYTHON_API_URL = 'http://127.0.0.1:8000/api/v1/itinerary';

// --- Express App Setup ---
const app = express();

// Enable CORS to allow your frontend to make requests to this server.
app.use(cors());

// Enable Express to parse JSON request bodies.
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
 * It receives a POST request from the frontend and forwards it
 * to the Python backend.
 */
app.post('/api/v1/itinerary', async (req, res) => {
  console.log('Received request on /api/v1/itinerary. Forwarding to Python backend...');
  console.log('Request Body:', req.body);

  try {
    // Make a POST request to the Python API using axios.
    // Forward the exact body received from the frontend.
    const response = await axios.post(PYTHON_API_URL, req.body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // If the request is successful, send the data from the Python API
    // back to the frontend.
    console.log('Successfully received response from Python backend.');
    res.status(response.status).json(response.data);

  } catch (error) {
    console.error('Error forwarding request to Python backend:');

    // If the error has a response from the Python API (e.g., a 4xx or 5xx error),
    // forward that specific error information to the frontend.
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      // If there was a network error (e.g., the Python server is down),
      // send a generic 500 Internal Server Error.
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
