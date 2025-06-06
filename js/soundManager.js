class SoundManager {
  constructor() {
    this.sounds = {
      background: null,
      shoot: null,
      explosion: null,
      lifeLost: null,
      gameOver: null,
      bossMusic: null,
    };

    this.soundPaths = {
      background: "sonidos/fondo/neon-gaming-128925.mp3",
      shoot: "sonidos/disparos/scifi002.mp3",
      explosion: "sonidos/explosion/007131711_prev.mp3",
      lifeLost: "sonidos/perder-vida/wrong-100536.mp3",
      gameOver:
        "sonidos/game-over/8-bit-video-game-lose-sound-version-1-145828.mp3",
      bossMusic:
        "sonidos/boss/retro-chiptune-adventure-8-bit-video-game-music-318059.mp3",
    };

    this.volumes = {
      background: 0.05,
      shoot: 0.2,
      explosion: 0.4,
      lifeLost: 0.2,
      gameOver: 0.1,
      bossMusic: 0.05,
    };

    this.loaded = false;
  }

  preload() {
    // Cargar todos los sonidos
    this.sounds.background = loadSound(this.soundPaths.background);
    this.sounds.shoot = loadSound(this.soundPaths.shoot);
    this.sounds.explosion = loadSound(this.soundPaths.explosion);
    this.sounds.lifeLost = loadSound(this.soundPaths.lifeLost);
    this.sounds.gameOver = loadSound(this.soundPaths.gameOver);
    this.sounds.bossMusic = loadSound(this.soundPaths.bossMusic);

    this.loaded = true;
  }

  // Métodos para reproducir sonidos
  playBackgroundMusic() {
    if (!this.loaded) return;

    this.sounds.background.setVolume(this.volumes.background);
    this.sounds.background.loop();
  }

  playShootSound() {
    if (!this.loaded) return;

    this.sounds.shoot.setVolume(this.volumes.shoot);
    this.sounds.shoot.stop(); // Detener si ya se está reproduciendo
    this.sounds.shoot.play();
  }

  playExplosionSound() {
    if (!this.loaded) return;

    this.sounds.explosion.setVolume(this.volumes.explosion);
    this.sounds.explosion.stop();
    this.sounds.explosion.play();

    setTimeout(() => {
      this.sounds.explosion.stop();
    }, 300);
  }

  playLifeLostSound() {
    if (!this.loaded) return;

    this.sounds.lifeLost.setVolume(this.volumes.lifeLost);
    this.sounds.lifeLost.stop();
    this.sounds.lifeLost.play();

    setTimeout(() => {
      this.sounds.lifeLost.stop();
    }, 500);
  }

  stopBackgroundMusic() {
    if (!this.loaded) return;

    this.sounds.background.stop();
  }

  playGameOverSound() {
    if (!this.loaded) return;

    this.sounds.gameOver.setVolume(this.volumes.gameOver);
    this.sounds.gameOver.stop();
    this.sounds.gameOver.play();
  }

  stopGameOverSound() {
    if (!this.loaded) return;

    this.sounds.gameOver.stop();
  }

  // Método para ajustar volúmenes dinámicamente
  setVolume(soundName, volume) {
    if (!this.loaded || !this.sounds[soundName]) return;

    this.volumes[soundName] = volume;
    this.sounds[soundName].setVolume(volume);
  }

  playBossMusic() {
    if (this.sounds.bossMusic && !this.sounds.bossMusic.isPlaying()) {
      this.sounds.bossMusic.setVolume(this.volumes.bossMusic);
      this.sounds.bossMusic.setLoop(true);
      this.sounds.bossMusic.play();
    }
  }

  stopBossMusic() {
    if (this.sounds.bossMusic && this.sounds.bossMusic.isPlaying()) {
      this.sounds.bossMusic.stop();
    }
  }
}
