import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

router.get('/', async(req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error fetching categories' });
    }
});

export default router;