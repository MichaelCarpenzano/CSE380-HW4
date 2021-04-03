import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Debug from "../../Wolfie2D/Debug/Debug";
import GameNode, { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import { HW4_Events } from "../hw4_enums";
import Fall from "./PlayerStates/Fall";
import Idle from "./PlayerStates/Idle";
import InAir from "./PlayerStates/InAir";
import Jump from "./PlayerStates/Jump";
import Run from "./PlayerStates/Run";
import Walk from "./PlayerStates/Walk";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";

export enum PlayerType {
    PLATFORMER = "platformer",
    TOPDOWN = "topdown"
}

export enum PlayerStates {
    IDLE = "idle",
    WALK = "walk",
	RUN = "run",
	JUMP = "jump",
    FALL = "fall",
	PREVIOUS = "previous"
}

export default class PlayerController extends StateMachineAI {
    protected owner: GameNode;
    velocity: Vec2 = Vec2.ZERO;
	speed: number = 200;
	MIN_SPEED: number = 200;
    MAX_SPEED: number = 300;
    tilemap: OrthogonalTilemap;
    coin: Sprite;

    initializeAI(owner: GameNode, options: Record<string, any>){
        this.owner = owner;

        this.initializePlatformer();

        this.tilemap = this.owner.getScene().getTilemap(options.tilemap) as OrthogonalTilemap;

        // HOMEWORK 4 - TODO
        /*
            Use this coin sprite to perform an animation when the player hits a coin block.

            The coin should move up from the block and fade out of view.

            Additionally, you should edit the PlayerController and its states so that
            when you collide with a coin block on the tilemap, it will perform this animation
            and let the scene know that the player collided with a coin block.

            The coin block that the player collides with should then be set to be a dark coin block.
            Look at the tileset image for reference.
        */
        this.coin = this.owner.getScene().add.sprite("coin", "coinLayer");
        this.coin.position.set(-100, -100);
        this.coin.scale.set(2, 2);
    }

    initializePlatformer(): void {
        this.speed = 400;

        let idle = new Idle(this, this.owner);
		this.addState(PlayerStates.IDLE, idle);
		let walk = new Walk(this, this.owner);
		this.addState(PlayerStates.WALK, walk);
		let run = new Run(this, this.owner);
		this.addState(PlayerStates.RUN, run);
		let jump = new Jump(this, this.owner);
        this.addState(PlayerStates.JUMP, jump);
        let fall = new Fall(this, this.owner);
        this.addState(PlayerStates.FALL, fall);
        
        this.initialize(PlayerStates.IDLE);
    }

    changeState(stateName: string): void {
        // If we jump or fall, push the state so we can go back to our current state later
        // unless we're going from jump to fall or something
        if((stateName === PlayerStates.JUMP || stateName === PlayerStates.FALL) && !(this.stack.peek() instanceof InAir)){
            this.stack.push(this.stateMap.get(stateName));
        }

        super.changeState(stateName);
    }

    update(deltaT: number): void {
		super.update(deltaT);

        if(this.owner.onCeiling){
            console.log("hit ceil");
            //console.log(this.tilemap.getTileAtRowCol(new Vec2(this.tilemap.getColRowAt(this.owner.position).x, this.tilemap.getColRowAt(this.owner.position).y-1)));
            if(this.tilemap.getTileAtRowCol(new Vec2(this.tilemap.getColRowAt(this.owner.position).x, this.tilemap.getColRowAt(this.owner.position).y-1)) == 17){
                
                this.coin.tweens.add("collect", {
                    startDelay: 0,
                    duration: 500,
                    effects: [
                        {
                            property: TweenableProperties.posY,
                            start: this.owner.position.y,
                            end: this.owner.position.y - 150,
                            ease: EaseFunctionType.OUT_SINE
                        },
                        {
                            property: TweenableProperties.posX,
                            start: this.owner.position.x,
                            end: this.owner.position.x,
                            ease: EaseFunctionType.OUT_SINE
                        },
                        {
                            property: "rotation",
                            start: 0,
                            end: 2*Math.PI,
                            ease: EaseFunctionType.IN_OUT_QUAD
                        },
                        {
                            property: TweenableProperties.alpha,
                            start: 1,
                            end: 0,
                            ease: EaseFunctionType.IN_OUT_QUAD
                        }
                    ],
                    onEnd: HW4_Events.PLAYER_HIT_COIN_BLOCK
                });
                
                console.log("hit block");
                this.coin.tweens.play("collect");
                this.tilemap.setTileAtRowCol(new Vec2(this.tilemap.getColRowAt(this.owner.position).x, this.tilemap.getColRowAt(this.owner.position).y-1), 18);
            }
        }

		if(this.currentState instanceof Jump){
			Debug.log("playerstate", "Player State: Jump");
		} else if (this.currentState instanceof Walk){
			Debug.log("playerstate", "Player State: Walk");
		} else if (this.currentState instanceof Run){
			Debug.log("playerstate", "Player State: Run");
		} else if (this.currentState instanceof Idle){
			Debug.log("playerstate", "Player State: Idle");
		} else if(this.currentState instanceof Fall){
            Debug.log("playerstate", "Player State: Fall");
        }
	}
}