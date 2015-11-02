var FONT = 32;

var ROWS = 20;
var COLS = 45;
var TIPWIDTH = 300; 

var ACTORS = 10;

var log = [];
var logState = [];

var game = new Phaser.Game((COLS * FONT * 0.6) + TIPWIDTH, ROWS * FONT, Phaser.AUTO, null, {
  create: create  
});

function create() {
  game.input.keyboard.addCallbacks(null, null, onKeyUp);  
  initMap();
  initActors();


  asciidisplay = [];
  for(var y = 0; y < ROWS; y++) {
    var newRow = [];
    asciidisplay.push(newRow);
    for(var x = 0; x < COLS; x++) {
      newRow.push(initCell('', x, y)); 
    }  
  }
  drawMap();
  drawActors();
  updateTip('Adventure Time', COLS, 0);
}



function updateTip(txt, x, y ) {
  var style = { font: FONT + 'px monospace', fill: '#fff' };
  return game.add.text((FONT * 0.6 * x) + 5, FONT * y, txt, style);
}

function drawLog() {
  var x = COLS;
  var y = 1;
  log.forEach(function(msg) {
    if(y > logState.length) {
      logState.push(updateTip(msg, x, y)); 
    } else {
      logState[y - 1].text = msg;  
    }
    y++;
  });
}

function addToLog(msg) {
  if(log.length > ROWS) {
    log.pop();  
  }
  log.unshift(msg);  
  drawLog();
}

function initCell(chr, x, y) {
  var style = { font: FONT + 'px monospace', fill: '#fff'};
  return game.add.text(FONT * 0.6 * x, FONT * y, chr, style);  
}

function onKeyUp(event) {
  drawMap();
  var acted = false;
  switch(event.keyCode) {
    case Phaser.Keyboard.LEFT:
      acted = moveTo(player, {x: -1, y: 0});
      break;
    case Phaser.Keyboard.RIGHT:
      acted = moveTo(player, {x: 1, y: 0});
      break;
    case Phaser.Keyboard.UP:
      acted = moveTo(player, {x: 0, y: -1});
      break;
    case Phaser.Keyboard.DOWN:
      acted = moveTo(player, {x: 0, y: 1});
      break;
  }

  if(acted) {
    for(var enemy in actorList) {
      if(enemy == 0) {
        continue;  
      }
      var e = actorList[enemy];
      if(e != null) {
        aiAct(e);  
      }  
    }  
  }
  drawActors();
}

var map;

function initMap() {
  map = [];
  for (var y = 0; y < ROWS; y++) {
    var newRow = [];
    for (var x = 0; x < COLS; x++) {
      if(Math.random() > 0.8) {
        newRow.push('#');
      } else {
        newRow.push('.');
      }
    }
    map.push(newRow);
  }
}

var asciidisplay;

function drawMap() {
  for (var y = 0; y < ROWS; y++) {
    for (var x = 0; x < COLS; x++) {
      asciidisplay[y][x].text = map[y][x];
    }  
  }
}

var player;
var actorList;
var livingEnemies;

var actorMap;

function randomInt(max) {
  return Math.floor(Math.random() * max);  
}

function initActors() {
  actorList = [];
  actorMap = {};
  for(var e = 0; e < ACTORS; e++) {
    var actor = { x: 0, y: 0, hp: e == 0 ? 3 : 1  };
    do {
      actor.y = randomInt(ROWS);
      actor.x = randomInt(COLS);   
    } while (map[actor.y][actor.x] == '#' || actorMap[actor.y + '_' + actor.x] != null );

    actorMap[actor.y + '_' + actor.x] = actor;
    actorList.push(actor);
  }

  player = actorList[0];

  livingEnemies = ACTORS - 1;
}

function drawActors() {
  for(var a in actorList) {
    if(actorList[a] && actorList[a].hp > 0) {
      asciidisplay[actorList[a].y][actorList[a].x].text = a == 0 ? ''+player.hp : 'e';  
    }  
  }  
}

function canGo(actor, dir) {
  return actor.x + dir.x >= 0 && actor.x + dir.x <= COLS - 1 && actor.y + dir.y >= 0 && actor.y + dir.y <= ROWS -1 && map[actor.y + dir.y][actor.x + dir.x] == '.';  
}

function moveTo(actor, dir) {
  if(!canGo(actor, dir)) {
    return false;
  }
      
  if(actor == player) {
    addToLog('Move To (' + (actor.x + dir.x) + ',' + (actor.y + dir.y) + ')');       
  } 

  var newKey = (actor.y + dir.y) + '_' + (actor.x + dir.x);
  if(actorMap[newKey] != null) {
    var victim = actorMap[newKey];
    if(actor == player) {
      addToLog('Attacking!');  
    }

    if(victim == player) {
      addToLog('Attacked!');  
    }

    if(actor == player || victim == player) {
      victim.hp--;
    } 
    if(victim.hp == 0) {
      actorMap[newKey] = null;
      actorList[actorList.indexOf(victim)] = null;
      if(victim != player) {
        livingEnemies--;
        if(livingEnemies == 0) {
          var victory = game.add.text(game.world.centerX, game.world.centerY, 'Victory!\nCtrl+r to restart', { fill: '#2e2', align: 'center' });
          victory.anchor.setTo(0.5, 0.5);  
        }  
      } 
    }
  } else {
    actorMap[actor.y + '_' + actor.x] = null;
    actor.y += dir.y;
    actor.x += dir.x;
    actorMap[actor.y + '_' + actor.x] = actor;  
  } 
  return true;
}

function aiAct(actor) {
  var directions = [{x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1}];
  var dx = player.x - actor.x;
  var dy = player.y - actor.y;
  
  if(Math.abs(dx) + Math.abs(dy) > 6) {
    while(!moveTo(actor, directions[randomInt(directions.length)])) {}; 
  }  

  if(Math.abs(dx) > Math.abs(dy)) {
    if(dx < 0) {
      moveTo(actor, directions[0]);  
    } else {
      moveTo(actor, directions[1]);
    }  
  } else {
    if(dy < 0) {
      moveTo(actor, directions[2]);  
    } else {
      moveTo(actor, directions[3]);
    }
  }

  if(player.hp < 1) {
    var gameOver = game.add.text(game.world.centerX, game.world.centerY, 'Game Over\nCtrl+rto restart', { fill: '#e22', align: 'center' });
    gameOver.anchor.setTo(0.5, 0.5);  
  }
}
