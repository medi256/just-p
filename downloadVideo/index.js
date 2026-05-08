const YTDlpWrap = require("yt-dlp-wrap").default;
const path = require("path");
const fs = require("fs");

async function main() {
  try {
    let binFolder = path.join(__dirname, "bin");
    let binPath = path.join(__dirname, "bin", "yt-dlp");

    function ensureFolderExists(dir) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    ensureFolderExists(binFolder);

    if (!fs.existsSync(binPath)) {
      console.log("yt-dlp not found. Downloading...");
      try {
        await YTDlpWrap.downloadFromGithub(binPath);
        console.log("yt-dlp downloaded successfully!");
      } catch (err) {
        console.log("❌ Failed to download yt-dlp:", err);
        process.exit(1);
      }
    } else {
      console.log("yt-dlp already exists. Skipping download.");
    }

    // Now we can safely create the YTDlpWrap instance
    const ytDlpWrap = new YTDlpWrap(binPath);

    const uniqueFileName = `audio_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}.mp4`;

    const audioPath = path.join(__dirname, "downloads", uniqueFileName);

    ensureFolderExists(path.join(__dirname, "downloads"));

    ytDlpWrap
      .exec([
        "https://www.tiktok.com/@motionmxtt/video/7634708561272098079?_r=1&_t=ZS-967vPKip12e",
        "-f",
        "best",
        "-o",
        audioPath,
      ])
      .on("progress", (process) => {
        console.log(`Progress: ${process.percent}`);
      })
      .on("close", async () => {
        console.log("Download complete!");

        try {
          // fs.unlinkSync(audioPath);
          console.log("Done deleting audio");
        } catch (error) {
          console.log("Error deleting file:", error);
        }
      })
      .on("error", (error) => {
        console.log("yt-dlp execution error:", error);
      });
  } catch (error) {
    console.log("Main error:", error);
  }
}

main();
