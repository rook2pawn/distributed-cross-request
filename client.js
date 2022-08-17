const { rejects } = require("assert");
const http = require("http");
const { resolve } = require("path");

const port = 8000;

const postRequest = (postData = { number: 2, text: "foobar" }) => {
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
    req.end();
  });
};

const calls = Array(100).fill(postRequest);
const responses = [];
calls.forEach(async (call, idx) => {
  const response = await call({ number: idx, text: "foobar" });
  responses.push(response);
  if (idx == calls.length - 1) {
    console.log(responses.length);
    responses.reduce(async (prev, curr) => {
      return prev.then((value) => {
        console.log("value:", value);
        return curr;
      });
    }, Promise.resolve());
  }
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
