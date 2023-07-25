const express = require("express");
const crypto = require("crypto");
const filesystem = require("./filesystem");
const app = express();
const port = 3000;

app.use(express.json());

let counter = 0; // Declare counter in the global scope

async function calculateSHA256Hash(inputString) {
  const hash = crypto.createHash("sha256");
  hash.update(inputString);
  return hash.digest("hex");
}

function findHashWithConstraint(prefixConstraint) {
  let inputString = "";

  while (true) {
    inputString = `${prefixConstraint}${counter}`;
    const sha256Hash = calculateSHA256Hash(inputString);

    // Check if the first four characters of the hash are '0'
    if (sha256Hash.slice(0, 4) === "0000") {
      break;
    }

    counter++;
  }
}

// Find an input string that produces a SHA-256 hash with the first four digits as '0'
findHashWithConstraint("0000");

app.post("/block", async (req, res) => {
  try {
    const data = req.body.data; // Accessing the "data" property from the request body
    const hash = await calculateSHA256Hash(data);

    var item = {
      blockNo: (filesystem.length + 1).toString(),
      data,
      hash,
      nounce: counter, // Use the correct "nonce" value from the global scope
      previosHash: filesystem[filesystem.length - 1].hash,
      // Other properties based on your requirements
    };

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

console.log(filesystem);

app.get("/", (req, res) => {
  res.send("Hello, this is your Node.js backend!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
