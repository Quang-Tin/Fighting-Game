import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  cursor: Phaser.Types.Input.Keyboard.CursorKeys | any;
  isJump: boolean = true;
  isEnemyJump: boolean = true;
  playRun: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | undefined;
  platforms: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | undefined;
  background: Phaser.GameObjects.Image | undefined;
  isAttacking: boolean | undefined = false;
  isBotAttacking: boolean | undefined = false;
  enemy: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | undefined;

  playerAttackBox: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | undefined;
  enemyAttackBox: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | undefined;

  playerHealthy: number = 100;
  enemyHealthy: number = 100;

  backgroundEnemyHealthy: Phaser.GameObjects.Rectangle | undefined;
  enemyHealthyBar: Phaser.GameObjects.Rectangle | undefined;


  backgroundPlayerHealthy: Phaser.GameObjects.Rectangle | undefined;
  playerHealthyBar: Phaser.GameObjects.Rectangle | undefined;

  constructor() {
    super("MainScene");
  }

  editorCreate(): void {
    //background
    this.background = this.add.image(0, 0, "background").setOrigin(0);
	
    this.background.setY(
      this.cameras.main.height / 2 - this.background.height / 2
    );
    this.background.setX(
      this.cameras.main.width / 2 - this.background.width / 2
    );

	let ward1 = this.add.rectangle(0,0, 100, this.background.displayHeight).setOrigin(0.5) as unknown as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
	this.physics.add.existing(ward1);
	ward1.body.setImmovable(true);
	ward1.body.setVelocityX(0);
	ward1.body.allowGravity = false

	let ward2 = this.add.rectangle(0,0, 100, this.background.displayHeight).setOrigin(0.5) as unknown as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
	this.physics.add.existing(ward2);
	ward2.body.allowGravity = false
	ward2.body.setImmovable(true);

	Phaser.Display.Align.To.LeftCenter(ward1, this.background);
	Phaser.Display.Align.To.RightCenter(ward2, this.background);

    this.platforms = this.physics.add.image(0, 0, "platform").setOrigin(0.5);
    this.platforms.setDisplaySize(this.background.width, 90);
    this.platforms.setImmovable(true);
    this.platforms.body.allowGravity = false;
    this.platforms.setVisible(false);

    Phaser.Display.Align.In.BottomCenter(
      this.platforms,
      this.background,
      0,
      -35
    );

    let configShop = {
      key: "ShopAnimation",
      frames: this.anims.generateFrameNumbers("Shop", {
        start: 0,
        end: 7,
      }),
      frameRate: 6,
      repeat: -1,
    };

    this.anims.create(configShop);

    Phaser.Display.Align.In.RightCenter(
      this.add.sprite(0, 0, "Shop").setScale(2.5).play("ShopAnimation"),
      this.background,
      -110,
      30
    );

    this.playRun = this.physics.add
      .sprite(0, 0, "Run")
      .setScale(2.0)
      .play("FallAnimation");
    this.playRun.body.velocity.y = 6;
    this.playRun.setBodySize(35, 90);

    Phaser.Display.Align.In.LeftCenter(this.playRun, this.background);

    this.enemy = this.physics.add
      .sprite(0, 0, "EnemyIdle")
      .setScale(2.0)
      .play("EnemyIdleAnimation", true);
    this.enemy.body.velocity.y = 6;
    this.enemy.setBodySize(35, 90);

    Phaser.Display.Align.In.RightCenter(this.enemy, this.background);

    this.playerAttackBox = this.add
      .rectangle(0, 0, 160, 80)
      .setVisible(false)
      .setFillStyle(
        0xff0000
      ) as unknown as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    this.physics.add.existing(this.playerAttackBox);
    this.playerAttackBox?.body.setAllowGravity(false);
    this.playerAttackBox?.body.setEnable(true);

    this.enemyAttackBox = this.add
      .rectangle(0, 0, 160, 80)
	  .setOrigin(0)
	  .setOrigin(0,0.5)
      .setVisible(false)
      .setFillStyle(
        0xff0000
      ) as unknown as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    this.physics.add.existing(this.enemyAttackBox);
    this.enemyAttackBox?.body.setAllowGravity(false);
    this.enemyAttackBox?.body.setEnable(true);

    this.physics.add.collider(
      this.playRun,
      this.platforms,
      this.collectPlayerGround,
      undefined,
      this
    );

    this.physics.add.collider(
      this.enemy,
      this.platforms,
      this.collectEnemyGround,
      undefined,
      this
    );

	this.physics.add.collider(
		this.playRun,
		ward1
	);

	this.physics.add.collider(
		this.playRun,
		ward2
	);

	this.physics.add.collider(
		this.enemy,
		ward1
	);

	this.physics.add.collider(
		this.enemy,
		ward2
	);


    this.physics.add.overlap(
      this.playerAttackBox,
      this.enemy,
      this.collectPlayerAttack,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.enemyAttackBox,
      this.playRun,
      this.collectEnemyAttack,
      undefined,
      this
    );

    this.events.emit("scene-awake");
  }

  collectEnemyAttack(enemyAttackBox: any, playerAttackBox: any) {
	if(this.enemyHealthy > 0 && !this.isBotAttacking) {
		this.enemy?.play("EnemyAttackAnimation").on(Phaser.Animations.Events.ANIMATION_COMPLETE, ()=>{
			this.isBotAttacking = false
		});		

		this.updatePlayerHealthy(10);

		this.isBotAttacking = true;
	}
	
  }

  collectPlayerGround(playRun: any, platforms: any) {
    if (this.isJump) {
      playRun?.play("IdleAnimation", true);

      this.isJump = false;
    }
  }

  collectPlayerAttack(playRun: any, enemy: any) {
    if (this.isAttacking) {
      this.playerAttackBox?.body.setEnable(false);

      this.updateEnemyHealthy(10);
    }
  }

  collectEnemyGround(playRun: any, platforms: any) {
    if (this.isEnemyJump) {
      this.isEnemyJump = false;
    }
  }

  update() {
    Phaser.Display.Align.In.RightCenter(
      this.playerAttackBox as Phaser.Types.Physics.Arcade.ImageWithDynamicBody,
      this.playRun as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
      50,
      -10
    );

    Phaser.Display.Align.In.LeftCenter(
      this.enemyAttackBox as Phaser.Types.Physics.Arcade.ImageWithDynamicBody,
      this.enemy as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
      50,
      -10
    );

    this.move();

    this.forwardPlayer();
  }

  move() {
    if (
      this.cursor.right.isDown &&
      this.playRun?.body.touching.down &&
      !this.isAttacking && this.playerHealthy > 0
    ) {
    
      this.playRun?.play("RunAnimation", true);
    
	  this.playRun.setScale(2, 2);
      this.playRun?.setVelocityX(120);
    } else if (
      this.cursor.left.isDown &&
      this.playRun?.body.touching.down &&
      !this.isAttacking && this.playerHealthy > 0
    ) {
      
      this.playRun?.play("RunLeftAnimation", true);
      
      this.playRun?.setVelocityX(-120);
    } else if (this.playRun?.body.touching.down && !this.isAttacking && this.playerHealthy > 0) {
      if (this.playRun?.anims.getName() !== "IdleAnimation") {
        this.playRun?.play("IdleAnimation");
      }

      this.playRun?.setVelocityX(0);
    }

    if (Number(this.playRun?.body.velocity.y) > 0 && this.playerHealthy > 0) {
      this.playRun?.play("FallAnimation");
    }

	if(this.cursor.up.isDown && !this.isJump) {
		this.isJump = true;

		this.playRun?.play("JumpAnimation", true);

		this.playRun?.body.setVelocityY(-330);
	}

    if (this.cursor.space.isDown && this.playRun?.body.touching.down && this.playerHealthy > 0) {
      this.playRun?.setVelocityX(0);

      if (this.playRun?.anims.getName() !== "AttackAnimation") {
        this.playRun
          ?.play("AttackAnimation")
          .on(Phaser.Animations.Events.ANIMATION_START, () => {
            this.physics.world.remove(
              (
                this
                  .playerAttackBox as Phaser.Types.Physics.Arcade.ImageWithDynamicBody
              ).body
            );
          })
          .on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.isAttacking = false;

            this.physics.world.add(
              (
                this
                  .playerAttackBox as Phaser.Types.Physics.Arcade.ImageWithDynamicBody
              ).body
            );
          });
      }

      this.isAttacking = true;
    }
  }

  create() {
    this.cursor = this.input.keyboard?.createCursorKeys();

    this.createPlayerBehaviorAnimation();

    this.createEnemyBehaviorAnimation();

    this.editorCreate();

    this.createHealthyBar();
  }

  createPlayerBehaviorAnimation() {
    //Player
    const configPlayerRun = {
      key: "RunAnimation",
      frames: this.anims.generateFrameNames("Run", {
        start: 0,
        end: 7,
      }),
	  
      frameRate: 8,
      repeat: -1,
    };

	const configPlayerRunLeft = {
		key: "RunLeftAnimation",
		frames: this.anims.generateFrameNames("Run", {
		  start: 8,
		  end: 15,
		}),
		
		frameRate: 8,
		repeat: -1,
	  };
	
    const configPlayerFall = {
      key: "FallAnimation",
      frames: this.anims.generateFrameNumbers("Fall", {
        start: 0,
        end: 1,
      }),
      frameRate: 2,
      repeat: -1,
    };

    const configPlayerAttack = {
      key: "AttackAnimation",
      frames: this.anims.generateFrameNumbers("Attack1", {
        start: 0,
        end: 11,
      }),
      frameRate: 20,
      repeat: 0,
    };

    const configPlayerIdle = {
      key: "IdleAnimation",
      frames: this.anims.generateFrameNumbers("Idle", {
        start: 0,
        end: 5,
      }),
      frameRate: 9,
      repeat: -1,
    };

    const configPlayerJump = {
      key: "JumpAnimation",
      frames: this.anims.generateFrameNumbers("Jump", {
        start: 0,
        end: 1,
      }),
      frameRate: 5,
      repeat: -1,
    };

	const configPlayerDeath = {
		key: "DeathAnimation",
		frames: this.anims.generateFrameNumbers("Death", {
		  start: 0,
		  end: 5,
		}),
		frameRate: 8,
		repeat: 0,
	};

	this.anims.create(configPlayerDeath);
    this.anims.create(configPlayerJump);
    this.anims.create(configPlayerIdle);
    this.anims.create(configPlayerAttack);
    this.anims.create(configPlayerRun);
    this.anims.create(configPlayerFall);
	this.anims.create(configPlayerRunLeft);
  }

  createEnemyBehaviorAnimation() {
    const configEnemyIdle = {
      key: "EnemyIdleAnimation",
      frames: this.anims.generateFrameNumbers("EnemyIdle", {
        start: 0,
        end: 3,
      }),
      frameRate: 9,
      repeat: -1,
    };

    const configEnemyRun = {
      key: "EnemyRunAnimation",
      frames: this.anims.generateFrameNumbers("EnemyRun", {
        start: 0,
        end: 7,
      }),
      frameRate: 8,
      repeat: 0,
    };

    const configEnemyDeath = {
      key: "EnemyDeathAnimation",
      frames: this.anims.generateFrameNumbers("EnemyDeath", {
        start: 0,
        end: 6,
      }),
      frameRate: 8,
      repeat: 0,
    };

    const configEnemyAttack = {
      key: "EnemyAttackAnimation",
      frames: this.anims.generateFrameNumbers("EnemyAttack", {
        start: 0,
        end: 7,
      }),
      frameRate: 8,
      repeat: 0,
    };

    this.anims.create(configEnemyIdle);
    this.anims.create(configEnemyRun);
    this.anims.create(configEnemyDeath);
    this.anims.create(configEnemyAttack);
  }

  createHealthyBar() {
    // Player
   this.backgroundPlayerHealthy = this.add
      .rectangle(0, 0, 400, 35)
      .setFillStyle(0xff0000)
      .setStrokeStyle(5, 0xffffff);

    this.playerHealthyBar = this.add
      .rectangle(
        0,
        0,
        this.backgroundPlayerHealthy.displayWidth,
        this.backgroundPlayerHealthy.displayHeight
      )
	  .setOrigin(1)
      .setFillStyle(0x776af5);

    Phaser.Display.Align.In.TopLeft(
	  this.backgroundPlayerHealthy,
      this.background as Phaser.GameObjects.Image,
      -50,
      -30
    );

    Phaser.Display.Align.In.TopRight(
		this.playerHealthyBar,
		this.backgroundPlayerHealthy
    );

    // Enemy
    this.backgroundEnemyHealthy = this.add
      .rectangle(0, 0, 400, 35)
      .setFillStyle(0xff0000)
      .setStrokeStyle(5, 0xffffff);

    this.enemyHealthyBar = this.add
      .rectangle(
        0,
        0,
        this.backgroundEnemyHealthy.displayWidth,
        this.backgroundEnemyHealthy.displayHeight
      )
      .setOrigin(0)
      .setFillStyle(0x776af5);

    Phaser.Display.Align.In.TopRight(
      this.backgroundEnemyHealthy,
      this.background as Phaser.GameObjects.Image,
      -50,
      -30
    );

    Phaser.Display.Align.In.TopLeft(
      this.enemyHealthyBar,
      this.backgroundEnemyHealthy
    );

    // Timer
    const backgroundTimer = this.add
      .rectangle(0, 0, 120, 70)
      .setFillStyle(0x000000)
      .setStrokeStyle(3, 0xffffff);
    const timeText = this.add.text(0, 0, "∞", { fontSize: 50 });

    Phaser.Display.Align.In.TopCenter(
      backgroundTimer,
      this.background as Phaser.GameObjects.Image,
      0,
      -10
    );

    Phaser.Display.Align.In.Center(timeText, backgroundTimer);
  }

  updateEnemyHealthy(healthy: number) {
    if (this.enemyHealthy > 0) {
      this.enemyHealthy -= healthy;

      this.enemyHealthyBar?.setDisplaySize(
        (this.enemyHealthy / 100) *
          (this.backgroundEnemyHealthy?.displayWidth ?? 1),
        this.enemyHealthyBar?.displayHeight
      );

      if (this.enemyHealthy <= 0) {
		this.enemy?.setVelocityX(0);

		if(this.enemy?.anims.getName() !== "EnemyDeathAnimation") {
			this.enemy?.play("EnemyDeathAnimation");
		}
      }
    }
  }


  updatePlayerHealthy(healthy: number) {
    if (this.playerHealthy > 0) {
      this.playerHealthy -= healthy;

      this.playerHealthyBar?.setDisplaySize(
        (this.playerHealthy / 100) *
          (this.backgroundPlayerHealthy?.displayWidth ?? 1),
        this.playerHealthyBar?.displayHeight
      );

      if (this.playerHealthy <= 0) {
		this.playRun?.body.setVelocityX(0);
		
		if(this.playRun?.anims.getName() !== "DeathAnimation") {
			this.playRun?.play("DeathAnimation", true);
		}

		this.enemy?.play("EnemyIdleAnimation", true);
      }
    }
  }

  forwardPlayer() {
    if (this.enemyHealthy > 0) {  
	  if(this.enemy?.body.touching.down && !this.isBotAttacking) {
		this.enemyMove();
	  }else {
		this.enemy?.setVelocityX(0);
	  }
    }
  }

  enemyMove() {
    this.physics.moveTo(
      this.enemy as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
	  (this.playRun as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody).body.x,
	  
      500
    );

    if (!this.isBotAttacking) {
      this.enemy?.play("EnemyRunAnimation", true);
    }
  }
}
