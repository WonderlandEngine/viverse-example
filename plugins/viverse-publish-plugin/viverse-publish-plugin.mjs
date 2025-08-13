// plugins/viversecli.mts
import {
	EditorPlugin,
	ui,
	project,
	workspace,
	tools,
} from "@wonderlandengine/editor-api";
import {spawn} from "child_process";
import path from "path";

const viverseLogo =
	"data:image/png;base64,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";

export default class ViversePublishPlugin extends EditorPlugin {
	constructor() {
		super();
		this.name = "Publish to Viverse";

		// Dynamically determine npm root folder and set deploy folder

		// Fallback to default path
		this.DEPLOY_FOLDER = workspace.deployPath;

		// CLI installation state
		this._cliAvailable = false;
		this._checkingCLI = true;
		this._installingLocalCLI = false;

		// Auth state
		this._authStatus = "";
		this._isLoggedIn = false;
		this._checkingAuth = false;

		// Login form
		this._email = "";
		this._password = "";
		this._loginInProgress = false;

		// Publish state
		this._publishInProgress = false;
		this._appId = "";
		this._lastPublishedUrl = "";

		this._checkCLI();

		ui.loadImage(Buffer.from(viverseLogo.split(",")[1], "base64"))
			.then((img) => {
				this._logoImage = img;
			})
			.catch((e) => {
				console.warn("Couldn't load logo:", e);
			});
	}

	draw() {
		if (this._logoImage) {
			ui.image(this._logoImage, 128, 128);
		}

		// 1) Ensure CLI is installed locally
		if (this._checkingCLI) {
			ui.label("Checking for local viverse-cli...");
			ui.spinner();
			return;
		}
		if (this._installingLocalCLI) {
			ui.label("Installing @viverse/cli locally...");
			ui.spinner();
			return;
		}
		if (!this._cliAvailable) {
			ui.label(
				"viverse-cli not installed on the root. If you are sure it is installed, try opening the wlp from its root folder",
			);
			return;
		}

		ui.label(this._authStatus);

		ui.separator();

		// LOGOUT button (visible when logged in)
		if (this._isLoggedIn) {
			// optionally disable while checking auth or login in progress
			if (this._checkingAuth || this._loginInProgress) {
				ui.label("Please wait...");
			} else if (ui.button("Logout")) {
				this._runLogout();
			}
		}

		// While we're actively checking auth, don't show login or app list — show spinner instead
		if (this._checkingAuth) {
			ui.spinner();
			return;
		}

		ui.separator();

		// 4) Login form
		if (!this._isLoggedIn) {
			ui.label("Please log in to VIVERSE:");
			ui.separator();
			ui.label("Email.");
			const e = ui.inputText("Email", this._email);
			if (e !== null) this._email = e;
			ui.separator();
			ui.label("Password.");
			const p = ui.inputText("Password", this._password);
			if (p !== null) this._password = p;

			if (this._loginInProgress) {
				ui.label("Logging in...");
				ui.spinner();
			} else if (ui.button("Login")) {
				this._runLogin();
			}
			return;
		}

		ui.separator();

		// 3) Export App List button
		ui.label("Applications:");
		if (ui.button("Log App List")) {
			this._exportAppList();
		}

		ui.separator();
		ui.label("No Application ID?\nYou can create one here");
		if (ui.button("Create Application")) {
			tools.openBrowser("https://studio.viverse.com/upload");
		}

		// 5) App ID & Publish trigger
		ui.separator();
		ui.label("Enter Application ID:");
		const id = ui.inputText("App ID", this._appId);
		if (id !== null) this._appId = id;

		ui.separator();
		if (!this._appId) {
			ui.label("Provide App ID to enable publishing.");
		} else if (this._publishInProgress) {
			ui.label("Publishing to VIVERSE...");
			ui.spinner();
		} else if (ui.button("Publish to VIVERSE")) {
			this._lastPublishedUrl = "";
			this._runPublish();
		}

		// 6) Post-publish: show URL and publish-log button
		ui.separator();
		if (this._lastPublishedUrl && ui.button("Open Preview URL")) {
			tools.openBrowser(this._lastPublishedUrl);
		}

		// To submit the application, users need to manually submit it from the website.
		if (this._appId) {
			if (ui.button("Submit to review")) {
				tools.openBrowser(
					`https://studio.viverse.com/upload/${this._appId}?tab=versions`,
				);
			}
			ui.separator();
		}
	}

	_getCliPath() {
		return path.join(workspace.root, "node_modules", ".bin", "viverse-cli");
	}

	_checkCLI() {
		const cli = this._getCliPath();
		const proc = spawn(cli, ["--version"], {
			cwd: workspace.root,
			shell: true,
		});
		let buf = "";
		proc.stdout.on("data", (d) => (buf += d.toString()));
		proc.stderr.on("data", (d) => (buf += d.toString()));
		proc.on("close", (code) => {
			this._checkingCLI = false;
			if (code === 0) {
				this._cliAvailable = true;
				this._updateAuthStatus();
			} else {
				this._installLocalCLI();
			}
		});
	}

	_installLocalCLI() {
		this._installingLocalCLI = true;
		const install = spawn(
			"npm",
			["install", "@viverse/cli", "--save-dev"],
			{
				cwd: workspace.root,
				shell: true,
			},
		);
		install.on("close", (code) => {
			this._installingLocalCLI = false;
			this._cliAvailable = code === 0;
			if (this._cliAvailable) this._updateAuthStatus();
		});
	}

	_updateAuthStatus() {
		this._checkingAuth = true;
		this._authStatus = "Checking authentication...";
		const cli = this._getCliPath();
		const stat = spawn(cli, ["auth", "status"], {
			cwd: workspace.root,
			shell: true,
		});
		let out = "";
		stat.stdout.on("data", (d) => (out += d.toString()));
		stat.stderr.on("data", (d) => (out += d.toString()));
		stat.on("close", (code) => {
			this._checkingAuth = false;
			if (code !== 0 || /not logged in/i.test(out)) {
				this._isLoggedIn = false;
				this._authStatus = "Not logged in.";
			} else {
				this._isLoggedIn = true;
				this._authStatus = out.trim();
			}
		});
	}

	_runLogin() {
		this._loginInProgress = true;
		this._authStatus = "Logging in...";
		const cli = this._getCliPath();
		const login = spawn(
			cli,
			["auth", "login", "-e", this._email, "-p", this._password],
			{cwd: workspace.root, shell: true},
		);
		let out = "";
		login.stdout.on("data", (d) => (out += d.toString()));
		login.stderr.on("data", (d) => (out += d.toString()));
		login.on("close", (code) => {
			this._loginInProgress = false;
			if (code === 0) this._updateAuthStatus();
			else {
				this._isLoggedIn = false;
				this._authStatus = out.trim();
			}
		});
	}

	_runLogout() {
		this._authStatus = "Logging out...";
		// we show spinner/state if you want:
		this._checkingAuth = true;

		const cli = this._getCliPath();
		const logout = spawn(cli, ["auth", "logout"], {
			cwd: workspace.root,
			shell: true,
		});

		let out = "";
		logout.stdout.on("data", (d) => (out += d.toString()));
		logout.stderr.on("data", (d) => (out += d.toString()));
		logout.on("close", (code) => {
			this._checkingAuth = false;
			if (code === 0) {
				// Refresh auth state from CLI
				this._updateAuthStatus();
			} else {
				// preserve message so user sees what went wrong
				this._isLoggedIn = false;
				this._authStatus = out.trim() || "Logout failed.";
			}
		});
	}

	_exportAppList() {
		const cli = this._getCliPath();
		const proc = spawn(cli, ["app", "list"], {
			cwd: workspace.root,
			shell: true,
			env: {...process.env, CI: "1"},
		});
		let buf = "";
		proc.stdout.on("data", (d) => (buf += d.toString()));
		proc.stderr.on("data", (d) => (buf += d.toString()));
		proc.on("close", (code) => {
			if (code === 0) {
				console.log(buf);
			}
		});
	}

	async packageProject() {
		try {
			await tools.packageProject();
		} catch (e) {
			console.error("Packaging failed:", e);
		}
	}

	_runPublish() {
		this.packageProject();

		this._publishInProgress = true;
		const cli = this._getCliPath();
		const pub = spawn(
			cli,
			["app", "publish", this.DEPLOY_FOLDER, "--app-id", this._appId],
			{cwd: workspace.root, shell: true},
		);

		let logBuf = "";
		let urlBuf = "";

		const tryUrl = () => {
			let m =
				urlBuf.match(/Preview URL:\s*(https?:\/\/\S+)/i) ||
				urlBuf.match(/APP URL:\s*(https?:\/\/\S+)/i);
			if (m) {
				this._lastPublishedUrl = m[1];
				urlBuf = "";
			}
		};

		pub.stdout.on("data", (d) => {
			const s = d.toString();
			console.log(s);
			logBuf += s;
			urlBuf += s;
			if (
				/Warning: You are trying to publish a source code folder/i.test(
					urlBuf,
				)
			) {
				pub.stdin.write("y\n");
				urlBuf = "";
			}
			tryUrl();
		});

		pub.stderr.on("data", (d) => {
			const s = d.toString();
			logBuf += s;
			urlBuf += s;
			tryUrl();
		});

		pub.on("close", () => {
			this._publishInProgress = false;
		});
	}

	onDestroy() {}
}
