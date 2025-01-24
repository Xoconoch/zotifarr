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
                let isArtistDownload = type === 'artist';
                let firstAlbumStart = isArtistDownload;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        // Update to checkmark and stop animation
                        btn.innerHTML = `<img src="https://www.svgrepo.com/show/166018/check-mark.svg" 
                                            alt="Completed" 
                                            style="width: 20px; height: 20px; filter: invert(1)">`;
                        btn.classList.remove('loading');
                        btn.classList.add('completed');
                        btn.style.pointerEvents = 'none';
                        
                        if (isArtistDownload) {
                            statusLine.textContent = 'Artist download complete!';
                            statusLine.classList.add('completed');
                        }
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
                                case 'track_start':
                                    statusLine.textContent = 'Starting track download...';
                                    break;

                                case 'album_start':
                                    totalTracks = data.total_tracks;
                                    if (isArtistDownload && firstAlbumStart) {
                                        statusLine.textContent = `Downloading ${data.artist}`;
                                        firstAlbumStart = false;
                                    } else {
                                        statusLine.textContent = `Downloading album: ${data.album}`;
                                    }
                                    break;

                                case 'playlist_start':
                                    statusLine.textContent = `Starting playlist: ${data.name}`;
                                    break;

                                case 'metadata':
                                    if (type === 'track') {
                                        statusLine.textContent = `Downloading: ${data.name} by ${data.artists[0]}`;
                                    }
                                    break;

                                case 'download_start':
                                    statusLine.textContent += ` (${formatBytes(data.total_size)})`;
                                    break;

                                case 'download_progress':
                                    if (Math.floor(data.percentage) > lastPercentage) {
                                        lastPercentage = Math.floor(data.percentage);
                                        const progress = `${lastPercentage}% of ${formatBytes(data.total)}`;
                                        statusLine.textContent = type === 'track' 
                                            ? `Downloading: ${progress}`
                                            : `Downloading track ${completedTracks + 1}: ${progress}`;
                                    }
                                    break;

                                case 'album_track_start':
                                    statusLine.textContent = `Downloading track ${data.number}/${totalTracks}: ${data.track}`;
                                    break;

                                case 'playlist_track_start':
                                    statusLine.textContent = `Downloading track ${data.position}: ${data.track}`;
                                    break;

                                case 'conversion_start':
                                    statusLine.textContent = `Converting to ${data.format}...`;
                                    break;

                                case 'track_complete':
                                    completedTracks++;
                                    statusLine.textContent = `Completed: ${data.output_path.split('/').pop()}`;
                                    statusLine.classList.add('completed');
                                    break;

                                case 'track_skip':
                                    completedTracks++;
                                    statusLine.textContent = `Skipped: ${data.reason === 'already_exists' ? 'Already exists' : data.reason}`;
                                    statusLine.classList.add('warning');
                                    break;

                                case 'album_complete':
                                    statusLine.textContent = `Album complete! ${data.successful}/${data.total} tracks`;
                                    statusLine.classList.add('completed');
                                    break;

                                case 'playlist_complete':
                                    statusLine.textContent = `Playlist complete! ${data.downloaded} tracks`;
                                    statusLine.classList.add('completed');
                                    break;
                            }

                        } catch (e) {
                            console.error('Error parsing JSON:', e);
                        }
                    }
                }

            } catch (error) {
                console.error('Download failed:', error);
                // Restore original button state
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