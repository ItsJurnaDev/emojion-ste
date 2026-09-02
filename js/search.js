document.addEventListener('DOMContentLoaded', () => {
    const searchResultsContainer = document.querySelector('.search-results');
    const searchInput = document.querySelector('.input-box input');
    const searchButton = document.querySelector('.input-box .button');

    // Elemen Modal Detail (Disesuaikan dengan ID pada HTML)
    const modal = document.getElementById('detail-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalName = document.getElementById('modal-name');
    const modalCategory = document.getElementById('modal-category');
    const modalDate = document.getElementById('modal-date');
    const modalMessage = document.getElementById('modal-message');

    // Elemen Player Custom di Modal (Disesuaikan dengan ID pada HTML)
    const modalMusicCard = document.getElementById('modal-music-card');
    const modalCover = document.getElementById('modal-cover');
    const modalTrack = document.getElementById('modal-track');
    const modalArtist = document.getElementById('modal-artist');
    const modalBtnPlay = document.getElementById('modal-btn-play');
    const modalAudio = document.getElementById('modal-audio');
    const modalCurrentTime = document.getElementById('modal-current-time');
    const modalDuration = document.getElementById('modal-duration');
    const modalProgressBarFill = document.getElementById('modal-progress-bar-fill');
    const modalProgressBarContainer = document.getElementById('modal-progress-bar-container');

    // Mapping kategori ke label bahasa Indonesia dan warna
    const categoryMap = {
        happy: 'Senang',
        sad: 'Sedih',
        love: 'Jatuh Cinta',
        angry: 'Kesal',
        surprised: 'Kaget'
    };
    const colorMap = {
        happy: { bg: '#FFF9E6', text: '#D97706', border: '#FDE68A' },
        sad: { bg: '#EBF8FF', text: '#2B6CB0', border: '#BEE3F8' },
        love: { bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE8' },
        angry: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
        surprised: { bg: '#F3E8FF', text: '#7E22CE', border: '#DDD6FE' }
    };

    // Fungsi untuk mendapatkan nama kategori 
    function getCategoryName(categoryKey) {
        if (!categoryKey) return 'Pesan';
        return categoryMap[categoryKey.toLowerCase()] || categoryKey;
    }

    // Fungsi untuk memasukkan warna kategori ke elemen badge
    function applyCategoryStyle(element, categoryKey) {
        const keyLower = (categoryKey || '').toLowerCase();
        const colorConfig = colorMap[keyLower];

        if (colorConfig) {
            element.style.backgroundColor = colorConfig.bg;
            element.style.color = colorConfig.text;
            element.style.borderColor = colorConfig.border;
            element.style.borderStyle = 'solid';
            element.style.borderWidth = '1px';
        } else {
            element.style.backgroundColor = '#F3F4F6';
            element.style.color = '#4B5563';
            element.style.borderColor = '#E5E7EB';
            element.style.borderStyle = 'solid';
            element.style.borderWidth = '1px';
        }
    }

    // Format Detik ke M:SS
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Reset Player State
    function resetAudioPlayer() {
        if (modalAudio) {
            modalAudio.pause();
            modalAudio.currentTime = 0;
        }
        if (modalBtnPlay) modalBtnPlay.textContent = '▶';
        if (modalProgressBarFill) modalProgressBarFill.style.width = '0%';
        if (modalCurrentTime) modalCurrentTime.textContent = '0:00';
    }

    // Toggle Play/Pause
    if (modalBtnPlay) {
        modalBtnPlay.addEventListener('click', () => {
            if (modalAudio.paused) {
                modalAudio.play().then(() => {
                    modalBtnPlay.textContent = '❚❚';
                }).catch(err => console.warn("Autoplay terhalang:", err));
            } else {
                modalAudio.pause();
                modalBtnPlay.textContent = '▶';
            }
        });
    }

    // Update Progress Bar
    if (modalAudio) {
        modalAudio.addEventListener('timeupdate', () => {
            if (modalAudio.duration) {
                const progressPercent = (modalAudio.currentTime / modalAudio.duration) * 100;
                if (modalProgressBarFill) modalProgressBarFill.style.width = `${progressPercent}%`;
                if (modalCurrentTime) modalCurrentTime.textContent = formatTime(modalAudio.currentTime);
            }
        });

        // Durasi audio
        modalAudio.addEventListener('loadedmetadata', () => {
            if (modalDuration) modalDuration.textContent = formatTime(modalAudio.duration);
        });

        // Reset Player saat audio selesai
        modalAudio.addEventListener('ended', () => {
            if (modalBtnPlay) modalBtnPlay.textContent = '▶';
            if (modalProgressBarFill) modalProgressBarFill.style.width = '0%';
            if (modalCurrentTime) modalCurrentTime.textContent = '0:00';
        });
    }

    // Memilih waktu audio dengan klik progress bar
    if (modalProgressBarContainer) {
        modalProgressBarContainer.addEventListener('click', (e) => {
            if (!modalAudio || !modalAudio.duration) return;
            const rect = modalProgressBarContainer.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            const newTime = (clickX / width) * modalAudio.duration;
            modalAudio.currentTime = newTime;
        });
    }

    // Fungsi untuk membuka modal detail
    function openDetailModal(item) {
        resetAudioPlayer();

        if (modalName) modalName.textContent = item.name || 'Anonim';
        if (modalCategory) {
            modalCategory.textContent = getCategoryName(item.category);
            applyCategoryStyle(modalCategory, item.category);
        }
        if (modalDate) modalDate.textContent = item.createdAt || '';
        if (modalMessage) modalMessage.textContent = item.message || '';

        if (item.musicCover || item.trackName) {
            if (modalMusicCard) modalMusicCard.style.display = 'block';
            if (modalCover) modalCover.src = item.musicCover || '../assets/images/itunes.png';
            if (modalTrack) modalTrack.textContent = item.trackName || 'Lagu Tidak Diketahui';
            if (modalArtist) modalArtist.textContent = item.artistName || 'Artis Tidak Diketahui';

            if (item.previewUrl && modalAudio) {
                modalAudio.src = item.previewUrl;
                if (modalBtnPlay) modalBtnPlay.style.display = 'flex';

                modalAudio.play().then(() => {
                    if (modalBtnPlay) modalBtnPlay.textContent = '❚❚';
                }).catch(err => {
                    console.warn("Autoplay terhalang kebijakan browser:", err);
                    if (modalBtnPlay) modalBtnPlay.textContent = '▶';
                });
            } else {
                if (modalAudio) modalAudio.src = '';
                if (modalBtnPlay) modalBtnPlay.style.display = 'none';
            }
        } else {
            if (modalMusicCard) modalMusicCard.style.display = 'none';
        }

        if (modal) modal.classList.add('active');
    }

    // Close Modal
    function closeModal() {
        if (modal) modal.classList.remove('active');
        resetAudioPlayer();
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    // Data Fetch & Rendering
    const storedData = localStorage.getItem('sendSongData');
    const allMessages = storedData ? JSON.parse(storedData) : [];

    const ITEMS_PER_PAGE = 6;
    let currentFilteredMessages = [];
    let displayedCount = 0;
    let isSearching = false;

    // Fungsi membuat elemen kartu result dari search
    function createCardElement(item) {
        const cardResult = document.createElement('div');
        cardResult.className = 'card-result';

        const cardTop = document.createElement('div');
        cardTop.className = 'card-top';

        const cardMeta = document.createElement('div');
        cardMeta.className = 'card-meta';

        const recipientPill = document.createElement('div');
        recipientPill.className = 'recipient-pill';
        recipientPill.textContent = 'To: ';
        const nameSpan = document.createElement('span');
        nameSpan.textContent = item.name || 'Anonim';
        recipientPill.appendChild(nameSpan);

        const categorySpan = document.createElement('span');
        categorySpan.className = 'category';
        categorySpan.textContent = getCategoryName(item.category);
        applyCategoryStyle(categorySpan, item.category);

        cardMeta.append(recipientPill, categorySpan);

        const messageText = document.createElement('p');
        messageText.className = 'message-text';
        messageText.textContent = item.message || '';

        cardTop.append(cardMeta, messageText);

        const musicPart = document.createElement('div');
        musicPart.className = 'music-part';

        const musicLeft = document.createElement('div');
        musicLeft.className = 'music-left';

        const coverImg = document.createElement('img');
        coverImg.className = 'cover-img';
        coverImg.src = item.musicCover || '../assets/images/itunes.png';
        coverImg.alt = 'Album Cover';

        const trackInfo = document.createElement('div');
        trackInfo.className = 'track-info';

        const trackTitle = document.createElement('h4');
        trackTitle.className = 'track-title';
        trackTitle.textContent = item.trackName || 'Lagu Tidak Diketahui';

        const artistName = document.createElement('p');
        artistName.className = 'artist-name';
        artistName.textContent = item.artistName || 'Artis Tidak Diketahui';

        trackInfo.append(trackTitle, artistName);
        musicLeft.append(coverImg, trackInfo);

        const musicRight = document.createElement('div');
        musicRight.className = 'music-right';
        const itunesLogo = document.createElement('img');
        itunesLogo.className = 'itunes-logo';
        itunesLogo.src = '../assets/images/itunes.png';
        itunesLogo.alt = 'iTunes Logo';
        musicRight.appendChild(itunesLogo);

        musicPart.append(musicLeft, musicRight);
        cardResult.append(cardTop, musicPart);

        cardResult.addEventListener('click', () => openDetailModal(item));

        return cardResult;
    }

    // Render data search
    function renderNextBatch() {
        if (!isSearching || !searchResultsContainer) return;
        const nextBatch = currentFilteredMessages.slice(displayedCount, displayedCount + ITEMS_PER_PAGE);
        nextBatch.forEach(item => {
            searchResultsContainer.appendChild(createCardElement(item));
        });
        displayedCount += nextBatch.length;
    }

    // fungsi untuk menampilkan pesan berdasarkan nama
    function initSearchResults(filteredData) {
        isSearching = true;
        currentFilteredMessages = filteredData;
        displayedCount = 0;
        if (searchResultsContainer) searchResultsContainer.replaceChildren();

        if (currentFilteredMessages.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.style.cssText = 'grid-column: 1/-1; text-align: center; color: #888; padding: 20px;';
            emptyMsg.textContent = 'Pesan tidak ditemukan.';
            if (searchResultsContainer) searchResultsContainer.appendChild(emptyMsg);
            return;
        }
        renderNextBatch();
    }

    // Fungsi untuk menangani pencarian
    function handleSearch() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

        if (!query) {
            isSearching = false;
            currentFilteredMessages = [];
            displayedCount = 0;
            if (searchResultsContainer) searchResultsContainer.replaceChildren();
            return;
        }

        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(`\\b${escapedQuery}\\b`, 'i');

        const filtered = allMessages.filter(item => {
            const nameMatch = searchRegex.test(item.name || '');
            const messageMatch = searchRegex.test(item.message || '');
            return nameMatch || messageMatch;
        });

        initSearchResults([...filtered].reverse());
    }

    // Scroll Event untuk menambahkan data saat scroll ke bawah
    window.addEventListener('scroll', () => {
        if (!isSearching) return;
        if (displayedCount < currentFilteredMessages.length) {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                renderNextBatch();
            }
        }
    });

    // Event Listener untuk tombol search dan enter key
    if (searchButton) searchButton.addEventListener('click', handleSearch);
    if (searchInput) {
        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSearch();
            }
        });
    }
});