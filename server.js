import express from "express";
import FormData from "form-data";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import crypto from "crypto";
import fetch from "node-fetch"; // Importing fetch

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = parseInt(process.env.PORT || "3000", 10);
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

// Middleware to inject a script for spinner visibility
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    if (typeof body === "string" && body.includes("</body>")) {
      const script = `
        <script>
          window.addEventListener('load', function () {
            top.postMessage({ hideSpinner: true }, '*');
          }, false);
        </script>
      `;
      body = body.replace("</body>", `${script}</body>`);
    }
    originalSend.call(this, body);
  };
  next();
});

// Serve the index file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

// Check if authToken exists in cookies
app.get("/token", (req, res) => {
  if (req.cookies.authToken) {
    res.send(true);
  } else {
    res.send(false);
  }
});

app.get("/auth", async (req, res) => {
  if (req.query.code) {
    const auth = {
      application_id: 3771,
      application_secret: "9c5d4630518324c78ef4468c28d8effd",
      code: req.query.code,
      account: req.query.account,
    };
    console.log(req.query);

    const formData = new FormData();
    formData.append("application_id", auth.application_id);
    formData.append("application_secret", auth.application_secret);
    formData.append("grant_type", "authorization_code");
    formData.append("redirect_uri", `https://payment-wek9.onrender.com/auth`);
    formData.append("code", auth.code);

    try {
      const response = await fetch(
        `https://${auth.account}.joinposter.com/api/v2/auth/access_token`,
        {
          method: "POST",
          headers: formData.getHeaders(),
          body: formData,
        }
      );

      const data = await response.json();
      console.log("Access token response data:", data);

      const expiresIn = new Date();
      expiresIn.setDate(expiresIn.getDate() + 10); // Expire in 10 days
      res.cookie("authToken", data.access_token, {
        expires: expiresIn,
        path: "/",
        httpOnly: true, // Secure the cookie
        secure: process.env.NODE_ENV === "production", // Enable secure only in production
      });

      res.redirect(
        `https://payment-wek9.onrender.com?token=${data.access_token}`
      );
    } catch (error) {
      console.error("Error exchanging code for access token:", error.message);
      res.status(500).send("Error exchanging code for access token");
    }
  } else {
    res.status(400).send("No code provided");
  }
});

// Get transactions
app.get("/api/getTransaction", async (req, res) => {
  console.log(req.query);
  console.log(req.cookies);
  const token = req.cookies.authToken;
  const {
    date_from: dateFrom,
    date_to: dateTo,
    per_page: perPage,
    page,
  } = req.query;

  try {
    const response = await fetch(
      `https://joinposter.com/api/transactions.getTransactions?token=${
        token ? token : req.query.access_token
      }&date_from=${dateFrom}&date_to=${dateTo}`
    );
    const data = await response.json();

    const filteredData = data.response.data.filter(
      (item) => item.extras && item.extras.combo_box
    );

    res.status(200).json({
      count: filteredData.length,
      data: filteredData,
      page: data.response.page,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Redirect all unknown routes to the root
app.get("/:id", async (req, res) => {
  const auth = {
    application_id: 3771,
    application_secret: "9c5d4630518324c78ef4468c28d8effd",
    code: `${req.params.id}`,
  };

  const verifyString = `${auth.application_id}:${auth.application_secret}:${auth.code}`;
  auth.verify = crypto.createHash("md5").update(verifyString).digest("hex");

  // Создание form-data
  const formData = new FormData();
  formData.append("application_id", auth.application_id);
  formData.append("application_secret", auth.application_secret);
  formData.append("code", auth.code);
  formData.append("verify", auth.verify);

  try {
    // Make the POST request using fetch
    const response = await fetch("https://joinposter.com/api/v2/auth/manage", {
      method: "POST",
      body: formData,
    });

    // Parse the response
    const data = await response.json();

    // Check for HTTP errors
    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + 10); // Expire in 10 days
    res.cookie("authToken", data.access_token, {
      expires: expiresIn,
      path: "/",
      httpOnly: true, // Secure the cookie
      secure: process.env.NODE_ENV === "production", // Enable secure only in production
    });

    res.redirect(`/?access_token=${data.access_token}`);
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(500)
      .json({ error: "Failed to authenticate", details: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
