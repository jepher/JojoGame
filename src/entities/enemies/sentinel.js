function sentinel(mech){
    this.key = 'sentinel';
    this.file = 'sentinels';
    this.index = 0;
    this.machine = true;

    this.mech = mech;
    this.maxHealth = 300;
    this.moveSpeed = 70;
    this.notKnockbackable = true;
    this.aggro = 300;
    this.attackDelay = 1200;
    
    this.lastFrame;
    this.delay = 200;
    this.currentFrame = 0;
    this.maxFrames = 3;

    // initialize animation
    for(var i = 1; i <= this.maxFrames; i++){
        if(game.anims.get('sentinelFrame' + i) == undefined){
            game.anims.create({
            key: 'sentinelFrame' + i,
            frames: [ { key: 'sentinels', frame: i - 1} ],
            frameRate: 20
            });
        }
    }

    this.attack = function(enemy, game){
        laserSFX.play();
        var projectile = initializeProjectile(false, enemy.x, enemy.y, player.x, player.y, 100, 20, 'laser', game);
        projectile.setDepth(arialProjectileDepth);
        projectile.update = function(){
            if(!projectile.canMove){
                projectile.setVelocity(0, 0);
            }
            else{
                projectile.setVelocity(projectile.velocity.x, projectile.velocity.y);
            }
        }
        
        // add colliders
        game.physics.add.collider(projectile, player, function(){
            if(!player.invulnerable){
                player.damageEmitter.setVisible(true); // blood effect
        
                timerEvents.push(game.time.addEvent({delay: 200, callback: function(){ // end blood effect
                    player.damageEmitter.setVisible(false);
                }}));
                player.health -= projectile.damage; // decrease health
            }

            projectile.destroy();
            projectiles.splice(projectiles.indexOf(projectile), 1);
        }, null, game);
        player.type.addOverlap(projectile);

        enemy.counting = false;
    };

    this.update = function(enemy, game){
        if(!gameOver){
            // check alive
            if(enemy.health <= 0){
                new explosion(enemy.x, enemy.y, game);
                mech.type.sentinelCount--;
                enemy.maxBarGraphics.destroy();
                enemy.healthBarGraphics.destroy();
                enemy.emitter.setVisible(true);
                enemy.setVisible(false);
                timerEvents.push(game.time.addEvent({delay: 1000, callback: function(){ // blood effect
                    enemy.emitter.setVisible(false);
                }}));
                enemies.splice(enemies.indexOf(enemy), 1);
                enemy.destroy();
                score += 1;
                return;
            }

            // check attacking
            if(Math.sqrt(Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)) <= this.aggro){
                enemy.attacking = true;
            }
            else{
                enemy.attacking = false;
            }

            if(enemy.canMove){
                // animation
                if(this.currentFrame == 1 || game.sys.game.loop.time - this.lastFrame >= this.delay){
                    enemy.anims.play('sentinelFrame' + this.currentFrame, true);
                    this.currentFrame++;
                    if(this.currentFrame > this.maxFrames){
                        this.currentFrame = 1;
                    }
                    this.lastFrame = game.sys.game.loop.time;
                }

                // move in circle

                // attacking
                if(enemy.attacking){                    
                    if(!enemy.counting){
                        enemy.counting = true;
                        enemy.startTime = game.sys.game.loop.time;
                    }
                        
                    if(game.sys.game.loop.time - enemy.startTime >= this.attackDelay){                  
                        this.attack(enemy, game);
                    }
                }
            }
            // health
            updateHealthBar(enemy);
        }
    }
}