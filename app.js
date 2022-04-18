import express, { json } from "express";
import cors from "cors";
import { config } from "dotenv";
import DBConnection from "./dbConnection.js";
import Auth from "./routes/auth.js";
import Tasks from "./routes/tasks.js";

//accessing the environment variables of node
config();

const port = process.env.PORT || 3000;
const db = new DBConnection();

db.connect()
  .then(() => {
    console.log("Connected to Database");
  })
  .catch((e) => {
    console.log("Error while connecting to the database\n");
    console.error(e);
  });

const app = express();
app.use(cors());
app.use(json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError) {
    res.json({ err: "Invalid data format" });
  }
  next();
});

Auth(app, db);
Tasks(app, db);

app.get("*", (req, res) => {
  res.send("<h1>Looks like you are lost</h1>");
});

app.post("*", (req, res) => {
  res.send("Looks like you are lost");
});

app.listen(port, () => {
  console.log("Listening on http://localhost:" + port);
});
