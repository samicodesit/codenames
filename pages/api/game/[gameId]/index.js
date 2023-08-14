import connectDB from "../../../utils/db";
import Game from "../../../utils/models/Game";

export default async function handler(req, res) {
  const { gameId } = req.query;

  await connectDB();

  try {
    const game = await Game.findById(gameId).populate("players");
    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    return res.status(200).json(game);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch game data." });
  }
}
