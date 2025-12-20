# PWA Icons

## Generate Icons from Logo

You need to convert the `munti-crime-map-logo.svg` to PNG icons in the following sizes:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Using Online Tools

1. **RealFaviconGenerator** (https://realfavicongenerator.net/)
   - Upload your SVG logo
   - Select "iOS, Android, and Windows"
   - Download and extract the icons

2. **PWA Builder** (https://www.pwabuilder.com/)
   - Upload your SVG logo
   - Download PWA image pack

3. **ImageMagick** (Command line - if installed):

```bash
magick munti-crime-map-logo.svg -resize 72x72 icons/icon-72x72.png
magick munti-crime-map-logo.svg -resize 96x96 icons/icon-96x96.png
magick munti-crime-map-logo.svg -resize 128x128 icons/icon-128x128.png
magick munti-crime-map-logo.svg -resize 144x144 icons/icon-144x144.png
magick munti-crime-map-logo.svg -resize 152x152 icons/icon-152x152.png
magick munti-crime-map-logo.svg -resize 192x192 icons/icon-192x192.png
magick munti-crime-map-logo.svg -resize 384x384 icons/icon-384x384.png
magick munti-crime-map-logo.svg -resize 512x512 icons/icon-512x512.png
```

## Important Notes

- All icons must be PNG format (SVG doesn't work for PWA icons)
- Use square dimensions
- Background should match your app's theme color (#ef4444 red) or be transparent
