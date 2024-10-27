document.addEventListener("DOMContentLoaded", () => {
    // Load saved text from localStorage if available
    if (localStorage.getItem("savedText")) {
        textArea.value = localStorage.getItem("savedText");
        updateStatistics(); // Ensure statistics are also updated when loading saved text
        updateKeywordDensity(); // Update keyword density when loading saved text
    }
});

let textHistory = [];
let historyIndex = -1;
let keywords = [];

const textArea = document.getElementById("textArea");
const wordCount = document.getElementById("wordCount");
const sentenceCount = document.getElementById("sentenceCount");
const characterCount = document.getElementById("characterCount");
const paragraphCount = document.getElementById("paragraphCount");
const mainKeywordDensityDisplay = document.getElementById("mainKeywordDensityDisplay");
const additionalKeywordDensities = document.getElementById("additionalKeywordDensities");
const keywordInput = document.getElementById("keywordInput");
const keywordList = document.getElementById("keywordList");
const textarea = document.getElementById("textArea");
const grippie = document.querySelector(".grippie");
const includeSpacesCheckbox = document.getElementById("includeSpacesCheckbox");

let isDragging = false;

// Add mousedown event to grippie to start dragging
grippie.addEventListener("mousedown", (e) => {
    isDragging = true;
    document.body.style.userSelect = "none"; // Disable text selection while dragging
    textarea.style.opacity = 0.25; // Change textarea opacity to indicate it's resizing
});

// Add mousemove event to document to handle resizing while dragging
document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const newHeight = e.clientY - textarea.getBoundingClientRect().top;
    if (newHeight > 50) { // Prevent too small height
        textarea.style.height = `${newHeight}px`;
    }
});

// Add mouseup event to stop dragging
document.addEventListener("mouseup", () => {
    if (isDragging) {
        isDragging = false;
        document.body.style.userSelect = ""; // Enable text selection again
        textarea.style.opacity = 1; // Reset textarea opacity
    }
});

textArea.addEventListener("input", () => {
    saveToHistory();
    updateStatistics();
    updateKeywordDensity();
    localStorage.setItem("savedText", textArea.value); // Save to localStorage
});

includeSpacesCheckbox.addEventListener("change", () => {
    updateStatistics();
});

keywordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        addKeywords();
    }
});

function saveToHistory() {
    if (historyIndex < textHistory.length - 1) {
        textHistory = textHistory.slice(0, historyIndex + 1);
    }
    textHistory.push(textArea.value);
    historyIndex++;
}

function copyText() {
    textArea.select();
    document.execCommand("copy");
    alert("Text copied to clipboard!");
}

function clearText() {
    textArea.value = "";
    saveToHistory();
    updateStatistics();
    updateKeywordDensity();
    localStorage.removeItem("savedText"); // Remove saved text from localStorage
}

function toSentenceCase() {
    textArea.value = textArea.value.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    saveToHistory();
    updateStatistics();
    updateKeywordDensity();
}

function toUpperCase() {
    textArea.value = textArea.value.toUpperCase();
    saveToHistory();
    updateStatistics();
    updateKeywordDensity();
}

function toLowerCase() {
    textArea.value = textArea.value.toLowerCase();
    saveToHistory();
    updateStatistics();
    updateKeywordDensity();
}

function capitalizeWords() {
    textArea.value = textArea.value.replace(/\b\w/g, (c) => c.toUpperCase());
    saveToHistory();
    updateStatistics();
    updateKeywordDensity();
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        textArea.value = textHistory[historyIndex];
        updateStatistics();
        updateKeywordDensity();
    }
}

function redo() {
    if (historyIndex < textHistory.length - 1) {
        historyIndex++;
        textArea.value = textHistory[historyIndex];
        updateStatistics();
        updateKeywordDensity();
    }
}

function saveText() {
    const blob = new Blob([textArea.value], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "text.txt";
    link.click();
}

function addKeywords() {
    const inputKeywords = keywordInput.value.split(",").map(k => k.trim()).filter(k => k);
    inputKeywords.forEach(keyword => {
        if (keywords.length >= 3) {
            alert("You can only add up to 3 keywords.");
            return;
        }
        if (keywords.includes(keyword)) {
            alert("Keyword already exists.");
            return;
        }
        if (keywords.length < 3) {
            keywords.push(keyword);
            const keywordItem = document.createElement("div");
            keywordItem.classList.add("keyword-item");
            keywordItem.innerHTML = `${keyword} <button class="remove-keyword" onclick="removeKeyword('${keyword}')">&times;</button>`;
            keywordList.appendChild(keywordItem);
        }
    });
    keywordInput.value = "";
    updateKeywordDensity();
}

function removeKeyword(keyword) {
    keywords = keywords.filter(k => k !== keyword);
    updateKeywordList();
    updateKeywordDensity();
}

function updateKeywordList() {
    keywordList.innerHTML = "";
    keywords.forEach(keyword => {
        const keywordItem = document.createElement("div");
        keywordItem.classList.add("keyword-item");
        keywordItem.innerHTML = `${keyword} <button class="remove-keyword" onclick="removeKeyword('${keyword}')">&times;</button>`;
        keywordList.appendChild(keywordItem);
    });
}

function updateStatistics() {
    const text = textArea.value;
    wordCount.textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
    sentenceCount.textContent = text.split(/[.!?]+/).filter(Boolean).length;
    const includeSpaces = includeSpacesCheckbox.checked;
    characterCount.textContent = includeSpaces ? text.length : text.replace(/\s/g, "").length;
    paragraphCount.textContent = text.split(/\n+/).filter(Boolean).length;

    // Update the word and character summary paragraph
    document.getElementById("wordCharacterSummary").textContent = `${wordCount.textContent} words, ${characterCount.textContent} characters`;
}

function updateKeywordDensity() {
    const text = textArea.value;
    const totalWords = text.trim() ? text.trim().split(/\s+/).length : 0;
    additionalKeywordDensities.innerHTML = "";

    if (keywords.length > 0) {
        keywords.forEach((keyword, index) => {
            const occurrences = text.split(new RegExp(`\b${keyword}\b`, "gi")).length - 1;
            const density = totalWords > 0 ? ((occurrences / totalWords) * 100).toFixed(2) : 0;
            if (index === 0) {
                mainKeywordDensityDisplay.innerHTML = "";
                const mainKeywordDisplay = document.createElement("div");
                mainKeywordDisplay.textContent = `${keyword}: ${density}%`;
                setDensityColor(mainKeywordDisplay, density);
                mainKeywordDensityDisplay.appendChild(mainKeywordDisplay);
            } else {
                const densityElement = document.createElement("span");
                densityElement.textContent = `${keyword}: ${density}%`;
                setDensityColor(densityElement, density);
                additionalKeywordDensities.appendChild(densityElement);
            }
        });
    } else {
        mainKeywordDensityDisplay.innerHTML = "<p>Add some keywords to see the keyword density.</p>";
    }
}

function setDensityColor(element, density) {
    density = parseFloat(density);
    if (density >= 1 && density <= 2) {
        element.className = "keyword-density green-density";
    } else if (density < 1 && density >= 0.5) {
        element.className = "keyword-density orange-density";
    } else if (density < 0.5) {
        element.className = "keyword-density gray-density";
    } else if (density > 2) {
        element.className = "keyword-density red-density";
    }
}