import express from 'express';
import Order from '../models/Order.js';
import { checkAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/orders', checkAdmin, async(req, res) => {
    try {
        const orders = await Order.find()
            .populate('items.product')
            .populate('user', 'email');
        // Filter out orders with null users and clean items with null products
        const validOrders = orders
            .filter(order => order.user !== null)
            .map(order => ({
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