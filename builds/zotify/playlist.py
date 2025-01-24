import json
from zotify.const import ITEMS, ID, TRACK, NAME
from zotify.termoutput import Printer
from zotify.track import download_track
from zotify.utils import split_input
from zotify.zotify import Zotify

MY_PLAYLISTS_URL = 'https://api.spotify.com/v1/me/playlists'
PLAYLISTS_URL = 'https://api.spotify.com/v1/playlists'

def get_all_playlists():
    """ Returns list of users playlists """
    playlists = []
    limit = 50
    offset = 0

    while True:
        resp = Zotify.invoke_url_with_params(MY_PLAYLISTS_URL, limit=limit, offset=offset)
        offset += limit
        playlists.extend(resp[ITEMS])
        if len(resp[ITEMS]) < limit:
            break

    return playlists

def get_playlist_songs(playlist_id):
    """ returns list of songs in a playlist """
    songs = []
    offset = 0
    limit = 100

    while True:
        resp = Zotify.invoke_url_with_params(f'{PLAYLISTS_URL}/{playlist_id}/tracks', limit=limit, offset=offset)
        offset += limit
        songs.extend(resp[ITEMS])
        if len(resp[ITEMS]) < limit:
            break

    return songs

def get_playlist_info(playlist_id):
    """ Returns information scraped from playlist """
    (raw, resp) = Zotify.invoke_url(f'{PLAYLISTS_URL}/{playlist_id}?fields=name,owner(display_name)&market=from_token')
    return resp['name'].strip(), resp['owner']['display_name'].strip()

def download_playlist(playlist_id):
    """Download a playlist directly by URL (with JSON start/end messages)"""
    # Fetch playlist metadata
    raw, playlist = Zotify.invoke_url(f"{PLAYLISTS_URL}/{playlist_id}?fields=name,tracks(total)")
    playlist_name = playlist.get('name', 'Unknown Playlist')
    total_tracks = playlist.get('tracks', {}).get('total', 0)

    # Print playlist start message
    print(json.dumps({
        "type": "playlist_start",
        "playlist_id": playlist_id,
        "name": playlist_name,
        "num_tracks": total_tracks,
        "status": "starting"
    }), flush=True)

    # Get and download all tracks
    songs = get_playlist_songs(playlist_id)
    valid_tracks = [song for song in songs if song.get(TRACK, {}).get(ID)]
    
    # Initialize progress tracking
    p_bar = Printer.progress(valid_tracks, unit='song', total=len(valid_tracks), unit_scale=True)
    enum = 1
    
    for song in p_bar:
        track = song.get(TRACK, {})
        track_id = track.get(ID)
        if track_id:
            download_track(
                'extplaylist',
                track_id,
                extra_keys={
                    'playlist': playlist_name,
                    'playlist_num': str(enum).zfill(2)
                },
                disable_progressbar=True
            )
            p_bar.set_description(track.get(NAME, 'Unknown Track'))
            enum += 1

    # Print playlist end message
    print(json.dumps({
        "type": "playlist_end",
        "playlist_id": playlist_id,
        "name": playlist_name,
        "num_tracks": len(valid_tracks),
        "status": "completed"
    }), flush=True)

def download_from_user_playlist():
    """ Select which playlist(s) to download """
    playlists = get_all_playlists()

    count = 1
    for playlist in playlists:
        print(str(count) + ': ' + playlist[NAME].strip())
        count += 1

    selection = ''
    print('\n> SELECT A PLAYLIST BY ID')
    print('> SELECT A RANGE BY ADDING A DASH BETWEEN BOTH ID\'s')
    print('> OR PARTICULAR OPTIONS BY ADDING A COMMA BETWEEN ID\'s\n')
    while len(selection) == 0:
        selection = str(input('ID(s): '))
    playlist_choices = map(int, split_input(selection))

    for playlist_number in playlist_choices:
        playlist = playlists[playlist_number - 1]
        print(f'Downloading {playlist[NAME].strip()}')
        # Pass the playlist ID instead of the playlist object
        download_playlist(playlist[ID])  # <--- This line was fixed

    print('\n**All playlists have been downloaded**\n')
