const express = require("express");
const mongoose = require("mongoose");
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const port = 3000;

const uri = "mongodb+srv://hashini:hashini@cluster1.8xim3em.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1";

async function connect() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(error);
  }
}

const cardSchema = new mongoose.Schema({
  title: String,
  image: String,
  link: String,
  description: String,
});

const Card = mongoose.model("Card", cardSchema);

connect();

app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/env.js', (req, res) => {
  res.set('Content-Type', 'text/javascript'); 
  res.sendFile(path.join(__dirname, 'env.js')); 
});

const server = http.createServer(app);
const io = socketIO(server);
app.get("/socket.io/socket.io.js", (req, res) => {
  res.sendFile(path.join(__dirname, "node_modules/socket.io/client-dist/socket.io.js"));
});
 
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
      console.log('user disconnected');
  });
  setInterval(() => {
      socket.emit('number', parseInt(Math.random() * 10));
  }, 1000);
});


app.get("/", (req, res) => {
  // If you intend to render HTML, set up a view engine and render here
  res.send("Hello World!");
});

app.get("/api/projects", async (req, res) => {
  try {
    const cardList = await Card.find();
    res.json({ statusCode: 200, data: cardList, message: "Success" });
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: "Internal Server Error" });
  }
});

app.post("/api/projects", async (req, res) => {
  try {
    const { title, image, link, description } = req.body;
    
    const card = new Card({ title, image, link, description });
    await card.save();

    res.status(201).json({ statusCode: 201, message: "Card added successfully", data: card });
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log("App listening to: " + port);
});