const mongoose = require('mongoose');

// MongoDB connection URL
const mongo_url = process.env.MONGO_URL; // Corrected typo: 'monog_url' -> 'mongo_url'

mongoose.connect(mongo_url)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);

        // Handle specific error conditions
        if (error.name === 'MongoNetworkError') {
            console.error('Network error occurred. Check your MongoDB server and network connection.');
        } else if (error.name === 'MongooseServerSelectionError') {
            console.error('Server selection error. Ensure MongoDB is running and accessible.');
        } else if (error.name === 'MongoParseError') {
            console.error('Invalid connection string format. Please check your MongoDB URL.');
        } else {
            // Handle other types of errors
            console.error('An unexpected error occurred:', error);
        }
    });

// // Handling connection events
// const db = mongoose.connection;

// db.on('error', (error) =&gt; {
//     console.error('MongoDB connection error:', error);
// });

// db.once('open', () =&gt; {
//     console.log('Connected to MongoDB');
// });

// db.on('disconnected', () =&gt; {
//     console.log('Disconnected from MongoDB');
// });

// // Gracefully close the connection when the application exits
// process.on('SIGINT', () =&gt; {
//     mongoose.connection.close(() =&gt; {
//         console.log('Mongoose connection is disconnected'
//          + ' due to application termination');
//         process.exit(0);
//     });
// });
