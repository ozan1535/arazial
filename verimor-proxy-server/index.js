require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const axios = require('axios');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('tiny')); // Logging
app.use(express.json()); // JSON body parser

// CORS configuration - Allow all origins since we use API key auth
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes by default
  max: process.env.RATE_LIMIT_MAX || 5, // Limit each IP to 5 requests per windowMs
  message: {
    status: 429,
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Authentication middleware
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid API key'
    });
  }
  
  next();
};

// Route for sending OTP SMS
app.post('/api/send-otp', authenticate, async (req, res) => {
  try {
    // Validate request body
    const schema = Joi.object({
      phoneNumber: Joi.string()
        .pattern(/^90[5][0-9]{9}$/)
        .required()
        .messages({
          'string.pattern.base': 'Invalid phone number format. Must start with 90 followed by 5 and 9 more digits',
          'any.required': 'Phone number is required'
        }),
      message: Joi.string().optional()
    });

    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { phoneNumber, message } = value;
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Prepare message text
    const messageText = message || `arazialcom doğrulama kodunuz: ${otp}`;
    
    // Prepare Verimor payload
    const payload = {
      username: process.env.VERIMOR_USERNAME,
      password: process.env.VERIMOR_PASSWORD,
      messages: [{
        msg: messageText,
        dest: phoneNumber
      }]
    };
    
    // Only add source_addr if it's defined in the environment
    if (process.env.VERIMOR_SOURCE_ADDR) {
      payload.source_addr = process.env.VERIMOR_SOURCE_ADDR;
    }
    
    // Call Verimor API
    const response = await axios.post(
      'https://sms.verimor.com.tr/v2/send.json',
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Return success response with OTP and campaign ID
    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      otp: otp, // Sending back the OTP for development/testing
      campaignId: response.data
    });
    
  } catch (error) {
    console.error('Error sending OTP:', error.response?.data || error.message);
    
    // Handle Verimor API errors
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: `SMS sending failed: ${error.response.data}`
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Verimor OTP Proxy Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
}); 