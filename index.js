require('dotenv').config(); // call dot env

// express
const express = require('express') // call express form require function
const app = express() // variable for use express
const port = process.env.PORT; // use port 

// Database 
const mongoose = require('mongoose')
const Product = require('./models/productUse')
mongoose.connect(process.env.DB_URI)
.then (() => {
    console.log("Connected to MongoDB Database already!")
})
.catch(() => {
    console.log("Failed to connected!!")
});

app.use(express.json())

// path : "/"
app.get('/', (req, res) => {
  res.send('Respond form Backend!')
})

app.post('/api/prods', async (req,res) => {
    try {
        const prod = await Product.create(req.body)
        res.status(200).json(prod)
        console.log("Temp created : ",req.body)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

app.listen(port, () => {
  console.log(`Server running on port ${port} Naja`)
}) 