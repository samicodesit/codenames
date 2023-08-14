import { connectDB } from "../../../utils/database";
import Game from "../../../models/Game";

export default async function handler(req, res) {
  const { gameId } = req.query;

  await connectDB();

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    game.nextTurn();
    if (game.currentRole === "spymaster") {
      game.timer = SPYMASTER_TIME;
    } else {
      game.timer = OPERATIVE_TIME;
    }

    await game.save();

    const io = getIo();
    io.to(gameId).emit("turn_switched", {
      turn: game.turn,
      currentRole: game.currentRole,
    });

    return res
      .status(200)
      .json({ turn: game.turn, currentRole: game.currentRole });
  } catch (error) {
    return res.status(500).json({ error: "Failed to switch turn." });
  }
}
