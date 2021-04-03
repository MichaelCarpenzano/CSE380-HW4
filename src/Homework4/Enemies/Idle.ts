import GameEvent from "../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { HW4_Events } from "../hw4_enums";
import { EnemyStates } from "./EnemyController";
import OnGround from "./OnGround";

/**
 * The idle enemy state. Enemies don't do anything until the player comes near them. 
 */
export default class Idle extends OnGround {
	time: number;

	onEnter(): void {
		this.parent.speed = this.parent.speed;
		(<AnimatedSprite>this.owner).animation.play("IDLE", true);
		this.time = Date.now();
	}

	onExit(): Record<string, any> {
		(<AnimatedSprite>this.owner).animation.stop();
		return {};
	}

	handleInput(event: GameEvent) {
		if(event.type === HW4_Events.PLAYER_MOVE){
			let pos = event.data.get("position");
			if(this.owner.position.x - pos.x < (64*10) && !(this.parent.agro)){
				this.finished(EnemyStates.WALK);
			}
		}
		if(this.parent.agro && (Date.now() - this.time > 500)){
			this.finished(EnemyStates.JUMP);
			this.parent.velocity.y = -300;
		}

	}

	update(deltaT: number): void {
		super.update(deltaT);
		
		this.parent.velocity.x = 0;

		this.owner.move(this.parent.velocity.scaled(deltaT));
	}
}