// create the popup
let popup = document.createElement("div");
let popupContent = document.createElement("div");

popup.style.position = "fixed";
popup.style.visibility = "hidden";
popup.style.bottom = "50px";
popup.style.left = 0;
popup.style.width = "100%";
popup.style.display = "flex";
popup.style.alignItems = "center";
popup.style.justifyContent = "center";
popup.style.zIndex = "9999";

popupContent.style.backgroundColor = "white";
popupContent.style.borderRadius = "20px";
popupContent.style.border = "1px solid #e7e7e7";
popupContent.style.padding = "20px";
popupContent.style.width = "80%";
popupContent.style.maxWidth = "700px";
popupContent.style.color = "black";
popup.appendChild(popupContent);
document.body.appendChild(popup);

document.addEventListener("mouseup", () => {
  document.removeEventListener("keydown", handleKeyPress);
  let selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    document.addEventListener("keydown", handleKeyPress);
  }

  function handleKeyPress(event) {
    if (event.key === ".") {
      document.removeEventListener("keydown", handleKeyPress);
      chrome.runtime.sendMessage({
        action: "lookupWord",
        word: selectedText,
      });
    }
  }
});

chrome.runtime.onMessage.addListener((message, event) => {
  popupContent.innerHTML = "";
  popup.style.visibility = "visible";
  if (message.action === "displayDefinition") {
    // prepare the data for further use
    let finalArray = [];
    // fill the popup with content
    let wordText = document.createTextNode(message.data[0].word);
    let word = document.createElement("p");
    word.appendChild(wordText);
    word.style.fontFamily = "'Times New Roman', serif";
    word.style.fontSize = "22px";
    word.style.fontStyle = "italic";
    word.style.fontWeight = "500";
    word.style.marginBottom = "10px";
    popupContent.appendChild(word);

    // make some buttons to save or close
    let buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.flexWrap = "wrap";
    buttonContainer.style.marginTop = "10px";
    let buttonCounter = 0;

    for (let i = 0; i < message.data.length; i++) {
      // create the text for the pronunciation
      if (message.data[i].phonetic) {
        let pronunciationText = document.createTextNode(
          message.data[i].phonetic
        );
        let pronunciation = document.createElement("p");
        pronunciation.style.fontFamily = "'Times New Roman', serif";
        pronunciation.style.fontSize = "18px";
        pronunciation.style.color = "#aaaaaa";
        pronunciation.style.marginBottom = "5px";
        pronunciation.appendChild(pronunciationText);
        popupContent.appendChild(pronunciation);
      }

      // find all types of the word (verb, noun etc.)
      for (let j = 0; j < message.data[i].meanings.length; j++) {
        let typeText = document.createTextNode(
          message.data[i].meanings[j].partOfSpeech
        );
        let type = document.createElement("p");
        type.style.fontFamily = "'Times New Roman', serif";
        type.style.fontSize = "18px";
        type.style.fontStyle = "italic";
        type.style.marginBottom = "5px";
        type.appendChild(typeText);
        popupContent.appendChild(type);

        // list all definitions for each type
        let definitionBox = document.createElement("p");
        definitionBox.style.fontFamily = "'Times New Roman', serif";
        definitionBox.style.fontSize = "16px";
        definitionBox.style.marginBottom = "10px";
        popupContent.appendChild(definitionBox);
        let definitionsArray = [];
        for (
          let k = 0;
          k < message.data[i].meanings[j].definitions.length;
          k++
        ) {
          if (k < 3) {
          }
          definitionsArray.push(
            message.data[i].meanings[j].definitions[k].definition
          );
        }
        definitionBox.innerHTML = definitionsArray.join(" / ");

        // make the array ready for download
        finalArray.push({
          definition: definitionsArray.join(" / "),
          pronunciation: message.data[i].phonetic
            ? message.data[i].phonetic
            : "",
          type: message.data[i].meanings[j].partOfSpeech,
          word: message.data[0].word,
        });
        buttonCounter++;
        buttonContainer.innerHTML +=
          "<button style='background-color: black; color: white; padding: 10px; border-radius: 30px; font-size: 16px; border: none; cursor: pointer; margin: 0 5px 5px 0; font-family:" +
          '"Inter"' +
          ", serif'>Save (" +
          buttonCounter +
          ")</button>";
      }
    }
    buttonContainer.innerHTML +=
      "<button style='background-color: black; color: white; padding: 10px; border-radius: 30px; font-size: 16px; border: none; cursor: none; margin: 0 5px 5px 0; font-family:" +
      '"Inter"' +
      ", serif'>Close (c)</button>";
    popupContent.appendChild(buttonContainer);

    document.addEventListener("keydown", handleButton);

    function handleButton(event) {
      document.removeEventListener("keydown", handleButton);
      let index = parseInt(event.key);
      // checks if index is a number
      if (index % 1 == 0) {
        // if so, it should send a message to download the thing
        chrome.runtime.sendMessage({
          action: "saveWord",
          data: finalArray[index - 1],
        });
        popup.style.visibility = "hidden";
      } else if (event.key == "c") {
        popup.style.visibility = "hidden";
      }
    }
  }
  if (message.action === "noData") {
    popupContent.innerHTML = "";
    let text = document.createTextNode("C2EX could not find any definition.");
    let textBox = document.createElement("p");
    textBox.appendChild(text);
    textBox.style.fontFamily = "'Times New Roman', serif";
    textBox.style.fontSize = "22px";
    textBox.style.fontStyle = "italic";
    textBox.style.fontWeight = "500";
    textBox.style.marginBottom = "10px";
    popupContent.appendChild(textBox);

    // make some buttons to save or close
    let buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.flexWrap = "wrap";
    popupContent.appendChild(buttonContainer);
    buttonContainer.innerHTML =
      "<button style='background-color: black; color: white; padding: 10px; border-radius: 30px; font-size: 16px; border: none; cursor: none; margin: 0 5px 5px 0; font-family:" +
      '"Inter"' +
      ", serif'>Close (c)</button>";

    document.addEventListener("keydown", handleButton);

    function handleButton(event) {
      document.removeEventListener("keydown", handleButton);
      let index = parseInt(event.key);
      // checks if index is a number
      if (event.key == "c") {
        popup.style.visibility = "hidden";
      }
    }
  }
});
