import {Component, MeshComponent, Object3D} from "@wonderlandengine/api";
import {property} from "@wonderlandengine/api/decorators.js";
import {compressAvatar} from "./mesh-compresor.js";
import {Vrm} from "@wonderlandengine/components";

/**
 * vrmLoader
 */
export class VrmLoader extends Component {
	static TypeName = "vrmLoader";

	/* Properties that are configurable in the editor */

	@property.string("text3.vrm")
	url!: string;

	@property.object()
	parentObject!: Object3D;

	static onRegister(engine) {
		engine.registerComponent(Vrm);
	}
	avatarLoaded = false;

	async start() {
		//this.object.addComponent(Vrm, {src: this.url});
		compressAvatar(this.url, 0.01, 64).then((blobUrl) => {
			console.log("Compressed VRM available at:", blobUrl);
			//this.object.addComponent(Vrm, {src: blobUrl});
			this.engine
				.loadGLTF({
					url: blobUrl,
					extensions: true,
				})
				.then((_prefab) => {
					console.log("Model loaded.");

					console.log("Instantiating initial avatar instance...");

					const {root} = this.engine.scene.instantiate(_prefab);
					root.setDirty();
					const avatar = root;
					avatar.children.forEach((c) => (c.parent = this.object));
					this.avatarLoaded = true;
				});
		});
	}
}
