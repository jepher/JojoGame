function mech(game){
    this.key = 'mech';
    this.file = 'mech';
    this.index = 0;
    this.machine = true;

    this.maxHealth = 8000;
    this.moveSpeed = 20;
    this.notKnockbackable = true;
    // attack
    this.aggro = 300;
    this.moving = true;
    this.active = false;
    this.startSoundPlayed = false;
    this.wait = false;


    this.attackPhase1 = true;
    this.attackCount1 = 0;
    this.bulletCount = 0;
    this.attackCounter1 = game.sys.game.loop.time;
    this.attackDelay1 = 3000;
    this.soundPlaying1 = false;
    this.soundDelay1 = 2000;

    this.attackPhase2 = false;
    this.sentinelsSpawned = false;
    this.sentinelCount = 0;
    this.attackCount2 = 0;
    this.attackCounter2 = game.sys.game.loop.time;
    this.attackDelay2 = 2000;

    this.attackPhase3 = false;
    this.attackCount3 = 0; 
    this.shieldOn = false;
    this.robotsSpawned = false;
    this.robotCount = 0;
    this.attackCounter3 = game.sys.game.loop.time;
    this.attackDelay3 = 500;

    this.attack1 = function(enemy, game){
        if(this.bulletCount == 0){
            gatlingGunSFX.play();
        }
        
        var delta = Math.PI / 4;
        
        for(var i = 0; i < 5; i++){
            let projectile = initializeProjectile(false, enemy.x, enemy.y, player.x, player.y, 130, 10, 'bullet', game, -2 * delta + delta * i);

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
        }
            
        this.attackCounter1 = game.sys.game.loop.time;
    }

    this.spawnSentinels = function(enemy, game){
        this.sentinelsSpawned = true;
        this.sentinelCount = 6;
        for(var i = 0; i < 6; i++){
            initializeEnemy(new sentinel(enemy), enemy.x + 60 * Math.sin((Math.PI / 3) * i), enemy.y + 60 * Math.cos((Math.PI / 3) * i), game);
        }
    }
    this.attack2 = function(enemy, game){
        laserSFX.play();
        var bulletSpeed = 300;
        if(Math.sqrt(Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)) >= 200)
            bulletSpeed = 400;
        var angle = 0;
        // clockwise
        if(keyS.isDown && keyA.isDown && player.y > enemy.y && player.x > enemy.x || 
            keyW.isDown && keyA.isDown && player.y > enemy.y && player.x < enemy.x || 
            keyW.isDown && keyD.isDown && player.y < enemy.y && player.x < enemy.x ||
            keyS.isDown && keyD.isDown && player.y < enemy.y && player.x > enemy.x)
            angle = 25;
        // counter clockwise
        else if(keyS.isDown && keyA.isDown && player.y < enemy.y && player.x < enemy.x || 
            keyW.isDown && keyA.isDown && player.y < enemy.y && player.x > enemy.x || 
            keyW.isDown && keyD.isDown && player.y > enemy.y && player.x > enemy.x ||
            keyS.isDown && keyD.isDown && player.y > enemy.y && player.x < enemy.x)
            angle = -25;
        // clockwise
        else if(keyD.isDown && player.y < enemy.y|| keyA.isDown && player.y > enemy.y || 
            keyW.isDown && player.x < enemy.x || keyS.isDown && player.x > enemy.x)
            angle = 15;
        // counter clockwise
        else if(keyD.isDown && player.y > enemy.y|| keyA.isDown && player.y < enemy.y ||
            keyW.isDown && player.x > enemy.x || keyS.isDown && player.x < enemy.x)
            angle = -15;

        angle *= (2 * Math.PI / 360);        
        var projectile = initializeProjectile(false, enemy.x, enemy.y, player.x, player.y, bulletSpeed, 20, 'mechSniper', game, angle);
        projectile.setScale(2);
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
            // player.confused = true;
            // player.setTint(0x9f06ad);
            // timerEvents.push(game.time.addEvent({delay: 1000, callback: function(){ // end confusion
            //     player.confused = false;
            //     player.setTint(0xffffff);
            // }}));

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

        if(this.sentinelCount == 0){
            this.attackCount2++;
        }
        this.attackCounter2 = game.sys.game.loop.time;
    };
    this.attack3 = function(enemy, game){
        if(!this.robotsSpawned){
            if(Math.abs(player.x - enemy.x) > Math.abs(player.y - enemy.y)){
                if(player.x > enemy.x)
                    initializeEnemy(new bomber(), enemy.x + 60, enemy.y, game);
                else 
                    initializeEnemy(new bomber(), enemy.x - 60, enemy.y, game);
            }
            else {
                if(player.y > enemy.y)
                    initializeEnemy(new bomber(), enemy.x, enemy.y + 60, game);
                else 
                    initializeEnemy(new bomber(), enemy.x, enemy.y - 60, game);
            }
        }
        else{
            initializeEnemy(new robot(enemy), enemy.x + (Math.random() * 50), enemy.y + (Math.random() * 50), game);
            this.robotCount++;
        }

        this.attackCount3++;
        this.attackCounter3 = game.sys.game.loop.time;
    }

    this.update = function(enemy, game){
        if(!gameOver){
            if(this.shieldOn){
                enemy.setTint(0x0D38E2);
                enemy.invulnerable = true;
            }
            if(!this.active){
                if(!this.startSoundPlayed){
                    this.startSoundPlayed = true;
                    mechStartSFX.play();
                    timerEvents.push(game.time.addEvent({delay: 3000, callback: function(){ 
                        enemy.type.active = true;
                        enemy.type.attackCounter1 = game.sys.game.loop.time;
                        enemy.invulnerable = false;
                        enemy.setTint(0xffffff);
                    }})); 
                }
                enemy.invulnerable = true;
                enemy.setTint(0x0D38E2);
            }
            else{
                // check alive
                if(enemy.health <= 0){
                    new explosion(enemy.x, enemy.y, game, 2);
                    enemy.maxBarGraphics.destroy();
                    enemy.healthBarGraphics.destroy();
                    enemy.emitter.setVisible(false);
                    enemy.destroy();
                    enemies.splice(enemies.indexOf(enemy), 1);
                    score += 30;
                    bossFight = false;
                    bossSpawned = false;
                    lastBossFight = score;
                    bossesKilled++;

                    if(bossesKilled == 2)
                        hardMode = true;
                    spawnSoldiers = true;
                    swatDelay = delayArray[0];
                    sniperDelay = delayArray[1];
                    pyroDelay = delayArray[2];
                    robocopDelay = delayArray[3];
                    spawnDelay = delayArray[4];
                    return;
                }
                if(enemy.health > enemy.maxHealth)
                    enemy.health = enemy.maxHealth;

                if(enemy.canMove){
                    // check aggro
                    if(this.moving){
                        if(Math.sqrt(Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)) >= this.aggro){
                            var angle = BetweenPoints(enemy, player);
                            var line = new Phaser.Geom.Line();
                            SetToAngle(line, player.x, player.y, angle, 128);
                            var deltaVelocity = velocityFromRotation(angle, this.moveSpeed);
                            moveX(enemy, deltaVelocity.x);
                            moveY(enemy, deltaVelocity.y);
                        }
                        else
                            this.moving = false;
                    }
                    else{
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

                        enemy.setVelocityX(0);
                        enemy.setVelocityY(0);
                        
                        if(this.attackPhase1){
                            if(game.sys.game.loop.time - this.attackCounter1 >= this.soundDelay1 && !this.soundPlaying1){
                                this.soundPlaying1 = true
                                gatlingGunChargeSFX.play();
                            }

                            if(game.sys.game.loop.time - this.attackCounter1 >= this.attackDelay1){
                                if(this.bulletCount == 0)
                                    this.attackDelay1 = 100;
                                this.attack1(enemy, game);
                                this.bulletCount++;
                                if(this.bulletCount == 30){
                                    this.attackCount1++;
                                    this.bulletCount = 0;
                                    this.attackDelay1 = 3000;
                                    this.soundPlaying1 = false;
                                }                    
                            }
                            if(this.attackCount1 == 3){
                                this.attackCount1 = 0;
                                this.attackPhase1 = false;
                                this.attackPhase2 = true;
                                this.attackCounter2 = game.sys.game.loop.time;
                                this.moving = true;
                            }
                        }

                        if(this.attackPhase2){
                            if(!this.sentinelsSpawned){
                                this.spawnSentinels(enemy, game);
                            }
                            if(game.sys.game.loop.time - this.attackCounter2 >= this.attackDelay2){
                                this.attack2(enemy, game);
                            }
                            if(this.attackCount2 == 3){
                                this.sentinelsSpawned = false;
                                this.attackCount2 = 0;
                                this.attackPhase2 = false;
                                this.attackPhase3 = true;
                                this.attackCounter3 = game.sys.game.loop.time;
                                this.moving = true;
                            }
                        }

                        if(this.attackPhase3){
                            if(game.sys.game.loop.time - this.attackCounter3 >= this.attackDelay3 && !this.wait){
                                this.attack3(enemy, game); 
                            }
                            if(this.attackCount3 == 10 && !this.robotsSpawned){
                                this.attackDelay3 = 300;
                                this.robotsSpawned = true;
                                this.attackCount3 = 0;
                                this.shieldOn = true;
                            }
                            if(this.attackCount3 == 10 && this.robotsSpawned){
                                this.wait = true;
                                if(this.robotCount == 0){
                                    this.shieldOn = false;
                                    enemy.setTint(0xFFFFFF);
                                    enemy.invulnerable = false;
                                    timerEvents.push(game.time.addEvent({delay: 3000, callback: function(){ 
                                        enemy.type.attackPhase3 = false;
                                        enemy.type.attackPhase1 = true;
                                        enemy.type.attackCounter1 = game.sys.game.loop.time;
                                        enemy.type.moving = true;
                                        enemy.type.attackDelay3 = 500;
                                        enemy.type.robotsSpawned = false;
                                        enemy.type.wait = false;
                                        enemy.type.attackCount3 = 0;
                                    }}));
                                }
                            }
                        }
                    }
                }
            }

            // health
            updateHealthBar(enemy);
        }
    }
}

