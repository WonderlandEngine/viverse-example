export const retargetMap: Record<string, string> = {
	// Root
	hips: "Avatar_Hips",

	// Spine
	spine: "Avatar_Spine",
	chest: "Avatar_Spine1",
	upperChest: "Avatar_Spine2",

	// Neck & Head
	neck: "Avatar_Neck",
	head: "Avatar_Head",

	// Eyes
	leftEye: "Avatar_EyeL",
	rightEye: "Avatar_EyeR",

	// Left Arm
	leftShoulder: "Avatar_LeftShoulder",
	leftUpperArm: "Avatar_LeftArm",
	leftLowerArm: "Avatar_LeftForeArm",
	leftHand: "Avatar_LeftHand",

	// Left Thumb
	leftThumbMetacarpal: "Avatar_LeftHandThumb1",
	leftThumbProximal: "Avatar_LeftHandThumb2",
	leftThumbDistal: "Avatar_LeftHandThumb3",

	// Left Index
	leftIndexProximal: "Avatar_LeftHandIndex1",
	leftIndexIntermediate: "Avatar_LeftHandIndex2",
	leftIndexDistal: "Avatar_LeftHandIndex3",

	// Left Middle
	leftMiddleProximal: "Avatar_LeftHandMiddle1",
	leftMiddleIntermediate: "Avatar_LeftHandMiddle2",
	leftMiddleDistal: "Avatar_LeftHandMiddle3",

	// Left Ring
	leftRingProximal: "Avatar_LeftHandRing1",
	leftRingIntermediate: "Avatar_LeftHandRing2",
	leftRingDistal: "Avatar_LeftHandRing3",

	// Left Little
	leftLittleProximal: "Avatar_LeftHandPinky1",
	leftLittleIntermediate: "Avatar_LeftHandPinky2",
	leftLittleDistal: "Avatar_LeftHandPinky3",

	// Right Arm
	rightShoulder: "Avatar_RightShoulder",
	rightUpperArm: "Avatar_RightArm",
	rightLowerArm: "Avatar_RightForeArm",
	rightHand: "Avatar_RightHand",

	// Right Thumb
	rightThumbMetacarpal: "Avatar_RightHandThumb1",
	rightThumbProximal: "Avatar_RightHandThumb2",
	rightThumbDistal: "Avatar_RightHandThumb3",

	// Right Index
	rightIndexProximal: "Avatar_RightHandIndex1",
	rightIndexIntermediate: "Avatar_RightHandIndex2",
	rightIndexDistal: "Avatar_RightHandIndex3",

	// Right Middle
	rightMiddleProximal: "Avatar_RightHandMiddle1",
	rightMiddleIntermediate: "Avatar_RightHandMiddle2",
	rightMiddleDistal: "Avatar_RightHandMiddle3",

	// Right Ring
	rightRingProximal: "Avatar_RightHandRing1",
	rightRingIntermediate: "Avatar_RightHandRing2",
	rightRingDistal: "Avatar_RightHandRing3",

	// Right Little
	rightLittleProximal: "Avatar_RightHandPinky1",
	rightLittleIntermediate: "Avatar_RightHandPinky2",
	rightLittleDistal: "Avatar_RightHandPinky3",

	// Left Leg
	leftUpperLeg: "Avatar_LeftUpLeg",
	leftLowerLeg: "Avatar_LeftLeg",
	leftFoot: "Avatar_LeftFoot",
	leftToes: "Avatar_LeftToeBase",

	// Right Leg
	rightUpperLeg: "Avatar_RightUpLeg",
	rightLowerLeg: "Avatar_RightLeg",
	rightFoot: "Avatar_RightFoot",
	rightToes: "Avatar_RightToeBase",
};

export const fingerRemap: Record<
	string,
	[axis: [number, number, number], angle: number]
> = {
	// index
	Avatar_LeftHandIndex1: [[1, 0, 0], Math.PI / 2],
	Avatar_LeftHandIndex2: [[1, 0, 0], Math.PI / 2],
	Avatar_LeftHandIndex3: [[1, 0, 0], Math.PI / 2],
	Avatar_RightHandIndex1: [[1, 0, 0], Math.PI / 2],
	Avatar_RightHandIndex2: [[1, 0, 0], Math.PI / 2],
	Avatar_RightHandIndex3: [[1, 0, 0], Math.PI / 2],

	// middle
	Avatar_LeftHandMiddle1: [[1, 0, 0], Math.PI / 2],
	Avatar_LeftHandMiddle2: [[1, 0, 0], Math.PI / 2],
	Avatar_LeftHandMiddle3: [[1, 0, 0], Math.PI / 2],
	Avatar_RightHandMiddle1: [[1, 0, 0], Math.PI / 2],
	Avatar_RightHandMiddle2: [[1, 0, 0], Math.PI / 2],
	Avatar_RightHandMiddle3: [[1, 0, 0], Math.PI / 2],

	// ring
	Avatar_LeftHandRing1: [[1, 0, 0], Math.PI / 2],
	Avatar_LeftHandRing2: [[1, 0, 0], Math.PI / 2],
	Avatar_LeftHandRing3: [[1, 0, 0], Math.PI / 2],
	Avatar_RightHandRing1: [[1, 0, 0], Math.PI / 2],
	Avatar_RightHandRing2: [[1, 0, 0], Math.PI / 2],
	Avatar_RightHandRing3: [[1, 0, 0], Math.PI / 2],

	// pinky
	Avatar_LeftHandPinky1: [[1, 0, 0], Math.PI / 2],
	Avatar_LeftHandPinky2: [[1, 0, 0], Math.PI / 2],
	Avatar_LeftHandPinky3: [[1, 0, 0], Math.PI / 2],
	Avatar_RightHandPinky1: [[1, 0, 0], Math.PI / 2],
	Avatar_RightHandPinky2: [[1, 0, 0], Math.PI / 2],
	Avatar_RightHandPinky3: [[1, 0, 0], Math.PI / 2],

	Avatar_LeftArm: [[1, 0, 0], Math.PI / 2],
	Avatar_RightArm: [[1, 0, 0], Math.PI / 2],

	Avatar_LeftHand: [[1, 0, 0], -Math.PI * 0.5],
	Avatar_RightHand: [[1, 0, 0], -Math.PI * 0.5],
};
