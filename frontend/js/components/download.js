export function initSearch() {
    document.getElementById('searchForm').addEventListener('submit', handleSearch);
}

async function handleSearch(e) {
    e.preventDefault();
    const account = document.getElementById('accountSelect').value;
    const query = document.getElementById('searchQuery').value;
    
    if (!account || !query) return;

    try {
        const response = await fetch(`/api/search?account=${encodeURIComponent(account)}&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error('Search failed:', error);
        document.getElementById('resultsContainer').innerHTML = '<div class="error">Search failed. Please try again.</div>';
    }
}

function displayResults(data) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';

    ['albums', 'tracks'].forEach(type => {
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
                ${['album', 'track'].includes(item.type) ? `
                    <button class="download-btn">
                        <img src="https://brandeps.com/icon-download/D/Download-icon-vector-09.svg" 
                             alt="Download" 
                             width="20" 
                             height="20">
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

export function initDownload() {
    document.getElementById('resultsContainer').addEventListener('click', async (e) => {
        if (e.target.closest('.download-btn')) {
            const card = e.target.closest('.item-card');
            const btn = card.querySelector('.download-btn');
            const account = document.getElementById('accountSelect').value;
            const { spotifyId, type } = card.dataset;
            const originalBtnHTML = btn.innerHTML;

            try {
                // Show loading state
                btn.innerHTML = `<img src="https://i.gifer.com/5RT9.gif" 
                                    alt="Loading" 
                                    style="width: 20px; height: 20px; object-fit: cover">`;
                btn.classList.add('loading');
                btn.style.pointerEvents = 'none';

                const statusLine = document.createElement('div');
                statusLine.className = 'status-line';
                card.appendChild(statusLine);

                const response = await fetch(
                    `/api/download?account=${encodeURIComponent(account)}&type=${type}&id=${spotifyId}`
                );
                
                const reader = response.body
                    .pipeThrough(new TextDecoderStream())
                    .getReader();

                let buffer = '';
                let lastPercentage = -1;
                let totalTracks = 0;
                let completedTracks = 0;
                let currentTrackNumber = 0;
                let currentTrackName = '';
                let currentTrackArtists = '';
                let playlistName = '';
                let albumName = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        btn.innerHTML = `<img src="https://www.svgrepo.com/show/166018/check-mark.svg" 
                                            alt="Completed" 
                                            style="width: 20px; height: 20px; filter: invert(1)">`;
                        btn.classList.remove('loading');
                        btn.classList.add('completed');
                        btn.style.pointerEvents = 'none';
                        break;
                    }
                    
                    buffer += value;
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (!line.trim()) continue;
                        try {
                            const data = JSON.parse(line);
                            
                            switch(data.type) {
                                case 'playlist_start':
                                    totalTracks = data.num_tracks;
                                    playlistName = data.name;
                                    completedTracks = 0;
                                    currentTrackNumber = 0;
                                    statusLine.textContent = `Starting playlist: ${playlistName} (${totalTracks} tracks)`;
                                    break;

                                case 'album_start':
                                    totalTracks = data.total_tracks;
                                    albumName = data.album;
                                    completedTracks = 0;
                                    currentTrackNumber = 0;
                                    statusLine.textContent = `Starting album: ${albumName} (${totalTracks} tracks)`;
                                    break;

                                case 'track_start':
                                    if (type === 'playlist') {
                                        currentTrackNumber++;
                                        statusLine.textContent = `Starting track ${currentTrackNumber}/${totalTracks}...`;
                                    } else {
                                        statusLine.textContent = 'Starting track download...';
                                    }
                                    break;

                                case 'album_track_start':
                                    currentTrackNumber = data.number;
                                    currentTrackName = data.track;
                                    statusLine.textContent = `Starting track ${currentTrackNumber}/${totalTracks}: ${currentTrackName}`;
                                    break;

                                case 'metadata':
                                    if (type === 'track') {
                                        statusLine.textContent = `Downloading: ${data.name} by ${data.artists[0]}`;
                                    } else if (type === 'playlist' || type === 'album') {
                                        currentTrackName = data.name;
                                        currentTrackArtists = data.artists.join(', ');
                                        statusLine.textContent = `Downloading track ${currentTrackNumber}/${totalTracks}: ${currentTrackName} by ${currentTrackArtists}`;
                                    }
                                    break;

                                case 'download_start':
                                    statusLine.textContent += ` (${formatBytes(data.total_size)})`;
                                    break;

                                case 'download_progress':
                                    if (Math.floor(data.percentage) > lastPercentage) {
                                        lastPercentage = Math.floor(data.percentage);
                                        const progress = `${lastPercentage}% of ${formatBytes(data.total)}`;
                                        if (type === 'track') {
                                            statusLine.textContent = `Downloading: ${progress}`;
                                        } else if (type === 'album' || type === 'playlist') {
                                            statusLine.textContent = `Downloading track ${currentTrackNumber}/${totalTracks}: ${currentTrackName} (${progress})`;
                                        } else {
                                            statusLine.textContent = `Downloading track ${completedTracks + 1}: ${progress}`;
                                        }
                                    }
                                    break;

                                case 'conversion_start':
                                    statusLine.textContent = `Converting to ${data.format}...`;
                                    break;

                                case 'track_complete':
                                    completedTracks++;
                                    statusLine.textContent = `Completed: ${data.output_path.split('/').pop()}`;
                                    statusLine.classList.add('completed');
                                    if (type === 'playlist') {
                                        statusLine.textContent += ` (${completedTracks}/${totalTracks} tracks)`;
                                    }
                                    break;

                                case 'track_skip':
                                    completedTracks++;
                                    statusLine.textContent = `Skipped: ${data.reason === 'already_exists' ? 'Already exists' : data.reason}`;
                                    statusLine.classList.add('warning');
                                    break;

                                case 'playlist_end':
                                    statusLine.textContent = `Playlist "${data.name}" complete! ${completedTracks}/${data.num_tracks} tracks downloaded`;
                                    statusLine.classList.add('completed');
                                    break;

                                case 'album_complete':
                                    statusLine.textContent = `Album "${data.album}" complete! ${data.successful}/${data.total} tracks downloaded`;
                                    statusLine.classList.add('completed');
                                    break;

                                case 'track_error':
                                    completedTracks++;
                                    statusLine.textContent = `Error: ${data.error}`;
                                    statusLine.classList.add('error');
                                    break;
                            }

                        } catch (e) {
                            console.error('Error parsing JSON:', e);
                        }
                    }
                }

            } catch (error) {
                console.error('Download failed:', error);
                btn.innerHTML = originalBtnHTML;
                btn.classList.remove('loading', 'completed');
                btn.style.pointerEvents = 'auto';
                
                const statusLine = card.querySelector('.status-line');
                statusLine.textContent = `Download failed: ${error.message}`;
                statusLine.classList.add('error');
            }
        }
    });
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}