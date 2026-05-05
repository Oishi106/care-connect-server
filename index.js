const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db'); 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Service = require('./models/Service'); 

const port = process.env.PORT || 8000;
const app = express();

// Connect to Database
connectDB(); 

// middleware
app.use(cors());
app.use(express.json());

// ------------------------------------------------
// SEED ROUTE — একবারই run করতে হবে
// POST http://localhost:8000/seed-services
// ------------------------------------------------

app.post('/seed-services', async (req, res) => {
    try {
        const services = [
            { id: 1, title: "Elderly Care", description: "Daily living assistance, health monitoring, and companionship for senior adults.", price: 15, badge: "Most Popular", image: "https://i.ibb.co.com/vMVR7X9/Elderly-Care.avif", category: "Senior Care" },
            { id: 2, title: "Baby Sitting", description: "Trusted and trained babysitters for infants and toddlers with a safety-first approach.", price: 12, badge: "Top Rated", image: "https://i.ibb.co.com/23GywMJQ/Baby-Sitting.avif", category: "Child Care" },
            { id: 3, title: "Patient Care", description: "In-home nursing and post-surgery recovery assistance for chronic illnesses.", price: 18, badge: "Certified", image: "https://i.ibb.co.com/5WdJgN9P/Patient-Care.avif", category: "Medical" },
            { id: 4, title: "Special Needs", description: "Tailored support for individuals with physical or developmental disabilities.", price: 20, badge: "Expert Care", image: "https://i.ibb.co.com/V000FLbC/Special-Needs.avif", category: "Support" },
            { id: 5, title: "Child Care", description: "After-school supervision, homework help, and engaging activities for kids.", price: 10, badge: "New", image: "https://i.ibb.co.com/N6t35V4q/Child-Care.avif", category: "Child Care" },
            { id: 6, title: "Night Care", description: "Overnight supervision for patients or seniors who need late-night assistance.", price: 25, badge: "24/7", image: "https://i.ibb.co.com/20kpf4D8/Night-Care.avif", category: "Senior Care" },
            { id: 7, title: "Therapy Support", description: "Physical and occupational therapy assistance within the comfort of home.", price: 30, badge: "Professional", image: "https://i.ibb.co.com/PzJN6zfx/Therapy-Support.avif", category: "Medical" },
            { id: 8, title: "Respite Care", description: "Short-term relief for family caregivers, providing a temporary break.", price: 22, badge: "Flexible", image: "https://i.ibb.co.com/xqv1GJfv/Respite-Care.avif", category: "Support" },
            { id: 9, title: "Dementia Care", description: "Specialized memory care and safety monitoring for dementia patients.", price: 28, badge: "High Demand", image: "https://i.ibb.co.com/qY4CTTQf/Dementia-Care.avif", category: "Senior Care" },
            { id: 10, title: "Postnatal Care", description: "Support for new mothers and newborns during the recovery phase.", price: 20, badge: "Maternity", image: "https://i.ibb.co.com/5hxXkM9R/Postnatal-Care.avif", category: "Medical" },
            { id: 11, title: "Pet Sitting", description: "In-home pet care including feeding, walking, and companionship.", price: 8, badge: "Animal Lover", image: "https://i.ibb.co.com/kVvqjfRZ/Pet-Sitting.avif", category: "Personal" },
            { id: 12, title: "Housekeeping", description: "Professional cleaning and organizing for busy households.", price: 14, badge: "Essential", image: "https://i.ibb.co.com/nsbmTYQM/Housekeeping.avif", category: "Home" },
            { id: 13, title: "Physiotherapy", description: "Qualified physiotherapists for pain management and mobility restoration.", price: 35, badge: "Specialist", image: "https://i.ibb.co.com/NdT43hTM/Physiotherapy.avif", category: "Medical" },
            { id: 14, title: "Companion Care", description: "Social interaction and activities for isolated seniors to reduce loneliness.", price: 12, badge: "Friendly", image: "https://i.ibb.co.com/DsHT2qp/Companion-Care.avif", category: "Senior Care" },
            { id: 15, title: "Medication Admin", description: "Assistance with timely medication and health tracking.", price: 16, badge: "Accurate", image: "https://i.ibb.co.com/RfwDWpZ/Medication-Admin.avif", category: "Medical" },
            { id: 16, title: "Errand Support", description: "Grocery shopping and running essential errands for those in need.", price: 9, badge: "Helpful", image: "https://i.ibb.co.com/VcpMDBvx/Errand-Support.avif", category: "Personal" },
            { id: 17, title: "Live-in Care", description: "Full-time residential care with round-the-clock professional support.", price: 40, badge: "Full Support", image: "https://i.ibb.co.com/BKB38Xfj/Live-in-Care.avif", category: "Senior Care" },
            { id: 18, title: "Palliative Care", description: "Compassionate end-of-life care focusing on comfort and dignity.", price: 45, badge: "Gentle Care", image: "https://i.ibb.co.com/DHM5ssB6/Palliative-Care.avif", category: "Medical" },
            { id: 19, title: "Disability Escort", description: "Assisting people with disabilities to travel to medical appointments.", price: 18, badge: "Escort", image: "https://i.ibb.co.com/nqW6Gq0y/Disability-Escort.avif", category: "Support" },
            { id: 20, title: "Tutoring Help", description: "Educational support for children along with general childcare duties.", price: 15, badge: "Education", image: "https://i.ibb.co.com/GvJF5NKs/Tutoring-Help.avif", category: "Child Care" },
        ];

        await Service.deleteMany({});
        await Service.insertMany(services);
        res.send({ message: "✅ 20 services seeded successfully!" });
    } catch (error) {
        console.error("Seed Error:", error.message);
        res.status(500).send({ message: "Seed failed", error: error.message });
    }
});

// ------------------------------------------------
// SERVICE ROUTES
// ------------------------------------------------

// সব services
app.get('/services', async (req, res) => {
    try {
        const services = await Service.find();
        res.send(services);
    } catch (error) {
        res.status(500).send({ message: "Failed to fetch services", error: error.message });
    }
});

// Category দিয়ে filter
app.get('/services/category/:cat', async (req, res) => {
    try {
        const services = await Service.find({ category: req.params.cat });
        res.send(services);
    } catch (error) {
        res.status(500).send({ message: "Failed to fetch by category", error: error.message });
    }
});

// ID দিয়ে single service
app.get('/services/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).send({ message: "Service not found" });
        }
        res.send(service);
    } catch (error) {
        res.status(500).send({ message: "Error fetching service", error: error.message });
    }
});

// ------------------------------------------------
// STRIPE PAYMENT ROUTE
// ------------------------------------------------

app.post('/create-payment-intent', async (req, res) => {
    try {
        const { price } = req.body;
        
        if (!price) {
            return res.status(400).send({ error: "Price is required" });
        }

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