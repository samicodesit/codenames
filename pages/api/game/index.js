import { words } from "@/words";
import connectDB from "../../../utils/db";
import Game from "../../../utils/models/Game";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  await connectDB();

  try {
    const initialGrid = generateInitialGrid();
    const newGame = new Game({
      grid: initialGrid,
      teams: [],
      turn: "red",
      gameState: "waiting",
    });

    const savedGame = await newGame.save();

    return res.status(201).json(savedGame);
  } catch (error) {
    console.error("Error creating game:", error);
    return res.status(500).json({ error: "Failed to create game." });
  }
}

function generateInitialGrid() {
  const grid = [];
  const gridSize = 5; // You can change this for a bigger grid in the future.
  const totalCards = gridSize * gridSize;

  // Shuffle the words list and pick the required number of words.
  const shuffledWords = words.sort(() => 0.5 - Math.random());
  const selectedWords = shuffledWords.slice(0, totalCards);

  // Assign types to words
  const redWords = selectedWords.slice(0, 8); // 8 words for the red team
  const blueWords = selectedWords.slice(8, 16); // 8 words for the blue team
  const neutralWords = selectedWords.slice(16, 24); // 7 neutral words
  const assassinWord = selectedWords[24]; // 1 assassin word

  const typedWords = [
    ...redWords.map((word) => ({ word, type: "red" })),
    ...blueWords.map((word) => ({ word, type: "blue" })),
    ...neutralWords.map((word) => ({ word, type: "neutral" })),
    { word: assassinWord, type: "assassin" },
  ];

  // Shuffle the typed words to ensure randomness in the grid
  const shuffledTypedWords = typedWords.sort(() => 0.5 - Math.random());

  // Create the grid
  for (let i = 0; i < gridSize; i++) {
    const row = [];
    for (let j = 0; j < gridSize; j++) {
      row.push(shuffledTypedWords[i * gridSize + j]);
    }
    grid.push(row);
  }

  return grid;
}

function shuffleArray(array) {
  let curId = array.length;
  while (0 !== curId) {
    let randId = Math.floor(Math.random() * curId);
    curId -= 1;

    let tmp = array[curId];
    array[curId] = array[randId];
    array[randId] = tmp;
  }
  return array;
}
