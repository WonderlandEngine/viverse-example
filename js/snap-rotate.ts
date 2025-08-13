import {Component} from "@wonderlandengine/api";
import {property} from "@wonderlandengine/api/decorators.js";

/**
 * SnapRotate
 *
 * - Snap-rotates a target object (usually your player/root) by a fixed angle when
 *   the joystick/thumbstick on the chosen controller is pushed left or right.
 * - Editor properties:
 *    - handSide: 0 = left, 1 = right
 *    - target: object to rotate (falls back to this.object if unset)
 *    - snapAngle: degrees to rotate per snap (default 45)
 *    - deadzone: joystick magnitude required to trigger a snap (default 0.6)
 *    - cooldown: seconds between allowed snaps (default 0.4)
 *
 * Notes:
 * - Uses the WebXR inputSources on the XRSession provided by the engine's
 *   onXRSessionStart emitter. Finds the gamepad for the chosen handedness.
 * - Many controllers place the thumbstick X axis at gamepad.axes[2]; others
 *   use axes[0]. This component checks axes[2] first and falls back to axes[0].
 */
export class SnapRotate extends Component {
	static TypeName = "snap-rotate";

	// 0 = left, 1 = right
	@property.int(0)
	handSide!: number;

	// object to rotate — if left empty the component's owner object is used
	@property.object()
	targetObject: any = null;

	@property.float(45)
	snapAngle!: number;

	@property.float(0.6)
	deadzone!: number;

	@property.float(0.4)
	cooldown!: number;

	// internal
	_xrSession: XRSession | null = null;
	_cooldownTimer = 0;

	onActivate() {
		// Keep references to bound handlers so we can remove them later
		this._onXRStart = this._onXRStart.bind(this);
		this._onXREnd = this._onXREnd.bind(this);

		this.engine.onXRSessionStart.add(this._onXRStart);
		this.engine.onXRSessionEnd.add(this._onXREnd);

		// If a session is already running the RetainEmitter will call _onXRStart
		// immediately when added (see engine docs)
	}

	onDeactivate() {
		this.engine.onXRSessionStart.remove(this._onXRStart);
		this.engine.onXRSessionEnd.remove(this._onXREnd);

		this._xrSession = null;
	}

	_onXRStart(session: XRSession, mode?: XRSessionMode) {
		this._xrSession = session;
	}

	_onXREnd() {
		this._xrSession = null;
	}

	// Helper: find gamepad for handedness in current XRSession
	_getGamepadForHandedness(handedness: "left" | "right"): Gamepad | null {
		if (!this._xrSession) return null;

		for (const inputSource of this._xrSession.inputSources) {
			if (
				inputSource.handedness === handedness &&
				(inputSource as any).gamepad
			) {
				return (inputSource as any).gamepad as Gamepad;
			}
		}

		return null;
	}

	update(dt: number) {
		// countdown
		if (this._cooldownTimer > 0) this._cooldownTimer -= dt;

		if (!this._xrSession) return; // only operate in XR

		const handedness = this.handSide === 0 ? "left" : "right";
		const gp = this._getGamepadForHandedness(handedness);
		if (!gp || !gp.axes) return;

		// Many XR controllers place the thumbstick X axis in axes[2],
		// others expose it as axes[0]. Try the commonly used index first,
		// then fallback to 0.
		let xAxis = 0;
		if (gp.axes.length > 2) xAxis = gp.axes[2];
		else if (gp.axes.length > 0) xAxis = gp.axes[0];

		// trigger snap when joystick passes deadzone and cooldown allows it
		if (Math.abs(xAxis) >= this.deadzone && this._cooldownTimer <= 0) {
			const dir = Math.sign(xAxis); // -1 = left, +1 = right
			const angleDeg = dir * this.snapAngle;

			const target = this.targetObject || this.object;

			// Rotate target around local Y axis (up)
			// rotateAxisAngleDegObject expects an array axis and degrees
			// This rotates the object's local transform by angleDeg degrees
			target.rotateAxisAngleDegObject([0, 1, 0], -angleDeg);

			// start cooldown
			this._cooldownTimer = this.cooldown;
		}
	}
}
