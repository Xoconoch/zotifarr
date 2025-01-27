# THIS PROJECT IS DEPRECATED

This project is being replaced by [Spotizerr](https://github.com/Xoconoch/spotizerr) since it can do everything zotifarrr does and more, in a much, much better way.

# zotifarrr

## Overview

**Zotifarrr** is a [Zotify web](https://github.com/zotify-dev/zotify) wrapper, that allows you download music directly from Spotify to your local desktop and media player (such as Navidrome, Plexamp, or Jellyfin).

## Screenshots

### Search results (collapsed)

![image](https://github.com/user-attachments/assets/6e6d19b0-8fe8-4cdb-99f9-de417bace6b6)
_Note: The "MX" on the left side of the search bar is the custom name I chose for that particular account. As you can probably infer, this app supports multiple accounts at the same time_

### Album search results expanded

![image](https://github.com/user-attachments/assets/513f619f-7b07-4988-bd03-8223277bd2e3)

## Installation

### Generate a `credentials.json` file

First create a Spotify credentials file using the 3rd-party `librespot-auth` tool, this step has to be done in a PC/Laptop that has the Spotify desktop app installed.

In a Terminal, run:

```shell
# Clone the librespot-auth repo
git clone --depth 1 https://github.com/dspearson/librespot-auth.git

# Build the repo using a Rust Docker image
docker run --rm -v "$(pwd)/librespot-auth":/app -w /app rust:latest cargo build --release

./librespot-auth/target/release/librespot-auth --name "mySpotifyAccount1" --class=computer

# For Windows, run this command instead:
# .\librespot-auth\target\release\librespot-auth.exe --name "mySpotifyAccount1" --class=computer
```

- Now open the Spotify app
- Click on the "Connect to a device" icon
- Under the "Select Another Device" section, click "mySpotifyAccount1"
- This utility will create a `credentials.json` file

You will need to make the following changes to the `credentials.json` file:

- Replace `"auth_type": 1` with `"type":"AUTHENTICATION_STORED_SPOTIFY_CREDENTIALS"`
- Rename `"auth_data"` to `"credentials"` 

In Terminal, this can be done using the `sed` command:

```shell
file="credentials.json"
sed -i.bak -E '
s/"auth_type": *1/"type":"AUTHENTICATION_STORED_SPOTIFY_CREDENTIALS"/;
s/"auth_data"/"credentials"/
' "$file" && rm -f "${file}.bak"
```

## Install `zotifarrr`

In a Terminal, run:

```shell
# Clone this repo
git clone --depth 1 https://github.com/Xoconoch/zotifarrr.git

# Copy your `credentials.json` into the cloned repo
mkdir -p ./zotifarrr/credentials/mySpotifyAccount1
cp credentials.json ./zotifarrr/credentials/mySpotifyAccount1

# If you generated credentials.json in another machine
mkdir -p ./zotifarrr/credentials/mySpotifyAccount1
touch ./zotifarrr/credentials/mySpotifyAccount1/credentials.json
echo {contents of your credentials.json generated elsewhere} > ./zotifarrr/credentials/mySpotifyAccount1/credentials.json

#                               ^^^^
# There are other ways of doing this, but the important goal of this step is to have a ./zotifarrr/credentials/mySpotifyAccount1/credentials.json file with valid credentials

# Build the Docker image
cd zotifarrr
docker build -t zotifarrr .

# Run the zotifarrr Docker container
docker compose up -d
```

## Accessing `zotifarrr`

Once the zotifarrr container is running:

- Load your web browser, and browse to `http://localhost:7070`

- Modify `docker-compose.yaml` if you need to run the container on a different port
