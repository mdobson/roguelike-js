var FONT = 32;

var ROWS = 20;
var COLS = 45;
var TIPWIDTH = 300; 

var ACTORS = 10;
var items = ['sword', 'shield', 'potion', 'staff'];
var MAXCHESTS = randomInt(items.length);

var UI = function() {
  var self = this;
  this.mapState = [];
  this.tipState = [];
  this.inventoryState = [];
  this.gameState = new Game();
  this.game = new Phaser.Game((COLS * FONT * 0.6) + TIPWIDTH, ROWS * FONT, Phaser.AUTO, null, {
    create: function() {
      self.game.input.keyboard.addCallbacks(null, null, onKeyUp);  
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
  
    }  
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
      self.mapState[self.gameState.actorList[a].y][self.gameState.actorList[a].x].text = a == 0 ? ''+self.gameState.player.hp : 'e';  
    }  
  }
};

var Game = function() {
  this.map = [];
  this.player = {};
  this.actorList = [];
  this.actorMap = {};
  this.chests = {};
  this.livingEnemies = 0;
}

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
    var actor = { x: 0, y: 0, hp: e == 0 ? 3 : 1  };
    do {
      actor.y = randomInt(ROWS);
      actor.x = randomInt(COLS);   
    } while (self.map[actor.y][actor.x] == '#' || self.actorMap[actor.y + '_' + actor.x] != null );

    self.actorMap[actor.y + '_' + actor.x] = actor;
    self.actorList.push(actor);
  }

  self.player = self.actorList[0];

  self.livingEnemies = ACTORS - 1;
};

function randomInt(max) {
  return Math.floor(Math.random() * max);  
}

function onKeyUp() {
  
}

var ui = new UI();
