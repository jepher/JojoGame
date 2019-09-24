function robot(mech){
    this.mech = mech;
    this.machine = true;
    this.key = 'robot';
    this.file = 'robots';
    this.index = 10;

    this.maxHealth = 150;
    this.moveSpeed = 70;
    this.attackMoveSpeed = 20;
    this.aggro = 300;
    this.attackDelay = 2000;
    this.moveDuration = 500;
    
    this.attack = function(enemy, game){
        laserSFX.play();
        var projectile = initializeProjectile(false, enemy.x, enemy.y, player.x, player.y, 130, 30, 'shockBlast', game);
        projectile.setScale(1.5);

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

            if(!player.type.zawarudoActive){
                // paralysis
                shockSFX.play();
                player.canMove = false;
                player.shockEmitter.setVisible(true);
                player.setTint(0xFFFF55);

                timerEvents.push(game.time.addEvent({delay: 1000, callback: function(){ // end paralysis
                    player.canMove = true;
                    player.shockEmitter.setVisible(false);
                    player.setTint(0xffffff);
                }}));
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

    this.update = function(enemy, game){
        if(!gameOver){
            // check alive
            if(enemy.health <= 0){
                new explosion(enemy.x, enemy.y, game);
                enemy.maxBarGraphics.destroy();
                enemy.healthBarGraphics.destroy();
                enemy.emitter.setVisible(true);
                enemy.setVisible(false);
                timerEvents.push(game.time.addEvent({delay: 1000, callback: function(){ // blood effect
                    enemy.emitter.setVisible(false);
                }}));
                enemies.splice(enemies.indexOf(enemy), 1);
                enemy.destroy();
                mech.type.robotCount--;
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
                // attacking
                if(enemy.attacking){                    
                    if(!enemy.counting){
                        enemy.counting = true;
                        enemy.startTime = game.sys.game.loop.time;

                        enemy.right = false;
                        enemy.left = false;
                        enemy.direction = Math.floor(Math.random() * 4);
                        if(enemy.direction == 0){
                            moveX(enemy, -enemy.type.attackMoveSpeed);
                        }
                        else if(enemy.direction == 1){
                            moveX(enemy, enemy.type.attackMoveSpeed);
                        }
                        else if(enemy.direction == 2){
                            moveY(enemy, -enemy.type.attackMoveSpeed);
                        }
                        else if(enemy.direction == 3){
                            moveY(enemy, enemy.type.attackMoveSpeed);
                        }
                    }
                        
                    if(game.sys.game.loop.time - enemy.startTime >= this.moveDuration){
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
                    }

                    if(game.sys.game.loop.time - enemy.startTime >= this.attackDelay){                  
                        this.attack(enemy, game);
                    }
                }
                else{
                    
                    // moving
                    if(!enemy.counting){
                        enemy.counting = true;
                        this.moveDuration = (Math.random() * 1000) + 500;
                        enemy.direction = Math.floor(Math.random() * 4);
                        enemy.startTime = game.sys.game.loop.time;
                    }
                        
                    if(game.sys.game.loop.time - enemy.startTime >= this.moveDuration){
                        if(enemy.direction == 0){
                            moveX(enemy, -this.moveSpeed);
                        }
                        else if(enemy.direction == 1){
                            moveX(enemy, this.moveSpeed);
                        }
                        else if(enemy.direction == 2){
                            moveY(enemy, -this.moveSpeed);
                        }
                        else if(enemy.direction == 3){
                            moveY(enemy, this.moveSpeed);
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