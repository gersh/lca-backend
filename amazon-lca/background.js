//believe this runs content.js and also tries to inject CSS
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: injectCSS
      }).then(() => {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js']
        });
      }).catch((error) => console.log(error));
    }
  });
 
  //this doesn't work, I haven't yet debugged sorry
  function injectCSS() {
    fetch(chrome.runtime.getURL('styles.css'))
      .then(response => response.text())
      .then(css => {
        let style = document.createElement('style');
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
      });
  }
  