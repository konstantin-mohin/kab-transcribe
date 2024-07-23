const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();
const upload = multer();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Handle file uploads
app.post("/upload", upload.single("fileInput"), (req, res) => {
  // Placeholder for file handling logic
  console.log("File uploaded:", req.file);

  // Respond (you'll likely send a more informative response)
  res.send("File received successfully");
});

const port = 3000; // Choose your desired port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
