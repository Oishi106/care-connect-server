const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  badge: String,
  image: String,
  category: String,
});

module.exports = mongoose.model("Service", serviceSchema);