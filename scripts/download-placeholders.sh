#!/bin/bash

# Create directories if they don't exist
mkdir -p public

# Download placeholder images
# Hero background (1920x600)
curl "https://placehold.co/1920x600/9333EA/ffffff/png" -o public/hero-bg.jpg

# Product images (800x800)
curl "https://placehold.co/800x800/6D28D9/ffffff/png?text=Super+Purple" -o public/product1.jpg
curl "https://placehold.co/800x800/7C3AED/ffffff/png?text=Space+Ranger" -o public/product2.jpg
curl "https://placehold.co/800x800/8B5CF6/ffffff/png?text=Sweet+Dreams" -o public/product3.jpg
curl "https://placehold.co/800x800/9333EA/ffffff/png?text=September" -o public/product4.jpg

# Pack image (1000x800)
curl "https://placehold.co/1000x800/6D28D9/ffffff/png?text=7+Strains+Pack" -o public/pack-image.jpg

# Merch images (800x800)
curl "https://placehold.co/800x800/4C1D95/ffffff/png?text=Merch+1" -o public/merch1.jpg
curl "https://placehold.co/800x800/5B21B6/ffffff/png?text=Merch+2" -o public/merch2.jpg
curl "https://placehold.co/800x800/6D28D9/ffffff/png?text=Merch+3" -o public/merch3.jpg
curl "https://placehold.co/800x800/7C3AED/ffffff/png?text=Merch+4" -o public/merch4.jpg

echo "All placeholder images have been downloaded successfully!" 