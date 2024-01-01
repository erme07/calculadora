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
let caracterOriginal;
let mostrarGuionBajo = true;
let intervalId;
let tiempoIntervalo = 500;


    
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
    posicionMemoria = -1;
    memoriaOperaciones.length = 0;
    posicionStorage=0;
    posStorAux=0;
    encendido=true;
    $resultado.innerHTML='0';
    limpiarFormula();
    $blink.innerHTML = '_';
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
    $formula.innerHTML = operacion_display;
    reiniciarParpadeo();
}

const eliminar = () => {
    if (modoEdicion) {
        if (operacion_display[posicionCursor] === "A") {
            //DEbo eliminar el uso de dos formulas, debo quedarme solo con operacion_display y reemplazar los caracteres antes de hacer  math.evaluate().
            operacion_display = operacion_display.substring(0, posicionCursor) + operacion_display.substring(posicionCursor + 3);
            operacion = operacion.substring(0, posicionCursor) + operacion.substring(posicionCursor + 1);
        }
        else
            operacion_display = operacion_display.substring(0, posicionCursor) + operacion_display.substring(posicionCursor + 1);
            
        $formula.innerHTML = operacion_display;
        operacion = operacion.substring(0, posicionCursor) + operacion.substring(posicionCursor + 1);
        caracterOriginal = operacion_display.charAt(posicionCursor);
        if (posicionCursor === operacion_display.length) {
            salirModoEdicion();
        }
    } else {
        if(operacion_display[operacion_display.length - 1] === 's')
            operacion_display = operacion_display.slice(0, -3)
        else
            operacion_display = operacion_display.slice(0, -1)
        if (operacion[operacion.length - 1] === ' ')
            operacion = operacion.slice(0, -5);
        else
            operacion = operacion.slice(0, -1);
    }
    $formula.innerHTML = operacion_display;
    reiniciarParpadeo();
    gestionarDesborde();
}

const salirModoEdicion = () => {
    modoEdicion = false;
    posicionCursor = 0;
    marginformula = 0;
    caracterOriginal = '';
    clearTimeout(intervalId);
}

function resetear() {
    console.clear();
    limpiarFormula();
    $blink.innerHTML = '_';
    resultado = 0;
    $resultado.innerHTML = resultado;
    mostrandoResultado = false;
    mostrandoError = false;
    desborde = false;
    salirModoEdicion();
    salirModoExponencial();
    flechaIzq.classList.remove('mostrar');
    flechaRight.classList.remove('mostrar');
    modoLecturaMemoria = false;
    posicionMemoria = -1;
    manejarIndicadoresMemoria();
}


const alinearDerecha = () => { 
    $formula.classList.add('formula--alignEnd');
    flechaIzq.classList.add('mostrar');
    desborde = true;
}

const alinearIzquierda = () => { 
    $formula.classList.add('formula--alignStart');
    flechaRight.classList.add('mostrar');
    //flechaIzq.classList.remove('mostrar');
    desborde = true;
}

const resetDesborde = () => {
    $formula.classList.remove('formula--alignStart');
    $formula.classList.remove('formula--alignEnd');
    flechaIzq.classList.remove('mostrar');
    flechaRight.classList.remove('mostrar');
    desborde = false;
}

const gestionarDesborde = () => {
    resetDesborde();
    if (operacion_display.toString().length > 13 && (mostrandoResultado || modoLecturaMemoria))
        alinearIzquierda();
    else if (operacion_display.toString().length > 13 && !mostrandoResultado && !modoLecturaMemoria) 
        alinearDerecha();
    if (modoEdicion && desborde) { 
        if (posicionCursor > 13) {
            $formula.style.marginRight = `-${(marginformula - 1)}ch`;
            if (posicionCursor <= operacion_display.length - 1)
                flechaRight.classList.add('mostrar');
            alinearDerecha();
        } else {
            flechaIzq.classList.remove('mostrar');
            alinearIzquierda();
        }
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
    operacion_display = elemento.operacion_display;
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
    $formula.innerHTML = operacion_display;
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


const editarOperacion = (valor) => { 
    if (valor === "multiplicacion" || valor === "division") {
        operacion = operacion.substring(0, posicionCursor) + mapa[valor].back + operacion.substring(posicionCursor + 1);
        operacion_display = operacion_display.substring(0, posicionCursor) + mapa[valor].front + operacion_display.substring(posicionCursor + 1);
    } else if (valor === "ans") {
        operacion = operacion.substring(0, posicionCursor) + " " + mapa[valor] + " " + operacion.substring(posicionCursor + 1);
        operacion_display = operacion_display.substring(0, posicionCursor) + mapa[valor] + operacion_display.substring(posicionCursor + 1);
    } else { 
        operacion = operacion.substring(0, posicionCursor) + mapa[valor] + operacion.substring(posicionCursor + 1);
        operacion_display = operacion_display.substring(0, posicionCursor) + mapa[valor] + operacion_display.substring(posicionCursor + 1);
        // $formula.innerHTML = operacion_display.substring(0, posicionCursor) + mapa[valor] + "_" + operacion_display.substring(posicionCursor + 2);
    }
    moverCursorDerecha();
    console.log("logrado...");
    //$formula.innerHTML = "asdadasd";
}

const validarEntrada = (valor,tipo) => {
    
    if (valor in mapa) {
        if (modoEdicion) {
            editarOperacion(valor);
            //$formula.innerHTML = operacion_display;
            $blink.classList.remove("blink");
            setTimeout(() => { $blink.classList.add("blink"); }, 10)
            return;
        }
        if (((mostrandoResultado || modoLecturaMemoria) && tipo === "operador" && valor != "ans") || ((mostrandoResultado || modoLecturaMemoria) && tipo in keyMap["operadores"])) {
            reiniciarParpadeo();
            posicionMemoria = -1;
            manejarIndicadoresMemoria();
            operacion = " Ans ";
            operacion_display = "Ans";
        } else if (((mostrandoResultado || modoLecturaMemoria) && (tipo === "argumento" || valor === "ans")) || ((mostrandoResultado || modoLecturaMemoria) && tipo in keyMap["argumentos"])) {
            limpiarFormula();
            posicionMemoria = -1;
            manejarIndicadoresMemoria();
        }
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
        mostrandoResultado = false;
        modoLecturaMemoria = false;
        $formula.innerHTML = operacion_display;
        reiniciarParpadeo();
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
    $formula.innerHTML = operacion_display;
    mostrandoResultado = true;
    ans = resultado;
    $blink.innerHTML = '';
    $blink.classList.remove("blink");
}

const operar = (formulaMath) => {
    try {
        let formula = formulaMath;
        modoExponencial = false;
        validarOperacion(formula);
        formula = formula.replace(/Ans/g, " Ans ");
        formula = formula.replace(/×/g, "*");
        formula = formula.replace(/÷/g, "/");
        if (modoLecturaMemoria || mostrandoResultado)
            return;
        let result;
        result = math.evaluate(formula, {Ans: ans});
        result = math.format(result, { precision: 14 });
        result = math.evaluate(result);
        analizarResultado(result);
        gestionarDesborde();
        escribirMemoria();
        salirModoEdicion();

    } catch (error) {
        //modoExponencial = false;
        salirModoExponencial();
        manejarError(error);
        mostrandoError = true;
        manejarIndicadoresMemoria();
        $blink.innerHTML = '';
        $blink.classList.remove("blink");
    }
}

const reiniciarParpadeo = () => {
    if (mostrandoResultado || modoLecturaMemoria || !modoEdicion)
        $blink.innerHTML = '_';
    if (modoEdicion)
        $blink.innerHTML = '';
    $blink.classList.remove("blink");
    setTimeout(() => { $blink.classList.add("blink"); }, 20)
}

const clickFunction = (e) => {
    let dataTipo = e.target.getAttribute("data-tipo");
    let dataValor = e.target.getAttribute("data-valor");
    if ((dataTipo === 'argumento' || dataTipo === 'operador') && !mostrandoError) {
        validarEntrada(dataValor, dataTipo);
        gestionarDesborde();
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
    if (tecla in keyMap["argumentos"] && !mostrandoError) {
        document.querySelector(`[data-valor='${keyMap.argumentos[tecla]}']`).classList.add("button--active");
        validarEntrada(keyMap.argumentos[tecla], tecla);
        gestionarDesborde();
        
    } else if (tecla in keyMap["operadores"] && !mostrandoError) {
        document.querySelector(`[data-valor='${keyMap.operadores[tecla]}']`).classList.add("button--active");
        validarEntrada(keyMap.operadores[tecla], tecla);
        gestionarDesborde();
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
        reiniciarParpadeo();
        if (operacion_display.length > 0) {
            if (!modoEdicion) {
                inicializarEdicion(tecla)
            }
            moverCursorIzquierda()
        }
    }
    else if (tecla === "ArrowRight") {
        flechas.classList.add("rightPress");
        reiniciarParpadeo();
        if (operacion_display.length > 0 && (modoLecturaMemoria || mostrandoResultado || modoEdicion)) {
            if (!modoEdicion) {
                inicializarEdicion(tecla);
            }
            moverCursorDerecha()
        }
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

const iniciarIntervalo = () => {
    if (intervalId)
        clearTimeout(intervalId);
    ejecutarIntervalo();
}

const inicializarEdicion = (tecla) => {
    modoLecturaMemoria = false;
    mostrandoResultado = false;
    modoEdicion = true;
    if (tecla === "ArrowLeft" || tecla === "left") {
        posicionCursor = operacion_display.length;
        caracterOriginal = operacion_display.charAt(posicionCursor - 1);
        $blink.innerHTML = '';
        $blink.classList.remove("blink");
    }
    else if (tecla === "ArrowRight" || tecla === "right") {
        posicionCursor = -1;
        caracterOriginal = operacion_display.charAt(0);
        reiniciarParpadeo();
    }
    
}
let marginformula = 0;

const moverCursorIzquierda = () => {
    // if (posicionCursor === operacion_display.length) {
    //     console.log("entro asasdasa")
    //     $formula.innerHTML = operacion_display;
    //     posicionCursor--;
    //     marginformula++;
    //     caracterOriginal = operacion_display.charAt(posicionCursor);
    //     mostrarGuionBajo = true;
    // } else
    if (posicionCursor > 0) {
        $formula.innerHTML = operacion_display;
        if (operacion_display[posicionCursor - 1] === 's')
            posicionCursor -= 3;
        else
            posicionCursor--;
        marginformula++;
        caracterOriginal = operacion_display.charAt(posicionCursor);
        mostrarGuionBajo = true;
    }
    iniciarIntervalo();
    gestionarDesborde();
}

const moverCursorDerecha = () => {
    if (posicionCursor < operacion_display.length - 1) {
        $formula.innerHTML = operacion_display;
        if (operacion_display[posicionCursor + 1] === 'n')
            posicionCursor += 3;
        else
            posicionCursor++;
        marginformula--;
        caracterOriginal = operacion_display.charAt(posicionCursor);
        mostrarGuionBajo = true;
    } else if (posicionCursor === operacion_display.length - 1) {
        $formula.innerHTML = operacion_display;
        salirModoEdicion();
        reiniciarParpadeo()
        gestionarDesborde();
        return;
    }
    iniciarIntervalo();
    gestionarDesborde();
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
        reiniciarParpadeo();
        presionandoDireccional = true;
        if (operacion_display.length > 0) {
            if (!modoEdicion) {
                inicializarEdicion(dataFlecha)
            }
            moverCursorIzquierda()
        }
    }
    else if (dataFlecha === 'right') {
        flechas.classList.add("rightPress");
        reiniciarParpadeo();
        presionandoDireccional = true;
        if (operacion_display.length > 0 && (modoLecturaMemoria || mostrandoResultado || modoEdicion)) {
            if (!modoEdicion) {
                inicializarEdicion(dataFlecha);
            }
            moverCursorDerecha()
        }
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
// }
