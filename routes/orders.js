import express from 'express';
import Order from '../models/Order.js';
import { checkUser } from '../middleware/authMiddleware.js';

const router = express.Router();

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

export default router;