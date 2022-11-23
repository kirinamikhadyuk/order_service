const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const model = require('./model/order');
const axios = require('axios');
require('dotenv').config();

const mongoURL = process.env.MONGO_URL;
const bookServiceURL = process.env.BOOK_SERVICE_URL;
const customerServiceURL = process.env.CUSTOMER_SERVICE_URL;
const Order = mongoose.model("orders", model.OrderSchema);

mongoose.connect(mongoURL);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "*");
    if (req.method === "OPTIONS") {
        res.header(
            "Access-Control-Allow-Methods", "GET,POST,DELETE"
        )
        return res.status(200).json({})
    }
    next();
});

app.get("/", (req, res) => {
    res.send("This is orders service");
});

app.post("/order", (req, res) => {
    const order = new Order(req.body);
    order.save()
        .then(data => {
            res.status(200).send(data);
        })
        .catch(error => {
            res.status(400).send(error);
        });
});

app.get("/allOrders", (req, res) => {
    Order.find()
        .then(data => {
            res.status(200).send(data);
        })
        .catch(error => {
            res.status(400).send(error);
        });
});

app.get("/order/id", (req, res) => {
    Order.findById(req.query.id)
        .then(async data => {
            if (!!data) {
                const orderObject = {
                    id: data.id,
                    initialDate: data.initialDate,
                    deliveryDate: data.deliveryDate
                }
                const bookRequest = axios.get(bookServiceURL + 'book/id?id=' + data.bookId);
                const customerRequest = axios.get(customerServiceURL + 'customer/id?id=' + data.customerId);

                axios.all([bookRequest, customerRequest])
                    .then(axios.spread((...responses) => {
                        const book = responses[0];
                        const customer = responses[1];

                        orderObject.bookTitle = book.data.title;
                        orderObject.customerName = customer.data.name;

                        res.status(200).send(orderObject);
                    }))
                    .catch(errors => {
                        res.status(400).send(errors);
                    });
            } else {
                res.status(400).send("No data with specified id found");
            }
        })
        .catch(error => {
            res.status(400).send(error);
        });
});

app.delete("/order/id", (req, res) => {
    Order.findByIdAndDelete(req.query.id)
        .then(result => {
            const response = !!result ? result : 'No data with specified id found'
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(400).send(error);
        });
});

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Listening: http://localhost:${port}`);
})