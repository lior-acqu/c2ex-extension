document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("download").addEventListener("click", () => {
    chrome.storage.local.get("wordList", (data) => {
      let blob = new Blob([data.wordList || ""], { type: "text/plain" });
      let url = URL.createObjectURL(blob);
      let a = document.createElement("a");
      a.href = url;
      a.download = "words.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  });
});
