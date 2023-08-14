import { Server } from "socket.io";
import { getIo, initializeSocket } from "../../../utils/socket";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default (req, res) => {
  if (!res.socket.server.io) {
    console.log("* First use, starting socket.io");

    const io = new Server(res.socket.server);

    initializeSocket(io);
  }

  return res.end();
};
