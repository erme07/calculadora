
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
const ENTERO_MAX = 9.999999999e+99;
const ENTERO_MIN = - ENTERO_MAX;
const DECIMALMINPOSITIVO = 1e-99;
const DECIMALMINNEGATIVO = -DECIMALMINPOSITIVO;
const ESPACIO_MEMORIA = 8;

//modos - estados
let modoExponencial = false;
let mostrandoError = false;
let mostrandoResultado = false;
let modoLecturaMemoria = false;
let modoEdicion = false;
let desborde = false;
let presionandoDireccional = false;
let tipoMobile;



//variables
let exponente, coeficiente, resultado=0;
let operacion = "";
let operacion_display = ' ';
let operacion_display_cursor = "_";
let ans = 0;
let posicionMemoria = -1;
let posicionCursor = 0;
let posicionFormula = 0;
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


const isMobile = () => {
    const toMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|Opera Mini|IEMobile/i;
    return toMatch.test(navigator.userAgent);
}
tipoMobile = isMobile();

const manejarIndicadoresMemoria = () => {
    flechaDown.classList.add("mostrar");
    flechaUp.classList.add("mostrar");
    if (posicionMemoria === 0)
        flechaUp.classList.remove("mostrar");
    else if (posicionMemoria === memoriaOperaciones.length - 1 && memoriaOperaciones.length)
        flechaDown.classList.remove("mostrar");
    if ((posicionMemoria === -1 && !memoriaOperaciones.length) || mostrandoError) {
        flechaDown.classList.remove("mostrar");
        flechaUp.classList.remove("mostrar");
    } else if (posicionMemoria === -1 && memoriaOperaciones.length) {
        flechaDown.classList.remove("mostrar");
    }
}

const reiniciarMemoria = () => {
    posicionMemoria = -1;
    memoriaOperaciones.length = 0;
    manejarIndicadoresMemoria();

}
const limpiarFormula = () => {
    operacion = '';
    operacion_display = ' ';
    operacion_display_cursor = '_';
    $formula.innerHTML = operacion_display;
}
const salirModoEdicion = () => {
    modoEdicion = false;
    operacion_display = operacion + " ";
    operacion_display_cursor = operacion + "_";
    posicionCursor = operacion_display.length - 1;
}

const resetDesborde = () => {
    flechaIzq.classList.remove('mostrar');
    flechaRight.classList.remove('mostrar');
}

const gestionarDesborde = () => {
    resetDesborde();
    if (operacion.length >= 14)
        desborde = true;
    else
        desborde = false;
    if ((mostrandoResultado || modoLecturaMemoria || modoEdicion) && desborde)
        flechaRight.classList.add('mostrar');
    if (desborde && posicionFormula > 13 && !mostrandoResultado && !modoLecturaMemoria)
        flechaIzq.classList.add('mostrar');
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
const finalizarIntervalo = () => {
    if (intervalId)
        clearTimeout(intervalId);
}
const ejecutarIntervalo = () => {
    if (mostrarGuionBajo)
        $formula.innerHTML = operacion_display_cursor;
    else
        $formula.innerHTML = operacion_display;
    mostrarGuionBajo = !mostrarGuionBajo;
    tiempoIntervalo = tiempoIntervalo === 500 ? 320 : 500;
    intervalId = setTimeout(ejecutarIntervalo, tiempoIntervalo);
}
const reiniciarIntervalo = () => {
    finalizarIntervalo();
    mostrarGuionBajo = true;
    ejecutarIntervalo();
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
const imprimirCursor = (posicion) => {
    operacion_display_cursor = operacion_display.split("")
    operacion_display_cursor[posicion] = "_";
    operacion_display_cursor = operacion_display_cursor.join("");
}


const resetear = () => {
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
    posicionFormula = 0;
    manejarIndicadoresMemoria();
    reiniciarIntervalo();
}

const apagar = () => {
    if (isMobile()) {
        document.removeEventListener("touchstart", touchStartFunction);
    } else {
        document.removeEventListener("keydown", keyDownFunction);
        document.removeEventListener("keyup", keyUpFunction);
        document.removeEventListener("click", clickFunction);
    }
    resetear();
    reiniciarMemoria();
    $resultado.innerHTML='';
    $formula.innerHTML='';
    $pantalla.classList.add("pantalla--apagada");
}

const encender = () => {
    if (isMobile()) {
        document.addEventListener("touchstart", touchStartFunction);
    } else {
        document.addEventListener("keydown", keyDownFunction);
        document.addEventListener("keyup", keyUpFunction);
        document.addEventListener("click", clickFunction);
    }
    reiniciarMemoria();
    $resultado.innerHTML='0';
    limpiarFormula();
    $pantalla.classList.remove("pantalla--apagada");
    reiniciarIntervalo();
    gestionarDesborde();
}



const eliminar = () => {
    if (modoEdicion) {
        if (posicionFormula > 13) {
            if (operacion_display[posicionCursor] === "A") {
                let operacionArray = Array.from(operacion);
                operacionArray.splice(posicionFormula - 2, 3);

                if (operacion[posicionFormula + 1] != "A") {
                    operacion = operacionArray.join('');
                    posicionFormula -= 2;
                    if (posicionFormula < 13)
                        posicionFormula = 13;
                    operacion_display = operacion.substring(posicionFormula - 13, posicionFormula + 1);
                    posicionCursor = operacion_display.length - 1;
                    imprimirCursor(posicionCursor);
                    reiniciarIntervalo();
                    gestionarDesborde();
                    console.log("fggffgfgfgfg")
                    return;
                }
                operacion = operacionArray.join('');
                operacion_display = operacion.substring(posicionFormula - 13, posicionFormula + 1);
                console.log("eliminando A");
                imprimirCursor(posicionCursor);
                reiniciarIntervalo();
            }
            else {
                let aux = operacion.split('');
                aux.splice(posicionFormula, 1);
                operacion = aux.join('');
                operacion_display = operacion.substring(posicionFormula - 13, posicionFormula + 1);
                imprimirCursor(posicionCursor);
                reiniciarIntervalo();
            }
        }
        else {
            if (posicionFormula > 11 && operacion[posicionFormula + 1] === "A") {
                operacion = operacion.substring(0, posicionFormula) + operacion.substring(posicionFormula + 1);
                posicionFormula+=2
                operacion_display = operacion.substring(posicionFormula - 13, posicionFormula + 1);
                posicionCursor=operacion_display.length-3;
                imprimirCursor(posicionCursor);
                reiniciarIntervalo();
                gestionarDesborde();
                console.log("ppppppppppppppppp")
                return;
            }
            else if (operacion_display[posicionCursor] === "A") {
                let operacionArray = Array.from(operacion);
                operacionArray.splice(posicionFormula, 3);
                operacion = operacionArray.join('');
                operacion_display = operacion.substring(0,14);
                imprimirCursor(posicionCursor);
                reiniciarIntervalo();
                console.log("eliminando b");
            }
            else {
                operacion = operacion.substring(0, posicionFormula) + operacion.substring(posicionFormula + 1);
                operacion_display = operacion.substring(0, 14);
                imprimirCursor(posicionCursor);
                reiniciarIntervalo();
                console.log("eliminando c");
            }
        }
        
        
        if (posicionFormula === operacion.length) {
            salirModoEdicion();
        }
    } else {
        if (operacion[operacion.length - 1] === 's')
            operacion = operacion.slice(0, -3)
        else
            operacion = operacion.slice(0, -1)
        operacion_display = operacion.substring(operacion.length - 13) + " ";
        posicionCursor = operacion_display.length - 1;
        if (posicionFormula - 1 < 13)
            posicionFormula = posicionCursor;
        else
            posicionFormula--;
        imprimirCursor(posicionCursor);
        reiniciarIntervalo();
    }
    gestionarDesborde();
}


const escribirMemoria = () => {
    let elemento = ({
        operacion: operacion,
        resultado: resultado
    });
    if (modoExponencial) {
        elemento.exponencial = {
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
    if (posicionMemoria === -1) {
        posicionMemoria = memoriaOperaciones.length - (mostrandoResultado ? 2 : 1);
    } else if (posicionMemoria > 0) {
        posicionMemoria--;
    } 
    if (modoEdicion) {
        reiniciarIntervalo();
    }else if (memoriaOperaciones.length) {
        modoLecturaMemoria = true;
        finalizarIntervalo();
        manejarIndicadoresMemoria();
        leerMemoria();
    }
}

const manejarDownClick = () => {
    if (modoEdicion) {
        reiniciarIntervalo();
    }else if (posicionMemoria < memoriaOperaciones.length - 1 && memoriaOperaciones.length) {
        posicionMemoria++;
        modoLecturaMemoria = true;
        finalizarIntervalo();
        manejarIndicadoresMemoria();
        leerMemoria();
    }
}


const editarOperacion = (valor) => { 
    if (valor === "ans") {
        if (operacion_display[posicionCursor] === "A") {
            moverCursorDerecha();
            gestionarDesborde();
            return;
        }
        operacion = operacion.substring(0, posicionFormula) + mapa[valor] + operacion.substring(posicionFormula + 1);
        gestionarDesborde();
        
        if (desborde) {
            let posicionForm;
            if (posicionCursor > 11) {
                let diferencia = 13 - posicionCursor;
                posicionFormula += 2;
                posicionCursor = posicionCursor - (2 - diferencia);
            }
            if (posicionFormula < 13) {
                posicionForm = 13;
            } else
                posicionForm = posicionFormula;
            operacion_display = operacion.substring(posicionForm - 13, posicionForm + 1);
        }
        else
            operacion_display = operacion;
        
    } else {
        if (operacion_display[posicionCursor] === "A")
            operacion = operacion.substring(0, posicionFormula) + mapa[valor] + operacion.substring(posicionFormula + 3);
        else
            operacion = operacion.substring(0, posicionFormula) + mapa[valor] + operacion.substring(posicionFormula + 1);
        gestionarDesborde();
        if (desborde)
            operacion_display = operacion.substring(operacion.length - 14, operacion.length);
        else
            operacion_display = operacion;
    }
    imprimirCursor(posicionCursor);
    reiniciarIntervalo();
    moverCursorDerecha();
    gestionarDesborde();
}



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
            operacion_display = operacion_display.substring(operacion_display.length - 14, operacion_display.length);
        } else {
            operacion_display = operacion.substring(operacion.length - 13) + " ";
            operacion_display_cursor = operacion.substring(operacion.length - 13) + "_";
        }
    } else {
        operacion_display = operacion + " ";
        operacion_display_cursor = operacion + "_";
        posicionCursor = operacion_display.length - 1;
    }
    reiniciarIntervalo();
}

const setFormula = (valor, tipo, tipokey) => {
    gestionarOperacionSobreResultado(valor, tipo, tipokey);
    operacion += mapa[valor];
    posicionFormula = operacion.length;
    gestionarDesborde();
    setFormulaVisible();
    mostrandoResultado = false;
    modoLecturaMemoria = false;
}

const validarEntrada = (valor, tipo, tipokey) => {
    if (valor in mapa) {
        if (modoEdicion) {
            editarOperacion(valor);
        } else {
            setFormula(valor, tipo, tipokey);
        }
    } else
        console.error("Haz modificado el mapa de valores");
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


const analizarResultado = (result) => {
    if (result > ENTERO_MAX || result < ENTERO_MIN || isNaN(result)) {
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
        finalizarIntervalo();
        salirModoExponencial();
        manejarError(error);
        mostrandoError = true;
        manejarIndicadoresMemoria();
        setTimeout(()=> {
            document.querySelector("[data-valor='operar']").classList.remove("button--active");
        }, 100);
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

const inicializarEdicion = (tecla) => {
    modoLecturaMemoria = false;
    mostrandoResultado = false;
    modoEdicion = true;
    if (tecla === "ArrowLeft" || tecla === "left") {
        operacion_display = operacion.substring(operacion.length - 14);
        posicionFormula = operacion.length;
        posicionCursor = operacion_display.length;
    }
    else if (tecla === "ArrowRight" || tecla === "right") {
        posicionCursor = 0;
        posicionFormula = posicionCursor;
    }
    
}



const moverCursorIzquierda = (tecla) => {
    if (operacion.length === 0) {
        reiniciarIntervalo()
        console.log("no hay hacia donde moverse");
        return;
    }
    if (!modoEdicion)
        inicializarEdicion(tecla)
    if (posicionCursor === 0) { 
        reiniciarIntervalo();
        console.log("no se puede mover mas a la izquierda");
        return;
    }
    if (!desborde) {
        if (operacion_display[posicionCursor - 1] === 's')
            posicionCursor -= 3
        else {
            posicionCursor--;
        }
        posicionFormula = posicionCursor;
        operacion_display = operacion;
        console.log("ñññññññññññ")
        imprimirCursor(posicionCursor);
    }
    else if (posicionFormula > 13) {
        if (operacion_display[posicionCursor - 1] === 's' && operacion_display[posicionCursor] != 'A') {
            posicionFormula--
            posicionCursor = operacion_display.length - 3;
            if (posicionFormula === 13) {
                posicionFormula = posicionCursor;
                operacion_display = operacion.substring(0, 14);
                imprimirCursor(posicionCursor);
                reiniciarIntervalo();
                gestionarDesborde();
                console.log("------------")
                return;
            }

        }
        else if (operacion_display[posicionCursor] === "A" && operacion_display[posicionCursor - 1] === "s") {
            posicionFormula -= 3
            console.log("xxxxxxxxxxxxx")
            if (posicionFormula <= 13) {
                let diferencia = 13 - posicionFormula;
                posicionCursor = operacion_display.length - 3 - diferencia;
                posicionFormula = posicionCursor;
                operacion_display = operacion.substring(0, 14);
                imprimirCursor(posicionCursor);
                console.log("curs:", posicionCursor, "form: ", posicionFormula, operacion_display, operacion_display_cursor);
                reiniciarIntervalo();
                gestionarDesborde();
                return;
            }
            else {
                posicionCursor = operacion_display.length - 3;
            }
        }
        else if (operacion_display[posicionCursor] === "A" && operacion_display[posicionCursor - 1] != "s") {
            if (posicionFormula - 3 < 13) {
                let diferencia = posicionFormula - 13;
                if (diferencia === 2) {
                    posicionCursor = operacion_display.length - 2;
                } else if (diferencia === 1) { 
                    posicionCursor = operacion_display.length - 3;
                }
                posicionFormula = posicionCursor;
                console.log("ooooooooooooooooooooo")
                operacion_display = operacion.substring(0, 14);
                imprimirCursor(posicionCursor);
                reiniciarIntervalo();
                gestionarDesborde();
                return;
            }
            else {
                posicionFormula -= 3;
                posicionCursor = operacion_display.length - 1;
                console.log("zzzzzzzzzzzz")
            }
            }
        else {
            posicionFormula--;
            posicionCursor = operacion_display.length - 1;
        }
        operacion_display= operacion.substring(posicionFormula - 13, posicionFormula + 1);
        imprimirCursor(posicionCursor);
    } else {
        if (operacion_display[posicionCursor - 1] === 's') {
            posicionCursor -= 3
            posicionFormula=posicionCursor
        }
        else {
            posicionCursor--;
            posicionFormula=posicionCursor
        }
        operacion_display = operacion.substring(0,14);
        imprimirCursor(posicionCursor);
    }
    
    console.log("curs:",posicionCursor, "form: ",posicionFormula, operacion_display, operacion_display_cursor);
    reiniciarIntervalo();
    gestionarDesborde();
}




const moverCursorDerecha = (tecla) => {
    if ((posicionCursor === operacion_display.length - 1 || (posicionCursor=== operacion_display.length - 3 && operacion_display[posicionCursor] === "A"))  && modoEdicion && !desborde) { 
        modoEdicion = false;
        operacion_display = operacion + " ";
        operacion_display_cursor = operacion + "_";
        posicionCursor = operacion_display.length - 1;
        reiniciarIntervalo();
        console.log("saliendo modo edicion");
        gestionarDesborde();
        return;
    }
    if ((posicionFormula === operacion.length - 1 || (posicionFormula=== operacion.length-3 && operacion[posicionFormula] === "A")) && modoEdicion && desborde) {
        modoEdicion = false;
        operacion_display = operacion.substring(operacion.length - 13) + " ";
        posicionCursor = operacion_display.length - 1;
        imprimirCursor(posicionCursor);
        reiniciarIntervalo();
        console.log("saliendo modo edicion");
        gestionarDesborde();
        return;
    }
    if ((posicionCursor === operacion_display.length - 1 || posicionFormula === operacion.length - 1) && !modoEdicion && !modoLecturaMemoria) {
        reiniciarIntervalo();
        console.log("no se puede mover mas a la derecha");
        return;
    }
    if (!modoEdicion && (mostrandoResultado || modoLecturaMemoria)) {
        inicializarEdicion(tecla);
        console.log("inicializando modo edicion desde la izquierda");
        operacion_display = operacion.substring(0, 14);
        imprimirCursor(posicionCursor);
    }
    else if (!desborde) {
        if (operacion_display[posicionCursor + 1] === 'n'|| operacion_display[posicionCursor] === 'A')
            posicionCursor += 3
        else {
            posicionCursor++;
        }
        posicionFormula = posicionCursor;
        console.log("23232323")
        operacion_display = operacion;
        imprimirCursor(posicionCursor);
    }
    else if (posicionFormula >= 13) {
        if (operacion[posicionFormula + 1] === 'A') {
            posicionFormula += 3
            posicionCursor = operacion_display.length - 3;
        }
        else if ((operacion_display[posicionCursor + 1] === 'n' || operacion[posicionFormula + 1] === 'n') && operacion[posicionFormula+3] === 'A') {
            posicionFormula += 3
            posicionCursor = operacion_display.length - 3;
            
        }
        else if ((operacion_display[posicionCursor + 1] === 'n' || operacion[posicionFormula + 1] === 'n') && operacion[posicionFormula + 3] != 'A') {
            posicionFormula ++
            posicionCursor = operacion_display.length - 1;
        }
        else if (operacion_display[posicionCursor + 1] === 'n' || operacion[posicionFormula+1]=== 'n') {
            posicionFormula += 3
            posicionCursor = operacion_display.length - 1;
        }
        else {
            posicionFormula++;
            posicionCursor = operacion_display.length - 1;
        }
        operacion_display = operacion.substring(posicionFormula - 13, posicionFormula + 1);
        imprimirCursor(posicionCursor);
    }
    else {
        if (operacion_display[posicionCursor + 1] === 'A' && posicionFormula+3 >13) {
            console.log("lllllllllll")
            posicionFormula = posicionCursor + 3;
            posicionCursor = operacion_display.length - 3;
            operacion_display = operacion.substring(posicionFormula - 13, posicionFormula + 1);
            imprimirCursor(posicionCursor);
        }
        else if ((operacion_display[posicionCursor] === 'A' || operacion[posicionFormula] === 'A') && operacion[posicionFormula + 3] === "A") {
            posicionFormula += 5;
            posicionCursor = operacion_display.length - 3;
            operacion_display = operacion.substring(posicionFormula - 13, posicionFormula + 1)
            console.log("___________")
            imprimirCursor(posicionCursor);
        }
        else if ((operacion_display[posicionCursor] === 'A' || operacion[posicionFormula] === 'A') && posicionFormula === operacion_display.length-3) {
            posicionFormula = 14;
            console.log("zzzzzzzzzz ");
            posicionCursor = operacion_display.length - 1;
            operacion_display = operacion.substring(posicionFormula - 13, posicionFormula + 1);
            imprimirCursor(posicionCursor);
        }
        else if ((operacion_display[posicionCursor + 1] === 'n' || operacion[posicionFormula + 1] === 'n') && posicionCursor+3 === 12 && operacion_display[posicionCursor+3] === 'A') {
            posicionFormula = 14;
            posicionCursor = operacion_display.length - 3;
            console.log("dfdfdfdfdfdfd");
            operacion_display = operacion.substring(posicionFormula - 13, posicionFormula + 1);
            imprimirCursor(posicionCursor);
        }
        else if ((operacion_display[posicionCursor + 1] === 'n' || operacion[posicionFormula + 1] === 'n') && posicionCursor + 3 === 13 && operacion_display[posicionCursor + 3] === 'A') {
            posicionFormula = 15;
            posicionCursor = operacion_display.length - 3;
            console.log("ooooooooooooo");
            operacion_display = operacion.substring(posicionFormula - 13, posicionFormula + 1);
            imprimirCursor(posicionCursor);
        }
        else if (operacion_display[posicionCursor + 1] === 'n' || operacion[posicionFormula + 1] === 'n') {
            posicionCursor += 3
            posicionFormula += 3
            operacion_display = operacion.substring(0, 14);
            imprimirCursor(posicionCursor);
            
        }
        else {
            posicionCursor++;
            posicionFormula++;
            operacion_display = operacion.substring(0, 14);
            imprimirCursor(posicionCursor);
            console.log("popopopopopopopopopo")
        }
    }

    console.log("curs:", posicionCursor, "form: ", posicionFormula, operacion_display, operacion_display_cursor);
    reiniciarIntervalo();
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
        presionandoDireccional = true;
        moverCursorIzquierda(dataFlecha)
        
    }
    else if (dataFlecha === 'right') {
        flechas.classList.add("rightPress");
        presionandoDireccional = true;
        moverCursorDerecha(dataFlecha)
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

const touchStartFunction = (e) => {
    let elemento = e.target;
    if (elemento.matches("button"))
        elemento.classList.add("button--active");
    mouseDownFunction(e);
    clickFunction(e);
}
const touchendFunction = (e) => {
    let elemento = e.target;
    if (elemento.matches("button"))
        elemento.classList.remove("button--active");
    mouseUpFunction(e);
}

ejecutarIntervalo();

if (isMobile()) {
    document.addEventListener("touchstart", touchStartFunction)
    document.addEventListener("touchend", touchendFunction)
    $on.addEventListener("touchstart", encender);
} else {
    document.addEventListener("click", clickFunction)
    $on.addEventListener("click", encender);
    document.addEventListener("keydown", keyDownFunction);
    document.addEventListener("keyup", keyUpFunction);
    document.addEventListener("mousedown", mouseDownFunction)
    document.addEventListener("mouseup", mouseUpFunction)
}
