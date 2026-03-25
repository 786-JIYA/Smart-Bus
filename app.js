
const path = require("path");
const express = require("express");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('dotenv').config({path:'./.env'});

const app = express();

//const userRouter = require('./4-natours/starter/router/userRouter');
const userRouter = require('./4-natours/starter/router/userRouter');
const tourRouter = require('./4-natours/starter/router/tourRouter');
const routeRouter = require('./4-natours/starter/router/routeRouter');



app.use(express.json());

//mongo-db connection
const DB = process.env.MONGO_URI.replace(
    '<PASSWORD>',
    process.env.MONGO_URI
)

mongoose.connect(DB,{
    useNewUrlParser:true,
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ Error:', err));


  

app.set("io", null);
const cors = require('cors');


app.use(cors());
app.use(express.json());

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));


app.post("/location", (req, res) => {
    const { lat, lng } = req.body;
    
    console.log("📥 GPS data received:", lat, lng);

    const io = req.app.get("io");
    if (io) {
        io.emit("receive-location", {
            id: "esp8266",
            lat: Number(lat),
            lng: Number(lng),
            time: new Date().toLocaleTimeString(),
            speed: 0
        });
    }

    res.sendStatus(200);
});

app.get("/", (req, res) => {
    res.render("index.ejs");
});


//own middileware
app.use((req, res, next) => {
    console.log("Hello Middle-ware 🥳");
    next();
});

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());


//------------ROUTERS-------------/////
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/routes',routeRouter);
//--------------------------------------//



app.listen(2000);




module.exports = app;
