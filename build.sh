#!/bin/bash

# Build the "zotify" image using ./builds as the build context
echo "Building zotify image..."
docker build -t zotify ./builds

# Check if the build was successful
if [ $? -eq 0 ]; then
    echo "zotify image built successfully."

    # Save the zotify image as a tar file
    echo "Saving zotify image to ./zotify.tar..."
    docker save -o ./zotify.tar zotify

    if [ $? -eq 0 ]; then
        echo "zotify image saved to ./zotify.tar."
    else
        echo "Failed to save zotify image."
        exit 1
    fi
else
    echo "Failed to build zotify image."
    exit 1
fi

# Build the "zotifarr" image using ./ as the build context
echo "Building zotifarr image..."
docker build -t zotifarr ./

# Check if the build was successful
if [ $? -eq 0 ]; then
    echo "zotifarr image built successfully."
else
    echo "Failed to build zotifarr image."
    exit 1
fi

echo "All tasks completed successfully."
