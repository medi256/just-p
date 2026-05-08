const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Route to serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route to handle audio extraction
app.get("/download", async (req, res) => {
  try {
    const videoURL = req.query.url;

    if (!videoURL) {
      return res.status(400).json({ error: "Please provide a YouTube URL" });
    }

    // Validate YouTube URL
    if (!ytdl.validateURL(videoURL)) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    // Get video info
    const info = await ytdl.getInfo(videoURL);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");

    // Set headers for audio download
    res.header("Content-Disposition", `attachment; filename="${title}.mp3"`);
    res.header("Content-Type", "audio/mpeg");

    // Download and convert to audio
    const stream = ytdl(videoURL, {
      quality: "highestaudio",
      filter: "audioonly",
    });

    // Use ffmpeg to convert to mp3
    ffmpeg(stream)
      .toFormat("mp3")
      .on("error", (err) => {
        console.error(err);
        res.status(500).json({ error: "Conversion failed" });
      })
      .pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
