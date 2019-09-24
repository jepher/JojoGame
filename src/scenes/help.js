var overlay;
var title;
var text;
var titles = ['controlsTitle', 'mechanicsTitle', 'alliesTitle'];
var texts = ['controls', 'mechanics', 'allies'];

var background;
var btnHome;

var helpScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
        function SceneHelp ()
        {
            Phaser.Scene.call(this, { key: 'help' });
        },

    preload: 
        function (){
            currentPage = 0;
        },
    create: 
        function (){
            // background
            this.add.image(480, 350, 'background');

            // overlay
            overlay = this.add.image(480, 350, 'overlay');
            overlay.setAlpha(.4, .4, .4, .4);

            // title
            title = this.add.image(480, 100, 'controlsTitle');

            // text
            text = this.add.image(480, 380, 'controls');
            //printControls(this);

            // home button
            btnHome = this.add.sprite(50, 50, 'homeButtonNormal').setInteractive();
            btnHome.on('pointerout', function (event) { 
                btnHome.setTexture('homeButtonNormal');
            });
            btnHome.on('pointerdown', function(event){
                btnHome.setTexture('homeButtonClicked');
            }); 
            btnHome.on('pointerup', function(event){
                this.scene.start('menu');
                currentScene = 0;
            }, this); 

            cursor = this.add.image(this.input.mousePointer.x, this.input.mousePointer.y, 'cursor');
        },
    update:
        function(){
            cursor.setPosition(this.input.mousePointer.x, this.input.mousePointer.y);
        }
});

