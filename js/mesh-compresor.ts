import {
	Extension,
	Document,
	JSONDocument,
	ReaderContext,
	WriterContext,
	WebIO,
} from "@gltf-transform/core";
import {ALL_EXTENSIONS, KHRONOS_EXTENSIONS} from "@gltf-transform/extensions";
import {compressTexture, simplify} from "@gltf-transform/functions";

/**
 * Custom glTF-Transform extension to preserve VRMC_vrm JSON data
 */
/**
 * Custom glTF-Transform extension to preserve VRMC_vrm JSON data.
 */
export class VRMC_vrm extends Extension {
	public static readonly EXTENSION_NAME = "VRMC_vrm";
	public readonly extensionName = VRMC_vrm.EXTENSION_NAME;

	private _vrmJSON: any = null;

	/**
	 * Must call super(document) so base can register this extension against the Document.
	 */
	public constructor(document: Document) {
		super(document);
	}

	/** Extracts VRM JSON from the glTF before transforms. */
	public read(context: ReaderContext): this {
		const json = context.jsonDoc.json;
		if (json.extensions && json.extensions[VRMC_vrm.EXTENSION_NAME]) {
			this._vrmJSON = json.extensions[VRMC_vrm.EXTENSION_NAME];
		}
		return this;
	}

	/** Re-inserts VRM JSON into the glTF after transforms. */
	public write(context: WriterContext): this {
		const json = context.jsonDoc.json;
		json.extensions = json.extensions || {};
		if (this._vrmJSON) {
			json.extensions[VRMC_vrm.EXTENSION_NAME] = this._vrmJSON;
		}
		return this;
	}
}

/**
 * Custom glTF-Transform extension to preserve VRMC_springBone JSON data
 */
export class VRMC_springBone extends Extension {
	public static readonly EXTENSION_NAME = "VRMC_springBone";
	public readonly extensionName = VRMC_springBone.EXTENSION_NAME;

	private _springJSON: any = null;

	public constructor(document: Document) {
		super(document);
	}

	/** Extracts springBone JSON from the glTF before transforms. */
	public read(context: ReaderContext): this {
		const json = context.jsonDoc.json;
		if (
			json.extensions &&
			json.extensions[VRMC_springBone.EXTENSION_NAME]
		) {
			this._springJSON = json.extensions[VRMC_springBone.EXTENSION_NAME];
		}
		return this;
	}

	/** Re-inserts springBone JSON into the glTF after transforms. */
	public write(context: WriterContext): this {
		const json = context.jsonDoc.json;
		json.extensions = json.extensions || {};
		if (this._springJSON) {
			json.extensions[VRMC_springBone.EXTENSION_NAME] = this._springJSON;
		}
		return this;
	}
}

/**
 * Fetches a VRM URL, compresses its textures and meshes, and returns a Blob URL.
 *
 * @param sourceUrl            URL of the original VRM/GLB file
 * @param meshCompressionRatio Ratio between 0 (max simplify) and 1 (retain all triangles)
 * @param downFactor           Factor to downscale each texture (e.g. 2 → half dimensions)
 * @returns                    Blob URL of the compressed VRM
 *
 * Requires:
 *   npm install @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer
 */
export async function compressAvatar(
	sourceUrl: string,
	meshCompressionRatio: number = 0.1,
	downFactor: number = 64,
): Promise<string> {
	let blobUrl: string | null = null;
	try {
		console.log("🔄 Fetching VRM...");
		const resp = await fetch(sourceUrl);
		if (!resp.ok) {
			throw new Error(`Failed fetch: ${resp.status} ${resp.statusText}`);
		}
		const arrayBuffer = await resp.arrayBuffer();

		console.log("📦 Parsing VRM with extensions...");
		// Include VRM-specific extensions as well
		const io = new WebIO().registerExtensions([
			...KHRONOS_EXTENSIONS /* VRM extension */,
			//VRMC_vrm,
			//VRMC_springBone,
		]); // ensure VRM schemas stay intact
		const doc = await io.readBinary(new Uint8Array(arrayBuffer));

		// Texture downscale per texture, preserving aspect ratio
		const textures = doc.getRoot().listTextures();
		console.log(
			`🎨 Downscaling ${textures.length} textures by factor ${downFactor}...`,
		);

		let idx = 0;
		for (const texture of textures) {
			// Retrieve original texture size
			const [origW, origH] = texture.getSize();
			const newW = Math.max(1, Math.floor(origW / downFactor));
			const newH = Math.max(1, Math.floor(origH / downFactor));

			// Compress this texture in-place
			await compressTexture(texture, {resize: [newW, newH]});
			console.log(
				`Texture ${++idx}/${textures.length}: ${origW}×${origH} → ${newW}×${newH}`,
			);
		}
		console.log("✅ Texture downscale completed.");

		// Mesh simplification
		console.log(
			`⬇️ Loading meshoptimizer and simplifying meshes at ratio ${meshCompressionRatio}...`,
		);
		const {MeshoptSimplifier} = await import("meshoptimizer");
		await doc.transform(
			simplify({
				ratio: meshCompressionRatio,
				simplifier: MeshoptSimplifier,
			}),
		);
		console.log("✅ Mesh simplification completed.");

		// Serialize and create Blob URL
		console.log("📝 Writing optimized VRM to Blob URL...");
		const output = await io.writeBinary(doc);
		const blob = new Blob([output], {type: "model/gltf-binary"});
		blobUrl = URL.createObjectURL(blob);
		console.log("🚀 Compression pipeline finished.");

		return blobUrl;
	} catch (error) {
		console.error("❌ compressAvatar error:", error);
		if (blobUrl) URL.revokeObjectURL(blobUrl);
		throw error;
	}
}
