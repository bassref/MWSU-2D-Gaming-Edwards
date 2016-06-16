var playState = {
	
	preload: function(){
		
		this.jumpSound = game.add.audio('jump');
		this.coinSound = game.add.audio('coin');
		this.deadSound = game.add.audio('dead');
	},

    create: function() { 
		
		
		// We want to play the music when the play state starts
		this.music = game.add.audio('music'); // Add the music
		this.music.loop = true; // Make it loop
		this.music.play(); // Start the music
		// Change the volume of the sound (0 = mute, 1 = full sound)
		this.music.volume = 0.5;
		
        this.cursor = game.input.keyboard.createCursorKeys();
		
		this.wasd ={
			up: game.input.keyboard.createCursorKeys(Phaser.Keyboard.W),
			down: game.input.keyboard.createCursorKeys(Phaser.Keyboard.S),
			left: game.input.keyboard.createCursorKeys(Phaser.Keyboard.A),
			right: game.input.keyboard.createCursorKeys(Phaser.Keyboard.D),			
		},
        
		
        this.player = game.add.sprite(game.width/2, game.height/2, 'player');
        this.player.anchor.setTo(0.5, 0.5);
		// Create the 'right' animation by looping the frames 1 and 2
		this.player.animations.add('right', [1, 2], 8, true);
		// Create the 'left' animation by looping the frames 3 and 4
		this.player.animations.add('left', [3, 4], 8, true);
	
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 500; 

        this.createWorld();

        this.coin = game.add.sprite(60, 140, 'coin');
        game.physics.arcade.enable(this.coin); 
        this.coin.anchor.setTo(0.5, 0.5);

        this.scoreLabel = game.add.text(30, 30, 'score: 0', { font: '18px Arial', fill: '#ffffff' });
        
		
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.createMultiple(10, 'enemy');
        game.time.events.loop(2200, this.addEnemy, this);
		
		this.overlap = false;
		
		game.global.score = 0;

		// Create the emitter with 15 particles. We don't need to set the x y
		// Since we don't know where to do the explosion yet
		this.emitter = game.add.emitter(0, 0, 15);

		// Set the 'pixel' image for the particles
		this.emitter.makeParticles('pixel');

		// Set the x and y speed of the particles between -150 and 150
		// Speed will be randomly picked between -150 and 150 for each particle
		this.emitter.setYSpeed(-150, 150);
		this.emitter.setXSpeed(-150, 150);

		// Scale the particles from 2 time their size to 0 in 800ms
		// Parameters are: startX, endX, startY, endY, duration
		this.emitter.setScale(2, 0, 2, 0, 800);

		// Use no gravity
		this.emitter.gravity = 0;

		if (!game.device.desktop) {
		this.addMobileInputs();
		}	
		
		if (!game.device.dekstop) {
		// Call 'orientationChange' when the device is rotated
		game.scale.onOrientationChange.add(this.orientationChange, this);

		// Create an empty label to write the error message if needed
		this.rotateLabel = game.add.text(game.width/2, game.height/2, '',
		{ font: '30px Arial', fill: '#fff', backgroundColor: '#000' });
		this.rotateLabel.anchor.setTo(0.5, 0.5);

		// Call the function at least once
		this.orientationChange();
		}
    },

    update: function() {
     
			game.physics.arcade.collide(this.player, this.layer);
			game.physics.arcade.collide(this.enemies, this.layer);
			game.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
			game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);
			
		   if(!(game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this)))
		   {
			   this.overlap = false;
		   } 
		
			this.movePlayer(); 

			if (!this.player.inWorld) {
				this.playerOutWorld();
			}
			
			// If the player is dead, do nothing
			if (!this.player.alive) {
				return;
			}	
		
    },


	movePlayer: function() {
		
		// If 0 finger are touching the screen
		if (game.input.totalActivePointers == 0) {
		// Make sure the player is not moving
		this.moveLeft = false;
		this.moveRight = false;
}
		// Player moving left
		if (this.cursor.left.isDown || this.wasd.left.isDown ||
			this.moveLeft) { // This is new
			this.player.body.velocity.x = -200;
			this.player.animations.play('left');
		}
		// Player moving right
		else if (this.cursor.right.isDown || this.wasd.right.isDown ||
			this.moveRight) { // This is new
			this.player.body.velocity.x = 200;
			this.player.animations.play('right');
		}
		else {
		this.player.body.velocity.x = 0;
		this.player.animations.stop(); // Stop animations
		this.player.frame = 0; // Change frame (stand still)
		}
		if (this.cursor.up.isDown || this.wasd.up.isDown) {
		this.jumpPlayer();
		}		
    },	
	
    takeCoin: function(player, coin) {
		
		this.coinSound.play();
        game.global.score += 5;
        this.scoreLabel.text = 'score: ' + game.global.score;
        this.updateCoinPosition();
		
		// Scale the coin to 0 to make it invisible
		this.coin.scale.setTo(0, 0);
		
		// Grow the coin back to its original scale in 300ms
		game.add.tween(this.coin.scale).to({x: 1, y: 1}, 300).start();
		game.add.tween(this.player.scale).to({x: 1.3, y: 1.3}, 100).yoyo(true).start();
    },

    updateCoinPosition: function() {
        var coinPosition = [
          {x: 140, y: 60}, {x: 360, y: 60}, 
			{x: 60, y: 140}, {x: 440, y: 140}, 
			{x: 130, y: 300}, {x: 370, y: 300} 
        ];

        for (var i = 0; i < coinPosition.length; i++) {
            if (coinPosition[i].x == this.coin.x) {
                coinPosition.splice(i, 1);
            }
        }

        var newPosition = game.rnd.pick(coinPosition);
        this.coin.reset(newPosition.x, newPosition.y);
    },

    addEnemy: function() {
        var enemy = this.enemies.getFirstDead();

        if (!enemy) {
            return;
        }

        enemy.anchor.setTo(0.5, 1);
        enemy.reset(game.width/2, 0);
        enemy.body.gravity.y = 500;
        enemy.body.velocity.x = 100 * game.rnd.pick([-1, 1]);
        enemy.body.bounce.x = 1;
        enemy.checkWorldBounds = true;
        enemy.outOfBoundsKill = true;
    },

    createWorld: function() {
		// Create the tilemap
		this.map = game.add.tilemap('map');

		// Add the tileset to the map
		this.map.addTilesetImage('tileset');

		// Create the layer by specifying the name of the Tiled layer
		this.layer = this.map.createLayer('Tile Layer 1');

		// Set the world size to match the size of the layer
		this.layer.resizeWorld();

		// Enable collisions for the first tilset element (the blue wall)
		this.map.setCollision(1);
	},

    
	playerDie: function() {
		
		 // Kill the player to make it disappear from the screen
		this.player.kill();
		// Start the sound and the particles
		this.deadSound.play();
		this.emitter.x = this.player.x;
		this.emitter.y = this.player.y;
		this.emitter.start(true, 800, null, 15);
		// Flash the color white for 300ms
		game.camera.flash(0xffffff, 300);
		// Shake for 300ms with an intensity of 0.02
		game.camera.shake(0.02, 300);
		// Call the 'startMenu' function in 1000ms
		game.time.events.add(1000, this.startMenu, this);		
		this.music.stop();
	},
	
	
	jumpPlayer: function() {
		// If the player is touching the ground
		if (this.player.body.onFloor()) {
			// Jump with sound
			this.player.body.velocity.y = -320;
			this.jumpSound.play();
		}
},
	
	addMobileInputs: function() {
		// Add the jump button
		var jumpButton = game.add.sprite(380, 280, 'jumpButton');
		jumpButton.inputEnabled = true;
		jumpButton.alpha = 0.5;
		jumpButton.events.onInputDown.add(this.jumpPlayer, this);
		
		// Movement variables
		this.moveLeft = false;
		this.moveRight = false;		

		// Add the move left button
		var leftButton = game.add.sprite(50, 280, 'leftButton');
		leftButton.inputEnabled = true;
		leftButton.alpha = 0.5;
		leftButton.events.onInputOver.add(this.setLeftTrue, this);
		leftButton.events.onInputOut.add(this.setLeftFalse, this);
		leftButton.events.onInputDown.add(this.setLeftTrue, this);
		leftButton.events.onInputUp.add(this.setLeftFalse, this);

		// Add the move right button
		var rightButton = game.add.sprite(130, 280, 'rightButton');
		rightButton.inputEnabled = true;
		rightButton.alpha = 0.5;
		rightButton.events.onInputOver.add(this.setRightTrue, this);
		rightButton.events.onInputOut.add(this.setRightFalse, this);
		rightButton.events.onInputDown.add(this.setRightTrue, this);
		rightButton.events.onInputUp.add(this.setRightFalse, this);
		
		
	},
	
	// Basic functions that are used in our callbacks
		setLeftTrue: function() {
			this.moveLeft = true;
		},
		setLeftFalse: function() {
			this.moveLeft = false;
		},
		setRightTrue: function() {
			this.moveRight = true;
		},
		setRightFalse: function() {
			this.moveRight = false;
	},
	
	orientationChange: function() {
		// If the game is in portrait (wrong orientation)
		if (game.scale.isPortrait) {
		// Pause the game and add a text explanation
		game.paused = true;
		this.rotateLabel.text = 'rotate your device in landscape';
		}
		// If the game is in landscape (good orientation)
		else {
		// Resume the game and remove the text
		game.paused = false;
		this.rotateLabel.text = '';
		}
	},
		
	startMenu: function() {
		game.state.start('menu');
	},

};


