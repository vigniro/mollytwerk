/*global define */

define(['controls'], function(controls) {

    var PLAYER_SPEED = 200;
    var JUMP_VELOCITY = 1250;
    var GRAVITY = 3300;
    var PLAYER_HALF_WIDTH = 0;
    var PLAYER_RADIUS = 28;

    var COLLISION_PADDING = -13;
    var DEATH_Y = 800;
    var DEATH = 800;
    var score = 0;

    var Player = function(el, game, death) {
        this.game = game;
        this.el = el;
        this.DEATH = death;
    };

    Player.prototype.reset = function() {
        score = 0;
        this.pos = { x: 50, y: 400 };
        this.vel = { x: 0, y: 0 };
    };

    Player.prototype.onFrame = function(delta) {
        // Player input
        this.vel.x = controls.inputVec.x * PLAYER_SPEED;

        // Throwing the player through to the other side of the screen
        // Gravity
        this.vel.y += GRAVITY * delta;

        if (this.pos.x < 0) {
            this.pos.x = 320;
        }
        if (this.pos.x > 320){
            this.pos.x = 0;
        }

        //Highscore
        if (score < -this.pos.y) {
            score = Math.floor(-this.pos.y);
        }
        $('#score').html(score);

        var oldY = this.pos.y;
        this.pos.x += delta * this.vel.x;
        this.pos.y += delta * this.vel.y;


        // Collision detection
        this.checkPlatforms(oldY);
        this.checkEnemies();

        this.checkGameOver();

        // Update UI
        this.el.css('transform', 'translate3d(' + this.pos.x + 'px,' + this.pos.y + 'px,0)');
    };

    Player.prototype.checkGameOver = function() {
        //if (this.pos.y > DEATH_Y) {
        if (this.pos.y > this.DEATH) {
            this.game.gameOver();
        }
    };

    Player.prototype.checkPlatforms = function(oldY) {
        var that = this;

        this.game.forEachPlatform(function(p) {
            // Are we crossing Y.
            if (p.rect.y + COLLISION_PADDING >= oldY && p.rect.y + COLLISION_PADDING < that.pos.y) {

                // Are inside X bounds.
                if (that.pos.x + PLAYER_HALF_WIDTH >= p.rect.x && that.pos.x - PLAYER_HALF_WIDTH <= p.rect.right) {

                    // COLLISION. Make player jump on impact.
                    that.vel.y = 0;
                    that.vel.y += -JUMP_VELOCITY;
                }
            }
        });
    };

    Player.prototype.checkEnemies = function() {
        var centerX = this.pos.x;
        var centerY = this.pos.y - 40;
        var that = this;
        this.game.forEachEnemy(function(enemy) {
            // Distance squared
            var distanceX = enemy.pos.x - centerX;
            var distanceY = enemy.pos.y - centerY;

            // Minimum distance squared
            var distanceSq = distanceX * distanceX + distanceY * distanceY;
            var minDistanceSq = (enemy.radius + PLAYER_RADIUS) * (enemy.radius + PLAYER_RADIUS);

            // What up?
            if (distanceSq < minDistanceSq) {
                that.game.sound.play('winner');
                that.game.gameOver();
            }
        });
    };

    return Player;
});
