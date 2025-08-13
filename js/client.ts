import {
	Component,
	LightComponent,
	Object3D,
	TextComponent,
} from "@wonderlandengine/api";
import {property} from "@wonderlandengine/api/decorators.js";

import {VrmLoader} from "./vrm-loader.js";

import {
	networkManager,
	NetworkConfigurationComponent,
	WonderlandWebsocketEvent,
	NetworkedComponent,
} from "@wonderlandcloud/client";
import {CopyTransform} from "./copy-transform.js";
import {ViverseProvider} from "@wonderlandengine/upsdk-provider-viverse";
import {ViverseProviderComponent} from "./viverse-provider.js";
import {user} from "@wonderlandengine/upsdk";
import {AnimationRetarget} from "./AnimationRetarget.js";
import {quat2} from "gl-matrix";

const tempQuat = quat2.create();

/* CSS for username input */
const CSS = `
        /* Style for the modal container */
        .modal-container {
            font-family: sans-serif;
            display: none;
            justify-content: center;
            align-items: center;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
        }

        /* Style for the modal content */
        .modal-content {
            background-color: #fff;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
            text-align: center;
            margin: 5px;
        }

        /* Style for the input field */
        .username-input {
            border: none;
            border-radius: 25px;
            padding: 10px;
            font-size: 16px;
        }

        /* Style for the submit button */
        .submit-button {
            background-color: #007BFF;
            color: #fff;
            border: none;
            border-radius: 25px;
            margin-top: 10px;
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
        }

		.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007BFF;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}
@keyframes spin { 100% { transform: rotate(360deg); } }
`;
/* HTML for username input */
const HTML = `
        <!-- Spinner / loading state -->
<div id="loading-state" class="modal-content">
  <h2>Logging in and loading avatar…</h2>
  <div class="spinner"></div>
</div>

<!-- Post-load state, starts hidden -->
<div id="avatar-state" class="modal-content" style="display: none;">
  <h2>Enter Your Name</h2>
  <input type="text" id="username-input" class="username-input" placeholder="Username" onkeydown="event.stopPropagation()">
  <input type="text" id="avatar-url-input" class="username-input" placeholder="Avatar URL" readonly>
  <button id="submit-button" class="submit-button" disabled>Join</button>
</div>

`;

interface ObjectOrComponentReference {
	[key: string]: {
		component?: Component;
		object?: Object3D;
		id?: number;
	};
}

/**
 * custom-event-handler
 */
export class SimpleExampleClient extends NetworkConfigurationComponent {
	static TypeName = "simple-example-client";

	@property.bool()
	skipServerStart = true;

	@property.object()
	playerObjectVR!: Object3D;

	@property.object()
	playerPrototype!: Object3D;
	@property.object()
	addons!: Object3D | null;

	@property.object()
	notificationsObject!: Object3D;

	@property.float(3.0)
	notifyTime!: number;

	@property.object()
	idle!: Object3D | null;

	@property.object()
	run!: Object3D | null;

	@property.object()
	speakingLight!: Object3D | null;

	static InheritProperties = true;

	notificationText?: TextComponent | null;
	notificationTimer = 0;

	username: string = "";
	avatarUrl = "";

	modal: HTMLDivElement | null = null;

	userItemOffset = 0;

	remoteUsersAndComps: Map<string, ObjectOrComponentReference> = new Map<
		string,
		ObjectOrComponentReference
	>();

	static onRegister(engine) {
		engine.registerComponent(CopyTransform);
		engine.registerComponent(NetworkedComponent);
	}

	init() {
		const style = document.createElement("style");
		style.innerText = CSS;
		document.head.append(style);

		this.modal = document.createElement("div");
		this.modal.classList.add("modal-container");
		this.modal.id = "modal-container";
		this.modal.innerHTML = HTML;
		document.body.appendChild(this.modal);
	}

	start() {
		this.notificationText =
			this.notificationsObject.getComponent(TextComponent);

		if (this.username === "") {
			/* Will connect after username entered */
			this.openUsernameModal();
		} else {
			this.connect();
		}

		this.disableAvatarVisualizationOnXR();
	}

	disableAvatarVisualizationOnXR() {
		this.engine.onXRSessionStart.add(() => {
			this.playerObject.parent.setScalingWorld([0, 0, 0]);
		});

		this.engine.onXRSessionEnd.add(() => {
			this.playerObject.parent.setScalingWorld([1, 1, 1]);
		});
	}

	openUsernameModal() {
		this.modal!.style.display = "flex";
		const loadingEl = document.getElementById("loading-state")!;
		const avatarEl = document.getElementById("avatar-state")!;
		const avatarInput = document.getElementById(
			"avatar-url-input",
		) as HTMLInputElement;
		const nameInput = document.getElementById(
			"username-input",
		) as HTMLInputElement;
		const btn = document.getElementById(
			"submit-button",
		) as HTMLButtonElement;

		// every 100ms, check if avatarLoaded flipped
		const interval = setInterval(() => {
			if ((ViverseProviderComponent as any).avatarLoaded) {
				clearInterval(interval);

				// hide spinner, show form
				loadingEl.style.display = "none";
				avatarEl.style.display = "none";

				this.username = ViverseProviderComponent.user.name;
				this.avatarUrl = ViverseProviderComponent.user.avatarUrl;
				if (!this.username) return;
				this.modal!.style.display = "none";
				this.connect();

				// // populate fields from your user object
				// avatarInput.value = ViverseProviderComponent.user.avatarUrl;
				// nameInput.value = ViverseProviderComponent.user.name;

				// // enable & rename button
				// btn.disabled = false;
				// btn.textContent = "Join";
			}
		}, 100);

		btn.addEventListener("click", () => {
			if (btn.disabled) return;
			this.username = nameInput.value.trim();
			this.avatarUrl = avatarInput.value.trim();
			if (!this.username) return;
			this.modal!.style.display = "none";
			this.connect();
		});
	}

	/**
	 * Function which triggers a connection initiation by calling the connect
	 * function of the networkManager singleton instance.
	 */
	connect() {
		const customJoinData = {
			handTracking: false,
			hands: false,
			username: this.username,
			additionalData: {avatarUrl: this.avatarUrl},
		};
		if (this.connecting) {
			console.error("Cannot connect multiple times!");
			return;
		}
		this.connecting = true;

		console.log("Connecting...", {
			host: this.serverHost,
			port: this.serverPort,
			secure: this.secure,
			audio: this.audio,
			audioDeviceId: this.inputDeviceId,
			debug: this.debug,
			path: this.serverPath,
			skipServerStart: this.skipServerStart,
		});

		networkManager
			.connect(customJoinData, {
				host: this.serverHost,
				port: this.serverPort,
				secure: this.secure,
				audio: this.audio,
				audioDeviceId: this.inputDeviceId,
				debug: this.debug,
				path: this.serverPath,
				skipServerStart: this.skipServerStart,
			})
			.then(this.onSuccessfulConnection.bind(this))
			.catch((e) => {
				console.error(e);
				/* No more updates for now. */
				this.active = false;
				this.connecting = false;
				/* Automatically reconnect -- for debugging the server */
				setTimeout(this.connect.bind(this), 1000);
			});
	}

	update(dt: number) {
		this.notificationTimer -= dt;
		if (this.notificationTimer < 0 && this.notificationText) {
			this.notificationText.text = "";
		}
	}

	override onSuccessfulConnection(joinEvent: number[]) {
		try {
			/* We are mis-using postRender here to ensure all
			 * networked-component updates have been called */
			this.engine.scene.onPostRender.add(
				networkManager.update.bind(networkManager),
			);

			networkManager.onEvent.add(this.onEvent.bind(this));
			this.playerObject &&
				this.playerObject.addComponent("networked", {
					networkId: joinEvent[0],
					mode: "send",
				});

			this.engine.onXRSessionStart.add(() => {
				this.playerObject.getComponent(NetworkedComponent)!.destroy();
				this.playerObjectVR.addComponent("networked", {
					networkId: joinEvent[0],
					mode: "send",
				});
				this.object.setTransformWorld(
					this.playerObject.getTransformWorld(tempQuat),
				);
			});

			this.engine.onXRSessionEnd.add(() => {
				this.playerObjectVR.getComponent(NetworkedComponent)!.destroy();
				this.playerObject.addComponent("networked", {
					networkId: joinEvent[0],
					mode: "send",
				});
				this.playerObject.parent.setTransformWorld(
					this.object.getTransformWorld(tempQuat),
				);
			});

			/* Start updating! */
			this.active = true;
		} catch (e) {
			console.log("Error while trying to join:", e);
		}
	}

	override onEvent(e: WonderlandWebsocketEvent) {
		switch (e.type) {
			case "user-joined":
				console.log(
					"prototype rotation",
					this.playerPrototype.getRotationWorld(),
				);

				const root = this.playerPrototype.clone();
				root.parent = null;
				root.setDirty();

				const foot = root.findByNameRecursive("Foot")[0];

				const vrmObj = foot.addChild();
				vrmObj.setDirty();

				const loader = vrmObj.addComponent(VrmLoader, {
					url: e.data.additionalData.avatarUrl,
					parentObject: root.findByNameRecursive("Foot")[0],
				});

				//foot.setPositionLocal([0, -0.7, 0]);

				console.log(root, loader);
				//vrmObj.parent = root;

				//wait till loader.avatarLoaded is true
				const interval = setInterval(() => {
					if (loader.avatarLoaded) {
						clearInterval(interval);
						root.addComponent(NetworkedComponent, {
							networkId: e.data.networkIds[0],
							mode: "receive",
						});

						const userNameObject =
							this.playerPrototype.findByNameRecursive(
								"Username",
							)[0];
						const userNameRotation =
							userNameObject.getRotationWorld();
						console.log(
							"prototype username rotation",
							userNameRotation,
						);
						console.log("rotation:", root.getRotationWorld());
						root.setRotationWorld(
							this.playerPrototype.getRotationWorld(),
						);
						console.log("rotation new", root.getRotationWorld());
						const meshComponent = root.getComponent("mesh");
						if (meshComponent) {
							meshComponent.active = true;
						}
						const usernameObject =
							root.findByNameRecursive("Username");
						if (usernameObject[0]) {
							usernameObject[0].setRotationWorld(
								userNameRotation,
							);
						}
						const textComponent =
							usernameObject[0]!.getComponent(TextComponent)!;
						if (textComponent) {
							textComponent.text = e.data.username;
							textComponent.active = true;
						}

						vrmObj.addComponent(CopyTransform, {
							src: vrmObj,
						});

						vrmObj.addComponent(AnimationRetarget, {
							idle: this.idle,
							run: this.run,
							to: vrmObj,
						});

						// /* Speaking indicator */
						// const lightObject =
						// 	root.findByNameRecursive("SpeakingLight");
						// const lightComponent =
						// 	lightObject[0]?.getComponent(LightComponent);
						// if (!lightComponent) {
						// 	throw Error(
						// 		"No light component defined on SpeakingLight Object cannot process adding new user",
						// 	);
						// }
						// const lightObject2 =
						// 	root.findByNameRecursive("SpeakingLight2");
						// const lightComponent2 =
						// 	lightObject2[0]?.getComponent(LightComponent);
						// if (!lightComponent2) {
						// 	throw Error(
						// 		"No light component defined on SpeakingLight Object cannot process adding new user",
						// 	);
						// }

						const lightComp =
							this.speakingLight.getComponent(LightComponent);

						const userObjects = {
							head: {
								object: root,
								id: e.data.networkIds[0] as number,
							},
							speakingLight: {
								component: null,
							},
							speakingLight2: {
								component: null,
							},
						};

						this.remoteUsersAndComps.set(e.data.id, userObjects);
						this.notify(
							e.data.username.toString() + " joined the game.",
						);
					}
				}, 100);

				break;

			case "user-left": {
				const remoteUser = this.remoteUsersAndComps.get(e.data.id);
				if (remoteUser) {
					// 1) Remove *all* networked objects:
					for (const ref of Object.values(remoteUser)) {
						if (ref.id != null) {
							networkManager.removeObject(ref.id);
						}
					}

					// 2) Destroy *all* WonderlandEngine objects and components:
					for (const ref of Object.values(remoteUser)) {
						if (ref.component) {
							// this will remove the component from its owner object
							ref.component.destroy();
						}
						if (ref.object) {
							// recursively destroys child hierarchy, removes from scene
							ref.object.destroy();
						}
					}

					// 3) Finally, remove from our bookkeeping map:
					this.remoteUsersAndComps.delete(e.data.id);
				}

				this.notify(`${e.data.username} left the game.`);
				break;
			}

			case "player-speak-change":
				const playerId = e.data.playerId;
				const isSpeaking = e.data.isSpeaking;
				if (playerId !== networkManager.client?.id) {
					// only process events but not for others
					const playerObjects =
						this.remoteUsersAndComps.get(playerId);
					if (playerObjects) {
						if (
							playerObjects.speakingLight.component &&
							playerObjects.speakingLight2.component
						) {
							playerObjects.speakingLight.component.active =
								isSpeaking;
							playerObjects.speakingLight2.component.active =
								isSpeaking;
						} else {
							console.log(
								`${e.data.username} changed speaking state to ${isSpeaking}`,
							);
						}
					}
				}

			default:
				if (this.debug) console.log("Unknown event:", e);
		}
	}

	/** Show the user an on-screen notification */
	notify(text: string) {
		if (!this.notificationText) return;
		this.notificationText.text = text;
		this.notificationTimer = this.notifyTime;
	}
}
