var cheeseCount = 1;
var CPS = 0;
var CPC = 1;
var realCheeseCount = 1;
var cheeseLimit = 256;
var autoDuplicateInterval;
var CPSPrice = 50;

document.addEventListener('click', event => {
  duplicateCheese();
});

document.getElementById('autoclick').addEventListener('click', duplicate);
document.getElementById('biggerclick').addEventListener('click', biggerclick);

function duplicateCheese() {
for(var i = 0; i < Math.min(CPC, cheeseLimit); i++) {
  if (cheeseCount >= cheeseLimit) {
      var cheeses = document.querySelectorAll('.duplicate');
      cheeses[0].parentNode.removeChild(cheeses[0]);
      cheeseCount--;
    }

    var originalCheese = document.getElementById('kaasImg');
    var cloneCheese = originalCheese.cloneNode(true);
    cloneCheese.classList.add('duplicate');

    var maxX = (window.innerWidth - originalCheese.width);
    var maxY = window.innerHeight - originalCheese.height;
    var randomX = Math.floor((Math.random() - 0.5) * maxX);
    var randomY = Math.floor((Math.random() - 0.5) * maxY);
    // aaaaaaaaaaaaa
    cloneCheese.style.left = randomX + 'px';
    cloneCheese.style.top = randomY + 'px';

    originalCheese.parentNode.appendChild(cloneCheese);
	 if(CPS >= 1) {
    	cheeseCount += 1 / CPS;
	 }
	 else {
	 	cheeseCount += 1;
	 }
  }
  realCheeseCount += CPC;
  updateCheeseCountDisplay();
}

function updateCheeseCountDisplay() {
  var cheeseCountDisplay = document.getElementById('cheeseCountDisplay');
  cheeseCountDisplay.textContent = 'kaas!11!!: ' + Math.round(realCheeseCount);
}

function duplicate() {
  if (realCheeseCount >= CPSPrice) {
    CPS += 1;
    realCheeseCount -= CPSPrice;
    updateCheeseCountDisplay();
    autoDuplicateInterval = setInterval(duplicateCheese, 1000 / CPS);
    CPSPrice = Math.round(CPSPrice * 1.1);
    updateCPSPriceDisplay();
  }
}

function updateCPSPriceDisplay() {
  var autoclickButton = document.getElementById('autoclick');
  autoclickButton.textContent = `+ 1 CPS | ${CPSPrice} cheese`;
}

function biggerclick() {
  if (realCheeseCount >= 20) {
    CPC += 1;
    realCheeseCount -= 20;
    updateCheeseCountDisplay();
  }
}
