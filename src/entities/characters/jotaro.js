function jotaro(game){
    this.key = 'jotaro';
    this.file = 'characters';
    this.index = 4;

    this.maxHealth = 250;
    this.maxMana = 200;
    this.speed = 180;
    this.damage = 35;

    this.attackReady = true;
    this.attackDelay = 190;
    this.specialCost = 58;
    this.specialReady = true;
    this.specialActive = false;

    this.standCost = 100;
    this.zawarudoStart;
    this.timerFrozen = false;
    this.canMoveDelay = 3600;
    this.check1 = false;
    this.particleDelay = 2000;
    this.check2 = false;
    this.zawarudoDuration = 5000;
    this.zawarudoActive = false;
    this.freezeCheck = false;
    this.filterScale = 1;
    this.filterAlpha = .5;
    this.filter = game.physics.add.image(0, 0, 'jotaroFilter').setAlpha(0).setActive(false);

    this.addOverlap = function(element){
        game.physics.add.overlap(element, this.filter, function(){
            if(player.type.freezeCheck){
                element.setVelocityX(0);
                element.setVelocityY(0);
                element.setTint(0xFFD700);
                element.canMove = false;
            }
        }, null, game);
    }

    this.attack = function(game){
        if(this.attackReady){
            this.attackReady = false;
            timerEvents.push(game.time.addEvent({delay: this.attackDelay, callback: function(){ 
                player.type.attackReady = true;
            }}));

            if(!this.zawarudoActive){
                var projectile = initializeProjectile(true, player.x, player.y, cursor.x, cursor.y, 150, this.damage, 'oraPunch', game);
                projectile.startTime = game.sys.game.loop.time;
                projectile.duration = 1500;
                projectile.update = function(){
                    if(game.sys.game.loop.time - projectile.startTime >= projectile.duration){
                        playerProjectiles.splice(playerProjectiles.indexOf(projectile), 1);
                        projectile.destroy();
                        return;
                    }
                }
                projectile.setScale(1.2);

                // add colliders
                enemies.forEach(function(element){
                    game.physics.add.collider(projectile, element, function(){
                        if(!element.invulnerable){
                            if(!element.type.machine)
                                damageSFX.play();

                            element.emitter.setVisible(true); // blood effect
                    
                            timerEvents.push(game.time.addEvent({delay: 200, callback: function(){ // end blood effect
                                element.emitter.setVisible(false);
                            }}));
                            element.health -= projectile.damage; // decrease health
                        }
        
                        playerProjectiles.splice(playerProjectiles.indexOf(projectile), 1);
                        projectile.destroy();
                    }, null, game);
                })
                
                game.physics.add.collider(projectile, obstacleLayer, function(){
                    playerProjectiles.splice(playerProjectiles.indexOf(projectile), 1);
                    projectile.destroy();
                }, null, game);
            }
        }
    };

    this.special = function(game){
        if(player.mana >= this.specialCost && player.specialReady){
            player.specialActive = true;
            player.specialReady = false;
            this.attackReady = false;
            ora.play();

            for(var i = 0; i < 17; i++){
                timerEvents.push(game.time.addEvent({delay: 200 + 200 * i, callback: function(){ 
                    // create projectile
                    var projectile = initializeProjectile(true, player.x, player.y, cursor.x, cursor.y, 160, 60, 'oraSmash', game);
                    projectile.startTime = game.sys.game.loop.time;
                    projectile.duration = 2000;
                    projectile.timerFrozen = false;
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
                            playerProjectiles.splice(playerProjectiles.indexOf(projectile), 1);
                            projectile.destroy();
                            return;
                        }
                        else{
                            projectile.timerFrozen = false;
                        }
                    }
                    projectile.setScale(1.5);
                    
                    enemies.forEach(function(element){ // add colliders
                        game.physics.add.collider(projectile, element, function(){
                            if(!element.invulnerable){
                                if(!element.type.machine)
                                    damageSFX.play();

                                element.emitter.setVisible(true); // blood effect
                        
                                timerEvents.push(game.time.addEvent({delay: 200, callback: function(){ // end blood effect
                                    element.emitter.setVisible(false);
                                }}));
                                element.health -= projectile.damage; // decrease health
                            }
            
                            playerProjectiles.splice(playerProjectiles.indexOf(projectile), 1);
                            projectile.destroy();
                        }, null, game);
                    })

                    projectiles.forEach(function(element){
                        game.physics.add.overlap(element, projectile, function(){
                            projectiles.splice(projectiles.indexOf(element), 1);
                            element.destroy();
                        }, null, game);
                    })
                    
                    game.physics.add.collider(projectile, obstacleLayer, function(){
                        playerProjectiles.splice(playerProjectiles.indexOf(projectile), 1);
                        projectile.destroy();
                    }, null, game);
                    player.mana -= 3;
                }}));
            }

            timerEvents.push(game.time.addEvent({delay: 4200, callback: function(){ 
                var projectile = initializeProjectile(true, player.x, player.y, cursor.x, cursor.y, 170, 200, 'oraSmash', game);
                player.mana -= 10;
                projectile.startTime = game.sys.game.loop.time;
                projectile.duration = 3000;
                projectile.timerFrozen = false;
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
                        playerProjectiles.splice(playerProjectiles.indexOf(projectile), 1);
                        projectile.destroy();
                        return;
                    }
                    else{
                        projectile.timerFrozen = false;
                    }
                }
                projectile.setScale(3);
                enemies.forEach(function(element){ // add colliders
                    game.physics.add.overlap(projectile, element, function(){
                        if(!element.invulnerable){
                            if(!element.type.machine)
                                damageSFX.play();

                            element.emitter.setVisible(true); // blood effect
                    
                            timerEvents.push(game.time.addEvent({delay: 200, callback: function(){ // end blood effect
                                element.emitter.setVisible(false);
                            }}));

                            element.health -= projectile.damage; // decrease health
                            element.invulnerable = true;
                            timerEvents.push(game.time.addEvent({delay: 300, callback: function(){
                                element.invulnerable = false;
                            }}));
                        }
                    }, null, game);
                })

                projectiles.forEach(function(element){
                    game.physics.add.overlap(element, projectile, function(){
                        projectiles.splice(projectiles.indexOf(element), 1);
                        element.destroy();
                    }, null, game);
                })
                
                game.physics.add.collider(projectile, obstacleLayer, function(){
                    playerProjectiles.splice(playerProjectiles.indexOf(projectile), 1);
                    projectile.destroy();
                }, null, game);
            }}));

            timerEvents.push(game.time.addEvent({delay: 4200, callback: function(){ 
                player.specialActive = false;
                player.specialReady = true;
                player.type.attackReady = true;
            }}));    
        }
    }

    this.update = function(game){
        if(this.zawarudoActive){
            if(paused){
                if(!this.timerFrozen){
                    this.timerFrozen = true;
                    this.canMoveDelay = this.canMoveDelay - (game.sys.game.loop.time - this.zawarudoStart);
                    this.particleDelay = this.particleDelay - (game.sys.game.loop.time - this.zawarudoStart);
                    this.zawarudoDuration = this.zawarudoDuration - (game.sys.game.loop.time - this.zawarudoStart);
                    this.hideFilterDelay = this.hideFilterDelay - (game.sys.game.loop.time - this.zawarudoStart);
                }
                else{
                    this.startTime = game.sys.game.loop.time;
                }
            }
            else{
                this.timerFrozen = false;
                if(!this.check1 && game.sys.game.loop.time - this.zawarudoStart >= this.canMoveDelay){
                    this.check1 = true;
                    this.filterScale = 100;
                    this.filter.setScale(this.filterScale);
                    player.canMove = true;
                }

                if(!this.check2 && game.sys.game.loop.time - this.zawarudoStart >= this.particleDelay){
                    this.check2 = true;
                    player.specialEmitter.setVisible(false);
                    player.setTint(0xFFFFFF);

                    this.filter.setActive(true);
                    this.filter.setAlpha(this.filterAlpha);
                    this.freezeCheck = true;
                    for(var i = 0; i < 100; i++){
                        timerEvents.push(game.time.addEvent({delay: 30 + 30 * i, callback: function(){ 
                            player.mana -= 2;
                            player.type.filterScale += .1;
                            player.type.filter.setScale(player.type.filterScale);
                        }}));
                    } 
                    player.specialActive = false;
                }

                if(game.sys.game.loop.time - this.zawarudoStart >= this.zawarudoDuration){
                    game.add.tween({
                        targets: player.type.filter,
                        ease: 'Sine.easeInOut',
                        duration: 2000,
                        delay: 0,
                        alpha: 0
                    });                   
                    player.type.filter.setActive(false);
                    
                    player.type.filterAlpha = .5;
                    enemies.forEach(function(element){
                        element.setTint(0xFFFFFF);
                        element.canMove = true;
                    });
                    projectiles.forEach(function(element){
                        element.setTint(0xFFFFFF);
                        element.canMove = true;
                    });
                    effects.forEach(function(element){
                        element.setTint(0xFFFFFF);
                        element.canMove = true;
                    });
                    player.specialReady = true;
                    player.invulnerable = false;       
                    player.type.zawarudoActive = false;
                    player.type.freezeCheck = false;

                    timerEvents.push(game.time.addEvent({delay: 5000, callback: function(){ 
                        player.type.filterScale = 1;
                        player.type.filter.setScale(player.type.filterScale);                    
                    }}));
                }
            }
        }
        if(autoAttack && !this.zawarudoActive)
            this.attackDelay = 300;
        else
            this.attackDelay = 200;

        if(game.input.keyboard.checkDown(keyQ, 250)){
            player.type.special(game);           
        }
        // zawarudo
        if(game.input.keyboard.checkDown(keyE, 250)){
            if(!this.zawarudoActive && player.specialReady && player.mana >= this.standCost){
                this.zawarudoStart = game.sys.game.loop.time;
                this.canMoveDelay = 3600;
                this.particleDelay = 2000;
                this.zawarudoDuration = 5000;
                this.check1 = false;
                this.check2 = false;
                player.specialActive = true;
                player.specialReady = false;
                this.filter.setPosition(player.x, player.y);
                this.zawarudoActive = true;

                // sound
                zawarudoJotaro.play();

                // movement
                player.setVelocityX(0);
                player.setVelocityY(0);
                player.canMove = false;

                player.left = false;
                player.right = false;
                player.up = false;
                player.down = true;

                // particles
                player.setTint(0xFFD700);
                player.specialEmitter.setVisible(true);
                player.invulnerable = true;
            }
        }
    }
}