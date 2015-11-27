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

var game = new Phaser.Game((COLS * FONT * 0.6) + TIPWIDTH, ROWS * FONT, Phaser.AUTO, "game");

var TitleState = function(game) {
  this.game = game;    
}

TitleState.prototype.create = function() {
  var self = this;
  var gameMessage = this.game.add.text(this.game.world.centerX, this.game.world.centerY, "Techno Hunt", { fill: '#fff', align: 'center' });
  gameMessage.anchor.setTo(0.5, 0.5); 
  this.game.input.keyboard.addCallbacks(null, null, function(ev) {
    self.game.state.start('Main'); 
  });
}

var MainState = function(game) {
  this.ui = new MainUI(game);  
};

MainState.prototype.create = function() {
  this.ui.create();  
}

MainState.prototype.preload = function() {
  this.ui.preload();  
}

game.state.add('Title', TitleState);
game.state.add('Main', MainState);
game.state.start('Title');
