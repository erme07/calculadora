/*
Practicas Html/CSS/Javascript - Erik Medina
*/
const teclado = document.getElementById('teclado'),
    $formula = document.querySelector(".formula"),
    $blink = document.getElementById("blink"),
    $resultado = document.getElementById("resultado"),
    $exponente = document.querySelector(".exponente"),
    $base = document.querySelector(".base"),
    $on = document.querySelector("[data-valor='on']"),
    flechaIzq = document.querySelector(".flechaIzq"),
    flechaUp = document.querySelector(".flechaUp"),
    flechaDown =document.querySelector(".flechaDown"),
    flechaRight = document.querySelector(".flechaRight"),
    contenedorFormula = document.querySelector('.contenedorFormula'),
    padDireccional = document.querySelectorAll(".navLeft, .navRight, .navUp, .navDown"),
    flechas = document.getElementById("flechas");

// const storageFormula = [],
//     storageResultado = [],
//     storageExponente = [];

const memoriaOperaciones = []

//errores personalizados
class InvalidValueError extends Error {
    constructor(message = 'Haz introducido un valor no admitido') {
        super(message);
        this.name = "InvalidValueError";
    }
}
class MathError extends Error {
    constructor(message = '  Math ERROR') {
        super(message);
        this.name = "MathError";
    }
}

//valores constantes
const ENTEROMAX = 9.999999999e+99, ENTEROMIN = -ENTEROMAX, DECIMALMINPOSITIVO = 1e-99, DECIMALMINNEGATIVO = -DECIMALMINPOSITIVO, ESPACIO_MEMORIA=8;

//modos - estados
let modoExponencial = false, mostrandoError = false, mostrandoResultado = false, modoLecturaMemoria = false, modoEdicion = false, desborde = false, presionandoDireccional = false;

//variables
let exponente, coeficiente, resultado=0;
let operacion = "", operacion_display = "", ans = 0;
let posicionMemoria = -1, posicionCursor = 0;



    
const keyMap = Object.freeze({
    argumentos: Object.freeze({
        "0": "cero",
        "1": "uno",
        "2": "dos",
        "3": "tres",
        "4": "cuatro",
        "5": "cinco",
        "6": "seis",
        "7": "siete",
        "8": "ocho",
        "9": "nueve",
        "(": "parentesisApertura",
        ")": "parentesisCierre",
        ".": "punto",
    }),
    operadores: Object.freeze({
        "+": "suma",
        "-": "resta",
        "*": "multiplicacion",
        "/": "division"
    })
});

const mapa = Object.freeze({
    multiplicacion: Object.freeze({
        front: "×",
        back: "*"
    }),
    division: Object.freeze({
        front: "÷",
        back: "/"
    }),
    resta: "-",
    suma: "+",
    punto: ".",
    parentesisApertura: "(",
    parentesisCierre: ")",
    ans: "Ans",
    uno: "1",
    dos: "2",
    tres: "3",
    cuatro: "4",
    cinco: "5",
    seis: "6",
    siete: "7",
    ocho: "8",
    nueve: "9",
    cero: "0"
})



function apagar(){
    //memoria=false;
    document.removeEventListener("keydown", keyDownFunction);
    document.removeEventListener("keyup", keyUpFunction);
    document.removeEventListener("click", clickFunction);
    resetear();
    posicionMemoria = -1;
    memoriaOperaciones.length = 0;
    $resultado.innerHTML='';
    $formula.innerHTML='';
    $blink.innerHTML = '';
    $blink.classList.remove("blink");
    encendido=false;
    $resultado.classList.add("ocultar");
    contenedorFormula.classList.add("ocultar");
    flechaDown.classList.add("ocultar");
    flechaRight.classList.add("ocultar");
    flechaUp.classList.add("ocultar");
    flechaIzq.classList.add("ocultar");
    $base.classList.add("ocultar");
    $exponente.classList.add("ocultar");
}

function encender() {
    document.addEventListener("keydown", keyDownFunction);
    document.addEventListener("keyup", keyUpFunction);
    document.addEventListener("click", clickFunction);
    //memoria=false;
    posicionMemoria = -1;
    memoriaOperaciones.length = 0;
    posicionStorage=0;
    posStorAux=0;
    encendido=true;
    $resultado.innerHTML='0';
    limpiarFormula();
    $resultado.classList.remove("ocultar");
    contenedorFormula.classList.remove("ocultar");
    flechaDown.classList.remove("ocultar");
    flechaRight.classList.remove("ocultar");
    flechaUp.classList.remove("ocultar");
    flechaIzq.classList.remove("ocultar");
    $base.classList.remove("ocultar");
    $exponente.classList.remove("ocultar");
    flechaRight.classList.remove("mostrar");
    flechaUp.classList.remove("mostrar");
    flechaIzq.classList.remove("mostrar");
}

const limpiarFormula = () => {
    operacion = '';
    operacion_display = '';
    $formula.innerHTML= operacion_display;
    $blink.innerHTML = '_';
    $blink.classList.add("blink");
}

const eliminar = () => {
    if(operacion_display[operacion_display.length - 1] === 's')
        operacion_display = operacion_display.slice(0, -3)
    else
        operacion_display = operacion_display.slice(0, -1)
    if (operacion[operacion.length - 1] === ' ')
        operacion = operacion.slice(0, -5);
    else
        operacion = operacion.slice(0, -1);
    $formula.innerHTML = operacion_display;
    $blink.classList.remove("blink");
    setTimeout(() => { $blink.classList.add("blink"); },20)
    checkDesborde();
}

function resetear() {
    console.clear();
    limpiarFormula();
    //formulaBack='';
    resultado = 0;
    $resultado.innerHTML = resultado;
    mostrandoResultado = false;
    modoExponencial = false;
    mostrandoError = false;
    desborde = false;
    $exponente.innerHTML = '';
    $base.classList.remove("base--visible");

    //displayExpo('ocultar');
    flechaIzq.classList.remove('mostrar');
    flechaRight.classList.remove('mostrar');
    error=false;
    igual=false;
    //flechasMemoria();
    modoLecturaMemoria = false;
    posicionMemoria = -1;
    manejarIndicadoresMemoria();
}


const desbordeTrue = () => {
    $formula.classList.add('formula--desbordada');
    flechaIzq.classList.add('mostrar');
    desborde = true;
}
const desbordeLeft = () => { 
    $formula.classList.add('formula--desbordada');
    flechaIzq.classList.add('mostrar');
    desborde = true;
}

const desbordeRight = () => { 
    $formula.classList.remove('formula--desbordada');
    flechaRight.classList.add('mostrar');
    flechaIzq.classList.remove('mostrar');
    desborde = true;
}

const desbordeFalse = () => {
    $formula.classList.remove('formula--desbordada');
    flechaIzq.classList.remove('mostrar');
    flechaRight.classList.remove('mostrar');
    desborde = false;
}

const checkDesborde=()=>{
    if (operacion_display.toString().length > 13 && (mostrandoResultado || modoLecturaMemoria)){
        desbordeRight();
    } else if (operacion_display.toString().length > 13 && !mostrandoResultado && !modoLecturaMemoria) {
        desbordeLeft();
    }else {
        desbordeFalse();
    }
}

function flashCursor() {
    if($formula.innerHTML === formulaDesplazada){
        $formula.innerHTML=formulaAux2
    }else{
        $formula.innerHTML=formulaDesplazada;
    }
}


function direccionPress(direccion){
    if(direccion==='right'){
        flechas.classList.toggle("rightPress");
    }else if(direccion==='left'){
        flechas.classList.toggle("leftPress");
    }else if(direccion==='up'){
        flechas.classList.toggle("highPress");
    }else if(direccion==='down'){
        flechas.classList.toggle("lowPress");
    }
    
}

function editarFormula(direccion){//pendiente de desarrollo

    if(direccion === 'left' && desborde){ 
        $blink.innerHTML='';
        if(datoCursor===''){
            formulaAux2=$formula.innerHTML;
            formulaDesplazada=$formula.innerHTML.split('');
        }else{
            formulaDesplazada=formulaDesplazada.split('');
            formulaDesplazada[posCursor]=datoCursor;
        }
        contador++;
        posCursor=$formula.innerHTML.length-contador;
        
        datoCursor=$formula.innerHTML[posCursor]
        
        formulaDesplazada[posCursor]='_'
        formulaDesplazada=formulaDesplazada.join('');
        stopInterval();
        $formula.innerHTML=formulaDesplazada;
        cursorInt = setInterval(flashCursor, 450);
        
    }else if(direccion === 'right' && desborde){
        $blink.innerHTML='';
        if(datoCursor===''){
            formulaAux2=$formula.innerHTML;
            formulaDesplazada=$formula.innerHTML.split('');
        }else{
            formulaDesplazada=formulaDesplazada.split('');
            formulaDesplazada[posCursor]=datoCursor;
            
        }
        contador--;
        posCursor=$formula.innerHTML.length-contador;
        
        datoCursor=$formula.innerHTML[posCursor]
        
        formulaDesplazada[posCursor]='_'
        formulaDesplazada=formulaDesplazada.join('');
        stopInterval();
        $formula.innerHTML=formulaDesplazada;
        cursorInt = setInterval(flashCursor, 450);
    }
}



const escribirMemoria = () => {
    let elemento = ({
        operacion: operacion,
        operacion_display: operacion_display,
        resultado: resultado
    });
    if (modoExponencial) {
        elemento.exponencial ={
                coeficiente: coeficiente,
                exponente: exponente
            }
    }
    if (memoriaOperaciones.length < ESPACIO_MEMORIA)
        memoriaOperaciones.push(elemento);
    else if (memoriaOperaciones.length === ESPACIO_MEMORIA) {
        memoriaOperaciones.shift();
        memoriaOperaciones.push(elemento);
    }
    flechaUp.classList.add("mostrar");
}

const manejarIndicadoresMemoria = () => {
    flechaDown.classList.add("mostrar");
    flechaUp.classList.add("mostrar");
    if (posicionMemoria === 0)
        flechaUp.classList.remove("mostrar");
    else if (posicionMemoria === memoriaOperaciones.length - 1 && memoriaOperaciones.length)
        flechaDown.classList.remove("mostrar");
    if (posicionMemoria === -1 && !memoriaOperaciones.length) {
        flechaDown.classList.remove("mostrar");
        flechaUp.classList.remove("mostrar");
    }else if(posicionMemoria === -1 && memoriaOperaciones.length) {
        flechaDown.classList.remove("mostrar");
    }
}

const leerMemoria = () => {
    let elemento = memoriaOperaciones[posicionMemoria]
    operacion = elemento.operacion;
    operacion_display = elemento.operacion_display;
    resultado = elemento.resultado;
    ans = resultado;
    isExponencial(math.evaluate(resultado));
    if (modoExponencial) {
        coeficiente = elemento.exponencial.coeficiente;
        exponente = elemento.exponencial.exponente;
        mostrarNotacionExponencial();
    } else {
        ocultarNotacionExponencial();
        $resultado.innerHTML = resultado;
    }
    $formula.innerHTML = operacion_display;
    mostrandoResultado = false;
    checkDesborde();
}


const manejarUpClick = () => { 
    if (posicionMemoria === -1 && mostrandoResultado) {
        posicionMemoria = memoriaOperaciones.length - 2;
    } else if (posicionMemoria === -1 && memoriaOperaciones.length) {
        posicionMemoria = memoriaOperaciones.length - 1;
    } else if (posicionMemoria > 0) {
        posicionMemoria--;
    } else {
        return;
    }
    if (memoriaOperaciones.length) {
        modoLecturaMemoria = true;
        manejarIndicadoresMemoria();
        $blink.innerHTML = '';
        $blink.classList.remove("blink");
        leerMemoria();
    }
}

const manejarDownClick = () => {
    if (posicionMemoria < memoriaOperaciones.length - 1 && memoriaOperaciones.length) {
        posicionMemoria++;
        modoLecturaMemoria = true;
        manejarIndicadoresMemoria();
        $blink.innerHTML = '';
        $blink.classList.remove("blink");
        leerMemoria();
    }
}


const validarEntrada = (valor) => {
    if(valor in mapa){
        if (valor === "multiplicacion" || valor === "division") {
            operacion += mapa[valor].back;
            operacion_display += mapa[valor].front;
        } else if (valor === "ans") {
            operacion += " "+mapa[valor]+" ";
            operacion_display += mapa[valor];
        } else {
            operacion += mapa[valor];
            operacion_display += mapa[valor];
        }
        $formula.innerHTML = operacion_display;
        $blink.classList.remove("blink");
        setTimeout(() => { $blink.classList.add("blink"); }, 10)
    } else
        console.error("Haz modificado el mapa de valores");
}


const mostrarError = (tipoError) => {
    $formula.innerHTML = tipoError.message;
    $resultado.innerHTML = '';
    console.error(tipoError.message);
}

const manejarError = (error) => {
    if (error.constructor.name === 'SyntaxError') {
        error.message = ' Sintax ERROR';
        mostrarError(error);
    }
    else if (error.constructor.name === 'InvalidValueError')
        console.error(error)
    else if (error.constructor.name === 'MathError')
        mostrarError(error);
}


const validarOperacion = () => {
    const valoresAdmitidos = /^(Ans| Ans |e|pi|log|\(|\)|\.|[0-9]|\+|\-|×|\*|\/|÷)*$/;
    if (!valoresAdmitidos.test(operacion) || !valoresAdmitidos.test(operacion_display)) {
        throw new InvalidValueError();
    }
}

const notacionExponencial = (result) => { 
    if (Number.isInteger(result)) {
        result = math.format(result, { notation: 'exponential', precision:11 })
        exponente = math.evaluate(result.split('e')[1]).toString();
        coeficiente = math.evaluate(result.split('e')[0]).toString();
        coeficiente = coeficiente.substring(0, 11);
        return coeficiente + 'e' + exponente;
    } else {
        result = math.format(result, { notation: 'exponential', precision: 11 })
        exponente = math.evaluate(result.split('e')[1]).toString();
        coeficiente = math.evaluate(result.split('e')[0]).toString();
        coeficiente = coeficiente.substring(0, 11);
        return coeficiente + 'e' + exponente;
    }
}

const isExponencial = (result) => {
    if (!Number.isInteger(result) && result <= 1e-7)
        modoExponencial = true
    else if (Number.isInteger(result) && math.format(result, { notation: 'fixed' }).length > 10)
        modoExponencial = true
    else 
        modoExponencial = false;
}

const mostrarNotacionExponencial = () => { 
    $base.classList.add("base--visible")
    $exponente.innerHTML = exponente;
    $resultado.innerHTML = coeficiente;
}

const ocultarNotacionExponencial = () => { 
    $base.classList.remove("base--visible")
    exponente = '';
    $exponente.innerHTML = exponente;
    coeficiente = '';
    modoExponencial = false;
}

const analizarResultado = (result) => {
    if (result === 'Infinity')
        throw new MathError();
    if (result > ENTEROMAX || result < ENTEROMIN) {
        throw new MathError();
    }
    isExponencial(result);
    if (modoExponencial) {
        result = notacionExponencial(result);
        mostrarNotacionExponencial();
        resultado = result;
    } else if (!Number.isInteger(result) && result.toString().length > 11) { 
        ocultarNotacionExponencial();
        result = result.toString().substring(0, 11);
        resultado = result;
        $resultado.innerHTML = resultado;
    } else {
        ocultarNotacionExponencial();
        resultado = result.toString();
        $resultado.innerHTML = resultado;
    }
    mostrandoResultado = true;
    ans = resultado;
    $blink.innerHTML = '';
    $blink.classList.remove("blink");
}

const operar = (formulaMath) => {
    try {
        modoExponencial = false;
        validarOperacion();
        if (modoLecturaMemoria)
            return;
        let result;
        result = math.evaluate(formulaMath, {Ans: ans});
        result = math.format(result, { precision: 14 });
        result = math.evaluate(result);
        analizarResultado(result);
        checkDesborde();
        escribirMemoria();

    } catch (error) {
        manejarError(error);
        mostrandoError = true;
        $blink.innerHTML = '';
        $blink.classList.remove("blink");
    }
}

const clickFunction = (e) => {
    let dataTipo = e.target.getAttribute("data-tipo");
    let dataValor = e.target.getAttribute("data-valor");
    if ((mostrandoResultado || modoLecturaMemoria) && dataTipo === "operador" && dataValor != "ans") {
        mostrandoResultado = false;
        modoLecturaMemoria = false;
        posicionMemoria = -1;
        manejarIndicadoresMemoria();
        operacion = " Ans ";
        operacion_display = "Ans";
        $blink.innerHTML = '_';
        $blink.classList.remove("blink");
        setTimeout(() => { $blink.classList.add("blink"); }, 20)
        
    } else if ((mostrandoResultado || modoLecturaMemoria) && (dataTipo === "argumento" || dataValor ==="ans")) {
        limpiarFormula();
        mostrandoResultado = false;
        modoLecturaMemoria = false;
        posicionMemoria = -1;
        manejarIndicadoresMemoria();
        $blink.innerHTML = '_';
        $blink.classList.remove("blink");
        setTimeout(() => { $blink.classList.add("blink"); }, 20)
    }
    if ((dataTipo === 'argumento' || dataTipo === 'operador') && !mostrandoError) {
        validarEntrada(dataValor);
        checkDesborde();
    }
    else if (dataValor === 'eliminar' && !mostrandoError && !mostrandoResultado)
        eliminar();
    else if (dataValor === 'reset')
        resetear();
    else if (dataValor === 'operar' && !mostrandoError)
        operar(operacion);
    else if (dataValor === 'off')
        apagar();
}

const keyDownFunction = (e) => {
    let tecla = e.key;

    if ((mostrandoResultado || modoLecturaMemoria) && tecla in keyMap["operadores"]) {
        mostrandoResultado = false;
        modoLecturaMemoria = false;
        posicionMemoria = -1;
        manejarIndicadoresMemoria();
        operacion = " Ans ";
        operacion_display = "Ans";
        $blink.innerHTML = '_';
        $blink.classList.remove("blink");
        setTimeout(() => { $blink.classList.add("blink"); }, 20)

    } else if ((mostrandoResultado || modoLecturaMemoria) && tecla in keyMap["argumentos"]) {
        limpiarFormula();
        mostrandoResultado = false;
        modoLecturaMemoria = false;
        posicionMemoria = -1;
        manejarIndicadoresMemoria();
        $blink.innerHTML = '_';
        $blink.classList.add("blink");
    }
    if (tecla in keyMap["argumentos"] && !mostrandoError) {
        document.querySelector(`[data-valor='${keyMap.argumentos[tecla]}']`).classList.add("button--active");
        validarEntrada(keyMap.argumentos[tecla]);
        checkDesborde();
        
    } else if (tecla in keyMap["operadores"] && !mostrandoError) {
        document.querySelector(`[data-valor='${keyMap.operadores[tecla]}']`).classList.add("button--active");
        validarEntrada(keyMap.operadores[tecla]);
        checkDesborde();
    } else if (tecla === "Enter" && !mostrandoError) {
        document.querySelector("[data-valor='operar']").classList.add("button--active");
        operar(operacion)
    } else if (tecla === "Backspace" && !mostrandoError && !mostrandoResultado) {
        document.querySelector("[data-valor='eliminar']").classList.add("button--active");
        eliminar();
    } else if (tecla === "Escape") {
        document.querySelector("[data-valor='reset']").classList.add("button--active");
        resetear();
    }
    else if (tecla === "ArrowUp") {
        manejarUpClick();
        flechas.classList.add("highPress");
    }
    else if (tecla === "ArrowDown") { 
        manejarDownClick();
        flechas.classList.add("lowPress");
    }
    else if (tecla === "ArrowLeft") {
        flechas.classList.add("leftPress");
        $blink.classList.remove("blink");
        setTimeout(() => { $blink.classList.add("blink"); }, 20)
        if (operacion_display.length > 0) {
            modoEdicion = true;
            editarFormula()
            moverCursorIzquierda()
        }
    }
    else if (tecla === "ArrowRight") {
        flechas.classList.add("rightPress");
        $blink.classList.remove("blink");
        setTimeout(() => { $blink.classList.add("blink"); }, 20)
        if (operacion_display.length > 0 && (modoLecturaMemoria || mostrandoResultado)) {
            modoEdicion = true;
            editarFormula();
            moverCursorDerecha()
        }
       
    }
}



let caracterOriginal = $formula.innerHTML.charAt(posicionCursor);
let mostrarGuionBajo = false;
let intervalId;
let tiempoIntervalo = 500;


const ejecutarIntervalo = () => {
    if (mostrarGuionBajo) {
        $formula.innerHTML = $formula.innerHTML.substring(0, posicionCursor) + '_' + $formula.innerHTML.substring(posicionCursor + 1);
    } else {
        $formula.innerHTML = $formula.innerHTML.substring(0, posicionCursor) + caracterOriginal + $formula.innerHTML.substring(posicionCursor + 1);
    }
    mostrarGuionBajo = !mostrarGuionBajo;
    tiempoIntervalo = tiempoIntervalo === 500 ? 320 : 500;
    intervalId = setTimeout(ejecutarIntervalo, tiempoIntervalo);
}

const iniciarIntervalo = () => {
    if (intervalId)
        clearTimeout(intervalId);
    ejecutarIntervalo();
}

//iniciarIntervalo();


const editarOperacion = () => {
    posicionCursor = operacion_display.length - 1;
}

const moverCursorIzquierda = () => {
    if (posicionCursor > 0) {
        operacion_display = operacion_display.substring(0, posicionCursor) + caracterOriginal + operacion_display.substring(posicionCursor + 1);
        $formula.innerHTML = operacion_display;
        posicionCursor--;
        caracterOriginal = operacion_display.charAt(posicionCursor);
        mostrarGuionBajo = true;
    }
    iniciarIntervalo();
}

const moverCursorDerecha= () =>{
    if (posicionCursor < $formula.innerHTML.length - 1) {
        $formula.innerHTML = $formula.innerHTML.substring(0, posicionCursor) + caracterOriginal + $formula.innerHTML.substring(posicionCursor + 1);
        posicionCursor++;
        caracterOriginal = $formula.innerHTML.charAt(posicionCursor);
        mostrarGuionBajo = true;
    }
    iniciarIntervalo();
}




const keyUpFunction = (e) => {
    let tecla = e.key;
    if (tecla in keyMap["argumentos"])
        document.querySelector(`[data-valor='${keyMap.argumentos[tecla]}']`).classList.remove("button--active");
    else if (tecla in keyMap["operadores"])
        document.querySelector(`[data-valor='${keyMap.operadores[tecla]}']`).classList.remove("button--active");
    else if (tecla === "Enter" && !mostrandoError)
        document.querySelector("[data-valor='operar']").classList.remove("button--active");
    else if (tecla === "Backspace" && !mostrandoResultado && !mostrandoError)
        document.querySelector("[data-valor='eliminar']").classList.remove("button--active");
    else if (tecla === "Escape")
        document.querySelector("[data-valor='reset']").classList.remove("button--active");
    else if (tecla === "ArrowUp" || tecla === "ArrowDown" || tecla === "ArrowLeft" || tecla === "ArrowRight") {
        flechas.classList.remove("highPress");
        flechas.classList.remove("lowPress");
        flechas.classList.remove("leftPress");
        flechas.classList.remove("rightPress");
    }
}

const mouseDownFunction = (e) => {
    let dataFlecha = e.target.getAttribute("data-flecha");
    if (dataFlecha === 'up') {
        flechas.classList.add("highPress");
        manejarUpClick();
        presionandoDireccional = true;
    }
    else if (dataFlecha === 'down') {
        flechas.classList.add("lowPress");
        manejarDownClick();
        presionandoDireccional = true;
    }
    else if (dataFlecha === 'left') {
        flechas.classList.add("leftPress");
        //editarFormula(dataFlecha);
        $blink.classList.remove("blink");
        setTimeout(() => { $blink.classList.add("blink"); }, 20)
        moverCursorIzquierda();
        presionandoDireccional = true;
    }
    else if (dataFlecha === 'right') {
        flechas.classList.add("rightPress");
        //editarFormula(dataFlecha);
        $blink.classList.remove("blink");
        setTimeout(() => { $blink.classList.add("blink"); }, 20)
        moverCursorDerecha();
        presionandoDireccional = true;
    }
}

const mouseUpFunction = (e) => {
    if (presionandoDireccional) {
        flechas.classList.remove("highPress");
        flechas.classList.remove("lowPress");
        flechas.classList.remove("leftPress");
        flechas.classList.remove("rightPress");
        presionandoDireccional = false;
    }
}

document.addEventListener("click", clickFunction)
$on.addEventListener("click", encender);
document.addEventListener("keydown", keyDownFunction);
document.addEventListener("keyup", keyUpFunction);
document.addEventListener("mousedown", mouseDownFunction)
document.addEventListener("mouseup", mouseUpFunction)





































// function isMobile() {
//     const toMatch = [
//         /Android/i,
//         /webOS/i,
//         /iPhone/i,
//         /iPad/i,
//         /iPod/i,
//         /BlackBerry/i,
//         /Windows Phone/i,
//         /Opera Mini/i,
//         /IEMobile/i
//     ];

//     return toMatch.some((toMatchItem) => {
//         return navigator.userAgent.match(toMatchItem);
//     });
// }


// teclado.addEventListener('click', (e)=>{
//     e.preventDefault();
//     e.stopPropagation();
//     if(e.target && ( e.target.getAttribute("data-tipo")==='numero' || e.target.getAttribute("data-tipo") ==='operador')){
//         if(e.target.getAttribute("data-valor").length === 1 || e.target.getAttribute("data-valor") === 'Ans'){
//             if(e.target.getAttribute("data-tipo") ==='operador' && resultado.innerHTML!='0' && igual && e.target.getAttribute("data-valor") !='Ans'){
//                 igual=false;
//                 limpiarFormula();
//                 formula.innerHTML+='Ans'+ e.target.getAttribute("data-valor");
//             }else if(resultado.innerHTML!='0' && igual){
//                 limpiarFormula();
//                 flechasMemoria();
//                 igual=false;
//                 formula.innerHTML+=e.target.getAttribute("data-valor");
//             }else if(!error){
//                 formula.innerHTML+=e.target.getAttribute("data-valor");
//             }
//             desplazarTexto();
//         }
//     }else if(e.target.getAttribute("data-valor") === 'eliminar'){
//         eliminar();
//     }else if(e.target.getAttribute("data-valor") === 'reset'){
//         resetear();
//     }else if(e.target.getAttribute("data-valor") === 'operar'){
//         verificar();
//     }else if(e.target.getAttribute("data-valor") === 'off'){
//         apagar();
//     }else if(e.target.getAttribute("data-valor") === 'on'){
//         encender();
//     }
// });




// if(isMobile()){
//     flechas.addEventListener('touchstart', (e)=>{
//         e.preventDefault();
//         e.stopPropagation();
//         if(e.target && e.target.tagName === 'BUTTON' ){
//             direccionPress(e.target.getAttribute("data-flecha"));
//             if(e.target.getAttribute("data-flecha") === 'left' || e.target.getAttribute("data-flecha") === 'right'){
//                 // editarFormula(event.target.getAttribute("data-flecha"));
//                 // Funcion que permite navegar sobre la formula, para editar o insertar nuevos elementos.
//             }else if(e.target.getAttribute("data-flecha") === 'up' || e.target.getAttribute("data-flecha") === 'down'){
//                 getMemoria(e.target.getAttribute("data-flecha"));
//             }
//         }
//     });
//     flechas.addEventListener('touchend', (e)=> {
//         e.preventDefault();
//         e.stopPropagation();
//         direccionPress(e.target.getAttribute("data-flecha"))
//     });
// }else{
//     flechas.addEventListener('mousedown', (e)=>{
//         e.preventDefault();
//         e.stopPropagation();
//         if(e.target && e.target.tagName === 'BUTTON' ){
//             direccionPress(e.target.getAttribute("data-flecha"));
//             if(e.target.getAttribute("data-flecha") === 'left' || e.target.getAttribute("data-flecha") === 'right'){
//                 // editarFormula(event.target.getAttribute("data-flecha"));
//                 // Funcion que permite navegar sobre la formula, para editar o insertar nuevos elementos.
//             }else if(e.target.getAttribute("data-flecha") === 'up' || e.target.getAttribute("data-flecha") === 'down'){
//                 getMemoria(e.target.getAttribute("data-flecha"));
//             }
//         }
//     });
//     flechas.addEventListener('mouseup', (e)=> {
//         e.preventDefault();
//         e.stopPropagation();
//         direccionPress(e.target.getAttribute("data-flecha"))
//     });
// }
