require('dotenv').config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();

// Import your existing chatModels (UNCHANGED file)
const { ask } = require('./services/chatModels');

// Set EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());   // Added to fix req.body.message = undefined
app.use(session({
  secret: "farmer-secret",
  resave: false,
  saveUninitialized: true
}));

// Fake DB (use real DB later)
let users = [];

// Routes
app.get("/", (req, res) => {
  if (req.session.user) {
    res.render("index", { user: req.session.user });
  } else {
    res.redirect("/landing");
  }
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

//schemes
app.get("/schemes", (req, res) => {
  res.render("schemes", { error: null });
});

//chatbot
app.get("/chatbot", (req, res) => {
  res.render("chatbot", { error: null });
});

//market price
// app.get("/marketPrice", (req, res) => {
//   res.render("marketPrice", { error: null });
// });

const apiUrl = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
const apiKey = process.env.API_KEY;
// 1. Load page with all dropdowns (initial)
app.get("/marketPrice", async (req, res) => {
    try {
        const response = await fetch(`${apiUrl}?api-key=${apiKey}&format=json&limit=1000`);
        const data = await response.json();
        const records = Array.isArray(data.records) ? data.records : [];

        // Full sets for first load
        const commodities = [...new Set(records.map(r => r.commodity?.trim()).filter(Boolean))].sort();
        const states = [...new Set(records.map(r => r.state?.trim()).filter(Boolean))].sort();
        const districts = [...new Set(records.map(r => r.district?.trim()).filter(Boolean))].sort();

        res.render("marketPrice", { commodities, states, districts, results: [], error: null });
    } catch (err) {
        console.error(err);
        res.render("marketPrice", { commodities: [], states: [], districts: [], results: [], error: "Error fetching dropdown data" });
    }
});

// 2. API: Get states by commodity
app.get("/api/states", async (req, res) => {
    try {
        const { commodity } = req.query;
        const response = await fetch(`${apiUrl}?api-key=${apiKey}&format=json&limit=1000`);
        const data = await response.json();
        const records = Array.isArray(data.records) ? data.records : [];

        const states = [...new Set(
            records
                .filter(r => !commodity || r.commodity?.trim().toLowerCase() === commodity.toLowerCase())
                .map(r => r.state?.trim())
                .filter(Boolean)
        )].sort();

        res.json(states);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});

// 3. API: Get districts by commodity + state
app.get("/api/districts", async (req, res) => {
    try {
        const { commodity, state } = req.query;
        const response = await fetch(`${apiUrl}?api-key=${apiKey}&format=json&limit=1000`);
        const data = await response.json();
        const records = Array.isArray(data.records) ? data.records : [];

        const districts = [...new Set(
            records
                .filter(r =>
                    (!commodity || r.commodity?.trim().toLowerCase() === commodity.toLowerCase()) &&
                    (!state || r.state?.trim().toLowerCase() === state.toLowerCase())
                )
                .map(r => r.district?.trim())
                .filter(Boolean)
        )].sort();

        res.json(districts);
    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});


// Handle search filters
app.post("/marketPrice/search", async (req, res) => {
    try {
        const { commodity, state, district } = req.body;

        const response = await fetch(`${apiUrl}?api-key=${apiKey}&format=json&limit=1000`);
        const data = await response.json();
        const records = Array.isArray(data.records) ? data.records : [];

        // Filtering with trim + lowercase
        let filtered = records;
        if (commodity) filtered = filtered.filter(r => r.commodity?.trim().toLowerCase() === commodity.toLowerCase());
        if (state) filtered = filtered.filter(r => r.state?.trim().toLowerCase() === state.toLowerCase());
        if (district) filtered = filtered.filter(r => r.district?.trim().toLowerCase() === district.toLowerCase());

        const commodities = [...new Set(records.map(r => r.commodity?.trim()).filter(Boolean))].sort();
        const states = [...new Set(records.map(r => r.state?.trim()).filter(Boolean))].sort();
        const districts = [...new Set(records.map(r => r.district?.trim()).filter(Boolean))].sort();

        res.render("marketPrice", { commodities, states, districts, results: filtered, error: null });
    } catch (err) {
        console.error(err);
        res.render("marketPrice", { commodities: [], states: [], districts: [], results: [], error: "Error fetching search data" });
    }
});

// Landing page (background animation)
app.get("/landing", (req, res) => {
  res.render("landing");   // make sure you created views/landing.ejs
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  // const user = users.find(u => u.email === email && u.password === password);
  
  // if (user) {
  //   req.session.user = user;
    res.redirect("/");
  // } else {
  //   res.render("login", { error: "❌ Invalid email or password" });
  // }
});

app.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  // const exists = users.find(u => u.email === email);

  // if (exists) {
  //   res.render("signup", { error: "⚠ Email already exists" });
  // } else {
    users.push({ name, email, password });
    res.redirect("/");
  // }
});

// Farmsmart landing page
app.get("/weatherCrop", (req, res) => {
  res.render("weatherCrop");   // looks inside views/farmsmart.ejs
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});


/* ---------------------------
   New: Chat API endpoint
   Frontend should POST { message: "<text>" } to /api/chat
   This route calls your existing services/chatModels.ask(message)
   and returns { reply: "<assistant text>" }
   --------------------------- */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;  
    if (!message || !message.toString().trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Call your existing ask() - do not modify chatModels.js
    const apiRes = await ask(message.toString().trim());

    // Extract assistant text for common response shapes:
    // - openai style: apiRes.choices[0].message.content
    // - older style: apiRes.choices[0].text
    // - fallback: stringify whole response
    const assistantText =
      apiRes?.choices?.[0]?.message?.content ||          //openai format 
      apiRes?.choices?.[0]?.text ||                      // older format               
      apiRes?.output?.[0]?.content?.[0]?.text ||         // format like gpt
      JSON.stringify(apiRes);

    return res.json({ reply: assistantText });
  } catch (err) {
    console.error('Error in /api/chat:', err);
    const safeMessage = (err && err.message) ? err.message : 'Internal server error';
    return res.status(500).json({ error: 'Server error: ' + safeMessage });
  }
});
/*   End Chat API  */

const PORT = 3000; 
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
