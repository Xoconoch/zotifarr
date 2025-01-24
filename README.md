## SUPPORT YOUR ARTISTS

As of 2025, Spotify pays an average of $0.005 per stream to the artist. That means that if you give the equivalent of $5 directly to them (like merch, buying cds, or just donating), you can """ethically""" listen to them a total of 1000 times. Of course, nobody thinks spotify payment is fair, so preferably you should give more, but $5 is the bare minimum. Big names prolly don't need those $5 dollars, but it might be _the_ difference between going out of business or not for that indie rock band you like.

## What is this?

A Zotify web wrapper that allows to add music directly to a personal music library, intended for music server owners (navidrome, plexamp, jellyfin, etc.). It saves _every_ track using artist/album/track formatting, audio is in .ogg.

## Screenshots

Search results (collapsed)
![image](https://github.com/user-attachments/assets/6e6d19b0-8fe8-4cdb-99f9-de417bace6b6)
_Note: The "MX" on the left side of the search bar is the custom name I chose for that particular account. As you can probably infer, this app supports multiple accounts at the same time_

Album search results expanded
![image](https://github.com/user-attachments/assets/513f619f-7b07-4988-bd03-8223277bd2e3)

## Installation

1. Clone this repo
2. Inside its directory, run `docker build -t zotifarrr .`
3. Setup the docker-compose.yaml file (for easier maintenance, preferably in a different directory from the installation)
4. Deploy the container and access {ip of your server}:7070.
5. Start ripping

## Adding accounts

Follow [this repo](https://github.com/dspearson/librespot-auth?tab=readme-ov-file) using a PC/laptop with spotify client installed, and once it generates the credentials.json, you need to modify it as follows:

- Replace `"auth_type": 1` with `"type":"AUTHENTICATION_STORED_SPOTIFY_CREDENTIALS"`
- Rename `"auth_data"` to `"credentials"` 

Once you do that, you need to go where your docker-compose.yaml is and create the file `./credentials/{account_custom_name}/credentials.json` and paste the contents from the `credentials.json` you modified previously on your PC/laptop. 

Added accounts should be catched automatically on the frontend after reloading it.

## Acknowledgements

[Zotify](https://github.com/zotify-dev/zotify), for basically being 90% of this project. Cool shi my guy, keep the great work.
This project is NOT an NZBDrone fork, despite its -arr suffix. More info [here](https://www.reddit.com/r/radarr/comments/hbwnb2/a_list_of_all_companion_tools_and_software/)

## Roadmap:

* Before downloading from spotify, try to download from another service (deezer, tidal or qobuz) in order to at least try on getting best quality.
