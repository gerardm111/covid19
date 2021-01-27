let myHeading = document.querySelector('h1');
myHeading.textContent = 'Bonjour';

function ratio(part,total){
    const newLocal = (part / total) * 100;
    let result= newLocal;
    return result;
}