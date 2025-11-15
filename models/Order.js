import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    total: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true }
    },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, default: 'pending', enum: ['pending', 'paid', 'failed'] },
    paymentId: { type: String },
    email: { type: String } // Optional email field
});

export default mongoose.model('Order', orderSchema);