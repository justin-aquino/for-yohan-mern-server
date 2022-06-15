const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  title: String,
  image: String,
});

module.exports = mongoose.model("Card", cardSchema);
