const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/timetable', require('./routes/timetable'));

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
