//injects content into popup on page load

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    function: getProductTitle,
  }, (injectionResults) => {
    for (const frameResult of injectionResults) {
      document.getElementById('productTitle').textContent = frameResult.result;
    }
  });
});

function getProductTitle() {
  return document.getElementById('productTitle').innerText;
}