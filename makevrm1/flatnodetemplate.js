
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

{"parent": "hips",  "name": "leftUpperLeg" , "r": [0.1, -0.11, 0.01]},
{"parent": "leftUpperLeg",  "name": "leftLowerLeg", "r": [0, -0.4, 0]},
{"parent": "leftLowerLeg",  "name": "leftFoot", "r": [0, -0.35, 0], "sz": [0.03]},
{"parent": "leftFoot",  "name": "leftToes", "pts":[], "r": [0, -0.05, 0.2], "sz": [0.02]},
{"parent": "leftToes", "name": "leftToeEnd", "k": ["exc"], "pts":[], "r": [0,0, 0.05], "sz": [0.01]},

{"parent": "hips",  "name": "rightUpperLeg", "r": [-0.1, -0.11, 0.01]},
{"parent": "rightUpperLeg",  "name": "rightLowerLeg", "r": [0, -0.4, 0]},
{"parent": "rightLowerLeg",  "name": "rightFoot", "r": [0, -0.35, 0], "sz": [0.03]},
{"parent": "rightFoot",  "name": "rightToes", "pts":[], "r": [0, -0.05, 0.2], "sz": [0.02]},
{"parent": "rightToes", "name": "rightToeEnd", "k": ["exc"], "pts":[], "r": [0,0, 0.05], "sz": [0.01]},

{"parent": "hips",  "name": "spine", "r": [0, 0.2, -0.01], "sz": [0.08]},
{"parent": "spine",  "name": "neck", "pts":[], "r": [0, 0.4, 0], "sz": [0.04]},
{"parent": "neck", "name":"head", "pts":[], "r": [0, 0.1, 0.01], "sz": [0.04]},
{"parent": "head", "name": "jaw", "pts": [], "r": [0, -0.05, 0.05], "sz": [0.01]},
{"parent": "head", "name":"leftEye", "pts":[], "r": [0.04, 0, 0.01], "sz": [0.01]},
{"parent": "leftEye", "name":"leftEyeEnd", "pts":[], "k":["exc"], "r": [0,0, 0.1], "sz": [0.02]},
{"parent": "head", "name":"rightEye", "pts":[], "r": [-0.04, 0, 0.01], "sz": [0.01]},
{"parent": "rightEye", "name":"rightEyeEnd", "k": ["exc"], "pts": [], "r": [0,0, 0.1], "sz": [0.02]},

{"parent": "hips", "name": "chest", "r": [0, 0.3, 0], "sz": [0.08], "c": [

{"parent": "chest", "name":"antenna0", "k": ["exc"], "pts":[], "r": [0.0, 0.0, 0.16], "sz":[0.02], "c":[
{"parent": null, "name":"antenna1", "k": ["exc"], "pts":[], "r": [0, 0.0, 0.16], "sz": [0.01], "c":[
{"parent": null, "name":"antenna2", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01], "c": [
{"parent": null, "name":"antenna3", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01], "c": [
{"parent": null, "name":"antenna4", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01], "c": [
{"parent": null, "name":"antenna5", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01], "c": [
{"parent": null, "name":"antenna6", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01], "c": [
{"parent": null, "name":"antenna7", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01], "c": [
{"parent": null, "name":"antenna8", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01], "c": [
{"parent": null, "name":"antenna9", "k": ["exc"], "pts": [], "r":[0, 0.0, 0.16], "sz": [0.01], "c": [

{"parent": "chest", "name": "leftShoulder", "pts":[], "r": [0.1, 0, -0.01], "sz": [0.04], "c":[
{"parent": null,  "name": "leftUpperArm", "r": [0.1, 0, 0], "sz": [0.04], "c": [
{"parent": null,  "name": "leftLowerArm", "r": [0.3, 0, 0], "sz": [0.04], "c": [
{"parent": null,  "name": "leftHand", "r": [0.2, 0, 0], "sz": [0.025]},

{"parent": null,  "name": "leftThumbMetacarpal", "pts":[], "r": [0.05, 0, 0.02], "ci": [2,0,0], "sz": [0.015], "c": [
{"parent": null, "name": "leftThumbProximal", "pts":[], "r": [0.03, 0, 0.02], "ci": [3,0,0], "sz": [0.012], "c": [
{"parent": null,  "name": "leftThumbDistal", "pts":[], "r": [0.03, 0, 0.02], "ci": [4,0,0], "sz": [0.009], "c": [
{"parent": null,  "name": "leftThumbEnd", "k":["exc"], "pts":[], "r": [0.02, 0, 0.01], "ci": [5,0,0], "sz": [0.008] }

{"parent": null,  "name": "leftIndexProximal", "pts":[], "r": [0.095, 0, 0.025], "ci": [0,2,0], "sz": [0.008], "c": [
{"parent": null, "name": "leftIndexIntermediate", "pts":[], "r": [0.06, 0,0], "ci": [0,3,0], "sz": [0.008], "c":[
{"parent": null,  "name": "leftIndexDistal", "pts":[], "r": [0.03, 0,0], "ci": [0,4,0], "sz": [0.007], "c":[
{"parent": null, "name": "leftIndexEnd", "k":["exc"], "pts":[], "r": [0.02,0,0], "ci": [0,5,0], "sz": [0.005]}

{"parent": null,  "name": "leftMiddleProximal", "pts":[], "r": [0.1, 0, -0], "ci": [0,0,2], "sz": [0.008], "c": [
{"parent": null,  "name": "leftMiddleIntermediate", "pts":[], "r": [0.06, 0,0], "ci": [0,0,3], "sz": [0.008], "c":[
{"parent": null,  "name": "leftMiddleDistal", "pts":[], "r": [0.03, 0,0], "ci": [0,0,4], "sz": [0.007], "c":[
{"parent": null, "name":"leftMiddleEnd", "k":["exc"], "pts":[], "r":[0.02,0,0], "ci": [0,0,5], "sz": [0.005]}

{"parent": null,  "name": "leftRingProximal", "pts":[], "r": [0.09, 0, -0.02], "ci": [2,1,0], "sz": [0.008], "c": [
{"parent": null, "name": "leftRingIntermediate", "pts":[], "r": [0.06, 0,0], "ci": [3,2,0], "sz": [0.008], "c":[
{"parent": null,  "name": "leftRingDistal", "pts":[], "r": [0.03, 0,0], "ci": [4,2,0], "sz": [0.007], "c": [
{"parent": null, "name":"leftRingEnd", "k":["exc"], "pts":[], "r":[0.02,0,0], "ci": [5,3,0], "sz": [0.005]}

{"parent": null,  "name": "leftLittleProximal", "pts":[], "r": [0.08, 0, -0.04], "ci": [2,2,0], "sz": [0.008], "c": [
{"parent": null, "name": "leftLittleIntermediate", "pts":[], "r": [0.04, 0, 0], "ci": [3,3,0], "sz": [0.008], "c":[
{"parent": null,  "name": "leftLittleDistal", "pts":[], "r": [0.02, 0, 0], "ci": [4,4,0], "sz": [0.007], "c": [
{"parent": null, "name":"leftLittleEnd", "k":["exc"], "pts":[], "r":[0.015,0,0], "ci":[5,5,0], "sz": [0.004]}

{"parent": "chest", "name": "rightShoulder", "pts":[], "r": [-0.1, 0, -0.01], "sz": [0.04], "c":[
{"parent": null,  "name": "rightUpperArm", "r": [-0.1, 0, 0], "sz": [0.04], "c": [
{"parent": null,  "name": "rightLowerArm", "r": [-0.3, 0,0], "sz": [0.04], "c": [
{"parent": null,  "name": "rightHand", "r": [-0.2, 0,0], "sz": [0.025], "c": [
{"parent": null,  "name": "rightThumbMetacarpal", "pts":[], "r": [-0.05, 0, 0.02], "ci": [3,0,0], "sz": [0.015], "c": [
{"parent": null, "name": "rightThumbProximal", "pts":[], "r": [-0.03, 0, 0.02], "ci": [4,0,0], "sz": [0.012], "c":[
{"parent": null,  "name": "rightThumbDistal", "pts":[], "r": [-0.03, 0, 0.02], "ci": [5,0,0], "sz": [0.009], "c":[
{"parent": null, "name": "rightThumbEnd", "k":["exc"], "pts":[], "r": [-0.02, 0, 0.01], "ci": [5,0,0], "sz": [0.008]}

{"parent": null,  "name": "rightIndexProximal", "pts":[], "r": [-0.095, 0, 0.025], "ci": [0,3,0], "sz": [0.008], "c": [
{"parent": null, "name": "rightIndexIntermediate", "pts":[], "r": [-0.06, 0,0], "ci": [0,4,0], "sz": [0.008], "c":[
{"parent": null,  "name": "rightIndexDistal", "pts":[], "r": [-0.03, 0,0], "ci": [0,5,0], "sz": [0.007], "c":[
{"parent": null, "name": "rightIndexEnd", "k":["exc"], "pts":[], "r": [-0.02, 0,0], "ci": [0,5,0], "sz": [0.005]}

{"parent": null,  "name": "rightMiddleProximal", "pts":[], "r": [-0.1, 0, 0], "ci": [0,0,3], "sz": [0.008], "c": [
{"parent": null, "name": "rightMiddleIntermediate", "pts":[], "r": [-0.06, 0,0], "ci": [0,0,4], "sz": [0.008], "c":[
{"parent": null,  "name": "rightMiddleDistal", "pts":[], "r": [-0.03, 0,0], "ci": [0,0,5], "sz": [0.007], "c":[
{"parent": null, "name":"rightMiddleEnd", "k":["exc"], "pts":[], "r": [-0.020, 0,0], "ci":[0,0,5], "sz": [0.005]}

{"parent": null,  "name": "rightRingProximal", "pts":[], "r": [-0.09, 0, -0.02], "ci": [3,2,0], "sz": [0.008], "c": [
{"parent": null, "name": "rightRingIntermediate", "pts":[], "r": [-0.06, 0,0], "ci": [4,2,0], "sz": [0.008], "c":[
{"parent": null,  "name": "rightRingDistal", "pts":[], "r": [-0.03, 0,0], "ci": [5,3,0], "sz": [0.007], "c":[
{"parent": null, "name": "rightRingEnd", "k":["exc"], "pts":[], "r": [-0.020, 0,0], "ci": [5,3,0], "sz":[0.005]}

{"parent": null,  "name": "rightLittleProximal", "pts":[], "r": [-0.08, 0, -0.04], "ci": [3,3,0], "sz": [0.008], "c": [
{"parent": null, "name": "rightLittleIntermediate", "pts":[], "r": [-0.04, 0,0], "ci": [4,4,0], "sz": [0.008], "c":[
{"parent": null,  "name": "rightLittleDistal", "pts":[], "r": [-0.02, 0,0], "ci": [5,5,0], "sz": [0.007], "c":[
{"parent": null, "name": "rightLittleEnd", "k":["exc"], "pts":[], "r": [-0.015, 0,0], "ci":[5,5,0], "sz": [0.004]}


