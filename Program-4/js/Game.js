var SpaceHipster = SpaceHipster || {};

//title screen
SpaceHipster.Game = function(){};

SpaceHipster.Game.prototype = {
	

  create: function() {
	  //create cursor keys
	  this.cursor = this.game.input.keyboard.createCursorKeys();
	  
	  //wasd keys
	  this.wasd = {
		  up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
		  down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
		  left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
		  right: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
		};
	  
	  fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	  
  	//set world dimensions
    this.game.world.setBounds(0, 0, 1920, 1920);

    //background
    this.background = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');

    //create player
    this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'playership');
	this.player.anchor.set(0.5);
	
	
    this.player.scale.setTo(0.5);
   // this.player.animations.add('fly', [0, 1, 2, 3], 5, true);
   // this.player.animations.play('fly');

    //player initial score of zero
    this.playerScore = 0;

    //enable player physics
    this.game.physics.arcade.enable(this.player);
    this.playerSpeed = 120;
    this.player.body.collideWorldBounds = true;
	this.player.body.drag.set(100);
    this.player.body.maxVelocity.set(200);
	this.player.body.width -= 10;
	this.player.body.height -= 10;
	this.player.reset(this.player.x, this.player.y);
	
	 //bullet group
	this.bullets = this.game.add.group();
   this.bullets.enableBody = true;
   this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
   this.bullets.createMultiple(30, 'bullet');
   this.bullets.setAll('anchor.x', 0.5);
   this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);
	
	this.bulletTime = 0;
    //the camera will follow the player in the world
    this.game.camera.follow(this.player);

    //generate game elements
    this.generateCollectables();
    this.generateAsteriods();

    //show score
    this.showLabels();

    //sounds
    this.explosionSound = this.game.add.audio('explosion');
    console.log(this.explosionSound);
    this.collectSound = this.game.add.audio('collect');
	
	 
	
	
  },
  update: function() {
    if(this.game.input.activePointer.justPressed()) {
      
      //move on the direction of the input
      this.game.physics.arcade.moveToPointer(this.player, this.playerSpeed);
    }

	this.moveShip();
	
	//collision between asteroids
	this.game.physics.arcade.collide(this.asteroids);
	
	this.game.physics.arcade.collide(this.bullets, this.asteroids, this.destroyAsteroid, null, this);
	
    //collision between player and asteroids
    this.game.physics.arcade.collide(this.player, this.asteroids, this.hitAsteroid, null, this);

    //overlapping between player and collectables
    this.game.physics.arcade.overlap(this.player, this.collectables, this.collect, null, this);
	
	if(fireButton.isDown)
		this.fireBullet();
  },
  generateCollectables: function() {
    this.collectables = this.game.add.group();

    //enable physics in them
    this.collectables.enableBody = true;
    this.collectables.physicsBodyType = Phaser.Physics.ARCADE;

    //phaser's random number generator
    var numCollectables = this.game.rnd.integerInRange(100, 150)
    var collectable;

    for (var i = 0; i < numCollectables; i++) {
      //add sprite
      collectable = this.collectables.create(this.game.world.randomX, this.game.world.randomY, 'power');
      collectable.animations.add('fly', [0, 1, 2, 3], 5, true);
      collectable.animations.play('fly');
    }

  },
  generateAsteriods: function() {
    this.asteroids = this.game.add.group();
    
    //enable physics in them
    this.asteroids.enableBody = true;

    //phaser's random number generator
	var numAsteroids = this.game.rnd.integerInRange(skilllevel[0], skilllevel[1]);

   // var asteriod;

    for (var i = 0; i < numAsteroids; i++) {
	  this.generateAsteroid();
    }
	
  },
  
  generateAsteroid: function() {
   var asteroid;
   var speed;
   
    //add sprite
    asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'rock');
    asteroid.scale.setTo(this.game.rnd.weightedPick([0.5, 0.6, 0.7, 0.8, 0.9, 1, 1, 1.1, 
		  1.1, 1.2, 1.2, 1.3, 1.3, 1.4, 1.4, 1.5, 1.5, 1.6, 1.6, 1.7, 1.7, 1.8, 1.8, 1.9, 1.9, 2, 2, 2.1, 2.1, 2.2, 
		 2.2, 2.3, 2.3, 2.4, 2.4, 2.5, 2.5, 2.6, 2.6, 2.7, 2.7, 2.8, 2.8, 2.9, 2.9, 3, 3, 3.1, 3.2, 3.3,3.4, 3.5, 3.6,
		 3.7, 3.8, 3.9, 4]));
	
	  //physics properties  
	  speed = this.game.rnd.weightedPick([90, 85, 80, 75, 70, 65, 20]);

	if (speed == 20 && asteroid.scale.x > 4)
		speed = 80;
	else
		speed = speed / asteroid.scale.x;
	
	  asteroid.body.velocity.x = this.game.rnd.pick([-speed, speed]);
      asteroid.body.velocity.y = this.game.rnd.pick([-speed, speed]);
      asteroid.body.collideWorldBounds = true;
	  asteroid.body.bounce.x = 1;
	  asteroid.body.bounce.y = 1;
	  
	  
	
	  asteroid.animations.add('spin', [0, 1, 2, 3,4,5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,18], 10, true);
	  asteroid.animations.play('spin');
	  
	
	
  },
  
  
  hitAsteroid: function(player, asteroid) {
    //play explosion sound
    this.explosionSound.play();

    //make the player explode
    var emitter = this.game.add.emitter(this.player.x, this.player.y, 100);
    emitter.makeParticles('playerParticle');
    emitter.minParticleSpeed.setTo(-200, -200);
    emitter.maxParticleSpeed.setTo(200, 200);
    emitter.gravity = 0;
    emitter.start(true, 1000, null, 100);
    this.player.kill();

    this.game.time.events.add(800, this.gameOver, this);
  },
  gameOver: function() {    
    //pass it the score as a parameter 
    this.game.state.start('MainMenu', true, false, this.playerScore);
  },
  collect: function(player, collectable) {
    //play collect sound
    this.collectSound.play();

    //update score
    this.playerScore++;
    this.scoreLabel.text = this.playerScore;

    //remove sprite
    collectable.destroy();
  },
  showLabels: function() {
    //score text
    var text = "0";
    var style = { font: "20px Arial", fill: "#fff", align: "center" };
    this.scoreLabel = this.game.add.text(this.game.width-50, this.game.height - 50, text, style);
    this.scoreLabel.fixedToCamera = true;
  },
  
  moveShip: function() {

        if (this.cursor.left.isDown || this.wasd.left.isDown || this.moveLeft) {
            this.player.body.angularVelocity = -200;
			
        }
        else if (this.cursor.right.isDown || this.wasd.right.isDown || this.moveRight) {
			this.player.body.angularVelocity = 200;
			
        }
        else {
           this.player.body.angularVelocity = 0;
        }

        if (this.cursor.up.isDown|| this.wasd.up.isDown) {
					
             this.game.physics.arcade.accelerationFromRotation(this.player.rotation, 200, this.player.body.acceleration);
        }
		else
		{
			this.player.body.acceleration.set(0);
		}
  },
  
   fireBullet: function () {

		//  To avoid them being allowed to fire too fast we set a time limit
		if (this.game.time.now > this.bulletTime)
		{
			//  Grab the first bullet we can from the pool
			bullet = this.bullets.getFirstExists(false);

			if (bullet)
			{
				bullet.rotation = this.player.rotation;
				//  And fire it
				bullet.alpha = 0;
				this.game.time.events.add(80, function (){bullet.alpha = 1}, this)
				bullet.reset(this.player.x, this.player.y);
				
				this.game.physics.arcade.velocityFromRotation(bullet.rotation, 700, bullet.body.velocity);
				this.bulletTime = this.game.time.now + 200;
			}
		}

	},

	destroyAsteroid: function(asteroid, bullet){
		
			 //play explosion sound
		this.explosionSound.play();

		//make the player explode
		var emitter = this.game.add.emitter(asteroid.x, asteroid.y, 200);
		emitter.makeParticles('playerParticle');
		emitter.minParticleSpeed.setTo(-200, -200);
		emitter.maxParticleSpeed.setTo(200, 200);
		emitter.gravity = 0;
		emitter.start(true, 1000, null, 100);
		asteroid.kill();
		bullet.kill();
		
		//for every asteroid destroyed another is generated, this way the field is never empty
	   this.generateAsteroid();
		
	},
	
};

/*
TODO

-audio
-asteriod bounch
*/
