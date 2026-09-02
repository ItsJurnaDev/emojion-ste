// memuat seluruh struktur DOM (HTML) sebelum menjalankan skrip
document.addEventListener('DOMContentLoaded', () => {
    // Mengambil elemen dari id trendingTableBody
    const trendingTableBody = document.getElementById('trending-table-body');
    
    // Jika tabel tidak ditemukan di halaman ini, batalkan eksekusi
    if (!trendingTableBody) return;

    // menyiapkan audio player utama untuk memutar preview lagu
    const globalAudio = new Audio();

    // Menyimpan referensi ke tombol play yang sedang aktif diputar
    let currentPlayingBtn = null;

    // Hentikan audio jika pengguna meninggalkan/refresh halaman
    window.addEventListener('beforeunload', () => {
        globalAudio.pause();
    });

    // Ambil data pesan dari localStorage dan konversi dari JSON string ke Array
    const storedData = localStorage.getItem('sendSongData');
    const allMessages = storedData ? JSON.parse(storedData) : [];

    // mapping categori bahasa inggris dengan indonesia
    const categoryMap = {
        happy: 'Senang',
        sad: 'Sedih',
        love: 'Jatuh Cinta',
        angry: 'Kesal',
        surprised: 'Kaget'
    };

    // Antisipasi bug, jika category tidak valid maka akan mengembalikan umum
    function getCategoryName(categoryKey) {
        if (!categoryKey) return 'Umum';
        return categoryMap[categoryKey.toLowerCase()] || categoryKey;
    }

    // Menghitung jumlah lagu yang sama berdasarkan judul & artis, lalu dikelompokkan untuk menentukan trending
    const songCounts = {};
    allMessages.forEach(item => {
        if (item.trackName) {
            //Membuat ID/Kunci unik dengan menggabungkan Judul + Penyanyi
            const key = `${item.trackName}_${item.artistName}`;
            if (!songCounts[key]) {
                // // Jika BELUM ADA, buat data awal untuk lagu tersebut
                songCounts[key] = {
                    trackName: item.trackName,
                    artistName: item.artistName || 'Artis Tidak Diketahui',
                    musicCover: item.musicCover || 'https://picsum.photos/100/100',
                    previewUrl: item.previewUrl || '',
                    category: item.category || 'happy',
                    count: 0
                };
            }
            // Tambahkan jumlah kemunculan lagu
            songCounts[key].count += 1;
        }
    });

    // Ubah objek menjadi Array lalu sroting berdasarkan jumlah terbanyak (trending)
    const trendingSongs = Object.values(songCounts).sort((a, b) => b.count - a.count);

    // Tampilkan tampilan khusus jika tidak ada data lagu di localStorage
    if (trendingSongs.length === 0) {
        trendingTableBody.replaceChildren(); // Bersihkan isi tabel

        const emptyTr = document.createElement('tr');
        const emptyTd = document.createElement('td');

        emptyTd.colSpan = 4;
        emptyTd.style.textAlign = 'center';
        emptyTd.style.color = '#94a3b8';
        emptyTd.style.padding = '24px';
        emptyTd.textContent = 'Belum ada lagu trending saat ini.';

        emptyTr.appendChild(emptyTd);
        trendingTableBody.appendChild(emptyTr);
        return;
    }

// Render table 
    let currentIndex = 0;       // Indeks data yang sudah diload
    const limitPerPage = 10;    // Limit per render
    let isLoading = false;       // Flag pencegah request ganda saat scrolling

    trendingTableBody.replaceChildren(); // Kosongkan elemen tabel sebelum diisi

    // Fungsi utama melakukan render lagu selanjutnya saat scroll mentok
    function loadNextBatch() {
        // Hentikan jika sedang loading atau seluruh data lagu sudah habis dirender
        if (isLoading || currentIndex >= trendingSongs.length) return;

        isLoading = true;
        // Ambil porsi data lagu berikutnya sebanyak limitPerPage (10 item)
        const nextBatch = trendingSongs.slice(currentIndex, currentIndex + limitPerPage);

        // Render setiap lagu dari localStorage yang udah dikelompokkan ke dalam tabel
        nextBatch.forEach((song, i) => {
            
            // membuat element tr dengan class trending-row
            const tr = document.createElement('tr');
            tr.className = 'trending-row';

            // Membuat elemen td untuk setiap kolom: Nomor, Judul & Artis, Album, Kategori
            const songIndex = currentIndex + i + 1;
            const safeCategory = (song.category || 'happy').toLowerCase();
            const catName = getCategoryName(song.category);
            const catClass = `cat-${safeCategory}`;

            // --- Kolom 1: Nomor Urut ---
            const tdNum = document.createElement('td');
            tdNum.className = 'col-num';
            tdNum.textContent = songIndex;

            // --- Kolom 2: Judul Lagu, Artis, Cover & Tombol Play ---
            const tdTitle = document.createElement('td');
            tdTitle.className = 'col-title';
            const songInfoCell = document.createElement('div');
            songInfoCell.className = 'song-info-cell';

            // Pembungkus gambar cover & tombol play
            const coverWrapper = document.createElement('div');
            coverWrapper.className = 'cover-wrapper';

            const imgCover = document.createElement('img');
            imgCover.src = song.musicCover;
            imgCover.alt = 'Cover';
            imgCover.className = 'trending-cover';

            const btnPlay = document.createElement('button');
            btnPlay.className = 'cover-play-btn';
            btnPlay.title = 'Play Preview';
            btnPlay.textContent = '▶';

            coverWrapper.appendChild(imgCover);
            coverWrapper.appendChild(btnPlay);

            // Pembungkus teks info lagu (Judul, Artist, Badge Kategori Mobile)
            const songText = document.createElement('div');
            songText.className = 'song-text';

            const spanTitle = document.createElement('span');
            spanTitle.className = 'song-title';
            spanTitle.textContent = song.trackName;

            const spanArtist = document.createElement('span');
            spanArtist.className = 'song-artist';
            spanArtist.textContent = song.artistName;

            // Badge kategori untuk tampilan layar HP/Mobile
            const songCatMobile = document.createElement('div');
            songCatMobile.className = 'song-category-mobile';

            const badgeMobile = document.createElement('span');
            badgeMobile.className = `badge-category ${catClass}`;
            badgeMobile.textContent = catName;
            // Mobil sampai sini /\

            // Gabungkan seluruh elemen child ke dalam kolom 
            songCatMobile.appendChild(badgeMobile);
            songText.appendChild(spanTitle);
            songText.appendChild(spanArtist);
            songText.appendChild(songCatMobile);

            songInfoCell.appendChild(coverWrapper);
            songInfoCell.appendChild(songText);
            tdTitle.appendChild(songInfoCell);

            // --- Kolom 3: Nama Album / Detail ---
            const tdAlbum = document.createElement('td');
            tdAlbum.className = 'col-album';
            tdAlbum.textContent = song.trackName;

            // --- Kolom 4: Badge Kategori (Tampilan Desktop) ---
            const tdCategory = document.createElement('td');
            tdCategory.className = 'col-category';

            const badgeDesktop = document.createElement('span');
            badgeDesktop.className = `badge-category ${catClass}`;
            badgeDesktop.textContent = catName;

            tdCategory.appendChild(badgeDesktop);

            // Gabungkan seluruh sel (<td>) ke dalam baris (<tr>)
            tr.appendChild(tdNum);
            tr.appendChild(tdTitle);
            tr.appendChild(tdAlbum);
            tr.appendChild(tdCategory);

            // memasukkan event listener untuk tombol play preview lagu
            btnPlay.addEventListener('click', (event) => {
                // Hentikan bubble event agar klik pada tombol tidak memicu klik pada <tr> (redirect)
                event.stopPropagation();

                // Cek ketersediaan URL audio preview
                if (!song.previewUrl) {
                    alert('Preview lagu tidak tersedia.');
                    return;
                }

                // Jika audio lagu ini sedang menyala, pause audio tersebut
                if (globalAudio.src === song.previewUrl && !globalAudio.paused) {
                    globalAudio.pause();
                    btnPlay.textContent = '▶';
                    btnPlay.classList.remove('playing');
                } else {
                    // Jika lagu lain sedang menyala, kembalikan ikon tombol sebelumnya ke 'Play'
                    if (currentPlayingBtn) {
                        currentPlayingBtn.textContent = '▶';
                        currentPlayingBtn.classList.remove('playing');
                    }

                    // Setel sumber audio baru dan jalankan pemutaran
                    globalAudio.src = song.previewUrl;
                    globalAudio.play().catch(err => {
                        console.warn('Playback terhalang browser policy:', err);
                        btnPlay.textContent = '▶';
                        btnPlay.classList.remove('playing');
                    });

                    // Ubah UI tombol menjadi ikon 'Pause'
                    btnPlay.textContent = '❚❚';
                    btnPlay.classList.add('playing');
                    currentPlayingBtn = btnPlay; // Simpan referensi tombol yang aktif
                }
            });

            // Event listener saat durasi audio preview habis diputar
            globalAudio.addEventListener('ended', () => {
                if (currentPlayingBtn) {
                    currentPlayingBtn.textContent = '▶';
                    currentPlayingBtn.classList.remove('playing');
                }
            });

            // Event listener untuk klik pada baris <tr> agar redirect ke halaman kirim pesan
            tr.addEventListener('click', () => {
                // Hentikan pemutaran lagu jika ada yang menyala
                globalAudio.pause();

                // Simpan data lagu yang dipilih ke localStorage untuk dipakai di halaman kirim pesan
                const selectedMusicData = {
                    trackName: song.trackName,
                    artistName: song.artistName,
                    musicCover: song.musicCover,
                    previewUrl: song.previewUrl
                };
                localStorage.setItem('tempSelectedMusic', JSON.stringify(selectedMusicData));

                // Pindah (redirect) ke halaman form kirim pesan
                window.location.href = '../pages/send-message.html';
            });

            // Masukkan baris ke dalam elemen <tbody>
            trendingTableBody.appendChild(tr);
        });

        // Perbarui indeks penunjuk untuk pemanggilan batch berikutnya
        currentIndex += nextBatch.length;
        isLoading = false;
    }

    // Panggil render batch pertama kali (10 lagu awal)
    loadNextBatch();

    // Event listener untuk infinite scroll
    window.addEventListener('scroll', () => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold = document.documentElement.offsetHeight - 150; // Ambang batas jarak bawah layar

        // Jika posisi scroll sudah mendekati batas bawah halaman, panggil batch data berikutnya
        if (scrollPosition >= threshold) {
            loadNextBatch();
        }
    });
});