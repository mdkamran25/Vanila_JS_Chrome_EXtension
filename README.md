# Vanilla JS Extension

## Overview
This project is a simple browser extension built using vanilla JavaScript. It includes a background script, content script, and a popup interface that allows users to interact with the extension, It also include example of some real time application i.e.,
- Todo App
- Push Notification
- Web page background color changer
- Image scraping

## Project Structure
```
vanilla-js-extension
├── src
│   ├── background.js
│   ├── content.js
│   ├── popup
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   └── manifest.json
└── README.md
```

## Installation
1. Clone the repository to your local machine.
2. Open your browser and navigate to the extensions page (e.g., `chrome://extensions` for Chrome).
3. Enable "Developer mode" (usually a toggle in the top right corner).
4. Click on "Load unpacked" and select the `src` directory of the cloned repository.

## Usage
- Click on the extension icon in the browser toolbar to open the popup interface.
- The popup will display the relevant information and allow user interactions as defined in the popup script.

## Development
- Modify the `background.js` file to handle background tasks.
- Use `content.js` to manipulate the DOM of web pages.
- Update `popup.html`, `popup.js`, and `popup.css` to customize the popup interface.

## Documentation Link: 
https://cultured-game-6c9.notion.site/Browser-Extension-1e8a1164054b805c8fa3d36b402d70ce

## License
This project is licensed under the MIT License. See the LICENSE file for more details.
