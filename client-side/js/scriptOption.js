// Seleciona os botões
const buttonModo2Duplas = document.getElementById("modo2Duplas");
const buttonModo4Duplas = document.getElementById("modo4Duplas");
const buttonModo6Duplas = document.getElementById("modo6Duplas");

// Adiciona eventos aos botões
buttonModo2Duplas.addEventListener("click", function() {
    // Armazena o modo de jogo no localStorage
    localStorage.setItem('modoDeJogo', '2 duplas');
    window.location.href = 'teamPage.html';
});

/*
buttonModo4Duplas.addEventListener("click", function() {
    localStorage.setItem('modoDeJogo', '4 duplas');
    window.location.href = 'teamPage.html';
});

buttonModo6Duplas.addEventListener("click", function() {
    localStorage.setItem('modoDeJogo', '6 duplas');
    window.location.href = 'teamPage.html';
});

*/

const modoDeJogo = localStorage.getItem('modoDeJogo');
if (modoDeJogo) {
    console.log("Modo de jogo escolhido: " + modoDeJogo);
    document.getElementById("modoEscolhido").textContent = `Modo de Jogo: ${modoDeJogo}`;
} else {
    console.log("Nenhum modo de jogo foi selecionado.");
}
