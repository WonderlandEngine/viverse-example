precision mediump float;

#include "lib/Compatibility.glsl"
#define USE_LIGHTS

#define FEATURE_TEXTURED
#define FEATURE_ALPHA_MASKED
#define FEATURE_VERTEX_COLORS
#define FEATURE_GLOBAL_ILLUMINATION

//#define USE_NORMAL

#ifdef TEXTURED
#define USE_TEXTURE_COORDS
#endif
#ifdef VERTEX_COLORS
#define USE_COLOR
#endif

#if NUM_LIGHTS > 0
#define USE_POSITION_WORLD
#endif

#if NUM_SHADOWS > 0
#define USE_POSITION_VIEW
#endif

#define USE_MATERIAL_ID
#include "lib/Uniforms.glsl"
#include "lib/Inputs.glsl"

#ifdef TEXTURED
#include "lib/Textures.glsl"
#endif
#include "lib/Packing.glsl"
#include "lib/Materials.glsl"

#include "lib/Lights.glsl"
#include "lib/Surface.glsl"

#ifdef GLOBAL_ILLUMINATION
#include "lib/Math.glsl"
#include "lib/CoordinateSystems.glsl"
#include "lib/GI.glsl"
#endif

struct Material {
    lowp vec4 ambientColor;
    lowp vec4 diffuseColor;
    lowp vec4 specularColor;
#ifdef WITH_EMISSIVE
    lowp vec4 emissiveColor;
#endif
#ifdef WITH_FOG
    lowp vec4 fogColor;
#endif
#ifdef TEXTURED
    mediump uint diffuseTexture;
#ifdef WITH_EMISSIVE
    mediump uint emissiveTexture;
#endif
#ifdef NORMAL_MAPPING
    mediump uint normalTexture;
#endif
#ifdef LIGHTMAP
    mediump uint lightmapTexture;
    lowp float lightmapFactor;
#endif
#endif
    lowp uint shininess;
#ifdef DEPRECATED_AMBIENT_FACTOR
    lowp float ambientFactor;
#endif
};

Material decodeMaterial(uint matIndex) {
    {{decoder}}
    return mat;
}

void main() {
    #ifdef TEXTURED
        alphaMask(fragMaterialId, fragTextureCoords);
    #endif

    // 1) Material & base color
    Material mat = decodeMaterial(fragMaterialId);
    lowp vec4 baseColor = mat.diffuseColor;
    #ifdef TEXTURED
    if (mat.diffuseTexture > 0u) {
        baseColor *= textureAtlas(mat.diffuseTexture, fragTextureCoords);
    }
    #endif
    lowp vec3 diffuseCol = baseColor.rgb;

    // // 2) Surface normal & depth
    // SurfaceData surface = computeSurfaceData(fragNormal);
    // mediump vec3 normal = surface.normal;
    // float viewDepth = -fragPositionView.z;

    // // 3) GI: environment irradiance
    // lowp vec3 giContrib = vec3(0.0);
    // #ifdef GLOBAL_ILLUMINATION
    //     giContrib = evaluateEnvironmentIrradiance(normal) * diffuseCol;
    // #endif

    // // 4) Shadow
    // float shadow = 1.0;
    // #if NUM_SHADOWS > 0
    // int shadowIndex = int(lightParameters[0].w);
    // int cascade = selectCascade(shadowIndex, viewDepth);
    // if (cascade != -1) {
    //     shadow = sampleShadowOrtho(shadowIndex + cascade, normal, lightDirectionsWorld[shadowIndex]);
    //     shadow = 1.0 - (1.0 - shadow) * 0.5;
    // }
    // #endif

    // // 5) Toon shading
    // // Ambient fallback = material ambient + GI (texture-projected)
    // lowp vec3 ambient = mat.ambientColor.rgb + giContrib;

    // // Directional light
    // vec3 L = normalize(lightDirectionsWorld[0]);
    // float NdotL = max(dot(normal, L), 0.0);
    // const float levels = 3.0;
    // float toonShade = floor(NdotL * levels) / levels;

    // // Ensure darkest band isn't fully dark
    // const float minDiffuseShade = 0.05;
    // toonShade = max(toonShade, minDiffuseShade);

    // 6) Combine: ambient + toon-lit * shadow
    lowp vec3 color = diffuseCol;
    //lowp vec3 color = ambient + diffuseCol * toonShade * shadow;
    outColor = vec4(color, baseColor.a);
}
