var cheeseCount = 1;
var realCheeseCount = 1;


document.addEventListener('click', event => {
  duplicateCheese();
})

var cheeseLimit = 256;

function duplicateCheese() {
  if (cheeseCount >= cheeseLimit) {
    var cheeses = document.querySelectorAll('.duplicate');
    cheeses[0].parentNode.removeChild(cheeses[0]);
    cheeseCount--;
  }

  var originalCheese = document.getElementById('kaasImg');
  var cloneCheese = originalCheese.cloneNode(true);
  cloneCheese.classList.add('duplicate');

  // Generate random coordinates
  var maxX = window.innerWidth - originalCheese.width - 25 + '%';
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
  cheeseCountDisplay.textContent = 'kaas!11!!: ' + realCheeseCount;
}
