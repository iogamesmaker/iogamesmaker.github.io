var cheeseCount = 0;
var maxCheese = 128;
var cheeseClones = []; // Array to store references to all cheese clones

function duplicateCheese() {
  if (cheeseCount >= maxCheese) {
    moveOldestCheese();
    return;
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
  
  cheeseCount++; // Increment cheese count
  cheeseClones.push(cloneCheese); // Add reference to the clone in the array
}

function moveOldestCheese() {
  var oldestCheese = cheeseClones.shift(); // Remove the oldest cheese from the array
  var maxX = window.innerWidth - oldestCheese.width;
  var maxY = window.innerHeight - oldestCheese.height;
  var randomX = Math.floor((Math.random() - 0.5) * maxX);
  var randomY = Math.floor((Math.random() - 0.5) * maxY);
  
  // Set new random position for the oldest cheese
  oldestCheese.style.left = randomX + 'px';
  oldestCheese.style.top = randomY + 'px';
  
  cheeseClones.push(oldestCheese); // Add the cheese back to the array
}
