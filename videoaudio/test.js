const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

const videoURL = "https://www.youtube.com/watch?v=aqz-KE-bpKQ";

async function downloadAudio() {
  try {
    // Get video info
    const info = await ytdl.getInfo(videoURL);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");
    console.log("Starting download for:", title);

    // Create download stream
    const stream = ytdl(videoURL, {
      quality: "highestaudio",
      filter: "audioonly",
    });

    // Use ffmpeg to convert to mp3
    ffmpeg(stream)
      .toFormat("mp3")
      .saveToFile(`${title}.mp3`)
      .on("progress", (progress) => {
        if (progress.percent) {
          console.log(`Processing: ${Math.floor(progress.percent)}% done`);
        }
      })
      .on("end", () => {
        console.log("Download completed!");
        console.log(`File saved as: ${title}.mp3`);
      })
      .on("error", (err) => {
        console.error("Error:", err);
      });
  } catch (error) {
    console.error("Error:", error);
  }
}

downloadAudio();
