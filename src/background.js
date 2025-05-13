function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SmartNotesDB", 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("notes")) {
        db.createObjectStore("notes", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Save note to IndexedDB
function saveNoteToDB(note) {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction("notes", "readwrite");
        const store = transaction.objectStore("notes");
        const request = store.add({ note: note });
        request.onsuccess = () => {
          resolve("Data cached successfully!");
        };
        request.onerror = () => {
          reject("Error adding note to DB");
        };
      })
      .catch(reject);
  });
}

// Get all notes from IndexedDB
function getNotesFromDB() {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction("notes", "readonly");
        const store = transaction.objectStore("notes");
        const request = store.getAll(); // Get all notes
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        request.onerror = (event) => {
          reject("Error retrieving notes");
        };
      })
      .catch(reject);
  });
}

// Delete a specific note from IndexedDB by its index
function deleteNoteFromDB(index) {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction("notes", "readwrite");
        const store = transaction.objectStore("notes");
        console.log({ index });
        const request = store.delete(index); // Delete note by index

        request.onsuccess = () => {
          resolve("Note deleted successfully!");
        };
        request.onerror = () => {
          reject("Error deleting note");
        };
      })
      .catch(reject);
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "CACHE_DATA":
      saveNoteToDB(message.data)
        .then((responseMessage) => {
          sendResponse({ message: responseMessage });
        })
        .catch((error) => {
          sendResponse({ message: error });
        });
      break;

    case "GET_NOTES":
      getNotesFromDB()
        .then((data) => {
          sendResponse({ notes: data.map((entry) => entry) });
        })
        .catch((error) => {
          sendResponse({ message: "Error retrieving notes" });
        });
      break;

    case "DELETE_NOTE":
      deleteNoteFromDB(message.index)
        .then((responseMessage) => {
          sendResponse({ message: responseMessage });
        })
        .catch((error) => {
          sendResponse({ message: error });
        });
      break;

    case "SEND_PUSH_NOTIFICATION":
      checkForPendingTasks();
      sendResponse({ message: "Push notification sent!" });
      break;
      console.log("[SW] Message passing...");
      // Simulate message passing logic
      sendResponse({ message: "Message passed successfully!" });
      break;

    default:
      console.log("[SW] Unknown action:", message.type);
      sendResponse({ message: "Unknown action!" });
      break;
  }

  return true;
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activated");
  event.waitUntil(checkForPendingTasks());
});

chrome.runtime.onStartup.addListener(() => {
  checkForPendingTasks();
});

function checkForPendingTasks() {
  getNotesFromDB()
    .then((data) => {
      if (data.length > 0) {
        console.log({ data });
        self.registration.showNotification("🔔 Task Reminder", {
          body: `You have ${data.length} tasks to complete.`,
          icon: "./icons/icon.png",
          badge: "./icons/icon.png",
        });
      } else {
        self.registration.showNotification("🔔 Task Reminder", {
          body: `you don't have tasks to complete.`,
          icon: "./icons/icon.png",
          badge: "./icons/icon.png",
        });
      }
    })
    .catch((error) => {
      sendResponse({ message: "Error retrieving notes" });
    });
}

//Context menu for search

self.addEventListener("install", () => {
  chrome.contextMenus.create({
    id: "searchGoogle",
    title: "Extension will search '%s'",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "searchGoogle") {
    let query = info.selectionText;
    let url = "https://www.google.com/search?q=" + encodeURIComponent(query);
    chrome.tabs.create({ url: url });
  }
});
