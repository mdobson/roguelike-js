var Actor = function(x, y, hp) {
  this.x = x;
  this.y = y;
  this.hp = hp; 
  this.atk = 1;
  this.player = false;
  this.inventory = [];
}

Actor.prototype.icon = function() {
  if(this.player) {
    return ''+this.hp;  
  } else {
    return 'e';  
  }
}

Actor.prototype.attack = function() {
  var self = this;
  this.inventory.forEach(function(item) {
    self.atk += item.attack; 
  });
  return this.atk;
};

Actor.prototype.subtractHp = function(lost) {
  var self = this;
  var tmpHp = self.hp;
  this.inventory.forEach(function(item) {
    tmpHp += item.defend();  
  });
  tmpHp = tmpHp - lost;
  if(tmpHp < self.hp) {
    self.hp = tmpHp;
  }
}
