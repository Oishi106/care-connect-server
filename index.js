const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db'); // Import connectDB
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Stripe setup

const port = process.env.PORT || 8000;
const app = express();

// Connect to Database
connectDB(); 

// middleware
app.use(cors());
app.use(express.json());

// Stripe Payment Intent Route
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { price } = req.body;
        
        // Validation: Price na thakle error dibe
        if (!price) {
            return res.status(400).send({ error: "Price is required" });
        }

        // Stripe cents/poisha-te hisheb kore, tai 100 diye gun kora hoyeche
        const amount = parseInt(price * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method_types: ['card'],
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Stripe Error:", error.message);
        res.status(500).send({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Care Connect Server is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});