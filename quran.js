// quran.js
const surahSelect = document.getElementById("surahSelect");
const loadBtn = document.getElementById("loadBtn");
const content = document.getElementById("content");
const surahTitle = document.getElementById("surahTitle");
const surahMeta = document.getElementById("surahMeta");
const playSurah = document.getElementById("playSurah");
const pauseSurah = document.getElementById("pauseSurah");
const surahAudio = document.getElementById("surahAudio");

const API_BASE = "https://api.quran.gading.dev/surah";

// --- muat daftar surah ---
async function loadSurahList() {
  const res = await fetch(API_BASE);
  const data = await res.json();
  surahSelect.innerHTML = data.data
    .map(
      (s) =>
        `<option value="${s.number}">${s.number}. ${s.name.transliteration.id} — ${s.name.translation.id}</option>`
    )
    .join("");
}

loadSurahList();

// --- tampilkan isi surah + terjemahan ---
loadBtn.addEventListener("click", async () => {
  const id = surahSelect.value;
  if (!id) return;

  const res = await fetch(`${API_BASE}/${id}`);
  const data = await res.json();
  const surah = data.data;

  surahTitle.textContent = `${surah.name.transliteration.id}`;
  surahMeta.textContent = `${surah.revelation.id} — ${surah.numberOfVerses} ayat`;

  // tampilkan ayat & terjemahan
  content.innerHTML = surah.verses
  .map(
    (v) => `
      <div class="ayah">
        <div class="arab">${v.text.arab}</div>
        <div class="translation">
          ${v.translation?.id || v.translation?.en || "(terjemahan tidak tersedia)"}
        </div>
        <div class="ayah-controls small">Ayat ${v.number.inSurah}</div>
      </div>
    `
  )
  .join("");


  // audio surah
  surahAudio.src = surah.preBismillah
    ? surah.preBismillah.audio.primary
    : surah.verses[0].audio.primary;
});

playSurah.addEventListener("click", () => surahAudio.play());
pauseSurah.addEventListener("click", () => surahAudio.pause());
