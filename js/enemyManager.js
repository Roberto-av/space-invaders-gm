class EnemyManager {
  constructor(canvasWidth, canvasHeight, width, height, level) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.width = width;
    this.height = height;
    this.level = level;
    this.enemies = [];
    this.bullets = [];
    this.maxActiveEnemies = 3;
    this.spawnRate = 1000;
    this.totalEnemies = 0;
    this.timeElapsed = 0;
    this.bossSpawnTime = 120000;
    this.bossAppearanceTime = 0;
    this.bossAppearanceInterval = 60000;
    this.bossSpawned = false;
    this.imageSrcs = [
      "img/enemigos/1/enemigo-1-r.png",
      "img/enemigos/1/enemigo-1-m.png",
    ];
    this.spawnInterval = null; // Para almacenar el intervalo
  }

  init(playerLevel) {
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
    }

    this.totalEnemies = 0;

    this.spawnInterval = setInterval(() => {
      if (playerLevel === 1 && this.totalEnemies >= 10) {
        clearInterval(this.spawnInterval);
        return;
      }

      if (this.enemies.length < this.maxActiveEnemies + playerLevel) {
        if (playerLevel === 1) {
          this.createEnemy(1); // Solo enemigos débiles en el nivel 1
        } else {
          const chance = random();
          if (chance > 0.8) {
            this.createEnemy(2); // Enemigos tipo 2 con disparos
          } else {
            this.createEnemy(1); // Mezclados con enemigos tipo 1
          }
        }

        this.totalEnemies++;
      }

      // Activar aparición del jefe solo si es nivel 2 o más
      if (playerLevel > 1) {
        const currentTime = millis();

        if (this.bossSpawned) {
          if (
            currentTime - this.bossAppearanceTime >=
            this.bossAppearanceInterval
          ) {
            this.createBoss(true);
            this.bossSpawned = true;
            this.bossAppearanceTime = currentTime;
          }
        } else if (this.timeElapsed >= this.bossSpawnTime) {
          if (!this.enemies.some((enemy) => enemy.type === 3)) {
            this.createBoss();
            this.bossSpawned = true;
            this.bossAppearanceTime = currentTime;
          }
        }
      }

      this.timeElapsed += this.spawnRate;
    }, this.spawnRate);
  }

  createEnemy(type) {
    const x = random(this.canvasWidth - this.width);
    let canShoot = false;
    let speed = 1 + this.level * 0.5;

    if (type === 2) {
      this.imageSrcs = [
        "img/enemigos/2/enemigo-2-r-m.png",
        "img/enemigos/2/enemigo-2-m-r.png",
      ];
      health = 2;
      canShoot = true;
      speed = 2 + this.level * 0.3;
    } else {
      this.imageSrcs = [
        "img/enemigos/1/enemigo-1-r.png",
        "img/enemigos/1/enemigo-1-m.png",
      ];
    }

    const enemy = new Enemy(
      x,
      0,
      this.width,
      this.height,
      speed,
      this.imageSrcs,
      this.canvasWidth,
      this.canvasHeight,
      type,
      health,
      canShoot
    );
    this.enemies.push(enemy);
  }

  createBoss(increasedFireRate = false) {
    const x = random(this.canvasWidth - this.width);
    const bossImageSrcs = [
      "img/enemigos/mini-boss/enemigo-mini-jefe-1-r.png",
      "img/enemigos/mini-boss/enemigo-mini-jefe-1-m.png",
    ];

    const boss = new Enemy(
      x,
      0,
      this.width * 2,
      this.height * 2,
      1,
      bossImageSrcs,
      this.canvasWidth,
      this.canvasHeight,
      3,
      20,
      true
    );

    if (increasedFireRate) {
      boss.bossShootCooldown = 500;
    }

    this.enemies.push(boss);
  }

  updateEnemies(bullets) {
    const currentTime = millis();
    this.bullets = bullets;

    // Usamos un bucle for tradicional para evitar problemas al modificar el array durante la iteración
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.move(currentTime, bullets);
      enemy.draw(currentTime);

      if (enemy.y > this.canvasHeight || enemy.health <= 0) {
        this.enemies.splice(i, 1);
        this.totalEnemies++;

        if (enemy.type === 3) {
          this.bossSpawned = false;
          this.bossAppearanceTime = currentTime;
        }
      }
    }
  }

  // Método para limpiar cuando el juego se reinicia
  cleanup() {
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
    this.enemies = [];
    this.bullets = [];
    this.bossSpawned = false;
  }
}
