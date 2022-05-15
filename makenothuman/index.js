/**
 * @file index.js
 */
// MIT License (c) 2018- Usagi

/// <reference path="./index.d.ts" />

'use strict';

/** */
class Misc {
    constructor() {
/** */
        this.cl = this.constructor.name;

/**
 * 共通名
 */
        this.STORAGE_THUMB = 'gvrmthumb';
/** */
        this.baseTex = null;
/** */
        this.thumbTex = null;
/**
 * 
 */
        this.sphereTex = null;
/** */
        this.texs = [];
    }

    save() {
        console.log(this.cl, `save called`);
        this.gltf.makeData();
        const urlstr = this.gltf.save(true);
        if (urlstr) {
            // todo: 
            this.threed.setModel(urlstr);
            URL.revokeObjectURL(urlstr);
        }
    }

/**
 * 初期化
 */
    init() {
        console.log(this.cl, `init called`);

        const cv0 = window.cv0;
        const cv1 = window.cv1;
        const tex = [
            { cv: cv0, name: 'baseTex' },
            { cv: cv1, name: 'sphereTex' },
        ];

        {
            cv0.width = 16;
            cv0.height = 16;
        }
        this.draw(cv0);
        this.draw1(cv1);

        for (const v of tex) {
            try {
                v.cv.toBlob(async blob => {
                    console.log(`${v.name} load fire`, blob);
                    this.gltf[v.name] = await blob.arrayBuffer();
                }, 'image/png');
            } catch(ec) {
                console.warn(this.cl, `toBlob catch`, ec.message);
            }
        }

        {
            const threed = new Threed();
            const w = 256;
            const h = 256;
            const dom = threed.init(w,h, 50);
            if (dom) {
                idwebgl.appendChild(dom);
                threed.makeControl(dom);
            }
            this.threed = threed;
        }

    } // init


/**
 * ベーステクスチャ
 * @param {HTMLCanvasElement} cv 
 */
    draw(cv) {
        console.log(`draw called`);
        const w = cv.width;
        const h = cv.height;
        const c = cv.getContext('2d');
        if (c) {
            c.drawImage(window.idthumb, 0, 0);
            return;

            let cnt = -8;
            const n = 16;
            for (let i = 0; i < n; ++i) {
                for (let j = 0; j < n; ++j) {
                    let x = j * 4;
                    let y = i * 4;
                    let r = 51 * (Math.floor(cnt / 36) % 6);
                    let g = 51 * (Math.floor(cnt / 6) % 6);
                    let b = 51 * (cnt % 6);
                    let a = 1;

                    if (cnt < 0) {
                        if (cnt <= -5) {
                            r = 255;
                            g = 255;
                            b = 255;
                            a = 0.25 * (cnt + 8);
                        } else {
                            r = 0;
                            g = 0;
                            b = 255;
                            a = 0.5;
                            if (cnt === -3) {
                                r = 255;
                                g = 0;
                                b = 0;
                            } else if (cnt === -2) {
                                r = 0;
                                g = 255;
                                b = 255;
                            } else if (cnt === -1) {
                                r = 0;
                                g = 255;
                                b = 0;
                            }
                        }
                    } else if (cnt >= 216) {
                        r = 128;
                        g = 128;
                        b = 128;
                        a = 1;
                    }

                    c.fillStyle = `rgba(${r},${g},${b}, ${a})`;
                    c.fillRect(x,y, 4, 4);
                    ++cnt;
                }
            }
        }
    }

/**
 * スフィアadd テクスチャ
 * @param {HTMLCanvasElement} cv 
 */
    draw1(cv) {
        console.log(`draw1 called`);
        const w = cv.width;
        const h = cv.height;
        const c = cv.getContext('2d');
        if (!c) {
            return;
        }

        const data = c.getImageData(0, 0, w, h);
        for (let i = 0; i < h; ++i) {
            for (let j = 0; j < w; ++j) {
                let x = (j - w/2 + 0.5) / (w / 2);
                let y = (i - h/2 + 0.5) / (h / 2);
                let rr = Math.sqrt(x ** 2 + y ** 2);
                let lv = (rr ** 4) * 255.0;

                let rx = x - 0.5;
                let ry = y - 0.0;
                let rr2 = Math.sqrt(rx ** 2 + ry ** 2);

                let offset = (w * i + j) * 4;
                let r = Math.floor((0.6 - rr2) * 255.0);
                let g = Math.floor(lv);
                let b = Math.floor(lv);
                let a = 255;
                if (rr >= 1.02) {
                    r = 0;
                    g = 0;
                    b = 0;
                }

                data.data[offset] = r;
                data.data[offset+1] = g;
                data.data[offset+2] = b;
                data.data[offset+3] = a;
            }
        }
        c.putImageData(data, 0, 0);
    }

    tos(x,y,z) {
        let v3 = new THREE.Vector3(x,y,z);
        v3 = v3.normalize();
        v3 = v3.addScalar(1).multiplyScalar(0.5 * 255);
        const s = `rgba(${v3.x},${v3.y},${v3.z}, 1)`;
        return s;
    }

/**
 * メイン
 */
    makeFile() {
        console.log(this.cl, `makeFile called`);
        { // バイナリ作る
            this.gltf.makeData2();
            const urlstr = this.gltf.save(true);
            if (urlstr) {
                this.threed.setModel(urlstr);
                URL.revokeObjectURL(urlstr);

                setTimeout(() => {
                    this.saveSetting();
                }, 3000);
            }
        }
    }

    loadFile(inPath) {
        console.log(this.cl, `loadFile called`, inPath);
        {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', inPath);
            xhr.responseType = 'arraybuffer';
            xhr.addEventListener('load', ev => {
                const parser = new GltfParser();
                parser.parse(ev.currentTarget.response);
            });
            xhr.send();
        }
    }

    loadSetting() {
        console.log(`loadSetting called`);

        let str = localStorage.getItem(this.STORAGE_THUMB);
        if (str) {
            window.imgthumb.src = str;
            console.log(`str.length`, str.length);
        }
    }
    saveSetting() {
        console.log(this.cl, `#saveSetting called`);

        const obj = {};
        let str = '';
        if (true) {
            const cv = window.idwebgl.children[0];
            str = cv.toDataURL('image/png');
        }
        localStorage.setItem(this.STORAGE_THUMB, str);
        console.log(this.cl, `#saveSetting leave`, obj, str.length);
    }

    onload() {
        this.loadSetting();
    
        {
            const gltf = new Gltf();
            this.gltf = gltf;
            //gltf.loadObj('obj11_6.obj');
        }
    
        {
            idSave3.addEventListener('click', ev => {
                this.makeFile();
            });
        }
    
        {
            this.init();
            info0.textContent = `${new Date().toLocaleString()}`;
        }
    
        {
            idvis.addEventListener('change', ev => {
                this.threed.setVisible('model', ev.currentTarget.checked);
            });
            idwire.addEventListener('change', ev => {
                this.threed.setWire(ev.currentTarget.checked);
            });
            idaxes.addEventListener('change', ev => {
                this.threed.setVisible('axes', ev.currentTarget.checked);
            });
        }
    
        this.update();
        console.log(`leave`, this);
    }

    update() {
        requestAnimationFrame(() => {
            this.update();
        });

        this.threed.update();
    }

}

const misc = new Misc();

window.addEventListener('load', () => {
    misc.onload();
});

