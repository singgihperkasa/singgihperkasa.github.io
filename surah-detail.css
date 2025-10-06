fetch('https://equran.id/api/surat/1') // Surah Al-Fatihah
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('ayat-container');
    data.ayat.forEach(ayat => {
      const ayatDiv = document.createElement('div');
      ayatDiv.classList.add('ayat-block');
      ayatDiv.innerHTML = `
        <h3>Ayat ${ayat.nomor}</h3>
        <p class="arab">${ayat.ar}</p>
        <p class="latin">${ayat.tr}</p>
        <p class="terjemahan">${ayat.idn}</p>
        <audio controls src="${ayat.audio}"></audio>
        <hr />
      `;
      container.appendChild(ayatDiv);
    });
  });
      
