// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname)));

// Redirect all routes to the main entry point (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/weatherdb');

// Define a mongoose schema
const Schema = mongoose.Schema;
const dbSchema = new Schema({
  date:String,
  city: String,
  temperature: String,
  description:String,
  humidity: String,
  windspeed: String
});

// Create a mongoose model
const dataModel = mongoose.model('weatherdata', dbSchema);

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Route to handle inserting data
app.post('/insertData', (req, res) => {
  const { date, city, temperature, description, humidity, windspeed } = req.body;

  // Create a new document using the ExampleModel
  const data = new dataModel({
    date,
    city,
    temperature,
    description,
    humidity,
    windspeed
  });

  // Save the document to the database
  data.save()
    .then(result => {
      console.log('Data saved successfully:', result);
      res.status(200).send('Data saved successfully');
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error saving data to MongoDB');
    });
});

// Endpoint to retrieve data from MongoDB
app.use(cors());
app.get('/api/retrieve', async (req,res) => {
  try {
    const data = await dataModel.find({});

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching weather data from MongoDB:', err);
    res.status(500).send('Error fetching weather data from MongoDB');
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
