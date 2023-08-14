import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  name: String,
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
  },
  role: {
    type: String,
    enum: ["spymaster", "operative"],
  },
  team: {
    type: String,
    enum: ["red", "blue"], // Extend this for future teams.
  },
});

export default mongoose.models.Player || mongoose.model("Player", playerSchema);
