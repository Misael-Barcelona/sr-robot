// =====================================================
//  SRROBOT.MID  -  Melodía original de la casa
//  Sintetizador FM (estilo Sound Blaster / AdLib)
//  Los navegadores de hoy ya no tocan MIDI, así que
//  "tocamos" las notas con Web Audio.
// =====================================================

var musica = {
  ctx: null,
  salida: null,
  ruido: null,
  sonando: false,
  paso: 0,
  siguiente: 0,
  temporizador: null,
  inicio: 0
};

var TEMPO = 132;
var CORCHEA = 60 / TEMPO / 2;

// Cada compás son 8 corcheas. "-" alarga la nota anterior, "." es silencio.
var MELODIA = [
  "E5 G5 C6 G5 E5 G5 A5 G5",
  "E5 C5 E5 A5 G5 E5 D5 C5",
  "F5 A5 C6 A5 G5 F5 E5 F5",
  "D5 E5 F5 G5 B5 A5 G5 -",
  "C6 - B5 C6 G5 - E5 G5",
  "A5 - G5 A5 E5 - C5 E5",
  "F5 G5 A5 C6 D6 C6 A5 F5",
  "G5 - D5 - G4 B4 D5 G5",
  "A5 - A5 G5 F5 - E5 F5",
  "G5 - G5 F5 E5 - D5 E5",
  "E5 G5 B5 G5 E5 G5 B5 D6",
  "C6 - B5 A5 E5 - - .",
  "F5 A5 C6 F6 E6 C6 A5 C6",
  "D6 B5 G5 B5 D6 - C6 B5",
  "C6 G5 E5 G5 C6 E6 D6 C6",
  "C6 - - - G5 - C6 ."
];

var ACORDES = ["C3", "A2", "F2", "G2", "C3", "A2", "F2", "G2",
               "F2", "G2", "E2", "A2", "F2", "G2", "C3", "C3"];

// Bombo, caja y charles: un clásico "pum-chas"
var BATERIA = ["b", "h", "c", "h", "b", "b", "c", "h"];

function frecuencia(nota) {
  var nombres = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
  var semitonos = nombres[nota.charAt(0)];
  var octava = parseInt(nota.charAt(nota.length - 1), 10);
  if (nota.indexOf("#") > 0) semitonos++;
  return 440 * Math.pow(2, (semitonos + (octava - 4) * 12) / 12);
}

function prepararPartitura() {
  var notas = [];
  for (var c = 0; c < MELODIA.length; c++) {
    var pasos = MELODIA[c].split(" ");
    for (var p = 0; p < pasos.length; p++) notas.push(pasos[p]);
  }
  // Calcula cuánto dura cada nota contando los "-" que la siguen
  var partitura = [];
  for (var i = 0; i < notas.length; i++) {
    var duracion = 0;
    if (notas[i] != "-" && notas[i] != ".") {
      duracion = 1;
      while (notas[i + duracion] == "-") duracion++;
    }
    partitura.push({ nota: notas[i], duracion: duracion });
  }
  return partitura;
}

var PARTITURA = prepararPartitura();

// Voz FM de dos operadores: un oscilador modula a otro
function vozFM(frec, t, dur, volumen, ratio, indice) {
  var ctx = musica.ctx;
  var portadora = ctx.createOscillator();
  var moduladora = ctx.createOscillator();
  var profundidad = ctx.createGain();
  var envolvente = ctx.createGain();

  portadora.frequency.value = frec;
  moduladora.frequency.value = frec * ratio;
  profundidad.gain.setValueAtTime(frec * indice, t);
  profundidad.gain.exponentialRampToValueAtTime(frec * indice * 0.2 + 1, t + dur);

  envolvente.gain.setValueAtTime(0.0001, t);
  envolvente.gain.exponentialRampToValueAtTime(volumen, t + 0.01);
  envolvente.gain.exponentialRampToValueAtTime(volumen * 0.6, t + 0.08);
  envolvente.gain.setValueAtTime(volumen * 0.6, t + dur * 0.85);
  envolvente.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  moduladora.connect(profundidad);
  profundidad.connect(portadora.frequency);
  portadora.connect(envolvente);
  envolvente.connect(musica.salida);

  moduladora.start(t);
  portadora.start(t);
  moduladora.stop(t + dur + 0.05);
  portadora.stop(t + dur + 0.05);
}

function golpe(tipo, t) {
  var ctx = musica.ctx;
  var env = ctx.createGain();
  env.connect(musica.salida);
  if (tipo == "b") {
    var osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    env.gain.setValueAtTime(0.7, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(env);
    osc.start(t);
    osc.stop(t + 0.2);
  } else {
    var fuente = ctx.createBufferSource();
    var filtro = ctx.createBiquadFilter();
    fuente.buffer = musica.ruido;
    filtro.type = tipo == "c" ? "bandpass" : "highpass";
    filtro.frequency.value = tipo == "c" ? 1800 : 7000;
    var largo = tipo == "c" ? 0.15 : 0.04;
    env.gain.setValueAtTime(tipo == "c" ? 0.5 : 0.18, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + largo);
    fuente.connect(filtro);
    filtro.connect(env);
    fuente.start(t);
    fuente.stop(t + largo + 0.02);
  }
}

function programarPaso(i, t) {
  var paso = PARTITURA[i];
  if (paso.duracion > 0) {
    vozFM(frecuencia(paso.nota), t, paso.duracion * CORCHEA, 0.22, 1, 1.6);
  }
  var compas = Math.floor(i / 8);
  var raiz = frecuencia(ACORDES[compas]);
  vozFM(i % 2 == 0 ? raiz : raiz * 2, t, CORCHEA * 0.9, 0.18, 0.5, 2.2);
  golpe(BATERIA[i % 8], t);
}

function planificador() {
  while (musica.siguiente < musica.ctx.currentTime + 0.12) {
    programarPaso(musica.paso, musica.siguiente);
    musica.siguiente += CORCHEA;
    musica.paso = (musica.paso + 1) % PARTITURA.length;
  }
  actualizarPantalla();
}

function actualizarPantalla() {
  var segundos = musica.sonando ? Math.floor(musica.ctx.currentTime - musica.inicio) : 0;
  var mm = Math.floor(segundos / 60), ss = segundos % 60;
  var tiempo = (mm < 10 ? "0" : "") + mm + ":" + (ss < 10 ? "0" : "") + ss;
  var estado = musica.sonando ? "> " : "[] ";
  if (document.reproductor) document.reproductor.pantalla.value = estado + "SRROBOT.MID " + tiempo;
}

function musicaPlay() {
  if (musica.sonando) return;
  var Contexto = window.AudioContext || window.webkitAudioContext;
  if (!Contexto) {
    alert("Su ordenador no tiene tarjeta de sonido. ¡Tenemos la Sound Blaster 16 a 19.900 pts!");
    return;
  }
  if (!musica.ctx) {
    musica.ctx = new Contexto();
    musica.salida = musica.ctx.createGain();
    musica.salida.gain.value = 0.35;
    musica.salida.connect(musica.ctx.destination);
    musica.ruido = musica.ctx.createBuffer(1, musica.ctx.sampleRate, musica.ctx.sampleRate);
    var datos = musica.ruido.getChannelData(0);
    for (var i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1;
  }
  musica.ctx.resume();
  musica.sonando = true;
  musica.paso = 0;
  musica.inicio = musica.ctx.currentTime;
  musica.siguiente = musica.ctx.currentTime + 0.05;
  musica.temporizador = setInterval(planificador, 25);
}

function musicaStop() {
  if (!musica.sonando) return;
  musica.sonando = false;
  clearInterval(musica.temporizador);
  musica.ctx.suspend();
  actualizarPantalla();
}
