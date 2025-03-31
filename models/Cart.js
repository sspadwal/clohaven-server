import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Who owns this cart
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Product ID
        quantity: { type: Number, default: 1 } // How many
    }]
});

export default mongoose.model('Cart', cartSchema);