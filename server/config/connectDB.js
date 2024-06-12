const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URL)

        const connection = mongoose.connection

        connection.on('connected', () => {
            console.log("Connected to the DataBase")
        })

        connection.on('error', (error) => {
            console.log("error in connecting to the DataBase", error)
        })

    } catch (error) {
        console.log("error", error)
    }
}

module.exports = connectDB;
