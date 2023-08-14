import connectDB from "../../../utils/db";
import Game from "../../../utils/models/Game";
import Player from "../../../utils/models/Player";

export default async function handler(req, res) {
  const { gameId } = req.query;
  const { playerName } = req.body;

  await connectDB();

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    const existingPlayer = await Player.findOne({ name: playerName });
    if (existingPlayer) {
      return res.status(400).json({ error: "Player name already exists." });
    }

    const newPlayer = new Player({ name: playerName });
    const savedPlayer = await newPlayer.save();

    game.players.push(savedPlayer);

    const { team, role } = game.assignTeamAndRole();
    savedPlayer.team = team;
    savedPlayer.role = role;
    await savedPlayer.save();

    await game.save();

    const io = getIo();
    io.to(gameId).emit("player_joined", savedPlayer);

    return res.status(200).json(savedPlayer);
  } catch (error) {
    return res.status(500).json({ error: "Failed to join game." });
  }
}
