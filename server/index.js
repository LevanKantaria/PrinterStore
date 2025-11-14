import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import itemRoutes from "./routes/items.js";
import profileRoutes from "./routes/profile.js";
import orderRoutes from "./routes/orders.js";
import makerApplicationRoutes from "./routes/makerApplication.js";
import makerProductRoutes from "./routes/makerProducts.js";
import adminProductRoutes from "./routes/adminProducts.js";
import paymentRoutes from "./routes/payments.js";
import reviewRoutes from "./routes/reviews.js";
import { sendContactEmail, sendAutoReply } from "./utils/email.js";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

dotenv.config();

const app = express();

app.use(express.static("public"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

const CONNECTION_URL = process.env.MONGODB_URI || "mongodb+srv://lkantaria1999:s0d8d555@cluster0.rl2gfrm.mongodb.net/?retryWrites=true&w=majority";

if (!CONNECTION_URL) {
  console.warn("MONGODB_URI environment variable is not set. Database connection will fail.");
}

app.use("/api/products", itemRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/maker/application", makerApplicationRoutes);
app.use("/api/maker/products", makerProductRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        message: "All fields are required" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Invalid email format" 
      });
    }

    // Log the submission
    console.log("Contact form submission:", {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    });

    // Send email to business owner
    try {
      await sendContactEmail(email, name, subject, message);
      
      // Send auto-reply to user (non-blocking)
      sendAutoReply(email, name).catch(err => {
        console.warn("Auto-reply failed (non-critical):", err);
      });

      res.status(200).json({ 
        message: "Contact form submitted successfully",
        success: true 
      });
    } catch (emailError) {
      // If email fails but we have the data, still log it
      console.error("Email sending failed:", emailError);
      
      // In development, you might want to still return success
      // In production, you might want to return an error
      // For now, we'll return success but log the error
      res.status(200).json({ 
        message: "Your message has been received. We'll get back to you soon.",
        success: true,
        warning: "Email notification may not have been sent. Please check server logs."
      });
    }
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ 
      message: "An error occurred while processing your request",
      success: false 
    });
  }
});

app.get("/api/test", (req, res) => {
  res.send("hey");
});

app.get("/", (req, res) => {
  res.send("Hello To Factory-l API");
});

app.post("/checkout", async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ message: "Stripe is not configured." });
  }

  const items = req.body;

  const lineItems = items.map((item) => ({
    price: item.priceId,
    quantity: item.quantity,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: process.env.CHECKOUT_SUCCESS_URL || "http://localhost:3000/marketplace",
      cancel_url: process.env.CHECKOUT_CANCEL_URL || "http://localhost:3000/marketplace",
    });

    res.send(
      JSON.stringify({
        url: session.url,
      })
    );
  } catch (error) {
    console.error("Stripe checkout session failed", error);
    res.status(500).json({ message: "Unable to create checkout session." });
  }
});

const PORT = process.env.PORT || 5001;

// Set strictQuery to false to prepare for Mongoose 7 (suppresses deprecation warning)
mongoose.set('strictQuery', false);

mongoose
  .connect(CONNECTION_URL, { useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
