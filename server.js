import { createServer } from "http";
import { parse } from "url";
import next from "next";
import express from "express";
import axios from "axios";
import qs from "qs"; // Use `qs` for query string parsing and encoding
import FormData from "form-data";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  // Middleware to parse JSON and URL-encoded bodies
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  // Step 1: Redirect user to Poster authorization URL
  server.get("/auth", async (req, res) => {
    if (req.query.code) {
      const auth = {
        application_id: 3771,
        application_secret: "9c5d4630518324c78ef4468c28d8effd",
        code: req.query.code,
        account: req.query.account,
      };
      const formData = new FormData();
      formData.append("application_id", auth.application_id);
      formData.append("application_secret", auth.application_secret);
      formData.append("grant_type", "authorization_code");
      formData.append("redirect_uri", `${process.env.NEXT_PUBLIC_URL}/auth`); // Correct redirect URI
      formData.append("code", auth.code);

      console.log("head", formData.getHeaders());

      try {
        const response = await axios.post(
          `https://${auth.account}.joinposter.com/api/v2/auth/access_token`,
          formData,
          {
            headers: formData.getHeaders(),
          }
        );
        console.log("Access token response data:", response.data);
        const expiresIn = new Date();
        expiresIn.setDate(expiresIn.getDate() + 10); // Expire in 10 days
        res.cookie("authToken", response.data.access_token, {
          expires: expiresIn,
          // httpOnly: true,
          // secure: process.env.NODE_ENV === "production",
          path: "/", // Ensure path is correct
        });

        res.redirect(
          `${process.env.NEXT_PUBLIC_URL}?token=${response.data.access_token}`
        );
      } catch (error) {
        console.error("Error exchanging code for access token:", error);
        res.status(500).send("Error exchanging code for access token");
      }
    } else {
      res.status(400).send("No code provided");
    }
  });

  server.use((req, res, next) => {
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

  server.get("/:id", (req, res) => {
    // app.render(req, res, "/"); // Render the Next.js page for "/"
    res.redirect("/");
  });
  // Fallback to Next.js request handler
  server.all("*", (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Start the server
  createServer(server).listen(port, () => {
    console.log(
      `> Server listening at http://localhost:${port} in ${
        dev ? "development" : process.env.NODE_ENV
      } mode`
    );
  });
});
