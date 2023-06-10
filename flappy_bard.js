// This variable stores the canvas element.
var canvas = document.getElementById("canvas");

// This variable stores the 2D context for the canvas.
var ctx = canvas.getContext("2d");

var on_mobile = false;
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  // true for mobile device
  on_mobile = true;
}

// This object stores the properties of the bird.
var bird = {
  // The x-coordinate of the bird.
  x: 200,

  // The y-coordinate of the bird.
  y: 200,

  // The width of the bird.
  width: 50,

  // The height of the bird.
  height: 50,

  // The velocity of the bird.
  velocity: 0,

  // The gravity of the bird.
  gravity: 2000.0
};

// Declare global variables (they'll get initialized when we call reset() at the bottom)
var pipes = [];
var game_started;
var dead;
var score;
var travel_speed;
var dist_travelled;
var prev_run_time_ms;
var elapsed_time_s;

function reset() {
  pipes = [];
  pipes.push(createPipe());
  game_started = false
  dead = false;
  score = 0;
  bird.x = 200;
  bird.y = 200;
  bird.velocity = 0;
  
  travel_speed = 150;
  dist_travelled = 0.0;
  prev_run_time_ms = undefined;
  elapsed_time_s = 0.0;
}

// This function sets up the game.
function createPipe() {
    // Create a new pipe object.
    var pipe = {
      // The width of the pipe.
      width: 100,

      // The height of the pipe.
      height: 100,
      
      // The x-coordinate of the pipe.
      x: canvas.width + 50,

      // The y-coordinate of the pipe.
      y: Math.floor(Math.random() * (canvas.height - 50*2)) + 50,

      passed: false

    };
    return pipe;
}

function update(timestamp_ms) {

  updateTimeDistSpeed(timestamp_ms);
  
  if (game_started && !dead) {
    updateObjects(elapsed_time_s);
  }

  checkForGameOver();

  updateScore();

  draw();

  requestAnimationFrame(update);
}

function updateTimeDistSpeed(new_timestamp_ms) {
  if (prev_run_time_ms != undefined) {
    elapsed_time_s = (new_timestamp_ms - prev_run_time_ms) / 1000.0;
    if (game_started) {
      dist_travelled += travel_speed * elapsed_time_s;
      travel_speed += (0.0002 * dist_travelled * elapsed_time_s);
    }
  }
  prev_run_time_ms = new_timestamp_ms;
}

function updateObjects(elapsed_time_s) {
  // Update the bird's position.
  bird.y += bird.velocity * elapsed_time_s;
  bird.velocity += bird.gravity * elapsed_time_s;

  if (bird.y < bird.height/2) {
    bird.y = Math.floor(bird.height/2);
    bird.velocity = 0.0;
  }
  
  // Update pipes' positions
  for (var i = 0; i < pipes.length; i++) {
      pipes[i].x -= travel_speed * elapsed_time_s;
  }

  // Make a new pipe when the last has gotten far enough across the screen
  if (pipes[pipes.length-1].x < canvas.width/2) {
      pipes.push(createPipe());
  }

  // Remove last pipe when it's off the screen
  if (pipes[0].x < -(pipes[0].width/2)) {
      pipes.shift();
  }
}

function updateScore() {
  for (pipe of pipes) {
    // check if we've passed the pipe
    if (!pipe.passed && (pipe.x+pipe.width/2 < bird.x-bird.width/2)) {
        pipe.passed = true;
        score++;
    }
  }
}

function checkForGameOver() {
  // Check if the bird has hit the ground.
  if (bird.y > canvas.height) {
    gameOver();
  }

  // Check if the bird has hit a pipe.
  for (pipe of pipes) {
      if (!pipe.passed &&
          bird.x + bird.width/2 > pipe.x - pipe.width/2 && 
          bird.x - bird.width/2 < pipe.x + pipe.width/2 && 
          bird.y + bird.height/2 > pipe.y - pipe.height/2 && 
          bird.y - bird.height/2 < pipe.y + pipe.height/2) {
          gameOver();
          break;
      }
  }
}

// This function draws the game.
function draw() {
  // Clear the canvas.
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the background.
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the bird.
  ctx.fillStyle = "green";
  ctx.fillRect(bird.x-Math.floor(bird.width/2), bird.y-Math.floor(bird.height/2), bird.width, bird.height);

  // Draw the pipes
  for (pipe of pipes) {
    if (pipe.passed) {
        ctx.fillStyle = "#68DA7D";
    } else {
        ctx.fillStyle = "#DA6868";
    }
    ctx.fillRect(pipe.x-Math.floor(pipe.width/2), pipe.y-Math.floor(pipe.height/2), pipe.width, pipe.height);
  }

  // Draw the score
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Score: " + score.toString(), 10, 30);

  
  // Draw start text if not started
  if (!game_started) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Press space or up arrow to begin", 25, 250);
  }

  if (dead)
  {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Ouch, that hurt!",150, 230);
    if (on_mobile) {
      ctx.fillText("Tap to try again", 150, 270);
    } else {
      ctx.fillText("Press 'r' to try again", 120, 270);
    }
  }
}

// This function displays the game over message.
function gameOver() {
  dead = true;
}

// This function listens for the keydown event.
window.addEventListener("keydown", function(event) {
  // If the user presses the up arrow or space key, make the bird fly up.
  if (event.keyCode == 38 || event.keyCode == 32) {
    bird.velocity = -400;
    game_started = true;
  }

  if (dead && event.keyCode == 82) { // "r" key
    reset();
  }
}, false);

// Also check for touch events
window.addEventListener("touchstart", function(event) {
  if (dead) {
    reset();
  }
  else {
    bird.velocity = -400;
    game_started = true;
  }
}, false);



// Initialize everything
reset();

// Start the game loop.
requestAnimationFrame(update);