/*!
 * threed.mjs
 * Copyright (c) 2024- Usagi ウサギ
 * This software is released under the MIT License.
 */

import * as THREE from 'three';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from 'jsm/three-vrm.module.min.2.1.1.js';
import { createVRMAnimationClip, VRMAnimationLoaderPlugin, VRMLookAtQuaternionProxy }
    from 'jsm/three-vrm-animation.module.min.2.1.1.js';

const _torad = v => v * Math.PI / 180;

/**
 * 可視化クラス
 */
export class Threed {
/**
 * コンストラクタ
 */
    constructor() {
        this.cl = 'Threed';

        this.basets = Date.now();

        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.vrm = null;
    }

    makeControl(dom) {
        const control = new OrbitControls(this.camera, dom);
        this.control = control;

        control.target = new THREE.Vector3(0, 1, 0);
    }

    /**
     * three.js メッシュを返す
     */
    /*
    makeMesh() {
        const _this = this;
        console.log(`${_this.NAME}#makeMesh called`);
        {
            _this.packing.makeBuffer();
            const il = new THREE.InterleavedBuffer(_this.packing.buf, _this.packing.attrLen);

            const geo = new THREE.BufferGeometry();
            geo.addAttribute('position', new THREE.InterleavedBufferAttribute(il, 3, 0));
            geo.addAttribute('normal', new THREE.InterleavedBufferAttribute(il, 3, 3));
            geo.addAttribute('uv', new THREE.InterleavedBufferAttribute(il, 2, 6));

            geo.setIndex(new THREE.BufferAttribute(_this.packing.fbuf, 1));

            const mtl = new THREE.MeshStandardMaterial({
                color: 0x80ff80,
                wireframe: true
            });
            const m = new THREE.Mesh(geo, mtl);
            console.log(`${_this.NAME}#makeMesh leave`, m, _this.packing);

            return m;
        }
    }*/

    /**
     * 最終ボーンを計算する
     * @param {{p,q}[]} rots 
     * @param {number} topo 位相
     */
    calcBone(rots, topo) {
        const n = rots.length;
        const obj = new THREE.Object3D();
        for (let i = n - 1; i >= 0; --i) {
                const v = rots[i];

                const q1 = v.q(topo).quaternion;
                obj.position.applyQuaternion(q1);
                obj.position.add(v.p(topo));

                obj.quaternion.multiplyQuaternions(q1, obj.quaternion);
        }
        return obj;
    }

/**
 * 高頻度に呼び出される
 */
    update() {
        const nowts = Date.now();
        const pastts = nowts - this.basets;

        const delta = this.clock.getDelta();

        if (this.control) {
            this.control.update();
        }

        { // 
            const core = this.gltf?.userData?.vrm;
            if (core) {        
                const exprMgr = core?.expressionManager;
                if (exprMgr) {
                    exprMgr.setValue('aa', 1);

                    exprMgr?.update(delta);
                }

                const humanoid = core?.humanoid;
                if (humanoid && true) {
                    
                    const s = 0.25 * Math.PI * Math.sin(Math.PI * this.clock.elapsedTime);
//                    humanoid.getBoneNode('head').rotation.x = s;
                    humanoid.getRawBoneNode('rightUpperArm').rotation.z = s * 0.02;
                    humanoid.getRawBoneNode('leftUpperArm').rotation.z =
                        0.25 * Math.PI * Math.sin(Math.PI * this.clock.elapsedTime + Math.PI * 0.5);

                    humanoid.getRawBoneNode('hips').rotation.z = s * 0.004;
                }

                const lookAt = core?.lookAt;
                if (lookAt) {
                    lookAt?.update(delta);
                }

                const springMgr = core?.springBoneManager;
                if (springMgr) {
                    springMgr?.update(delta);
                    window.idspringview.textContent = `exist`;
                }

                const ctrMgr = this.gltf?.userData?.vrmNodeConstraintManager;
                if (ctrMgr) {
                    ctrMgr?.update(delta);
                }
            }

            this.mixer?.update(delta);
            this.vrm?.update(delta);
        }



        this.renderer.render(this.scene, this.camera);
    }

/**
 * 初期化する
 * @param {{canvas:HTMLCanvasElement}} inopt 
 */
    init(inopt, vieww, viewh, viewfov) {
        console.log(this.cl, `init called`);
        this.vieww = vieww;
        this.viewh = viewh;
        this.viewfov = viewfov;

        this.clock = new THREE.Clock();

        {
            const renderer = new THREE.WebGLRenderer({
                canvas: inopt.canvas,
                antialias: true,
                alpha: true, preserveDrawingBuffer: true
            });
//            const clearColor = 0x99ccff;
            const clearColor = 0x333333;
            renderer.setClearColor(new THREE.Color(clearColor), 1);
            renderer.setSize(vieww, viewh, false);

            renderer.outputEncoding = THREE.sRGBEncoding;

            const camera = new THREE.PerspectiveCamera(viewfov, vieww/viewh,
                0.01, 10000);
            camera.position.set(0.1, 1.6, 2.5);
            camera.up.set(0,1,0);
            camera.lookAt(new THREE.Vector3(0, 1.7, 0));
            this.camera = camera;

            const scene = new THREE.Scene();
            this.scene = scene;

            {
                const color = 0xffffff;
                const light = new THREE.DirectionalLight(color);
                light.position.set(-1, 1, 1);
                scene.add(light);
            }
            {
                const color = 0xffffff;
                const light = new THREE.AmbientLight(color);
                scene.add(light);
            }
            if (false) {
                const light = new THREE.DirectionalLight(0x666666);
                scene.add(light);
            }
            {
                const axes = new THREE.AxesHelper(20);
                axes.position.set(0, 0.004, 0);
                scene.add(axes);

                const grid = new THREE.GridHelper(10, 10);
                grid.position.set(0, 0.0, 0);
                scene.add(grid);
            }

            {
                const obj = new THREE.Object3D();
                this.lookTarget = obj;
                camera.add(obj);
            }

            this.renderer = renderer;
        }

        this.setModel(inopt.model);
    }

/**
 * ワイヤーフレームを有効化する
 * @param {boolean} wire 
 */
    setWire(wire) {
        const obj = this.scene.getObjectByName('skinnode');

        const mtl = obj?.material;
        if (mtl) {
            mtl.wireframe = wire;

            console.log(`wireframe`, wire);
        }
    }

/**
 * 
 * @param {string} name 
 * @param {boolean} visible 
 */
    setVisible(name, visible) {
        const obj = this.scene.getObjectByName(name);
        if (obj) {
            obj.visible = visible;
        }
    }

/**
 * 
 * @see https://github.com/pixiv/three-vrm/blob/dev/packages/three-vrm-animation/examples/loader-plugin.html
 * @param {string} inurl 
 */
    async setAnimation(inurl) {
        const vrm = this.vrm;

        const gltfVrma = await this.loader.loadAsync(inurl);
        const vrmAnimation = gltfVrma.userData.vrmAnimations[0];

        const clip = createVRMAnimationClip(vrmAnimation, vrm);
        const mixer = new THREE.AnimationMixer(vrm.scene);
        this.mixer = mixer;
        mixer.clipAction(clip).play();
    }

/**
 * ツリーをフラット配列に変更する
 * @param {THREE.Bone} inroot 
 */
    treeToFlat(inroot) {
        console.log('treeToFlat called');

        const ret = {bones: [], mats: []};
        
        const eigen = new THREE.Matrix4();
        eigen.makeTranslation(0,-1,0);
        console.log(`eigen`, eigen);

        const f = (_bs, _ms, obj) => {
            _bs.push(obj);
            _ms.push(eigen);

            if (Array.isArray(obj.children)) {
                for (const v of obj.children) {
                    f(_bs, _ms, v);
                }
            }
        };

        f(ret.bones, ret.mats, inroot);
        return ret;
    }


/**
 * モデルファイルを読み取ってセットする
 * @see https://github.com/pixiv/three-vrm/blob/dev/packages/three-vrm-animation/examples/loader-plugin.html
 * @param {string} inurl blob url など
 */
    setModel(inurl) {
        console.log(`!!! setModel called, for VRM1.0`);
        //return;

        const loader = new GLTFLoader();
        this.loader = loader;

        loader.register( ( parser ) => {
            return new VRMLoaderPlugin( parser );
        } );
        loader.register( ( parser ) => {
            return new VRMAnimationLoaderPlugin( parser );
        } );

        //loader.setPath('');
        //loader.setResourcePath('');
        loader.load(inurl,
            arg => {
                console.log(`VRM load done`, arg);


                this.gltf = arg;

                const vrm = arg.userData.vrm;
                this.vrm = vrm;
                VRMUtils.removeUnnecessaryVertices(vrm.scene);
                VRMUtils.removeUnnecessaryJoints(vrm.scene);
				vrm.scene.traverse(obj => {
					obj.frustumCulled = false;
				});

				const lookAtQuatProxy = new VRMLookAtQuaternionProxy(vrm.lookAt);
				lookAtQuatProxy.name = 'lookAtQuaternionProxy';
				vrm.scene.add(lookAtQuatProxy);

                this.scene.add(vrm.scene);
                vrm.scene.name = 'model';

                {
                    const lookAt = vrm?.lookAt;
                    if (lookAt) {
                        lookAt.target = this.lookTarget;
                    }
                }
                {
                    const firstPerson = vrm?.firstPerson;
                    firstPerson.setup();

                    this.isFirstPerson = false;
                }

                { // constraint
// https://github.com/pixiv/three-vrm/blob/1.0/packages/three-vrm-node-constraint/examples/aim.html
//                    const constraintManager = new THREE_VRM_NODE_CONSTRAINT.VRMNodeConstraintManager({
//                        autoRemoveCircularDependency: true
//                    });
//                    this.constraintManager = constraintManager;

                    // constraint を作る
                    // add する
                    //     helper 作る
                    //     scene に足す

                    //this.scene.updateMatrixWorld();
                    arg.userData.vrmNodeConstraintManager?.setInitState();
                }


            },
            progress => {
                const per = 100.0 * progress.loaded / progress.total;
                console.log(`vrm load progress`, per);
            },
            error => {
                console.log(`vrm load err`, error);
            });
    }

/**
 * 
 * @param {{targetname: string, erot: [number,number,number]}} data 
 */
    setOneJoint(data) {
        const humanoid = this.vrm?.humanoid;
        if (!humanoid) {
            return;
        }
        const rawbone = humanoid.getNormalizedBone(data.targetname);
        rawbone.node.rotation.set(
            ...(data.erot.map(v => v * Math.PI / 180)),
            'YXZ');
    }

}


