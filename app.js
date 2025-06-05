// app.js
const express = require("express");
const axios   = require("axios");
const path    = require("path");

const app = express();
const PORT = 3000;

// Your GitHub OAuth credentials
const CLIENT_ID     = "Ov23liIksQIWMmSFfJMB";
const CLIENT_SECRET = "2f7103e0c3e2f0bfcd34b12c67452c73dc0fb97e";

// Log every request (for debugging)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] → ${req.method} ${req.url}`);
  next();
});

// 1) Kick off GitHub OAuth
app.get("/login", (req, res) => {
  const redirectURI = encodeURIComponent(`http://localhost:${PORT}/callback`);
  res.redirect(
    `https://github.com/login/oauth/authorize` +
    `?client_id=${CLIENT_ID}` +
    `&redirect_uri=${redirectURI}` +
    `&scope=read:user`
  );
});

// 2) Handle GitHub’s callback
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send("Error: no code received.");
  }

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      { client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code },
      { headers: { Accept: "application/json" } }
    );
    const accessToken = tokenRes.data.access_token;

    // Fetch user profile
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${accessToken}` }
    });
    const { login, avatar_url, html_url } = userRes.data;

    // Render welcome
    return res.send(`
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>Welcome</title>
      <style>body{text-align:center;font-family:Arial;margin-top:50px;}img{border-radius:50%;}</style>
      </head><body>
        <h1>Welcome, ${login}!</h1>
        <img src="${avatar_url}" width="120" /><br>
        <a href="${html_url}" target="_blank">View your GitHub profile</a>
      </body></html>
    `);
  } catch (err) {
    console.error("OAuth error:", err);
    return res.status(500).send("GitHub OAuth failed.");
  }
});

// 3) Serve all files in public/
app.use(express.static(path.join(__dirname, "public")));

// 4) Start listening
app.listen(PORT, () => {
  console.log(`🚀 Listening: http://localhost:${PORT}`);
  console.log(`✔️ Callback URL: http://localhost:${PORT}/callback`);
});
