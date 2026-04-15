import mongoose from "mongoose";
const { Schema } = mongoose;

const NameModel = new mongoose.Schema({
  id: String,
  name: { type: String, unique: true, required: true },
  gender: String,
  gender_probability: Number,
  sample_size: Number,
  age: Number,
  age_group: String,
  country_id: String,
  country_probability: Number,
  created_at: { type: Date, default: new Date().toISOString() },
});

export default mongoose.model("Names", NameModel);
