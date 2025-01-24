from zotify.const import ITEMS, ARTISTS, NAME, ID
from zotify.termoutput import Printer, PrintChannel
from zotify.track import download_track
from zotify.utils import fix_filename
from zotify.zotify import Zotify

import json

ALBUM_URL = 'https://api.spotify.com/v1/albums'
ARTIST_URL = 'https://api.spotify.com/v1/artists'


def get_album_tracks(album_id):
    """ Returns album tracklist """
    songs = []
    offset = 0
    limit = 50

    while True:
        resp = Zotify.invoke_url_with_params(f'{ALBUM_URL}/{album_id}/tracks', limit=limit, offset=offset)
        offset += limit
        songs.extend(resp[ITEMS])
        if len(resp[ITEMS]) < limit:
            break

    return songs


def get_album_name(album_id):
    """ Returns album name """
    (raw, resp) = Zotify.invoke_url(f'{ALBUM_URL}/{album_id}')
    return resp[ARTISTS][0][NAME], fix_filename(resp[NAME])


def get_artist_albums(artist_id):
    """ Returns artist's albums """
    (raw, resp) = Zotify.invoke_url(f'{ARTIST_URL}/{artist_id}/albums?include_groups=album%2Csingle')
    album_ids = [resp[ITEMS][i][ID] for i in range(len(resp[ITEMS]))]
    while resp['next'] is not None:
        (raw, resp) = Zotify.invoke_url(resp['next'])
        album_ids.extend([resp[ITEMS][i][ID] for i in range(len(resp[ITEMS]))])

    return album_ids


def download_album(album):
    """ Downloads songs from an album with JSON streaming output """
    artist, album_name = get_album_name(album)
    tracks = get_album_tracks(album)
    total_tracks = len(tracks)
    
    # Initial album information
    print(json.dumps({
        "type": "album_start",
        "album": album_name,
        "artist": artist,
        "id": album,
        "total_tracks": total_tracks
    }, ensure_ascii=False))
    
    success_count = 0
    error_count = 0
    
    for index, track in enumerate(tracks, start=1):
        track_name = track.get(NAME, "Unknown Track")
        track_id = track[ID]
        
        # Track start message
        print(json.dumps({
            "type": "album_track_start",
            "number": index,
            "total": total_tracks,
            "track": track_name,
            "track_id": track_id
        }, ensure_ascii=False))
        
        try:
            download_track('album', track_id, extra_keys={
                'album_num': str(index).zfill(2),
                'artist': artist,
                'album': album_name,
                'album_id': album
            }, disable_progressbar=True)
            
            # Track success message
            print(json.dumps({
                "type": "album_track_complete",
                "number": index,
                "track": track_name,
                "track_id": track_id,
                "status": "success"
            }, ensure_ascii=False))
            success_count += 1
            
        except Exception as e:
            # Track error message
            print(json.dumps({
                "type": "album_track_error",
                "number": index,
                "track": track_name,
                "track_id": track_id,
                "error": str(e)
            }, ensure_ascii=False))
            error_count += 1
    
    # Final completion message
    print(json.dumps({
        "type": "album_complete",
        "album": album_name,
        "id": album,
        "successful": success_count,
        "failed": error_count,
        "total": total_tracks
    }, ensure_ascii=False))



def get_artist_info(artist_id):
    """ Get artist metadata """
    (raw, resp) = Zotify.invoke_url(f'{ARTIST_URL}/{artist_id}')
    return resp[NAME]

def download_artist_albums(artist):
    """ Downloads albums of an artist with JSON progress tracking """
    try:
        artist_name = get_artist_info(artist)
        albums = get_artist_albums(artist)
        
        # Artist download start
        print(json.dumps({
            "type": "artist_start",
            "artist": artist_name,
            "artist_id": artist,
            "total_albums": len(albums),
            "status": "starting"
        }, ensure_ascii=False), flush=True)

        album_count = 0
        for album_id in albums:
            try:
                download_album(album_id)
                album_count += 1
            except Exception as e:
                print(json.dumps({
                    "type": "artist_album_error",
                    "artist": artist_name,
                    "album_id": album_id,
                    "error": str(e)
                }, ensure_ascii=False), flush=True)

        # Artist download complete
        print(json.dumps({
            "type": "artist_complete",
            "artist": artist_name,
            "artist_id": artist,
            "completed_albums": album_count,
            "total_albums": len(albums),
            "status": "completed" if album_count == len(albums) else "partial"
        }, ensure_ascii=False), flush=True)

    except Exception as e:
        print(json.dumps({
            "type": "artist_error",
            "artist_id": artist,
            "error": str(e)
        }, ensure_ascii=False), flush=True)