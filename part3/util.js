function distance(x1, y1, x2, y2) {
  var xSquared = Math.pow((x2 - x1), 2);
  var ySquared = Math.pow((y2 - y1), 2);

  var distance = Math.sqrt((xSquared + ySquared));
  return distance; 
}
