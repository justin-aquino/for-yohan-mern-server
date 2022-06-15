require("dotenv").config();
require("./models");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;
const bcrypt = require("bcrypt");
const cors = require("cors");

app.use(cors());
app.use(express.json());
// app.use(morgan('dev'))

app.use("/users", require("./controllers/users"));
// app.use("/api-v1/inventory", require("./controllers/api-v1/inventory"));

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(PORT, () => {
  console.log(`App is listening at port: ${PORT}`);
});
