
/**
 * @file gltfparser.js
 * MIT License (c) 2018- Usagi
 */

// 20200520_01
// 20200521_01

/**
 * @typeof {Object} OneInfo
 * @property {number[]} v 値
 * @property {number} k インデックス
 */

/**
 * @typeof {Object} ChangeInfo
 * @property {Object} target
 * @property {number} target.accessor 
 * @property {number} target.stride ストライドバイト 3*4
 * @property {number} target.offset ストライドの中でのオフセット
 * @property {OneInfo[]} rels 相対指定の場合
 * @property {OneInfo[]} abss 絶対指定の場合
 */

/**
 * 1つ分
 */
class OneInfo {
    constructor() {
        /**
         * インデックス
         * @type {number}
         */
        this.k = 0;
        /**
         * 値
         * @type {number[]}
         */
        this.v = [];
    }
}

class TargetInfo {
    constructor() {
/**
 * アクセサのインデックス 
 * @type {number} accessor
 */
        this.accessor = 0;
/**
 * バイトストライド
 * @type {number} stride
 */
        this.stride = 12;
/**
 * ストライドの中のバイトオフセット
 * @type {number}
 */
        this.offset = 0;
    }
}

/**
 * 変更情報
 */
class ChangeInfo {
    constructor() {
        this.cl = this.constructor.name;

        /**
         * 変更先
         * @type {Object}
         * @property {number} accessor アクセサのインデックス
         * @property {number} offset ストライドのバイトオフセット
         * @property {number} stride ストライドバイト数
         */

/**
 * 書き換え先
 * @type {TargetInfo}
 */
        this.target = {};
        /**
         * 各頂点などを補正する情報の配列
         * @type {OneInfo[]}
         */
        this.rels = [];
        /**
         * @type {OneInfo[]}
         */
        this.abss = [];
    }
}



(function(global_) {

'use strict';

const pad = (v, n = 2) => {
    return String(v).padStart(n, '0');
};

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

class V3 {
    constructor(inX, inY, inZ) {
        this.x = inX || 0;
        this.y = inY || 0;
        this.z = inZ || 0;
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
        if (len) {
            const k = 1 / len;
            this.x *= k;
            this.y *= k;
            this.z *= k;
        }
        return this;
    }

}

class V2 {
    constructor(inX = 0, inY = 0) {
        this.x = inX;
        this.y = inY;
    }
}

/**
 * パーサー<br />
 * このパーサーに構造残すか...
 */
class GltfParser {
    /**
     * コンストラクタ
     * @param {{}} param 
     */
    constructor(param) {
        /** */
        this.cl = this.constructor.name;

        /**
         * こちらはまだ文字列の状態
         */
        this.str = '{}';
/**
 * バイナリチャンク全体
 * @type {Uint8Array | Blob}
 */
        this.bin = null;

/**
 * @type {Uint8Array[]} 維持格納用
 */
        this._bvs = [];
/**
 * json 側のルートからのオブジェクト
 */
        this._root = {};
/** */
        this.BYTE = 5120;
/** */
        this.UNSIGNED_BYTE = 5121;
/** */
        this.SHORT = 5122;
        /**
         * 5123
         */
        this.UNSIGNED_SHORT = 5123;
        /**
         * 5125
         */
        this.UNSIGNED_INT = 5125;
        /**
         * 5126
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
 * 9729
 */
        this.LINEAR = 9729;
/** */
        this.NEAREST_MIPMAP_NEAREST = 9984;
/** */
        this.LINEAR_MIPMAP_NEAREST = 9985;
/** */
        this.NEAREST_MIPMAP_LINEAR = 9986;
/**
 * 9987 LL MIPMAP
 */
        this.LINEAR_MIPMAP_LINEAR = 9987;

/**
 * 33071 wrap* 用
 */
        this.CLAMP_TO_EDGE = 33071;
/** */
        this.MIRRORED_REPEAT = 33648;
/**
 * 10497 wrap*用
 */
        this.REPEAT = 10497;

/**
 * for VRM
 */
        this.DIS = 'Disallow';
/**
 * 
 */
        this.ALLOW = 'Allow';
    }

/**
 * 画像部分を取り出す
 * @param {{}} obj 
 * @param {Object} bin
 * @param {ArrayBuffer} bin.buffer 
 * @param {number} bin.byteOffset 
 * @param {number} bin.byteLength 
 */
    parseImage(obj, bin) {
        console.log(this.cl, `parseImage called`, obj.images.length);
        obj.images.forEach(async (v, i) => {
            //console.log(v);
            /**
             * bufferView としてのインデックス
             */
            const bvindex = v.bufferView;
            const bv = obj.bufferViews[bvindex];

            const src8 = new Uint8Array(bin.buffer,
                bin.byteOffset + bv.byteOffset, bv.byteLength);
            const ab = new ArrayBuffer(bv.byteLength);
            const dst8 = new Uint8Array(ab);

            dst8.set(src8);

            //console.log(bv, ab);
            this._bvs[i] = dst8;

            const div = document.createElement('div');
            div.classList.add('rowone');

            const image = await createImageBitmap(new Blob([ab]));

            const img = document.createElement('canvas');
            img.id = `images${i}`;
            const c = img.getContext('2d');
            let w = image.width;
            let h = image.height;
            img.width = w;
            img.height = h;
            //console.log(`本来の解像度`, w, 'x', h);
            img.style.width = `${w}px`;
            img.style.height = `${h}px`;
            c.drawImage(image, 0, 0);

            img.classList.add('texview');

            div.appendChild(img);

            idimgs.appendChild(div);

            console.log(this.cl, `image`, i);
        });
    }

/**
 * API. バイナリを操作する
 * @param {ArrayBuffer} ab 
 */
    parse(ab) {
        console.log(this.cl, `parse called`, ab);

        this.chunk = {
            whole: ab, // 参照
            json: { byteOffset: 0, byteLength: 0 },
            bin: { byteOffset: 0, byteLength: 0 }
        };

        const decoder = new TextDecoder();

        const p = new DataView(ab);
        { // TODO: まずチャンクから
            let v = 0;
            let c = 12;
            let chunkByte = p.getUint32(c, true);
            let four = new Uint8Array(ab, c+4, 4);
            let fourcc = decoder.decode(four);
            c += 8;

            console.log(`先頭チャンク`, chunkByte, fourcc);
            this.chunk.json.byteOffset = c;
            this.chunk.json.byteLength = chunkByte;

            const sbuf = new Uint8Array(ab, c, chunkByte);
            const s8 = decoder.decode(sbuf);
            const obj = JSON.parse(s8);
            console.log(`json`, obj);
            this._root = obj;

            c += chunkByte;
            chunkByte = p.getUint32(c, true);
            four = new Uint8Array(ab, c + 4 , 4);
            fourcc = decoder.decode(four);
            c += 8;

            this.chunk.bin.byteOffset = c;
            this.chunk.bin.byteLength = chunkByte;

            // bin の部分
            //const q = new DataView(ab, c, chunkByte);

/**
 * bin の先頭
 */
            const chunkOffset = + c;
            c += chunkByte;

            if (true) { // bufferView 配列を構築する
                this._bvs = [];
                for (const v of obj.bufferViews) {
                    const bv = new ArrayBuffer(v.byteLength);
                    const src8 = new Uint8Array(ab,
                        chunkOffset + v.byteOffset,
                        v.byteLength);
                    const dst8 = new Uint8Array(bv);
                    dst8.set(src8);
                    this._bvs.push(bv);

                    //console.log(`bv forEach`, dst8.length);
                }
            }

            if (true) {
                const info = {
                    buffer: ab,
                    byteOffset: chunkOffset,
                    byteLength: chunkByte
                };
                this.parseImage(obj, info);
            }
            console.log(this.cl, `parse leave`, c, ab.byteLength);
        }
    }

/**
 * API. 見やすくしたい
 */
    view() {
        console.log(this.cl, `view called`);

        const json = this._root;

        for (const v of json.bufferViews) {
            console.log('bufferView', v);
        }

        for (const v of json.accessors) {
            console.log('accessor', v);
        }

        for (const v of json.nodes) {
            console.log('node', v);
        }

        for (const v of json.skins) {
            console.log('skin', v);
        }

        for (const v of json.materials) {
            console.log('material', v);
        }

        for (const v of json.scenes) {
            console.log('scene', v);
        }

        {
            const mp = json?.extensions?.VRM?.materialProperties;
            if (Array.isArray(mp)) {
                for (const v of mp) {
                    console.log(v.name, v.shader, v.renderQueue);
                    console.log(v.name, `float`, v.floatProperties);
                    console.log(v.name, `vector`, v.vectorProperties);
                    console.log(v.name, `tagMap`, v.tagMap);
                    console.log(v.name, `keywordMap`, v.keywordMap);
                    console.log(v.name, `texture`, v.textureProperties);
                    //console.log();
                }
            }
        }

    }

/**
 * API. バイト数を変更せずに値だけ変更する場合
 * @param {Object} inopt 
 * @param {Object} inopt.change
 * @param {ChangeInfo[]} inopt.change.changes 
 */
    getChange(inopt) {
        console.log(this.cl, `getChange called`);

/**
 * @type {ArrayBuffer}
 */
        const whole = this.chunk.whole.slice(0); // コピーを作る
        const p = new DataView(whole);
        let c = 0;

        {
            /**
             * @type {ChangeInfo[]}
             */
            const changes = inopt?.change?.changes;
            for (const v of changes) {
// アクセサーの指定する先頭を入手する
                let accindex = v.target.accessor;

                const acc = this?._root?.accessors[accindex];
                console.log(`acc`, acc, accindex);
                if (!acc) {
                    continue;
                }
                let bvindex = acc.bufferView;
                const bv = this?._root?.bufferViews[bvindex];
                console.log(`bv`, bv, bvindex);
                if (!bv) {
                    continue;
                }

                let offset = this.chunk.bin.byteOffset + bv.byteOffset;
                console.log(`offset`, `0x${offset.toString(16)}`, offset);

                for (const v2 of v.rels) {
                    c = offset + v.target.stride * v2.k + v.target.offset;
                    for (const v3 of v2.v) {
                        let val = p.getFloat32(c, true);
                        p.setFloat32(c, val + v3, true);
                        c += 4;
                    }
                }
                for (const v2 of v.abss) {
                    c = offset + v.target.stride * v2.k + v.target.offset;
                    for (const v3 of v2.v) {
                        p.setFloat32(c, v3, true);
                        c += 4;
                    }
                }
            }
        }

        return whole;
    }

/**
 * 座標値のあたりをつけたい
 */
    atari() {
        {
            const p = new DataView(this.chunk.whole);
            let c = 0;
                for (const k of [0]) {
/**
 * アクセサーの指定する先頭を入手する
 */
                    let accindex = 97;
    
                    const acc = this?._root?.accessors[accindex];
                    console.log(`acc`, acc, accindex);
                    if (!acc) {
                        continue;
                    }
                    let bvindex = acc.bufferView;
                    const bv = this?._root?.bufferViews[bvindex];
                    console.log(`bv`, bv, bvindex);
                    if (!bv) {
                        continue;
                    }

                    let offset = this.chunk.bin.byteOffset + bv.byteOffset;
                    console.log(`offset`, `0x${offset.toString(16)}`, offset);

                    for (let i = 0; i < acc.count; ++i) {
                        c = offset + i * 12;
                        let vs = [];
                        for (let j = 0; j < 3; ++j) {
                            let val = p.getFloat32(c, true);
                            vs.push(val);
                            c += 4;
                        }

                        if (0.7 <= vs[1] && vs[1] <= 1.0) {
                            console.log(i, vs[0].toFixed(3), vs[1].toFixed(3));
                        }
                    }
                }
        }
    }

} // class GltfParser


if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = GltfParser;
    }
    exports.GltfParser = GltfParser;
} else {
    global_.GltfParser = GltfParser;
}

})( (this || 0).self || (typeof self !== 'undefined') ? self : global );

