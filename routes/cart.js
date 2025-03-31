import express from 'express';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { checkUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Add to cart
router.post('/', checkUser, async(req, res) => {
    const { productId, quantity } = req.body;
    try {
        // Validate product exists
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

// Remove item from cart
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

// Checkout
router.post('/checkout', checkUser, async(req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Verify all products still exist and have sufficient stock
        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);
            if (!product) {
                return res.status(400).json({
                    message: `Product ${item.product.name} is no longer available`
                });
            }
            // Add stock check if you have inventory management
        }

        let total = 0;
        const orderItems = cart.items.map(item => {
            const itemTotal = item.product.price * item.quantity;
            total += itemTotal;
            return {
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            };
        });

        const order = new Order({
            user: req.user.id,
            items: orderItems,
            total
        });
        await order.save();

        await Cart.deleteOne({ user: req.user.id });
        res.json({ message: 'Checkout successful!', order });
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ message: 'Server error during checkout' });
    }
});

export default router;