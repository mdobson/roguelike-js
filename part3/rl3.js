var FONT = 32;

var ROWS = 20;
var COLS = 45;
var TIPWIDTH = 300; 

var ACTORS = 10;
var items = ['sword', 'shield', 'potion', 'staff'];
var MAXCHESTS = randomInt(items.length);

function randomInt(max) {
  return Math.floor(Math.random() * max);  
}

var ui = new UI();
