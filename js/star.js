class Star {
  constructor(x, y, radius, speed, canvasHeight) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.canvasHeight = canvasHeight;
  }

  update() {
    this.y += this.speed;
    if (this.y > this.canvasHeight) {
      this.y = 0;
    }
  }

  draw() {
    noStroke();
    fill(255); // Blanco
    ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
  }
}
