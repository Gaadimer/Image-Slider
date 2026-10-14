# Vanilla JS Image Slider

A dependency-free image slider built with HTML, CSS and JavaScript (ES6 class).

## Features
- Previous / Next arrow buttons
- Clickable indicator dots with active state
- Horizontal slide animation using `transform: translateX()` and CSS transitions
- Seamless infinite loop using cloned end slides
- Fully responsive container, images use `object-fit: cover`

## Run it
Open `index.html` in a browser. Put your five images in the `images/` folder
(`slide1.jpg` ... `slide5.jpg`) or edit the `src` paths in `index.html`.

## Files
- `index.html` - markup and sample images
- `style.css` - layout, mask, track and transition styles
- `slider.js` - the `ImageSlider` class
