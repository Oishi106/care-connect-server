const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');
const Message = require('./models/Message');

const port = process.env.PORT || 8000;
const app = express();

// Connect to Database
connectDB();

// ------------------------------------------------
// WEBHOOK — must be before express.json()
// ------------------------------------------------

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { bookingId, userEmail, serviceTitle } = session.metadata;

        try {
            if (bookingId) {
                await Booking.findByIdAndUpdate(bookingId, {
                    status: 'Confirmed',
                    paymentStatus: 'paid',
                });
            }

            await Payment.create({
                userEmail,
                bookingId,
                stripeSessionId: session.id,
                amount: session.amount_total / 100,
                status: 'paid',
                serviceTitle: serviceTitle || 'Care Service',
            });

            console.log('Payment recorded for:', userEmail);
        } catch (err) {
            console.error('DB Update Error:', err.message);
        }
    }

    res.json({ received: true });
});

// ------------------------------------------------
// MIDDLEWARE
// ------------------------------------------------

app.use(cors());
app.use(express.json());

// ------------------------------------------------
// SEED ROUTE
// POST http://localhost:8000/seed-services
// ------------------------------------------------

app.post('/seed-services', async (req, res) => {
    try {
        const services = [
            { title: "Elderly Care", description: "Daily living assistance, health monitoring, and companionship for senior adults.", price: 15, badge: "Most Popular", image: "https://i.ibb.co.com/vMVR7X9/Elderly-Care.avif", category: "Senior Care" },
            { title: "Baby Sitting", description: "Trusted and trained babysitters for infants and toddlers with a safety-first approach.", price: 12, badge: "Top Rated", image: "https://i.ibb.co.com/23GywMJQ/Baby-Sitting.avif", category: "Child Care" },
            { title: "Patient Care", description: "In-home nursing and post-surgery recovery assistance for chronic illnesses.", price: 18, badge: "Certified", image: "https://i.ibb.co.com/5WdJgN9P/Patient-Care.avif", category: "Medical" },
            { title: "Special Needs", description: "Tailored support for individuals with physical or developmental disabilities.", price: 20, badge: "Expert Care", image: "https://i.ibb.co.com/V000FLbC/Special-Needs.avif", category: "Support" },
            { title: "Child Care", description: "After-school supervision, homework help, and engaging activities for kids.", price: 10, badge: "New", image: "https://i.ibb.co.com/N6t35V4q/Child-Care.avif", category: "Child Care" },
            { title: "Night Care", description: "Overnight supervision for patients or seniors who need late-night assistance.", price: 25, badge: "24/7", image: "https://i.ibb.co.com/20kpf4D8/Night-Care.avif", category: "Senior Care" },
            { title: "Therapy Support", description: "Physical and occupational therapy assistance within the comfort of home.", price: 30, badge: "Professional", image: "https://i.ibb.co.com/PzJN6zfx/Therapy-Support.avif", category: "Medical" },
            { title: "Respite Care", description: "Short-term relief for family caregivers, providing a temporary break.", price: 22, badge: "Flexible", image: "https://i.ibb.co.com/xqv1GJfv/Respite-Care.avif", category: "Support" },
            { title: "Dementia Care", description: "Specialized memory care and safety monitoring for dementia patients.", price: 28, badge: "High Demand", image: "https://i.ibb.co.com/qY4CTTQf/Dementia-Care.avif", category: "Senior Care" },
            { title: "Postnatal Care", description: "Support for new mothers and newborns during the recovery phase.", price: 20, badge: "Maternity", image: "https://i.ibb.co.com/5hxXkM9R/Postnatal-Care.avif", category: "Medical" },
            { title: "Pet Sitting", description: "In-home pet care including feeding, walking, and companionship.", price: 8, badge: "Animal Lover", image: "https://i.ibb.co.com/kVvqjfRZ/Pet-Sitting.avif", category: "Personal" },
            { title: "Housekeeping", description: "Professional cleaning and organizing for busy households.", price: 14, badge: "Essential", image: "https://i.ibb.co.com/nsbmTYQM/Housekeeping.avif", category: "Home" },
            { title: "Physiotherapy", description: "Qualified physiotherapists for pain management and mobility restoration.", price: 35, badge: "Specialist", image: "https://i.ibb.co.com/NdT43hTM/Physiotherapy.avif", category: "Medical" },
            { title: "Companion Care", description: "Social interaction and activities for isolated seniors to reduce loneliness.", price: 12, badge: "Friendly", image: "https://i.ibb.co.com/DsHT2qp/Companion-Care.avif", category: "Senior Care" },
            { title: "Medication Admin", description: "Assistance with timely medication and health tracking.", price: 16, badge: "Accurate", image: "https://i.ibb.co.com/RfwDWpZ/Medication-Admin.avif", category: "Medical" },
            { title: "Errand Support", description: "Grocery shopping and running essential errands for those in need.", price: 9, badge: "Helpful", image: "https://i.ibb.co.com/VcpMDBvx/Errand-Support.avif", category: "Personal" },
            { title: "Live-in Care", description: "Full-time residential care with round-the-clock professional support.", price: 40, badge: "Full Support", image: "https://i.ibb.co.com/BKB38Xfj/Live-in-Care.avif", category: "Senior Care" },
            { title: "Palliative Care", description: "Compassionate end-of-life care focusing on comfort and dignity.", price: 45, badge: "Gentle Care", image: "https://i.ibb.co.com/DHM5ssB6/Palliative-Care.avif", category: "Medical" },
            { title: "Disability Escort", description: "Assisting people with disabilities to travel to medical appointments.", price: 18, badge: "Escort", image: "https://i.ibb.co.com/nqW6Gq0y/Disability-Escort.avif", category: "Support" },
            { title: "Tutoring Help", description: "Educational support for children along with general childcare duties.", price: 15, badge: "Education", image: "https://i.ibb.co.com/GvJF5NKs/Tutoring-Help.avif", category: "Child Care" },
        ];

        await Service.deleteMany({});
        await Service.insertMany(services);
        res.send({ message: '20 services seeded successfully!' });
    } catch (error) {
        res.status(500).send({ message: 'Seed failed', error: error.message });
    }
});

// ------------------------------------------------
// SERVICE ROUTES
// ------------------------------------------------

app.get('/services', async (req, res) => {
    try {
        const services = await Service.find();
        res.send(services);
    } catch (error) {
        res.status(500).send({ message: 'Failed to fetch services', error: error.message });
    }
});

app.get('/services/category/:cat', async (req, res) => {
    try {
        const services = await Service.find({ category: req.params.cat });
        res.send(services);
    } catch (error) {
        res.status(500).send({ message: 'Failed to fetch by category', error: error.message });
    }
});

app.get('/services/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).send({ message: 'Service not found' });
        res.send(service);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching service', error: error.message });
    }
});

// ------------------------------------------------
// BOOKING ROUTES
// ------------------------------------------------

app.post('/bookings', async (req, res) => {
    try {
        const booking = new Booking(req.body);
        const result = await booking.save();
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send({ message: 'Failed to create booking', error: error.message });
    }
});

app.get('/bookings', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).send({ message: 'Email required' });
        const bookings = await Booking.find({ userEmail: email }).sort({ createdAt: -1 });
        res.send(bookings);
    } catch (error) {
        res.status(500).send({ message: 'Failed to fetch bookings', error: error.message });
    }
});

app.patch('/bookings/:id', async (req, res) => {
    try {
        const result = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: 'Failed to update booking', error: error.message });
    }
});

// ------------------------------------------------
// PAYMENT ROUTES
// ------------------------------------------------

app.get('/payments', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).send({ message: 'Email required' });
        const payments = await Payment.find({ userEmail: email }).sort({ createdAt: -1 });
        res.send(payments);
    } catch (error) {
        res.status(500).send({ message: 'Failed to fetch payments', error: error.message });
    }
});

// ------------------------------------------------
// USER PROFILE ROUTES
// ------------------------------------------------

app.get('/users/profile', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).send({ message: 'Email required' });
        const mongoose = require('mongoose');
        const db = mongoose.connection.db;
        const user = await db.collection('users').findOne({ email });
        res.send(user || {});
    } catch (error) {
        res.status(500).send({ message: 'Failed to fetch profile', error: error.message });
    }
});

app.put('/users/profile', async (req, res) => {
    try {
        const { email, ...updateData } = req.body;
        if (!email) return res.status(400).send({ message: 'Email required' });
        const mongoose = require('mongoose');
        const db = mongoose.connection.db;
        await db.collection('users').updateOne(
            { email },
            { $set: { ...updateData, updatedAt: new Date() } }
        );
        res.send({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Failed to update profile', error: error.message });
    }
});

// ------------------------------------------------
// STRIPE CHECKOUT SESSION
// ------------------------------------------------

app.post('/create-checkout-session', async (req, res) => {
    try {
        const { price, serviceTitle, bookingId, userEmail } = req.body;
        if (!price) return res.status(400).send({ error: 'Price is required' });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: serviceTitle || 'Care Service',
                        description: 'CareConnect professional care booking',
                    },
                    unit_amount: Math.round(price * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
            cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
            customer_email: userEmail,
            metadata: {
                bookingId: bookingId?.toString() || '',
                userEmail: userEmail || '',
                serviceTitle: serviceTitle || 'Care Service',
            },
        });

        res.send({ url: session.url });
    } catch (error) {
        console.error('Checkout Error:', error.message);
        res.status(500).send({ error: error.message });
    }
});

// ------------------------------------------------
// STRIPE PAYMENT INTENT (পুরনোটা)
// ------------------------------------------------

app.post('/create-payment-intent', async (req, res) => {
    try {
        const { price } = req.body;
        if (!price) return res.status(400).send({ error: 'Price is required' });

        const amount = parseInt(price * 100);
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method_types: ['card'],
        });

        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Stripe Error:', error.message);
        res.status(500).send({ error: error.message });
    }
});

// ------------------------------------------------
// ROOT
// ------------------------------------------------

app.get('/', (req, res) => {
    res.send('Care Connect Server is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



// User এর সব conversations (confirmed bookings থেকে)
app.get('/conversations', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).send({ message: 'Email required' });

        // Confirmed bookings = conversations
        const bookings = await Booking.find({
            userEmail: email,
            status: 'Confirmed'
        }).sort({ createdAt: -1 });

        res.send(bookings);
    } catch (error) {
        res.status(500).send({ message: 'Failed', error: error.message });
    }
});

// নির্দিষ্ট booking এর messages
app.get('/messages/:bookingId', async (req, res) => {
    try {
        const messages = await Message.find({
            bookingId: req.params.bookingId
        }).sort({ createdAt: 1 });
        res.send(messages);
    } catch (error) {
        res.status(500).send({ message: 'Failed', error: error.message });
    }
});

// Message পাঠাও
app.post('/messages', async (req, res) => {
    try {
        const msg = new Message(req.body);
        const result = await msg.save();
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send({ message: 'Failed', error: error.message });
    }
});

// Messages read করা হয়েছে mark করো
app.patch('/messages/read/:bookingId', async (req, res) => {
    try {
        const { readerEmail } = req.body;
        await Message.updateMany(
            { bookingId: req.params.bookingId, receiverEmail: readerEmail, read: false },
            { $set: { read: true } }
        );
        res.send({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).send({ message: 'Failed', error: error.message });
    }
});

// Unread count
app.get('/messages/unread/count', async (req, res) => {
    try {
        const { email } = req.query;
        const count = await Message.countDocuments({ receiverEmail: email, read: false });
        res.send({ count });
    } catch (error) {
        res.status(500).send({ message: 'Failed', error: error.message });
    }
});