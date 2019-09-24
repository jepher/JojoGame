function bomber(){
    this.key = 'bomber';
    this.file = 'robots';
    this.index = 7;
    this.machine = true;

    this.damage = 30;
    this.maxHealth = 150;
    this.moveSpeed = 160;
    this.invulnerable = false;

    this.velocity = new Phaser.Math.Vector2();
    this.line = new Phaser.Geom.Line();
    this.angle;

    this.addCollision = function(enemy, game){
        game.physics.add.collider(enemy, player, function(){
            if(!player.invulnerable){
                player.damageEmitter.setVisible(true); // blood effect
        
                timerEvents.push(game.time.addEvent({delay: 200, callback: function(){ // end blood effect
                    player.damageEmitter.setVisible(false);
                }}));
                player.health -= enemy.type.damage; // decrease health
            }

            new explosion(enemy.x, enemy.y, game, 1.5);
            enemy.maxBarGraphics.destroy();
            enemy.healthBarGraphics.destroy();
            enemy.emitter.setVisible(false);
            enemies.splice(enemies.indexOf(enemy), 1);
            enemy.destroy();
        }, null, game);
    }

    this.update = function(enemy, game){
        if(!gameOver){
            // check alive
            if(enemy.health <= 0){
                new explosion(enemy.x, enemy.y, game, 1.5);
                enemy.maxBarGraphics.destroy();
                enemy.healthBarGraphics.destroy();
                enemies.splice(enemies.indexOf(enemy), 1);
                enemy.destroy();
                score += 1;
                return;
            }

            // come to player
            if(enemy.canMove){
                this.angle = BetweenPoints(enemy, player);
                SetToAngle(this.line, player.x, player.y, this.angle, 128);
                velocityFromRotation(this.angle, this.moveSpeed, this.velocity);
                moveX(enemy, this.velocity.x);
                moveY(enemy, this.velocity.y);
            }
            
            updateHealthBar(enemy);
        }
    }
}