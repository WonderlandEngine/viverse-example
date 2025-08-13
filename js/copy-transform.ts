import {Component, Object3D} from "@wonderlandengine/api";
import {property} from "@wonderlandengine/api/decorators.js";
//dfine a temp float 32 array of element 8
const tempTransform = new Float32Array(8);
const tempRotation = new Float32Array(4);
const tempVector = new Float32Array(3);
/**
 * copy-transform
 */
export class CopyTransform extends Component {
	static TypeName = "copy-transform";

	/* Properties that are configurable in the editor */

	@property.object()
	src!: Object3D;

	@property.float(1.5)
	height: number;

	update(dt: number) {
		// /* Called every frame. */

		const from = this.src.getPositionWorld(tempVector);
		from[1] = 0.0;
		this.object.setPositionWorld(from);
	}
}
