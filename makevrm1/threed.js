/**
 * @file threed.js
 */

(function(_global) {

'use strict';

/**
 * 可視化クラス
 */
class Threed {
/**
 * コンストラクタ
 */
    constructor() {
        this.cl = 'Threed';

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

        { // 
            const core = this.gltf?.userData?.vrm;
            if (core) {        
                const exprMgr = core?.expressionManager;
                if (exprMgr) {
                    exprMgr.setValue('aa', 0.5);

                    exprMgr?.update(delta);
                }

                const humanoid = core?.humanoid;
                if (humanoid) {
                    const s = 0.25 * Math.PI * Math.sin(Math.PI * this.clock.elapsedTime);
//                    humanoid.getBoneNode('head').rotation.x = s;
                    humanoid.getBoneNode('rightUpperArm').rotation.z = s;
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

                const constMgr = core?.constraintManager;
                if (constMgr) {
                    constMgr?.update(delta);
                }
            }
        }

        if (this.control) {
            this.control.update();
        }

        this.renderer.render(this.scene, this.camera);
    }

/**
 * 
 * @param {boolean} b 
 */
    toggleLayer(b) {
        if (typeof b === 'boolean') {
            this.isFirstPerson = b;
        } else {
            this.isFirstPerson = !this.isFirstPerson;
        }
        if (this.gltf) {
            const firstPerson = this.gltf?.userData?.vrm?.firstPerson;

            console.log('firstPerson', firstPerson);
            if (this.isFirstPerson) {
                this.camera.layers.enable(firstPerson.firstPersonOnlyLayer);
                this.camera.layers.disable(firstPerson.thirdPersonOnlyLayer);
            } else {
                this.camera.layers.disable(firstPerson.firstPersonOnlyLayer);
                this.camera.layers.enable(firstPerson.thirdPersonOnlyLayer);
            }
        }
    }

/**
 * 初期化する
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
            renderer.setClearColor(new THREE.Color(0x99ccff), 1);
            renderer.setSize(vieww, viewh);

            renderer.outputEncoding = THREE.sRGBEncoding;

            const camera = new THREE.PerspectiveCamera(viewfov, vieww/viewh,
                0.01, 10000);
            camera.position.set(0.1, 1.6, 5);
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
            if (false) {
                const light = new THREE.DirectionalLight(0x666666);
                scene.add(light);
            }
            {
                const axes = new THREE.AxesHelper(20);
                scene.add(axes);

                const grid = new THREE.GridHelper(10, 10);
                grid.position.set(0, 1 * 0, 0);
                scene.add(grid);
            }

            {
                const obj = new THREE.Object3D();
                this.lookTarget = obj;
                camera.add(obj);
            }

            this.renderer = renderer;

            {
                window.addEventListener('keydown', () => {
                    this.toggleLayer();
                });
            }

            return renderer.domElement;
        }

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
 * モデルファイルをセットする
 * @param {string} inurl blob url など
 */
    setModel(inurl) {
        console.log(this.cl, `setModel called, for VRM1.0-beta`);

        const loader = new THREE.GLTFLoader();

        loader.register( ( parser ) => {
            return new THREE_VRM.VRMLoaderPlugin( parser );
        } );

        loader.load(inurl,
            arg => {
                console.log(`VRM load done`, arg);

                this.gltf = arg;

                const vrm = arg.userData.vrm;
                this.scene.add(vrm.scene);
                vrm.scene.name = 'model';

                {
                    window.idthumbnail.src = vrm.meta.thumbnailImage.src;
                }
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
                    this.toggleLayer(true);
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

}


if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Threed;
    }
    exports.Threed = Threed;
} else {
    _global.Threed = Threed;
}

})( (this || 0).self || (typeof self !== 'undefined' ? self : global) );

