Rip from spotify directly to your music library regardless of your account.

Intended for self-hosting freaks.

## Installation

0. Install [sysbox](https://github.com/nestybox/sysbox/blob/master/docs/user-guide/install.md) (for most distros there probably will be a package installation available).
1. Clone this repo
2. Give execution permissions to build.sh
3. Execute build.sh
4. Setup the docker-compose.yaml file (for easier maintenance, preferably in a different directory from the installation)
5. Deploy the container and access {ip of your server}:7070.
6. Start ripping

## Adding accounts

Follow [this repo](https://github.com/dspearson/librespot-auth?tab=readme-ov-file) using a PC/laptop with spotify client installed, and once it generates the credentials.json, you need to modify it as follows:

- Replace `"auth_type": 1` with `"type":"AUTHENTICATION_STORED_SPOTIFY_CREDENTIALS"`
- Rename `"auth_data"` to `"credentials"` 

Once you do that, you need to go where your docker-compose.yaml is and create the file `./credentials/{account_custom_name}/credentials.json` and paste the contents from the `credentials.json` you modified previously on your PC/laptop. 

Added accounts should be catched automatically on the frontend after reloading it.

## Acknowledgements

[Zotify](https://github.com/zotify-dev/zotify), for basically being 90% of this project. Cool shi my guy, keep the great work.

## Roadmap:

* Before downloading from spotify, try to download from another service (deezer, tidal or qobuz) in order to at least try on getting best quality.
