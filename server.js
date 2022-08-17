const http = require("http");
const port = 8000;

const asyncTask_1 = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
};

let callNumber = 0;
const distributed = [];
const server = http.createServer(async (req, res) => {
  console.log("req url:", req.url);
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
      req.setEncoding("utf8");
      let rawData = "";
      req.on("data", (chunk) => {
        rawData += chunk;
      });
      req.on("end", () => {
        try {
          const parsedData = JSON.parse(rawData);
          distributed.push({ data: parsedData, url: req.url, res });
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
  distributed.forEach(({ res, data, url }) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        data: "Distributed Hello World!",
        echoedData: JSON.stringify(data),
        callNumber,
      })
    );
  });
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
