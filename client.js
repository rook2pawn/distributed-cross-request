const { rejects } = require("assert");
const http = require("http");
const { resolve } = require("path");

const port = 8000;

const postRequest = (postData) => {
  return new Promise((resolve, reject) => {
    postData = JSON.stringify(postData);
    const options = {
      hostname: "localhost",
      port: 8000,
      path: "/distributed",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };
    const req = http.request(options, (res) => {
      let rawData = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        rawData += chunk;
      });
      res.on("end", () => {
        return resolve(rawData);
      });
    });

    req.on("error", (e) => {
      return reject(e.message);
    });

    // Write data to request body
    req.write(postData);
    console.log("WROTE POST DATA:", postData);
    req.end();
  });
};

const calls = Array(3).fill(postRequest);
calls.forEach(async (call) => {
  const response = await call();
  console.log("RESPONSE:", response);
});

/*
calls.reduce((prev, curr) => {
  return prev.then(async () => {
    const response = await curr({ foo: "bar" }).catch((error) => {
      console.log("error:", error);
      return Promise.resolve(error);
    });
    console.log("response:", response);
    return Promise.resolve(response);
  });
}, Promise.resolve());
*/
