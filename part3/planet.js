var Planet = function(x, y, name) {
  this.x = x;
  this.y = y;  
  this.name = name;
}

Planet.prototype.calculateDistance = function(planet) {
  return distance(this.x, this.y, planet.x, planet.y);
}

Planet.prototype.calculateDistanceWithXy = function(x, y) {
  return distance(this.x, this.y, x, y);
}



