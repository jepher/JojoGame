function explosion(x, y, game, scale = 1){
    var effect = game.physics.add.sprite(x, y, "explosion");
    effect.setDepth(projectileDepth);   
    effect.setSize(effect.body.width * scale, effect.body.height * scale);
    effect.setDisplaySize(effect.body.width * scale, effect.body.height * scale);
    effect.damage = 10;
    effect.knockback = 200;
    effect.canMove = true;
    enemies.forEach(function(element){
        game.physics.add.overlap(element, effect, function(){
            // knockback
            if(!element.type.notKnockbackable){
                var angle = BetweenPoints(element, effect) + Math.PI;
                velocityFromRotation(angle, effect.knockback, element.body.velocity);
                element.knockbacked = true;
                timerEvents.push(game.time.addEvent({delay: 100, callback: function(){ 
                    element.knockbacked = false;
                }}));
            }

            if(element.type.key != 'pyro' && element.type.key != 'bomber' && element.type.key != 'robot' && 
            element.type.key != 'sentinel' && element.type.key != 'mech'){
                // damage
                if(!element.invulnerable){
                    damageSFX.play();

                    element.emitter.setVisible(true); // blood effect
            
                    timerEvents.push(game.time.addEvent({delay: 200, callback: function(){ // end blood effect
                        element.emitter.setVisible(false);
                    }}));

                    element.health -= effect.damage; // decrease health
                    element.invulnerable = true;
                    timerEvents.push(game.time.addEvent({delay: 200, callback: function(){
                        element.invulnerable = false;
                    }}));
                }
            }
        }, null, game);
    })
    game.physics.add.overlap(player, effect, function(){
        // knockback
        var angle = BetweenPoints(player, effect) + Math.PI;
        velocityFromRotation(angle, effect.knockback, player.body.velocity);
        player.knockbacked = true;
        timerEvents.push(game.time.addEvent({delay: 100, callback: function(){ 
            player.knockbacked = false;
        }}));

        // damage
        if(!player.invulnerable){
            player.damageEmitter.setVisible(true); // blood effect
    
            timerEvents.push(game.time.addEvent({delay: 200, callback: function(){ // end blood effect
                player.damageEmitter.setVisible(false);
            }}));

            player.health -= effect.damage; // decrease health
            player.invulnerable = true;
            timerEvents.push(game.time.addEvent({delay: 200, callback: function(){
                player.invulnerable = false;
            }}));
        }
    }, null, game);
    player.type.addOverlap(effect);

    effect.startTime = game.sys.game.loop.time;
    effect.delay = 50;
    effect.currentFrame = 1;
    effect.maxFrames = 16;

    // initialize animation
    explosionSFX.play();
    for(var i = 1; i <= effect.maxFrames; i++){
        if(game.anims.get('explosionFrame' + i) == undefined){
            game.anims.create({
            key: 'explosionFrame' + i,
            frames: [ { key: 'explosion', frame: i - 1} ],
            frameRate: 20
            });
        }
    }

    effect.update = function(){
        if(effect.currentFrame == 0 || game.sys.game.loop.time - effect.startTime >= effect.delay && effect.canMove){
            effect.anims.play('explosionFrame' + effect.currentFrame, true);
            effect.currentFrame++;
            effect.startTime = game.sys.game.loop.time;
        }
        
        if(effect.currentFrame == effect.maxFrames){
            effects.splice(effects.indexOf(effect), 1);
            effect.destroy();
        }
    }
    effects.push(effect);

}