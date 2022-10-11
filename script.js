
const numBoton = document.querySelectorAll('[data-tipo="numero"], [data-tipo="operador"]');
const formula = document.querySelector(".formula");
const blink = document.querySelector(".blink");
const resultado = document.getElementById("resultado");
const borrar = document.getElementById("eliminar");
const reset = document.getElementById("reset");
const operar = document.getElementById("operar");
const exponente = document.querySelector(".exponente");
const base = document.querySelector(".base");
const flechaIzq = document.querySelector(".flechaIzq");
const flechaUp = document.querySelector(".flechaUp");
const flechaDown =document.querySelector(".flechaDown");
const flechaRight = document.querySelector(".flechaRight");
const off = document.getElementById("off");
const on = document.getElementById("on");
const contenedorFormula = document.querySelector('.contenedorFormula'); 
const padDireccional = document.querySelectorAll(".navLeft, .navRight, .navUp, .navDown");
const flechas = document.querySelector(".flechas");

const storageFormula = [];
const storageResultado = [];
const storageExponente = [];

let formulaBack='',formulaAux='',formulaAux2='', valorAns='',formulaDesplazada='', igual=false, 
    error=false, posicionStorage=0, posStorAux=0, memoria=false, encendido=true, desplazamiento=false, 
    cursorInt=null,posCursor=0,contador=0, valorExp=0;

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

function ejecutar(){
    let result;
    let numeroMax=999999999999999;
    let numeroMin=-numeroMax;
    formulaBack=formula.innerHTML;
    formulaBack=formulaBack.replace(/×/g,'*');
    formulaBack=formulaBack.replace(/÷/g,'/');
    formulaBack=formulaBack.replace(/Ans/g,valorAns);
    result=Number(eval(formulaBack).toFixed(9));
    if(result == Infinity || result == -Infinity|| result>numeroMax || result<numeroMin){
        errores('math'); //las calculadores basicas suelen marcar error cuando el valor es infinito o demasiado grande
    }else if(result.toString().length>10){
        valorAns=result;
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
    }else{
        valorExp=result.length-1;
        resultAux=result[0]+'.'+result.substring(1,result.length);
        resultAux=resultAux.substring(0,11);
        resultado.innerHTML=resultAux;
    }
}

function verificar(){
    let aperturaParentesis=[], cerrarParentesis=[];
    const valoresAdmitidos = /Ans|\(|\)|\.|[0-9]\+|\-|×|÷/g;
    if(valoresAdmitidos.test(formula.innerHTML)){
        aperturaParentesis=formula.innerHTML.match(/\(/g);
        cerrarParentesis=formula.innerHTML.match(/\)/g);
        if(aperturaParentesis!=cerrarParentesis){
            if((aperturaParentesis==null && cerrarParentesis!=null) || (aperturaParentesis!=null && cerrarParentesis==null)){
                errores('sintax');
            }else if(aperturaParentesis.length!=cerrarParentesis.length){
                errores('sintax');
            }else{
                ejecutar();
            }
        }else{
            ejecutar();
        }
    }
    /*Por ahora solo detecta algunos errores de sintaxis relacionados al mal uso de parentesis
    Falta desarrollo para detectar mas tipos de errores 
    al igual que las calculadoras convencionales */
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
    // sessionStorage.setItem("formulas",JSON.stringify(storageFormula));
    // sessionStorage.setItem("resultados", JSON.stringify(storageResultado));
    /* Alternativa usando almacenamiento local en el navegador para retener las operaciones realizadas */
}

function getMemoria(direccion){
    if(memoria){
        if(direccion ==='up' && posStorAux>=1){
            posStorAux--;
            console.log(posStorAux,storageFormula, storageResultado, storageExponente)
            console.log(posStorAux);
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

function eliminar(){
    if(!igual && !error){
        if(formula.innerHTML[(formula.innerHTML.length)-1] === 's'){
            formulaAux=valorAns.slice(0,-3);
            valorAns=formulaAux;
            formulaAux='';
            formulaAux=formula.innerHTML.slice(0,-3);
            formula.innerHTML=formulaAux;
            formulaAux='';
            desplazarTexto();
        }else{
            formulaAux=valorAns.slice(0,-1);
            valorAns=formulaAux;
            formulaAux='';
            formulaAux=formula.innerHTML.slice(0,-1);
            formula.innerHTML=formulaAux;
            formulaAux='';
            desplazarTexto();
        }
    }
}

function limpiarFormula(){
    formula.innerHTML='';
    blink.innerHTML='_';
}

function resetear(){
    limpiarFormula();
    resultado.innerHTML='0';
    displayExpo('ocultar');
    flechaIzq.classList.remove('mostrar');
    error=false;
    igual=false;
    flechasMemoria();
    stopInterval();
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

function stopInterval() {
    clearInterval(cursorInt);
    // liberar nuestro inervalId de la variable
    cursorInt = null;
}

let datoCursor='';

function editarFormula(direccion){

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

function apagar(prueba){
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

if(encendido){
    numBoton.forEach((elemento) => {
        elemento.addEventListener('click', function(event){
            if(elemento.getAttribute("data-valor").length = 1 || elemento.getAttribute("data-valor") === 'Ans'){
                if(elemento.getAttribute("data-tipo") ==='operador' && resultado.innerHTML!='0' && igual && elemento.getAttribute("data-valor") !='Ans'){
                    igual=false;
                    limpiarFormula();
                    formula.innerHTML+='Ans'+ elemento.getAttribute("data-valor");
                }else if(resultado.innerHTML!='0' && igual){
                    limpiarFormula();
                    flechasMemoria();
                    igual=false;
                    formula.innerHTML+=elemento.getAttribute("data-valor");
                }else if(!error){
                    formula.innerHTML+=elemento.getAttribute("data-valor");
                }
                desplazarTexto();
            }
        });
    });
    padDireccional.forEach((elemento)=>{
        elemento.addEventListener('mousedown', function(event){
            direccionPress(event.target.getAttribute("data-flecha"));
            if(event.target.getAttribute("data-flecha") === 'left' || event.target.getAttribute("data-flecha") === 'right'){
                // editarFormula(event.target.getAttribute("data-flecha")); 
                // Funcion que permite navegar sobre la formula, para editar o insertar nuevos elementos.
            }else if(event.target.getAttribute("data-flecha") === 'up' || event.target.getAttribute("data-flecha") === 'down'){
                getMemoria(event.target.getAttribute("data-flecha"));
            }
        });
        elemento.addEventListener('mouseup', function(event){
            direccionPress(event.target.getAttribute("data-flecha"))
        });
    });
    operar.onclick = verificar;
    borrar.onclick = eliminar;
    reset.onclick = resetear;
    on.addEventListener('click',encender);
    off.addEventListener('click',apagar);
}
