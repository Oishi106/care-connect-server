const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db'); // Import connectDB

const port = process.env.PORT || 8000;
const app = express();

// Connect to Database
connectDB(); 

// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Care Connect Server is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});