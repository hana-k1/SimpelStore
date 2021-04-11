const mongoose = require('mongoose');
const Product = require('./product');
const { schema } = require('./product');

const { Schema } = mongoose;

const storeSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Store most have a name!']
    },
    city: {
        type: String,
    },
    email: {
        type: String,
        required: [true, 'Email required!']
    },
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    ]
})

storeSchema.post('findOneAndDelete', async function (store) {
    if (store.products.length) {
        const res = await Product.deleteMany({ _id: { $in: store.products } });
        console.log(res);
    }
})
const Store = mongoose.model('Store', storeSchema);

module.exports = Store;