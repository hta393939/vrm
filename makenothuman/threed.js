/**
 * @file threed.js
 */

'use strict';

class Threed {
    constructor() {
        this.NAME = 'Threed';
        this.cl = this.constructor.name;

        this.basets = Date.now();

        this.baseTex = null;
        this.normalTex = null;
        this.emissTex = null;
        this.occlTex = null;

        this.baseTex2 = null;
        this.normalTex2 = null;
        this.emissTex2 = null;
        this.occlTex2 = null;
    }

    makeControl(dom) {
        const control = new THREE.OrbitControls(this.camera, dom);
        this.control = control;
    }

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


    update() {
        const nowts = Date.now();
        const pastts = nowts - this.basets;

        if (this.control) {
            this.control.update();
        }

        {
            const obj = this.scene.getObjectByName('model');
            if (obj) {
                obj.skeleton.bones[0].rotation.y = pastts * 0.001;
                const b = obj.skeleton.bones?.[20];
                if (b) {
                    b.rotation.x = pastts * 0.001;
                }
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    init(vieww, viewh, viewfov) {
        console.log(this.cl, `init called`);
        this.vieww = vieww;
        this.viewh = viewh;
        this.viewfov = viewfov;

        {
            const renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true, preserveDrawingBuffer: true
            });
            renderer.setClearColor(new THREE.Color(0x99ccff), 1);
            renderer.setSize(vieww, viewh);

            const camera = new THREE.PerspectiveCamera(viewfov, vieww/viewh,
                0.01, 10000);
            camera.position.set(0.1, 1.6, 2);
            camera.up.set(0,1,0);
            camera.lookAt(new THREE.Vector3(0, 1.7, 0));
            this.camera = camera;

            const scene = new THREE.Scene();
            this.scene = scene;

            {
                const light = new THREE.DirectionalLight(0x999999);
                light.position.set(-1,1, 1);
                scene.add(light);
            }
            {
                const light = new THREE.AmbientLight(0x333333);
                scene.add(light);
            }
            {
                const light = new THREE.DirectionalLight(0x666666);
                scene.add(light);
            }
            {
                const axes = new THREE.AxesHelper(20);
                scene.add(axes);

                const grid = new THREE.GridHelper(10, 10);
                grid.position.set(0, 1, 0);
                scene.add(grid);
            }

            this.renderer = renderer;

            return renderer.domElement;
        }

    }

    setWire(wire) {
        const obj = this.scene.getObjectByName('model');
        if (obj) {
            obj.material.wireframe = wire;

            console.log(``);
        }
    }

    setVisible(name, visible) {
        const obj = this.scene.getObjectByName(name);
        if (obj) {
            obj.visible = visible;
        }
    }

/**
 * ツリーをフラット配列に変更する
 * @param {THREE.Bone} inroot 
 */
    treeToFlat(inroot) {
        const ret = {bones: [], mats: []};
        
        const eigen = new THREE.Matrix4();
        eigen.makeTranslation(0,-1,0);
        console.log(`eigen`, eigen);

        const f = (_bs, _ms, obj) => {
            _bs.push(obj);
            _ms.push(eigen);

            if ('children' in obj) {
                obj.children.forEach(v=>{
                    f(_bs, _ms, v);
                });
            }
        };

        f(ret.bones, ret.mats, inroot);
        return ret;
    }

    setModel(inurl) {
        console.log(this.NAME, `setModel called`);
        const loader = new THREE.GLTFLoader();
        loader.register(parser => {
            return new THREE.VRMLoaderPlugin(parser);
        });
        loader.load(inurl,
            gltf => {
                console.log(`VRM load done`, gltf);
                const vrm = gltf;
                this.scene.add(vrm.scene);
            },
            progress => {
                //console.log(`load progress`, arg);
            },
            arg => {
                console.log(`load err`, arg);
            });
    }

}


