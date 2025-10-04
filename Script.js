document.addEventListener("DOMContentLoaded", () => {
  loadSurahList();
  loadSurah(1);
  showBookmarks();
});

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

function loadSurahList() {
  fetch("https://api.alquran.cloud/v1/surah")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("surahSelect");
      data.data.forEach(surah => {
        const option = document.createElement("option");
        option.value = surah.number;
        option.text = `${surah.number}. ${surah.englishName} (${surah.name})`;
        select.appendChild(option);
      });
    });
}

function loadSurah(surahNumber) {
  fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/id.indonesian`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("surah-title").innerText = `${data.data.name} - ${data.data.englishName}`;
      const ayatList = document.getElementById("ayat-list");
      ayatList.innerHTML = "";

      data.data.ayahs.forEach(ayah => {
        const ayatDiv = document.createElement("div");
        ayatDiv.classList.add("ayat");

        ayatDiv.innerHTML = `
          <p><strong>${ayah.numberInSurah}</strong>. ${ayah.text}</p>
          <p><em>Terjemahan:</em> ${ayah.translation}</p>
          <button onclick="playAudio(${ayah.number})">🔊 Putar Audio</button>
          <button onclick="bookmarkAyat(${ayah.number})">⭐ Simpan Ayat</button>
        `;

        ayatList.appendChild(ayatDiv);
      });

      loadTafsir(surahNumber);
    });
}

function playAudio(ayahNumber) {
  fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/ar.alafasy`)
    .then(res => res.json())
    .then(data => {
      const audio = new Audio(data.data.audio);
      audio.play();
    });
}

function bookmarkAyat(ayahNumber) {
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
  if (!bookmarks.includes(ayahNumber)) {
    bookmarks.push(ayahNumber);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    alert("Ayat disimpan!");
  } else {
    alert("Ayat sudah disimpan.");
  }
}

function showBookmarks() {
  const list = document.getElementById("bookmarkList");
  const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
  list.innerHTML = "";

  bookmarks.forEach(num => {
    fetch(`https://api.alquran.cloud/v1/ayah/${num}/id.indonesian`)
      .then(res => res.json())
      .then(data => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${data.data.surah.name} (${data.data.numberInSurah})</strong>: ${data.data.text}`;
        list.appendChild(li);
      });
  });
}

function loadTafsir(surahNumber) {
  fetch(`https://equran.id/api/v2/tafsir/${surahNumber}`)
    .then(res => res.json())
    .then(data => {
      const ayatList = document.getElementById("ayat-list");
      data.data.ayat.forEach((ayat, index) => {
        const tafsirDiv = document.createElement("div");
        tafsirDiv.innerHTML = `
          <details>
            <summary>Tafsir Ayat ${index + 1}</summary>
            <p>${ayat.tafsir}</p>
          </details>
        `;
        ayatList.appendChild(tafsirDiv);
      });
    });
}

function searchKeyword() {
  const keyword = document.getElementById("searchInput").value;
  const resultsDiv = document.getElementById("searchResults");
  resultsDiv.innerHTML = "Sedang mencari...";

  fetch(`https://api.quran.com:443/v4/search?q=${keyword}&size=10&page=1&language=id`)
    .then(res => res.json())
    .then(data => {
      resultsDiv.innerHTML = "";
      if (data.data.count === 0) {
        resultsDiv.innerHTML = "Tidak ditemukan ayat dengan kata tersebut.";
        return;
      }

      data.data.matches.forEach(match => {
        const ayat = document.createElement("div");
        ayat.classList.add("ayat");
        ayat.innerHTML = `
          <p><strong>${match.surah.name} (${match.surah.number}:${match.verse.number})</strong></p>
          <p>${match.text}</p>
        `;
        resultsDiv.appendChild(ayat);
      });
    })
    .catch(err => {
      resultsDiv.innerHTML = "Terjadi kesalahan saat mencari.";
      console.error(err);
    });
}
