import connectDB from "../../../utils/db";
import Player from "../../../utils/models/Player";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  await connectDB();

  const { name, gameId, role, team } = req.body;

  try {
    const newPlayer = new Player({
      name,
      gameId,
      role,
      team,
    });

    const savedPlayer = await newPlayer.save();

    return res.status(201).json(savedPlayer);
  } catch (error) {
    console.error("Error creating player:", error);
    return res.status(500).json({ error: "Failed to create player." });
  }
}
