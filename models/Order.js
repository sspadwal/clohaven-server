import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Who ordered
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Product ID
        quantity: { type: Number, required: true }, // How many
        price: { type: Number, required: true } // Price at checkout
    }],
    total: { type: Number, required: true }, // Total cost
    createdAt: { type: Date, default: Date.now } // When ordered
});

export default mongoose.model('Order', orderSchema);