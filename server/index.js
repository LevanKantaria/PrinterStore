import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import itemRoutes from "./routes/items.js";
import dotenv from "dotenv";
import Stripe from "stripe";

const stripe = Stripe(
  "sk_test_51MBe2kGLD3kAQcPcox1UOblO3WAKA44CoPbYcbrbN8YMvBuTYZhmz3CZHDMfrhcgZxpXmIXOt7COnqLaYX03d6iZ00samrl7n8"
);
const app = express(); 
dotenv.config();
app.use(express.static("public"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());


const CONNECTION_URL =
  "mongodb+srv://lkantaria1999:s0d8d555@cluster0.rl2gfrm.mongodb.net/?retryWrites=true&w=majority";

app.use("/api/products", itemRoutes);

app.get("/api/test", (req, res) => {
  res.send("hey");
});

app.get("/", (req, res) => {
  res.send("Hello To Factory-l  API");
});

app.post("/checkout", async (req, res) => {
  const items = req.body;

  let line_items = [];
  items.forEach((item) => {
    line_items.push({
      
      price: item.priceId,
      quantity: item.quantity,
    });
  });
  console.log(line_items);

  const session = await stripe.checkout.sessions.create({
    line_items: line_items,
    mode: "payment",
    success_url: "http://localhost:3000/marketplace",
    cancel_url: "http://localhost:3000/marketplace",
  });
  res.send(
    JSON.stringify({
      url: session.url,
    })
  );
});
const PORT = process.env.PORT || 5000;

mongoose
  .connect(CONNECTION_URL, { useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log("server running on port" + PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
