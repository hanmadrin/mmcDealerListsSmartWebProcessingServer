const express = require('express');
const cors = require('cors');
const app = express();
const ExpressError = require('./utilities/expressError');
// const { connectToDatabase } = require('./config/config');
const apiRoutes = require('./routes/api');
const port = process.env.PORT || 5252;
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb',extended: true }));


app.use('/api', apiRoutes);
app.listen(port, "0.0.0.0",() => {
    console.log(`server running at http://localhost:${port}`)
});

// connectToDatabase();