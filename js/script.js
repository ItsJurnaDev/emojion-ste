// Mengambil elemen dari id
const contentContainer = document.getElementById('content');

// menyimpan url rest api kedalam API_URL
const API_URL = 'https://emojion-ste.netlify.app/emotion.json';

// Array penampung quotes
let quotesData = [];

// Penanda indeks data quotes yang sedang aktif dan ditampilkan
let currentIndex = 0;

// Fungsi untuk fetch dari API_URL 
async function fetchQuotes() {
    try {
        // Mengirim permintaan (request) HTTP ke URL API
        const response = await fetch(API_URL);
        
        // Memeriksa status response HTTP; jika gagal (contoh: 404/500), lempar error ke catch
        if (!response.ok) throw new Error('Gagal mengambil data');

        // Mengubah response format JSON menjadi array JavaScript
        quotesData = await response.json();

        // Pastikan array quotesData tidak kosong sebelum menjalankan tampilan
        if (quotesData.length > 0) {
            // Tampilkan 3 kartu quote pertama ke layar
            renderCards();
            
            // ngeset agar card quotes berganti setiap 5 detik (5000ms)
            setInterval(rotateQuotes, 5000);
        }
    } catch (error) {
        // Jika terjadi kegagalan fetch/network:
        // 1. Bersihkan dulu isi container
        contentContainer.replaceChildren();
        
        // 2. Buat elemen paragraf untuk menampilkan pesan error ke pengguna
        const errPara = document.createElement('p');
        errPara.style.textAlign = 'center';
        errPara.style.gridColumn = '1/-1'; // Agar pesan error mengambil lebar penuh (jika pakai CSS Grid)
        errPara.textContent = 'Gagal memuat data.';
        
        // 3. Masukkan paragraf error ke container dan catat detail error di console browser
        contentContainer.appendChild(errPara);
        console.error(error);
    }
}

// Render 3 kartu quote sekaligus ke dalam container
function renderCards() {
    // membersihkan isi container
    contentContainer.replaceChildren();

    // Loop sebanyak 3 kali untuk menampilkan 3 buah kartu sekaligus
    for (let i = 0; i < 3; i++) {
        // Rumus modulo (%) digunakan agar indeks memutar kembali ke 0 jika melebihi panjang array (infinite loop)
        const dataIndex = (currentIndex + i) % quotesData.length;
        const item = quotesData[dataIndex];

        //(<div class="card-quotes">)
        const card = document.createElement('div');
        card.className = 'card-quotes';

        // Cek fallback gambar: gunakan image_url jika ada & tidak kosong, jika kosong gunakan gambar default lokal
        const imageSrc = item.image_url && item.image_url.trim() !== ""
            ? item.image_url
            : 'assets/images/unknow-quote.jpg';

        // Buat elemen <img>
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = item.author || '';

        // Buat elemen <blockquote> untuk teks quote
        const blockquote = document.createElement('blockquote');
        blockquote.textContent = `"${item.quote}"`;

        // Buat elemen <cite> untuk pembuat quote/author
        const cite = document.createElement('cite');
        cite.textContent = item.author;

        // Memasukkan elemen child (img, blockquote, cite) ke dalam card
        card.appendChild(img);
        card.appendChild(blockquote);
        card.appendChild(cite);

        // Masukkan kartu yang sudah jadi ke dalam container utama di DOM
        contentContainer.appendChild(card);
    }
}


// Memutar quotes setiap 5 detik dengan menambah currentIndex sebanyak 3 untuk 3 kartu sekaligus
function rotateQuotes() {
    // Rumus agar indeks tetap dalam rentang. Menggunakan modulus agar indeks tetap aman di dalam rentang array
    currentIndex = (currentIndex + 3) % quotesData.length;
    
    // Gambar ulang kartu dengan indeks data yang baru
    renderCards();
}

// Eksekusi pemanggilan data pertama kali saat skrip dimuat
fetchQuotes();

// Hamburger
// Menunggu hingga dokumen HTML selesai dimuat sepenuhnya
document.addEventListener('DOMContentLoaded', () => {

    // Ambil elemen tombol hamburger dan menu navigasi
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');

    // Pastikan kedua elemen ada di HTML sebelum memasang event listener
    if (hamburgerBtn && navMenu) {
        // Event saat tombol hamburger diklik: toggle class 'active' untuk membuka/menutup menu
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Event saat salah satu link navigasi diklik: otomatis menutup menu hamburger
        document.querySelectorAll('header nav a').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
});