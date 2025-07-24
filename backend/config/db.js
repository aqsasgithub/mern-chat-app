const mongoose = require("mongoose");

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://aqsa:AqsaS2774.@cluster0.d030bn7.mongodb.net/ChatDB');
        console.log('MongoDB connected successfully✅');
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}

module.exports = connectDB;