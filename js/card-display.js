document.addEventListener('DOMContentLoaded', () => {
    // mengambil data dari local storage dengan nama data sendSongData
    const storedData = localStorage.getItem('sendSongData');
    const allMessages = storedData ? JSON.parse(storedData) : [];

    // mengambil elemen container untuk setiap kategori
    const categoryContainers = {
        "happy": document.getElementById('cat-senang'),
        "sad": document.getElementById('cat-sedih'),
        "love": document.getElementById('cat-jatuh-cinta'),
        "angry": document.getElementById('cat-kesal'),
        "surprised": document.getElementById('cat-kaget')
    };

    // Conversi label inggris ke bahasa indonesia untuk badge kategori
    const categoryLabels = {
        "happy": "Senang",
        "sad": "Sedih",
        "love": "Jatuh Cinta",
        "angry": "Kesal",
        "surprised": "Kaget"
    };

    // Mapping warna berdasarkan emosi
    const colorMap = {
        happy: { backgroundColor: '#FFF9E6', textColor: '#D97706', borderColor: '#FDE68A' },     
        sad: { backgroundColor: '#EBF8FF', textColor: '#2B6CB0', borderColor: '#BEE3F8' },       
        love: { backgroundColor: '#FDF2F8', textColor: '#DB2777', borderColor: '#FBCFE8' },    
        angry: { backgroundColor: '#FEF2F2', textColor: '#DC2626', borderColor: '#FECACA' },     
        surprised: { backgroundColor: '#F3E8FF', textColor: '#7E22CE', borderColor: '#DDD6FE' }  
    };

    // Fungsi untuk menerapkan warna kategori secara dinamis ke elemen badge
    function applyCategoryStyle(element, categoryKey) {
        const keyLower = (categoryKey || '').toLowerCase();
        const colorConfig = colorMap[keyLower];

        if (colorConfig) {
            element.style.backgroundColor = colorConfig.backgroundColor;
            element.style.color = colorConfig.textColor;
            element.style.borderColor = colorConfig.borderColor;
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

    // Fungsi membuat elemen kartu HTML berdasarkan kategori 
    function createCategoryCard(item) {
        const card = document.createElement('div');
        card.className = 'category';

        const badgeText = categoryLabels[item.category] || item.category || 'Pesan';

        // Container Atas
        const topContainer = document.createElement('div');
        const cardTopInfo = document.createElement('div');
        cardTopInfo.className = 'card-top-info';

        const pillTo = document.createElement('div');
        pillTo.className = 'pill-to';
        pillTo.textContent = 'To: ';
        const spanTo = document.createElement('span');
        spanTo.textContent = item.name || 'Anonim';
        pillTo.appendChild(spanTo);

        const badgeCat = document.createElement('span');
        badgeCat.className = 'badge-cat';
        badgeCat.textContent = badgeText;
        applyCategoryStyle(badgeCat, item.category);

        cardTopInfo.appendChild(pillTo);
        cardTopInfo.appendChild(badgeCat);

        const textMsg = document.createElement('p');
        textMsg.className = 'text-msg';
        textMsg.textContent = item.message || '';

        topContainer.appendChild(cardTopInfo);
        topContainer.appendChild(textMsg);

        // Music Box
        const musicBox = document.createElement('div');
        musicBox.className = 'music-box';

        const musicCover = document.createElement('img');
        musicCover.src = item.musicCover || '../assets/images/itunes.png';
        musicCover.alt = 'Cover';

        const musicInfo = document.createElement('div');
        musicInfo.className = 'music-info';

        const trackTitle = document.createElement('h5');
        trackTitle.textContent = item.trackName || 'Lagu Tidak Diketahui';

        const artistName = document.createElement('p');
        artistName.textContent = item.artistName || 'Artis Tidak Diketahui';

        musicInfo.appendChild(trackTitle);
        musicInfo.appendChild(artistName);

        musicBox.appendChild(musicCover);
        musicBox.appendChild(musicInfo);

        // Gabungkan ke kartu utama
        card.appendChild(topContainer);
        card.appendChild(musicBox);

        return card;
    }

    // Render & loop
    function renderRow(container, items) {
        if (!container || items.length === 0) return;
        container.replaceChildren();

        let baseItems = [...items];
        while (baseItems.length < 6) {
            baseItems = baseItems.concat(items);
        }

        // Buat array baru untuk menampilkan loop
        const seamlessItems = [...baseItems, ...baseItems];

        seamlessItems.forEach(item => {
            container.appendChild(createCategoryCard(item));
        });
    }

    // Filter dan Render untuk Setiap Kategori
    Object.keys(categoryContainers).forEach(catKey => {
        const container = categoryContainers[catKey];
        if (!container) return;

        const filtered = allMessages.filter(item => (item.category || '').toLowerCase() === catKey);

        renderRow(container, filtered);
    });
});