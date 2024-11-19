require("dotenv").config(); // Load environment variables

// Check environment variables
if (!process.env.DB_URI || !process.env.PORT) {
  console.error("Missing environment variables: DB_URI or PORT");
  process.exit(1);
}

// Import necessary modules
const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/productUse");
const SensorData = require("./models/sensorRead"); // Import the sensor model
const bodyParser = require("body-parser");

const app = express(); // Initialize express app
const port = process.env.PORT; // Use environment port

// import cors and enable cors for all routes
const cors = require("cors");
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

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port} Naja Jubjub`);
});
