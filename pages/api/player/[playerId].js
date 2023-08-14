import connectDB from "../../../utils/db";
import Player from "../../../utils/models/Player";

export default async function handler(req, res) {
  const { playerId } = req.query;

  if (req.method !== "GET") {
    return res.status(405).end();
  }

  await connectDB();

  try {
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ error: "Player not found." });
    }

    return res.status(200).json(player);
  } catch (error) {
    console.error("Error fetching player:", error);
    return res.status(500).json({ error: "Failed to retrieve player." });
  }
}
