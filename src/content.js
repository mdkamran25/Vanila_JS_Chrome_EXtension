let colorIndex = 0;
const colors = [
  "yellow",
  "lightblue",
  "lightgreen",
  "lightpink",
  "lavender",
  "red",
];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("message", { message });
  switch (message.action) {
    case "CSS_Change":
      const nextColor = colors[colorIndex % colors.length];
      document.body.style.backgroundColor = nextColor;

      colorIndex++; // Move to next color on next call

      sendResponse({ message: `Background color changed to ${nextColor}!` });
      break;

    case "Image_Scraping":
      const images = Array.from(document.images).map((img) => img.src);
      console.log(`${images?.length} Images scraped successfully.`, images);
      sendResponse({
        message: `${images?.length} Images scraped successfully.`,
        images,
      });
      break;

    default:
      sendResponse({ message: "Unknown action type." });
      break;
  }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "doSomething") {
    // Your code here, e.g., modify the page
    alert("Button clicked in popup!");
  }
});

console.log("My Extension");

// alert("Hello from the content script!");
