class Explosion {
  constructor(x, y, width, height, frames) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.frames = frames; 
    this.imageIndex = 0;
    this.animationInterval = 50; 
    this.lastFrameTime = millis();
    this.finished = false;
  }

  update() {
    if (this.finished) return;

    const currentTime = millis();
    if (currentTime - this.lastFrameTime > this.animationInterval) {
      this.imageIndex++;
      this.lastFrameTime = currentTime;

      if (this.imageIndex >= this.frames.length) {
        this.finished = true;
      }
    }
  }

  draw() {
    if (this.finished || this.imageIndex >= this.frames.length) return;

    image(
      this.frames[this.imageIndex],
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}
