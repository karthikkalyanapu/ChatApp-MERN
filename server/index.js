const express = require('express');
const cors = require('cors');
const cookiesParser = require('cookie-parser');
require('dotenv').config()

const connectDB = require('./config/connectDB');
const router = require('./routes');
const { app, server } = require('./socket/index.js')

// const app = express();

const allowedOrigin = process.env.FRONTEND_URL || '*'; // Fallback to '*' if environment variable is not set

app.use(cors({
    origin:  allowedOrigin, //Allow requests from any origin
    credentials: true
}));


app.use(express.json())
app.use(cookiesParser())

const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
    res.json({
        message: `Server listening on the Port ${PORT}`
    });
});

//api endpoint

app.use('/api', router)

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server listening on the Port ${PORT}`);
    });
});
