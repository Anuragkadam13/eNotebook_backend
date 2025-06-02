const connectToMongo = require("./db");
const express = require("express");
var cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 8000;
app.use(express.json());
app.use(
  cors({
    origin: ["http://127.0.0.1:5000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

//Available routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/about", (req, res) => {
  res.send("About route 🎉 ");
});
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.listen(port, () => {
  connectToMongo();
  console.log(`iNotebook database listening on port ${port}`);
});
