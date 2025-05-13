document.addEventListener("DOMContentLoaded", function () {
  const serviceWorkerFeatures = [
    {
      id: "push-notification",
      action: "SEND_PUSH_NOTIFICATION",
      title: "Push Notification",
    },
  ];

  const responseTitle = document.getElementById("response-title");
  const responseMessage = document.getElementById("response-message");
  const todoInput = document.getElementById("todoInput");
  const addTask = document.getElementById("addTodo");

  addTask.addEventListener("click", () => {
    if (!todoInput.value) {
      alert("Enter any task!");
      return;
    }
    chrome.runtime.sendMessage(
      { type: "CACHE_DATA", data: todoInput.value },
      (response) => {
        todoInput.value = ""; // Clear the input after saving
        loadNotes(); // Reload notes after adding a new one
      }
    );
  });

  function deleteNoteFromDB(index) {
    chrome.runtime.sendMessage(
      { type: "DELETE_NOTE", index: index },
      (response) => {
        console.log("Note deleted:", response.message);
        loadNotes(); // Reload notes after deletion
      }
    );
  }

  function loadNotes() {
    chrome.runtime.sendMessage({ type: "GET_NOTES" }, (response) => {
      const notesList = document.getElementById("todo-list");
      notesList.innerHTML = ""; // Clear existing list

      if (response && response.notes && response.notes.length > 0) {
        response.notes.forEach((note, index) => {

          const listItem = document.createElement("li");
          listItem.classList.add(
            "list-group-item",
            "d-flex",
            "justify-content-between",
            "align-items-center"
          );

          listItem.innerHTML = `Task ${index + 1}: ${note.note}`;

          // Create delete button
          const deleteButton = document.createElement("button");
          deleteButton.classList.add("btn", "btn-danger", "btn-sm");
          deleteButton.innerHTML = '<i class="bi bi-x"></i>'; // Bootstrap cross icon

          // Add delete functionality
          deleteButton.addEventListener("click", () => {
            deleteNoteFromDB(note.id); // Pass index to delete specific note
            listItem.remove(); // Remove the item from the UI
          });

          // Append delete button to the list item
          listItem.appendChild(deleteButton);

          // Append the list item to the notes list
          notesList.appendChild(listItem);
        });
      } else {
        notesList.innerHTML =
          '<li class="list-group-item">No notes found!</li>';
      }
    });
  }
  loadNotes();

  serviceWorkerFeatures.forEach((feature) => {
    const element = document.getElementById(feature.id);
    if (element) {
      element.addEventListener("click", () => {
        // Send a message to the Service Worker
        chrome.runtime.sendMessage({ type: feature.action }, (response) => {
          if (response) {
            responseTitle.textContent = feature.title;
            responseMessage.textContent = response.message;
          } else {
            responseTitle.textContent = feature.title;
            responseMessage.textContent = "No response from Service Worker.";
          }
        });
      });
    }
  });

  const contentScriptFeatures = [
    {
      id: "css-styling",
      action: "CSS_Change",
      title: "CSS Change",
    },
    {
      id: "image-scraping",
      action: "Image_Scraping",
      title: "Image Scraping",
    },
  ];
  contentScriptFeatures.forEach((feature) => {
    const element = document.getElementById(feature.id);
    if (element) {
      element.addEventListener("click", async () => {
        let [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        chrome.tabs.sendMessage(
          tab.id,
          { action: feature.action },
          (response) => {
            const responseContainer = document.getElementById("response-container");
            const responseTitle = document.getElementById("response-content-title");
            const responseMessage = document.getElementById("response-content-message");
            const imageContainer = document.getElementById("image-thumbnails");

            responseContainer.style.display = "block";
            responseTitle.textContent = feature.title;
            imageContainer.innerHTML = "";
            responseMessage.textContent = "";

            if (feature.title === "Image Scraping" && response?.images?.length) {
              responseMessage.textContent = `Found ${response.images.length} images`;
              console.log(response, response.images)
              response.images.forEach((imgSrc) => {
                if (imgSrc.startsWith("http") || imgSrc.startsWith("data:image")) {
                  console.log({imgSrc})
                  const img = document.createElement("img");
                  img.src = imgSrc;
                  img.alt = "thumbnail";
                  img.style.width = "80px";
                  img.style.height = "80px";
                  img.style.objectFit = "cover";
                  img.classList.add("rounded", "me-2", "mb-2");
                  imageContainer.appendChild(img);
                }
              });
            } else if (feature.title === "Image Scraping") {
              responseMessage.textContent = "No images found.";
            } else {
              responseMessage.textContent = response?.message || "No response from content script.";
            }
          }
        );
      });
    }
  });
});
