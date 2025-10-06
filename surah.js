fetch('https://equran.id/api/surat')
  .then(response => response.json())
  .then(data => {
    const list = document.getElementById('surah-list');
    data.forEach(surah => {
      const item = document.createElement('li');
      item.innerHTML = `<a href="surah-${surah.nomor}.html">${surah.nomor}. ${surah.nama_latin} (${surah.jumlah_ayat} ayat)</a>`;
      list.appendChild(item);
    });
  });

