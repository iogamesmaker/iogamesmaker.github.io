var cheeseCount = 0;

function duplicateCheese() {
  if (cheeseCount >= 128) return; // Check if cheese count exceeds limit

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

  // Remove one cheese if limit exceeded
  if (cheeseCount > 128) {
    var cheeses = document.getElementsByClassName('duplicate');
    cheeses[0].parentNode.removeChild(cheeses[0]);
    cheeseCount--;
  }
}
