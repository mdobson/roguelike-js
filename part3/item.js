var Item = function(name, atk, def) {
  this.name = name;  
  this.atk = atk;
  this.def = def;
}

Item.prototype.attack = function() {
  return this.atk;  
}

Item.prototype.defend = function() {
  return this.def;  
}
