document.addEventListener("DOMContentLoaded", () => {
  loadSurahList();
  loadSurah(1);
  showBookmarks();
});
ayatDiv.innerHTML = `
  <p class="arabic">${ayah.text}</p>
  <p><em>Terjemahan:</em> ${ayah.translation}</p>
  <button onclick="playAudio(${ayah.number})">🔊 Putar Audio</button>
  <button onclick="bookmarkAyat(${ayah.number})">⭐ Simpan Ayat</button>
`;
fetch(`https://api.quran.sutanlab.id/surah/${surahNumber}`)
  .then(res => res.json())
  .then(data => {
    const ayatList = document.getElementById("ayat-list");
    ayatList.innerHTML = "";

    data.data.verses.forEach(ayah => {
      const ayatDiv = document.createElement("div");
      ayatDiv.classList.add("ayat");

      ayatDiv.innerHTML = `
        <p class="arabic">${ayah.text.arab}</p>
        <p><em>Terjemahan:</em> ${ayah.translation.id}</p>
        <button onclick="playAudio('${ayah.audio.primary}')">🔊 Putar Audio</button>
      `;

      ayatList.appendChild(ayatDiv);
    });
  });

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

let currentSurahAyahs = []; // Global variable to store current Surah's ayah numbers for autoplay

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

      // Store ayah numbers for autoplay
      currentSurahAyahs = data.data.ayahs.map(ayah => ayah.number);

      data.data.ayahs.forEach(ayah => {
        const ayatDiv = document.createElement("div");
        ayatDiv.classList.add("ayat");
        ayatDiv.setAttribute("data-ayah-number", ayah.number); // Add data attribute for easier targeting

        ayatDiv.innerHTML = `
          <p class="arabic-text">${ayah.text} <small>(${ayah.numberInSurah})</small></p>
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

      // --- Autoplay logic start ---
      audio.addEventListener('ended', () => {
        const currentIndex = currentSurahAyahs.indexOf(ayahNumber);
        const nextAyahNumber = currentSurahAyahs[currentIndex + 1];

        // Check if there is a next ayah
        if (nextAyahNumber) {
          playAudio(nextAyahNumber);
        } else {
          alert("Selesai memutar audio Surah ini.");
        }
      });
      // --- Autoplay logic end ---

      // Stop any currently playing audio (optional but recommended)
      document.querySelectorAll('audio').forEach(a => a.pause());

      audio.play();

      // Highlight the currently playing ayah
      document.querySelectorAll('.ayat').forEach(div => div.style.border = '1px solid #ddd');
      const currentAyatDiv = document.querySelector(`[data-ayah-number="${ayahNumber}"]`);
      if (currentAyatDiv) {
        currentAyatDiv.style.border = '2px solid #006666';
        currentAyatDiv.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Scroll to the ayah
      }
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
      // Use a more robust way to insert tafsir after its corresponding ayah div
      data.data.ayat.forEach((ayat, index) => {
        // Ayah numbering starts from 1, so index + 1 is the number in surah
        // The API provides the ayah number in surah, not the global ayah number
        const surahNumber = data.data.nomor; // Get surah number from tafsir data
        const globalAyahNumber = data.data.ayahs[index].nomor; // Assuming a good match, but more complex in practice.

        // Simpler approach: Append the tafsir div after all ayahs have been loaded in the main loop.
        // The current script's structure appends tafsir at the *end* of the ayah list,
        // which matches the existing code's behavior. We'll keep this simpler approach.

        const tafsirDiv = document.createElement("div");
        tafsirDiv.innerHTML = `
          <details>
            <summary>Tafsir Ayat ${ayat.aya}</summary>
            <p>${ayat.tafsir}</p>
          </details>
        `;
        // Since the `loadSurah` loop already finished, we append to the list.
        ayatList.appendChild(tafsirDiv);
      });
    });
}

function searchKeyword() {
  const keyword = document.getElementById("searchInput").value;
  const resultsDiv = document.getElementById("searchResults");
  resultsDiv.innerHTML = "Sedang mencari...";

  // FIX: Updated to a working quran.com search API endpoint.
  // We search in both Arabic and Indonesian translations.
  fetch(`https://api.quran.com/api/v4/search?q=${keyword}&language=id&size=20&fields=text_imlaei,translation_id`)
    .then(res => res.json())
    .then(data => {
      resultsDiv.innerHTML = "";
      if (data.search.results.length === 0) {
        resultsDiv.innerHTML = `Tidak ditemukan ayat dengan kata "${keyword}".`;
        return;
      }

      data.search.results.forEach(match => {
        const ayat = document.createElement("div");
        ayat.classList.add("ayat");
        // The API response is nested differently
        const surahName = match.surah.name_simple;
        const verseKey = match.verse_key;
        const arabicText = match.text;
        const translationText = match.translations[0].text; // Assuming first translation is Indonesian

        ayat.innerHTML = `
          <p><strong>${surahName} (${verseKey})</strong></p>
          <p class="arabic-text">${arabicText}</p>
          <p><em>Terjemahan:</em> ${translationText}</p>
        `;
        resultsDiv.appendChild(ayat);
      });
    })
    .catch(err => {
      resultsDiv.innerHTML = "Terjadi kesalahan saat mencari.";
      console.error(err);
      
    });
}
// ... existing code ...

function loadSurah(surahNumber) {
  // Fetch the surah with Indonesian translation, which also contains the Arabic text
  fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/id.indonesian`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("surah-title").innerText = `${data.data.name} - ${data.data.englishName}`;
      const ayatList = document.getElementById("ayat-list");
      ayatList.innerHTML = "";

      // Store ayah numbers for autoplay
      currentSurahAyahs = data.data.ayahs.map(ayah => ayah.number);

      data.data.ayahs.forEach(ayah => {
        const ayatDiv = document.createElement("div");
        ayatDiv.classList.add("ayat");
        ayatDiv.setAttribute("data-ayah-number", ayah.number);

        // FIX: Displaying the Arabic text (ayah.text) with the proper class.
        // It was already present in the API response but needed the .arabic-text class.
        // Note: The ayah.text here is the Arabic Uthmani text.
        ayatDiv.innerHTML = `
          <p class="arabic-text">${ayah.text} <small>(${ayah.numberInSurah})</small></p>
          <p><em>Terjemahan:</em> ${ayah.translation}</p>
          <button onclick="playAudio(${ayah.number})">🔊 Putar Audio</button>
          <button onclick="bookmarkAyat(${ayah.number})">⭐ Simpan Ayat</button>
        `;

        ayatList.appendChild(ayatDiv);
      });

      // Load Tafsir is moved to be called after the ayats are rendered
      loadTafsir(surahNumber); 
    });
}

// ... rest of script.js remains the same ...
