const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "lookupWord") {
    fetch(API_URL + message.word)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          console.log(data);
          let word = data[0].word;
          let pronunciation = data[0].phonetics?.[0]?.text || "N/A";
          let definitions = data[0].meanings.flatMap((meaning) =>
            meaning.definitions.map((def) => def.definition)
          );
          let synonyms = data[0].meanings.flatMap(
            (meaning) => meaning.synonyms
          );

          // Send result to content script
          chrome.tabs.sendMessage(sender.tab.id, {
            data,
            action: "displayDefinition",
          });
        } else {
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "noData",
          });
        }
      })
      .catch((error) => console.error("Error fetching definition:", error));
  }

  if (message.action === "saveWord" && message.data.word != undefined) {
    let word = message.data.word;
    let pronunciation = message.data.pronunciation;
    let definition = message.data.definition;
    let type = message.data.type;

    let entry = `${word} (${type})\t${pronunciation} ${definition}\n`;

    chrome.storage.local.get({ wordList: "" }, (result) => {
      let updatedWordList = result.wordList + entry;
      chrome.storage.local.set({ wordList: updatedWordList });

      // Allow user to download the file
      //chrome.downloads.download({
      //  url:
      //    "data:text/plain;charset=utf-8," +
      //    encodeURIComponent(updatedWordList),
      //  filename: "words.txt",
      //  saveAs: true,
      //});
    });
  }
});
