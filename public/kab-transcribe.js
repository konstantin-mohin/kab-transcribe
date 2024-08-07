import * as FilePond from "filepond";
import "filepond/dist/filepond.min.css"; // Import the CSS
import notificationSoundPath from "../public/flute-notification.mp3";

const pond = FilePond.create(document.getElementById("fileInput"));
const responseContainer = document.getElementById("response-container");
const responseText = document.getElementById("response-text");
const notificationSound = new Audio(notificationSoundPath);

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
          responseText.innerText = response;
        }, 1000);
      },
    },
  },
});

pond.on("processfileprogress", (file, progress) => {
  if (progress === 1) {
    responseContainer.style.visibility = "visible";
    responseText.innerText = "Transcribing...";
  }
});
