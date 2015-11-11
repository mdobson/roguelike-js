var FONT = 32;

var ROWS = 20;
var COLS = 45;
var TIPWIDTH = 300; 

var ACTORS = 10;
var items = ['sword', 'shield', 'potion', 'staff'];
var MAXCHESTS = randomInt(items.length);

var Loader = function(loader) {
  this.loader = loader; 
}

Loader.prototype.init = function() {
}

var UI = function() {
  var self = this;
  this.mapState = [];
  this.tipState = [];
  this.inventoryState = [];
  this.gameState = new Game();
  this.logs = [];
  this.logState = [];
  this.gameState.gameLogUpdate = function(msg) {
    if(self.logs.length > 8) {
      self.logs.pop();  
    }
    self.logs.unshift(msg);  
    self.drawLog();   
  };
  this.gameState.gameGlobalUpdate = function(msg, fill) {
    var gameMessage = self.game.add.text(self.game.world.centerX, self.game.world.centerY, msg, { fill: fill, align: 'center' });
    gameMessage.anchor.setTo(0.5, 0.5);  
   
  };

  this.game = new Phaser.Game((COLS * FONT * 0.6) + TIPWIDTH, ROWS * FONT, Phaser.AUTO, null, {
    create: function() {
      self.game.input.keyboard.addCallbacks(null, null, self.onKeyUp.bind(self));  
      self.gameState.initMap();
      self.gameState.initActors();


      for(var y = 0; y < ROWS; y++) {
        var newRow = [];
        self.mapState.push(newRow);
        for(var x = 0; x < COLS; x++) {
          newRow.push(self.initCell('', x, y)); 
        }  
      }

      self.drawMap();
      self.drawActors();
      self.initCell('Adventure Time', COLS, 0);
      self.initCell('Inventory', COLS, 10);
  
    },
    preload: function() {
      this.loader = new Loader(this.game);
      this.loader.init();
    }  
  });


}

UI.prototype.drawLog = function() {
  var self = this;
  var x = COLS;
  var y = 1;
  this.logs.forEach(function(msg) {
    if(y > self.logState.length) {
      self.logState.push(self.initCell(msg, x, y)); 
    } else {
      self.logState[y - 1].text = msg;  
    }
    y++;
  }); 
}

UI.prototype.initCell = function(chr, x, y) {
  var style = { font: FONT + 'px monospace', fill: '#fff'};
  return this.game.add.text(FONT * 0.6 * x, FONT * y, chr, style);  
};

UI.prototype.drawMap = function() {
  var self = this;
  for (var y = 0; y < ROWS; y++) {
    for (var x = 0; x < COLS; x++) {

      self.mapState[y][x].text = self.gameState.map[y][x];
      if(self.gameState.map[y][x] == 'T') {
        self.mapState[y][x].addColor('#ff0', 0);
      } else {
        self.mapState[y][x].addColor('#fff', 0);
      }
    }  
  } 
};

UI.prototype.drawActors = function() {
  var self = this;
  for(var a in self.gameState.actorList) {
    if(self.gameState.actorList[a] && self.gameState.actorList[a].hp > 0) {
      self.mapState[self.gameState.actorList[a].y][self.gameState.actorList[a].x].text = self.gameState.actorList[a].icon();  
    }  
  }
};

UI.prototype.onKeyUp = function(event) {
  var self = this;
  this.drawMap();
  var acted = false;
  switch(event.keyCode) {
    case Phaser.Keyboard.LEFT:
      acted = self.gameState.moveTo(self.gameState.player, {x: -1, y: 0});
      break;
    case Phaser.Keyboard.RIGHT:
      acted = self.gameState.moveTo(self.gameState.player, {x: 1, y: 0});
      break;
    case Phaser.Keyboard.UP:
      acted = self.gameState.moveTo(self.gameState.player, {x: 0, y: -1});
      break;
    case Phaser.Keyboard.DOWN:
      acted = self.gameState.moveTo(self.gameState.player, {x: 0, y: 1});
      break;
  }

  if(acted) {
    for(var enemy in self.gameState.actorList) {
      if(enemy == 0) {
        continue;  
      }
      var e = self.gameState.actorList[enemy];
      if(e != null) {
        self.gameState.aiAct(e);  
      }  
    }  
  }
  this.drawActors();
};



var Game = function() {
  this.map = [];
  this.player = {};
  this.actorList = [];
  this.actorMap = {};
  this.chests = {};
  this.livingEnemies = 0;
}

Game.prototype.moveTo = function(actor, dir) {
  var self = this;
 if(!this.canGo(actor, dir)) {
    return false;
  }
      
  if(actor == self.player) {
    self.gameLogUpdate('Move To (' + (actor.x + dir.x) + ',' + (actor.y + dir.y) + ')');       
  } 

  var newKey = (actor.y + dir.y) + '_' + (actor.x + dir.x);
  if(self.actorMap[newKey] != null) {
    var victim = self.actorMap[newKey];
    if(actor == self.player) {
      self.gameLogUpdate('Attacking!');  
    }

    if(victim == self.player) {
      self.gameLogUpdate('Attacked!');  
    }

    victim.subtractHp(actor.attack());


    if(victim.hp == 0) {
      self.actorMap[newKey] = null;
      self.actorList[self.actorList.indexOf(victim)] = null;
      if(victim != self.player) {
        self.livingEnemies--;
        if(self.livingEnemies == 0) {
          self.globalGameUpdate('Victory!\nCtrl+r to restart', '#2e2');
        }  
      } 
    }
  } else {
    self.actorMap[actor.y + '_' + actor.x] = null;
    actor.y += dir.y;
    actor.x += dir.x;
    self.actorMap[actor.y + '_' + actor.x] = actor;  
  } 
  return true;
}

Game.prototype.canGo = function(actor, dir) {
  return actor.x + dir.x >= 0 && actor.x + dir.x <= COLS - 1 && actor.y + dir.y >= 0 && actor.y + dir.y <= ROWS -1 && (this.map[actor.y + dir.y][actor.x + dir.x] == '.' || this.map[actor.y + dir.y][actor.x + dir.x] == 'T');  
 
};

Game.prototype.initMap = function() {
  var self = this;
  this.map = [];
  for (var y = 0; y < ROWS; y++) {
    var newRow = [];
    for (var x = 0; x < COLS; x++) {
      var roll = Math.random();
      if(roll > 0.8) {
        newRow.push('#');
      } else {
        newRow.push('.');
      }

    }
    self.map.push(newRow);
  }

  for(var t = 0; t < MAXCHESTS; t++) {
    var x = randomInt(COLS);
    var y = randomInt(ROWS);
    self.map[y][x] = 'T';  
    self.chests[y+'_'+x] = {item: items[t]};
  }
};

Game.prototype.initActors = function() {
  var self = this;
  this.actorList = [];
  this.actorMap = {};
  for(var e = 0; e < ACTORS; e++) {
    var actor = new Actor(0, 0, e == 0 ? 3 : 1);
    do {
      actor.y = randomInt(ROWS);
      actor.x = randomInt(COLS);   
    } while (self.map[actor.y][actor.x] == '#' || self.actorMap[actor.y + '_' + actor.x] != null );

    self.actorMap[actor.y + '_' + actor.x] = actor;
    self.actorList.push(actor);
  }

  self.player = self.actorList[0];
  self.player.player = true;

  self.livingEnemies = ACTORS - 1;
};

Game.prototype.aiAct = function(actor) {
  var directions = [{x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1}];
  var dx = this.player.x - actor.x;
  var dy = this.player.y - actor.y;
  
  if(Math.abs(dx) + Math.abs(dy) > 6) {
    while(!this.moveTo(actor, directions[randomInt(directions.length)])) {}; 
  }  

  if(Math.abs(dx) > Math.abs(dy)) {
    if(dx < 0) {
      this.moveTo(actor, directions[0]);  
    } else {
      this.moveTo(actor, directions[1]);
    }  
  } else {
    if(dy < 0) {
      this.moveTo(actor, directions[2]);  
    } else {
      this.moveTo(actor, directions[3]);
    }
  }

  if(this.player.hp < 1) {
    this.gameGlobalUpdate('Game Over!\nCtrl+r to restart.', '#ffe');
  }
 
};

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

function randomInt(max) {
  return Math.floor(Math.random() * max);  
}

var ui = new UI();
