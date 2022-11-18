const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const OrderSchema = new Schema({
    bookId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    customerId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    initialDate: {
        type: Date,
        required: true
    },
    deliveryDate: {
        type: Date,
        required: true
    }
});

exports.OrderSchema = OrderSchema;