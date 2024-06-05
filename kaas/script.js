var cheeseCount = 1;
var realCheeseCount = 1;
var cheeseLimit = 256;
var autoDuplicateEnabled = false;
var autoDuplicateInterval;

document.addEventListener('click', event => {
  duplicateCheese();
});

document.getElementById('increaseCheeseLimit').addEventListener('click', increaseCheeseLimit);
document.getElementById('autoDuplicateCheese').addEventListener('click', enableAutoDuplicate);

function duplicateCheese() {
  if (cheeseCount >= cheeseLimit) {
    var cheeses = document.querySelectorAll('.duplicate');
    cheeses[0].parentNode.removeChild(cheeses[0]);
    cheeseCount--;
  }

  var originalCheese = document.getElementById('kaasImg');
  var cloneCheese = originalCheese.cloneNode(true);
  cloneCheese.classList.add('duplicate');

  var maxX = 0.6 * (window.innerWidth - originalCheese.width);
  var maxY = window.innerHeight - originalCheese.height;
  var randomX = Math.floor((Math.random() - 1.0) * maxX);
  var randomY = Math.floor((Math.random() - 0.5) * maxY);

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

function enableAutoDuplicate() {
  if (realCheeseCount >= 200 && !autoDuplicateEnabled) {
    realCheeseCount -= 200;
    autoDuplicateEnabled = true;
    updateCheeseCountDisplay();
    autoDuplicateInterval = setInterval(duplicateCheese, 1000); // Duplicate cheese every second
  }
}
