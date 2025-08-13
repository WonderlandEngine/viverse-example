/**
 * /!\ This file is auto-generated.
 *
 * This is the entry point of your standalone application.
 *
 * There are multiple tags used by the editor to inject code automatically:
 *     - `wle:auto-imports:start` and `wle:auto-imports:end`: The list of import statements
 *     - `wle:auto-register:start` and `wle:auto-register:end`: The list of component to register
 */

/* wle:auto-imports:start */
import {AudioListener} from '@wonderlandengine/components';
import {Cursor} from '@wonderlandengine/components';
import {CursorTarget} from '@wonderlandengine/components';
import {FingerCursor} from '@wonderlandengine/components';
import {FixedFoveation} from '@wonderlandengine/components';
import {HandTracking} from '@wonderlandengine/components';
import {OrbitalCamera as OrbitalCamera1} from './orbital-camera.js';
import {PlayerHeight} from '@wonderlandengine/components';
import {TargetFramerate} from '@wonderlandengine/components';
import {TeleportComponent} from '@wonderlandengine/components';
import {VrModeActiveSwitch} from '@wonderlandengine/components';
import {StatsHtmlComponent} from 'wle-stats';
import {AnimationRetarget} from './AnimationRetarget.js';
import {ButtonComponent} from './button.js';
import {SimpleExampleClient} from './client.js';
import {CopyYRotation} from './copy-rotation.js';
import {CopyTransform} from './copy-transform.js';
import {SnapRotate} from './snap-rotate.js';
import {ViverseProviderComponent} from './viverse-provider.js';
import {VrmLoader} from './vrm-loader.js';
import {WasdControlsCustomComponent} from './wasd-controls.js';
/* wle:auto-imports:end */

export default function(engine) {
/* wle:auto-register:start */
engine.registerComponent(AudioListener);
engine.registerComponent(Cursor);
engine.registerComponent(CursorTarget);
engine.registerComponent(FingerCursor);
engine.registerComponent(FixedFoveation);
engine.registerComponent(HandTracking);
engine.registerComponent(OrbitalCamera1);
engine.registerComponent(PlayerHeight);
engine.registerComponent(TargetFramerate);
engine.registerComponent(TeleportComponent);
engine.registerComponent(VrModeActiveSwitch);
engine.registerComponent(StatsHtmlComponent);
engine.registerComponent(AnimationRetarget);
engine.registerComponent(ButtonComponent);
engine.registerComponent(SimpleExampleClient);
engine.registerComponent(CopyYRotation);
engine.registerComponent(CopyTransform);
engine.registerComponent(SnapRotate);
engine.registerComponent(ViverseProviderComponent);
engine.registerComponent(VrmLoader);
engine.registerComponent(WasdControlsCustomComponent);
/* wle:auto-register:end */
}
