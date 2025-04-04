import express from 'express';
import Order from '../models/Order.js';
import { checkUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all orders for user
router.get('/', checkUser, async(req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('items.product');
        // Filter out items with null products
        const validOrders = orders.map(order => ({
            ...order.toObject(),
            items: order.items.filter(item => item.product !== null)
        }));
        res.json(validOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
});

// Create new order
router.post('/', checkUser, async(req, res) => {
    try {
        const { shippingAddress, items, total, paymentMethod, paymentStatus, paymentId } = req.body;

        // Validate required fields
        if (!shippingAddress || !items || !total || !paymentMethod) {
            return res.status(400).json({
                message: 'Missing required fields',
                required: ['shippingAddress', 'items', 'total', 'paymentMethod']
            });
        }

        // Validate items array
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Items must be a non-empty array' });
        }

        // Validate shipping address
        const { address, city, state, zip } = shippingAddress;
        if (!address || !city || !state || !zip) {
            return res.status(400).json({ message: 'Shipping address is incomplete' });
        }

        // Create order
        const order = new Order({
            user: req.user.id,
            shippingAddress: { address, city, state, zip },
            items: items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                price: item.price
            })),
            total,
            paymentMethod,
            paymentStatus: paymentStatus || 'paid',
            paymentId: paymentId || null
        });

        // Save order
        const savedOrder = await order.save();

        // Populate product details for response
        const populatedOrder = await Order.populate(savedOrder, {
            path: 'items.product',
            select: 'name images'
        });

        res.status(201).json(populatedOrder);
    } catch (error) {
        console.error('Detailed order creation error:', {
            message: error.message,
            stack: error.stack,
            errors: error.errors
        });

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({
            message: 'Server error creating order',
            error: error.message
        });
    }
});

// Update order status
router.patch('/:id', checkUser, async(req, res) => {
    try {
        const { paymentStatus, paymentId } = req.body;

        const order = await Order.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { paymentStatus, paymentId }, { new: true }).populate('items.product');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Server error updating order' });
    }
});

export default router;