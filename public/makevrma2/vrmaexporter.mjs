/*!
 * vrmaexporter.mjs
 * Copyright (c) 2024- Usagi ウサギ
 * This software is released under the MIT License.
 */
// 自分でバイナリ生成するタイプ

/**
 * 
 * https://github.com/vrm-c/vrm-specification/tree/master/specification
 */

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



class Sampler {
    constructor() {
        this.input = 0;
        this.output = 1;
        this.interpolation = 'LINEAR';
    }
}

class Channel {
    //static TRANSLATION = 'translation';
    //static ROTATION = 'rotation';
    constructor() {
        this.sampler = 0;
        this.target = {
            node: 0,
            path: 'rotation'
        };
    }
}

class Animation {
    constructor() {
        this.name = 'animation';
        this.samplers = [];
        this.channels = [];
    }
}

class AnimationTrack {
    static TRANSLATION = 'translation';
    static ROTATION = 'rotation';
    constructor() {
        this.target = {
            nodeName: 'hips',
            path: 'rotation'
        };
/**
 * @type {number[]}
 */
        this.keys = [];
/**
 * @type {[number] | [number,number,number,number]}
 */
        this.values = [];

        this.type = 'SCALAR'; // or 'VEC4'
    }
}

/**
 * .vrma 書き出し
 */
export class VrmaExporter {

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
 * アニメーション本体
 * @type {AnimationTrack[]}
 */
        this.tracks = [];
        this.bvs = [];
        this.animations = [];

        /**
         * 文字列
         */
        this.str = '{}';

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
 * FLOAT
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

// バイナリ
        const binLen = this.bins.reduce((p, c) => {
            return p + c.byteLength;
        }, 0);

        const whole = 12 + 8 + strBinLen + 8 + binLen;

        ret.push(new Blob([this.fourcc('glTF')]));
        ret.push(new Blob([this.u32(2)]));
        ret.push(new Blob([this.u32(whole)]));

        ret.push(new Blob([this.u32(strBinLen)]));
        ret.push(new Blob([this.fourcc('JSON')]));
        ret.push(strBin);

        ret.push(new Blob([this.u32(binLen)]));
        ret.push(new Blob([this.fourcc('BIN\0')]));
        for (let bin of this.bins) {
            ret.push(new Blob([bin]));
        }

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
            obj.translation = cur.r; // 相対
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
        console.info(`makeData2 called`);

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
            scenes: [{ name: 'AuxScene', nodes: [] }],
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
/*
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
                    */
                },
            } // extensions

        }; // obj

        for (const tnode of Flattree._flattree) {
            const node = {
                name: tnode.name,
                translation: tnode.r,
                children: [],
                _parent: tnode.parent,
            };
            obj.nodes.push(node);
        }

// _parent を使って children 構造を生成する
        for (let i = 0; i < obj.nodes.length; ++i) {
            const node = obj.nodes[i];
            const info = this.searchNode(obj.nodes,
                new RegExp(node._parent));
            delete node._parent;
            if (!info) {
                continue;
            }
            obj.nodes[info.index].children.push(i);
        }

        this.makeAnimation(obj.nodes);

/**
 * VRM! VRM!
 */
        const vrm = obj.extensions.VRMC_vrm_animation;

    { // human.humanoidBone
        const num = obj.nodes.length;
        for (let i = 0; i < num; ++i) {
            const v = obj.nodes[i];
            const b = {
                node: + i, // 必須
//                extensions: [],
//                extra: {},
            };

            let isbone = true;
            if ('_k' in v) { // TODO: 
                if (v._k.includes('exc')) {
                    isbone = false;
                }
            }

            if (isbone) {
// 1.0 で name key になった
                vrm.humanoid.humanBones[v.name] = b;
            }
        }

        obj.scenes[0].nodes.push(0);
    }

    if (false) { // モーション エクスプレッション
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

        this.applyAnimation(obj.nodes, this.bvs);
        obj.animations = this.animations;

/**
 * bufferView の番号が1つずつ増えていく
 */
    let bvOffset = 0;
    /**
     * buffer のバイトオフセットがバイト単位で増えていく
     */
    let byteOffset = 0;
        let bins = [];
    { // バッファビューとアクセッサ
        for (const bv of this.bvs) {
            bins.push(bv._buf);
            delete bv._buf;

            const onebv = {
                buffer: 0,
                byteLength: bv.byteLength,
                byteOffset: byteOffset
            };

            obj.bufferViews.push(onebv);

            bv.bufferView = bvOffset;

            byteOffset += bv.byteLength;
            delete bv.byteLength;
            delete bv.target;

            obj.accessors.push(bv);

            bvOffset += 1;
        }
    }

/**
 * テクスチャ以外の buffer 内でのバイトオフセット
 */
    let attrByte = byteOffset;

/**
 * 切り上げてちょうど確保
 * bin[sp] のバイト数
 */
    const binBufByte = Math.ceil(attrByte / 4) * 4;

    obj.buffers[0].byteLength = binBufByte;

        this.deleteExtra(obj);

        {
            console.info(`ノード`, obj.nodes.length);
        }

// 多めにとった String
        this.str = JSON.stringify(obj) + ' '.repeat(4);

        this.bins = bins;

        console.log('obj', obj);

        console.log(this.cl, `makeData2 leave`,
            this.str.length);

        console.log('bvs', this.bvs);
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
                if (k.substring(0, 1) === '_') {
                    delete node[k];
                    ++count;
                }
            }
        }
        console.log(`deleteExtra leave`, count);
    }

/**
 * tracks から展開する
 */
    applyAnimation(nodes, bvs) {
        console.log('applyAnimation', nodes);

        const trackNum = this.tracks.length;
        const anim = new Animation();
        this.animations = [anim];

        let samplerIndex = 0;
        let channelsIndex = 0;
        for (let i = 0; i < trackNum; ++i) {
            const track = this.tracks[i];

            const sampler = new Sampler();
            const channel = new Channel();

            sampler.input = i * 2;
            sampler.output = i * 2 + 1;
            sampler.interpolation = 'LINEAR';

            const nodeInfo = this.searchNode(
                nodes,
                new RegExp(track.target.nodeName));
            channel.target = {
                node: nodeInfo.index,
                path: track.target.path,
            };
            channel.sampler = samplerIndex;

            const frameNum = track.keys.length;
            { // キー
                const buf = new ArrayBuffer(frameNum * 4);
                const p = new DataView(buf);
                let maxk = -9999;
                let mink =  9999;
                for (let j = 0; j < frameNum; ++j) {
                    const val = track.keys[j];
                    p.setFloat32(j * 4, val, true);
                    maxk = Math.max(maxk, val);
                    mink = Math.min(mink, val);
                }
                const bv = {
                    componentType: this.FLOAT,
                    type: 'SCALAR',
                    count: frameNum, 
                    max: [maxk],
                    min: [mink], // for accessor
                    _buf: buf,
                    byteLength: buf.byteLength,
                };
                bvs.push(bv);
            }
            { // バリュー
                const elementNum = track.type === 'VEC4' ? 4 : 3;
                let maxv = [-9999, -9999, -9999, -9999];
                let minv = [ 9999,  9999,  9999,  9999];
                for (let j = 0; j < track.values.length; ++j) {
                    const val = track.values[j];
                    for (let k = 0; k < elementNum; ++k) {
                        maxv[k] = Math.max(maxv[k], val[k]);
                        minv[k] = Math.min(minv[k], val[k]);
                    }
                }

                const arr = track.values.flat();
                const buf = new ArrayBuffer(arr.length * 4);
                const p = new DataView(buf);
                for (let j = 0; j < arr.length; ++j) {
                    p.setFloat32(j * 4, arr[j], true);
                }
                const bv = {
                    componentType: this.FLOAT,
                    type: track.type,
                    count: frameNum,
                    max: maxv.slice(0, elementNum),
                    min: minv.slice(0, elementNum), // for accessor
                    _buf: buf,
                    byteLength: buf.byteLength,
                };
                bvs.push(bv);
            }

            anim.samplers.push(sampler);
            anim.channels.push(channel);
            samplerIndex += 1;
            channelsIndex += 1;
        }
    }

/**
 * アニメーション生成
 */
    makeAnimation(nodes) {
        const frameNum = 709;
        const keys = new Array(frameNum);
        for (let i = 0; i < frameNum; ++i) {
            keys[i] = i / 30;
        }

        {
            const track = new AnimationTrack();
            this.tracks.push(track);

            track.target.nodeName = 'hips';
            track.target.path = 'translation';
            track.keys = [...keys];
            track.values = new Array(frameNum);
            for (let j = 0; j < frameNum; ++j) {
                track.values[j] = [0, 0, 0];
            }
            track.type = 'VEC3';
        }
        for (let i = 0; i < nodes.length; ++i) {
            const track = new AnimationTrack();
            this.tracks.push(track);

            const frameNum = key.length;
            track.target.nodeName = nodes[i].name;
            track.target.path = 'rotation';
            track.keys = [...keys];
            track.values = new Array(frameNum);
            for (let j = 0; j < frameNum; ++j) {
                track.values[j] = [0, 0, 0, 1];
                if (i >= 2 && ((i & 1) == 0)) {
                    track.values[j] = [
                        0, -0.707, 0, 0.707,
                    ];
                }
            }
            track.type = 'VEC4';
        }

    }

}

