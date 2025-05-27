class Explosion {
  constructor(x, y, width, height, imagePaths) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.images = [];
    this.imagePaths = imagePaths;

    this.imageIndex = 0;
    this.animationInterval = 50; // milisegundos
    this.lastFrameTime = 0;
    this.finished = false;
    this.loaded = false;
  }

  preload() {
    this.images = this.imagePaths.map((path) => loadImage(path));
    this.loaded = true;
  }

  update() {
    if (this.finished || !this.loaded) return;

    const currentTime = millis();
    if (currentTime - this.lastFrameTime > this.animationInterval) {
      this.imageIndex++;
      this.lastFrameTime = currentTime;

      if (this.imageIndex >= this.images.length) {
        this.finished = true;
      }
    }
  }

  draw() {
    if (this.finished || !this.loaded) return;

    image(
      this.images[this.imageIndex],
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}
