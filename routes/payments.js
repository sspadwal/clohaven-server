import express from 'express';
import Stripe from 'stripe';
import { checkUser } from '../middleware/authMiddleware.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
router.post('/create-payment-intent', checkUser, async(req, res) => {
    try {
        const { amount } = req.body;

        // Validate amount
        if (!amount || isNaN(amount) || amount < 50) { // Minimum 50 paise
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Ensure integer
            currency: 'inr',
            metadata: {
                userId: req.user.id.toString()
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Payment intent error:', error);
        res.status(500).json({
            message: 'Payment processing failed',
            error: error.message
        });
    }
});

export default router;