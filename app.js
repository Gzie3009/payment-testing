require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

app.use(express.json());
app.use(cors());

// checkout api
app.post("/api/create-checkout-session", async (req, res) => {
  const { products } = req.body;

  const lineItems = products.map((product) => {
    const images=products
    return {
      price_data: {
        currency: "inr",
        product_data: {
          name: product.name,
          images: ["https://picsum.photos/200/300?grayscale"],
        },
        unit_amount: 50 * 100,
      },
      quantity: 2,
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "paypal"],
    line_items: lineItems,
    mode: "payment",
    success_url: "http://localhost:3000/thankyou/2134",
    cancel_url: "http://localhost:3000/",
  });

  res.json({ id: session.id });
});

app.listen(4000, () => {
  console.log("server start");
});
