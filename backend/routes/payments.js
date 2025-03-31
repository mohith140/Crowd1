const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');

// Initialize Razorpay with keys from environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_XphPOSB4djGspx',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'CCrxVo3coD3SKNM3a0Bbh2my',
});

/**
 * @route POST /api/payments/orders
 * @desc Create a Razorpay order
 * @access Public
 */
router.post('/orders', async (req, res) => {
  try {
    console.log("Creating order for amount:", req.body.amount);
    
    // Validate amount
    if (!req.body.amount || isNaN(req.body.amount) || req.body.amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    
    const options = {
      amount: req.body.amount, // amount in smallest currency unit (paise for INR)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      payment_capture: 1 // Auto-capture payment
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ error: 'Error creating Razorpay order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ error: 'Server error while creating order', details: error.message });
  }
});

/**
 * @route POST /api/payments/verify
 * @desc Verify a Razorpay payment
 * @access Public
 */
router.post('/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Verify payment signature
    const crypto = require('crypto');
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'CCrxVo3coD3SKNM3a0Bbh2my')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      // Payment is authentic
      // Here you can update your database to reflect the completed payment
      return res.json({ 
        success: true, 
        message: 'Payment verified successfully',
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed' 
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Server error while verifying payment' });
  }
});

/**
 * @route POST /api/payments/create-order
 * @desc Create a Razorpay order with more options
 * @access Public
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', notes = {} } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    
    const options = {
      amount: amount * 100, // Razorpay accepts amount in paise
      currency: currency,
      receipt: `order_rcptid_${Math.random().toString(36).substring(2, 15)}`,
      payment_capture: 1,
      notes: notes
    };
    
    const response = await razorpay.orders.create(options);
    res.json(response);
  } catch (error) {
    console.error('Error creating advanced Razorpay order:', error);
    res.status(500).json({ error: 'Error creating Razorpay order', details: error.message });
  }
});

module.exports = router; 