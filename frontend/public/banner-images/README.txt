HOW TO ADD BANNER/AD IMAGES
============================

1. Name your images exactly: banner1.jpg, banner2.jpg, banner3.jpg, banner4.jpg
   (jpg or png both work - just update the extension in
   src/components/BannerSlider.jsx if you use .png)

2. Recommended size: 1600 x 500 pixels (a wide "billboard" shape, ratio ~3.2:1)
   Keep all banner images the SAME size/ratio so the slider doesn't jump
   around when it rotates between them.

3. Drop the image files directly into this folder
   (frontend/public/banner-images/).

4. You can use 2 to 5 images. If a numbered file doesn't exist, the slider
   simply skips it - so you don't have to use all 4 slots.

5. Restart the frontend (npm run dev) after adding new images if the
   dev server was already running, just to be safe.
