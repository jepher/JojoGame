 // MENU
        var menuScene = new Phaser.Class({
            Extends: Phaser.Scene,
            initialize:
                function SceneMainMenu ()
                {
                    Phaser.Scene.call(this, { key: 'menu' });
                },
            
            preload: 
                function (){ // LOAD ALL GAME ASSETS
                    // MENU
                    this.load.image('background', 'assets/images/menu/background.png');
                    this.load.image('title', 'assets/images/menu/title.png');
                    this.load.image('controlsTitle', 'assets/images/menu/controlsTitle.png');
                    this.load.image('controls', 'assets/images/menu/controls.png');         
                    this.load.image('overlay', 'assets/images/menu/overlay.png');      
                    this.load.image('startButtonNormal', 'assets/images/menu/startNormal.png');
                    this.load.image('startButtonClicked', 'assets/images/menu/startClicked.png');
                    this.load.image('controlsButtonNormal', 'assets/images/menu/controlsNormal.png');
                    this.load.image('controlsButtonClicked', 'assets/images/menu/controlsClicked.png');
                    this.load.image('homeButtonNormal', 'assets/images/menu/homeNormal.png');
                    this.load.image('homeButtonClicked', 'assets/images/menu/homeClicked.png');
                    this.load.image('gameOver', 'assets/images/menu/gameOver.png');

                    // GAME ASSETS
                        // TILESETS
                            this.load.spritesheet('tiles','assets/tilesets/tiles.png', {frameWidth: 32, frameHeight: 32});
                            this.load.spritesheet('tiles2','assets/tilesets/tiles2.png', {frameWidth: 32, frameHeight: 32});
                            this.load.spritesheet('obstacles', 'assets/tilesets/objectTilesheet.png', {frameWidth: 32, frameHeight: 32});
                            this.load.spritesheet('scifi', 'assets/tilesets/scifi.png', {frameWidth: 32, frameHeight: 32});

                        // SPRITESHEETS
                            this.load.spritesheet('characters', 'assets/sprites/jojoSprites.png', { frameWidth: 32, frameHeight: 32 });
                            this.load.spritesheet('police', 'assets/sprites/policeSprites.png', { frameWidth: 32, frameHeight: 32 });
                            this.load.spritesheet('mech', 'assets/sprites/mech.png', { frameWidth: 65, frameHeight: 77 });
                            this.load.spritesheet('robots', 'assets/sprites/robots.png', { frameWidth: 32, frameHeight: 32 });  
                            this.load.spritesheet('sentinels', 'assets/sprites/sentinels.png', { frameWidth: 32, frameHeight: 32 });                                                        
                            this.load.spritesheet('explosion', 'assets/sprites/explosion.png', { frameWidth: 32, frameHeight: 32 });
                            this.load.spritesheet('fire', 'assets/sprites/fire.png', { frameWidth: 32, frameHeight: 32 });
                            this.load.spritesheet('jetpack', 'assets/sprites/jetpack.png', { frameWidth: 32, frameHeight: 32 });

                        // IMAGES
                            this.load.image('cursor', 'assets/images/cursor.png');
                            this.load.image('knife', 'assets/images/projectiles/knife.png');
                            this.load.image('mudaPunch', 'assets/images/projectiles/mudaPunch.png');
                            this.load.image('mudaSmash', 'assets/images/projectiles/mudaSmash.png');
                            this.load.image('oraPunch', 'assets/images/projectiles/oraPunch.png');
                            this.load.image('oraSmash', 'assets/images/projectiles/oraSmash.png');
                            this.load.image('bullet', 'assets/images/projectiles/bullet.png');
                            this.load.image('sniperBullet', 'assets/images/projectiles/sniperBullet.png');
                            this.load.image('laser', 'assets/images/projectiles/laser.png');
                            this.load.image('mechSniper', 'assets/images/projectiles/mechSniper.png');
                            this.load.image('shockBlast', 'assets/images/projectiles/shockBlast.png');
                            this.load.image('shotgun', 'assets/images/projectiles/shotgun.png');
                            this.load.image('missile', 'assets/images/projectiles/missile.png');

                            this.load.image('dioFilter', 'assets/images/effects/dioFilter.png');
                            this.load.image('jotaroFilter', 'assets/images/effects/jotaroFilter.png');
                            this.load.image('star', 'assets/images/effects/star.png');
                            this.load.image('blood', 'assets/images/effects/blood.png');
                            this.load.image('shock', 'assets/images/effects/shock.png');
                            this.load.image('ember', 'assets/images/effects/ember.png');

                        // AUDIO
                            this.load.audio('backgroundMusic', 'assets/audio/background.mp3');
                            this.load.audio('damageSFX', 'assets/audio/damage.mp3');
                            this.load.audio('pistolSFX', 'assets/audio/gunshot.mp3');
                            this.load.audio('rifleBurstSFX', 'assets/audio/rifleBurst.mp3');
                            this.load.audio('rifleSpraySFX', 'assets/audio/rifleSpray.mp3');
                            this.load.audio('sniperSFX', 'assets/audio/sniper.mp3');
                            this.load.audio('flamethrowerSFX', 'assets/audio/flamethrower.mp3');
                            this.load.audio('jetpackSFX', 'assets/audio/jetpack.mp3');                            
                            this.load.audio('explosionSFX', 'assets/audio/explosion.mp3');
                            this.load.audio('laserSFX', 'assets/audio/laser.mp3');
                            this.load.audio('laserBurstSFX', 'assets/audio/laserBurst.mp3');
                            this.load.audio('gatlingGunChargeSFX', 'assets/audio/gatlingGunCharge.mp3');
                            this.load.audio('gatlingGunSFX', 'assets/audio/gatlingGun.mp3');
                            this.load.audio('shockSFX', 'assets/audio/shock.mp3');
                            this.load.audio('mechStartSFX', 'assets/audio/mechStart.mp3');
                            this.load.audio('zawarudoDio', 'assets/audio/dio_zawarudo.mp3');
                            this.load.audio('zawarudoJotaro', 'assets/audio/jotaro_zawarudo.mp3');
                            this.load.audio('muda', 'assets/audio/muda.mp3');
                            this.load.audio('ora', 'assets/audio/ora.mp3');
                            this.load.audio('jotaroTimestop', 'assets/audio/jotaro_timestop.mp3');
                            this.load.audio('gameOverSFX', 'assets/audio/gameOver.mp3');
                },
            create: 
                function (){
                    // background
                    this.add.image(480, 350, 'background');

                    // title
                    this.add.image(480, 210, 'title');

                    // Start Button
                    var btnStart = this.add.sprite(480, 390, 'startButtonNormal').setInteractive();
                    btnStart.on('pointerover', function (event) { 
                        //btnStart.setTexture('imgButtonStartHover');
                    });
                    btnStart.on('pointerout', function (event) { 
                        btnStart.setTexture('startButtonNormal');
                    });
                    btnStart.on('pointerdown', function(event){
                        btnStart.setTexture('startButtonClicked');
                    }); 
                    btnStart.on('pointerup', function(event){
                        this.scene.start('arena');
                        currentScene = 2;
                    }, this); // start game

                    // controls button
                    var btnControls = this.add.sprite(480, 470, 'controlsButtonNormal').setInteractive();
                    btnControls.on('pointerout', function (event) { 
                        btnControls.setTexture('controlsButtonNormal');
                    });
                    btnControls.on('pointerdown', function(event){
                        btnControls.setTexture('controlsButtonClicked');
                    }); 
                    btnControls.on('pointerup', function(event){
                        this.scene.start('help');
                        currentScene = 1;
                    }, this);

                    cursor = this.add.image(this.input.mousePointer.x, this.input.mousePointer.y, 'cursor');
                },
            update: function(){
                cursor.setPosition(this.input.mousePointer.x, this.input.mousePointer.y);
            }
        });