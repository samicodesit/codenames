import connectDB from "../../../utils/db";
import Game from "../../../models/Game";
import { getIo } from "../../../utils/socket";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  await connectDB();

  try {
    const { gameId } = req.body;
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    game.timer -= 1;

    if (game.timer <= 0) {
      // Timer expired
      const mostVotedWord = game.getMostVotedWord();

      if (mostVotedWord) {
        const wordDetails = game.revealWord(mostVotedWord);
        getIo().to(gameId).emit("word_revealed", wordDetails);
      } else {
        game.nextTurn();
        getIo().to(gameId).emit("turn_switched", {
          turn: game.turn,
          currentRole: game.currentRole,
        });
      }

      game.timer = game.currentRole === "spymaster" ? 60 : 120;
      getIo().to(gameId).emit("timer_reset", game.timer);
    }

    await game.save();

    return res.status(200).json({ timer: game.timer });
  } catch (error) {
    console.error("Error updating timer:", error);
    return res.status(500).json({ error: "Failed to update timer." });
  }
}
