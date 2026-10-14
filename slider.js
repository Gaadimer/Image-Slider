/**
 * ImageSlider - a dependency-free carousel.
 * Usage: new ImageSlider('#my-slider', { duration: 600 });
 * The container should hold only <img> elements.
 */
class ImageSlider {
  constructor(selector, options = {}) {
    this.root = document.querySelector(selector);
    if (!this.root) {
      throw new Error(`ImageSlider: no element matches "${selector}"`);
    }

    this.images = Array.from(this.root.querySelectorAll('img'));
    this.total = this.images.length;
    if (this.total === 0) return;

    this.duration = options.duration ?? 600;

    this.current = 0;      // index of the real image being shown (0 .. total-1)
    this.position = 1;     // slot on the track (0 and total+1 are clones)
    this.isAnimating = false;
    this.fallbackTimer = null;

    this.build();
    this.bind();
    this.render(false);
  }

  /* ---------- Build the DOM ---------- */
  makeSlide(img, isClone = false) {
    const slide = document.createElement('div');
    slide.className = 'slider__slide';
    if (isClone) slide.setAttribute('aria-hidden', 'true');
    slide.appendChild(img);
    return slide;
  }

  makeButton(className, label, text) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = className;
    btn.setAttribute('aria-label', label);
    btn.textContent = text;
    return btn;
  }

  build() {
    this.root.setAttribute('role', 'region');
    this.root.setAttribute('aria-roledescription', 'carousel');
    this.root.setAttribute('aria-label', 'Image slider');
    this.root.style.setProperty('--slider-duration', `${this.duration}ms`);

    // Clones sit at both ends so the loop never runs out of track
    const firstClone = this.makeSlide(this.images[0].cloneNode(true), true);
    const lastClone = this.makeSlide(this.images[this.total - 1].cloneNode(true), true);
    const realSlides = this.images.map((img) => this.makeSlide(img));

    this.track = document.createElement('div');
    this.track.className = 'slider__track';
    this.track.append(lastClone, ...realSlides, firstClone);

    this.viewport = document.createElement('div');
    this.viewport.className = 'slider__viewport';
    this.viewport.appendChild(this.track);

    this.prevBtn = this.makeButton('slider__arrow slider__arrow--prev', 'Previous slide', '\u2039');
    this.nextBtn = this.makeButton('slider__arrow slider__arrow--next', 'Next slide', '\u203A');

    this.dotsWrap = document.createElement('div');
    this.dotsWrap.className = 'slider__dots';
    this.dots = this.images.map((_, i) => {
      const dot = this.makeButton('slider__dot', `Go to slide ${i + 1}`, '');
      dot.dataset.index = i;
      this.dotsWrap.appendChild(dot);
      return dot;
    });

    this.root.append(this.viewport, this.prevBtn, this.nextBtn, this.dotsWrap);
  }

  /* ---------- Events ---------- */
  bind() {
    this.prevBtn.addEventListener('click', () => this.step(-1));
    this.nextBtn.addEventListener('click', () => this.step(1));

    // Event delegation: one listener for every dot
    this.dotsWrap.addEventListener('click', (e) => {
      const dot = e.target.closest('.slider__dot');
      if (dot) this.goTo(Number(dot.dataset.index));
    });

    this.track.addEventListener('transitionend', (e) => {
      if (e.target === this.track && e.propertyName === 'transform') this.settle();
    });
  }

  /* ---------- Movement ---------- */
  step(direction) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.position += direction;
    this.current = (this.current + direction + this.total) % this.total;
    this.render(true);
  }

  goTo(index) {
    if (this.isAnimating || index === this.current) return;
    this.isAnimating = true;
    this.current = index;
    this.position = index + 1;
    this.render(true);
  }

  // Called when a slide animation ends: jump from a clone to its real twin
  settle() {
    if (!this.isAnimating) return;
    clearTimeout(this.fallbackTimer);

    if (this.position === this.total + 1) this.position = 1;
    else if (this.position === 0) this.position = this.total;

    this.applyTransform(false);
    this.isAnimating = false;
  }

  /* ---------- Drawing ---------- */
  applyTransform(animate) {
    if (!animate) this.track.style.transition = 'none';
    this.track.style.transform = `translateX(${-this.position * 100}%)`;
    if (!animate) {
      void this.track.offsetWidth; // force reflow so the jump is not animated
      this.track.style.transition = '';
    }
  }

  render(animate) {
    this.applyTransform(animate);

    this.dots.forEach((dot, i) => {
      const active = i === this.current;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });

    // Safety net in case transitionend never fires (e.g. reduced motion)
    if (animate) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = setTimeout(() => this.settle(), this.duration + 80);
    }
  }
}
