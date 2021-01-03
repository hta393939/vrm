
/**
 * @file gltfparser.js
 * MIT License (c) 2018- Usagi
 */

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
 * パーサー
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
 * @type {Uint8Array | Blob} バイナリチャンク全体
 */
        this.bin = null;

/**
 * @type {Uint8Array[]} 維持格納用
 */
        this._bvs = [];
/**
 * json 側のルートからのオブジェクト
 * @type {Object}
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
 * 画像部分
 * @param {{}} obj 
 * @param {{buffer:ArrayBuffer, byteOffset: number, byteLength: number}} bin
 */
    parseImage(obj, bin) {
        if (!Array.isArray(obj.images)) {
            console.log(this.cl, `parseImage, no images`);
            return;
        }
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

            console.log(this.cl, `parseImage leave`, i);
        });
    }

/**
 * API
 * @param {ArrayBuffer} ab 
 */
    parse(ab) {
        console.log(this.cl, `parse called`, ab);

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

            const sbuf = new Uint8Array(ab, c, chunkByte);
            const s8 = decoder.decode(sbuf);
            const obj = JSON.parse(s8);
            console.log(`json`, obj);
            this._root = obj;
            if (false) {
                try {
                    const accindex = obj.skins[0].inverseBindMatrices;
                    console.log('accindex', accindex);
                } catch(ec) {
                    console.warn(``, ec.message);
                }
            }

            c += chunkByte;
            chunkByte = p.getUint32(c, true);
            four = new Uint8Array(ab, c + 4 , 4);
            fourcc = decoder.decode(four);
            c += 8;

            // bin の部分
            const q = new DataView(ab, c, chunkByte);

            let d = 0;
            let s = ``;
            if (false) {
                let bv8 = obj.bufferViews[8];
                d = bv8.byteOffset;
                let n = bv8.byteLength / 4 / 16;
                for (let i = 0; i < n; ++i) {
                    for (let j = 0; j < 4; ++j) {
                        let ss = [];
                        for (let k = 0; k < 4; ++k) {
                            v = q.getFloat32(d, true);
                            d += 4;
                            ss.push(v);
                        }
                        //console.log(`${ss.join(', ')}`);
                    }
                }
            }
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
                    byteOffset: chunkOffset, byteLength: chunkByte
                };
                this.parseImage(obj, info);
            }
            console.log(this.cl, `parse leave`, c, ab.byteLength);
        }
    }

/**
 * 
 */
    view() {
        console.log(this.cl, `view called`);
        // TODO: 見やすくしたい

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

        if (Array.isArray(json.skins)) {
            for (const v of json.skins) {
                console.log('skin', v);
            }
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

