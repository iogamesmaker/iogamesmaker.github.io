var cheeseCount = 0;
var realCheeseCount = 0;
document.addEventListener('DOMContentLoaded', function () {
  document.body.onkeyup = function (e) {
    if (e.keyCode === 32) { // Spacebar
      duplicateCheese();
    }
  };
});

var cheeseLimit = 10;

function duplicateCheese() {
  if (cheeseCount >= cheeseLimit) {
    // Remove the oldest cheese
    var cheeses = document.querySelectorAll('.duplicate');
    cheeses[0].parentNode.removeChild(cheeses[0]);
    cheeseCount--;
  }

  var originalCheese = document.getElementById('kaasImg');
  var cloneCheese = originalCheese.cloneNode(true);
  cloneCheese.classList.add('duplicate');

  // Generate random coordinates
  var maxX = window.innerWidth - originalCheese.width;
  var maxY = window.innerHeight - originalCheese.height;
  var randomX = Math.floor((Math.random() - 0.5) * maxX);
  var randomY = Math.floor((Math.random() - 0.5) * maxY);

  // Set position
  cloneCheese.style.left = randomX + 'px';
  cloneCheese.style.top = randomY + 'px';

  originalCheese.parentNode.appendChild(cloneCheese);
  cheeseCount++;
  realCheeseCount++;

  updateCheeseCountDisplay();
}

function updateCheeseCountDisplay() {
  var cheeseCountDisplay = document.getElementById('cheeseCountDisplay');
  cheeseCountDisplay.textContent = 'Cheese Count: ' + realCheeseCount;
}
