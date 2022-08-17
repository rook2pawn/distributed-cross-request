const http = require("http");
const port = 8000;

const asyncTask_1 = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
};

let callNumber = 0;
let distributed = [];
const server = http.createServer(async (req, res) => {
  switch (req.url) {
    case "/":
      callNumber++;
      console.log("Vanilla Incoming call:", callNumber);
      await asyncTask_1();
      console.log("done with async task");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          data: "Hello World!",
          callNumber,
        })
      );
      break;
    case "/distributed":
      callNumber++;
      console.log("Distributed Incoming call:", callNumber);
      await asyncTask_1();
      req.setEncoding("utf8");
      let rawData = "";
      req.on("data", (chunk) => {
        rawData += chunk;
      });
      req.on("end", () => {
        try {
          const { number, text } = JSON.parse(rawData);
          distributed.push({ number, text, url: req.url, res });
        } catch (e) {
          console.error(e.message);
        }
      });
      break;
    default:
      break;
  }
});

setInterval(() => {
  console.log(`beginning interval task. Tasks remaining ${distributed.length}`);
  const working = [...distributed];
  distributed = [];
  let count = 0;
  working.forEach(({ res, number, text, url }) => {
    count++;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        number: number * 2,
        text: text.toUpperCase(),
        count,
      })
    );
  });
  if (count > 0) console.log(`Finished replying to ${count} tasks.`);
}, 3000);

server.listen(port, () => {
  console.log(`backend server listening on ${port}`);
});
process.on("SIGINT", function () {
  console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
  // some other closing procedures go here
  server.close(() => {
    console.log("Server closed. Process now exiting");
    process.exit(0);
  });
});
