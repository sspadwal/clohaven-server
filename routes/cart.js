import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { checkUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Clear entire cart (moved up)
router.delete('/clear', checkUser, async(req, res) => {
    try {
        const cart = await Cart.findOneAndDelete({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ message: 'Server error clearing cart' });
    }
});

// Add to cart
router.post('/', checkUser, async(req, res) => {
    const { productId, quantity } = req.body;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity || 1;
        } else {
            cart.items.push({ product: productId, quantity: quantity || 1 });
        }

        await cart.save();
        const populatedCart = await Cart.findById(cart._id).populate('items.product');
        res.json({ message: 'Added to cart!', cart: populatedCart });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Server error adding to cart' });
    }
});

// View cart
router.get('/', checkUser, async(req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        if (!cart) return res.json({ items: [] });
        res.json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Server error fetching cart' });
    }
});

// Update item quantity
router.put('/:productId', checkUser, async(req, res) => {
    const { quantity } = req.body;
    try {
        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item =>
            item.product.toString() === req.params.productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        const populatedCart = await Cart.findById(cart._id).populate('items.product');
        res.json({
            message: 'Quantity updated successfully',
            cart: populatedCart
        });
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ message: 'Server error updating quantity' });
    }
});

// Remove item from cart (moved down)
router.delete('/:productId', checkUser, async(req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== req.params.productId
        );

        await cart.save();

        const populatedCart = await Cart.findById(cart._id).populate('items.product');
        res.json({
            message: 'Item removed from cart',
            cart: populatedCart
        });
    } catch (error) {
        console.error('Error removing item:', error);
        res.status(500).json({ message: 'Server error removing item' });
    }
});

export default router;