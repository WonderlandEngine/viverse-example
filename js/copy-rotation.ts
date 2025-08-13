import {Component, Object3D} from "@wonderlandengine/api";
import {property} from "@wonderlandengine/api/decorators.js";
import {quat, vec3} from "gl-matrix";

/* --- temps (single allocation, reused each frame) --- */
const qSrc = quat.create();
const qCurr = quat.create();
const qYawCurr = quat.create();
const qYawDesired = quat.create();
const qYawCurrInv = quat.create();
const qTilt = quat.create();
const qOut = quat.create();

/* world Y axis (reuse to avoid re-allocating small arrays) */
const AXIS_Y = vec3.fromValues(0, 1, 0);

/**
 * CopyYRotation (gl-matrix version)
 * - Uses quat.setAxisAngle / quat.multiply / quat.conjugate / quat.normalize
 * - Smooths a scalar yaw and rebuilds a final quaternion preserving pitch/roll
 */
export class CopyYRotation extends Component {
	static TypeName = "copy-y-rotation";

	@property.object()
	src!: Object3D;

	// smoothing speed (higher -> faster). 0 = snap.
	@property.float(8.0)
	followSpeed = 8.0;

	// snap threshold (radians)
	@property.float(0.002)
	angleSnap = 0.002;

	// compare against last-applied to avoid tiny writes
	_lastApplied = quat.create();

	// smoothed yaw state (radians)
	_smoothedYaw = NaN;

	// sign toggle if left/right are mirrored in your scene (set to -1 or +1)
	Y_SIGN = -1;

	update(dt) {
		if (!this.src) return;

		// Read source and current world rotations (quaternions)
		this.src.getRotationWorld(qSrc);
		this.object.getRotationWorld(qCurr);

		// Extract target and current yaw (radians) using the same convention
		let targetYaw = this.Y_SIGN * getYawFromQuat(qSrc);
		let currentYaw = this.Y_SIGN * getYawFromQuat(qCurr);

		// Init smoothed yaw on first run
		if (!Number.isFinite(this._smoothedYaw)) this._smoothedYaw = currentYaw;

		// Shortest difference and snap / blend
		let diff = shortestAngle(targetYaw - this._smoothedYaw);
		if (Math.abs(diff) < this.angleSnap) {
			this._smoothedYaw = targetYaw;
		} else {
			// cheap linear blend that's still stable enough for most cases
			const t =
				this.followSpeed > 0 ? Math.min(1, this.followSpeed * dt) : 1;
			this._smoothedYaw = shortestAngle(this._smoothedYaw + diff * t);
		}

		// Build yaw-only quaternions using gl-matrix (consistent convention)
		quat.setAxisAngle(qYawCurr, AXIS_Y, this.Y_SIGN * currentYaw);
		quat.setAxisAngle(qYawDesired, AXIS_Y, this.Y_SIGN * this._smoothedYaw);

		// tilt = inv(qYawCurr) * qCurr
		quat.conjugate(qYawCurrInv, qYawCurr);
		quat.multiply(qTilt, qYawCurrInv, qCurr);

		// final = qYawDesired * tilt
		quat.multiply(qOut, qYawDesired, qTilt);
		quat.normalize(qOut, qOut);

		// skip tiny writes (compare absolute dot with last applied)
		const dot = Math.abs(
			qOut[0] * this._lastApplied[0] +
				qOut[1] * this._lastApplied[1] +
				qOut[2] * this._lastApplied[2] +
				qOut[3] * this._lastApplied[3],
		);

		if (dot > 0.999999) return;

		this.object.setRotationWorld(qOut);
		quat.copy(this._lastApplied, qOut);
	}
}

/* -------------------------
   Minimal helpers (tiny)
   ------------------------- */

function shortestAngle(a) {
	let v = a;
	while (v > Math.PI) v -= 2 * Math.PI;
	while (v < -Math.PI) v += 2 * Math.PI;
	return v;
}

// Extract yaw (Y-up) from quaternion using stable atan2 formula
function getYawFromQuat(q) {
	// yaw = atan2(2*(w*y + x*z), 1 - 2*(y*y + z*z))
	return Math.atan2(
		2 * (q[3] * q[1] + q[0] * q[2]),
		1 - 2 * (q[1] * q[1] + q[2] * q[2]),
	);
}
