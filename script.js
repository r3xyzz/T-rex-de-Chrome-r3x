//****** GAME LOOP ********//

// Variables para gestionar el tiempo
var time = new Date();
var deltaTime = 0;

// Verifica si el documento está listo para inicializar el juego
if(document.readyState === "complete" || document.readyState === "interactive"){
    setTimeout(Init, 1);
}else{
    document.addEventListener("DOMContentLoaded", Init); 
}

// Inicializa el juego
function Init() {
    time = new Date();
    Start();
    Loop();
}

// Bucle principal del juego
function Loop() {
    // Calcula el tiempo transcurrido desde el último frame
    deltaTime = (new Date() - time) / 1000;
    time = new Date();
    
    // Actualiza el estado del juego
    Update();
    
    // Solicita la siguiente animación
    requestAnimationFrame(Loop);
}

//****** GAME LOGIC ********//

// Variables relacionadas con la física del juego
var sueloY = 22; // Posición del suelo en el eje Y
var velY = 0; // Velocidad vertical del dinosaurio
var impulso = 900; // Impulso del salto
var gravedad = 2500; // Fuerza de la gravedad

// Variables relacionadas con la posición del dinosaurio
var dinoPosX = 42; // Posición X del dinosaurio
var dinoPosY = sueloY; // Posición Y del dinosaurio

// Variables relacionadas con el suelo
var sueloX = 0; // Posición X del suelo
var velEscenario = 1280/3; // Velocidad de desplazamiento del escenario
var gameVel = 1; // Velocidad del juego
var score = 0; // Puntuación del juego

// Variables para gestionar el estado del juego
var parado = false; // Indica si el juego está detenido
var saltando = false; // Indica si el dinosaurio está saltando

// Variables para gestionar la creación de obstáculos
var tiempoHastaObstaculo = 2; // Tiempo hasta el próximo obstáculo
var tiempoObstaculoMin = 0.7; // Tiempo mínimo entre obstáculos
var tiempoObstaculoMax = 1.8; // Tiempo máximo entre obstáculos
var obstaculoPosY = 16; // Posición Y de los obstáculos
var obstaculos = []; // Array que almacena los obstáculos

// Variables para gestionar la creación de nubes
var tiempoHastaNube = 0.5; // Tiempo hasta la próxima nube
var tiempoNubeMin = 0.7; // Tiempo mínimo entre nubes
var tiempoNubeMax = 2.7; // Tiempo máximo entre nubes
var maxNubeY = 270; // Posición máxima Y de las nubes
var minNubeY = 100; // Posición mínima Y de las nubes
var nubes = []; // Array que almacena las nubes
var velNube = 0.5; // Velocidad de las nubes

// Referencias a los elementos del DOM
var contenedor;
var dino;
var textoScore;
var suelo;
var gameOver;

// Inicializa las referencias y eventos
function Start() {
    gameOver = document.querySelector(".game-over");
    suelo = document.querySelector(".suelo");
    contenedor = document.querySelector(".contenedor");
    textoScore = document.querySelector(".score");
    dino = document.querySelector(".dino");
    document.addEventListener("keydown", HandleKeyDown);
}

// Actualiza el estado del juego en cada frame
function Update() {
    if(parado) return;
    
    MoverDinosaurio();
    MoverSuelo();
    DecidirCrearObstaculos();
    DecidirCrearNubes();
    MoverObstaculos();
    MoverNubes();
    DetectarColision();

    // Aplica gravedad al dinosaurio
    velY -= gravedad * deltaTime;
}

// Maneja la entrada del teclado (tecla espacio) para hacer saltar al dinosaurio
function HandleKeyDown(ev){
    if(ev.keyCode == 32){
        Saltar();
    }
}

// Hace saltar al dinosaurio
function Saltar(){
    if(dinoPosY === sueloY){
        saltando = true;
        velY = impulso;
        dino.classList.remove("dino-corriendo");
    }
}

// Mueve al dinosaurio según su velocidad vertical
function MoverDinosaurio() {
    dinoPosY += velY * deltaTime;
    if(dinoPosY < sueloY){
        TocarSuelo();
    }
    dino.style.bottom = dinoPosY+"px";
}

// Restaura el dinosaurio al tocar el suelo
function TocarSuelo() {
    dinoPosY = sueloY;
    velY = 0;
    if(saltando){
        dino.classList.add("dino-corriendo");
    }
    saltando = false;
}

// Mueve el suelo para simular desplazamiento
function MoverSuelo() {
    sueloX += CalcularDesplazamiento();
    suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
}

// Calcula el desplazamiento basado en la velocidad del juego
function CalcularDesplazamiento() {
    return velEscenario * deltaTime * gameVel;
}

// Cambia el estado del dinosaurio a estrellado y detiene el juego
function Estrellarse() {
    dino.classList.remove("dino-corriendo");
    dino.classList.add("dino-estrellado");
    parado = true;
}

// Decide si es momento de crear un nuevo obstáculo
function DecidirCrearObstaculos() {
    tiempoHastaObstaculo -= deltaTime;
    if(tiempoHastaObstaculo <= 0) {
        CrearObstaculo();
    }
}

// Decide si es momento de crear una nueva nube
function DecidirCrearNubes() {
    tiempoHastaNube -= deltaTime;
    if(tiempoHastaNube <= 0) {
        CrearNube();
    }
}

// Crea un nuevo obstáculo (cactus)
function CrearObstaculo() {
    var obstaculo = document.createElement("div");
    contenedor.appendChild(obstaculo);
    obstaculo.classList.add("cactus");
    if(Math.random() > 0.5) obstaculo.classList.add("cactus2");
    obstaculo.posX = contenedor.clientWidth;
    obstaculo.style.left = contenedor.clientWidth+"px";

    obstaculos.push(obstaculo);
    tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax-tiempoObstaculoMin) / gameVel;
}

// Crea una nueva nube
function CrearNube() {
    var nube = document.createElement("div");
    contenedor.appendChild(nube);
    nube.classList.add("nube");
    nube.posX = contenedor.clientWidth;
    nube.style.left = contenedor.clientWidth+"px";
    nube.style.bottom = minNubeY + Math.random() * (maxNubeY-minNubeY)+"px";
    
    nubes.push(nube);
    tiempoHastaNube = tiempoNubeMin + Math.random() * (tiempoNubeMax-tiempoNubeMin) / gameVel;
}

// Mueve los obstáculos y los elimina cuando salen de la pantalla
function MoverObstaculos() {
    for (var i = obstaculos.length - 1; i >= 0; i--) {
        if(obstaculos[i].posX < -obstaculos[i].clientWidth) {
            obstaculos[i].parentNode.removeChild(obstaculos[i]);
            obstaculos.splice(i, 1);
            GanarPuntos();
        }else{
            obstaculos[i].posX -= CalcularDesplazamiento();
            obstaculos[i].style.left = obstaculos[i].posX+"px";
        }
    }
}

// Mueve las nubes y las elimina cuando salen de la pantalla
function MoverNubes() {
    for (var i = nubes.length - 1; i >= 0; i--) {
        if(nubes[i].posX < -nubes[i].clientWidth) {
            nubes[i].parentNode.removeChild(nubes[i]);
            nubes.splice(i, 1);
        }else{
            nubes[i].posX -= CalcularDesplazamiento() * velNube;
            nubes[i].style.left = nubes[i].posX+"px";
        }
    }
}

// Incrementa la puntuación y ajusta la velocidad del juego y el fondo
function GanarPuntos() {
    score++;
    textoScore.innerText = score;
    if(score == 5){
        gameVel = 1.5;
        contenedor.classList.add("mediodia");
    }else if(score == 10) {
        gameVel = 2;
        contenedor.classList.add("tarde");
    } else if(score == 20) {
        gameVel = 3;
        contenedor.classList.add("noche");
    }
    suelo.style.animationDuration = (3/gameVel)+"s";
}

// Termina el juego cuando el dinosaurio colisiona con un obstáculo
function GameOver() {
    Estrellarse();
    gameOver.style.display = "block";
}

// Detecta la colisión entre el dinosaurio y los obstáculos
function DetectarColision() {
    for (var i = 0; i < obstaculos.length; i++) {
        if(obstaculos[i].posX > dinoPosX + dino.clientWidth) {
            //EVADE
            break; // Al estar en orden, no puede chocar con más
        }else{
            if(IsCollision(dino, obstaculos[i], 10, 30, 15, 20)) {
                GameOver();
            }
        }
    }
}

// Determina si hay colisión entre dos elementos con padding adicional
function IsCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
        (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
        (aRect.left + paddingLeft > (bRect.left + bRect.width))
    );
}
