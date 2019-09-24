function robocop(game){
    this.key = 'robocop';
    this.maxHealth = 1000;
    this.speed = 100;
    this.aggro = 500;
    this.startTime1 = game.sys.game.loop.time;
    this.startTime2 = game.sys.game.loop.time;
    this.attackDelay1 = 80;
    this.bulletCount = 0;
    this.attackDelay2 = 3000;
    this.moveDuration = 2200;
    this.file = 'police';
    this.index = 8;

    this.attack1 = function(enemy, game){
        if(this.bulletCount == 0){
            laserBurstSFX.play();
        }
        var projectile = initializeProjectile(false, enemy.x, enemy.y, player.x, player.y, 140, 50, 'laser', game);

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
        game.physics.add.collider(projectile, obstacleLayer, function(){
            projectile.destroy();
            projectiles.splice(projectiles.indexOf(projectile), 1);
        }, null, game);
        player.type.addOverlap(projectile);

        enemy.counting = false;
    };

    this.attack2 = function(enemy, game){
        var projectile = initializeProjectile(false, enemy.x, enemy.y, player.x, player.y, 110, 80, 'missile', game);
        projectile.startTime = game.sys.game.loop.time;
        projectile.duration = 4000;
        projectile.timerFrozen = false;
        
        // COLLIDERS
            // player
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
                new explosion(projectile.x, projectile.y, game);
            }, null, game);
            // hit obstacle
            game.physics.add.collider(projectile, obstacleLayer, function(){
                projectile.destroy();
                projectiles.splice(projectiles.indexOf(projectile), 1);
                new explosion(projectile.x, projectile.y, game);
            }, null, game);   
            // hit wall
            game.physics.add.collider(projectile, wallLayer, function(){
                projectile.destroy();
                projectiles.splice(projectiles.indexOf(projectile), 1);
                new explosion(projectile.x, projectile.y, game);
            }, null, game);   
            player.type.addOverlap(projectile);

        projectile.update = function(){
            if(!projectile.canMove || paused){
                projectile.setVelocity(0, 0);
                if(!projectile.timerFrozen){
                    projectile.timerFrozen = true;
                    projectile.duration = projectile.duration - (game.sys.game.loop.time - projectile.startTime);
                }
                else{
                    projectile.startTime = game.sys.game.loop.time;
                }
            }
            else if(game.sys.game.loop.time - projectile.startTime >= projectile.duration){
                projectile.destroy();
                projectiles.splice(projectiles.indexOf(projectile), 1);
                new explosion(projectile.x, projectile.y, game);
                return;
            }
            else{
                projectile.timerFrozen = false;
                projectile.angle = BetweenPoints(projectile, player);
                SetToAngle(projectile.line, projectile.x, projectile.y, projectile.angle, 128);
                velocityFromRotation(projectile.angle, projectile.speed, projectile.velocity);
                projectile.setAngle(projectile.angle * (180 / Math.PI));
                projectile.setVelocity(projectile.velocity.x, projectile.velocity.y);
            }
        }    
        enemy.counting = false;
    }
    
    this.update = function(enemy, game){
        if(!gameOver){
            // check alive
            if(enemy.health <= 0){
                enemy.maxBarGraphics.destroy();
                enemy.healthBarGraphics.destroy();
                enemy.emitter.setVisible(true);
                enemy.setVisible(false);
                timerEvents.push(game.time.addEvent({delay: 1000, callback: function(){ // blood effect
                    enemy.emitter.setVisible(false);
                }}));
                enemies.splice(enemies.indexOf(enemy), 1);
                enemy.destroy();
                score += 10;
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
                // attacking
                if(enemy.attacking){
                    // change animation
                    if(Math.abs(player.x - enemy.x) > Math.abs(player.y - enemy.y)){
                        if(player.x > enemy.x)
                            enemy.anims.play(this.key + 'RightIdle', true);
                        else 
                            enemy.anims.play(this.key + 'LeftIdle', true);
                    }
                    else {
                        if(player.y > enemy.y)
                            enemy.anims.play(this.key + 'FrontIdle', true);
                        else 
                            enemy.anims.play(this.key + 'BackIdle', true);
                    }

                    if(!enemy.knockbacked){
                        enemy.setVelocityX(0);
                        enemy.setVelocityY(0);
                    }
                        
                    if(game.sys.game.loop.time - this.startTime1 >= this.attackDelay1){
                        if(this.bulletCount == 0)
                            this.attackDelay1 = 80;
                        this.attack1(enemy, game);
                        this.bulletCount++;
                        if(this.bulletCount == 4){
                            this.bulletCount = 0;
                            this.attackDelay1 = 2000;
                        }
                        this.startTime1 = game.sys.game.loop.time;
                    }
                    if(game.sys.game.loop.time - this.startTime2 >= this.attackDelay2){
                        this.attack2(enemy, game);
                        this.startTime2 = game.sys.game.loop.time;
                    }
                }
                else{
                    
                    // moving
                    if(!enemy.counting){
                        enemy.counting = true;
                        this.moveDelay = (Math.random() * 1000) + 500;
                        enemy.direction = Math.floor(Math.random() * 4);
                        enemy.startTime = game.sys.game.loop.time;
                    }
                        
                    if(game.sys.game.loop.time - enemy.startTime >= this.moveDelay){
                        if(enemy.direction == 0){
                            moveX(enemy, -this.speed);
                        }
                        else if(enemy.direction == 1){
                            moveX(enemy, this.speed);
                        }
                        else if(enemy.direction == 2){
                            moveY(enemy, -this.speed);
                        }
                        else if(enemy.direction == 3){
                            moveY(enemy, this.speed);
                        }
                        enemy.counting = false;
                    }
                }
            }
            else{
                // idle
                    if(enemy.right){
                        enemy.anims.play(this.key + 'RightIdle', true);
                    }
                    else if(enemy.left){
                        enemy.anims.play(this.key + 'LeftIdle', true);
                    }
                    else if(enemy.up){
                        enemy.anims.play(this.key + 'BackIdle', true);
                    }
                    else if(enemy.down){
                        enemy.anims.play(this.key + 'FrontIdle', true);
                    }
            }

            // health
            updateHealthBar(enemy);
        }
    }
}

