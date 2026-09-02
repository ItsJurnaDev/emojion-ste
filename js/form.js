// Variable global untuk menyimpan timer debounce dan data lagu yang dipilih
let debounceTimer;
let selectedSongData = null;

// Mengambil elemen form dan submit dari id
const form = document.getElementById("send-song-form");
const btnSubmit = document.querySelector(".btn-submit");

// Mengambil elemen-elemen Input dan List Pencarian Musik
const musicInput = document.getElementById("music");
const musicList = document.getElementById("music-list");

// Mengambil elemen-elemen Audio Player dan Pengontrol Tampilan
const audioPlayer = document.getElementById("audio-preview");
const btnPlay = document.getElementById("btn-play");
const btnCancel = document.getElementById("btn-cancel");

// Mengambil elemen-elemen Progress Bar dan Card Lagu
const progressBarContainer = document.getElementById("progress-bar-container");
const progressBarFill = document.getElementById("progress-bar-fill");
const currentTimeText = document.getElementById("current-time-text");
const durationText = document.getElementById("duration-text");
const selectedMusicCard = document.getElementById("selected-music-card");

// Fungsi untuk menampilkan modal pop-up
function showModal(title, message, callback = null) {
const modal = document.getElementById("custom-modal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const btnClose = document.getElementById("modal-btn-close");

if (!modal) return;

modalTitle.textContent = title;
modalMessage.textContent = message;
modal.style.display = "flex";

btnClose.onclick = () => {
    modal.style.display = "none";
    if (callback) callback();
};

}

// Cek kelengkapan seluruh form
function validateFormState() {
// Ambil nilai input dari form, trim untuk menghapus spasi di awal/akhir
const nameVal = document.getElementById("form-name") ? document.getElementById("form-name").value.trim() : "";
// Ambil nilai kategori dan pesan
const categoryVal = document.getElementById("category") ? document.getElementById("category").value : "";
// Ambil nilai pesan
const messageVal = document.getElementById("message") ? document.getElementById("message").value.trim() : "";

// Tombol submit hanya aktif jika SEMUA terisi dan lagu sudah dipilih
if (nameVal !== "" && categoryVal !== "" && messageVal !== "" && selectedSongData !== null) {
    btnSubmit.disabled = false;
} else {
    btnSubmit.disabled = true;
}

}

// Mengecek input saat diisi
document.querySelectorAll(".form-card input, .form-card select, .form-card textarea")
// Loop melalui setiap elemen input, select, dan textarea di dalam form-card
.forEach(element => {

    element.addEventListener("input", () => {
        checkInput(element);
        validateFormState();
    });

    element.addEventListener("change", () => {
        checkInput(element);
        validateFormState();
    });
});

// Mengatur class filled
function checkInput(element) {

if (element.value.trim() !== "") {

    // Jika berisi, tambahkan class filled
    element.classList.add("filled");

} else {

    // Jika kosong, hapus class filled
    element.classList.remove("filled");
}

}

// Saat user mengetik nama lagu
musicInput.addEventListener("input", () => {
// Hentikan pencarian sebelumnya
clearTimeout(debounceTimer);

// Ambil kata kunci dari input musik, trim untuk menghapus spasi di awal/akhir
const keyword = musicInput.value.trim();

// Jika input kosong
if (!keyword) {
    musicList.style.display = "none";
    musicList.replaceChildren();
    return;
}

// Tunggu 300ms sebelum mencari
debounceTimer = setTimeout(() => {
    searchMusic(keyword);
}, 300);

});

// Mencari lagu melalui iTunes API
async function searchMusic(keyword) {
try {
// fetch data dari iTunes API
const response = await fetch(
`https://itunes.apple.com/search?term=${encodeURIComponent(keyword)}&entity=song&limit=10`
);

    // Mengubah response menjadi JSON
    const data = await response.json();

    // Hapus hasil pencarian sebelumnya
    musicList.replaceChildren();

    // Jika lagu tidak ditemukan
    if (data.results.length === 0) {
        // Menampilkan lagu tidak ditemukan
        const empty =
            document.createElement("div");

        empty.className =
            "music-item-empty";

        empty.textContent =
            "Lagu tidak ditemukan";

        musicList.appendChild(empty);

    } else {
        // Menampilkan hasil lagu
        data.results.forEach(song => {
            createMusicItem(song);
        });
    }
    // Tampilkan daftar lagu
    musicList.style.display = "block";


} catch (error) {
    // Menampilkan error jika fetch gagal
    console.error(
        "Gagal mengambil data iTunes:",
        error
    );
}

}

// Membuat tampilan setiap lagu
function createMusicItem(song) {
const item = document.createElement("div");
const cover = document.createElement("img");
const info = document.createElement("div");
const title = document.createElement("span");
const artist = document.createElement("span");

const artworkUrl = song.artworkUrl100 || song.artworkUrl60;

// Class item lagu
item.className = "music-item";

// Cover lagu
cover.src = artworkUrl;
cover.alt = "Cover";
cover.className = "music-cover";

// Informasi lagu
info.className = "music-info";

// Judul lagu
title.className = "track-title";
title.textContent = song.trackName;

// Nama penyanyi
artist.className = "artist-name";
artist.textContent = song.artistName;

// Gabungkan elemen
info.append(title, artist);
item.append(cover, info);


// Saat lagu diklik
item.addEventListener("click", () => {
    selectMusic(
        song.trackName,
        song.artistName,
        artworkUrl,
        song.previewUrl
    );
});
// Masukkan ke daftar
musicList.appendChild(item);

}

// Memilih lagu
function selectMusic(
title,
artist,
cover,
preview
) {

// Simpan data lagu yang dipilih
selectedSongData = {
    title: title,
    artist: artist,
    cover: cover,
    previewUrl: preview,
    fullTitle:
        `${title} - ${artist}`
};

// Masukkan preview lagu
audioPlayer.src =
    preview || "";

// Tampilkan tombol play jika ada preview
if (preview) {
    btnPlay.style.display = "flex";
} else {
    btnPlay.style.display = "none";
}

btnPlay.textContent = "▶";

// Tampilkan informasi lagu
document.getElementById("selected-cover").src = cover;
document.getElementById("selected-title").textContent = title;
document.getElementById("selected-artist").textContent = artist;

// Reset audio
resetPlayerUI();

// Sembunyikan input pencarian
musicInput.style.display = "none";

musicList.style.display = "none";

// Tampilkan card lagu
selectedMusicCard.style.display = "flex";

// Tombol
validateFormState();

}

// Audio Player Control
// Tombol Play / Pause
btnPlay.addEventListener("click", toggleAudio);

// Fungsi untuk mengontrol pemutaran audio
function toggleAudio() {
// Jika tidak ada lagu fungsi akan return
if (!audioPlayer.src) {
return;
}

// Display tombol audio
// Jika audio sedang berhenti
if (audioPlayer.paused) {
    audioPlayer.play();
    btnPlay.textContent = "❚❚";
} else {
    // Jika audio sedang berjalan
    audioPlayer.pause();
    btnPlay.textContent =
        "▶";
}

}

// Progress audio
audioPlayer.addEventListener("timeupdate", () => {
// Jika durasi audio tidak tersedia, hentikan fungsi
if (!audioPlayer.duration) {
return;
}

const current = audioPlayer.currentTime;
const total = audioPlayer.duration;

// Hitung persentase progress
const percentage = (current / total) * 100;

// Ubah progress bar
progressBarFill.style.width = `${percentage}%`;

// Tampilkan waktu
currentTimeText.textContent =
    formatTime(current);

durationText.textContent =
    formatTime(total);

}
);

// Klik progress bar
progressBarContainer.addEventListener("click", event => {
if (!audioPlayer.duration) {
return;
}

// Dapatkan posisi klik relatif terhadap progress bar
const rect = progressBarContainer.getBoundingClientRect();
// Hitung posisi klik relatif terhadap progress bar
const clickPosition = event.clientX - rect.left;
// Hitung persentase posisi klik terhadap lebar progress bar
const percentage = clickPosition / rect.width;

// Pindahkan posisi lagu
audioPlayer.currentTime = percentage * audioPlayer.duration;

}
);

// Ketika lagu selesai
audioPlayer.addEventListener("ended", () => {
btnPlay.textContent = "▶";

progressBarFill.style.width = "0%";

currentTimeText.textContent = "0:00";

}
);

// Mengubah detik menjadi menit:detik
function formatTime(seconds) {
const min = Math.floor(seconds / 60);
const sec = Math.floor(seconds % 60);
return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

// Reset tampilan audio
function resetPlayerUI() {
progressBarFill.style.width = "0%";
currentTimeText.textContent = "0:00";
durationText.textContent = "0:30";
}

// Tombol Cancel
btnCancel.addEventListener("click", cancelMusicSelection);

// Fungsi membatalkan pemilihan lagu
function cancelMusicSelection() {
// Hentikan audio
audioPlayer.pause();
audioPlayer.src = "";

// Hapus lagu yang dipilih
selectedSongData = null;

// Kembalikan input musik
musicInput.value = "";
musicInput.style.display = "block";

// Sembunyikan card lagu
selectedMusicCard.style.display = "none";

// Reset tombol
btnPlay.textContent = "▶";

// Reset progress
resetPlayerUI();

// Reset warna input
checkInput(musicInput);

// Re-evaluasi tombol Submit
validateFormState();

}

// Klik di luar music wrapper
document.addEventListener("click", event => {
// Jika klik bukan pada music wrapper, sembunyikan daftar lagu
if (!event.target.closest(
".music-container"
)) {
musicList.style.display = "none";
}
}
);

// Submit form
form.addEventListener("submit", event => {
// Mencegah form melakukan submit deault
event.preventDefault();

// mengambil elemen dari id
const nameInput = document.getElementById("form-name").value.trim();
const categoryInput = document.getElementById("category").value;
const messageInput = document.getElementById("message").value.trim();

// Jika ada input yang kosong atau lagu belum dipilih, tampilkan modal peringatan
if (!nameInput || !categoryInput || !messageInput || !selectedSongData) {
    showModal("Peringatan", "Harap isi semua data dan pilih lagu terlebih dahulu!");
    return;
}

// Membuat objek data form untuk disimpan ke LocalStorage
const formData = {
    id: Date.now(),
    name: nameInput,
    category: categoryInput,
    message: messageInput,

    // Data lagu
    music: selectedSongData.fullTitle,
    musicCover: selectedSongData.cover,
    previewUrl: selectedSongData.previewUrl,
    trackName: selectedSongData.title,
    artistName: selectedSongData.artist,

    // Waktu pengiriman
    createdAt: new Date().toLocaleString("id-ID")
};

saveToLocalStorage(formData);

// Tampilkan Modal Pop-Up dan jalankan redirect setelah user klik OK
showModal("Berhasil!", "Pesan berhasil disimpan!", () => {
    window.location.href = "../index.html";
});

});

// Fungsi untuk menyimpan data ke LocalStorage
function saveToLocalStorage(formData) {
// Ambil data yang sudah ada di LocalStorage, jika tidak ada buat array kosong
let existingData = [];

// Coba-catch untuk menangani kemungkinan error saat membaca LocalStorage
try {
    const rawData = localStorage.getItem("sendSongData");
    existingData = rawData ? JSON.parse(rawData) : [];
    if (!Array.isArray(existingData)) existingData = [];
}
// Jika terjadi error saat membaca LocalStorage, log error dan reset existingData menjadi array kosong
catch (e) {
    console.error("Gagal membaca LocalStorage, mereset array:", e);
    existingData = [];
}

// Tambahkan data form baru ke array existingData
existingData.push(formData);

// Simpan kembali ke LocalStorage
localStorage.setItem(
    "sendSongData",
    JSON.stringify(existingData)
);

}

// Saat halaman dimuat, cek apakah ada data lagu yang dipilih sebelumnya di LocalStorage
document.addEventListener("DOMContentLoaded", () => {
// data lagu tampungan dari local storage
const tempMusic = localStorage.getItem("tempSelectedMusic");

// Jika ada data lagu yang tersimpan, ambil dan set ke form
if (tempMusic) {
    try {
        const musicData = JSON.parse(tempMusic);

        // Jika data lagu valid, set ke form
        if (musicData && musicData.trackName && musicData.artistName) {
            selectMusic(
                musicData.trackName,
                musicData.artistName,
                musicData.musicCover,
                musicData.previewUrl
            );
        }
    } catch (error) {
        console.error("Gagal membaca tempSelectedMusic:", error);
    } finally {
        localStorage.removeItem("tempSelectedMusic");
    }
}

// Jalankan pengecekan awal saat halaman dimuat
validateFormState();

});
