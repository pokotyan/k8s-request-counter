import express, { Request, Response } from "express";
import next from "next";
import cors from "cors";
import * as socket from "./socket";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3001;

async function main() {
  try {
    await app.prepare();
    const server = express();
    server.all("*", (req: Request, res: Response) => {
      return handle(req, res);
    });
    const httpServer = server.listen(port, (err?: any) => {
      if (err) throw err;
      console.log(`> Ready on localhost:${port} - env ${process.env.NODE_ENV}`);
    });
    socket.init(httpServer);

    server.use(cors());
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
