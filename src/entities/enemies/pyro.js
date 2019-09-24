function pyro(game){
    this.key = 'pyro';
    this.file = 'police';
    this.index = 11;

    this.maxHealth = 200;
    this.moveSpeed = 200;
    this.notKnockbackable = true;
    this.aggro = 300;

    this.startTime1 = game.sys.game.loop.time;
    this.startTime2 = game.sys.game.loop.time;
    this.attackDelay1 = 2000;
    this.attackDelay2 = 2000;
    this.bulletCount = 0;
    
    // fire animation
    var duration = 800;
    var maxFrames = 16;
    var delay = duration / maxFrames;
    for(var i = 1; i <= maxFrames; i++){
        if(game.anims.get('flamethrowerFrame' + i) == undefined){
            game.anims.create({
            key: 'flamethrowerFrame' + i,
            frames: [ { key: 'explosion', frame: i - 1 } ],
            frameRate: 20
            });
        }
    }

    // jetpack
    this.jetpack = game.physics.add.sprite(0, 0, "jetpack");
    this.jetpack.setDisplaySize(this.jetpack.body.width * 2.5, this.jetpack.body.height * 2.5);
    this.jetpack.setDepth(arialSpawnDepth);
    this.jetpack.setVisible(false);
    this.jetpack.soundDelay = 4000;
    this.jetpack.lastSound = game.sys.game.loop.time - this.jetpack.soundDelay;
    this.jetpack.maxFrames = 31;
    this.jetpack.delay = 50; 
    this.jetpack.lastFrame = game.sys.game.loop.time;
    this.jetpack.currentFrame = 1;
    for(var i = 1; i <= this.jetpack.maxFrames; i++){
        if(game.anims.get('jetpackFrame' + i) == undefined){
            game.anims.create({
            key: 'jetpackFrame' + i,
            frames: [ { key: 'jetpack', frame: i - 1 } ],
            frameRate: 20
            });
        }
    }

    this.jetpack.update = function(enemy){
        enemy.type.jetpack.x = enemy.x;
        enemy.type.jetpack.y = enemy.y + 30;

        // if(game.sys.game.loop.time - enemy.type.jetpack.lastSound >= enemy.type.jetpack.soundDelay){
        //     jetpackSFX.play();
        //     enemy.type.jetpack.lastSound = game.sys.game.loop.time;
        // }
        if(enemy.type.jetpack.currentFrame == 1 || game.sys.game.loop.time - enemy.type.jetpack.lastFrame >= enemy.type.jetpack.delay){
            enemy.type.jetpack.anims.play('jetpackFrame' + enemy.type.jetpack.currentFrame, true);
            enemy.type.jetpack.currentFrame++;
            if(enemy.type.jetpack.currentFrame > enemy.type.jetpack.maxFrames){
                enemy.type.jetpack.currentFrame = 1;
            }
            enemy.type.jetpack.lastFrame = game.sys.game.loop.time;
        }
    }

    var delta1 = Math.PI / 130;
    var delta2 = Math.PI / 7;

    this.attack1 = function(enemy, game){
        if(this.bulletCount == 0){
            flamethrowerSFX.play();
        }

        for(var i = 0; i < 20; i++){
            let projectile = game.physics.add.sprite(enemy.x, enemy.y, "explosion");
            projectile.setDepth(arialProjectileDepth);
            projectile.speed = 260;
            projectile.velocity = new Phaser.Math.Vector2();
            projectile.line = new Phaser.Geom.Line();
            projectile.angle = BetweenPoints(new Phaser.Geom.Point(enemy.x, enemy.y), new Phaser.Geom.Point(player.x, player.y)) -delta1 * 10 + delta1 *  i;
            projectile.canMove = true;
            SetToAngle(projectile.line, enemy.x, enemy.y, projectile.angle, 128);
            velocityFromRotation(projectile.angle, projectile.speed, projectile.velocity);
            projectile.setAngle(projectile.angle * (180 / Math.PI));
            projectile.setVelocity(projectile.velocity.x, projectile.velocity.y);

            game.physics.add.collider(projectile, wallLayer, function(){
                projectile.destroy();
                projectiles.splice(projectiles.indexOf(projectile), 1);
            }, null, game);

            projectiles.push(projectile);

            projectile.startTime = game.sys.game.loop.time;
            projectile.duration = duration;
            projectile.timerFrozen = false;

            projectile.lastFrame = game.sys.game.loop.time;
            projectile.currentFrame = 1;
            
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
                    return;
                }
                else{
                    projectile.timerFrozen = false;
                    if(projectile.currentFrame == 0 || game.sys.game.loop.time - projectile.lastFrame >= delay && projectile.canMove){
                        projectile.anims.play('flamethrowerFrame' + projectile.currentFrame, true);
                        projectile.currentFrame++;
                        projectile.lastFrame = game.sys.game.loop.time;
                    }
                    projectile.setVelocity(projectile.velocity.x, projectile.velocity.y);
                }
            }
            
            // add colliders
            game.physics.add.overlap(projectile, player, function(){
                player.burnStart = game.sys.game.loop.time;
                if(!player.burned)
                    player.lastBurn = player.burnStart;
                player.burned = true;
            }, null, game);

            player.type.addOverlap(projectile);
        }
    };

    this.attack2 = function(enemy, game){
        laserSFX.play();

        for(var i = 0; i < 5; i++){
            let projectile = initializeProjectile(false, enemy.x, enemy.y, player.x, player.y, 200, 0, 'shockBlast', game, -delta2 * 2 + delta2 * i);
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
            player.type.addOverlap(projectile);
        }
    };

    this.update = function(enemy, game){
        if(!gameOver){
            // check alive
            if(enemy.health <= 0){
                enemy.maxBarGraphics.destroy();
                enemy.healthBarGraphics.destroy();
                enemy.type.jetpack.destroy();
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
                enemy.type.jetpack.setVisible(true);
            }

            if(enemy.canMove){
                this.jetpack.update(enemy);
                // attacking
                if(enemy.attacking){                                            
                    // come to player
                    if(Math.sqrt(Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)) >= 200){
                        var line = new Phaser.Geom.Line();
                        var angle = BetweenPoints(enemy, player);
                        SetToAngle(line, player.x, player.y, angle, 128);
                        velocityFromRotation(angle, this.moveSpeed, enemy.body.velocity);
                    }
                    else{
                        enemy.setVelocityX(0);
                        enemy.setVelocityY(0);
                    }

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

                    if(game.sys.game.loop.time - this.startTime1 >= this.attackDelay1){     
                        if(this.bulletCount == 0)
                            this.attackDelay1 = 50;
                        this.attack1(enemy, game);
                        this.bulletCount++;
                        if(this.bulletCount == 30){
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
            }
            // health
            updateHealthBar(enemy);
        }
    }
}