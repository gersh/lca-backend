
//find the price element
let apexElement = document.getElementById('apex_desktop_qualifiedBuybox');


if (apexElement) {
  // Create a new div and span element
  let newDiv = document.createElement("div");
  let newLabel = document.createElement("span");
  let carbonLabel = document.createElement("span");
  let hrElement = document.createElement("hr");
  let extraInfo = document.createElement("div");

  // Set the label's attributes
  newLabel.className = 'myExtensionLabel';
  newLabel.innerText = "Carbon Emissions: ";
  carbonLabel.innerText = "10kg";
  newDiv.className= 'myDiv';
  hrElement.className= 'myHr';
  extraInfo.className='extraInfo';
  carbonLabel.className='carbonLabel';

  fetch('http://localhost:59910/data')
  .then(response => response.json())
  .then(data => {
    // Process the JSON data and insert it into your web element
    let extraInfoText = data.carbon;
    extraInfo.textContent = extraInfoText;
  })
  .catch(error => {
    console.error('Error fetching JSON data:', error);
  });
  
  // Add the label and hr to the div
  newDiv.appendChild(newLabel);
  newDiv.appendChild(carbonLabel);
  newDiv.appendChild(hrElement);
  newDiv.appendChild(extraInfo);


  // Insert the new div after the apex-desktop div
  apexElement.parentNode.insertBefore(newDiv, apexElement.nextSibling);



  // Inject CSS
// Inject CSS
// Inject CSS
let css = `
.carbonLabel{
    font-weight:bold;
}

.extraInfo {
    margin-top:4px;
    font-weight:normal;
}
.myHr {
    margin-top: 8px;
    margin-bottom:8px;
    border-top: 1px solid rgba(0, 0, 0, .7);
}
.myDiv {
    padding: 16px;
    margin-top: 10px;
    margin-bottom: 10px;
    color: black;
    background-color: #BDF8B3;
    border-radius: 5px;
    font-size: 14px;
    font-weight: bold;
    position: relative;
    display: inline-block;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

#myExtensionBadge:hover {
    background-color: #2980b9;
}

#myExtensionBadge:hover #myTooltip {
    visibility: visible;
}
.myExtensionLabel {
    font-weight: normal;
}
`;

let style = document.createElement('style');
style.appendChild(document.createTextNode(css));
document.head.appendChild(style);;
}
// List of div IDs to cycle through
const divIds = ['productTitle', 'centerCol', 'prodDetails','productDescription_feature_div'];

// Helper function to filter out unwanted elements
function shouldIncludeElement(element) {
  const tagName = element.tagName.toLowerCase();
  const classNames = element.className;

  // Exclude specific HTML tags or classes from extraction
  if (tagName === 'script' || tagName === 'style') {
    return false;
  }

  if (classNames && typeof classNames === 'string' && classNames.includes('exclude-class')) {
    return false;
  }

  // Check if the element is hidden
  const computedStyle = window.getComputedStyle(element);
  if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
    return false;
  }

  return true;
}

// Function to recursively extract and concatenate visible text content from an element and its descendants
function extractVisibleTextFromElement(element, accumulatedText = '') {
  for (const childNode of element.childNodes) {
    if (childNode.nodeType === Node.TEXT_NODE) {
      // Extract text content from text node and concatenate it
      const textContent = childNode.textContent.trim();
      if (textContent !== '') {
        accumulatedText += (accumulatedText ? ' ' : '') + textContent;
      }
    } else if (childNode.nodeType === Node.ELEMENT_NODE) {
      if (shouldIncludeElement(childNode)) {
        // Recursively extract and concatenate visible text from child element
        accumulatedText = extractVisibleTextFromElement(childNode, accumulatedText);
      }
    }
  }

  return accumulatedText;
}

// Variable to store the concatenated visible texts
let concatenatedText = '';

// Loop through the list of div IDs
for (const divId of divIds) {
  // Select the div element based on the ID
  const targetDiv = document.querySelector(`#${divId}`);

  // Check if the target div exists
  if (targetDiv) {
    // Extract and concatenate the visible text content recursively
    const extractedText = extractVisibleTextFromElement(targetDiv);
    concatenatedText += (concatenatedText ? ' ' : '') + extractedText;
  }
}

console.log(concatenatedText);

//llm call to summarize description.

const url = 'http://127.0.0.1:5000/'; // Replace with your API endpoint URL

// Data to be sent in the request body
const data = {
  prompt: concatenatedText
};

// Options for the fetch request
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
};

// Make the POST request
fetch(url, options)
  .then(response => response.json())
  .then(data => {
    // Handle the response data
    console.log('Response:', data);
  })
  .catch(error => {
    // Handle any errors
    console.error('Error:', error);
  });