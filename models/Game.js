import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["red", "blue"], // Extend this array for future teams.
  },
  spymaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
  },
  operatives: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
  score: Number,
});

const gameSchema = new mongoose.Schema({
  grid: [[String]],
  teams: [teamSchema],
  turn: {
    type: String,
    enum: ["red", "blue"], // Extend this for future teams.
  },
  hint: String,
  hintNumber: Number,
  timer: Number,
  gameState: {
    type: String,
    enum: ["ongoing", "finished", "waiting"],
  },
  votes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
  revealedWords: [String],
  currentRole: {
    type: String,
    enum: ["spymaster", "operative"],
    default: "spymaster",
  },
});

gameSchema.methods.nextTurn = function () {
  // If the current role is an operative, switch the team's turn
  if (this.currentRole === "operative") {
    this.turn = this.turn === "red" ? "blue" : "red";
    this.currentRole = "spymaster";
  } else {
    this.currentRole = "operative";
  }
};

gameSchema.methods.getMostVotedWord = function () {
  // Logic to fetch the word with the most votes
  let maxVotes = 0;
  let mostVotedWord = null;
  for (let word in this.votes) {
    if (this.votes[word].length > maxVotes) {
      maxVotes = this.votes[word].length;
      mostVotedWord = word;
    }
  }
  return mostVotedWord;
};

gameSchema.methods.checkEndGame = function () {
  // Check if the assassin card is revealed
  const assassinRevealed = this.revealedWords.some(
    (word) => word.type === "assassin"
  );
  if (assassinRevealed) {
    this.gameState = "finished";
    this.winningTeam = this.turn === "red" ? "blue" : "red";
  }

  // Check if all words of a team are revealed
  const redWordsRevealed = this.board
    .filter((word) => word.team === "red")
    .every((word) => this.revealedWords.includes(word.word));
  const blueWordsRevealed = this.board
    .filter((word) => word.team === "blue")
    .every((word) => this.revealedWords.includes(word.word));

  if (redWordsRevealed) {
    this.gameState = "finished";
    this.winningTeam = "red";
  } else if (blueWordsRevealed) {
    this.gameState = "finished";
    this.winningTeam = "blue";
  }
};

gameSchema.methods.assignTeamAndRole = function () {
  // Logic to determine the team and role based on current players
  const redSpymasters = this.players.filter(
    (p) => p.team === "red" && p.role === "spymaster"
  );
  const blueSpymasters = this.players.filter(
    (p) => p.team === "blue" && p.role === "spymaster"
  );

  // Assign the player to a team and role based on availability
  if (redSpymasters.length === 0) {
    return { team: "red", role: "spymaster" };
  } else if (blueSpymasters.length === 0) {
    return { team: "blue", role: "spymaster" };
  } else {
    // If both teams have spymasters, assign as operative to the team with fewer players
    const redPlayers = this.players.filter((p) => p.team === "red");
    const bluePlayers = this.players.filter((p) => p.team === "blue");
    return redPlayers.length <= bluePlayers.length
      ? { team: "red", role: "operative" }
      : { team: "blue", role: "operative" };
  }
};

gameSchema.methods.voteWord = function (word, playerName) {
  // Logic to add a vote for the word
  if (!this.votes[word]) {
    this.votes[word] = [];
  }
  this.votes[word].push(playerName);
};

gameSchema.methods.checkUnanimousVote = function () {
  // Logic to check if all players voted for the same word
  const playersCount = this.players.length;
  for (let word in this.votes) {
    if (this.votes[word].length === playersCount) {
      return true;
    }
  }
  return false;
};

gameSchema.methods.revealWord = function (word) {
  // Logic to reveal a word based on votes
  this.revealedWords.push(word);
  const wordDetails = this.board.find((w) => w.word === word);

  if (wordDetails.team !== this.turn) {
    this.nextTurn();
  } else {
    this.timer += 20; // Increase the timer by 20 seconds for correct guess
  }

  return wordDetails;
};

gameSchema.methods.unvoteWord = function (word, playerName) {
  // Logic to remove a vote for the word
  if (!this.votes[word]) {
    return; // No votes exist for this word
  }

  const voteIndex = this.votes[word].indexOf(playerName);
  if (voteIndex !== -1) {
    this.votes[word].splice(voteIndex, 1);
  }

  // If no votes remain for this word, remove the word from votes
  if (this.votes[word].length === 0) {
    delete this.votes[word];
  }
};

gameSchema.methods.incrementTimer = function (incrementValue = 20) {
  this.timer += incrementValue;
};

export default mongoose.models.Game || mongoose.model("Game", gameSchema);
