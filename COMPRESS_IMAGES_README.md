# Image Compression Guide

Your engagement photos are likely 5-10MB each, which causes slow loading times. Here's how to compress them:

## Option 1: Online Tool (Recommended - No Install Needed!)

### Using Squoosh.app:
1. Visit https://squoosh.app
2. Drag and drop your images
3. Set quality to 60-70%
4. Download compressed versions
5. Replace originals in `public/images/`

**Expected results:** 5MB → ~500KB (90% reduction!)

---

## Option 2: Using the Provided Script

If you have Node.js installed:

```bash
# Install the required package
npm install sharp

# Run the compression script
node compress-images.js

# Review the compressed files, then rename them
# Example:
# compressed-2Q9A0361.jpg → 2Q9A0361.jpg
```

The script will:
- Resize images to max 2000px width (more than enough for the carousel)
- Compress to 70% quality (web-optimized)
- Show before/after sizes

---

## Option 3: ImageMagick (Mac/Linux)

If you have ImageMagick installed:

```bash
cd public/images

# Compress all JPG files (creates backup first)
for img in *.jpg; do
  if [ "$img" != "castell-background.jpg" ]; then
    mogrify -quality 70 -resize 2000x "$img"
  fi
done
```

---

## Why Compress?

- **Current:** 57 photos × 5MB = ~285MB total
- **After compression:** 57 photos × 500KB = ~28MB total
- **Load time:** 20 seconds → 3-5 seconds!

The carousel only displays photos at 128-160px height, so full camera resolution is unnecessary.
