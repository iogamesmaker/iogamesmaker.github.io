var cheeseCount = 0;

document.addEventListener('DOMContentLoaded', function () {
  document.body.onkeyup = function (e) {
    if (e.keyCode === 32) { // Spacebar
      duplicateCheese();
    }
  };
});
var cheeseCount = 0;

function duplicateCheese() {
  if (cheeseCount >= 128) return;

  var originalCheese = document.getElementById('kaasImg');
  var cloneCheese = originalCheese.cloneNode(true);
  cloneCheese.classList.add('duplicate');
  
  var maxX = window.innerWidth - originalCheese.width;
  var maxY = window.innerHeight - originalCheese.height;
  var randomX = Math.floor((Math.random() - 0.5) * maxX);
  var randomY = Math.floor((Math.random() - 0.5) * maxY);
  
  cloneCheese.style.left = randomX + 'px';
  cloneCheese.style.top = randomY + 'px';
  
  originalCheese.parentNode.appendChild(cloneCheese);
  cheeseCount++;

  if (cheeseCount > 128) {
    var cheeses = document.getElementsByClassName('duplicate');
    cheeses[0].parentNode.removeChild(cheeses[0]);
    cheeseCount--;
  }

  updateCheeseCountDisplay(); // Update cheese count display
}

function updateCheeseCountDisplay() {
  var cheeseCountDisplay = document.getElementById('cheeseCountDisplay');
  cheeseCountDisplay.textContent = 'Cheese Count: ' + cheeseCount;
}
function updateCheeseCountDisplay() {
  var cheeseCountDisplay = document.getElementById('cheeseCountDisplay');
  cheeseCountDisplay.textContent = 'Cheese Count: ' + cheeseCount;
}
