import express from 'express';
import Product from '../models/Product.js';
import { checkAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all products (existing)
router.get('/', async(req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { category } : {};
        const products = await Product.find(filter).populate('category');
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
});

// Get a single product by ID (new)
router.get('/:id', async(req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ message: 'Server error fetching product' });
    }
});

// Add a new product (existing)
router.post('/', checkAdmin, async(req, res) => {
    const { name, price, description, category, images } = req.body;
    try {
        const product = new Product({
            name,
            price,
            description,
            category,
            images: Array.isArray(images) ? images : [images] // Ensure array
        });
        await product.save();
        res.json({ message: 'Product added!', product });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Server error adding product' });
    }
});

// Update a product (existing)
router.put('/:id', checkAdmin, async(req, res) => {
    const { name, price, description, category, images } = req.body;
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id, { name, price, description, category, images: Array.isArray(images) ? images : [images] }, { new: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product updated!', product });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error updating product' });
    }
});

// Delete a product (existing)
router.delete('/:id', checkAdmin, async(req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted!' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error deleting product' });
    }
});





export default router;