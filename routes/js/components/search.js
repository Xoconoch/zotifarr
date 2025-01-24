export function initSearch() {
    document.getElementById('searchForm').addEventListener('submit', handleSearch);
}

async function handleSearch(e) {
    e.preventDefault();
    const account = document.getElementById('accountSelect').value;
    const query = document.getElementById('searchQuery').value;
    
    if (!account || !query) return;

    const container = document.getElementById('resultsContainer');
    container.innerHTML = '<img src="https://i.imgur.com/VUjU03O.gif" alt="Loading..." class="loading-gif">';

    try {
        const response = await fetch(`/api/search?account=${encodeURIComponent(account)}&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error('Search failed:', error);
        container.innerHTML = '<div class="error">Search failed. Please try again.</div>';
    }
}

function displayResults(data) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';

    ['albums', 'tracks', 'playlists'].forEach(type => {
        if (data[type]?.length > 0) {
            const section = document.createElement('details');
            section.className = 'category';
            section.innerHTML = `
                <summary>${type.charAt(0).toUpperCase() + type.slice(1)} (${data[type].length})</summary>
                <div class="items-grid">
                    ${data[type].map(item => `
                        <div class="container-result">
                            ${createItemCard(item)}
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(section);
        }
    });
}

function createItemCard(item) {
    return `
        <div class="container-result">
            <div class="item-card" 
                 data-spotify-id="${item.spotify_id}" 
                 data-type="${item.type}"
                 data-total-tracks="${item.total_tracks || 0}">
                ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" class="item-image">` : ''}
                <div class="item-info">
                    <div>
                        <h3>${item.name}${item.explicit ? '<span class="explicit">E</span>' : ''}</h3>
                        ${item.artists ? `<p>Artists: ${item.artists.join(', ')}</p>` : ''}
                        ${item.owner ? `<p>Owner: ${item.owner}</p>` : ''}
                        ${item.total_tracks ? `<p>Total Tracks: ${item.total_tracks}</p>` : ''}
                    </div>
                    ${['album', 'track', 'playlist'].includes(item.type) ? `
                        <button class="download-btn">
                            <img src="https://brandeps.com/icon-download/D/Download-icon-vector-09.svg" 
                                 alt="Download" 
                                 width="20" 
                                 height="20">
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}
