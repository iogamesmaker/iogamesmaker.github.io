var cheeseCount = 0;
var maxCheese = 128;

function duplicateCheese() {
  if (cheeseCount >= maxCheese) return; // Stop creating cheese if max limit reached
  
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
  
  cheeseCount++; // Increment cheese count
}
