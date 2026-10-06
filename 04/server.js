const express = require('express');
const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  const validName = typeof name === 'string' && name.trim().length > 0 && name.trim().length <= 100;
  const validEmail = typeof email === 'string' && email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const validMessage = typeof message === 'string' &&
    message.trim().length > 0 && message.trim().length <= 2000;

  if (!validName || !validEmail || !validMessage) {
    return res.redirect(303, '/contact?error=1');
  }

  return res.redirect(303, '/contact?sent=1');
});

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
