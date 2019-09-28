function resetSettings(game){
    if(gameOverSFX != null)
        gameOverSFX.destroy();

    autoAttack = false;

    currentDepth = 0;

    score = 0;
    difficulty = 0; // measured by number of enemies
    hardMode = false;
    spawnSoldiers = false;
    swatDelay = 5;
    sniperDelay = 10;
    pyroDelay = 13;
    robocopDelay = 16;
    bossSpawned = false;
    bossFight = false;
    lastBossFight = 0;
    bossesKilled = 0;
    delayArray = [];

    timerEvents = [];

    enemies = [];
    projectiles = [];
    playerProjectiles = [];

    lastSpawn = game.sys.game.loop.time;
    spawnCounter = 0;
    spawnDelay = 2000;

    paused = false;
    gameOver = false;

    BetweenPoints = Phaser.Math.Angle.BetweenPoints;
    SetToAngle = Phaser.Geom.Line.SetToAngle;
    velocityFromRotation = game.physics.velocityFromRotation;   
}

function initializeEnemy(type, x, y, game){
    var enemy = game.physics.add.sprite(x, y, type.key);
    enemy.setDepth(spawnDepth);
    if(type.key == 'pyro' || type.key == 'sentinel')
        enemy.setDepth(arialSpawnDepth);
    if(type.key == 'mech'){
        enemy.setDepth(bossDepth);
    }
    enemy.body.immovable = true;  
    initializeAnimation(type.key, type.file, type.index, game);
    enemy.type = type;
    enemy.maxHealth = type.maxHealth;
    enemy.health = enemy.maxHealth;
    enemy.x = x;
    enemy.y = y;
    enemy.up = false;
    enemy.down = true;
    enemy.left = false;
    enemy.right = false;
    enemy.anims.play(type.key + 'FrontIdle', true);

    enemy.canMove = true;
    enemy.attacking = false;
    enemy.knockbacked = false;
    
    enemy.startTime = game.sys.game.loop.time;
    enemy.counting = false;
    enemy.direction = 0; // 0: left, 1: right, 2: up, 3: down
    enemy.update = function(){type.update(enemy, game)};

    // health
    enemy.maxBarGraphics = game.add.graphics({fillStyle: { color: 0xb6bbc4 } });
    enemy.maxBarGraphics.setDepth(spawnDepth);
    enemy.maxHealthBar = new Phaser.Geom.Rectangle();
    enemy.maxHealthBar.width = 60;
    enemy.maxHealthBar.height = 6;
    enemy.maxHealthBar.x = enemy.x - enemy.maxHealthBar.width / 2;
    enemy.maxHealthBar.y = enemy.y + 20;
        
    enemy.maxBarGraphics.fillRectShape(enemy.maxHealthBar);
    if(type.key == 'mech'){
        enemy.maxBarGraphics.setDepth(bossDepth);
        enemy.maxHealthBar.width = 80;
        enemy.maxHealthBar.y = enemy.y + 40;
        
        enemy.healthBarGraphics = game.add.graphics({fillStyle: { color: 0xD50000 } });
        enemy.healthBarGraphics.setDepth(bossDepth);
    }
    else{
        enemy.healthBarGraphics = game.add.graphics({fillStyle: { color: 0xf94d4d } });
        enemy.healthBarGraphics.setDepth(spawnDepth);        
    }
    enemy.healthBar = new Phaser.Geom.Rectangle();
    enemy.healthBar.width = enemy.maxHealthBar.width;
    enemy.healthBar.height = enemy.maxHealthBar.height;
    enemy.healthBar.x = enemy.maxHealthBar.x;
    enemy.healthBar.y = enemy.maxHealthBar.y;
    enemy.healthBarGraphics.fillRectShape(enemy.healthBar);

    // emitter
    bloodParticle = game.add.particles('blood'); 
    enemy.emitter = bloodParticle.createEmitter({
        speed: 50,
        scale: {start: .2, end: 0},
    });
    enemy.emitter.startFollow(enemy);
    enemy.emitter.setVisible(false);

    // collision
    game.physics.add.collider(wallLayer, enemy);
    if(type.key != 'pyro' && type.key != 'sentinel')
        game.physics.add.collider(obstacleLayer, enemy);
    enemy.body.collideWorldBounds = true; 
    if(enemy.type.key == 'bomber')
        enemy.type.addCollision(enemy, game);
    player.type.addOverlap(enemy);

    

    enemies.push(enemy);

    return enemy;
}

function initializeAlly(type, x, y, game){
    var ally = game.physics.add.sprite(x, y, type.key);
    ally.setDepth(spawnDepth);
    ally.body.immovable = true;  
    ally.type = type;
    ally.maxHealth = type.maxHealth;
    ally.health = ally.maxHealth;
    ally.x = x;
    ally.y = y;
    ally.up = false;
    ally.down = true;
    ally.left = false;
    ally.right = false;
    ally.attacking = false;
    initializeAnimation(type.key, type.file, type.index, game);
    ally.anims.play(ally.type.key + 'BackIdle', true);
    
    ally.velocity = new Phaser.Math.Vector2();
    ally.line = new Phaser.Geom.Line();
    ally.angle = BetweenPoints(ally, player);

    ally.startTime;
    ally.counting = false;
    ally.direction = 0; // 0: left, 1: right, 2: up, 3: down
    ally.update = function(){type.update(ally, game)};

    // health
    ally.maxBarGraphics = game.add.graphics({fillStyle: { color: 0xb6bbc4 } });
    ally.maxBarGraphics.setDepth(spawnDepth);
    ally.maxHealthBar = new Phaser.Geom.Rectangle();
    ally.maxHealthBar.width = 80;
    ally.maxHealthBar.height = 6;
    ally.maxHealthBar.x = ally.x - ally.maxHealthBar.width / 2;
    ally.maxHealthBar.y = ally.y + 20;
    ally.maxBarGraphics.fillRectShape(ally.maxHealthBar);
    ally.healthBarGraphics = game.add.graphics({fillStyle: { color: 0xf94d4d } });
    ally.healthBarGraphics.setDepth(spawnDepth);
    ally.healthBar = new Phaser.Geom.Rectangle();
    ally.healthBar.width = ally.maxHealthBar.width;
    ally.healthBar.height = ally.maxHealthBar.height;
    ally.healthBar.x = ally.maxHealthBar.x;
    ally.healthBar.y = ally.maxHealthBar.y;
    ally.healthBarGraphics.fillRectShape(ally.healthBar);

     // emitter
     bloodParticle = game.add.particles('blood'); 
     ally.emitter = bloodParticle.createEmitter({
         speed: 50,
         scale: {start: .1, end: 0},
     });
     ally.emitter.startFollow(ally);
     ally.emitter.setVisible(false);

    // collision
    game.physics.add.collider(wallLayer, ally);
    game.physics.add.collider(obstacleLayer, ally);
    ally.body.collideWorldBounds = true; 
}

function initializePlayer(type, x, y, game){
    if(player != null)
        player.destroy();
    player = game.physics.add.sprite(x, y, type.key); 
    player.setDepth(playerDepth);
    player.body.immovable = true;  
    player.type = type;       
    player.left = false; // checks for direction
    player.right = false;
    player.down = true;
    player.up = false;
    player.maxHealth = type.maxHealth;
    player.health = player.maxHealth;
    player.maxMana = type.maxMana;
    player.mana = player.maxMana;

    player.attackReady = true; // attack cooldown
    player.specialReady = true;
    player.specialActive = false;

    player.canMove = true;
    player.invulnerable = false;
    player.knockbacked = false;
    player.confused = false;
    player.burned = false;
    player.burnStart;
    player.lastBurn;
    player.burnDelay = 500;

    // cooldowns
    player.lastManaHeal;
    player.lastHeal;
    player.manaHealing = false;
    player.healing = false;

    player.update = function(){type.update(game)};
    // status bars
        // health
        player.maxBarGraphics = game.add.graphics({fillStyle: { color: 0xb6bbc4 } });
        player.maxBarGraphics.setDepth(playerDepth);
        player.maxHealthBar = new Phaser.Geom.Rectangle();
        player.maxHealthBar.width = 80;
        player.maxHealthBar.height = 6;
        player.maxHealthBar.x = player.x - player.maxHealthBar.width / 2;
        player.maxHealthBar.y = player.y + 20;
        player.maxBarGraphics.fillRectShape(player.maxHealthBar);
        player.healthBarGraphics = game.add.graphics({fillStyle: { color: 0xf94d4d } });
        player.healthBarGraphics.setDepth(playerDepth);
        player.healthBar = new Phaser.Geom.Rectangle();
        player.healthBar.width = player.maxHealthBar.width;
        player.healthBar.height = player.maxHealthBar.height;
        player.healthBar.x = player.maxHealthBar.x;
        player.healthBar.y = player.maxHealthBar.y;
        player.healthBarGraphics.fillRectShape(player.healthBar);
        // mana
        player.maxManaBar = new Phaser.Geom.Rectangle();
        player.maxManaBar.width = 80;
        player.maxManaBar.height = 6;
        player.maxManaBar.x = player.x - player.maxManaBar.width / 2;
        player.maxManaBar.y = player.y + 26;
        player.maxBarGraphics.fillRectShape(player.maxManaBar);
        player.manaBarGraphics = game.add.graphics({fillStyle: { color: 0x68a2ff } });
        player.manaBarGraphics.setDepth(playerDepth);
        player.manaBar = new Phaser.Geom.Rectangle();
        player.manaBar.width = player.maxManaBar.width;
        player.manaBar.height = player.maxManaBar.height;
        player.manaBar.x = player.maxManaBar.x;
        player.manaBar.y = player.maxManaBar.y;
        player.manaBarGraphics.fillRectShape(player.manaBar);
        // powerup indicators
            // stand
            player.standBarGraphics = game.add.graphics({fillStyle: { color: 0xffcb21 } });
            player.standBarGraphics.setDepth(playerDepth);
            player.standBar = new Phaser.Geom.Rectangle();
            player.standBar.width = (player.maxManaBar.width / player.maxMana) * player.type.standCost;
            player.standBar.height = 6;
            player.standBar.x = player.maxHealthBar.x;
            player.standBar.y = player.maxHealthBar.y;
            player.standBarGraphics.fillRectShape(player.standBar);
            // special
            player.specialBarGraphics = game.add.graphics({fillStyle: { color: 0xffdf7a } });
            player.specialBarGraphics.setDepth(playerDepth);
            player.specialBar = new Phaser.Geom.Rectangle();
            player.specialBar.width = (player.maxManaBar.width / player.maxMana) * player.type.specialCost;
            player.specialBar.height = 6;
            player.specialBar.x = player.maxHealthBar.x;
            player.specialBar.y = player.maxHealthBar.y;
            player.specialBarGraphics.fillRectShape(player.specialBar);

    // emitters
        bloodParticle = game.add.particles('blood'); 
        player.damageEmitter = bloodParticle.createEmitter({
            speed: 50,
            scale: {start: .2, end: 0},
        });
        player.damageEmitter.startFollow(player);
        player.damageEmitter.setVisible(false);

        shockParticle = game.add.particles('shock'); 
        player.shockEmitter = shockParticle.createEmitter({
            speed: 50,
            scale: {start: .2, end: 0},
        });
        player.shockEmitter.startFollow(player);
        player.shockEmitter.setVisible(false);

        // fire
        player.flame = game.physics.add.sprite(0, 0, "fire");
        player.flame.setDisplaySize(player.flame.body.width * 1.5, player.flame.body.height * 1.5);
        player.flame.setDepth(playerDepth);
        player.flame.setAlpha(.5);
        player.flame.setVisible(false);
        player.flame.maxFrames = 16;
        player.flame.delay = 50;
        player.flame.lastFrame = game.sys.game.loop.time;
        player.flame.currentFrame = 1;
        for(var i = 1; i <= player.flame.maxFrames; i++){
            if(game.anims.get('fireFrame' + i) == undefined){
                game.anims.create({
                key: 'fireFrame' + i,
                frames: [ { key: 'fire', frame: i - 1 } ],
                frameRate: 20
                });
            }
        }
        player.flame.update = function(){
            player.flame.x = player.x;
            player.flame.y = player.y - 10;
            if(player.flame.currentFrame == 1 || game.sys.game.loop.time - player.flame.lastFrame >= player.flame.delay){
                player.flame.anims.play('fireFrame' + player.flame.currentFrame, true);
                player.flame.currentFrame++;
                if(player.flame.currentFrame > player.flame.maxFrames){
                    player.flame.currentFrame = 1;
                }
                player.flame.lastFrame = game.sys.game.loop.time;
            }
        }

        starParticle = game.add.particles('star'); 
        player.specialEmitter = starParticle.createEmitter({
            speed: 100,
            scale: {start: .2, end: 0},
        });
        player.specialEmitter.startFollow(player);
        player.specialEmitter.setVisible(false);

    initializeAnimation(type.key, type.file, type.index, game);
}

function initializeEffect(type, game){
    var effect = type;
    effect.update = function(){type.update(game)};

    effects.push(effect);
}

function initializeAnimation(key, file, index, game){
    if(key == 'mech'){
        if(game.anims.get(key + 'FrontMoving') == undefined){
            game.anims.create({
                key: key + 'FrontMoving', // going left
                frames: game.anims.generateFrameNumbers(file, { start: 0, end: 2 }),
                frameRate: 5,
                repeat: -1 // animation will loop
            });
        }

        if(game.anims.get(key + 'FrontIdle') == undefined){
            game.anims.create({
            key: key + 'FrontIdle',
            frames: [ { key: file, frame: 1 } ],
            frameRate: 5
            });
        }

        if(game.anims.get(key + 'LeftMoving') == undefined){
            game.anims.create({
                key: key + 'LeftMoving', 
                frames: game.anims.generateFrameNumbers(file, { start: 3, end: 5 }),
                frameRate: 5,
                repeat: -1 
            });
        }

        if(game.anims.get(key + 'LeftIdle') == undefined){
            game.anims.create({
                key: key + 'LeftIdle',
                frames: [ { key: file, frame: 4} ],
                frameRate: 5
            });
        }

        if(game.anims.get(key + 'RightMoving') == undefined){
            game.anims.create({
                key: key + 'RightMoving', 
                frames: game.anims.generateFrameNumbers(file, { start: 6, end: 8}),
                frameRate: 5,
                repeat: -1 
            });
        }

        if(game.anims.get(key + 'RightIdle') == undefined){
            game.anims.create({
                key: key + 'RightIdle',
                frames: [ { key: file, frame: 7} ],
                frameRate: 5
            });
        }

        if(game.anims.get(key + 'BackMoving') == undefined){
            game.anims.create({
                key: key + 'BackMoving', 
                frames: game.anims.generateFrameNumbers(file, { start: 9, end: 11}),
                frameRate: 5,
                repeat: -1 
            });
        }

        if(game.anims.get(key + 'BackIdle') == undefined){
            game.anims.create({
                key: key + 'BackIdle',
                frames: [ { key: file, frame: 10} ],
                frameRate: 5
            });
        }
    }
    else{
        var startIndex = (index % 4) * 3 + (Math.floor(index / 4) * 48);
        if(game.anims.get(key + 'FrontMoving') == undefined){
            game.anims.create({
                key: key + 'FrontMoving', // going left
                frames: game.anims.generateFrameNumbers(file, { start: startIndex, end: startIndex + 2 }),
                frameRate: 10,
                repeat: -1 // animation will loop
            });
        }

        if(game.anims.get(key + 'FrontIdle') == undefined){
            game.anims.create({
            key: key + 'FrontIdle',
            frames: [ { key: file, frame: startIndex + 1 } ],
            frameRate: 20
            });
        }

        if(game.anims.get(key + 'LeftMoving') == undefined){
            game.anims.create({
                key: key + 'LeftMoving', 
                frames: game.anims.generateFrameNumbers(file, { start: startIndex + 12, end: startIndex + 12 + 2 }),
                frameRate: 10,
                repeat: -1 
            });
        }

        if(game.anims.get(key + 'LeftIdle') == undefined){
            game.anims.create({
                key: key + 'LeftIdle',
                frames: [ { key: file, frame: startIndex + 12 + 1 } ],
                frameRate: 20
            });
        }

        if(game.anims.get(key + 'RightMoving') == undefined){
            game.anims.create({
                key: key + 'RightMoving', 
                frames: game.anims.generateFrameNumbers(file, { start: startIndex + 24, end: startIndex + 24 + 2 }),
                frameRate: 10,
                repeat: -1 
            });
        }

        if(game.anims.get(key + 'RightIdle') == undefined){
            game.anims.create({
                key: key + 'RightIdle',
                frames: [ { key: file, frame: startIndex + 24 + 1 } ],
                frameRate: 20
            });
        }

        if(game.anims.get(key + 'BackMoving') == undefined){
            game.anims.create({
                key: key + 'BackMoving', 
                frames: game.anims.generateFrameNumbers(file, { start: startIndex + 36, end: startIndex + 36 + 2 }),
                frameRate: 10,
                repeat: -1 
            });
        }

        if(game.anims.get(key + 'BackIdle') == undefined){
            game.anims.create({
                key: key + 'BackIdle',
                frames: [ { key: file, frame: startIndex + 36 + 1 } ],
                frameRate: 20
            });
        }
    }
}

function initializeProjectile(isPlayer, sourceX, sourceY, targetX, targetY, speed, damage, image, game, deltaAngle = 0){
    var projectile = game.physics.add.image(sourceX, sourceY, image);
    projectile.setDepth(projectileDepth);
    projectile.speed = speed;
    projectile.damage = damage;
    projectile.velocity = new Phaser.Math.Vector2();
    projectile.line = new Phaser.Geom.Line();
    projectile.angle = BetweenPoints(new Phaser.Geom.Point(sourceX, sourceY), new Phaser.Geom.Point(targetX, targetY)) + deltaAngle;
    projectile.canMove = true;
    SetToAngle(projectile.line, sourceX, sourceY, projectile.angle, 128);
    velocityFromRotation(projectile.angle, projectile.speed, projectile.velocity);
    projectile.setAngle(projectile.angle * (180 / Math.PI));
    projectile.setVelocity(projectile.velocity.x, projectile.velocity.y);

    if(isPlayer){
        game.physics.add.collider(projectile, wallLayer, function(){
            projectile.destroy();
            playerProjectiles.splice(playerProjectiles.indexOf(projectile), 1);
        }, null, game);

        playerProjectiles.push(projectile);
    }
    else{
        game.physics.add.collider(projectile, wallLayer, function(){
            projectile.destroy();
            projectiles.splice(projectiles.indexOf(projectile), 1);
        }, null, game);

        projectiles.push(projectile);
    }

    return projectile;
}

function initializeCamera(game){
    //set bounds so the camera won't go outside the game world
    game.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels );

    //make the camera follow the player
    game.cameras.main.startFollow(player);

    //set background color, so the sky is not black
    game.cameras.main.setBackgroundColor('#ccccff');
}

function initializeCollisions(game){    
    //set the boundaries of game world
    game.physics.world.bounds.width = groundLayer.width;
    game.physics.world.bounds.height = groundLayer.height; 

    //Collision between wall and player
    game.physics.add.collider(wallLayer, player);
    
    // collision between falling layer and player
    game.physics.add.collider(obstacleLayer, player);

    // collision between boundary and player
    player.body.collideWorldBounds = true;    
}

function initializeControls(game){
    keys = game.input.keyboard.createCursorKeys();
    // custom key binds
    keyW = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W); 
    keyA = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A); 
    keyS = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S); 
    keyD = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D); 
    
    keyP = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P); // pause
    keyR = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R); // restart
    keyQ = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q); // powerup
    keyE = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E); // stand
    keyR = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R); // auto attack

    // mouse
    cursor = game.add.image(game.input.mousePointer.x + game.cameras.main.scrollX, game.input.mousePointer.y + game.cameras.main.scrollY, 'cursor').setScale(.7);
    cursor.setDepth(currentDepth);
    currentDepth++;
}

function initializeUI(game){
    // paused text
    pausedText = game.add.text(400, 300, '', { fontSize: '50px', fill: '#ffffff'});
    pausedText.setScrollFactor(0);
    pausedText.setDepth(textDepth);

    // score
    scoreText = game.add.text(10, 10, 'Score: ' + score + '\nHighscore: ' + highscore, { fontSize: '20px', fill: '#ffffff'});
    scoreText.setScrollFactor(0);
    scoreText.setDepth(textDepth);

    // game over 
    gameStatus = game.add.image(480, 300, 'gameOver');
    gameStatus.setScrollFactor(0);
    gameStatus.setDepth(textDepth);
    gameStatus.setVisible(false);

    gameOverText = game.add.text(350, 500, 'PRESS R TO RESTART', { fontSize: '25px', fill: '#ffffff'});
    gameOverText.setDepth(textDepth);
    gameOverText.setScrollFactor(0);
    gameOverText.setVisible(false);

    gameOverScore = game.add.text(400, 400, 'SCORE: ' + score, { fontSize: '35px', fill: '#FFD700', strokeThickness: 2});
    gameOverScore.setDepth(textDepth);
    gameOverScore.setScrollFactor(0);
    gameOverScore.setVisible(false);
}

function initializeAudio(game){
    backgroundMusic = game.sound.add('backgroundMusic');
    backgroundMusic.play();
    damageSFX = game.sound.add('damageSFX');
    pistolSFX = game.sound.add('pistolSFX');
    sniperSFX = game.sound.add('sniperSFX');
    rifleBurstSFX = game.sound.add('rifleBurstSFX');
    rifleSpraySFX = game.sound.add('rifleSpraySFX');
    explosionSFX = game.sound.add('explosionSFX');
    flamethrowerSFX = game.sound.add('flamethrowerSFX');
    jetpackSFX = game.sound.add('jetpackSFX');
    laserSFX = game.sound.add('laserSFX');    
    laserBurstSFX = game.sound.add('laserBurstSFX');
    gatlingGunChargeSFX = game.sound.add('gatlingGunChargeSFX');
    gatlingGunSFX = game.sound.add('gatlingGunSFX');
    shockSFX = game.sound.add('shockSFX');
    mechStartSFX = game.sound.add('mechStartSFX');
    zawarudoDio = game.sound.add( 'zawarudoDio' );
    zawarudoJotaro = game.sound.add( 'zawarudoJotaro' );
    muda = game.sound.add('muda');
    ora = game.sound.add('ora');
    jotaroTimestop = game.sound.add('jotaroTimestop');
    gameOverSFX = game.sound.add('gameOverSFX');
}

function update(game){
    cursor.setPosition(game.input.mousePointer.x + game.cameras.main.scrollX, game.input.mousePointer.y + game.cameras.main.scrollY);

    // paused
    if(paused){
        if(game.input.keyboard.checkDown(keyP, 250)){ 
            paused = false;
            game.physics.resume();
            pausedText.setText('');
        }
    }
    // active game
    else if(!gameOver){
        if(!backgroundMusic.isPlaying){
            backgroundMusic.play({seek: 38.23});
        }

        checkInput(game);
        checkStatus(game);
        player.update();

        // auto attack
        if(autoAttack && !player.specialActive && !player.type.zawarudoActive)
            player.type.attack(game);
        
        // burn damage
        if(player.burned){
            player.flame.setVisible(true);
            player.flame.update();
            
            if(game.sys.game.loop.time - player.burnStart >= 3000){
                player.burned = false;
                player.flame.setVisible(false);
            }

            if(game.sys.game.loop.time - player.lastBurn >= player.burnDelay){
                player.health -= 10;
                player.lastBurn = game.sys.game.loop.time;
            }
        }
        // NPCs
            // spawning
            if(((!bossFight  && !player.type.zawarudoActive && game.sys.game.loop.time - lastSpawn >= spawnDelay )|| 
            (bossFight && hardMode && bossSpawned)) && !player.type.zawarudoActive && game.sys.game.loop.time - lastSpawn >= spawnDelay){
                if(spawnCounter > 0 && spawnCounter % swatDelay == 0){
                    initializeEnemy(new swat(), Math.floor(Math.random() * 1112) + 36, Math.floor(Math.random() * 1112) + 100, game);
                }
                if(spawnCounter > 0 && spawnCounter % sniperDelay == 0){
                    initializeEnemy(new sniper(), Math.floor(Math.random() * 1112) + 36, Math.floor(Math.random() * 1112) + 100, game);
                }
                if(spawnCounter > 0 && spawnCounter % pyroDelay == 0){
                    initializeEnemy(new pyro(game), Math.floor(Math.random() * 1112) + 36, Math.floor(Math.random() * 1112) + 100, game);
                }
                if(spawnCounter > 0 && spawnCounter % robocopDelay == 0){
                    initializeEnemy(new robocop(game), Math.floor(Math.random() * 1112) + 36, Math.floor(Math.random() * 1112) + 100, game);
                    spawnCounter = 0;
                }
                else if(spawnSoldiers)
                    initializeEnemy(new soldier(), Math.floor(Math.random() * 1112) + 36, Math.floor(Math.random() * 1112) + 100, game);
                else
                    initializeEnemy(new cop(), Math.floor(Math.random() * 1112) + 36, Math.floor(Math.random() * 1112) + 100, game);
                spawnCounter++;
                lastSpawn = game.sys.game.loop.time;
            }
            if(bossFight && !bossSpawned && enemies.length == 0){
                console.log("boss spawned");
                bossSpawned = true;
                delayArray = [];
                delayArray.push(swatDelay);
                delayArray.push(sniperDelay);
                delayArray.push(pyroDelay);
                delayArray.push(robocopDelay);
                delayArray.push(spawnDelay);
                swatDelay = 15;
                sniperDelay = 20;
                pyroDelay = 25;
                robocopDelay = 10000;
                spawnDelay = 12000;
                initializeEnemy(new mech(game), 592, 672, game);
                // initializeEnemy(new dioBoss(game), 592, 672, game);
            }
            
            if(difficulty != Math.floor(enemies.length / 10)){ // control spawn rate
                if(difficulty < Math.floor(enemies.length / 10))
                    spawnDelay = spawnDelay + 500 * difficulty; 
                else
                    spawnDelay = spawnDelay - 500 * difficulty; 
                difficulty = Math.floor(enemies.length / 10);                
            }

            // enemies
            enemies.forEach(function(element) {
                element.update();
            });
        
        // projectiles
        projectiles.forEach(function(element){
            element.update();
        });
        playerProjectiles.forEach(function(element){
            element.update();
        });
        
        // effects
        effects.forEach(function(element){
            element.update();
        });

        // score
        if(score > lastBossFight + 100){
            console.log("stop spawning");
            bossFight = true;
        }

        scoreText.setText('Score: ' + score + '\nHighscore: ' + highscore);

        // health
        if(player.health < player.maxHealth){
            if(!player.healing){
                player.healing = true;
                player.lastHeal = game.sys.game.loop.time;
            }

            if(player.healing && game.sys.game.loop.time - player.lastHeal >= 3000){
                player.health += 10;
                player.lastHeal = game.sys.game.loop.time;
            }
        }
        else{
            player.healing = false;
        }

        // mana
        if(player.mana < player.maxMana && !player.specialActive){
            if(!player.manaHealing){
                player.manaHealing = true;
                player.lastManaHeal = game.sys.game.loop.time;
            }
            
            if(player.manaHealing && game.sys.game.loop.time - player.lastManaHeal >= 500){
                player.mana += 5;
                player.lastManaHeal = game.sys.game.loop.time;
            }
        }
        else{
            player.manaHealing = false;
        }
    }

    // game over
    else{
        if(game.sys.game.loop.time - lastBlink >= blinkDelay){
            if(gameOverText.visible)
                gameOverText.setVisible(false);
            else
                gameOverText.setVisible(true);
            lastBlink = game.sys.game.loop.time;
        }

        if(game.input.keyboard.checkDown(keyR, 250)){ // restart
            game.scene.restart();
        } 
    }
}

function checkInput(game){
        // pause
        if(game.input.keyboard.checkDown(keyP, 250)){
            paused = true;
            game.physics.pause();
            pausedText.setText('PAUSED');
        }

        if(game.input.keyboard.checkDown(keyR, 250)){
            // var deltaX = Math.floor(Math.random() * 20);
            // var deltaY = Math.floor(Math.random() * 20);
            // if(Math.floor(Math.random() * 2) == 0)
            //     deltaX = -deltaX;
            // if(Math.floor(Math.random() * 2) == 0)
            //     deltaY = -deltaY;
            // new explosion(player.x + deltaX, player.y + deltaY, game);
            if(autoAttack)
                autoAttack = false;
            else
                autoAttack = true;
        }

        // movement
            // idle
            if((!(keyA.isDown || keyD.isDown || keyW.isDown || keyS.isDown) && !player.knockbacked) || !player.canMove){
                if(Math.abs(player.x - cursor.x) > Math.abs(player.y - cursor.y)){
                    if(cursor.x > player.x)
                        player.anims.play(player.type.key + 'RightIdle', true);
                    else 
                        player.anims.play(player.type.key + 'LeftIdle', true);
                }
                else {
                    if(cursor.y > player.y)
                        player.anims.play(player.type.key + 'FrontIdle', true);
                    else 
                        player.anims.play(player.type.key + 'BackIdle', true);
                }
                
                player.setVelocityX(0);
                player.setVelocityY(0);
            }
            else if(player.canMove){
                if(!player.confused){
                    // up and down
                    if (keyW.isDown){
                        moveY(player, -player.type.speed);
                    }
                    else if (keyS.isDown){
                        moveY(player, player.type.speed);
                    }
                    else{
                        player.up = false;
                        player.down = false;
                        if(!player.knockbacked)
                            player.setVelocityY(0);
                    }
                    // left and right
                    if (keyA.isDown){
                        moveX(player, -player.type.speed);
                    }
                    else if (keyD.isDown){
                        moveX(player, player.type.speed);
                    }
                    else{
                        player.left = false;
                        player.right = false;
                        if(!player.knockbacked)
                            player.setVelocityX(0);                
                    }
                }
                else{ // confused
                    // up and down
                    if (keyS.isDown){
                        moveY(player, -player.type.speed);
                    }
                    else if (keyW.isDown){
                        moveY(player, player.type.speed);
                    }
                    else{
                        player.up = false;
                        player.down = false;
                        if(!player.knockbacked)
                            player.setVelocityY(0);
                    }
                    // left and right
                    if (keyD.isDown){
                        moveX(player, -player.type.speed);
                    }
                    else if (keyA.isDown){
                        moveX(player, player.type.speed);
                    }
                    else{
                        player.left = false;
                        player.right = false;
                        if(!player.knockbacked)
                            player.setVelocityX(0);                
                    }
                }
            }

            // attacks
            player.type.update(game);
        
            game.input.on('pointerdown', function (pointer) {
                if(player.type.zawarudoActive || !autoAttack)
                    player.type.attack(game);
            }, game);          

        // HEALTH BAR
        updatePlayerBars();
}

function checkStatus(game){
    // game over
    if(player.health <= 0){
        player.health = 0;
        setGameOver(game);
    }

    if(player.health > player.type.maxHealth){
        player.health = player.type.maxHealth;
    }
    if(player.mana < 0){
        player.mana = 0;
    }
    if(player.mana > player.type.maxMana){
        player.mana = player.type.maxMana;
    }

    if(player.invulnerable){
        player.confused = false;

        player.burned = false;
        player.flame.setVisible(false);
    }
}

function updatePlayerBars(){
    // health
    player.healthBar.width = (player.maxHealthBar.width / player.maxHealth) * player.health;
    player.maxBarGraphics.clear();
    player.healthBarGraphics.clear();
    player.maxHealthBar.x = player.x - player.maxHealthBar.width / 2;
    player.maxHealthBar.y = player.y + 20;
    player.maxBarGraphics.fillRectShape(player.maxHealthBar);
    player.healthBar.x = player.maxHealthBar.x;
    player.healthBar.y = player.maxHealthBar.y;
    player.healthBarGraphics.fillRectShape(player.healthBar);
    
    // mana
    player.manaBar.width = (player.maxManaBar.width / player.maxMana) * player.mana;
    player.manaBarGraphics.clear();
    player.maxManaBar.x = player.x - player.maxManaBar.width / 2;
    player.maxManaBar.y = player.y + 26;
    player.maxBarGraphics.fillRectShape(player.maxManaBar);
    player.manaBar.x = player.maxManaBar.x;
    player.manaBar.y = player.maxManaBar.y;
    player.manaBarGraphics.fillRectShape(player.manaBar);

    // stand
    player.standBarGraphics.clear();
    player.standBar.x = player.maxManaBar.x;
    player.standBar.y = player.maxManaBar.y;
    player.standBarGraphics.fillRectShape(player.standBar);

    // special
    player.specialBarGraphics.clear();
    player.specialBar.x = player.maxManaBar.x;
    player.specialBar.y = player.maxManaBar.y;
    player.specialBarGraphics.fillRectShape(player.specialBar);

    // power indicators
    if(player.mana >= player.type.standCost){
        player.standBarGraphics.setVisible(true);
        player.specialBarGraphics.setVisible(false);
    }
    else if(player.mana >= player.type.specialCost){
        player.standBarGraphics.setVisible(false);
        player.specialBarGraphics.setVisible(true);
    }
    else{
        player.standBarGraphics.setVisible(false);
        player.specialBarGraphics.setVisible(false);
    }
}

function updateHealthBar(target){
    target.healthBar.width = (target.maxHealthBar.width / target.maxHealth) * target.health;
    target.maxBarGraphics.clear();
    target.healthBarGraphics.clear();
    target.maxHealthBar.x = target.x - target.maxHealthBar.width / 2;
    if(target.type.key == 'mech')
        target.maxHealthBar.y = target.y + 40;
    else
        target.maxHealthBar.y = target.y + 20;
    target.maxBarGraphics.fillRectShape(target.maxHealthBar);
    target.healthBar.x = target.maxHealthBar.x;
    target.healthBar.y = target.maxHealthBar.y;
    target.healthBarGraphics.fillRectShape(target.healthBar);
}

function moveX(entity, speed){
    // left
    if(speed < 0){
        // direction check
        entity.right = false;
        entity.left = true;
        //activate animation
        entity.anims.play(entity.type.key + 'LeftMoving', true);
    }
    // right
    else{
        // direction check
        entity.right = true;
        entity.left = false;
        //activate animation
        entity.anims.play(entity.type.key + 'RightMoving', true);
    }

    // change velocity
    entity.setVelocityX(speed);
}

function moveY(entity, speed){
    // up
    if(speed < 0){
        // direction check
        entity.down = false;
        entity.up = true;
        //activate animation
        if(!entity.right && !entity.left)
        entity.anims.play(entity.type.key + 'BackMoving', true);
    }
    // down
    else{
        // direction check
        entity.down = true;
        entity.up = false;
        //activate animation
        if(!entity.right && !entity.left)
        entity.anims.play(entity.type.key + 'FrontMoving', true);
    }

      // change velocity
      entity.setVelocityY(speed);
}

function setGameOver(game){ 
    if(player.health <= 0){
        player.health = 0;
    }
    updatePlayerBars();

    if(score > highscore)
        highscore = score;

    backgroundMusic.destroy();
    gameOverSFX.play();
    game.physics.pause();
    gameOver = true;
    gameOverText.setVisible(true);
    gameStatus.setVisible(true);
    gameOverScore.setText('SCORE: ' + score);
    gameOverScore.setVisible(true);
    lastBlink = game.sys.game.loop.time;
    enemies = [];
}