/*
Practicas Html/CSS/Javascript - Erik Medina
*/
const teclado = document.getElementById('teclado'),
    $formula = document.querySelector(".formula"),
    $pantalla = document.querySelector(".pantalla"),
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
let operacion = "", ans = 0;
let posicionMemoria = -1, posicionCursor = 0;
//let caracterOriginal;
let mostrarGuionBajo = true;
let intervalId;
let tiempoIntervalo = 500;
let marginformula = 0;


    
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
    multiplicacion: "×",
    division: "÷",
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
    document.removeEventListener("keydown", keyDownFunction);
    document.removeEventListener("keyup", keyUpFunction);
    document.removeEventListener("click", clickFunction);
    resetear();
    posicionMemoria = -1;
    memoriaOperaciones.length = 0;
    $resultado.innerHTML='';
    $formula.innerHTML='';
    encendido = false;
    $pantalla.classList.add("pantalla--apagada");
}

function encender() {
    document.addEventListener("keydown", keyDownFunction);
    document.addEventListener("keyup", keyUpFunction);
    document.addEventListener("click", clickFunction);
    posicionMemoria = -1;
    memoriaOperaciones.length = 0;
    posicionStorage=0;
    posStorAux=0;
    encendido=true;
    $resultado.innerHTML='0';
    limpiarFormula();
    $pantalla.classList.remove("pantalla--apagada");

    flechaRight.classList.remove("mostrar");
    flechaUp.classList.remove("mostrar");
    flechaIzq.classList.remove("mostrar");
}

const limpiarFormula = () => {
    operacion = '';
    operacion_display = ' ';
    $formula.innerHTML = operacion_display;
}

const eliminar = () => {
    if (modoEdicion) {
        if (operacion[posicionCursor] === "A") {
            operacion = operacion.substring(0, posicionCursor) + operacion.substring(posicionCursor + 3);
            marginformula -= 3;
        }
        else {
            operacion = operacion.substring(0, posicionCursor) + operacion.substring(posicionCursor + 1);
            marginformula--;
        }
        $formula.innerHTML = operacion;
        if (posicionCursor === operacion.length) {
            salirModoEdicion();
        }
    } else {
        if (operacion[operacion.length - 1] === 's')
            operacion = operacion.slice(0, -3)
        else
            operacion = operacion.slice(0, -1)
        operacion_display = operacion.substring(operacion.length - 13)+" ";
        posicionCursor = operacion_display.length - 1;
        reiniciarIntervalo();
    }
    gestionarDesborde();
}

const salirModoEdicion = () => {
    modoEdicion = false;
    operacion_display = operacion+" ";
    posicionCursor = operacion_display.length - 1;
    //iniciarIntervalo();
}

function resetear() {
    console.clear();
    limpiarFormula();
    resultado = 0;
    $resultado.innerHTML = resultado;
    mostrandoResultado = false;
    mostrandoError = false;
    desborde = false;
    salirModoEdicion();
    salirModoExponencial();
    resetDesborde();
    modoLecturaMemoria = false;
    posicionMemoria = -1;
    manejarIndicadoresMemoria();
}










const escribirMemoria = () => {
    let elemento = ({
        operacion: operacion,
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
    if ((posicionMemoria === -1 && !memoriaOperaciones.length)||mostrandoError) {
        flechaDown.classList.remove("mostrar");
        flechaUp.classList.remove("mostrar");
    }else if(posicionMemoria === -1 && memoriaOperaciones.length) {
        flechaDown.classList.remove("mostrar");
    }
}

const leerMemoria = () => {
    let elemento = memoriaOperaciones[posicionMemoria]
    operacion = elemento.operacion;
    resultado = elemento.resultado;
    ans = resultado;
    isExponencial(math.evaluate(resultado));
    if (modoExponencial) {
        coeficiente = elemento.exponencial.coeficiente;
        exponente = elemento.exponencial.exponente;
        mostrarNotacionExponencial();
    } else {
        salirModoExponencial();
        $resultado.innerHTML = resultado;
    }
    $formula.innerHTML = operacion;
    mostrandoResultado = false;
    gestionarDesborde();
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
        //$blink.innerHTML = '';
        //$blink.classList.remove("blink");
        leerMemoria();
    }
}

const manejarDownClick = () => {
    if (posicionMemoria < memoriaOperaciones.length - 1 && memoriaOperaciones.length) {
        posicionMemoria++;
        modoLecturaMemoria = true;
        manejarIndicadoresMemoria();
        //$blink.innerHTML = '';
        //$blink.classList.remove("blink");
        leerMemoria();
    }
}


const editarOperacion = (valor) => { 
    if (valor === "multiplicacion" || valor === "division") {
        operacion = operacion.substring(0, posicionCursor) + mapa[valor].front + operacion.substring(posicionCursor + 1);
    } else if (valor === "ans") {
        operacion = operacion.substring(0, posicionCursor) + mapa[valor] + operacion.substring(posicionCursor + 1);
    } else { 
        operacion = operacion.substring(0, posicionCursor) + mapa[valor] + operacion.substring(posicionCursor + 1);

    }
    moverCursorDerecha();
}

let indice = 0, operacion_display=' ';


const gestionarOperacionSobreResultado = (valor, tipo, tipokey) => {
    if (((mostrandoResultado || modoLecturaMemoria) && tipo === "operador" && valor != "ans") || ((mostrandoResultado || modoLecturaMemoria) && tipokey in keyMap["operadores"])) {
        posicionMemoria = -1;
        manejarIndicadoresMemoria();
        operacion = "Ans";
    } else if (((mostrandoResultado || modoLecturaMemoria) && (tipo === "argumento" || valor === "ans")) || ((mostrandoResultado || modoLecturaMemoria) && tipokey in keyMap["argumentos"])) {
        limpiarFormula();
        posicionMemoria = -1;
        manejarIndicadoresMemoria();
    }
}


const setFormulaVisible = () => { 
    if (desborde) {
        if (modoEdicion) {
            operacion_display = operacion.trimEnd();
            operacion_display = operacion_display.substring(operacion_display.length - 14 - indice, operacion_display.length - indice);
        } else {
            operacion_display = operacion.substring(operacion.length - 13)+" ";
            posicionCursor = operacion_display.length - 1;
        }
    } else {
        operacion_display = operacion+" ";
        posicionCursor = operacion_display.length - 1;
    }
    reiniciarIntervalo();
}

const setFormula = (valor, tipo, tipokey) => {

    gestionarOperacionSobreResultado(valor, tipo, tipokey);
    if (modoEdicion) {
        operacion += mapa[valor];
    } else {
        operacion += mapa[valor];
    }
    gestionarDesborde();
    setFormulaVisible();
    mostrandoResultado = false;
    modoLecturaMemoria = false;
}

const validarEntrada = (valor, tipo, tipokey) => {
    if (valor in mapa) {
        if (modoEdicion) {
            editarOperacion(valor);
            return;
        }
        setFormula(valor, tipo, tipokey);
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


const validarOperacion = (formula) => {
    const valoresAdmitidos = /^(Ans| Ans |e|pi|log|\(|\)|\.|[0-9]|\+|\-|×|\*|\/|÷)*$/;
    if (!valoresAdmitidos.test(formula)) {
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

const salirModoExponencial = () => {
    $base.classList.remove("base--visible")
    $exponente.innerHTML = '';
    exponente = '';
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
        salirModoExponencial();
        result = result.toString().substring(0, 11);
        resultado = result;
        $resultado.innerHTML = resultado;
    } else {
        salirModoExponencial();
        resultado = result.toString();
        $resultado.innerHTML = resultado;
    }
    mostrandoResultado = true;
    ans = resultado;
}
const establecerFormula = () => {
    operacion_display = operacion.substring(operacion.length - 14 - indice, operacion.length - indice);
}
const operar = () => {
    try {
        let formula = operacion;
        modoExponencial = false;
        validarOperacion(formula);
        if (modoLecturaMemoria || mostrandoResultado)
            return;
        formula = formula.replace(/Ans/g, " Ans ");
        formula = formula.replace(/×/g, "*");
        formula = formula.replace(/÷/g, "/");
        let result;
        result = math.evaluate(formula, {Ans: ans});
        result = math.format(result, { precision: 14 });
        result = math.evaluate(result);
        analizarResultado(result);
        gestionarDesborde();
        escribirMemoria();
        salirModoEdicion();
        finalizarIntervalo();
        $formula.innerHTML=operacion_display;
        console.log(formula);

    } catch (error) {
        //modoExponencial = false;
        salirModoExponencial();
        manejarError(error);
        mostrandoError = true;
        manejarIndicadoresMemoria();
    }
}


const clickFunction = (e) => {
    let dataTipo = e.target.getAttribute("data-tipo");
    let dataValor = e.target.getAttribute("data-valor");
    if ((dataTipo === 'argumento' || dataTipo === 'operador') && !mostrandoError) {
        validarEntrada(dataValor, dataTipo);
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

    if (e.key === 'Enter') {
        e.preventDefault();
    }
    if (tecla in keyMap["argumentos"] && !mostrandoError) {
        document.querySelector(`[data-valor='${keyMap.argumentos[tecla]}']`).classList.add("button--active");
        validarEntrada(keyMap.argumentos[tecla], undefined, tecla);
        
    } else if (tecla in keyMap["operadores"] && !mostrandoError) {
        document.querySelector(`[data-valor='${keyMap.operadores[tecla]}']`).classList.add("button--active");
        validarEntrada(keyMap.operadores[tecla],undefined, tecla);
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
        moverCursorIzquierda(tecla)
    }
    else if (tecla === "ArrowRight") {
        flechas.classList.add("rightPress");
        moverCursorDerecha(tecla)
    }
}


const ejecutarIntervalo = () => {
    if (mostrarGuionBajo) {
        $formula.innerHTML = operacion_display.substring(0, posicionCursor) + '_' + operacion_display.substring(posicionCursor + 1);
    } else {
        $formula.innerHTML = operacion_display;
    }
    mostrarGuionBajo = !mostrarGuionBajo;
    tiempoIntervalo = tiempoIntervalo === 500 ? 320 : 500;
    intervalId = setTimeout(ejecutarIntervalo, tiempoIntervalo);
}

const finalizarIntervalo = () => { 
    if (intervalId)
        clearTimeout(intervalId);
}

const reiniciarIntervalo = () => {
    finalizarIntervalo();
    mostrarGuionBajo = true;
    ejecutarIntervalo();
}

ejecutarIntervalo();

const resetDesborde = () => {
    flechaIzq.classList.remove('mostrar');
    flechaRight.classList.remove('mostrar');
}

const gestionarDesborde = () => {
    resetDesborde();
    if (operacion.length >= 14) {
        desborde = true;
    } else {
        desborde = false;
    }
    if ((mostrandoResultado || modoLecturaMemoria) && desborde) {
        flechaRight.classList.add('mostrar');
    } else if (desborde){
        flechaIzq.classList.add('mostrar');
    }
}



const inicializarEdicion = (tecla) => {
    modoLecturaMemoria = false;
    mostrandoResultado = false;
    modoEdicion = true;
    operacion = operacion.trimEnd();
    //operacion_display = operacion.substring(operacion.length - 14);
    if (tecla === "ArrowLeft" || tecla === "left") {
        posicionCursor = operacion.length;
        operacion_display = operacion.substring(posicionCursor - 14, posicionCursor);
    }
    else if (tecla === "ArrowRight" || tecla === "right") {
        posicionCursor = 0;
    }
    
}



const moverCursorIzquierda = (tecla) => {
    if (!modoEdicion) {
        inicializarEdicion(tecla)
    }
    if (posicionCursor > 0) {
        if(desborde)
            indice++;
        if (operacion_display[posicionCursor - 1] === 's')
            posicionCursor -= 3;
        else
            posicionCursor--;
    }
    reiniciarIntervalo();
    gestionarDesborde();
}




const moverCursorDerecha = (tecla) => {
    if (!modoEdicion && (mostrandoResultado || modoLecturaMemoria)) {
        inicializarEdicion(tecla);
    }
    if (posicionCursor < operacion.length - 1 && modoEdicion) {
        if (operacion_display[posicionCursor] === 'A')
            posicionCursor += 3;
        else
            posicionCursor++;
    } else if(modoEdicion){
        salirModoEdicion();
    }
    reiniciarIntervalo();
    gestionarDesborde();
}







const keyUpFunction = (e) => {
    let tecla = e.key;
    // teclaPresionada[e.code] = false;
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
        presionandoDireccional = true;
        moverCursorIzquierda()
        
    }
    else if (dataFlecha === 'right') {
        flechas.classList.add("rightPress");
        presionandoDireccional = true;
        moverCursorDerecha()
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

