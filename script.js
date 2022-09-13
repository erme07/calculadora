
const numBoton = document.querySelectorAll('[name="numero"], [name="operador"]');
const formula = document.querySelector(".formula");
const blink = document.querySelector(".blink");
const resultado = document.getElementById("resultado");
const borrar = document.getElementById("eliminar");
const reset = document.getElementById("reset");
const operar = document.getElementById("operar");
const simboloAns = document.querySelector(".Ans");
const exponente = document.querySelector(".exponente");
const base = document.querySelector(".base");
const flechaIzq = document.querySelector(".flechaIzq");

let formulaBack='',formulaAux='',formulaAns='' , ansActive=false, igual=false, error=false;

function verificarError(){
    if(ansActive){
        if(formula.innerHTML[0]==='+' || formula.innerHTML[0]==='×'||formula.innerHTML[0]==='÷' ||formula.innerHTML[0]==='-'){
            return true;
        }else if(formula.innerHTML===''){
            return false;
        }else{
            simboloAns.innerHTML='';
            blink.innerHTML='';
            formula.innerHTML='&nbsp;Sintax Error';
            resultado.innerHTML='';
            error=true;
            ansActive=false;
            return false;
        }
    }else if(formula.innerHTML===''){
        return false;
    }else{
        console.log("b");
        return true;
    }
    /*Por ahora solo detecta algunos errores de sintaxys relacionados al uso de "Ans"
    Falta desarrollo para detectar mas tipos de errores 
    al igual que las calculadoras convencionales */
}

function ejecutar(){
     if(verificarError() && !error){
        if(ansActive){
            formulaBack=formulaAns;
        }else{
            formulaBack=formula.innerHTML;
        }
        formulaBack=formulaBack.split('');
        for(let i=0;i<formulaBack.length;i++){
            if(formulaBack[i]==='×'){
                formulaBack[i]='*';
            }
            else if(formulaBack[i]=='÷'){
                formulaBack[i]='/';
            }
        }
        formulaBack=formulaBack.join('');
        resultado.innerHTML=eval(formulaBack);
        //notacionExpo();
        igual=true;
        blink.innerHTML='';
     }
}

function eliminar(){
    if(!igual && !error){
        if(ansActive && formula.innerHTML.length === 0){
            ansActive=false;
            simboloAns.innerHTML='';
        }
            formulaAux=formulaAns.slice(0,-1);
            formulaAns=formulaAux;
            formulaAux='';
            formulaAux=formula.innerHTML.slice(0,-1);
            formula.innerHTML=formulaAux;
            formulaAux='';
            desplazarTexto();
    }
}

function limpiarFormula(){
    formula.innerHTML='';
    blink.innerHTML='_';
}

function resetear(){
    limpiarFormula();
    resultado.innerHTML='0';
    ansActive=false;
    simboloAns.innerHTML='';
    exponente.classList.remove('mostrar');
    base.classList.remove('mostrar');
    flechaIzq.classList.remove('mostrar');
    error=false;
}


function modoAns(i){
    if((numBoton[i].getAttribute("name") ==='operador' && resultado.innerHTML!='0' && igual) || numBoton[i].innerHTML==='ANS' && !error){
        ansActive=true;
        igual=false;
        simboloAns.innerHTML="Ans";
        formulaAns=resultado.innerHTML;
        limpiarFormula();
    }else if(numBoton[i].getAttribute("name")==='numero' && ansActive && igual){
        ansActive=false;
        simboloAns.innerHTML='';
        formulaAns='';
    }
    if(ansActive){
        if(numBoton[i].innerHTML === '·' || numBoton[i].innerHTML === '−'){
            formulaAns+=numBoton[i].getAttribute("data-valor");
            formula.innerHTML+=numBoton[i].getAttribute("data-valor");
        }else if(numBoton[i].innerHTML != 'ANS'){
            formulaAns+=numBoton[i].innerHTML;
            formula.innerHTML+=numBoton[i].innerHTML;
        }
    }
    
}

function desplazarTexto(){
    if(ansActive){
        if(formula.innerHTML.length>10){
            formula.classList.add('desplazar');
            flechaIzq.classList.add('mostrar');
            simboloAns.innerHTML='';
        }else{
            formula.classList.remove('desplazar');
            flechaIzq.classList.remove('mostrar');
            simboloAns.innerHTML='Ans';
        }
    }else if(!error){
        if(formula.innerHTML.length>13){
            formula.classList.add('desplazar');
            flechaIzq.classList.add('mostrar');
        }else{
            formula.classList.remove('desplazar');
            flechaIzq.classList.remove('mostrar');
        }
    }
    
}



function notacionExpo(){
    if(resultado.innerHTML.length>12){
        exponente.classList.add("mostrar");
        base.classList.add("mostrar");
        /*falta implementar codigo para representar
         en notacion cientifica o exponencial los numeros 
         grandes que no caben en pantalla*/

    }else{
        exponente.classList.remove("mostrar");
        base.classList.remove("mostrar");
    }
    
}

numBoton.forEach((e,i) => {
    e.onclick=function(){
        modoAns(i);
        if(!ansActive){
            if(resultado.innerHTML!='0' && igual){
                limpiarFormula();
                igual=false;
                if(e.innerHTML === '·' || e.innerHTML === '−'){
                    formula.innerHTML+=e.getAttribute("data-valor");
                }else{
                    formula.innerHTML+=e.innerHTML;
                }
            }else if(!error){
                if(e.innerHTML === '·' || e.innerHTML === '−'){
                    formula.innerHTML+=e.getAttribute("data-valor");
                }else{
                    formula.innerHTML+=e.innerHTML;
                }
            }
        }
        desplazarTexto();
    };
});

operar.onclick = ejecutar;
borrar.onclick = eliminar;
reset.onclick = resetear;