const { default: mongoose } = require("mongoose");

const sensorDataSchema = new mongoose.Schema({
  SensorName: String,
  CO2: Number,
  VOC: Number,
  Radon: Number,
  Temperature: Number,
  Humidity: Number,
  Pressure: Number,
  updateAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("sensorReading", sensorDataSchema);
