import {Component, MeshComponent, Object3D} from "@wonderlandengine/api";
import {property} from "@wonderlandengine/api/decorators.js";
import {compressAvatar} from "./mesh-compresor.js";

//dfine a temp float 32 array of element 8
const tempTransform = new Float32Array(8);
const tempVector = new Float32Array(3);
/**
 * copy-transform
 */
export class CopyTransform extends Component {
	static TypeName = "copy-transform";

	/* Properties that are configurable in the editor */

	@property.object()
	src!: Object3D;

	url =
		"https://avatar.viverse.com/api/meetingareaselector/v2/newgenavatar/avatars/7ef6c8c74d60a788eadc4ad2d0d01700c4971242c00f8e7074ed6908a88517ea2b69/files?filetype=model&lod=original";



	update(dt: number) {
		/* Called every frame. */

		const from = this.src.getPositionWorld(tempVector);
		const to = this.object.getPositionWorld(tempVector);

		//lerp this.object position to src position

		this.object.setPositionWorld([
			from[0] + (to[0] - from[0]) * dt,
			from[1] + (to[1] - from[1]) * dt,
			from[2] + (to[2] - from[2]) * dt,
		]);
	}
}
