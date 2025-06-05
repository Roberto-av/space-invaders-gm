const playerWidth = 48;
const playerHeight = 48;
const enemyWidth = 48;
const enemyHeight = 48;
const menuFontSize = 24;
let soundManager;

let player;
let enemyManager;
let lastTime = 0;
let bullets = [];
let bulletsEnemies = [];
let explosions = [];
let stars = [];
let score = 0;
let level = 1;
let maxEnemigos = 10;
let contEnemigos = 0;
let isPlaying = false;
let speed = 300;
let gameStarted = false;
let gameOverState = false;
let gameFlagStart = true;
let mejoras;
let startTime = null;
let showUpgradeMenu = false;
let selectedOptionIndex = 0;
let availableUpgrades = [];
let isPaused = false;
let pauseMenuFontSize = 50;
let movingLeft = false;
let movingRight = false;

// Elementos del DOM (los seleccionaremos en setup())
let startButton;
let restartButton;

function preload() {
  // Precargan los sonidos si es necesario
  // soundManager se inicializará en setup()
}

function setup() {
  console.log("[setup] Se está ejecutando setup() correctamente");
  // Crear el canvas - equivalente a tu configuración original
  const canvas = createCanvas(600, 550);
  canvas.parent("game-container");

  // Seleccionar elementos del DOM
  startButton = select("#startButton");
  console.log("[setup] startButton:", startButton);
  restartButton = select("#restartButton");

  // Configurar el juego
  //soundManager = new SoundManager();
  initGame();

  // Configurar eventos (similar a tu código original)
  startButton.mousePressed(() => {
    console.log("Se presionó el botón Start");
    if (gameFlagStart == true) {
      if (!isPlaying && !gameStarted) {
        gameStarted = true;
        startButton.attribute("disabled", "");
        isPlaying = true;
        startTime = millis();
        enemyManager.init(level);
        //soundManager.backgroundMusic.play();
        loop();
      }
    } else {
      //soundManager.stopGameOverSound();
    }
  });

  restartButton.mousePressed(() => {
    if (gameOverState) {
      //soundManager.stopGameOverSound();
      resetGame();
    }
  });
  noLoop(); // Pausamos el bucle hasta que el juego comience
}

function draw() {
  // Equivalente a tu función update()
  const time = millis();

  if (!player.isAlive()) return;

  if (isPaused) {
    drawPauseMenu();
    return;
  }

  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;

  clear();

  if (showUpgradeMenu) {
    drawUpgradeMenu();
    return;
  }

  if (!isPlaying) {
    drawControls();
    return;
  }

  player.movingLeft = movingLeft;
  player.movingRight = movingRight;

  updateStars();
  player.draw();
  player.move(deltaTime);

  bullets.forEach((bullet) => {
    bullet.draw(time);
    bullet.move();
  });

  bulletsEnemies.forEach((bullet) => {
    bullet.draw(time);
    bullet.move();
  });

  enemyManager.updateEnemies(bulletsEnemies);
  checkCollision();
  drawScoreAndLevel();

  // Dibujar explosiones
  for (let i = explosions.length - 1; i >= 0; i--) {
    const explosion = explosions[i];
    explosion.update();
    explosion.draw();

    if (explosion.finished) {
      explosions.splice(i, 1); 
    }
  }

  if (contEnemigos >= maxEnemigos) {
    levelUp();
  }
}

function initGame() {
  player = new Player(
    width / 2 - playerWidth / 2,
    height - playerHeight - 10,
    playerWidth,
    playerHeight,
    speed,
    width,
    height
    //soundManager.shootSound
  );

  mejoras = new Mejoras(player);

  enemyManager = new EnemyManager(
    width,
    height,
    enemyWidth,
    enemyHeight,
    level
  );

  bullets = [];
  bulletsEnemies = [];
  explosions = [];
  stars = [];
  score = 0;
  if (!level || level < 1) {
    level = 1; // Solo se asigna si no existe
  }
  maxEnemigos = 10;
  contEnemigos = 0;
  speed = 300;

  movingLeft = false;
  movingRight = false;

  initStars();
}

function drawControls() {
  const controls = [
    { text: "Controles:", y: 50 },
    { text: "A, D: Mover", y: 100 },
    { text: "Enter: Disparar", y: 150 },
  ];

  fill(255);
  textSize(20);
  textAlign(CENTER);

  controls.forEach((control) => {
    text(control.text, width / 2, control.y);
  });
}

function resetGame() {
  if (!gameOverState) return;

  initGame();
  startTime = millis();
  enemyManager.init(level);
  /*  soundManager.stopBackgroundMusic();
  soundManager.backgroundMusic.play(); */
  isPlaying = true;
  loop();

  restartButton.attribute("disabled", "");
  const restartText = select("#restartText");
  restartText.html("");
  gameOverState = false;
  gameStarted = false;
}

function initStars() {
  for (let i = 0; i < 100; i++) {
    let x = random(width);
    let y = random(height);
    let radius = random(2);
    let speed = random(1, 3);
    stars.push(new Star(x, y, radius, speed, height));
  }
}

function updateStars() {
  stars.forEach((star) => {
    star.update();
    star.draw();
  });
}

function checkCollision() {
  bullets.forEach((bullet, bulletIndex) => {
    enemyManager.enemies.forEach((enemy, enemyIndex) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.height + bullet.y > enemy.y
      ) {
        bullets.splice(bulletIndex, 1);
        //soundManager.playExplosionSound();

        if (enemy.takeDamage()) {
          enemyManager.enemies.splice(enemyIndex, 1);

          const explosionImages = [
            "img/explosion/explosion-1-1.png",
            "img/explosion/explosion-1-2.png",
            "img/explosion/explosion-1-3.png",
            "img/explosion/explosion-1-4.png",
            "img/explosion/explosion-1-5.png",
            "img/explosion/explosion-1-6.png",
            "img/explosion/explosion-1-7.png",
            "img/explosion/explosion-1-8.png",
            "img/explosion/explosion-1-9.png",
            "img/explosion/explosion-1-10.png",
            "img/explosion/explosion-1-11.png",
            "img/explosion/explosion-1-12.png",
          ];
          const newExplosion = new Explosion(
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height,
            explosionImages
          );
          newExplosion.preload();
          explosions.push(newExplosion);

          if (enemy.type === 2) {
            score += 3;
          } else {
            score++;
          }
          contEnemigos++;
        }
      }
    });
  });

  // Colisión entre el jugador y las balas de los enemigos
  enemyManager.bullets.forEach((bullet, bulletIndex) => {
    if (
      bullet.x < player.x + player.width &&
      bullet.x + bullet.width > player.x &&
      bullet.y < player.y + player.height &&
      bullet.height + bullet.y > player.y
    ) {
      enemyManager.bullets.splice(bulletIndex, 1);
      player.loseLife();
      //soundManager.playLifeLostSound();
      if (!player.isAlive()) {
        gameOver();
      }
    }
  });

  // Colisión entre el jugador y los enemigos o si tocan el borde inferior
  for (let i = enemyManager.enemies.length - 1; i >= 0; i--) {
    const enemy = enemyManager.enemies[i];
    const hitPlayer =
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.height + player.y > enemy.y;

    const touchedBottom = enemy.y + enemy.height >= height;

    if (hitPlayer) {
      enemyManager.enemies.splice(i, 1);
      player.loseLife(); 
      if (!player.isAlive()) {
        gameOver();
      }
    } else if (touchedBottom) {
      enemyManager.enemies.splice(i, 1);
      player.lives--; 
      if (!player.isAlive()) {
        gameOver();
      }
    }
  }
}

function drawPauseMenu() {
  fill(0, 0, 0, 128);
  rect(0, 0, width, height);

  fill(255);
  textSize(pauseMenuFontSize);
  textAlign(CENTER);
  text("PAUSE", width / 2, height / 2);
}

function gameOver() {
  isPlaying = false;
  gameOverState = true;
  clear();

  /*  soundManager.stopBackgroundMusic();
  soundManager.playGameOverSound(); */

  fill(255, 0, 0);
  textSize(50);
  textAlign(CENTER);
  text("GAME OVER", width / 2, height / 2);

  gameFlagStart = false;
  const restartText = select("#restartText");
  restartText.html("Reiniciar");
  restartText.style("visibility", "visible");

  restartButton.removeAttribute("disabled");
  noLoop();
}

function drawScoreAndLevel() {
  fill(255);
  textSize(20);

  const currentTime = millis();
  const elapsedTime = Math.floor((currentTime - startTime) / 1000);
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  text(`Score: ${score}`, 50, 30);
  text(`restantes: ${contEnemigos} / ${maxEnemigos}`, 85, 60);
  text(`Nivel: ${level}`, width - 100, 30);
  text(`Vidas: ${player.lives} / ${player.maxLives}`, width / 2 - 50, 30);
  text(`Time: ${formattedTime}`, width - 100, 60);
}

function resetKeys() {
  player.keys = {};
}

function drawUpgradeMenu() {
  const menuWidth = 300;
  const menuHeight = 200;
  const menuX = width / 2 - menuWidth / 2;
  const menuY = height / 2 - menuHeight / 2;

  fill(0, 0, 0, 200);
  rect(menuX, menuY, menuWidth, menuHeight);

  fill(255);
  textSize(menuFontSize);
  textAlign(CENTER);
  text("Escoge una mejora", width / 2, menuY + 40);

  availableUpgrades.forEach((upgrade, index) => {
    fill(index === selectedOptionIndex ? color(255, 255, 0) : 255);
    text(upgrade.name, width / 2, menuY + 80 + index * 40);
  });
}

function levelUp() {
  level++;
  enemyManager.maxActiveEnemies += level + 3;
  contEnemigos = 0;
  showUpgradeMenu = true;

  let incrementoAleatorio = Math.floor(random(5, 10));
  maxEnemigos += incrementoAleatorio;
  player.levelUp();

  availableUpgrades = mejoras
    .obtenerMejorasAleatorias()
    .map((mejora, index) => ({
      name: `${index + 1}. ${mejora.texto}`,
      action: mejora.funcion,
    }));

  showUpgradeMenu = true;
  isPlaying = false;

  resetKeys();
}

function keyPressed() {
  if (key === "Escape") {
    isPaused = !isPaused;
    if (!isPaused) {
      loop();
    } else {
      noLoop();
    }
    return false;
  } else if (showUpgradeMenu) {
    if (key === "Enter") {
      if (availableUpgrades[selectedOptionIndex]) {
        availableUpgrades[selectedOptionIndex].action();
        showUpgradeMenu = false;
        isPlaying = true;
        enemyManager.init(level);
        loop();
      }
    } else if (key === "w" || keyCode === UP_ARROW) {
      selectedOptionIndex =
        (selectedOptionIndex - 1 + availableUpgrades.length) %
        availableUpgrades.length;
    } else if (key === "s" || keyCode === DOWN_ARROW) {
      selectedOptionIndex =
        (selectedOptionIndex + 1) % availableUpgrades.length;
    }
    return false;
  } else if (isPlaying) {
    // Control de movimiento
    if (key === "a" || key === "A") movingLeft = true;
    else if (key === "d" || key === "D") movingRight = true;
    // Disparo
    else if (key === "Enter") {
      player.shoot(bullets);
    }
    return false;
  }
}

function keyReleased() {
  if (key === "a" || key === "A") movingLeft = false;
  else if (key === "d" || key === "D") movingRight = false;
}
