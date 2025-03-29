const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.use(morgan("dev"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, (req, res) => {
      console.log("App is running on localhost:" + PORT);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
});

const ExerciseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);
const Exercise = mongoose.model("Exercise", ExerciseSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  try {
    const { username } = req.body;
    const user = new User({ username });
    await user.save();
    res.json({ username: user.username, _id: user._id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "username _id");
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    const { _id } = req.params;
    const { description, duration, date } = req.body;

    if (!description || !duration) {
      throw new Error("Description and duration are required");
    }

    duration = parseInt(duration);
    if (isNaN(duration)) {
      throw new Error("Duration must be a number");
    }

    date = date ? new Date(date) : new Date();
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date format. Use yyyy-mm-dd");
    }

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }

    const exercise = new Exercise({
      userId: _id,
      description,
      duration,
      date,
    });

    await exercise.save();
    res.json({
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
      _id: user._id,
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  try {
    const { _id } = req.params;
    const { from, to, limit } = req.query;

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }

    let query = { userId: _id };
    let dateFilter = {};

    if (from) {
      dateFilter.$gte = new Date(from);
    }
    if (to) {
      dateFilter.$lte = new Date(to);
    }
    if (from || to) {
      query.date = dateFilter;
    }

    let exercises = Exercise.find(query).select("description duration date -_id");

    if (limit) {
      exercises = exercises.limit(parseInt(limit));
    }

    exercises = await exercises.exec();
    const log = exercises.map((ex) => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date.toDateString(),
    }));

    res.json({
      username: user.username,
      count: log.length,
      _id: user._id,
      log,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
