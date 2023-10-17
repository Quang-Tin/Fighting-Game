import Phaser from "phaser";
import assetPackUrl from "../static/assets/asset-pack.json";
import MainScene from "./scenes/MainScene";

class Boot extends Phaser.Scene {

    constructor() {
        super("Boot");
    }

    preload() {
        this.load.pack("pack", assetPackUrl);
    }

    create() {

       this.scene.start("MainScene");
    }
}

window.addEventListener('load', function () {
	
	const game = new Phaser.Game({
		width: 1280,
		height: 720,
		backgroundColor: "#2f2f2f",
		scale: {
			mode: Phaser.Scale.ScaleModes.FIT,
			autoCenter: Phaser.Scale.Center.CENTER_BOTH,
			min:{
				width: 1024,
				height: 1024
			}
			
		},
		physics: {
			default: 'arcade',
			arcade: {
				gravity: { y: 300 },
				debug: true
			}
		},
		scene: [Boot, MainScene]
	});

	game.scene.start("Boot");
});