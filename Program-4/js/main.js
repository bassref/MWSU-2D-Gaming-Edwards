var SpaceHipster = SpaceHipster || {};

var Easy = [25, 50];
var Medium = [50, 125];
var Hard = [125, 200];
var skilllevel = Easy;

SpaceHipster.game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '');
var asteroidSize = SpaceHipster.game.rnd.integer(0, 100);
SpaceHipster.game.state.add('Boot', SpaceHipster.Boot);
SpaceHipster.game.state.add('Preload', SpaceHipster.Preload);
SpaceHipster.game.state.add('MainMenu', SpaceHipster.MainMenu);
SpaceHipster.game.state.add('Game', SpaceHipster.Game);

SpaceHipster.game.state.start('Boot');

