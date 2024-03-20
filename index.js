require('dotenv').config();
const express = require('express');
const app = express();

const cors = require('cors');
const dns = require('dns');
const { MongoClient } = require('mongodb');

// Connect to the MongoDB database
const client = new MongoClient(process.env.MONGO_URI);
const db = client.db('url_shortener');
const urls = db.collection('urls');

// Basic Configuration
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// API endpoints
app.post('/api/shorturl', function (req, res) {
  const { url } = req.body;

  // Parse the URL
  const parsedUrl = new URL(url);

  // Check if the URL is valid
  dns.lookup(parsedUrl.hostname, async (err, address) => {
    if (!address) {
      return res.json({ error: 'invalid url' });
    }

    // URL count
    const urlCount = await urls.countDocuments({});

    // URL document
    const urlDoc = {
      url,
      short_url: urlCount,
    };

    // Insert the URL document into the database
    const result = await urls.insertOne(urlDoc);

    console.log('Inserted document with _id: ', result.insertedId);
    console.log('Result: ', result);

    res.json({ original_url: url, short_url: urlCount });
  });
});

app.get('/api/shorturl/:short_url', async (req, res) => {
  const { short_url } = req.params;

  // Find the URL document in the database
  const urlDoc = await urls.findOne({ short_url: parseInt(short_url) });

  res.redirect(urlDoc.url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
