const buttonstart = document.getElementById("truco");
const buttonvoltar = document.getElementById("mortal");
const buttonvoltar2 = document.getElementById("street");

buttonstart.addEventListener("click", function() {
    window.location.href = 'loginPage.html'; 
});

buttonvoltar.addEventListener("click", function() {
    window.location.href = 'indisponivel.html'; 
});

buttonvoltar2.addEventListener("click", function() {
    window.location.href = 'indisponivel.html'; 
});