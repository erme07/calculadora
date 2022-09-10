
const numBoton = document.querySelectorAll('[name="numero"], [name="operador"]');
const formula = document.getElementById("formula");
const blink = document.getElementById("blink");
const resultado = document.getElementById("resultado");
const borrar = document.getElementById("eliminar");
const reset = document.getElementById("reset");
const operar = document.getElementById("operar");
const simboloAns = document.getElementById("Ans");
const ans = document.getElementById("agregar");


let formulaFront = formula.innerHTML, formulaBack='',formulaAux='',formulaAns='',valorAns='' , ansActive=false, igual=false;

function ejecutar(){
    formulaBack=formulaFront;
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
    console.log(eval(formulaBack).toFixed(1));

    igual=true;
    blink.innerHTML='';
}
function eliminar(){
    if(resultado.innerHTML==='0'){
        formulaAux = formulaFront.slice(0,-1);
        formulaFront = formulaAux;
        formula.innerHTML=formulaFront;
    }
}
function limpiarFormula(){
    formulaFront='';
    formula.innerHTML=formulaFront;
}
function resetear(){
    formulaFront='';
    blink.innerHTML='_';
    formula.innerHTML=formulaFront;
    resultado.innerHTML='0';
    ansActive=false;
    simboloAns.innerHTML='';
}


function modoAns(i){
    if(numBoton[i].getAttribute("name") ==='operador' && resultado.innerHTML!='0' && igual){
        ansActive=true;
        simboloAns.innerHTML="Ans";
        valorAns=resultado.innerHTML;
        formulaFront=valorAns;
        formula.innerHTML='';
    }
    if(numBoton.innerHTML==='ANS'){
        ansActive=true;
        simboloAns.innerHTML="Ans";
        valorAns=resultado.innerHTML;
        formulaFront=valorAns;
        formula.innerHTML='';
    }
}

numBoton.forEach((e,i) => {
    e.onclick=function(){
        blink.innerHTML='_';
        modoAns(i);
        if(ansActive){
            
            if(e.innerHTML === '·' || e.innerHTML === '−'){
                formulaFront+=e.getAttribute("data-valor");
                formula.innerHTML+=e.getAttribute("data-valor");
            }else if(e.innerHTML != 'ANS'){
                formulaFront+=e.innerHTML;
                formula.innerHTML+=e.innerHTML;
            }
            
        }else if(resultado.innerHTML!='0' && igual){
            limpiarFormula();
            igual=false;
            if(e.innerHTML === '·' || e.innerHTML === '−'){
                formulaFront+=e.getAttribute("data-valor");
                formula.innerHTML=formulaFront;
            }else{
                formulaFront+=e.innerHTML;
                formula.innerHTML=formulaFront;
            }
        }else {
            if(e.innerHTML === '·' || e.innerHTML === '−'){
                formulaFront+=e.getAttribute("data-valor");
                formula.innerHTML=formulaFront;
            }else{
                formulaFront+=e.innerHTML;
                formula.innerHTML=formulaFront;
            }
        }
        
    };
});

operar.onclick = ejecutar;
borrar.onclick = eliminar;
reset.onclick = resetear;