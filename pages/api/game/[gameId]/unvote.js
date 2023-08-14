import { connectDB } from "../../../utils/database";
import Game from "../../../models/Game";

export default async function handler(req, res) {
  const { gameId } = req.query;
  const { word, playerName } = req.body;

  await connectDB();

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    game.unvoteWord(word, playerName);
    await game.save();

    const io = getIo();
    io.to(gameId).emit("word_unvoted", { word, playerName });

    return res.status(200).json({ message: "Vote removed successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to remove vote." });
  }
}
