require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const CryptoJS = require("crypto-js");

const app = express();

app.use(express.json());
app.use(cors());

function generateMerchantTransactionId() {
  const timestamp = Date.now().toString();
  const randomPart = Math.random().toString(36).substring(2, 10); // Generate a random string
  return `${timestamp}${randomPart}`;
}

app.post("/pay", async (req, res) => {
  const payload = {
    merchantId: "MERCHANTUAT",
    merchantTransactionId: generateMerchantTransactionId(),
    merchantUserId: "MUID123",
    amount: 10000,
    redirectUrl: "https://webhook.site/redirect-url",
    redirectMode: "POST",
    callbackUrl: "https://webhook.site/callback-url",
    mobileNumber: "9999999999",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  // Convert payload to Base64
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

  // Calculate checksum (X-VERIFY header)
  const saltKey = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
  const saltIndex = "1";
  const toHash = base64Payload + "/pg/v1/pay" + saltKey;
  const checksum =
    CryptoJS.SHA256(toHash).toString(CryptoJS.enc.Hex) + "###" + saltIndex;

  try {
    console.log("Checksum", checksum);
    console.log("base64payload", base64Payload);
    const response = await axios.post(
      "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
      {
        request: base64Payload,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          Authorization: `Bearer ${process.env.PHONEPE_API_KEY}`,
          "X-API-KEY": process.env.PHONEPE_API_KEY,
        },
      }
    );

    console.log(response);
    res.json(response.data);
  } catch (error) {
    console.log("Payment failed:", error);
    res.status(500).json({ error: "Payment failed" });
  }
  console.log("Checksum", checksum);
  console.log("base64payload", base64Payload);
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
