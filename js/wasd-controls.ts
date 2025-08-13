import {quat, vec3} from "gl-matrix";
import {Component, Object3D} from "@wonderlandengine/api";
import {property} from "@wonderlandengine/api/decorators.js";
import {AnimationRetarget} from "./AnimationRetarget.js";

const _direction = new Float32Array(3);
const _tempDualQuat = new Float32Array(8);

// temps for rotation smoothing
const _camQuat = quat.create();
const _targetYawQuat = quat.create();
const _currentQuat = quat.create();
const _smoothedQuat = quat.create();

/**
 * Simplified movement component: plays idle or run animations.
 * Uses pointer events for mobile and desktop joystick interoperability.
 */
export class WasdControlsCustomComponent extends Component {
	static TypeName = "wasd-controls-custom";

	/** Movement speed in m/s. */
	@property.float(0.1)
	speed!: number;

	/** Flag for only moving the object on the global x & z planes */
	@property.bool(false)
	lockY!: boolean;

	/** Object of which the orientation is used to determine forward direction */
	@property.object()
	nonVrCamera!: Object3D | null;

	/** Object of which the orientation is used to determine forward direction */
	@property.object()
	vrCamera!: Object3D | null;

	@property.object()
	Avatar!: Object3D | null;

	headObject: Object3D | null = null;

	/** Enables on-screen mobile joystick for locomotion */
	@property.bool(false)
	mobileJoystick!: boolean;

	// Keyboard controls
	right = false;
	down = false;
	left = false;
	up = false;

	public isMoving = false;

	reTargetComp: AnimationRetarget | null = null;

	// Joystick state
	private joystickContainer: HTMLDivElement | null = null;
	private joystickOuter: HTMLDivElement | null = null;
	private joystickInner: HTMLDivElement | null = null;
	private joystickDirection: [number, number] = [0, 0];
	private joystickRadius = 50;
	private joystickCenter: {x: number; y: number} = {x: 0, y: 0};
	private activePointerId: number | null = null;

	start() {
		this.headObject = this.headObject || this.object;
	}

	onActivate() {
		window.addEventListener("keydown", this.press);
		window.addEventListener("keyup", this.release);

		if (this.mobileJoystick) {
			this.createJoystick();
		}

		this.headObject = this.nonVrCamera;

		if (this.vrCamera) {
			this.engine.onXRSessionStart.add(this.onSessionStart);
			this.engine.onXRSessionEnd.add(this.onDeactivate);
		}
	}

	onSessionStart() {
		this.headObject = this.vrCamera;
	}

	onSessionEnd() {
		this.headObject = this.nonVrCamera;
	}

	onDeactivate() {
		window.removeEventListener("keydown", this.press);
		window.removeEventListener("keyup", this.release);

		if (this.mobileJoystick) {
			this.removeJoystick();
		}

		if (this.vrCamera) {
			this.engine.onXRSessionStart.remove(this.onSessionStart);
			this.engine.onXRSessionEnd.remove(this.onDeactivate);
		}
	}

	update(dt: number) {
		// Determine raw movement input from keyboard or joystick
		vec3.zero(_direction);

		// Keyboard input
		if (this.up) _direction[2] -= 1;
		if (this.down) _direction[2] += 1;
		if (this.left) _direction[0] -= 1;
		if (this.right) _direction[0] += 1;

		// Joystick input overrides keyboard if active
		if (
			this.mobileJoystick &&
			(this.joystickDirection[0] !== 0 || this.joystickDirection[1] !== 0)
		) {
			_direction[0] = this.joystickDirection[0];
			_direction[2] = this.joystickDirection[1];
		}

		const moving = vec3.squaredLength(_direction) > 0;

		// Normalize and scale by speed if moving
		if (moving) {
			vec3.normalize(_direction, _direction);
			vec3.scale(_direction, _direction, this.speed);

			// Rotate by camera orientation so forward is head-relative
			this.headObject!.getTransformWorld(_tempDualQuat);
			quat.copy(_camQuat, _tempDualQuat.subarray(0, 4));
			vec3.transformQuat(_direction, _direction, _camQuat);

			if (this.lockY) {
				_direction[1] = 0;
				vec3.normalize(_direction, _direction);
				vec3.scale(_direction, _direction, this.speed);
			}
		}

		if (moving !== this.isMoving) {
			this.isMoving = moving;
		}

		// Smooth rotate toward movement direction if moving
		if (moving) {
			const horizLen2 =
				_direction[0] * _direction[0] + _direction[2] * _direction[2];
			if (horizLen2 > 1e-6) {
				const yaw = Math.atan2(_direction[0], _direction[2]) + Math.PI;
				quat.setAxisAngle(_targetYawQuat, [0, 1, 0], yaw);

				this.Avatar.getTransformLocal(_tempDualQuat);
				quat.copy(_currentQuat, _tempDualQuat.subarray(0, 4));

				// Slerp factor based on fixed speed
				const t = Math.min(1, 5 * dt);
				quat.slerp(_smoothedQuat, _currentQuat, _targetYawQuat, t);

				this.Avatar.setRotationLocal(_smoothedQuat);
			}

			// Translate the object
			this.Avatar.translateLocal(_direction);
		}
	}

	press = (e: KeyboardEvent) => {
		if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "KeyZ") {
			this.up = true;
		} else if (e.code === "ArrowRight" || e.code === "KeyD") {
			this.right = true;
		} else if (e.code === "ArrowDown" || e.code === "KeyS") {
			this.down = true;
		} else if (
			e.code === "ArrowLeft" ||
			e.code === "KeyA" ||
			e.code === "KeyQ"
		) {
			this.left = true;
		}
	};

	release = (e: KeyboardEvent) => {
		if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "KeyZ") {
			this.up = false;
		} else if (e.code === "ArrowRight" || e.code === "KeyD") {
			this.right = false;
		} else if (e.code === "ArrowDown" || e.code === "KeyS") {
			this.down = false;
		} else if (
			e.code === "ArrowLeft" ||
			e.code === "KeyA" ||
			e.code === "KeyQ"
		) {
			this.left = false;
		}
	};

	// ---------- Joystick creation and pointer handling ----------

	private createJoystick() {
		this.joystickContainer = document.createElement("div");
		this.joystickContainer.style.position = "absolute";
		this.joystickContainer.style.left = "20px";
		this.joystickContainer.style.bottom = "20px";
		this.joystickContainer.style.width = `${this.joystickRadius * 2}px`;
		this.joystickContainer.style.height = `${this.joystickRadius * 2}px`;
		this.joystickContainer.style.touchAction = "none";

		this.joystickOuter = document.createElement("div");
		this.joystickOuter.style.position = "absolute";
		this.joystickOuter.style.width = `${this.joystickRadius * 2}px`;
		this.joystickOuter.style.height = `${this.joystickRadius * 2}px`;
		this.joystickOuter.style.border = "2px solid #555";
		this.joystickOuter.style.borderRadius = "50%";
		this.joystickOuter.style.background = "rgba(200,200,200,0.5)";
		this.joystickOuter.style.boxSizing = "border-box";

		this.joystickInner = document.createElement("div");
		const innerRadius = this.joystickRadius;
		this.joystickInner.style.position = "absolute";
		this.joystickInner.style.width = `${innerRadius * 2}px`;
		this.joystickInner.style.height = `${innerRadius * 2}px`;
		this.joystickInner.style.border = "2px solid #333";
		this.joystickInner.style.borderRadius = "50%";
		this.joystickInner.style.background = "rgba(100,100,100,0.8)";
		this.joystickInner.style.left = `${
			this.joystickRadius - innerRadius
		}px`;
		this.joystickInner.style.top = `${this.joystickRadius - innerRadius}px`;
		this.joystickInner.style.boxSizing = "border-box";

		this.joystickContainer.appendChild(this.joystickOuter);
		this.joystickContainer.appendChild(this.joystickInner);
		document.body.appendChild(this.joystickContainer);

		const rect = this.joystickContainer.getBoundingClientRect();
		this.joystickCenter = {
			x: rect.left + this.joystickRadius,
			y: rect.top + this.joystickRadius,
		};

		this.joystickContainer.addEventListener(
			"pointerdown",
			this.onJoystickPointerDown,
			{passive: false},
		);
		this.joystickContainer.addEventListener(
			"pointermove",
			this.onJoystickPointerMove,
			{passive: false},
		);
		this.joystickContainer.addEventListener(
			"pointerup",
			this.onJoystickPointerUp,
			{passive: false},
		);
		this.joystickContainer.addEventListener(
			"pointercancel",
			this.onJoystickPointerUp,
			{passive: false},
		);
	}

	private removeJoystick() {
		if (this.joystickContainer) {
			this.joystickContainer.removeEventListener(
				"pointerdown",
				this.onJoystickPointerDown,
			);
			this.joystickContainer.removeEventListener(
				"pointermove",
				this.onJoystickPointerMove,
			);
			this.joystickContainer.removeEventListener(
				"pointerup",
				this.onJoystickPointerUp,
			);
			this.joystickContainer.removeEventListener(
				"pointercancel",
				this.onJoystickPointerUp,
			);
			document.body.removeChild(this.joystickContainer);
			this.joystickContainer = null;
			this.joystickOuter = null;
			this.joystickInner = null;
		}
		this.joystickDirection = [0, 0];
		this.activePointerId = null;
	}

	private onJoystickPointerDown = (e: PointerEvent) => {
		//e.preventDefault();
		if (this.activePointerId !== null) return;

		this.activePointerId = e.pointerId;
		if (this.joystickContainer) {
			const rect = this.joystickContainer.getBoundingClientRect();
			this.joystickCenter = {
				x: rect.left + this.joystickRadius,
				y: rect.top + this.joystickRadius,
			};
		}
		this.joystickContainer!.setPointerCapture(this.activePointerId);
		this.updateJoystick(e.clientX, e.clientY);
	};

	private onJoystickPointerMove = (e: PointerEvent) => {
		//e.preventDefault();
		if (
			this.activePointerId === null ||
			e.pointerId !== this.activePointerId
		)
			return;
		this.updateJoystick(e.clientX, e.clientY);
	};

	private onJoystickPointerUp = (e: PointerEvent) => {
		//e.preventDefault();
		if (
			this.activePointerId === null ||
			e.pointerId !== this.activePointerId
		)
			return;
		this.joystickContainer!.releasePointerCapture(this.activePointerId);
		this.activePointerId = null;
		this.resetJoystick();
	};

	private updateJoystick(clientX: number, clientY: number) {
		if (!this.joystickInner) return;
		const dx = clientX - this.joystickCenter.x;
		const dy = clientY - this.joystickCenter.y;
		const dist = Math.hypot(dx, dy);
		const clampedDist = Math.min(dist, this.joystickRadius);
		const angle = Math.atan2(dy, dx);
		const innerX =
			this.joystickRadius -
			this.joystickInner.offsetWidth / 2 +
			clampedDist * Math.cos(angle);
		const innerY =
			this.joystickRadius -
			this.joystickInner.offsetHeight / 2 +
			clampedDist * Math.sin(angle);
		this.joystickInner.style.left = `${innerX}px`;
		this.joystickInner.style.top = `${innerY}px`;

		const normX = dx / this.joystickRadius;
		const normY = dy / this.joystickRadius;
		// Fix: map upward drag to negative Z, so remove inversion
		this.joystickDirection = [normX, normY];
	}

	private resetJoystick() {
		if (!this.joystickInner) return;
		this.joystickInner.style.left = `${
			this.joystickRadius - this.joystickInner.offsetWidth / 2
		}px`;
		this.joystickInner.style.top = `${
			this.joystickRadius - this.joystickInner.offsetHeight / 2
		}px`;
		this.joystickDirection = [0, 0];
	}
}
