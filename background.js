console.log('outside')
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    console.log('inside');
  if (
    details.frameId === 0 &&
    details.url.includes("https://chatgpt.com/c/")
  ) {
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      func: () => {
        // Remove injected navigator if exists
        const existing = document.getElementById('draggable-buttons-container');
        if (existing) existing.remove();

        // Reset injection flag (if used)
        window.__chatgptNavigatorInjected = false;
      }
    });

    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      files: ['chatgpt.js']
    });
  }
});
