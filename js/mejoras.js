class Mejoras {
  constructor(player) {
    this.player = player;
    this.maxAumentarNumeroBalas = 2;
    this.aumentarNumeroBalasCount = 0;
    this.maxDispararBalasLado = 1;
    this.dispararBalasLadoCount = 0;

    this.opcionesMejoras = [
      { texto: "Vida Extra", funcion: this.vidaExtra.bind(this) },
      {
        texto: "Incrementar Velocidad de Disparo",
        funcion: this.incrementarVelocidadDisparo.bind(this),
      },
      {
        texto: "Aumentar Número de Balas",
        funcion: this.aumentarNumeroBalas.bind(this),
      },
      {
        texto: "Disparar balas de lado",
        funcion: this.dispararBalasLado.bind(this),
      },
      {
        texto: "Aumentar velocidad de la nave",
        funcion: this.aumentarVelocidadNave.bind(this),
      },
      {
        texto: "Recuperar todas las vidas",
        funcion: this.recuperarVidas.bind(this),
      },
    ];
  }

  obtenerMejorasAleatorias() {
    const mejorasAleatorias = [];

    const opcionesFiltradas = this.opcionesMejoras.filter((opcion) => {
      if (opcion.texto === "Aumentar Número de Balas") {
        return this.aumentarNumeroBalasCount < this.maxAumentarNumeroBalas;
      }
      if (opcion.texto === "Disparar balas de lado") {
        return this.dispararBalasLadoCount < this.maxDispararBalasLado;
      }
      return true;
    });

    while (mejorasAleatorias.length < 3 && opcionesFiltradas.length > 0) {
      const mejoraIndex = Math.floor(Math.random() * opcionesFiltradas.length);
      const mejora = opcionesFiltradas[mejoraIndex];

      if (!mejorasAleatorias.includes(mejora)) {
        mejorasAleatorias.push(mejora);
      }
    }

    return mejorasAleatorias;
  }

  vidaExtra() {
    this.player.gainLife();
  }

  incrementarVelocidadDisparo() {
    this.player.shootInterval = Math.max(this.player.shootInterval - 100, 100); // Límite mínimo
  }

  aumentarNumeroBalas() {
    this.player.aumentarNumeroBalas();
    this.aumentarNumeroBalasCount++;
  }

  dispararBalasLado() {
    this.player.activarDisparoLateral();
    this.dispararBalasLadoCount++;
  }

  enemigosArrojanBalas() {
    console.log("Enemigos arrojarán balas");
  }

  lanzarGranadas() {
    console.log("Granadas activadas");
  }

  aumentarVelocidadNave() {
    this.player.speed += 50;
    console.log("Velocidad de la nave aumentada");
  }

  recuperarVidas() {
    this.player.recuperarTodasLasVidas();
  }

  evolucionarNave() {
    console.log("Nave evolucionada");
  }

  armaLegendaria() {
    console.log("Arma legendaria obtenida");
  }
}
