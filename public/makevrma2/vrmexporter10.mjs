/*!
 * vrmexporter10.mjs
 * Copyright (c) 2024- Usagi ウサギ
 * This software is released under the MIT License.
 */
// 自分でバイナリ生成するタイプ

/**
 * 
 * https://github.com/vrm-c/vrm-specification/tree/master/specification
 */

import * as THREE from 'three';
import { Flattree } from './flatnodetemplate.mjs';

/** */
const pad = (v, n = 2) => {
    return String(v).padStart(n, '0');
};

/** */
class V4 {
    constructor(inX = 0, inY = 0, inZ = 0, inW = 0) {
        this.x = inX;
        this.y = inY;
        this.z = inZ;
        this.w = inW;
    }

    static I() {
        return new V4(0,0,0, 1);
    }

    static X(ang) {
        const cs = Math.cos(ang * 0.5);
        const sn = Math.sin(ang * 0.5);
        return new V4(sn,0,0, cs);
    }
    static Y(ang) {
        const cs = Math.cos(ang * 0.5);
        const sn = Math.sin(ang * 0.5);
        return new V4(0,sn,0, cs);
    }
    static Z(ang) {
        const cs = Math.cos(ang * 0.5);
        const sn = Math.sin(ang * 0.5);
        return new V4(0,0,sn, cs);
    }
}

/** */
class V3 {
    constructor(inX = 0, inY = 0, inZ = 0) {
        this.x = inX;
        this.y = inY;
        this.z = inZ;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    clone() {
        return new V3(this.x, this.y, this.z);
    }

    /**
     * 破壊
     */
    normalize() {
        const len = this.length();
        if (len > 0.0) {
            const k = 1 / len;
            this.x *= k;
            this.y *= k;
            this.z *= k;
        }
        return this;
    }

}

/**
 * 
 */
class V2 {
    constructor(inX = 0, inY = 0) {
        this.x = inX;
        this.y = inY;
    }
}

/**
 * .vrm 1.0 書き出し
 */
export class VrmExporter10 {

/**
 * for vertex attributes
 * bufferView.target
 * https://github.com/KhronosGroup/glTF-Tutorials/blob/master/gltfTutorial/gltfTutorial_005_BuffersBufferViewsAccessors.md
 */
    static TARGET_ARRAY_BUFFER = 34962;
/**
 * for vertex indices
 */
    static TARGET_ELEMENT_ARRAY_BUFFER = 34963;


/**
 * コンストラクタ
 * @param {Object} param 
 */
    constructor(param) {
        this.cl = this.constructor.name;

        /**
         * 文字列
         */
        this.str = '{}';

        /**
         * ボーンのところの材質インデックス
         * 光抑えめ
         * @default 0
         */
        this.boneMatrixIndex = 0;

/**
 * 材質数
 * @default 2
 */
        this.materialNum = 0;

/**
 * @default '1.0'
 */
        this.specVersion = '1.0';

/**
 * バイト型を表現する定数
 */
        this.BYTE = 5120;
        this.UNSIGNED_BYTE = 5121;
        this.SHORT = 5122;
        /**
         * 5123
         */
        this.UNSIGNED_SHORT = 5123;

        // 5124 は無い

        /**
         * 5125
         */
        this.UNSIGNED_INT = 5125;
/**
 * SCALAR
 * @default 5126
 */
        this.FLOAT = 5126;
/**
 * 34962 bufferView.target 用
 */
        this.ARRAY_BUFFER = 34962;
/**
 * 34963 bufferView.target 用
 */
        this.ELEMENT_ARRAY_BUFFER = 34963;

/**
 * 9728
 */
        this.NEAREST = 9728
/**
 * 9729 LINEAR
 */
        this.LINEAR = 9729;
    }


/**
 * 
 * @param {Date} d 時刻
 */
    getTimeID(d = new Date()) {
        let s = '';
        s += pad(d.getFullYear(), 4);
        s += pad(d.getMonth() + 1);
        s += pad(d.getDate());
        s += '_' + pad(d.getHours());
        s += pad(d.getMinutes());
        s += pad(d.getSeconds());
        //s += '_' + pad(d.getMilliseconds(), 3);
        return s;
    }

/**
 * ダウンロードする
 * @param {Blob} blob バイナリ
 * @param {string[]} ファイル名の配列 
 */
    download(blob, names) {
        for (const v of names) {
            const a = document.createElement('a');
            a.download = v;
            a.href = URL.createObjectURL(blob);
            a.click();
        }
    }

/**
 * fourcc 4バイトを生成する u8
 * @param {string} f 4文字まで
 */
    fourcc(f) {
        const buf = new Uint8Array(4);
        for (let i = 0; i < 4; ++i) {
            buf[i] = f.charCodeAt(i);
        }
        return buf;
    }

/**
 * Typed Array を返す u8
 * @param {number} v 整数
 */
    u32(v) {
        const ab = new ArrayBuffer(4);
        const p = new DataView(ab);
        p.setUint32(0, v, true);
        return new Uint8Array(ab);
    }


/**
 * ファイル全体作る
 * str と bin はすでに準備できていること。
 * @return {Blob} 1つの Blob 
 */
    wholeBlob() {
        console.log(this.cl, `wholeBlob called`);

        const ret = [];

        let strBin = new Blob([this.str],
            { type: 'text/plain;charset=UTF-8'});
        let strBinLen = strBin.size;
        strBinLen = Math.floor(strBinLen / 4) * 4;
        strBin = strBin.slice(0, strBinLen);

        const binLen = this.bin.byteLength;

        const whole = 12 + 8 + strBinLen + 8 + binLen;

        ret.push(new Blob([this.fourcc('glTF')]));
        ret.push(new Blob([this.u32(2)]));
        ret.push(new Blob([this.u32(whole)]));

        ret.push(new Blob([this.u32(strBinLen)]));
        ret.push(new Blob([this.fourcc('JSON')]));
        ret.push(strBin);

        ret.push(new Blob([this.u32(binLen)]));
        ret.push(new Blob([this.fourcc('BIN\0')]));
        ret.push(new Blob([this.bin]));

        console.log(this.cl, `wholeBlob leave`);
        return new Blob([...ret]);
    }

/**
 * ファイルとして保存する
 * @param {boolean} inurl 有効な URL を返すかどうか
 * @param {boolean} indownload ダウンロードするかどうか
 * @returns {string | null} blob の URL
 */
    save(inurl, indownload) {
        console.log(this.cl, `save called`, inurl, indownload);

        {
            const base = `a_${this.getTimeID(new Date())}`;

            const blob = this.wholeBlob();
            const url = URL.createObjectURL(blob);

            if (indownload) {
                this.download(blob,
                    [`${base}.glb`, `${base}.vrma`]);
            }

            if (inurl) {
                console.log(`true`);
                return url;
            }

            URL.revokeObjectURL(url);
            console.log(this.cl, `save leave false`);
            return null;
        }
    }

/**
 * リカーシブツリーを平たくする
 * @param {{}[]} ns この配列のインデックスとしてみなす
 * @param {Object} cur 今の対象 in tree
 * @param {any[]} [cur.c]
 * @param {{}} parent 親 obj
 * @return {{recur: boolean, index: number}} cur の結果。自分のインデックス
 */
    recurTree(ns, cur, parent) {

        const glopos = [0,0,0];
        if (parent && '_global' in parent) {
            glopos[0] = parent._global[0];
            glopos[1] = parent._global[1];
            glopos[2] = parent._global[2];
        }

        let recur = true;
        if ('c' in cur) {
            if (cur.c.length === 0) {
                recur = false;
            }
        } else {
            recur = false;
        }

// これまでに追加された個数がそのまま次のインデックスになる
        let index = ns.length;
        const obj = {
            name: `${cur.name}`,
            translation: [0,0,0],
            rotation: [0,0,0,1],
            scale: [1,1,1],
        };
        if ('r' in cur) {
            obj.translation = cur.r;
            for (let i = 0; i < 3; ++i) {
                glopos[i] += cur.r[i];
            }
        }
        if ('k' in cur) { // キーワード文字列配列
            obj._k = [...cur.k];
        }
        if ('pts' in cur) {
            obj._pts = [...cur.pts];
        }
        if ('sz' in cur) { // サイズ数値配列
            obj._sz = [...cur.sz];
        } else {
            obj._sz = [0.04];
        }
        if ('ci' in cur) {
            obj._ci = [...cur.ci];
        } else {

        }
        obj._global = glopos;

        ns.push(obj);

        if (recur === false) {
            return { recur, index };
        }

        obj.children = [];
        for (const v of cur.c) {
            let result = this.recurTree(ns, v, obj);
            obj.children.push(result.index);
        }
        return { recur, index };
    }

/**
 * ツリーからノード配列を作成する
 * @param {{}[]} nodes 保存先
 */
    makeTree(nodes) {
        console.log(this.cl, `makeTree called`);
        this.recurTree(nodes, _tree, null);
        console.log(this.cl, `makeTree leave`, nodes);
    }

/**
 * TODO: 
 * フラットからノード配列を作成する
 * @param {{}[]} ns ノード配列であって保存先
 */
    makeTreeFromFlat(ns) {
        console.log(this.cl, `makeTreeFromFlat called`);
        const _flattree = Flattree._flattree;
        for (const cur of _flattree) {
            const parentIndex = ns.findIndex(v => {
                return (cur.parent === v.name);
            });
            const parent = (parentIndex >= 0) ? ns[parentIndex] : null;

            const glopos = [0, 0, 0];
            const gpos = parent?._global;
            if (gpos) {
                glopos[0] = gpos[0];
                glopos[1] = gpos[1];
                glopos[2] = gpos[2];
            }

// これまでに追加された個数がそのまま次のインデックスになる
            let index = ns.length;
            if (parent) {
                if (!('children' in parent)) {
                    parent.children = [];
                }
                parent.children.push(index);
            }

            const obj = {
                name: `${cur.name}`,
                translation: [0,0,0],
                rotation: [0,0,0,1],
                scale: [1,1,1],
            };
            if ('r' in cur) {
                obj.translation = cur.r;
                for (let i = 0; i < 3; ++i) {
                    glopos[i] += cur.r[i];
                }
            }
            // _ で始まるメンバは最後に削除するので glTF には残らない
            if ('k' in cur) { // キーワード文字列配列
                obj._k = [...cur.k];
            }
            if ('parent' in cur) {
                obj._parent = cur.parent;
            }
            if ('roll' in cur) {
                const roll = {
                    rollAxis: 'X',
//                    rollAxis: 'Y',
//                    rollAxis: 'Z',
                    weight: cur.roll.weight ?? 1,
                };
                const sourceindex = ns.findIndex(node => {
                    return node.name === cur.roll.sourcename;
                });
                if (sourceindex < 0) {
                    console.error('roll source not found', cur.roll.sourcename);
                } else {
                    console.log('roll found', sourceindex);
                }
                roll.source = sourceindex;

                obj.extensions = {
                    VRMC_node_constraint: {
                        specVersion: this.specVersion,
                        constraint: {
                            roll,
                        }
                    }
                };
            }
            if ('pts' in cur) {
                obj._pts = [...cur.pts];
            }
            if ('sz' in cur) { // サイズ数値配列
                obj._sz = [...cur.sz];
            } else {
                obj._sz = [0.04];
            }
            if ('ci' in cur) {
                obj._ci = [...cur.ci];
            } else {
    
            }
            obj._global = glopos;
    
            ns.push(obj); // 末尾に追加
        }
        console.log(this.cl, `makeTreeFromFlat leaves`);
    }

/**
 * メッシュと頂点を現状に追加する。ここ bookmark
 * @param {Vtx[]} vts 点の配列
 * @param {{_global: number[], _sz: number[]}[]} nodes ノード配列 
 * @param {{}[]} arr 複数面。三段配列。
 * @param {number} ji ジョイントインデックス
 * @param {string} inpath パーツパス
 * @param {number} mi 材質インデックス
 */
    addSubPart(vts, nodes, arr, ji, inpath, mi) {
        console.log(this.cl, `addSubPart called`);
        //return;

/**
 * パーツ格納オブジェクト
 * @type {{vts: {}}}
 */
        const partsource = this.parts[inpath];
        let v = nodes[ji];
        const vioffset = vts.length; // 現在の末端

        const vtskey = Object.keys(partsource.vts);

        for (const k1 of vtskey) {
            /**
             * 
             * @type {{p:string, n:number[], uv:number[]}}
             */
            const v1 = partsource.vts[k1];

            const onep = partsource.ps[v1.p];
            let x = onep.p[0];
            let y = onep.p[1];
            let z = onep.p[2];

            const vtx = new Vtx();
            vtx.p.set(x, y, z);
            vtx.p.multiplyScalar(1/16);
            vtx.n.set(v1.n[0], v1.n[1], v1.n[2]);
            vtx.n.normalize();
            // OpenGL base を gltf base へ変換
            vtx.uv.set(v1.uv[0], 1 - v1.uv[1]);

            let boi = + ji;
            vtx.jnt.set(boi, boi, boi, boi);

            vtx.p.add(new THREE.Vector3(
                v._global[0], v._global[1], v._global[2]));

            vts.push(vtx);
        }

        for (const k2 in partsource.faces) {
            const v2 = partsource.faces[k2];
            const f3 = [];
            for (const k3 of v2.i) {
                // k3 を vtx から取り出す
                let index = vtskey.indexOf(k3);
                //console.log(``, index);
                f3.push(vioffset + index);
            }
            arr[mi].push(f3);
        }

    }

/**
 * メッシュと頂点を現状に追加する。骨と関節追加する。
 * @param {Vtx[]} vts 点の配列
 * @param {{_global: number[], _sz: number[]}[]} nodes ノード配列 
 * @param {{}[]} arr 複数面。三段配列。
 */
    makeSubMesh(vts, nodes, arr) {
        console.log(this.cl, `makeSubMesh called`);

        let rnd = 1;

        nodes.forEach((v, i) => {
            const node = v;
            for (let j = 0; j < 1; ++j) {
                /**
                 * 骨の方
                 */
                const addSubBone = arg2 => { 
                };
                if ('children' in v) {
                    for (const vi2 of v.children) {
                        addSubBone({ from: v, to: nodes[vi2] });
                    }
                }
            }
        });

    }

/**
 * 配列の中を name で探す
 * @param {{name:string}[]} arr 
 * @param {RegExp} inre 
 * @returns {{index:number, node: {}}}
 */
    searchNode(arr, inre) {
        let found = null;
        arr.some((v, i)=>{
            if (inre.test(v.name)) {
                found = { index: + i, node: v };
                return true;
            }
            return false;
        });
        return found;
    }

/**
 * .gltf と .bin に相当するデータを生成して
 * 内部に保持する
 */
    makeData2() {
        console.info(`makeDate2 called`);

        /**
         * あとでセットする obj.nodes
         */
        const treenodes = [];
        // TODO: 1104
        //this.makeTree(treenodes);
        this.makeTreeFromFlat(treenodes);

        /**
         * 頂点オブジェクトの配列
         */
        const vts = [];
        /**
         * 材質ごとの面配列
         * @type {number[][][]}
         */
        const arr = [];
        for (let i = 0; i < this.materialNum; ++i) {
            arr.push([]);
        }

        this.makeSubMesh(vts, treenodes, arr);

        /**
         * メッシュ生成後の頂点数
         */
        const vtNum = 0;

/**
 * ノードすべて。bone でなくてもテクスチャに影響を与えるので
 */
        const jointNum = treenodes.length;
        console.info(`ジョイント数(treenodes)`, jointNum);

        let found = this.searchNode(treenodes,
            /head/i);
        console.log(`head search`, found);

        const bvs = [
            {
                target: VrmExporter10.TARGET_ARRAY_BUFFER,
                byteLength: 3 * 4 * vtNum,
                componentType: this.FLOAT,
                count: vtNum,
                max: [ 1,  1,  1],
                min: [-1, -1, -1], // 範囲
                type: 'VEC3'
            },
            {
                target: VrmExporter10.TARGET_ARRAY_BUFFER,
                byteLength: 3 * 4 * vtNum,
                componentType: this.FLOAT,
                count: vtNum,
                type: 'VEC3'
            },
            {
                target: VrmExporter10.TARGET_ARRAY_BUFFER,
                byteLength: 2 * 4 * vtNum,
                componentType: this.FLOAT,
                count: vtNum,
                type: 'VEC2'
            },
            { // #3 WEIGHTS_0
                target: VrmExporter10.TARGET_ARRAY_BUFFER,
                byteLength: 4 * 4 * vtNum,
                componentType: this.FLOAT,
                count: vtNum,
                type: 'VEC4'
            },
            { // #4 JOINTS_0 short か..
                target: VrmExporter10.TARGET_ARRAY_BUFFER,
                byteLength: 4 * 2 * vtNum,
                componentType: this.UNSIGNED_SHORT,
                count: vtNum,
                type: 'VEC4'
            }
        ];

        /**
         * 面構成インデックスの先頭
         */
        const facetop = bvs.length;

        const inverseIndex = bvs.length;
        console.info(`面と逆行列(bufferViewで`, facetop, inverseIndex);
        {
            bvs.push({
                byteLength: 16 * 4 * jointNum,
                componentType: this.FLOAT,
                count: jointNum,
                type: 'MAT4' });
        }

        const obj = {
            //extensionsRequired: [],
            extensionsUsed: [
                "VRMC_vrm_animation",
            ],
            asset: {
                version: "2.0",
                generator: 'Usagi ECMAScript'
            },
            nodes: [],
            scenes: [{ nodes: [] }],
// GLB-stored Buffer によると uri は undefined にして配列の先頭で参照する
            buffers: [
                { byteLength: 0 /*binBufByte*/ }
            ],
            bufferViews: [], // 182個とか
            accessors: [], // 

            animations: [], // 配列

            extensions: {
                "VRMC_vrm_animation": {
                    specVersion: this.specVersion,
                    humanoid: {
                        humanBones: {}
                    },

                    firstPerson: {
                        meshAnnotations: [
                            { node: 0,
                                type: "both", // scheme
                                firstPersonFlag: 'both', // .md
                                //"extensions": {},
                                //"extras": {}
                            }
                        ],
                    },
                    lookAt: {
                    },
                    expressions: {
                        preset: {},
                        custom: {},
                        extensions: {},
                        extras: {}
                    },
                    extensions: {},
                    extras: {}
                },
            } // extensions

        }; // obj

/**
 * VRM! VRM!
 */
        const vrm = obj.extensions.VRMC_vrm_animation;

        const globals = [];
    { // node のツリー構造
        obj.nodes = treenodes;

        // 統一されているものとしてコピー

        const num = obj.nodes.length;
        for (let i = 0; i < num; ++i) {
            const v = obj.nodes[i];
            const b = {
                node: + i, // 必須
//                extensions: [],
//                extra: {},
            };

            let isbone = true;
            if ('_k' in v) {
                if (v._k.includes('exc')) {
                    isbone = false;
                }
            }

            if (isbone) {
// 1.0 で name key になった
                vrm.humanoid.humanBones[v.name] = b;
            }

            //console.log(v.name, v._global);

            // bookmark 違うけど一応ここで
            globals.push(v._global);
        }

        obj.scenes[0].nodes.push(0);

        let index = obj.nodes.length;
        obj.nodes.push({ name: 'skinnode',
            translation: [0,0,0],
            rotation: [0,0,0,1],
            scale: [1,1,1],
            mesh: 0,
            skin: 0
        });
        obj.scenes[0].nodes.push(index);
    }

    { // モーション エクスプレッション
        for (const k of [
            'happy', 'angry', 'sad', 'relaxed', 'surprised',
            'aa', 'ih', 'ou', 'ee', 'oh',
            'blink', 'blinkLeft', 'blinkRight',
            'lookUp', 'lookDown', 'lookLeft', 'lookRight',
            'neutral']) {
            const gr = {
                /*
                "morphTargetBinds": [
                    {
                        node: 0,
                        index: 0,
                        weight: 1,
                        extensions: {},
                        extras: {}
                    },
                ],
                */
//                "materialColorBinds": [],
                //"textureTransformBinds": [],
                "isBinary": false,
                "overrideBlink": "none",
                "overrideLookAt": "none",
                "overrideMouth": "none",
                "extensions": {},
                "extras": {}
            };
            vrm.expressions.preset[k] = gr;
        }
    }


/**
 * bufferView の番号が1つずつ増えていく
 */
    let bvOffset = 0;
    /**
     * buffer のバイトオフセットがバイト単位で増えていく
     */
    let byteOffset = 0;
    { // バッファビューとアクセッサ
        for (const bv of bvs) {
            const onebv = {
                buffer: 0,
                byteLength: bv.byteLength,
                byteOffset: byteOffset
            };
            if ('target' in bv) {
                onebv.target = + bv.target;
            }
            obj.bufferViews.push(onebv);

            bv.bufferView = bvOffset;
            //bv.byteOffset = + byteOffset; // TODO: これ間違い

            byteOffset += bv.byteLength;
            delete bv.byteLength;
            delete bv.target;

            obj.accessors.push(bv);

            bvOffset += 1;
        }
    }

    arr.forEach((v, i) => { // プリミを複数段にする。材質があるので
        let prim = {
            mode: 4,
            attributes: {
                POSITION: 0,                  
                NORMAL: 1,
                TEXCOORD_0: 2,
                WEIGHTS_0: 3,
                JOINTS_0: 4
            },
            indices: facetop + i, // 面構成頂点
            material: + i, // 材質インデックス
        };
        if (i >= 0) {
//        if (false) {
            prim.targets = [
                {
                    POSITION: 0,
                    NORMAL: 1
                }
            ];
        }

        obj.meshes[0].primitives.push(prim);
    });


//// バイナリここから ////

/**
 * テクスチャ以外の buffer 内でのバイトオフセット
 */
    let attrByte = byteOffset;

// 切り上げてちょうど確保
    const binBufByte = Math.ceil(attrByte / 4) * 4;
/**
* バイナリ全体
*/
    const buf = new ArrayBuffer(binBufByte);
    const p = new DataView(buf);

    obj.buffers[0].byteLength = binBufByte;


    /**
     * POSITION の範囲取得用
     */
        const range = {
            min: [9999, 9999, 9999], max: [-9999,-9999,-9999]
        };

        /**
         * バイトオフセット
         */
        let c = 0;
        { // key time
            let i = 0;
            for (const v of vts) {
                const pp = [v.p.x, v.p.y, v.p.z];
                pp.forEach((v2, j) => {
                    p.setFloat32(c, v2, true);
                    c += 4;

                    range.min[j] = Math.min(range.min[j], v2);
                    range.max[j] = Math.max(range.max[j], v2);
                });
            }

            obj.accessors[i].min = [...range.min];
            obj.accessors[i].max = [...range.max];
            console.log(`最大最小`, obj.accessors[i]);
        }
        { // rotation
            let i = 0;
            for (const v of vts) {
                const pp = [v.p.x, v.p.y, v.p.z, 1];
                pp.forEach((v2, j) => {
                    p.setFloat32(c, v2, true);
                    c += 4;

                    range.min[j] = Math.min(range.min[j], v2);
                    range.max[j] = Math.max(range.max[j], v2);
                });
            }

            obj.accessors[i].min = [...range.min];
            obj.accessors[i].max = [...range.max];
            console.log(`最大最小`, obj.accessors[i]);
        }

        { // 行列
            for (let i = 0; i < jointNum; ++i) {
                const glopos = globals[i];
                const mts = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0, 1];
                mts[12] = -glopos[0];
                mts[13] = -glopos[1];
                mts[14] = -glopos[2];
                for (const v of mts) {
                    p.setFloat32(c, v, true);
                    c += 4;
                }
            }
        }

        this.deleteExtra(obj);

        if (true) {
            console.info(`ノード`, obj.nodes.length);
            console.info(`ボーン(128)`);
        }

// 多めにとった String
        this.str = JSON.stringify(obj) + ' '.repeat(4);
// ちょうどパディング済み Uint8Array
        this.bin = new Uint8Array(buf);
        console.log(this.cl, `makeData2 leave`,
            this.str.length, this.bin.length);
    }

/**
 * _foo のようなメンバを削除する
 * @param {Object} obj 
 * @param {{}[]} obj.nodes 
 */
    deleteExtra(obj) {
        let count = 0;
        for (const node of obj.nodes) {
            for (const k in node) {
                if (k.substr(0,1) === '_') {
                    delete node[k];
                    ++count;
                }
            }
        }
        console.log(`deleteExtra leave`, count);
    }

}

