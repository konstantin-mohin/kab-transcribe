import * as FilePond from "filepond";
import "filepond/dist/filepond.min.css"; // Import the CSS
import notificationSoundPath from "../public/flute-notification.mp3";

const pond = FilePond.create(document.getElementById("fileInput"));
const responseContainer = document.getElementById("response-container");
const responseText = document.getElementById("response-text");
const downloadButton = document.getElementById("downloadBtn");
const notificationSound = new Audio(notificationSoundPath);
let transcriptionResult = "";
let fileName = "";

FilePond.setOptions({
  server: {
    process: {
      url: "/upload",
      method: "POST",
      onerror: (response) => {
        console.error("Error:", response);
        responseText.innerText = response;
      },
      onload: (response) => {
        notificationSound.play().catch((error) => {
          console.error("Error playing sound:", error);
        });
        setTimeout(() => {
          transcriptionResult = response;
          responseText.innerHTML = formatSrt(response);
          downloadButton.style.visibility = "visible";
        }, 1000);
      },
    },
  },
});

pond.on("processfileprogress", (file, progress) => {
  if (progress === 1) {
    console.log("Transcribing...", file.filename);
    fileName = removeFileExtension(file.filename);
    responseContainer.style.visibility = "visible";
    responseText.innerText = "Transcribing...";
  }
});

downloadButton.addEventListener("click", async () => {
  downloadResult();
});

function removeFileExtension(filename) {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return filename; // No extension found
  return filename.substring(0, lastDotIndex);
}

function downloadResult() {
  if (transcriptionResult === "") {
    alert("No transcription result available");
    return;
  }
  const blob = new Blob([transcriptionResult], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = fileName + ".srt";

  document.body.appendChild(a);
  a.click();

  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function formatSrt(srtContent) {
  const srtBlocks = srtContent.trim().split(/\n\s*\n/);
  return srtBlocks
    .map((block) => {
      const lines = block.split("\n");
      const blockNumber = lines[0];
      const timestamp = lines[1];
      const text = lines.slice(2).join("<br>");

      return `
            <div class="srt-block">
                <div class="srt-block-number">#${blockNumber}</div>
                <div class="srt-block-content">
                <div class="srt-block-text">${text}</div>
                <div class="srt-block-timestamp">${timestamp}</div>
                </div>
            </div>
        `;
    })
    .join("");
}
