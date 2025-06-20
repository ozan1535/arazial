'use strict';

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
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
  credentials: true
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 10,
  message: {
    status: 429,
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
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

// Helper function to format amount as decimal
function formatAmount(amount) {
  // Convert TL to decimal format (10000 -> 100.00) and return as string
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) {
    return '0.00';
  }
  // Divide by 100 to convert from TL cents to TL amount
  return (numericAmount / 100).toFixed(2);
}

// Helper function to sanitize order ID
function sanitizeOrderId(orderId) {
  if (!orderId) return orderId;
  // Just remove any characters that aren't alphanumeric or dashes, limit to 64 chars
  return orderId.replace(/[^a-zA-Z0-9-]/g, '').substring(0, 64);
}

// Helper function to format card owner name
function formatCardOwner(name) {
  if (!name) return name;
  // Clean the name: remove extra spaces and ensure proper capitalization
  return name.trim()
    .split(/\s+/) // Split by any whitespace
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Payment request schema
const payRequestSchema = Joi.object({
  ReturnUrl: Joi.string().uri().required(),
  OrderId: Joi.string().max(64).allow('').optional(),
  ClientIp: Joi.string().ip().required(),
  Installment: Joi.number().integer().min(1).required(),
  Amount: Joi.number().positive().required(),
  Is3D: Joi.boolean().required(),
  IsAutoCommit: Joi.boolean().required(),
  ReflectCost: Joi.boolean().optional(),
  CardInfo: Joi.object({
    CardOwner: Joi.string().min(1).required()
      .messages({
        'string.min': 'CardOwner is required',
        'string.empty': 'CardOwner is required',
        'any.required': 'CardOwner is required'
      }),
    CardNo: Joi.string().min(13).max(19).required()
      .messages({
        'string.empty': 'Card number is required',
        'string.min': 'Card number must be at least 13 digits',
        'string.max': 'Card number must be at most 19 digits',
        'any.required': 'Card number is required'
      }),
    Month: Joi.string().length(2).pattern(/^(0[1-9]|1[0-2])$/).required()
      .messages({
        'string.pattern.base': 'Month must be 2 digits (01-12)',
        'string.length': 'Month must be 2 digits (01-12)',
        'any.required': 'Month is required'
      }),
    Year: Joi.string().min(2).max(4).pattern(/^[0-9]{2,4}$/).required()
      .messages({
        'string.pattern.base': 'Year must be 2 or 4 digits',
        'string.min': 'Year must be at least 2 digits',
        'string.max': 'Year must be at most 4 digits',
        'any.required': 'Year is required'
      }),
    Cvv: Joi.string().length(3).pattern(/^[0-9]{3}$/).required()
      .messages({
        'string.pattern.base': 'CVV must be 3 digits',
        'string.length': 'CVV must be 3 digits',
        'any.required': 'CVV is required'
      }),
  }).required(),
  CustomerInfo: Joi.object({
    Name: Joi.string().allow('').optional(),
    Phone: Joi.string().allow('').optional(),
    Email: Joi.string().email().allow('').optional(),
    Address: Joi.string().allow('').optional(),
    Description: Joi.string().allow('').optional()
  }).optional(),
  Products: Joi.array().items(
    Joi.object({
      Name: Joi.string().required(),
      Count: Joi.number().integer().min(1).required(),
      UnitPrice: Joi.number().positive().required()
    })
  ).optional()
});

// Proxy payment request endpoint
app.post('/api/pay-request', authenticate, async (req, res) => {
  try {
    // Log the incoming request for debugging
    console.log('Incoming payment request:', JSON.stringify(req.body, null, 2));
    
    // Log headers for debugging
    console.log('Request headers:', req.headers);

    // Validate request body
    const { error, value } = payRequestSchema.validate(req.body);
    if (error) {
      console.error('Validation error:', error.details);
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Prepare credential headers
    const credentialHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Payment-Proxy/1.0',
      'MerchantId': process.env.MERCHANT_ID,
      'UserId': process.env.USER_ID,
      'ApiKey': process.env.API_KEY 
    };

    // Validate that all required credentials are present
    if (!credentialHeaders.MerchantId || !credentialHeaders.UserId || !credentialHeaders.ApiKey) {
      console.error('Missing required credentials:', {
        hasMerchantId: !!credentialHeaders.MerchantId,
        hasUserId: !!credentialHeaders.UserId,
        hasApiKey: !!credentialHeaders.ApiKey
      });
      return res.status(500).json({
        success: false,
        error: 'Payment service configuration error',
        details: 'Missing required payment provider credentials'
      });
    }

    // Prepare the JSON payload according to İşyeriPOS API documentation
    const requestPayload = {
      ReturnUrl: value.ReturnUrl,
      OrderId: sanitizeOrderId(value.OrderId),
      ClientIp: value.ClientIp,
      Installment: value.Installment,
      Amount: parseFloat(formatAmount(value.Amount)),
      Is3D: value.Is3D,
      IsAutoCommit: value.IsAutoCommit,
      CardInfo: {
        CardOwner: formatCardOwner(value.CardInfo.CardOwner),
        CardNo: value.CardInfo.CardNo.replace(/\s+/g, ''),
        Month: value.CardInfo.Month.padStart(2, '0'),
        Year: value.CardInfo.Year.padStart(2, '0'),
        Cvv: value.CardInfo.Cvv
      },
      CustomerInfo: {
        Name: value.CustomerInfo?.Name || '',
        Phone: value.CustomerInfo?.Phone || '',
        Email: value.CustomerInfo?.Email || '',
        Address: value.CustomerInfo?.Address || '',
        Description: value.CustomerInfo?.Description || ''
      }
    };
    
    // Add ReflectCost only if it's explicitly provided as a boolean
    if (typeof value.ReflectCost === 'boolean') {
      requestPayload.ReflectCost = value.ReflectCost;
    }
    
    // Add Products if provided
    if (value.Products && value.Products.length > 0) {
      requestPayload.Products = value.Products.map(product => ({
        Name: product.Name,
        Count: product.Count,
        UnitPrice: parseFloat(formatAmount(product.UnitPrice))
      }));
    }

    // Log the request we're about to make (with masked sensitive data)
    console.log('Making JSON request to İşyeriPOS:', {
      url: 'https://api.isyerimpos.com/v1/payRequest3d',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'MerchantId': credentialHeaders.MerchantId,
        'UserId': credentialHeaders.UserId,
        'ApiKey': '****' // Masked for logging
      },
      payload: {
        ...requestPayload,
        CardInfo: {
          ...requestPayload.CardInfo,
          CardNo: '****',
          Cvv: '***'
        }
      }
    });

    // Log the actual request payload structure for debugging
    console.log('Full request payload structure:', {
      ReturnUrl: typeof requestPayload.ReturnUrl,
      OrderId: typeof requestPayload.OrderId,
      ClientIp: typeof requestPayload.ClientIp,
      Installment: typeof requestPayload.Installment,
      Amount: typeof requestPayload.Amount,
      Is3D: typeof requestPayload.Is3D,
      IsAutoCommit: typeof requestPayload.IsAutoCommit,
      ReflectCost: typeof requestPayload.ReflectCost,
      CardInfo: Object.keys(requestPayload.CardInfo),
      CustomerInfo: Object.keys(requestPayload.CustomerInfo),
      Products: requestPayload.Products ? requestPayload.Products.length : 'undefined'
    });

    // Forward the request to İşyeriPOS as JSON
    const response = await axios.post(
      'https://api.isyerimpos.com/v1/payRequest3d',
      requestPayload,
      { 
        headers: credentialHeaders,
        validateStatus: null,
        timeout: 30000,
        maxRedirects: 5,
        // Add response interceptor to capture all response data
        transformResponse: [(data) => {
          console.log('Raw response data:', data);
          return data;
        }]
      }
    );

    // Log response details
    console.log('İşyeriPOS response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      dataLength: response.data ? response.data.length : 0,
      dataType: typeof response.data
    });

    // Handle error responses
    if (response.status >= 400) {
      console.error('İşyeriPOS error response:', {
        status: response.status,
        data: response.data,
        headers: response.headers,
        requestPayload: {
          ...requestPayload,
          CardInfo: { ...requestPayload.CardInfo, CardNo: '****', Cvv: '***' }
        }
      });

      // Try to get more details about the error
      let errorMessage = 'Payment provider rejected the request';
      let errorDetails = 'The payment request was rejected. Please verify all payment details are correct.';
      
      if (response.data) {
        try {
          const errorData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
          if (errorData.Message) {
            errorDetails = errorData.Message;
          } else if (errorData.message) {
            errorDetails = errorData.message;
          } else if (typeof response.data === 'string' && response.data.trim()) {
            errorDetails = response.data;
          }
        } catch (e) {
          // If it's not JSON, use the raw data
          errorDetails = response.data.toString();
        }
      }

      return res.status(502).json({
        success: false,
        error: errorMessage,
        details: errorDetails,
        debug: {
          status: response.status,
          message: response.data,
          payloadSent: {
            ...requestPayload,
            CardInfo: { ...requestPayload.CardInfo, CardNo: '****', Cvv: '***' }
          }
        }
      });
    }

    // Parse response if it's a string
    let posResponse = response.data;
    if (typeof posResponse === 'string') {
      try {
        posResponse = JSON.parse(posResponse);
      } catch (parseError) {
        console.error('Failed to parse İşyeriPOS response:', parseError);
        throw new Error('Invalid JSON response from payment provider');
      }
    }

    // Check if the response indicates success
    if (!posResponse || !posResponse.IsDone || posResponse.ErrorCode !== 0) {
      const errorMessage = posResponse?.Message || 'Payment request failed';
      console.error('İşyeriPOS returned error:', {
        isDone: posResponse?.IsDone,
        errorCode: posResponse?.ErrorCode,
        message: posResponse?.Message,
        errors: posResponse?.Errors
      });
      
      // Return the error response directly instead of throwing
      return res.status(400).json({
        success: false,
        error: errorMessage,
        data: posResponse ? JSON.stringify(posResponse) : null,
        debug: {
          isDone: posResponse?.IsDone,
          errorCode: posResponse?.ErrorCode,
          errors: posResponse?.Errors
        }
      });
    }

    // Extract content from the nested structure
    const content = posResponse.Content;
    if (!content) {
      throw new Error('Invalid response format from payment provider - missing Content');
    }

    // Check if we have either PaymentLink or ResponseAsHtml
    if (!content.PaymentLink && !content.ResponseAsHtml) {
      throw new Error('Invalid response format from payment provider - missing PaymentLink and ResponseAsHtml');
    }

    // Return the successful response
    return res.status(200).json({
      success: true,
      uid: content.Uid,
      paymentLink: content.PaymentLink,
      responseHtml: content.ResponseAsHtml
    });

  } catch (error) {
    console.error('Error forwarding payment request:', error);

    if (error.response) {
      return res.status(502).json({
        success: false,
        error: 'Payment provider error',
        details: error.response.data || error.message,
        debug: {
          status: error.response.status,
          contentType: error.response.headers?.['content-type']
        }
      });
    } else if (error.request) {
      return res.status(504).json({
        success: false,
        error: 'Payment provider timeout',
        details: 'No response received from payment provider',
        debug: {
          errorType: 'REQUEST_ERROR',
          message: error.message
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Payment verification service error',
        details: error.message
      });
    }
  }
});

// Proxy 3D payment completion endpoint
app.post('/api/pay-complete', authenticate, async (req, res) => {
  try {
    const uid = req.query.uid || req.body.uid;
    const key = req.query.key || req.body.key;
    if (!uid || !key) {
      return res.status(400).json({ success: false, error: 'Missing uid or key' });
    }
    const headers = {
      'Content-Type': 'application/json',
      'MerchantId': process.env.MERCHANT_ID,
      'UserId': process.env.USER_ID,
      'ApiKey': process.env.API_KEY
    };
    const requestBody = { uid, key };
    const response = await axios.post(
      'https://api.isyerimpos.com/v1/payComplete',
      requestBody,
      { headers, maxRedirects: 5 }
    );
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error forwarding pay-complete:', error);
    if (error.response) {
      // Pass through more specific error details
      const errorData = error.response.data;
      let errorMessage = 'Payment completion failed';
      
      if (errorData) {
        try {
          const parsed = typeof errorData === 'string' ? JSON.parse(errorData) : errorData;
          if (parsed.Message) {
            errorMessage = parsed.Message;
          } else if (parsed.message) {
            errorMessage = parsed.message;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } catch (e) {
          errorMessage = errorData.toString();
        }
      }
      
      return res.status(error.response.status).json({ 
        success: false, 
        error: errorMessage,
        details: errorData 
      });
    }
    return res.status(500).json({ 
      success: false, 
      error: 'Payment completion service error',
      details: error.message 
    });
  }
});

// Proxy payment result control endpoint
app.post('/api/pay-result', authenticate, async (req, res) => {
  try {
    const uid = req.query.uid || req.body.uid;
    const orderId = req.query.orderId || req.body.orderId;
    
    if (!uid && !orderId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing uid or orderId',
        details: 'Either uid or orderId parameter is required to check payment result'
      });
    }

    console.log('Checking payment result:', { uid, orderId });

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'MerchantId': process.env.MERCHANT_ID,
      'UserId': process.env.USER_ID,
      'ApiKey': process.env.API_KEY
    };

    // Build the URL with query parameters as specified in the docs
    let url = 'https://api.isyerimpos.com/v1/payResultCheck';
    if (uid) {
      url += `?uid=${uid}`;
    } else {
      url += `?orderId=${orderId}`;
    }

    console.log('Making request to:', url);

    const response = await axios.post(
      url,
      {}, // Empty body as per documentation
      { 
        headers, 
        validateStatus: null,
        timeout: 30000
      }
    );

    console.log('Payment result response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    // Handle error responses
    if (response.status >= 400) {
      console.error('Payment result check error:', {
        status: response.status,
        data: response.data
      });
      return res.status(502).json({ 
        success: false, 
        error: 'Payment provider error',
        details: response.data || 'Failed to check payment result'
      });
    }

    // Parse response if it's a string
    let resultResponse = response.data;
    if (typeof resultResponse === 'string') {
      try {
        resultResponse = JSON.parse(resultResponse);
      } catch (parseError) {
        console.error('Failed to parse payment result response:', parseError);
        return res.status(500).json({
          success: false,
          error: 'Invalid response from payment provider'
        });
      }
    }

    // Check if the API call was successful
    if (!resultResponse || !resultResponse.IsDone || resultResponse.ErrorCode !== 0) {
      console.error('Payment result check failed:', {
        isDone: resultResponse?.IsDone,
        errorCode: resultResponse?.ErrorCode,
        message: resultResponse?.Message,
        errors: resultResponse?.Errors
      });
      return res.status(200).json({
        success: false,
        error: resultResponse?.Message || 'Payment verification failed',
        paymentData: resultResponse
      });
    }

    const content = resultResponse.Content;
    if (!content) {
      return res.status(200).json({
        success: false,
        error: 'Invalid response format - missing content',
        paymentData: resultResponse
      });
    }

    // Check if payment was successful (Status should be 4)
    const isPaymentSuccessful = content.Status === 4;
    
    console.log('Payment verification result:', {
      status: content.Status,
      isSuccessful: isPaymentSuccessful,
      authCode: content.AuthCode,
      amount: content.Amount,
      netAmount: content.NetAmount
    });

    return res.status(200).json({
      success: isPaymentSuccessful,
      paymentSuccessful: isPaymentSuccessful,
      paymentData: {
        uid: content.Uid,
        orderId: content.OrderId,
        status: content.Status,
        authCode: content.AuthCode,
        amount: content.Amount,
        netAmount: content.NetAmount,
        withdrawnAmount: content.WithdrawnAmount,
        fmCostAmount: content.FmCostAmount,
        creationTime: content.CreationTime,
        valorDate: content.ValorDate,
        installment: content.Installment,
        cardInfo: content.CardInfo,
        customerInfo: content.CustomerInfo
      },
      message: isPaymentSuccessful ? 'Payment completed successfully' : 'Payment was not successful',
      rawResponse: resultResponse
    });

  } catch (error) {
    console.error('Error checking payment result:', error);

    if (error.response) {
      return res.status(502).json({
        success: false,
        error: 'Payment provider error',
        details: error.response.data || error.message
      });
    } else if (error.request) {
      return res.status(504).json({
        success: false,
        error: 'Payment provider timeout',
        details: 'No response received from payment provider'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Payment verification service error',
        details: error.message
      });
    }
  }
});

// Refund request schema
const refundRequestSchema = Joi.object({
  uid: Joi.string().required().messages({
    'string.empty': 'UID is required',
    'any.required': 'UID is required'
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be positive',
    'any.required': 'Amount is required'
  }),
  description: Joi.string().allow('').optional()
});

// Refund request endpoint
app.post('/api/refund-request', authenticate, async (req, res) => {
  try {
    console.log('Incoming refund request:', JSON.stringify(req.body, null, 2));

    // Validate request body
    const { error, value } = refundRequestSchema.validate(req.body);
    if (error) {
      console.error('Refund validation error:', error.details);
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Prepare credential headers
    const credentialHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Payment-Proxy/1.0',
      'MerchantId': process.env.MERCHANT_ID,
      'UserId': process.env.USER_ID,
      'ApiKey': process.env.API_KEY
    };

    // Validate that all required credentials are present
    if (!credentialHeaders.MerchantId || !credentialHeaders.UserId || !credentialHeaders.ApiKey) {
      console.error('Missing required credentials for refund:', {
        hasMerchantId: !!credentialHeaders.MerchantId,
        hasUserId: !!credentialHeaders.UserId,
        hasApiKey: !!credentialHeaders.ApiKey
      });
      return res.status(500).json({
        success: false,
        error: 'Refund service configuration error',
        details: 'Missing required payment provider credentials'
      });
    }

    // Prepare the refund request payload according to İşyeriPOS documentation
    const refundPayload = {
      uid: value.uid,
      amount: value.amount,
      description: value.description || 'Admin deposit refund'
    };

    console.log('Sending refund request to İşyeriPOS:', {
      url: 'https://api.isyerimpos.com/v1/refundRequest',
      payload: refundPayload,
      headers: {
        ...credentialHeaders,
        'ApiKey': '****' // Hide API key in logs
      }
    });

    // Make the refund request to İşyeriPOS API
    const response = await axios.post(
      'https://api.isyerimpos.com/v1/refundRequest',
      refundPayload,
      {
        headers: credentialHeaders,
        validateStatus: null, // Don't throw error on non-2xx status
        timeout: 30000 // 30 seconds timeout
      }
    );

    console.log('İşyeriPOS refund response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    // Check if the request was successful
    if (response.status === 200 && response.data) {
      const responseData = response.data;
      
      // Check if the refund was successful according to İşyeriPOS response format
      if (responseData.IsDone === true && responseData.ErrorCode === 200) {
        return res.status(200).json({
          success: true,
          message: responseData.Message,
          data: responseData
        });
      } else {
        // Refund request failed
        console.error('Refund request failed:', responseData);
        return res.status(400).json({
          success: false,
          error: responseData.Message || 'Refund request failed',
          errorCode: responseData.ErrorCode,
          errors: responseData.Errors
        });
      }
    } else {
      // HTTP error or unexpected response
      console.error('HTTP error in refund request:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      return res.status(response.status || 500).json({
        success: false,
        error: 'Refund request failed',
        details: response.data || response.statusText,
        httpStatus: response.status
      });
    }

  } catch (error) {
    console.error('Refund request error:', error);
    
    // Check if it's an axios error with response
    if (error.response) {
      console.error('İşyeriPOS API error response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      return res.status(error.response.status || 500).json({
        success: false,
        error: 'Refund service error',
        details: error.response.data || error.response.statusText,
        httpStatus: error.response.status
      });
    }
    
    // Network or other error
    return res.status(500).json({
      success: false,
      error: 'Internal server error during refund request',
      details: error.message
    });
  }
});

// Add a test endpoint to debug the İşyeriPOS API
app.post('/api/test-payment', authenticate, async (req, res) => {
  try {
    console.log('=== TESTING İŞYERİPOS API ===');
    
    // Prepare minimal test payload
    const testPayload = {
      ReturnUrl: 'https://www.arazialcom.net/payment-result',
      OrderId: 'TEST' + Date.now(),
      ClientIp: '127.0.0.1',
      Installment: 1,
      Amount: 10.00, // Test with 10 TL
      Is3D: true,
      IsAutoCommit: true,
      CardInfo: {
        CardOwner: 'Test User',
        CardNo: '4111111111111111', // Test card
        Month: '12',
        Year: '25',
        Cvv: '123'
      },
      CustomerInfo: {
        Name: 'Test Customer',
        Phone: '5551234567',
        Email: 'test@test.com',
        Address: 'Test Address',
        Description: 'Test Payment'
      },
      Products: [
        {
          Name: 'Test Product',
          Count: 1,
          UnitPrice: 10.00
        }
      ]
    };

    const credentialHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Payment-Proxy/1.0',
      'MerchantId': '11039', // Test environment
      'UserId': '445', // Test environment  
      'ApiKey': 'AQAAAAEAACcQAAAAEBfEWS9XGrZta1wfYC1qeTCA2gJIbDH1+rQEdrY8k4qE8EFtWf3i0Axyb4jY2uReyw==' // Test environment
    };

    console.log('Test payload:', JSON.stringify(testPayload, null, 2));
    console.log('Headers:', {
      ...credentialHeaders,
      'ApiKey': '****'
    });

    // Test the request
    const response = await axios.post(
      'https://api.isyerimpos.com/v1/payRequest3d',
      testPayload,
      { 
        headers: credentialHeaders,
        validateStatus: null,
        timeout: 30000
      }
    );

    console.log('Test response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });

    return res.status(200).json({
      success: true,
      testResult: {
        status: response.status,
        data: response.data,
        headers: response.headers
      }
    });

  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.response ? error.response.data : null
    });
  }
});

// Add a test endpoint for form-encoded data
app.post('/api/test-payment-form', authenticate, async (req, res) => {
  try {
    console.log('=== TESTING İŞYERİPOS API WITH FORM DATA ===');
    
    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('ReturnUrl', 'https://www.arazialcom.net/payment-result');
    formData.append('OrderId', 'FORMTEST' + Date.now());
    formData.append('ClientIp', '127.0.0.1');
    formData.append('Installment', '1');
    formData.append('Amount', '10.00');
    formData.append('Is3D', 'true');
    formData.append('IsAutoCommit', 'true');
    
    // Card Info
    formData.append('CardInfo.CardOwner', 'Test User');
    formData.append('CardInfo.CardNo', '4111111111111111');
    formData.append('CardInfo.Month', '12');
    formData.append('CardInfo.Year', '25');
    formData.append('CardInfo.Cvv', '123');
    
    // Customer Info
    formData.append('CustomerInfo.Name', 'Test Customer');
    formData.append('CustomerInfo.Phone', '5551234567');
    formData.append('CustomerInfo.Email', 'test@test.com');
    formData.append('CustomerInfo.Address', 'Test Address');
    formData.append('CustomerInfo.Description', 'Test Payment');
    
    // Products
    formData.append('Products[0].Name', 'Test Product');
    formData.append('Products[0].Count', '1');
    formData.append('Products[0].UnitPrice', '10.00');

    const credentialHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'MerchantId': '11039', // Test environment
      'UserId': '445', // Test environment
      'ApiKey': 'AQAAAAEAACcQAAAAEBfEWS9XGrZta1wfYC1qeTCA2gJIbDH1+rQEdrY8k4qE8EFtWf3i0Axyb4jY2uReyw==' // Test environment
    };

    console.log('Form data:', formData.toString());
    console.log('Headers:', {
      ...credentialHeaders,
      'ApiKey': '****'
    });

    // Test the request
    const response = await axios.post(
      'https://api.isyerimpos.com/v1/payRequest3d',
      formData,
      { 
        headers: credentialHeaders,
        validateStatus: null,
        timeout: 30000
      }
    );

    console.log('Form test response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });

    return res.status(200).json({
      success: true,
      testResult: {
        status: response.status,
        data: response.data,
        headers: response.headers,
        method: 'form-encoded'
      }
    });

  } catch (error) {
    console.error('Form test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.response ? error.response.data : null,
      method: 'form-encoded'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Payment Proxy Server running on port ${PORT}`);
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