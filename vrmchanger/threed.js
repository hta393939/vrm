/// <reference path="./index.d.ts" />

'use strict';

class Packing {
    /**
     * コンストラクタ 
     */
    constructor() {
        this.attrs = [
            {num: 3, name: 'position', id: 'p'},
            {num: 3, name: 'normal', id: 'n'},
            {num: 2, name: 'uv', id: 'uv'},
//            {num: 3, name: 'tangent', id: 'tan'},
//            {num: 4, name: 'weight', id: 'weight'},
//            {num: 4, name: 'joint', id: 'joint'},
        ];

/**
 * 頂点情報配列
 */
        this.vs = [];
/**
 * 頂点インデックス配列
 */
        this.fis = [];

/**
 * 頂点情報を一列に並べた TypedArray
 */
        this.buf = new Float32Array(0);
/**
 * 属性成分の総数
 */
        this.attrLen = 0;
/**
 * 頂点インデックスアレイ
 */
        this.fbuf = new Uint32Array();

        this.NAME = 'Packing';
    }

    /**
     * 頂点情報の配列から1つのTypedArrayを作成して内部にセットする
     */
    makeBuffer() {
        const _this = this;
        console.log(`!!! ${_this.NAME}#makeBuffer called`);
        const vs = _this.vs;
        const n = vs.length;
        const attrLen = _this.attrs.reduce((pre, v)=>{
            return (pre + v.num);
        }, 0);
        //console.log('attrLen', attrLen);

        const buf = new Float32Array(n * attrLen);
        vs.forEach((v, i)=>{
            let c = i * attrLen;
            _this.attrs.forEach(v2=>{
                const num = v2.num;
                const id = v2.id;
                if (num >= 1) {
                    buf[c] = v[id].x;
                }
                if (num >= 2) {
                    buf[c+1] = v[id].y;
                }
                if (num >= 3) {
                    buf[c+2] = v[id].z;
                }
                if (num >= 4) {
                    buf[c+3] = v[id].w;
                }

                c += num;
            });          

        });
        _this.buf = buf;
        _this.attrLen = attrLen;

        const fn = _this.fis.length;
        const fbuf = new Uint32Array(3 * fn);
        for (let i = 0; i < fn; ++i) {
            fbuf[i*3  ] = _this.fis[i][0];
            fbuf[i*3+1] = _this.fis[i][1];
            fbuf[i*3+2] = _this.fis[i][2];
        }
        _this.fbuf = fbuf;
    }

}

class Threed {
    constructor() {
        this.packing = new Packing();

        this.NAME = 'Threed';

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
        const _this = this;

        const control = new THREE.OrbitControls(_this.camera, dom);

        _this.control = control;
    }

    /**
     * three.js メッシュを返す
     */
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

    /**
     * 頂点の配列を作る
     * vs, fis に格納される
     */
    makeVertex() {
        const _this = this;
        console.log(`${_this.NAME}#makeVertex called`);
        _this.packing.vs = [];
        _this.packing.fis = [];

        const vs = _this.packing.vs;
        const fis = _this.packing.fis;
        {
            const gr = new THREE.Group();
            gr.name = 'axes';
            gr.visible = false;
            _this.scene.add(gr);

            let div = 16;
//            div = 12;
            let belt = 512;
//            belt = 128;

            const rots = [
                {
                    p: (t) => { return new THREE.Vector3(0,0,0); },
                    q: (t)=>{
                        let topo = (t === 1) ? 0 : t * 1;
                        return new THREE.Object3D().rotateZ(topo);
                    }
                },
                {
                    p: (t) => { return new THREE.Vector3(0,5,0); },
                    q: (t)=>{
                        let topo = (t === 1) ? 0 : t * 9;
                        return new THREE.Object3D().rotateX(topo);
                    }
                },
                {
                    p: (t) =>{ return new THREE.Vector3(5, 0, 5);},
                    q: (t)=>{
                        let topo = 0;
                        return new THREE.Object3D().rotateZ(topo);
                    }
                },

            ];
            const rr = 1;

            for (let i = 0; i <= belt; ++i) {
                const topo = i / belt * 2 * Math.PI;

                const obj = _this.calcBone(rots, topo);

                const p0 = _this.calcBone(rots, topo - 1/65536);
                const p2 = _this.calcBone(rots, topo + 1/65536);

                let up = new THREE.Vector3().subVectors(obj.position, p0.position);
                let face = new THREE.Vector3().subVectors(p2.position, p0.position);
                // face が Z+ のとき X+ の左手
                let left = new THREE.Vector3().crossVectors(up, face);

                if (left.length() !== 0) {
                    up.crossVectors(face, left);
                    face.crossVectors(left, up);

                    left.normalize();
                    up.normalize();
                    face.normalize();

                    const m = new THREE.Matrix4();
                    
                    m.fromArray([left.x,left.y,left.z,0,
                        up.x,up.y,up.z, 0,
                        face.x,face.y,face.z, 0,
                        0,0,0,1]);
                    obj.quaternion.setFromRotationMatrix(m);
                }

                {
                    const axes = new THREE.AxesHelper(3);
                    axes.position.copy(obj.position);
                    axes.quaternion.copy(obj.quaternion);
                    gr.add(axes);
                }

                for (let j = 0; j <= div; ++j) {
                    const ang = j / div * 2 * Math.PI;
                    let cs = Math.cos(ang);
                    let sn = Math.sin(ang);
                    if (j === div/4) {
                        cs = 0;
                        sn = 1;
                    }
                    if (j === div/2) {
                        cs = -1;
                        sn = 0;
                    }
                    if (j === div*3/4) {
                        cs = 0;
                        sn = -1;
                    }
                    if (j === div) {
                        cs = 1;
                        sn = 0;
                    }

                    const vtx = new Vtx();
                    
                    let base = new THREE.Vector3(rr * cs, rr * sn, 0).applyQuaternion(obj.quaternion);

                    vtx.p.addVectors(base, obj.position);

                    {
                        vtx.p.multiplyScalar(1/64);
                        vtx.p.add(new THREE.Vector3(0, 1.6, 0));
                    }

                    vtx.n.copy(base).normalize();

                    let u = j / div;
                    let v = i / belt;

                    vtx.uv.set(u,v);
                    vtx.tan.set(left.x, left.y, left.z, 1);

                    vs.push(vtx);

                    //console.log(base, b0, obj);
                }
            }

            for (let i = 0; i < belt; ++i) {
                for (let j = 0; j < div; ++j) {
                    const v0 = (div+1) * i + j;
                    const v1 = v0 + 1;
                    const v2 = v0 + (div+1);
                    const v3 = v2 + 1;
                    fis.push([v0,v1,v2]);
                    fis.push([v1,v3,v2]);
                }
            }

        }
        console.log(`${_this.NAME}#makeVertex leave`);
    }

    addVertex() {
        const _this = this;

            console.log(`${_this.NAME}#addVertex called`);
            //_this.packing.vs = [];
            //_this.packing.fis = [];
    
        const vs = _this.packing.vs;
        const fis = _this.packing.fis;

        const offset = vs.length;

        {
            const poss = [
                {x:-1, y:1,z:-1}, // 天井
                {x: 1, y:1,z:-1},
                {x:-1, y:1,z: 1},
                {x: 1, y:1,z: 1},
                {x:-1,y:-1,z:-1}, // 底
                {x: 1,y:-1,z:-1},
                {x:-1,y:-1,z: 1},
                {x: 1,y:-1,z: 1}
            ];
            const a = 0.25;
            const fs = [
                {fi:[1,3,5,7], n:[ 1,0,0], lt:[0.25,0.25]},
                {fi:[0,2,4,6], n:[-1,0,0], lt:[0.25,0.25]},
                {fi:[0,1,2,3], n:[0, 1,0], lt:[0.25,0.25]},
                {fi:[4,5,6,7], n:[0,-1,0], lt:[0.25,0.25]},
                {fi:[2,3,6,7], n:[0,0, 1], lt:[0.25,0.25]},
                {fi:[0,1,4,5], n:[0,0,-1], lt:[0.25,0.25]}
            ];

            fs.forEach((f,i)=>{
                // 頂点4つ
                for (let j = 0; j < 4; ++j) {
                    const v = new Vtx();
                    const pos = poss[f.fi[j]];
                    v.p.set(pos.x, pos.y, pos.z);
                    v.n.set(f.n[0], f.n[1], f.n[2]);
                    v.uv.set(f.lt[0] + (j&1)*a, f.lt[1] + Math.floor(j/2)*a);
                }

                const v0 = i*4 + offset;
                const v1 = v0 + 1;
                const v2 = v0 + 2;
                const v3 = v0 + 3;
                fis.push([v0,v2,v1]);
                fis.push([v1,v2,v3]);
            });
        }

    }

    /**
     * 一番最初のやつ。頂点の配列を作る
     * vs, fis に格納される
     */
    makeVertexKeep1() {
        const _this = this;
        console.log(`${_this.NAME}#makeVertexKeep1 called`);
        _this.packing.vs = [];
        _this.packing.fis = [];

        const vs = _this.packing.vs;
        const fis = _this.packing.fis;
        {
            const gr = new THREE.Group();
            gr.name = 'axes';
            gr.visible = false;
            _this.scene.add(gr);

//            const div = 12;
//            const belt = 256;
            const div = 16;
            const belt = 512;

            const rots = [
                {
                    p: (t) => { return new THREE.Vector3(0,0,0); },
                    q: (t)=>{
                        let topo = (t === 1) ? 0 : t * 3;
                        return new THREE.Object3D().rotateZ(topo);
                    }
                },
                {
                    p: (t) => { return new THREE.Vector3(0,10,0); },
                    q: (t)=>{
                        let topo = (t === 1) ? 0 : t * 5;
                        return new THREE.Object3D().rotateX(topo);
                    }
                },
                {
                    p: (t) =>{ return new THREE.Vector3(0,4,0);},
                    q: (t)=>{
                        let topo = 0;
                        return new THREE.Object3D().rotateZ(topo);
                    }
                },

            ];
            const rr = 1;

            for (let i = 0; i <= belt; ++i) {
                const topo = i / belt * 2 * Math.PI;

                const obj = _this.calcBone(rots, topo);

                {
                    const p0 = _this.calcBone(rots, topo - 1/65536);
                    const p2 = _this.calcBone(rots, topo + 1/65536);

                    let up = new THREE.Vector3().subVectors(obj.position, p0.position);
                    let face = new THREE.Vector3().subVectors(p2.position, p0.position);
                    let left = new THREE.Vector3().crossVectors(up, face);
                    if (left.length() !== 0) {
                        up.crossVectors(face, left);
                        face.crossVectors(left, up);

                        left.normalize();
                        up.normalize();
                        face.normalize();

                        const m = new THREE.Matrix4();
                        
                        m.fromArray([left.x,left.y,left.z,0,
                            up.x,up.y,up.z, 0,
                            face.x,face.y,face.z, 0,
                            0,0,0,1]);
                        obj.quaternion.setFromRotationMatrix(m);
                    }

                }

                {
                    const axes = new THREE.AxesHelper(3);
                    axes.position.copy(obj.position);
                    axes.quaternion.copy(obj.quaternion);
                    gr.add(axes);
                }

                for (let j = 0; j <= div; ++j) {
                    const ang = j / div * 2 * Math.PI;
                    let cs = Math.cos(ang);
                    let sn = Math.sin(ang);
                    if (j === div/4) {
                        cs = 0;
                        sn = 1;
                    }
                    if (j === div/2) {
                        cs = -1;
                        sn = 0;
                    }
                    if (j === div*3/4) {
                        cs = 0;
                        sn = -1;
                    }
                    if (j === div) {
                        cs = 1;
                        sn = 0;
                    }

                    const vtx = new Vtx();
                    
                    let base = new THREE.Vector3(rr * cs, rr * sn, 0).applyQuaternion(obj.quaternion);

                    vtx.p.addVectors(base, obj.position);
                    vtx.n.copy(base).normalize();

                    let u = j / div;
                    let v = i / belt;

                    vtx.uv.set(u,v);
                    vs.push(vtx);

                    //console.log(base, b0, obj);
                }
            }

            for (let i = 0; i < belt; ++i) {
                for (let j = 0; j < div; ++j) {
                    const v0 = (div+1) * i + j;
                    const v1 = v0 + 1;
                    const v2 = v0 + (div+1);
                    const v3 = v2 + 1;
                    fis.push([v0,v1,v2]);
                    fis.push([v1,v3,v2]);
                }
            }

        }
        console.log(`${_this.NAME}#makeVertexKeep1 leave`);
    }


    update() {
        const _this = this;

        if (_this.control) {
            _this.control.update();
        }
        _this.renderer.render(_this.scene, _this.camera);
    }

    init(vieww, viewh, viewfov) {
        const _this = this;
        console.log(`${_this.NAME}#init called`);
        _this.vieww = vieww;
        _this.viewh = viewh;
        _this.viewfov = viewfov;

        {
            const renderer = new THREE.WebGLRenderer({
                alpha: true
            });
            renderer.setClearColor(new THREE.Color(0x000000), 1);
            renderer.setSize(vieww, viewh);

            const camera = new THREE.PerspectiveCamera(viewfov, vieww/viewh,
                0.01, 10000);
            camera.position.set(0.1, 1.6, 10);
            camera.up.set(0,1,0);
            camera.lookAt(new THREE.Vector3(0, 1.7, 0));
            _this.camera = camera;

            const scene = new THREE.Scene();
            _this.scene = scene;

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
                const axes = new THREE.AxesHelper(20);
                scene.add(axes);
            }

            // bookmark TODO: プリビューどうしよう
//            _this.makeVertex();

            //_this.packing.makeBuffer();
//            const m = _this.makeMesh();
//            m.name = 'model';
//            scene.add(m);

            _this.renderer = renderer;

            return renderer.domElement;
        }

    }

    setWire(wire) {
        const _this = this;
        const obj = _this.scene.getObjectByName('model');
        if (obj) {
            obj.material.wireframe = wire;
        }
    }

    setVisible(name, visible) {
        const _this = this;
        const obj = _this.scene.getObjectByName(name);
        if (obj) {
            obj.visible = visible;
        }
    }

}
