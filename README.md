## SUPPORT YOUR ARTISTS

As of 2025, Spotify pays an average of $0.005 per stream to the artist. That means that if you give the equivalent of $5 directly to them (like merch, buying cds, or just donating), you can """ethically""" listen to them a total of 1000 times. Of course, nobody thinks spotify payment is fair, so preferably you should give more, but $5 is the bare minimum. Big names prolly don't need those $5 dollars, but it might be _the_ difference between going out of business or not for that indie rock band you like.

# zotifarrr

## Overview

**Zotifarrr** is a [Zotify web](https://github.com/zotify-dev/zotify) wrapper, that allows you download music and podcasts directly from Spotify to your local desktop and media player (such as Navidrome, Plexamp, or Jellyfin).

## Screenshots

### Search results (collapsed)

[insert image link here]

### Album search results expanded

[insert image link here]

## Installation

### Generate a `credentials.json` file

First create a Spotify credentials file using the 3rd-party `librespot-auth` tool.

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
