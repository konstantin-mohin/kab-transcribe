const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const labelProgress = document.getElementById("label-progress");
const responseText = document.getElementById("response-text");
const customFileLabel = document.querySelector(".custom-file-label");
const browseUploadBtn = document.getElementById("browseUploadBtn");

// const progressBarFill = document.querySelector(".progress-bar");
const progressBar = document.querySelector(".progress-bar");

browseUploadBtn.addEventListener("click", (event) => {
  if (browseUploadBtn.textContent === "Browse") {
    event.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener("change", () => {
  const fileName = fileInput.files[0]?.name || "Choose file";
  customFileLabel.textContent = fileName;
  if (fileName !== "Choose file") {
    customFileLabel.classList.add("upload");
    browseUploadBtn.textContent = "Upload";
  } else {
    customFileLabel.classList.remove("upload");
    browseUploadBtn.textContent = "Browse";
  }
});

// if (browseUploadBtn.textContent === "Browse") {
// 	event.preventDefault();
// 	fileInput.click();
// } else {
form.addEventListener("submit", (event) => {
  event.preventDefault();
  // progressBar.style.display = "block";
  const formData = new FormData();
  const xhr = new XMLHttpRequest();

  formData.append("fileInput", fileInput.files[0]);

  // const blob = new Blob([fileInput.files[0]], { type: 'application/octet-stream' });
  // const url = URL.createObjectURL(blob);
  xhr.open("POST", "/upload");
  // const boundary = formData.getBoundary();

  // xhr.setRequestHeader('Content-Type', 'application/octet-stream');
  // xhr.setRequestHeader('Content-Type', `multipart/form-data; boundary=${boundary}`);

  xhr.upload.onprogress = (event) => {
    console.log("progress", event);
    if (event.lengthComputable) {
      const percentComplete = (event.loaded / event.total) * 100;
      console.log("percentComplete", percentComplete);
      // progressBarFill.style.width = percentComplete + "%";
      // labelProgress.style.backgroundColor = `hsl(${
      //   percentComplete * 1.2
      // }, 50%, 50%)`;
      progressBar.style.width = percentComplete + "%";
    }
  };
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      responseText.textContent = "Upload completed successfully.";
      labelProgress.style.backgroundColor = "green";
    } else {
      responseText.textContent = "An error occurred during upload.";
    }
    resetForm();
  };

  xhr.onerror = () => {
    responseText.textContent = "An error occurred during upload.";
    labelProgress.style.backgroundColor = "red";
    resetForm();
  };

  xhr.send(formData);
});
function resetForm() {
  // progressBar.style.display = "none";
  progressBar.style.width = "0%";
  fileInput.value = ""; // Clear the file input
  customFileLabel.textContent = "Choose file"; // Reset label
  customFileLabel.classList.remove("upload"); // Reset label class
  browseUploadBtn.textContent = "Browse"; // Reset button text
  labelProgress.style.backgroundColor = "lightblue"; // Reset progress bar color
}
