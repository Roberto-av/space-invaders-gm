class Enemy {
  constructor(
    x,
    y,
    width,
    height,
    speed,
    imageSrcs,
    canvasWidth,
    canvasHeight,
    type = 1,
    health = 1,
    canShoot = false
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.images = imageSrcs.map((src) => loadImage(src));
    this.type = type;
    this.health = health;
    this.canShoot = canShoot;
    this.imageIndex = 0;
    this.directionX = random() < 0.5 ? -1 : 1;
    this.animationInterval = 400;
    this.lastFrameTime = 0;
    this.directionChangeInterval = random(2000, 3000);
    this.lastDirectionChangeTime = millis();
    this.lastShootTime = 0;
    this.shootCooldown = 2000;
    this.bullets = [];
    this.lastAboveHalfTime = 0;
    this.forceMoveUpCooldown = 3000;

    if (this.type === 2) {
      this.moveState = "initial";
      this.moveStartTime = millis();
      this.horizontalMoveDuration = random(3000, 5000);
      this.verticalMoveSpeed = 1;
    } else if (this.type === 3) {
      this.moveState = "descending";
      this.moveStartTime = millis();
      this.originX = x;
      this.originY = y; 
      this.amplitude = 100;
      this.verticalDirection = 1;
      this.diagonalSpeed = 2;
    } else if (this.type === 4) {
      // Boss
      this.moveState = "initial";
      this.moveStartTime = millis();
      this.horizontalMoveDuration = random(3000, 5000);
      this.verticalMoveSpeed = 1;
      this.angle = 0;
      this.angularSpeed = 0.05;
      this.bossShootCooldown = 1000;
      this.maxTimeInInitialState = 3000;
      this.bulletPositions = [];
      this.maxBullets = 6;
    }
  }

  takeDamage() {
    this.health--;
    return this.health <= 0;
  }

  move(currentTime, bullets) {
    if (this.type === 1) {
      // Movimiento para enemigos tipo 1
      this.y += this.speed;
    } else if (this.type === 2) {
      // Movimiento para enemigos tipo 2
      this.x += this.directionX * (this.speed * 0.5);
      this.y += this.verticalMoveSpeed;

      // Rebota en los bordes del canvas
      if (this.x <= 0 || this.x + this.width >= this.canvasWidth) {
        this.directionX *= -1;
      }
    } else if (this.type === 3) {
      const elapsed = currentTime - this.moveStartTime;

      // 1) Estado "descending": baja en línea recta
      if (this.moveState === "descending") {
        this.y += this.speed;

        // Cuando llega a la posición objetivo (30% del canvas)
        if (this.y >= this.canvasHeight * 0.3) {
          this.moveState = "sideToSide";
          this.moveStartTime = currentTime;
          this.originX = this.x;
          this.originY = this.y;
          this.verticalDirection = random() < 0.5 ? -1 : 1; // Dirección vertical aleatoria
        }

        // Estado "sideToSide": movimiento horizontal oscilante
      } else if (this.moveState === "sideToSide") {
        // Movimiento sinusoidal suave
        const frequency = 0.002;
        this.x =
          this.originX +
          this.amplitude * sin((currentTime - this.moveStartTime) * frequency);

        // Pequeño movimiento vertical aleatorio
        if (random() < 0.02) {
          this.verticalDirection = random() < 0.5 ? -1 : 1;
        }
        this.y += this.verticalDirection * 0.5;

        // Limitar posición vertical
        this.y = constrain(
          this.y,
          this.canvasHeight * 0.2,
          this.canvasHeight * 0.7
        );

        // Cambiar a movimiento diagonal ocasionalmente
        if (elapsed > 4000 && random() < 0.005) {
          this.moveState = "diagonal";
          this.moveStartTime = currentTime;
          this.diagonalDirectionX = random() < 0.5 ? -1 : 1;
          this.diagonalDirectionY = random() < 0.3 ? -1 : 1;
        }

        // Estado "diagonal": movimiento en diagonal
      } else if (this.moveState === "diagonal") {
        this.x += this.diagonalDirectionX * this.diagonalSpeed;
        this.y += this.diagonalDirectionY * this.diagonalSpeed;

        // Rebotar en los bordes con margen
        const margin = 20;
        if (
          this.x <= margin ||
          this.x + this.width >= this.canvasWidth - margin
        ) {
          this.diagonalDirectionX *= -1;
          this.x = constrain(
            this.x,
            margin,
            this.canvasWidth - this.width - margin
          );
        }
        if (
          this.y <= this.canvasHeight * 0.2 ||
          this.y + this.height >= this.canvasHeight * 0.8
        ) {
          this.diagonalDirectionY *= -1;
          this.y = constrain(
            this.y,
            this.canvasHeight * 0.2,
            this.canvasHeight * 0.8 - this.height
          );
        }

        // Volver al movimiento sideToSide después de 1.5-2.5 segundos
        if (elapsed > 1500 + random(1000)) {
          this.moveState = "sideToSide";
          this.moveStartTime = currentTime;
          this.originX = this.x;
          this.originY = this.y;
          this.amplitude = 80 + random(40); // Variar la amplitud
        }
      }

      // Asegurarse de que el enemigo no desaparezca
      this.x = constrain(this.x, 0, this.canvasWidth - this.width);
      this.y = constrain(this.y, 0, this.canvasHeight - this.height);
    } else if (this.type === 4) {
      // Movimiento para el boss (tipo 4)
      if (this.moveState === "initial") {
        this.y += this.verticalMoveSpeed;
        if (currentTime - this.moveStartTime >= this.maxTimeInInitialState) {
          this.moveState = "circling";
          this.moveStartTime = currentTime;
        }
      } else if (this.moveState === "circling") {
        // Movimiento circular constante
        this.x += cos(this.angle) * this.speed;
        this.y += sin(this.angle) * this.speed;
        this.angle += this.angularSpeed;

        // Verificar si el jefe se acerca demasiado a los bordes horizontales
        if (this.x < 0 || this.x + this.width > this.canvasWidth) {
          this.x = max(0, min(this.x, this.canvasWidth - this.width));
          this.angle = -this.angle;
        }

        // Verificar si el jefe se acerca demasiado a los bordes verticales
        if (this.y < 0 || this.y + this.height > this.canvasHeight) {
          this.y = max(0, min(this.y, this.canvasHeight - this.height));
          this.angle = PI - this.angle;
        }

        // Asegurarse de que no pase mucho tiempo debajo de la mitad del canvas
        if (this.y > this.canvasHeight / 2) {
          if (currentTime - this.lastAboveHalfTime > this.forceMoveUpCooldown) {
            this.angle = -abs(this.angle);
            this.lastAboveHalfTime = currentTime;
          }
        } else {
          this.lastAboveHalfTime = currentTime;
        }
      }
    }

    // Verificar si el enemigo se sale del canvas
    if (this.y > this.canvasHeight) {
      this.y = -this.height;
    }

    // Disparo de balas
    if (
      this.canShoot &&
      currentTime - this.lastShootTime > this.shootCooldown
    ) {
      this.shoot(bullets);
      this.lastShootTime = currentTime;
    }

    // Disparo especial del boss
    if (
      this.type === 4 &&
      currentTime - this.lastShootTime > this.bossShootCooldown
    ) {
      this.updateBulletPositions();
      this.shootSpecial(bullets);
      this.lastShootTime = currentTime;
    }
  }

  shoot(bullets) {
    const bulletImages = [
      "img/bullets/abajo/bullet-n-1-1.png",
      "img/bullets/abajo/bullet-n-1-2.png",
      "img/bullets/abajo/bullet-n-1-3.png",
      "img/bullets/abajo/bullet-n-1-4.png",
    ];

    bullets.push(
      new Bullet(
        this.x + this.width / 2,
        this.y + this.height,
        20,
        40,
        3,
        bulletImages,
        2
      )
    );
  }

  updateBulletPositions() {
    this.bulletPositions = [
      { x: this.x + this.width / 2 - 10, y: this.y }, // Arriba
      { x: this.x + this.width / 2 - 10, y: this.y + this.height }, // Abajo
      { x: this.x, y: this.y + this.height / 2 - 10 }, // Izquierda
      { x: this.x, y: this.y + this.height / 2 - 40 }, // Izquierda arriba
      { x: this.x + this.width, y: this.y + this.height / 2 - 10 }, // Derecha
    ];
  }

  shootSpecial(bullets) {
    const bulletImagesUp = [
      "img/bullets/vertical/boss/bullet-n-1-1.png",
      "img/bullets/vertical/boss/bullet-n-1-2.png",
      "img/bullets/vertical/boss/bullet-n-1-3.png",
      "img/bullets/vertical/boss/bullet-n-1-4.png",
    ];

    const bulletImagesDown = [
      "img/bullets/abajo/bullet-n-1-1.png",
      "img/bullets/abajo/bullet-n-1-2.png",
      "img/bullets/abajo/bullet-n-1-3.png",
      "img/bullets/abajo/bullet-n-1-4.png",
    ];

    const bulletImagesLeft = [
      "img/bullets/horizontal/izquierda/boss/bullet-n-1-1.png",
      "img/bullets/horizontal/izquierda/boss/bullet-n-1-2.png",
      "img/bullets/horizontal/izquierda/boss/bullet-n-1-3.png",
      "img/bullets/horizontal/izquierda/boss/bullet-n-1-4.png",
    ];

    const bulletImagesRight = [
      "img/bullets/horizontal/derecha/boss/bullet-n-1-1.png",
      "img/bullets/horizontal/derecha/boss/bullet-n-1-2.png",
      "img/bullets/horizontal/derecha/boss/bullet-n-1-3.png",
      "img/bullets/horizontal/derecha/boss/bullet-n-1-4.png",
    ];

    this.bulletPositions.forEach((pos) => {
      let direction = 0;
      let currentBulletImages = bulletImagesUp;
      let bulletWidth = 20;
      let bulletHeight = 40;

      // Disparo hacia la izquierda
      if (pos.x === this.x) {
        direction = -1;
        currentBulletImages = bulletImagesLeft;
        bulletWidth = 40;
        bulletHeight = 20;
      }
      // Disparo hacia la derecha
      else if (pos.x === this.x + this.width) {
        direction = 1;
        currentBulletImages = bulletImagesRight;
        bulletWidth = 40;
        bulletHeight = 20;
      }
      // Disparo hacia abajo
      else if (pos.y === this.y + this.height) {
        direction = 2;
        currentBulletImages = bulletImagesDown;
        bulletWidth = 20;
        bulletHeight = 40;
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
  }

  draw(currentTime) {
    if (currentTime - this.lastFrameTime > this.animationInterval) {
      this.imageIndex = (this.imageIndex + 1) % this.images.length;
      this.lastFrameTime = currentTime;
    }

    image(
      this.images[this.imageIndex],
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}
