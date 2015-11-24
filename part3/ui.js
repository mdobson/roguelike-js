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
