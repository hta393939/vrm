
/**
 * @file flatnodetemplate.js
 * MIT License (c) 2018- Usagi
 */

// for vrm 1.0 -x に右手、+x に左手がいくタイプ
// 親指書き換え済み

'use strict';

const _flattree = [
{"parent": null, "name": "Armature", "k": ["exc"], "pts":[], "r": [0,0,0], "sz": [0.0] },
{"parent": "Armature", "name": "hips", "r": [0, 0.9, 0], "sz": [0.08]},

{"parent": "hips", "name": "leftUpperLeg" , "r": [0.1, -0.11, 0.01]},
{"parent": "leftUpperLeg", "name": "leftLowerLeg", "r": [0, -0.4, 0]},
{"parent": "leftLowerLeg", "name": "leftFoot", "r": [0, -0.35, 0], "sz": [0.03]},
{"parent": "leftFoot", "name": "leftToes", "pts":[], "r": [0, -0.05, 0.2], "sz": [0.02]},
{"parent": "leftToes", "name": "leftToeEnd", "k": ["exc"], "pts":[], "r": [0,0, 0.05], "sz": [0.01]},

{"parent": "hips", "name": "rightUpperLeg", "r": [-0.1, -0.11, 0.01]},
{"parent": "rightUpperLeg", "name": "rightLowerLeg", "r": [0, -0.4, 0]},
{"parent": "rightLowerLeg", "name": "rightFoot", "r": [0, -0.35, 0], "sz": [0.03]},
{"parent": "rightFoot", "name": "rightToes", "pts":[], "r": [0, -0.05, 0.2], "sz": [0.02]},
{"parent": "rightToes", "name": "rightToeEnd", "k": ["exc"], "pts":[], "r": [0,0, 0.05], "sz": [0.01]},

{"parent": "hips", "name": "spine", "r": [0, 0.2, -0.01], "sz": [0.08]},
{"parent": "spine", "name": "chest", "r": [0, 0.3, 0], "sz": [0.08]},
{"parent": "chest", "name": "neck", "pts":[], "r": [0, 0.1, 0], "sz": [0.04]},
{"parent": "neck", "name":"head", "pts":[], "r": [0, 0.1, 0.01], "sz": [0.04]},
{"parent": "head", "name": "jaw", "k": ["exc"], "pts": [], "r": [0, -0.05, 0.05], "sz": [0.01]},
{"parent": "head", "name":"leftEye", "pts":[], "r": [0.04, 0, 0.01], "sz": [0.01]},
{"parent": "leftEye", "name":"leftEyeEnd", "pts":[], "k":["exc"], "r": [0,0, 0.1], "sz": [0.02]},
{"parent": "head", "name":"rightEye", "pts":[], "r": [-0.04, 0, 0.01], "sz": [0.01]},
{"parent": "rightEye", "name":"rightEyeEnd", "k": ["exc"], "pts": [], "r": [0,0, 0.1], "sz": [0.02]},

{"parent":"chest",    "name":"antenna0", "k": ["exc"], "pts": [], "r":[0.0, 0.0, 0.16], "sz":[0.02]},
{"parent":"antenna0", "name":"antenna1", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01]},
{"parent":"antenna1", "name":"antenna2", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01]},
{"parent":"antenna2", "name":"antenna3", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01]},
{"parent":"antenna3", "name":"antenna4", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01]},
{"parent":"antenna4", "name":"antenna5", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01]},
{"parent":"antenna5", "name":"antenna6", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01]},
{"parent":"antenna6", "name":"antenna7", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01]},
{"parent":"antenna7", "name":"antenna8", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01]},
{"parent":"antenna8", "name":"antenna9", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01]},

{"parent": "chest", "name": "leftShoulder", "pts":[], "r": [0.1, 0, -0.01], "sz": [0.04]},
{"parent": "leftShoulder", "name": "leftUpperArm", "r": [0.1, 0, 0], "sz": [0.04]},
{"parent": "leftUpperArm", "name": "leftLowerArm", "r": [0.3, 0, 0], "sz": [0.04]},
{"parent": "leftLowerArm", "name": "leftHand", "r": [0.2, 0, 0], "sz": [0.025]},

{"parent": "leftHand", "name": "leftThumbMetacarpal", "pts":[], "r": [0.05, 0, 0.02], "ci": [2,0,0], "sz": [0.015]},
{"parent": "leftThumbMetacarpal", "name": "leftThumbProximal", "pts":[], "r": [0.03, 0, 0.02], "ci": [3,0,0], "sz": [0.012]},
{"parent": "leftThumbProximal", "name": "leftThumbDistal", "pts":[], "r": [0.03, 0, 0.02], "ci": [4,0,0], "sz": [0.009]},
{"parent": "leftThumbDistal", "name": "leftThumbEnd", "k":["exc"], "pts":[], "r": [0.02, 0, 0.01], "ci": [5,0,0], "sz": [0.008] },

{"parent": "leftHand",  "name": "leftIndexProximal", "pts":[], "r": [0.095, 0, 0.025], "ci": [0,2,0], "sz": [0.008]},
{"parent": "leftIndexProximal", "name": "leftIndexIntermediate", "pts":[], "r": [0.06, 0,0], "ci": [0,3,0], "sz": [0.008]},
{"parent": "leftIndexIntermediate",  "name": "leftIndexDistal", "pts":[], "r": [0.03, 0,0], "ci": [0,4,0], "sz": [0.007]},
{"parent": "leftIndexDistal", "name": "leftIndexEnd", "k":["exc"], "pts":[], "r": [0.02,0,0], "ci": [0,5,0], "sz": [0.005]},

{"parent": "leftHand",  "name": "leftMiddleProximal", "pts":[], "r": [0.1, 0, -0], "ci": [0,0,2], "sz": [0.008]},
{"parent": "leftMiddleProximal",  "name": "leftMiddleIntermediate", "pts":[], "r": [0.06, 0,0], "ci": [0,0,3], "sz": [0.008]},
{"parent": "leftMiddleIntermediate",  "name": "leftMiddleDistal", "pts":[], "r": [0.03, 0,0], "ci": [0,0,4], "sz": [0.007]},
{"parent": "leftMiddleDistal", "name":"leftMiddleEnd", "k":["exc"], "pts":[], "r":[0.02,0,0], "ci": [0,0,5], "sz": [0.005]},

{"parent": "leftHand",  "name": "leftRingProximal", "pts":[], "r": [0.09, 0, -0.02], "ci": [2,1,0], "sz": [0.008]},
{"parent": "leftRingProximal", "name": "leftRingIntermediate", "pts":[], "r": [0.06, 0,0], "ci": [3,2,0], "sz": [0.008]},
{"parent": "leftRingIntermediate",  "name": "leftRingDistal", "pts":[], "r": [0.03, 0,0], "ci": [4,2,0], "sz": [0.007]},
{"parent": "leftRingDistal", "name":"leftRingEnd", "k":["exc"], "pts":[], "r":[0.02,0,0], "ci": [5,3,0], "sz": [0.005]},

{"parent": "leftHand",  "name": "leftLittleProximal", "pts":[], "r": [0.08, 0, -0.04], "ci": [2,2,0], "sz": [0.008]},
{"parent": "leftLittleProximal", "name": "leftLittleIntermediate", "pts":[], "r": [0.04, 0, 0], "ci": [3,3,0], "sz": [0.008]},
{"parent": "leftLittleIntermediate",  "name": "leftLittleDistal", "pts":[], "r": [0.02, 0, 0], "ci": [4,4,0], "sz": [0.007]},
{"parent": "leftLittleDistal", "name":"leftLittleEnd", "k":["exc"], "pts":[], "r":[0.015,0,0], "ci":[5,5,0], "sz": [0.004]},

{"parent": "chest", "name": "rightShoulder", "pts":[], "r": [-0.1, 0, -0.01], "sz": [0.04]},
{"parent": "rightShoulder",  "name": "rightUpperArm", "r": [-0.1, 0, 0], "sz": [0.04]},
{"parent": "rightUpperArm",  "name": "rightLowerArm", "r": [-0.3, 0,0], "sz": [0.04]},
{"parent": "rightLowerArm",  "name": "rightHand", "r": [-0.2, 0,0], "sz": [0.025]},

{"parent": "rightHand",  "name": "rightThumbMetacarpal", "pts":[], "r": [-0.05, 0, 0.02], "ci": [3,0,0], "sz": [0.015]},
{"parent": "rightThumbMetacarpal", "name": "rightThumbProximal", "pts":[], "r": [-0.03, 0, 0.02], "ci": [4,0,0], "sz": [0.012]},
{"parent": "rightThumbProximal",  "name": "rightThumbDistal", "pts":[], "r": [-0.03, 0, 0.02], "ci": [5,0,0], "sz": [0.009]},
{"parent": "rightThumbDistal", "name": "rightThumbEnd", "k":["exc"], "pts":[], "r": [-0.02, 0, 0.01], "ci": [5,0,0], "sz": [0.008]},

{"parent": "rightHand",  "name": "rightIndexProximal", "pts":[], "r": [-0.095, 0, 0.025], "ci": [0,3,0], "sz": [0.008]},
{"parent": "rightIndexProximal", "name": "rightIndexIntermediate", "pts":[], "r": [-0.06, 0,0], "ci": [0,4,0], "sz": [0.008]},
{"parent": "rightIndexIntermediate",  "name": "rightIndexDistal", "pts":[], "r": [-0.03, 0,0], "ci": [0,5,0], "sz": [0.007]},
{"parent": "rightIndexDistal", "name": "rightIndexEnd", "k":["exc"], "pts":[], "r": [-0.02, 0,0], "ci": [0,5,0], "sz": [0.005]},

{"parent": "rightHand",  "name": "rightMiddleProximal", "pts":[], "r": [-0.1, 0, 0], "ci": [0,0,3], "sz": [0.008]},
{"parent": "rightMiddleProximal", "name": "rightMiddleIntermediate", "pts":[], "r": [-0.06, 0,0], "ci": [0,0,4], "sz": [0.008]},
{"parent": "rightMiddleIntermediate",  "name": "rightMiddleDistal", "pts":[], "r": [-0.03, 0,0], "ci": [0,0,5], "sz": [0.007]},
{"parent": "rightMiddleDistal", "name":"rightMiddleEnd", "k":["exc"], "pts":[], "r": [-0.020, 0,0], "ci":[0,0,5], "sz": [0.005]},

{"parent": "rightHand",  "name": "rightRingProximal", "pts":[], "r": [-0.09, 0, -0.02], "ci": [3,2,0], "sz": [0.008]},
{"parent": "rightRingProximal", "name": "rightRingIntermediate", "pts":[], "r": [-0.06, 0,0], "ci": [4,2,0], "sz": [0.008]},
{"parent": "rightRingIntermediate",  "name": "rightRingDistal", "pts":[], "r": [-0.03, 0,0], "ci": [5,3,0], "sz": [0.007]},
{"parent": "rightRingDistal", "name": "rightRingEnd", "k":["exc"], "pts":[], "r": [-0.020, 0,0], "ci": [5,3,0], "sz":[0.005]},

{"parent": "rightHand",  "name": "rightLittleProximal", "pts":[], "r": [-0.08, 0, -0.04], "ci": [3,3,0], "sz": [0.008]},
{"parent": "rightLittleProximal", "name": "rightLittleIntermediate", "pts":[], "r": [-0.04, 0,0], "ci": [4,4,0], "sz": [0.008]},
{"parent": "rightLittleIntermediate",  "name": "rightLittleDistal", "pts":[], "r": [-0.02, 0,0], "ci": [5,5,0], "sz": [0.007]},
{"parent": "rightLittleDistal", "name": "rightLittleEnd", "k":["exc"], "pts":[], "r": [-0.015, 0,0], "ci":[5,5,0], "sz": [0.004]},

{"parent":"rightLowerArm", "name":"antenna20", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01]},
{"parent":"antenna20", "name":"antenna21", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01]},
{"parent":"antenna21", "name":"antenna22", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01]},
{"parent":"antenna22", "name":"antenna23", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01]},
{"parent":"antenna23", "name":"antenna24", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01]},
{"parent":"antenna24", "name":"antenna25", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01]},
{"parent":"antenna25", "name":"antenna26", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01]},
{"parent":"antenna26", "name":"antenna27", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01]},
{"parent":"antenna27", "name":"antenna28", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01]},
{"parent":"antenna28", "name":"antenna29", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01]}


];


