var FONT = 32;

var ROWS = 20;
var COLS = 45;
var TIPWIDTH = 300; 
var PLANETS = 8;
var generatedPlanets = [];

var ACTORS = 10;
var items = ['sword', 'shield', 'potion', 'staff'];
var MAXCHESTS = randomInt(items.length);
var MIN_DISTANCE = 7;

function randomInt(max) {
  return Math.floor(Math.random() * max);  
}

var game = new Phaser.Game((COLS * FONT * 0.6) + TIPWIDTH, ROWS * FONT, Phaser.AUTO, "game");

var TitleState = function(game) {
  this.game = game;    
}

TitleState.prototype.create = function() {
  var self = this;
  var gameMessage = this.game.add.text(this.game.world.centerX, this.game.world.centerY, 'Techno Hunt', { fill: '#fff', align: 'center' });
  gameMessage.anchor.setTo(0.5, 0.5); 


  this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
  var startKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  startKey.onDown.addOnce(function() {
    self.game.state.start('Coordinate'); 
  }, this);
}

var CoordinateSelect = function(game) {
  this.game = game;  
}

CoordinateSelect.prototype.create = function() {
  this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.W, Phaser.Keyboard.S, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN]);

  
  var self = this;
  function setupUI() {
    var header = self.game.add.text(this.game.world.centerX, 20, 'World Selection Operating System', { fill: '#fff', align: 'center'}); 
    header.anchor.setTo(0.5, 0.5);
  } 
  var coords = [];
  var uiCells = [];
  function generatePlanets() {
    function generateCoords() {
      var x = randomInt(COLS); 
      var y = randomInt(ROWS);
      if(coords.length) {
        coords.forEach(function(c) {
          while(distance(c.x, c.y, x, y) < MIN_DISTANCE || (c.x == x && c.y == y)) {
            x = randomInt(COLS);
            y = randomInt(ROWS);
          }
        });   
        coords.push({x: x, y: y});  
      } else {
        coords.push({x: x, y: y});  
      }
    }
     
    for(var i = 0; i < PLANETS; i++) {
      generateCoords(); 
    } 

    var counter = 1;
    coords.forEach(function(c) {
      if(c.y == 0) {
        c.y += 1;  
      }
      generatedPlanets.push(new Planet(c.x, c.y, 'Planet ' + counter));        
      counter++;
    });
  }

  function renderPlanets() {
    var counter = 0;
    generatedPlanets.forEach(function(p) {
      uiCells.push({sprite: addCell('0', p.x, p.y), text: addCell(p.name, COLS, counter), selected: false});
      counter++; 
    });  
  }

  function addCell(chr, x, y) {
    var style = { font: FONT + 'px monospace', fill: '#fff'};
    return this.game.add.text(FONT * 0.6 * x, FONT * y, chr, style);  
  }

  var idx = 0;

  function setupControls() {
    var startKey = self.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    startKey.onDown.addOnce(function() {
      self.game.state.start('Map');     
    }, this);

    var upKey = self.input.keyboard.addKey(Phaser.Keyboard.UP);
    var downKey = self.input.keyboard.addKey(Phaser.Keyboard.DOWN);

    upKey.onDown.add(function() {
      idx--;
      if(idx < 0) {
        idx = uiCells.length - 1;  
        console.log(idx);
      } 
      unselect();
      select(idx);
    }, null);
    
    downKey.onDown.add(function() {
      idx++;
      if(idx > uiCells.length - 1) {
        idx = 0;  
        console.log(idx);
      } 
      unselect();
      select(idx);
    }, null);
    
    function unselect() {
      var style = { font: FONT + 'px monospace', fill: '#fff'};
      var cell = uiCells.filter(function(c) {
        return c.selected === true;  
      })[0];  

      cell.selected = false;
      cell.sprite.setStyle(style)
      cell.text.setStyle(style); 

    }
    function select(idx) {
      var cell = uiCells[idx];
      var style = { font: FONT + 'px monospace', fill: '#ff0'};

      cell.selected = true;
      cell.sprite.setStyle(style)
      cell.text.setStyle(style); 
    } 

    select(idx);
  }

  setupUI();
  generatePlanets();
  renderPlanets();
  setupControls();
}


var MapState = function(game) {
  this.ui = new MainUI(game);  
};

MapState.prototype.create = function() {
  this.ui.create();  
}

MapState.prototype.preload = function() {
  this.ui.preload();  
}

game.state.add('Title', TitleState);
game.state.add('Map', MapState);
game.state.add('Coordinate', CoordinateSelect);
game.state.start('Title');
