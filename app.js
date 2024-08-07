const express = require("express");
const path = require("path");
const fs = require("fs");
const Busboy = require("busboy");
const ffmpeg = require("fluent-ffmpeg");
const OpenAI = require("openai");

const app = express();

const uploadsDir = path.join(__dirname, "uploads");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create the 'uploads' directory if it doesn't exist
fs.mkdirSync(uploadsDir, { recursive: true });

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public", "dist")));

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
      .on("end", async () => {
        console.log("File processing complete.");
        fs.unlinkSync(tempFilePath); // Clean up temp file
        // res.send("Upload and transcription complete");
        try {
          // Start OpenAI transcription (adjust settings as needed)
          const transcriptionResult = await openai.audio.transcriptions.create({
            file: fs.createReadStream(outputAudioPath),
            model: "whisper-1",
            response_format: "text",
          });
          console.log("File processing complete.", transcriptionResult);
          res.send(transcriptionResult);

          fs.unlinkSync(outputAudioPath);
        } catch (error) {
          console.error("Transcription error:", error);
          res.status(500).send("Error during transcription");
        }
      })
      .on("error", (err, stdout, stderr) => {
        fs.unlinkSync(tempFilePath);
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
