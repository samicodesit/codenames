import connectDB from "../../../utils/db";
import Game from "../../../utils/models/Game";
import { getIo } from "../../../utils/socket";

export default async function handler(req, res) {
  const { gameId } = req.query;
  const { hint, hintNumber } = req.body;

  await connectDB();

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    if (game.currentRole !== "spymaster") {
      return res
        .status(400)
        .json({ error: "Only spymasters can provide hints." });
    }

    game.hint = hint;
    game.hintNumber = hintNumber;
    game.timer = OPERATIVE_TIME; // Set the timer for the operatives
    await game.save();

    const io = getIo();
    io.to(gameId).emit("hint_provided", { hint, hintNumber });

    return res.status(200).json({ message: "Hint provided successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to provide hint." });
  }
}
