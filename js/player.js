class Player {
  constructor(x, y, width, height, speed, canvasWidth, canvasHeight) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.dx = 0;
    this.dy = 0;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.image = loadImage("img/nave.png");
    this.keys = {};
    this.lastShotTime = 0;
    this.shootInterval = 800;
    this.lives = 3;
    this.maxLives = 3;
    this.invulnerabilityDuration = 2000;
    this.maxBullets = 1;
    this.bulletPositions = [{ x: this.x + this.width / 2 - 10, y: this.y }];
    this.canShootSideways = false;
    this.level = 1;
    this.enemiesDefeated = 0;
    this.enemiesToLevelUp = 10;
    this.invulnerable = false;
    this.lastHitTime = 0;
    this.movingLeft = false;
    this.movingRight = false;
  }

  draw() {
    if (this.invulnerable) {
      if (millis() % 300 < 150) return; // Efecto de parpadeo
    }
    image(this.image, this.x, this.y, this.width, this.height);
  }

  loseLife() {
    const currentTime = millis();
    if (this.invulnerable) return;
    this.lives--;
    this.invulnerable = true;
    this.lastHitTime = currentTime;
  }

  updateInvulnerability() {
    const currentTime = millis();
    if (
      this.invulnerable &&
      currentTime - this.lastHitTime > this.invulnerabilityDuration
    ) {
      this.invulnerable = false;
    }
  }

  gainLife() {
    this.lives++;
    this.maxLives++;
  }

  isAlive() {
    return this.lives > 0;
  }

  move(deltaTime) {
    let dx = 0;

    if (this.movingLeft) {
      dx = -this.speed * deltaTime;
    }
    if (this.movingRight) {
      dx = this.speed * deltaTime;
    }

    this.x += dx;

    // Limitar bordes (solo horizontal)
    this.x = Math.max(0, Math.min(this.x, this.canvasWidth - this.width));

    this.updateInvulnerability();
  }

  updateBulletPositions() {
    this.bulletPositions = [];

    if (this.canShootSideways) {
      this.bulletPositions.push({ x: this.x, y: this.y });
      this.bulletPositions.push({ x: this.x + this.width, y: this.y });
    }

    if (this.maxBullets >= 1) {
      this.bulletPositions.push({ x: this.x + this.width / 2 - 10, y: this.y });
    }

    if (this.maxBullets >= 2) {
      this.bulletPositions = [
        { x: this.x + 1, y: this.y },
        { x: this.x + this.width - 20, y: this.y },
      ];

      if (this.canShootSideways) {
        this.bulletPositions.push({ x: this.x, y: this.y });
        this.bulletPositions.push({ x: this.x + this.width, y: this.y });
      }
    }

    if (this.maxBullets >= 3) {
      this.bulletPositions = [
        { x: this.x + this.width / 2 - 10, y: this.y },
        { x: this.x + 1, y: this.y },
        { x: this.x + this.width - 20, y: this.y },
      ];

      if (this.canShootSideways) {
        this.bulletPositions.push({ x: this.x, y: this.y });
        this.bulletPositions.push({ x: this.x + this.width, y: this.y });
      }
    }

    if (this.maxBullets > 3) {
      for (let i = 0; i < this.maxBullets - 3; i++) {
        this.bulletPositions.push({
          x: this.x + random(this.width - 20),
          y: this.y,
        });
      }
    }
  }

  shoot(bullets) {
    const currentTime = millis();

    if (currentTime - this.lastShotTime >= this.shootInterval) {
      const bulletImages = [
        "img/bullets/vertical/bullet-1-1.png",
        "img/bullets/vertical/bullet-1-2.png",
        "img/bullets/vertical/bullet-1-3.png",
        "img/bullets/vertical/bullet-1-4.png",
      ];

      const bulletImagesHorizontalDerecha = [
        "img/bullets/horizontal/derecha/bullet-1-h-d-1.png",
        "img/bullets/horizontal/derecha/bullet-1-h-d-2.png",
        "img/bullets/horizontal/derecha/bullet-1-h-d-3.png",
        "img/bullets/horizontal/derecha/bullet-1-h-d-4.png",
      ];

      const bulletImagesHorizontalIzquierda = [
        "img/bullets/horizontal/izquierda/bullet-1-h-i-1.png",
        "img/bullets/horizontal/izquierda/bullet-1-h-i-2.png",
        "img/bullets/horizontal/izquierda/bullet-1-h-i-3.png",
        "img/bullets/horizontal/izquierda/bullet-1-h-i-4.png",
      ];

      // ACTUALIZA LAS POSICIONES DE LAS BALAS SEGÚN LA POSICIÓN ACTUAL DE LA NAVE
      this.updateBulletPositions();

      this.bulletPositions.forEach((pos) => {
        let direction = 0;
        let currentBulletImages = bulletImages;
        let bulletWidth = 20;
        let bulletHeight = 40;

        if (pos.x === this.x) {
          direction = -1;
          currentBulletImages = bulletImagesHorizontalIzquierda;
          bulletWidth = 40;
          bulletHeight = 20;
        } else if (pos.x === this.x + this.width) {
          direction = 1;
          currentBulletImages = bulletImagesHorizontalDerecha;
          bulletWidth = 40;
          bulletHeight = 20;
        }

        bullets.push(
          new Bullet(
            pos.x,
            pos.y,
            bulletWidth,
            bulletHeight,
            5,
            currentBulletImages,
            direction
          )
        );
      });

      this.lastShotTime = currentTime;
      this.playShootSound();
    }
  }

  levelUp() {
    this.level++;
    this.enemiesDefeated = 0;
    this.enemiesToLevelUp += 5;
  }

  playShootSound() {
    soundManager.playShootSound();
  }

  aumentarNumeroBalas() {
    this.maxBullets++;
  }

  activarDisparoLateral() {
    this.canShootSideways = true;
  }

  recuperarTodasLasVidas() {
    this.lives = this.maxLives;
  }
}
