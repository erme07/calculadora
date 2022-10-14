/*
Practicas Html/CSS/Javascript - Erik Medina
*/
const teclado = document.getElementById('teclado');
const formula = document.querySelector(".formula");
const blink = document.querySelector(".blink");
const resultado = document.getElementById("resultado");
const exponente = document.querySelector(".exponente");
const base = document.querySelector(".base");
const flechaIzq = document.querySelector(".flechaIzq");
const flechaUp = document.querySelector(".flechaUp");
const flechaDown =document.querySelector(".flechaDown");
const flechaRight = document.querySelector(".flechaRight");
const contenedorFormula = document.querySelector('.contenedorFormula'); 
const padDireccional = document.querySelectorAll(".navLeft, .navRight, .navUp, .navDown");
const flechas = document.querySelector(".flechas");

const storageFormula = [];
const storageResultado = [];
const storageExponente = [];

let formulaBack='',formulaAux='',formulaAux2='', valorAns='',formulaDesplazada='', igual=false, 
    error=false, posicionStorage=0, posStorAux=0, memoria=false, encendido=true, desplazamiento=false, 
    cursorInt=null,posCursor=0,contador=0, valorExp=0, datoCursor='';


function apagar(){
    memoria=false;
    resetear();
    resultado.innerHTML='';
    formula.innerHTML='';
    blink.innerHTML='';
    encendido=false;
    resultado.classList.add("ocultar");
    contenedorFormula.classList.add("ocultar");
    flechaDown.classList.add("ocultar");
    flechaRight.classList.add("ocultar");
    flechaUp.classList.add("ocultar");
    flechaIzq.classList.add("ocultar");
    base.classList.add("ocultar");
    exponente.classList.add("ocultar");
}

function encender(){
    memoria=false;
    posicionStorage=0;
    posStorAux=0;
    encendido=true;
    resultado.innerHTML='0';
    limpiarFormula();
    resultado.classList.remove("ocultar");
    contenedorFormula.classList.remove("ocultar");
    flechaDown.classList.remove("ocultar");
    flechaRight.classList.remove("ocultar");
    flechaUp.classList.remove("ocultar");
    flechaIzq.classList.remove("ocultar");
    base.classList.remove("ocultar");
    exponente.classList.remove("ocultar");
    flechaRight.classList.remove("mostrar");
    flechaUp.classList.remove("mostrar");
    flechaIzq.classList.remove("mostrar");
}

function limpiarFormula(){
    formula.innerHTML='';
    blink.innerHTML='_';
}

function eliminar(){
    if(!igual && !error){
        if(formula.innerHTML[(formula.innerHTML.length)-1] === 's'){
            formulaAux=formula.innerHTML.slice(0,-3);
            valorAns=formulaAux;
            formulaAux='';
            formulaAux=formula.innerHTML.slice(0,-3);
            formula.innerHTML=formulaAux;
            formulaAux='';
            desplazarTexto();
        }else{
            formulaAux=formula.innerHTML.slice(0,-1);
            valorAns=formulaAux;
            formulaAux='';
            formulaAux=formula.innerHTML.slice(0,-1);
            formula.innerHTML=formulaAux;
            formulaAux='';
            desplazarTexto();
        }
    }
}

function resetear(){
    limpiarFormula();
    formulaBack='';
    resultado.innerHTML='0';
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

function desplazarTexto(){
    if(!error && formula.innerHTML.length>13){
        formula.classList.add('desplazar');
        flechaIzq.classList.add('mostrar');
        desplazamiento=true;
    }else{
        formula.classList.remove('desplazar');
        flechaIzq.classList.remove('mostrar');
        desplazamiento=false;
        stopInterval();
    }
}

function flashCursor() {
    if(formula.innerHTML === formulaDesplazada){
        formula.innerHTML=formulaAux2
    }else{
        formula.innerHTML=formulaDesplazada;
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

    if(direccion === 'left' && desplazamiento){ 
        blink.innerHTML='';
        if(datoCursor===''){
            formulaAux2=formula.innerHTML;
            formulaDesplazada=formula.innerHTML.split('');
        }else{
            formulaDesplazada=formulaDesplazada.split('');
            formulaDesplazada[posCursor]=datoCursor;
        }
        contador++;
        posCursor=formula.innerHTML.length-contador;
        
        datoCursor=formula.innerHTML[posCursor]
        
        formulaDesplazada[posCursor]='_'
        formulaDesplazada=formulaDesplazada.join('');
        stopInterval();
        formula.innerHTML=formulaDesplazada;
        cursorInt = setInterval(flashCursor, 450);
        
    }else if(direccion === 'right' && desplazamiento){
        blink.innerHTML='';
        if(datoCursor===''){
            formulaAux2=formula.innerHTML;
            formulaDesplazada=formula.innerHTML.split('');
        }else{
            formulaDesplazada=formulaDesplazada.split('');
            formulaDesplazada[posCursor]=datoCursor;
            
        }
        contador--;
        posCursor=formula.innerHTML.length-contador;
        
        datoCursor=formula.innerHTML[posCursor]
        
        formulaDesplazada[posCursor]='_'
        formulaDesplazada=formulaDesplazada.join('');
        stopInterval();
        formula.innerHTML=formulaDesplazada;
        cursorInt = setInterval(flashCursor, 450);
    }
}

function errores(tipo){
    if(tipo === 'sintax'){
        formula.innerHTML='&nbsp;Sintax Error';
    }else if(tipo === 'math'){
        formula.innerHTML='&nbsp;&nbsp;Math Error';
    }
    blink.innerHTML='';
    resultado.innerHTML='';
    error=true;
    flechasMemoria();
    desplazarTexto();
}

function displayExpo(accion){
    if(accion==='mostrar'){
        base.classList.add("mostrar")
        exponente.innerHTML=valorExp;
        valorExp=0;
    }else if(accion === 'ocultar'){
        base.classList.remove("mostrar");
        exponente.innerHTML='';
    }
}

function notacionExpo(result){
    result=result.toString();
    let resultAux='';
    if(result.includes('.')){
        //pendiente desarrollo de comportamiento para exponentes negativos
        if(result[0]=='0'){
        }else{
            resultAux=result.substring(0,11);
            if(!resultAux.includes('.') || resultAux[resultAux.length-1]=='.'){
                resultAux=resultAux.substring(0,10);
            }
        }
    }else{
        valorExp=result.length-1;
        resultAux=result[0]+'.'+result.substring(1,result.length);
        resultAux=resultAux.substring(0,11);
        resultAux=eval(resultAux); //usando eval se eliminan los ceros innecesarios
        valorAns=resultAux+'e'+valorExp;
        resultado.innerHTML=resultAux;
    }
}

function setMemoria(){
    if(storageFormula.length<8){
        posicionStorage=storageFormula.push(formula.innerHTML)
        storageResultado.push(resultado.innerHTML);
        storageExponente.push(valorExp);
        posStorAux=posicionStorage-1;
    }else if(storageFormula.length === 8){
        storageFormula.push(formula.innerHTML)
        storageFormula.shift()
        storageResultado.push(resultado.innerHTML)
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
        formula.innerHTML=storageFormula[posStorAux];
        resultado.innerHTML=storageResultado[posStorAux];
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

function verificar(){
    let aperturaParentesis=0, cerrarParentesis=0;
    const valoresAdmitidos = /Ans|e|\(|\)|\.|[0-9]|\+|\-|×|÷/g;
    const errorSintaxis = /(\.\.+)|(÷÷+)|(××+)|(\)[0-9])/g // '..','//','**' error de sintaxis
    const errorSintaxisOperadores = /((?<![0-9]|\))[\/\*])|([\/\*](?![0-9]|\(|\-|\+|.))/
    const listaOperadores = ['+','-','*','/'];
    const quitarRepetidos = [/\+0+/,/\-0+/,/\*0+/,/\/0+/];

    if(valoresAdmitidos.test(formula.innerHTML)){//eval() solo recibirá los valores que defino como permitidos
        formulaBack=formula.innerHTML;
        //reemplazo los operadores por su valor permitido para eval()
        formulaBack=formulaBack.replace(/×/g,'*');
        formulaBack=formulaBack.replace(/÷/g,'/');
        formulaBack=formulaBack.replace(/Ans/g,valorAns);
        //quito los ceros a la izquierda para que no se tomen como numeros octales.
        while(formulaBack[0]=='0'){formulaBack=formulaBack.substring(1,formulaBack.length);}
        listaOperadores.forEach((e,i) => formulaBack=formulaBack.replace(quitarRepetidos[i],listaOperadores[i]))
        
        formulaBack.split('').forEach((e)=>{ 
            if(e=='(')aperturaParentesis++;
            if(e==')')cerrarParentesis++;
            //si no coinciden la cantidad de parentesis de apertura y cierre entonces hay un error de sintaxis
        });

        if(formulaBack.match(/(\-[+-]+)|(\+[-+]+)/g)!=null){
            formulaBack=formulaBack.replace(/\-{2}/g ,'+');
            formulaBack=formulaBack.replace(/\++/g, '+');
        }// ya que eval() no lo admite, proceso la regla de los signos previamente.

        //agrego la multiplicacion para expresiones del tipo a(bc)
        formulaBack=formulaBack.replace(/(?<=[0-9])\(/, '*(');

        if((errorSintaxis.test(formulaBack)) || (aperturaParentesis!=cerrarParentesis) || formulaBack.endsWith('+') ||
        formulaBack.endsWith('-') || errorSintaxisOperadores.test(formulaBack) || /\(\)/.test(formulaBack)|| 
        formulaBack.endsWith('+') || formulaBack.endsWith('-')){
            errores('sintax');
        }else{
            ejecutar();
        }
    }
}

function ejecutar(){
    let result;
    let numeroMax=999999999999999;
    let numeroMin=-numeroMax;
    result=Number(eval(formulaBack).toFixed(9));
    if(result == Infinity || result == -Infinity|| result>numeroMax || result<numeroMin){
        errores('math'); //las calculadores basicas suelen marcar error cuando el valor es infinito o demasiado grande
    }else if((result.toString().length>10 && !result.toString().includes('.')) || result.toString().length>11){
        blink.innerHTML='';
        igual=true;
        notacionExpo(result);
        setMemoria();
        displayExpo('mostrar');
        valorExp=0;
    }else{
        resultado.innerHTML = result;
        valorAns=result;
        igual=true;
        blink.innerHTML='';
        setMemoria();
        displayExpo('ocultar');
    }
}

if(encendido){
    teclado.addEventListener('click', (e)=>{
        if(e.target && ( e.target.getAttribute("data-tipo")==='numero' || e.target.getAttribute("data-tipo") ==='operador')){
            if(e.target.getAttribute("data-valor").length === 1 || e.target.getAttribute("data-valor") === 'Ans'){
                if(e.target.getAttribute("data-tipo") ==='operador' && resultado.innerHTML!='0' && igual && e.target.getAttribute("data-valor") !='Ans'){
                    igual=false;
                    limpiarFormula();
                    formula.innerHTML+='Ans'+ e.target.getAttribute("data-valor");
                }else if(resultado.innerHTML!='0' && igual){
                    limpiarFormula();
                    flechasMemoria();
                    igual=false;
                    formula.innerHTML+=e.target.getAttribute("data-valor");
                }else if(!error){
                    formula.innerHTML+=e.target.getAttribute("data-valor");
                }
                desplazarTexto();
            }
        }else if(e.target.getAttribute("data-valor") === 'eliminar'){
            eliminar();
        }else if(e.target.getAttribute("data-valor") === 'reset'){
            resetear();
        }else if(e.target.getAttribute("data-valor") === 'operar'){
            verificar();
        }else if(e.target.getAttribute("data-valor") === 'off'){
            apagar();
        }else if(e.target.getAttribute("data-valor") === 'on'){
            encender();
        }
    });
    flechas.addEventListener('mousedown', (e)=>{
        if(e.target && e.target.tagName === 'BUTTON' ){
            direccionPress(e.target.getAttribute("data-flecha"));
            if(e.target.getAttribute("data-flecha") === 'left' || e.target.getAttribute("data-flecha") === 'right'){
                // editarFormula(event.target.getAttribute("data-flecha")); 
                // Funcion que permite navegar sobre la formula, para editar o insertar nuevos elementos.
            }else if(e.target.getAttribute("data-flecha") === 'up' || e.target.getAttribute("data-flecha") === 'down'){
                getMemoria(e.target.getAttribute("data-flecha"));
            }
        }
    });
    flechas.addEventListener('mouseup', (e)=> direccionPress(e.target.getAttribute("data-flecha"))
    );
}