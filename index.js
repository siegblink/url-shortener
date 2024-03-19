require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let cache = [];

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function (req, res) {
  // Get the URL from the form
  const hostname = getHostnameFromUrl(req.body.url);

  // Use the`dns.lookup(host, cb)` function from the dns core module to verify a submitted URL.
  dns.lookup(hostname, (err, address, family) => {
    if (err) {
      console.error('Error:', err.code);
      console.error('Invalid URL (no DNS records found)');

      return res.json({ error: 'invalid url' });
    }

    // If the URL is valid, save the URL and the shortened URL
    const short_url = Math.floor(Math.random() * 1000);

    // Save the URL and the shortened URL
    cache.push({ original_url: `http://${hostname}`, short_url });

    console.log('Valid URL. IP address:', address);

    // Return the shortened URL
    res.json({ original_url: req.body.url, short_url });
  });
});

app.get('/api/shorturl/:short_url', function (req, res) {
  // Get the short URL from the URL
  const short_url = req.params.short_url;
  console.log('Short URL:', short_url);

  // Find the original URL
  const match = cache.find(
    (item) => String(item.short_url) === String(short_url)
  );

  // Redirect to the original URL
  if (match?.original_url) {
    res.redirect(302, match.original_url);
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

function getHostnameFromUrl(url) {
  const parsedUrl = new URL(url);
  return parsedUrl.hostname;
}
