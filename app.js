const express = require("express");
const path = require("path");
const fs = require("fs");
const Busboy = require("busboy");
const ffmpeg = require("fluent-ffmpeg");

const app = express();

const uploadsDir = path.join(__dirname, "uploads");

// Create the 'uploads' directory if it doesn't exist
fs.mkdirSync(uploadsDir, { recursive: true });

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

app.post("/upload", (req, res) => {
  const busboy = Busboy({ headers: req.headers });
  const tempFilePath = path.join(uploadsDir, `video-${Date.now()}.tmp`);
  const tempFileStream = fs.createWriteStream(tempFilePath);
  console.log("UPLOADING");

  busboy.on("file", (fieldname, file, info) => {
    console.log("File received:", info.filename);
    file.pipe(tempFileStream);
  });

  busboy.on("finish", async () => {
    console.log("File upload complete. Processing file...");

    const outputAudioPath = path.join(uploadsDir, `audio-${Date.now()}.mp3`);

    ffmpeg(tempFilePath)
      .audioCodec("libmp3lame")
      .format("mp3")
      .save(outputAudioPath)
      .on("end", () => {
        console.log("File processing complete.");
        fs.unlinkSync(tempFilePath); // Clean up temp file
        res.send("Upload and transcription complete");
      })
      .on("error", (err, stdout, stderr) => {
        console.error("FFmpeg Error:", err.message);
        console.error("FFmpeg STDOUT:", stdout);
        console.error("FFmpeg STDERR:", stderr);
        res.status(500).send("Error processing file");
      });
  });

  req.pipe(busboy);
});

const port = 3000; // Choose your desired port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
