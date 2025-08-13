const retargetMap: Record<string, string> = {
	// Root
	hips: "Avatar_Hips",

	// Spine
	spine: "Avatar_Spine",
	chest: "Avatar_Spine1",
	upperChest: "Avatar_Spine2",

	// Neck & Head
	neck: "Avatar_Neck",
	head: "Avatar_Head",

	// Eyes
	leftEye: "Avatar_EyeL",
	rightEye: "Avatar_EyeR",

	// Left Arm
	leftShoulder: "Avatar_LeftShoulder",
	leftUpperArm: "Avatar_LeftArm",
	leftLowerArm: "Avatar_LeftForeArm",
	leftHand: "Avatar_LeftHand",

	// Left Thumb
	leftThumbMetacarpal: "Avatar_LeftHandThumb1",
	leftThumbProximal: "Avatar_LeftHandThumb2",
	leftThumbDistal: "Avatar_LeftHandThumb3",

	// Left Index
	leftIndexProximal: "Avatar_LeftHandIndex1",
	leftIndexIntermediate: "Avatar_LeftHandIndex2",
	leftIndexDistal: "Avatar_LeftHandIndex3",

	// Left Middle
	leftMiddleProximal: "Avatar_LeftHandMiddle1",
	leftMiddleIntermediate: "Avatar_LeftHandMiddle2",
	leftMiddleDistal: "Avatar_LeftHandMiddle3",

	// Left Ring
	leftRingProximal: "Avatar_LeftHandRing1",
	leftRingIntermediate: "Avatar_LeftHandRing2",
	leftRingDistal: "Avatar_LeftHandRing3",

	// Left Little
	leftLittleProximal: "Avatar_LeftHandPinky1",
	leftLittleIntermediate: "Avatar_LeftHandPinky2",
	leftLittleDistal: "Avatar_LeftHandPinky3",

	// Right Arm
	rightShoulder: "Avatar_RightShoulder",
	rightUpperArm: "Avatar_RightArm",
	rightLowerArm: "Avatar_RightForeArm",
	rightHand: "Avatar_RightHand",

	// Right Thumb
	rightThumbMetacarpal: "Avatar_RightHandThumb1",
	rightThumbProximal: "Avatar_RightHandThumb2",
	rightThumbDistal: "Avatar_RightHandThumb3",

	// Right Index
	rightIndexProximal: "Avatar_RightHandIndex1",
	rightIndexIntermediate: "Avatar_RightHandIndex2",
	rightIndexDistal: "Avatar_RightHandIndex3",

	// Right Middle
	rightMiddleProximal: "Avatar_RightHandMiddle1",
	rightMiddleIntermediate: "Avatar_RightHandMiddle2",
	rightMiddleDistal: "Avatar_RightHandMiddle3",

	// Right Ring
	rightRingProximal: "Avatar_RightHandRing1",
	rightRingIntermediate: "Avatar_RightHandRing2",
	rightRingDistal: "Avatar_RightHandRing3",

	// Right Little
	rightLittleProximal: "Avatar_RightHandPinky1",
	rightLittleIntermediate: "Avatar_RightHandPinky2",
	rightLittleDistal: "Avatar_RightHandPinky3",

	// Left Leg
	leftUpperLeg: "Avatar_LeftUpLeg",
	leftLowerLeg: "Avatar_LeftLeg",
	leftFoot: "Avatar_LeftFoot",
	leftToes: "Avatar_LeftToeBase",

	// Right Leg
	rightUpperLeg: "Avatar_RightUpLeg",
	rightLowerLeg: "Avatar_RightLeg",
	rightFoot: "Avatar_RightFoot",
	rightToes: "Avatar_RightToeBase",
};

const fingerRemap: Record<
	string,
	[axis: [number, number, number], angle: number]
> = {
	// index
	Avatar_LeftHandIndex1: [[1, 0, 0], 0],
	Avatar_LeftHandIndex2: [[1, 0, 0], 0],
	Avatar_LeftHandIndex3: [[1, 0, 0], 0],
	Avatar_RightHandIndex1: [[1, 0, 0], 0],
	Avatar_RightHandIndex2: [[1, 0, 0], 0],
	Avatar_RightHandIndex3: [[1, 0, 0], 0],

	// middle
	Avatar_LeftHandMiddle1: [[1, 0, 0], 0],
	Avatar_LeftHandMiddle2: [[1, 0, 0], 0],
	Avatar_LeftHandMiddle3: [[1, 0, 0], 0],
	Avatar_RightHandMiddle1: [[1, 0, 0], 0],
	Avatar_RightHandMiddle2: [[1, 0, 0], 0],
	Avatar_RightHandMiddle3: [[1, 0, 0], 0],

	// ring
	Avatar_LeftHandRing1: [[1, 0, 0], 0],
	Avatar_LeftHandRing2: [[1, 0, 0], 0],
	Avatar_LeftHandRing3: [[1, 0, 0], 0],
	Avatar_RightHandRing1: [[1, 0, 0], 0],
	Avatar_RightHandRing2: [[1, 0, 0], 0],
	Avatar_RightHandRing3: [[1, 0, 0], 0],
	Avatar_LeftHandPinky1: [[1, 0, 0], 0],
	Avatar_LeftHandPinky2: [[1, 0, 0], 0],
	Avatar_LeftHandPinky3: [[1, 0, 0], 0],
	Avatar_RightHandPinky1: [[1, 0, 0], 0],
	Avatar_RightHandPinky2: [[1, 0, 0], 0],
	Avatar_RightHandPinky3: [[1, 0, 0], 0],

	Avatar_LeftArm: [[1, 0, 0], Math.PI / 2],
	Avatar_RightArm: [[1, 0, 0], Math.PI / 2],

	Avatar_LeftHand: [[1, 0, 0], -Math.PI * 0.5],
	Avatar_RightHand: [[1, 0, 0], -Math.PI * 0.5],
};

import {Component, Object3D} from "@wonderlandengine/api";
import {property} from "@wonderlandengine/api/decorators.js";
import {quat, vec3} from "gl-matrix";

/**
 * AnimationRetarget
 */
export class AnimationRetarget extends Component {
	static TypeName = "AnimationRetarget";

	@property.object()
	idle!: Object3D;

	@property.object()
	run!: Object3D;

	@property.object()
	to!: Object3D;

	accumulatedTime = 0;

	toPosition: vec3 = vec3.create();
	toPositionCached: vec3 = vec3.create();

	// add these fields to your class (tweak defaults to taste)
	_moveCheckInterval = 0.001; // seconds (≈ 60ms, matches your network update)
	_speedThreshold = 1.0; // units/sec — tune to your scale
	_velocityEMA = 0; // exponential moving average of speed
	_velocityAlpha = 1.0; // smoothing factor (0..1)
	_minRunHold = 0.068; // seconds to keep "run" once triggered (prevents flicker)
	_runHoldTimer = 0; // countdown timer while in run state

	_lastCheckPos: vec3 = vec3.create();
	_firstCheck = true;

	_checkTimer = 0; // local timer for move checks
	_lastCheckTimestamp = 0; // last timestamp for move checks

	from: Object3D | null = null;

	_tempQuat = quat.create();
	_swapQuat = quat.create();
	_bendQuat = quat.create();

	// We only need finger corrections now.
	//  step1: swap VRM‑X → rig‑Z  (90° around Y)
	//  step2: apply VRM bend (we’ll read that from the source)
	_fingerRemap = fingerRemap;

	onActivate(): void {
		this.from = this.idle;
		this.to = this.to || this.object;
	}

	setIdle(): void {
		this.from = this.idle;
	}

	setRun(): void {
		this.from = this.run;
	}

	update(dt: number) {
		if (!this.from || !this.to) return;

		//do it on fixed update per 100ms
		this.accumulatedTime += dt;
		this.updateAnimation();
		this.copyBoneRotations();
	}

	copyBoneRotations() {
		for (const [src, dst] of Object.entries(retargetMap)) {
			const fromBone = this.from.findByNameRecursive(src)[0];
			const toBone = this.to.findByNameRecursive(dst)[0];
			if (!fromBone || !toBone) continue;
			if (dst === "Avatar_Hips" || dst === "hips") continue;

			// 1) get raw VRM local rotation
			fromBone.getRotationLocal(this._tempQuat);

			// 2) swap finger axis (if a finger bone)
			const fingerRemap = this._fingerRemap[dst];
			if (fingerRemap) {
				const [fAxis, fAngle] = fingerRemap;
				quat.setAxisAngle(this._swapQuat, fAxis, fAngle);
				quat.mul(this._tempQuat, this._swapQuat, this._tempQuat);
			}
			toBone.setRotationLocal(this._tempQuat);
		}
	}

	// replace your updateAnimation() with this:
	updateAnimation() {
		// get current world position of target
		this.to.getPositionWorld(this.toPosition);

		// initialize last position on first run
		if (this._firstCheck) {
			vec3.copy(this._lastCheckPos, this.toPosition);
			this._firstCheck = false;
		}

		// accumulate time and only check every _moveCheckInterval
		this.accumulatedTime += 0; // keep existing accumulation if you want
		// Instead we'll use a local timer approach
		if (!this._checkTimer) this._checkTimer = 0;
		this._checkTimer += performance && performance.now ? 0 : 0; // no-op to preserve structure

		// simpler: use dt-based check by storing lastCheckTimestamp
		if (!this._lastCheckTimestamp)
			this._lastCheckTimestamp = Date.now() / 1000;

		const now = Date.now() / 1000;
		const elapsed = now - this._lastCheckTimestamp;

		if (elapsed >= this._moveCheckInterval) {
			// distance moved since last check
			const dist = vec3.distance(this.toPosition, this._lastCheckPos);

			// speed in units/sec
			const speed = dist / Math.max(elapsed, 1e-6);

			// smooth velocity (EMA)
			this._velocityEMA =
				this._velocityAlpha * speed +
				(1 - this._velocityAlpha) * this._velocityEMA;

			// decide state with hysteresis / hold time
			if (this._velocityEMA > this._speedThreshold) {
				this.setRun();
				this._runHoldTimer = this._minRunHold; // reset hold timer
			} else {
				// countdown the hold timer; only go idle when it expires
				this._runHoldTimer -= elapsed;
				if (this._runHoldTimer <= 0) this.setIdle();
			}

			// update bookkeeping
			vec3.copy(this._lastCheckPos, this.toPosition);
			this._lastCheckTimestamp = now;
		}
	}
}
