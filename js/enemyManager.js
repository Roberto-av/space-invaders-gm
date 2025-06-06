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
    this.spawnRate = 2000;
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
    this.enemyScore = 0;
  }

  init(playerLevel) {
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
    }

    this.totalEnemies = 0;

    this.spawnInterval = setInterval(() => {
      if (this.enemies.length < this.maxActiveEnemies + playerLevel) {
        if (playerLevel === 1) {
          this.createEnemy(1);
        } else if (playerLevel === 2) {
          const chance = random();
          if (chance > 0.8) {
            this.createEnemy(2);
          } else {
            this.createEnemy(1);
          }
        } else if (playerLevel >= 3) {
          const chance = random();

          // Spawnea el jefe SOLO una vez
          if (!this.bossSpawned) {
            this.createBoss(true);
            this.bossSpawned = true;
          }

          if (chance < 0.20) {
            this.spawnEnemyGroup(3, 5);
          } else if (chance < 0.40) {
            this.createEnemy(2);
          } else {
            this.createEnemy(1);
          }
        }

        this.totalEnemies++;
      }

      // Activar aparición del jefe solo si es nivel 2 o más
      /*       if (playerLevel > 1) {
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
      } */

      this.timeElapsed += this.spawnRate;
    }, this.spawnRate);
  }

  createEnemy(type) {
    const x = random(this.canvasWidth - this.width);
    const isLevel1 = this.level === 1;

    // Configuración base por tipo de enemigo
    const enemyConfigs = {
      1: {
        imageSrcs: [
          "img/enemigos/1/enemigo-1-r.png",
          "img/enemigos/1/enemigo-1-m.png",
        ],
        health: 1,
        canShoot: false,
        speed: isLevel1 ? 1 : 1 + this.level * 0.5,
      },
      2: {
        imageSrcs: [
          "img/enemigos/2/enemigo-2-r-m.png",
          "img/enemigos/2/enemigo-2-m-r.png",
        ],
        health: 3,
        canShoot: true,
        speed: isLevel1 ? 1.2 : 2 + this.level * 0.3,
      },
      3: {
        imageSrcs: [
          "img/enemigos/3/enemigo-3-r.png",
          "img/enemigos/3/enemigo-3-m.png",
        ],
        health: 1,
        canShoot: true,
        speed: isLevel1 ? 1.5 : 2 + this.level * 0.4,
      },
    };

    const config = enemyConfigs[type];

    if (!config) {
      console.warn(`Tipo de enemigo no válido: ${type}`);
      return;
    }

    const enemy = new Enemy(
      x,
      0,
      this.width,
      this.height,
      config.speed,
      config.imageSrcs,
      this.canvasWidth,
      this.canvasHeight,
      type,
      config.health,
      config.canShoot
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
      4,
      10, // Salud del jefe
      true
    );

    if (increasedFireRate) {
      boss.bossShootCooldown = 500;
    }

    this.enemies.push(boss);
    soundManager.stopBackgroundMusic();
    soundManager.playBossMusic();
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
        console.log("Enemigo eliminado:", {
          type: enemy.type,
          health: enemy.health,
          y: enemy.y,
        });
        this.enemies.splice(i, 1);

        if (enemy.type === 4) {
          console.log(">> Jefe eliminado. Deteniendo música del jefe.");
          this.bossSpawned = false;
          soundManager.stopBossMusic();
          soundManager.playBackgroundMusic(); // Si quieres que regrese la música normal
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

  // reinicia el tiempo para evitar respawn inmediato
  resetSpawnTimer() {
    this.lastSpawnTime = millis();
  }

  spawnEnemyGroup(type, count) {
    const spacing = this.canvasWidth / (count + 1);

    for (let i = 0; i < count; i++) {
      const x = spacing * (i + 1);
      const config = {
        3: {
          imageSrcs: [
            "img/enemigos/3/enemigo-3-r.png",
            "img/enemigos/3/enemigo-3-m.png",
          ],
          health: 1,
          canShoot: false,
          speed: 2 + this.level * 0.4,
        },
      }[type];

      if (!config) return;

      const enemy = new Enemy(
        x,
        -i * 60, // escalonados en Y para no superponerse
        this.width,
        this.height,
        config.speed,
        config.imageSrcs,
        this.canvasWidth,
        this.canvasHeight,
        type,
        config.health,
        config.canShoot
      );

      this.enemies.push(enemy);
    }
  }

  removeEnemy(index, enemy) {
    this.enemies.splice(index, 1);

    if (enemy.type === 4) {
      soundManager.stopBossMusic();
      soundManager.playBackgroundMusic();
    }
  }
}
