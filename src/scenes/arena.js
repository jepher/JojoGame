var arenaScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
        function SceneArena (){
            Phaser.Scene.call(this, { key: 'arena' });
        },
    preload:
        function preload(){
            // default settings
            resetSettings(this);

            // get map
            this.load.tilemapTiledJSON('arena', 'assets/scenes/arena.json');           
        },
    create:
        function create(){
            //WORLD
                //load map
                map = this.make.tilemap({key: 'arena'});

                // MAP LAYER    
                var groundTiles = map.addTilesetImage('tiles');
                groundLayer = map.createDynamicLayer('Ground', groundTiles, 0, 0);
                groundLayer.setDepth(currentDepth);
                currentDepth++;

                // WALL LAYER
                var wallTiles = map.addTilesetImage('scifi');
                wallLayer = map.createDynamicLayer('Wall', wallTiles, 0, 0);
                wallLayer.setDepth(currentDepth);
                currentDepth++;
                wallLayer.setCollisionByExclusion([-1]);   
                
                // OBSTACLE LAYER
                var obstacleTiles = map.addTilesetImage('obstacles');
                obstacleLayer = map.createDynamicLayer('Obstacles', obstacleTiles, 0, 0);
                obstacleLayer.setDepth(currentDepth);
                currentDepth++;
                obstacleLayer.setCollisionByExclusion([-1]);    

                // PROJECTILE DEPTH
                projectileDepth = currentDepth;
                currentDepth++;

                // NPC DEPTH
                spawnDepth = currentDepth;
                currentDepth++;

                // BOSS DEPTH
                bossDepth = currentDepth;
                currentDepth++;

                //PLAYER
                playerDepth = currentDepth;
                // initializePlayer(new jotaro(this), 592, 672, this);
                initializePlayer(new dio(this), 560, 656, this);
                currentDepth++;

                // PASSABLE LAYER
                passableLayer = map.createDynamicLayer('Passable', obstacleTiles, 0, 0); 
                passableLayer.setDepth(currentDepth);
                currentDepth++;

                // ARIAL PROJECTILE DEPTH
                arialProjectileDepth = currentDepth;
                currentDepth++;

                // ARIAL SPAWN DEPTH
                arialSpawnDepth = currentDepth;
                currentDepth++;

                // TEXT DEPTH
                textDepth = currentDepth;
                currentDepth++;

            // NPCS
                // testing
                // initializeEnemy(new cop(), player.x + 100, player.y + 100, this);
                // initializeEnemy(new soldier(), player.x + 100, player.y + 100, this);
                // initializeEnemy(new swat(), player.x + 100, player.y + 100, this);            
                // initializeEnemy(new sniper(), player.x + 100, player.y + 100, this);
                // initializeEnemy(new pyro(this), player.x + 100, player.y + 100, this);
                // initializeEnemy(new robocop(this), player.x + 100, player.y + 100, this);
                // initializeEnemy(new mech(this), player.x + 100, player.y + 100, this);

                initializeEnemy(new cop(), player.x + 150, player.y + 150, this);
                initializeEnemy(new cop(), player.x + 150, player.y - 150, this);
                initializeEnemy(new cop(), player.x - 150, player.y + 150, this);
                initializeEnemy(new cop(), player.x - 150, player.y - 150, this);
                // initializeEnemy(new mech(this), player.x + 150, player.y, this);
                // initializeEnemy(new mech(this), player.x - 150, player.y, this);

            // CONTROLS
                //Add Keyboard Events
                initializeControls(this);

            //CAMERA
                initializeCamera(this);

            //OBJECT COLLISIONS
                initializeCollisions(this);
            
            // UI
                initializeUI(this);

            // AUDIO
                initializeAudio(this);
        },
    update: function(){
        update(this)
    }
});
