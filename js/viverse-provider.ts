import {Component, MeshComponent, Object3D} from "@wonderlandengine/api";
import {property} from "@wonderlandengine/api/decorators.js";
import {user, User} from "@wonderlandengine/upsdk";
import {ViverseProvider} from "@wonderlandengine/upsdk-provider-viverse";
import {compressAvatar} from "./mesh-compresor.js";

/**
 * viverse-provider
 */
export class ViverseProviderComponent extends Component {
	static TypeName = "viverse-provider-component";

	static avatarLoaded = false;
	static userLoggedIn = false;
	static user: User | null = null;

	/* Editor-configurable properties */
	@property.string()
	applicationId: string;

	@property.bool(false)
	debugOnLocalhost: boolean;

	@property.float(0.01)
	meshCompressionRatio: number;

	@property.float(8)
	textureCompressionFactor: number;

	@property.int(0)
	cloneTotal: number;

	@property.float(1.0)
	cloneInterval: number;

	_user: User | null = null;
	_prefab: any = null;
	_cloneCount = 0;
	_timeSinceLastClone = 0;

	init(): void {
		const debug =
			this.debugOnLocalhost &&
			window.location.hostname.includes("localhost")
				? true
				: false;

		const provider = new ViverseProvider({
			appId: this.applicationId,
			debug: debug,
		});
		user.registerProvider(provider);
	}

	async start() {
		if (!user.isLoggedIn) {
			this._user = await user.requestLogin();
		}

		if (this._user) {
			ViverseProviderComponent.user = this._user;
			ViverseProviderComponent.userLoggedIn = true;

			// compress and load
			const compressedUrl = await compressAvatar(
				this._user.avatarUrl,
				this.meshCompressionRatio,
				this.textureCompressionFactor,
			);
			await this.loadAvatarPrefab(compressedUrl);
		}
	}

	update(dt: number) {
		if (!this._prefab || this._cloneCount >= this.cloneTotal) return;
		this._timeSinceLastClone += dt;

		if (this._timeSinceLastClone >= this.cloneInterval) {
			this._timeSinceLastClone = 0;
			const parentObj = this.object.addChild();
			parentObj.parent = null;
			const {root} = this.engine.scene.instantiate(this._prefab);
			root.children.forEach((c) => (c.parent = parentObj));

			const angle = (this._cloneCount / this.cloneTotal) * Math.PI * 2;
			const radius = 5;
			parentObj.translateLocal([
				Math.cos(angle) * radius,
				0,
				Math.sin(angle) * radius,
			]);

			this._cloneCount++;
			console.log(`Clone ${this._cloneCount}/${this.cloneTotal} created`);
		}
	}

	/**
	 * Loads a GLB URL into the engine and instantiates initial prefab
	 */
	private async loadAvatarPrefab(blobUrl: string) {
		console.log("Loading compressed VRM into engine...");
		this._prefab = await this.engine.loadGLTF({
			url: blobUrl,
			extensions: true,
		});
		ViverseProviderComponent.avatarLoaded = true;
		ViverseProviderComponent.userLoggedIn = true;
		console.log("Model loaded.");

		console.log("Instantiating initial avatar instance...");
		const parentObj = this.object.addChild();
		const {root} = this.engine.scene.instantiate(this._prefab);
		root.children.forEach((c) => (c.parent = parentObj));
		this.postProcess(root);
	}

	postProcess(avatar: Object3D) {
		avatar.getComponents(MeshComponent).forEach((meshComp) => {
			meshComp.material.setAlphaMaskThreshold(0.5);
		});
		avatar.children.forEach((child) => {
			this.postProcess(child);
		});
	}
}
