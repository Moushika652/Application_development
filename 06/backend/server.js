require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 10000;
const NOTE_COLORS = ['paper', 'blue', 'rose', 'sage', 'amber'];

app.use(express.json({ limit: '32kb' }));

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Give your note a title.'],
      trim: true,
      maxlength: [MAX_TITLE_LENGTH, `Titles must be ${MAX_TITLE_LENGTH} characters or fewer.`],
    },
    content: {
      type: String,
      default: '',
      maxlength: [MAX_CONTENT_LENGTH, `Notes must be ${MAX_CONTENT_LENGTH} characters or fewer.`],
    },
    color: {
      type: String,
      enum: NOTE_COLORS,
      default: 'paper',
    },
  },
  { timestamps: true }
);

const Note = mongoose.model('Note', noteSchema);

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sendValidationError(res, error) {
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: Object.values(error.errors).map((entry) => entry.message).join(' '),
    });
  }
  return res.status(500).json({ message: 'Something went wrong while saving your note.' });
}

app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'database-unavailable',
    database: connected ? 'connected' : 'disconnected',
  });
});

app.get('/api/notes', async (req, res) => {
  try {
    const search = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
    const safeSearch = escapeRegex(search);
    const filter = search
      ? { $or: [{ title: { $regex: safeSearch, $options: 'i' } }, { content: { $regex: safeSearch, $options: 'i' } }] }
      : {};
    const notes = await Note.find(filter).sort({ updatedAt: -1 }).limit(200).lean();
    return res.json(notes);
  } catch {
    return res.status(500).json({ message: 'Could not load notes. Please try again.' });
  }
});

app.get('/api/notes/:id', async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: 'That note address is not valid.' });
  }

  try {
    const note = await Note.findById(req.params.id).lean();
    if (!note) return res.status(404).json({ message: 'We could not find that note.' });
    return res.json(note);
  } catch {
    return res.status(500).json({ message: 'Could not open that note. Please try again.' });
  }
});

app.post('/api/notes', async (req, res) => {
  const { title, content = '', color = 'paper' } = req.body ?? {};
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'A title is needed before this note can be saved.' });
  }
  if (typeof content !== 'string' || content.length > MAX_CONTENT_LENGTH) {
    return res.status(400).json({ message: `Note text must be ${MAX_CONTENT_LENGTH} characters or fewer.` });
  }
  if (!NOTE_COLORS.includes(color)) {
    return res.status(400).json({ message: 'Choose one of the available note colors.' });
  }

  try {
    const note = await Note.create({ title, content, color });
    return res.status(201).json(note);
  } catch (error) {
    return sendValidationError(res, error);
  }
});

app.put('/api/notes/:id', async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: 'That note address is not valid.' });
  }

  const { title, content, color } = req.body ?? {};
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'A title is needed before this note can be saved.' });
  }
  if (typeof content !== 'string' || content.length > MAX_CONTENT_LENGTH) {
    return res.status(400).json({ message: `Note text must be ${MAX_CONTENT_LENGTH} characters or fewer.` });
  }
  if (!NOTE_COLORS.includes(color)) {
    return res.status(400).json({ message: 'Choose one of the available note colors.' });
  }

  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content, color },
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ message: 'We could not find that note.' });
    return res.json(note);
  } catch (error) {
    return sendValidationError(res, error);
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: 'That note address is not valid.' });
  }

  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ message: 'We could not find that note.' });
    return res.status(204).end();
  } catch {
    return res.status(500).json({ message: 'Could not remove that note. Please try again.' });
  }
});

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'That API address does not exist.' });
});

app.use((error, req, res, next) => {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'That request is too large. Shorten the note and try again.' });
  }
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ message: 'The request could not be read. Check the submitted data.' });
  }
  return next(error);
});

async function start() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Add your MongoDB connection string to backend/.env.');
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log('Connected to MongoDB.');

  app.listen(PORT, () => {
    console.log(`Notes API is ready at http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error(`Could not start the Notes API: ${error.message}`);
  process.exitCode = 1;
});
