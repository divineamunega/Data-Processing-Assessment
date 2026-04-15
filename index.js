import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { v7 as uuidv7 } from "uuid";
import nameModel from "./models/nameModel.js";

const app = express();
app.use(cors());
dotenv.config();

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("✓ MongoDB connection successful"))
  .catch((err) => {
    console.error("✗ MongoDB connection failed:");
    console.error(err.message);
  });

async function processName(name) {
  try {
    const res = await fetch(`https://api.genderize.io?name=${name}`);
    const data = await res.json();
    return data;
  } catch (e) {
    throw new Error(e);
  }
}

async function agifyName(name) {
  try {
    const res = await fetch(`https://api.agify.io/?name=${name}`);
    const data = await res.json();
    return data;
  } catch (e) {
    throw new Error(e);
  }
}

async function getCountryID(name) {
  try {
    const res = await fetch(`https://api.nationalize.io?name=${name}`);
    const data = await res.json();
    return data;
  } catch (e) {
    throw new Error(e);
  }
}

app.post("/api/profiles", async (req, res) => {
  try {
    const data = req.body.name;

    if (!data) {
      return res
        .status(400)
        .json({ status: "error", message: "Missing or empty name parameter" });
    }

    if (typeof data !== "string") {
      return res.status(422).json({ status: "error", message: "Invalid type" });
    }

    // Check if profile already exists
    const existingProfile = await nameModel.findOne({ name: data });
    if (existingProfile) {
      return res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: existingProfile,
      });
    }

    const {
      name,
      gender,
      probability: gender_probability,
      count: sample_size,
    } = await processName(data);

    if (gender === null || sample_size === 0) {
      res.status(502).json({
        status: "error",
        message: "Genderize returned an invalid response",
      });
    }

    const { age } = await agifyName(data);

    if (age === null) {
      res.status(502).json({
        status: "error",
        message: "Agify returned an invalid response",
      });
    }

    const countryData = await getCountryID(data);
    const { country_id, probability: country_probability } =
      countryData.country[0];

    if (countryData === null) {
      res.status(502).json({
        status: "error",
        message: "Nationalize returned an invalid response",
      });
    }

    const age_group =
      age >= 0 && age <= 12
        ? "Child"
        : age >= 13 && age <= 19
          ? "Teenager"
          : age >= 20 && age <= 59
            ? "Adult"
            : "Senior";

    const newNameResponse = {
      id: uuidv7(),
      name,
      gender,
      gender_probability,
      sample_size,
      age,
      age_group,
      country_id,
      country_probability,
      created_at: new Date().toISOString(),
    };

    const newName = new nameModel(newNameResponse);
    await newName.save();

    return res.status(201).json({
      status: "Success",
      data: newNameResponse,
    });
  } catch (e) {
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

app.get("/api/profiles", async (req, res) => {
  try {
    const { gender, country_id, age_group } = req.query;

    const filter = {};

    if (gender) {
      filter.gender = { $regex: `^${gender}$`, $options: "i" };
    }

    if (country_id) {
      filter.country_id = { $regex: `^${country_id}$`, $options: "i" };
    }

    if (age_group) {
      filter.age_group = { $regex: `^${age_group}$`, $options: "i" };
    }

    const profiles = await nameModel.find(filter);

    const responseData = profiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      gender: profile.gender,
      age: profile.age,
      age_group: profile.age_group,
      country_id: profile.country_id,
    }));

    return res.status(200).json({
      status: "success",
      count: responseData.length,
      data: responseData,
    });
  } catch (e) {
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

app.get("/api/profiles/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ status: "error", message: "Missing or empty id parameter" });
    }

    if (typeof id !== "string") {
      return res.status(422).json({ status: "error", message: "Invalid type" });
    }

    const existingProfile = await nameModel.findOne({ id });

    if (!existingProfile) {
      return res
        .status(404)
        .json({ status: "error", message: "Profile not found" });
    }

    return res.status(200).json({
      status: "success",
      data: existingProfile,
    });
  } catch (e) {
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

app.delete("/api/profiles/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ status: "error", message: "Missing or empty id parameter" });
    }

    if (typeof id !== "string") {
      return res.status(422).json({ status: "error", message: "Invalid type" });
    }

    const existingProfile = await nameModel.findOneAndDelete({ id });

    if (!existingProfile) {
      return res
        .status(404)
        .json({ status: "error", message: "Profile not found" });
    }

    return res.status(204).json({});
  } catch (e) {
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

// app.get("/api/classify", async (req, res) => {
//   try {
//     const data = req.query.name;

//     if (!data) {
//       return res
//         .status(400)
//         .json({ status: "error", message: "Missing or empty name parameter" });
//     }

//     if (typeof data !== "string") {
//       return res
//         .status(422)
//         .json({ status: "error", message: "name is not a string" });
//     }

//     const {
//       name,
//       gender,
//       probability,
//       count: sample_size,
//     } = await processName(data);
//     const is_confident = probability >= 0.7 && sample_size >= 100;

//     if (gender === null || sample_size === 0) {
//       res.status(422).json({
//         status: "error",
//         message: "No prediction available for the provided name",
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       data: {
//         name,
//         gender,
//         probability,
//         is_confident,
//         sample_size,
//         processed_at: new Date().toISOString(),
//       },
//     });
//   } catch (e) {
//     res
//       .status(500)
//       .json({ status: "error", message: "Upstream or server failure" });
//   }
// });

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
