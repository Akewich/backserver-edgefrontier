require("dotenv").config(); // Load environment variables

// Check environment variables
if (!process.env.DB_URI || !process.env.PORT) {
  console.error("Missing environment variables: DB_URI or PORT");
  process.exit(1);
}

// Import necessary modules
const express = require("express");
const mongoose = require("mongoose");
const SensorData = require("./models/sensorRead"); // Import the sensor model
const bodyParser = require("body-parser");
const app = express(); // Initialize express app
const port = process.env.PORT || 4000; // Use environment port

// Using Websocket
const { WebSocket } = require("ws");
const http = require("http");
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    console.log("Connected!");
  });

  ws.on("close", () => {
    console.log("Disconnected!");
  });
});

// const broadCastSensorData = (data) => {
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify(data));
//     }
//   });
// };

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port} Naja Jubjub`);
});

// import cors and enable cors for all routes
const cors = require("cors");
const User = require("./models/user");
app.use(cors());
const corsOptions = process.env.CORSOPTIONS;
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("Connected to MongoDB Database!");
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error.message);
  });

app.use(bodyParser.json()); // Middleware to parse JSON requests

// Root endpoint
app.get("/", (req, res) => {
  res.send("Respond from Backend!");
});

// ----- Sensor Data API ----- //

// Create a new sensor data
app.post("/api/sensors", async (req, res) => {
  try {
    const sensorData = await SensorData.create(req.body);

    // Broadcast new sensor data to all connected Websocket
    // broadCastSensorData(sensorData);

    res
      .status(200)
      .json({ message: "Sensor data logged successfully!", data: sensorData });
    console.log("Sensor data logged:", req.body);
  } catch (error) {
    res.status(500).json({
      message: "Error logging sensor data",
    });
  }
});

// Get all sensor data
app.get("/api/sensors", async (req, res) => {
  try {
    const sensorData = await SensorData.find();
    res.status(200).json(sensorData);
    console.log("Data", sensorData);

    // Showing data for user
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(sensorData));
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching sensor data",
    });
  }
});

// Get specific sensor data by name
app.get("/api/sensors/:name", async (req, res) => {
  try {
    const { name } = req.params; // Object destructuring
    const sensorData = await SensorData.find({ SensorName: name }); // Find by SensorName
    if (sensorData.length === 0) {
      return res
        .status(404)
        .json({ message: "No sensor data found for this name!" });
    }
    res.status(200).json(sensorData);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching sensor data",
    });
  }
});

// Delete sensor data by ID
app.delete("/api/sensors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedData = await SensorData.findByIdAndDelete(id); // Find and delete by ID
    if (!deletedData) {
      return res.status(404).json({ message: "Sensor data not found!" });
    }
    res.status(200).json({
      message: "Sensor data deleted successfully!",
      data: deletedData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting sensor data",
      error:
        process.env.NODE_ENV === "development" ? error.stack : error.message,
    });
  }
});

// ------ Register ------
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Create new user
    const newUser = await User.create({ email, password });

    // Respond without sending the hashed password
    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser._id, email: newUser.email },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists." });
    }
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// ----- Login -----
const jwt = require("jsonwebtoken"); // Import JWT for generating tokens
const bcrypt = require("bcrypt");
const { client } = require("websocket");

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validate inputs
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET, // Secret key from .env
      { expiresIn: "1h" } // Token expiry (e.g., 1 hour)
    );

    // Respond with token
    res.status(200).json({
      message: "Login successful!",
      token, // Include the token in the response
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
});
