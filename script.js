
const numBoton = document.querySelectorAll('[name="numero"], [name="operador"]');
const formula = document.getElementById("formula");
const blink = document.getElementById("blink");
const resultado = document.getElementById("resultado");
const borrar = document.getElementById("eliminar");
const reset = document.getElementById("reset");
const operar = document.getElementById("operar");


let formulaFront = formula.innerHTML, formulaBack='',formulaAux='';

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
    blink.innerHTML='';
}
function eliminar(){
    if(resultado.innerHTML==='0'){
        formulaAux = formulaFront.slice(0,-1);
        formulaFront = formulaAux;
        formula.innerHTML=formulaFront;
    }
}
function resetear(){
    formulaFront='';
    blink.innerHTML='_';
    formula.innerHTML=formulaFront;
    resultado.innerHTML='0';
}

numBoton.forEach(e => {
    e.onclick=function(){
        blink.innerHTML='_';
        if(resultado.innerHTML!='0'){
            resetear();
        }
        if(e.innerHTML === '·' || e.innerHTML === '−'){
            formulaFront+=e.getAttribute("data-valor");
            formula.innerHTML=formulaFront;
        }else{
            formulaFront+=e.innerHTML;
            formula.innerHTML=formulaFront;
        }
    };
});

operar.onclick = ejecutar;
borrar.onclick = eliminar;
reset.onclick = resetear;