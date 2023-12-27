/*
Practicas Html/CSS/Javascript - Erik Medina
*/
const teclado = document.getElementById('teclado'),
    $formula = document.querySelector(".formula"),
    blink = document.querySelector(".blink"),
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
    flechas = document.querySelector(".flechas");

const storageFormula = [],
    storageResultado = [],
    storageExponente = [];

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
const ENTEROMAX = 9.999999999e+99, ENTEROMIN = -ENTEROMAX, DECIMALMINPOSITIVO = 1e-99, DECIMALMINNEGATIVO = -DECIMALMINPOSITIVO;

//modos - estados
let modoExponencial = false, mostrandoError = false, mostrandoResultado = false, desborde = false;

//variables
let exponente, coeficiente, resultado;
let operacion = "", operacion_display = "", ans = 0;

let formulaBack='',formulaAux='',formulaAux2='', valorAns='',formulaDesplazada='', igual=false, 
    error=false, posicionStorage=0, posStorAux=0, memoria=false, encendido=true, 
    cursorInt = null, posCursor = 0, contador = 0, valorExp = 0, datoCursor = '';
    
const keyMap = Object.freeze({
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
    "+": "suma",
    "-": "resta",
    "*": "multiplicacion",
    "/": "division"
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
    $resultado.innerHTML='';
    $formula.innerHTML='';
    blink.innerHTML='';
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
    memoria=false;
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

function limpiarFormula() {
    operacion = '';
    operacion_display = '';
    $formula.innerHTML= operacion_display;
    blink.innerHTML='_';
}

const eliminar=()=>{
    if(operacion_display[operacion_display.length - 1] === 's')
        operacion_display = operacion_display.slice(0, -3)
    else
        operacion_display = operacion_display.slice(0, -1)
    $formula.innerHTML = operacion_display;
    operacion=operacion.slice(0, -1);
    checkDesborde();
}

function resetear() {
    console.clear();
    limpiarFormula();
    //formulaBack='';
    operacion = '';
    operacion_display = '';
    resultado = 0;
    $resultado.innerHTML = resultado;
    displayExpo('ocultar');
    flechaIzq.classList.remove('mostrar');
    error=false;
    igual=false;
    flechasMemoria();
    stopInterval();
}

function stopInterval() {
    clearInterval(cursorInt);
    // liberar nuestro inervalId de la variable
    cursorInt = null;
}

const desbordeTrue = () => {
    $formula.classList.add('formula--desbordada');
    flechaIzq.classList.add('mostrar');
    desborde = true;
}

const desbordeFalse = () => {
    $formula.classList.remove('formula--desbordada');
    flechaIzq.classList.remove('mostrar');
    desborde = false;
    //stopInterval();
}

const checkDesborde=()=>{
    if(!error && operacion_display>13){
        desbordeTrue();
    }else{
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

function flechasMemoria(){
    posStorAux=posicionStorage;
    if(memoria && !error){
        flechaUp.classList.add("mostrar");
    }else {
        flechaUp.classList.remove("mostrar");
    }
    flechaDown.classList.remove("mostrar");
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
        blink.innerHTML='';
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
        blink.innerHTML='';
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



function displayExpo(accion){
    if(accion==='mostrar'){
        $base.classList.add("mostrar")
        $exponente.innerHTML=valorExp;
        valorExp=0;
    }else if(accion === 'ocultar'){
        $base.classList.remove("mostrar");
        $exponente.innerHTML='';
    }
}

function notacionExpo(result){
    result=result.toString();
    let resultAux='';
    if(result.includes('.')){
        //pendiente desarrollo de comportamiento para exponentes negativos
        if(result[0]=='0'){
            resultAux=result.split('.');
        }else{
            resultAux=result.substring(0,11);
            if(!resultAux.includes('.') || resultAux[resultAux.length-1]=='.'){
                resultAux=resultAux.substring(0,10);
            }
        }
    }else if(result.includes('e')){
        valorAns=result;
        resultAux= result.split('e');
        $resultado.innerHTML=result[0];
        if(Number(resultAux[1])>-10 && Number(resultAux[1])<0){
            valorExp='-0'+ Number(resultAux[1])*-1;
        }else if(Number(resultAux[1])>0 && Number(resultAux[1])<10){
            valorExp='0'+ Number(resultAux[1])
        }else{
            valorExp=resultAux[1];
        }
    }else{
        valorExp=result.length-1;
        resultAux=result[0]+'.'+result.substring(1,result.length);
        resultAux=resultAux.substring(0,11);
        resultAux=eval(resultAux); //usando eval se eliminan los ceros innecesarios
        valorAns=resultAux+'e'+valorExp;
        $resultado.innerHTML=resultAux;
    }
}

function setMemoria(){
    if(storageFormula.length<8){
        posicionStorage=storageFormula.push($formula.innerHTML)
        storageResultado.push($resultado.innerHTML);
        storageExponente.push(valorExp);
        posStorAux=posicionStorage-1;
    }else if(storageFormula.length === 8){
        storageFormula.push($formula.innerHTML)
        storageFormula.shift()
        storageResultado.push($resultado.innerHTML)
        storageResultado.shift();
        storageExponente.push(valorExp);
        storageExponente.shift();
        posicionStorage=storageFormula.length;
        posStorAux=posicionStorage-1;
    }
    if(storageFormula.length!=0){
        flechaUp.classList.add("mostrar");
        memoria=true;
    }
}

function getMemoria(direccion){
    if(memoria){
        if(direccion ==='up' && posStorAux>=1){
            posStorAux--;
        }else if(direccion === 'down' && posStorAux<=posicionStorage-2){
            posStorAux++;
        }
        blink.innerHTML='';
        $formula.innerHTML=storageFormula[posStorAux];
        $resultado.innerHTML=storageResultado[posStorAux];
        if(storageExponente[posStorAux]==0){
            displayExpo('ocultar');
        }else{
            valorExp=storageExponente[posStorAux]
            displayExpo('mostrar');
        }
        if(posStorAux==0){
            flechaUp.classList.remove("mostrar");
        }else{
            flechaUp.classList.add("mostrar");
        }
        if(posStorAux<posicionStorage-1){
            flechaDown.classList.add("mostrar");
        }else if(posStorAux==posicionStorage-1){
            flechaDown.classList.remove("mostrar");
        }
    }
}



function ejecutar(){
    let result;
    let numeroMax=999999999999999;
    let numeroMin=-numeroMax;
    result=Number(eval(formulaBack).toFixed(9));
    console.log(result);
    if(result == Infinity || result == -Infinity|| result>numeroMax || result<numeroMin){
        errores('math'); //las calculadores basicas suelen marcar error cuando el valor es infinito o demasiado grande
    }else if((result.toString().length>10 && !result.toString().includes('.')) || result.toString().length>11 || result.toString().includes('e')){
        blink.innerHTML='';
        igual=true;
        notacionExpo(result);
        setMemoria();
        displayExpo('mostrar');
        valorExp=0;
    }else{
        $resultado.innerHTML = result;
        valorAns=result;
        igual=true;
        blink.innerHTML='';
        setMemoria();
        displayExpo('ocultar');
    }
}




const validarEntrada = (valor) => {
    if(valor in mapa){
        if (valor === "multiplicacion" || valor === "division") {
            operacion += mapa[valor].back;
            operacion_display += mapa[valor].front;
        } else {
            operacion += mapa[valor];
            operacion_display += mapa[valor];
        }
        $formula.innerHTML = operacion_display;
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
    const valoresAdmitidos = /^(Ans|e|pi|log|\(|\)|\.|[0-9]|\+|\-|×|\*|\/|÷)*$/;
    if (!valoresAdmitidos.test(operacion) || !valoresAdmitidos.test(operacion_display)) {
        throw new InvalidValueError();
    }
}

const notacionExponencial = (result) => { 
    if (Number.isInteger(result)) {
        result = math.format(result, { notation: 'exponential', precision: 11 })
        exponente = result.split('e')[1];
        coeficiente = result.split('e')[0];
        coeficiente = coeficiente.substring(0, 11);
        return coeficiente;
    }
}

const isExponecial = (result) => {
    if (!Number.isInteger(result) && math.format(result, { notation: 'fixed' }).length > 11) 
        return true
    else if (Number.isInteger(result) && math.format(result, { notation: 'fixed' }).length > 10)
        return true
    else
        return false;
}

const mostrarNotacionExponencial = () => { 
    $base.classList.add("mostrar")
    $exponente.innerHTML = exponente;
}

const analizarResultado = (result) => {
    if (result === 'Infinity')
        throw new MathError();
    if (result > ENTEROMAX || result < ENTEROMIN) {
        throw new MathError();
    }
    if (isExponecial(result)) {
        console.log("es exponencial")
        modoExponencial = true;
        mostrarNotacionExponencial();
        result = notacionExponencial(result);
    }
    //console.log(result.toExponential(9));
    $resultado.innerHTML = result;
    
}

const operar = (formulaMath) => {
    try {
        validarOperacion();
        let result;
        result = math.evaluate(formulaMath);
        result = math.format(result, { precision: 14 });
        result = math.evaluate(result);
        analizarResultado(result);
        
    } catch (error) {
        manejarError(error);
    }
}

const clickFunction = (e) => {
    if (e.target.getAttribute("data-tipo") === 'argumento' || e.target.getAttribute("data-tipo") === 'operador') {
        validarEntrada(e.target.getAttribute("data-valor"))
        checkDesborde();
    }
    else if (e.target.getAttribute("data-valor") === 'eliminar')
        eliminar();
    else if (e.target.getAttribute("data-valor") === 'reset')
        resetear();
    else if (e.target.getAttribute("data-valor") === 'operar')
        operar(operacion);
    else if (e.target.getAttribute("data-valor") === 'off')
        apagar();
    else if (e.target.getAttribute("data-valor") === 'on')
        encender();
}

const keyDownFunction = (event) => {
    if (event.key in keyMap) {
        document.querySelector(`[data-valor='${keyMap[event.key]}']`).classList.add("button--active");
        validarEntrada(keyMap[event.key]);
        checkDesborde();
    } else if (event.key === "Enter") {
        document.querySelector("[data-valor='operar']").classList.add("button--active");
        operar(operacion)
    } else if (event.key === "Backspace") {
        document.querySelector("[data-valor='eliminar']").classList.add("button--active");
        eliminar();
    } else if (event.key === "Escape") {
        document.querySelector("[data-valor='reset']").classList.add("button--active");
        resetear();
    }
}

const keyUpFunction = (event) => {
    if (event.key in keyMap)
        document.querySelector(`[data-valor='${keyMap[event.key]}']`).classList.remove("button--active");
    else if (event.key === "Enter")
        document.querySelector("[data-valor='operar']").classList.remove("button--active");
    else if (event.key === "Backspace")
        document.querySelector("[data-valor='eliminar']").classList.remove("button--active");
    else if (event.key === "Escape")
        document.querySelector("[data-valor='reset']").classList.remove("button--active");
}

document.addEventListener("click", clickFunction)
document.addEventListener("keydown", keyDownFunction);
document.addEventListener("keyup", keyUpFunction);






































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