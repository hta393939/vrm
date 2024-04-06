/*!
 * index.mjs
 * Copyright (c) 2024- Usagi ウサギ
 * This software is released under the MIT License.
 */

import { Threed } from './threed.mjs';
import { VrmExporter10 } from './vrmexporter10.mjs';

/**
 * メインクラス
 */
class Misc {
/**
 * コンストラクタ
 */
    constructor() {
        this.cl = this.constructor.name;

/**
 * 共通名
 * @default 'gvrmn'
 */
        this.STORAGE = 'gvrmn';
/**
 * 
 */
        this.STORAGE_THUMB = 'gvrmthumb';

        this.baseTex = null;
        this.thumbTex = null;
        this._tex02 = null;
        this._tex03 = null;

        this.texs = [];
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
            a.dispatchEvent(new MouseEvent('click'));
        }
    }

/**
 * バイナリを生成してダウンロードして可視化へ回す
 */
    save() {
        console.log(this.cl, `save called`);
        this.vrmexporter.makeData2();

        let isdownload = false;
        const el = document.getElementById('idwithdownload');
        if (el && el.checked) {
            isdownload = true;
        }

        const urlstr = this.vrmexporter.save(true, isdownload);
        if (urlstr) {
            // todo: 
            this.threed.setModel(urlstr);
            URL.revokeObjectURL(urlstr);
        }
    }

/**
 * 
 * @param {number} num 
 */
    drawCopy(num) {
        const img = document.getElementById(`img0${num}`);
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const cv = document.getElementById(`cv0${num}`);
        cv.width = w;
        cv.height = h;
        const c = cv.getContext('2d');
        c.drawImage(img, 0, 0);
    }

/**
 * 初期化する
 */
    init() {
        console.log(this.cl, `init called`);
        {
            const threed = new Threed();
            const w = 512;
            const h = 512;
            const opt = {
                canvas: window.idcanvas
            };
            threed.init(opt, w,h, 50);
            threed.makeControl(opt.canvas);

            this.threed = threed;
        }
    }

/**
 * 
 * @param {*} x 
 * @param {*} y 
 * @param {*} z 
 */
    tos(x,y,z) {
        let v3 = new THREE.Vector3(x,y,z);
        v3 = v3.normalize();
        v3 = v3.addScalar(1).multiplyScalar(0.5 * 255);
        const s = `rgba(${v3.x},${v3.y},${v3.z}, 1)`;
        return s;
    }

/**
 * bump ってモノクロでいいんだっけ??
 * @param {HTMLCanvasElement} cv 
 */
    draw2(cv) {
        console.log(this.cl, `draw2 called bump`);

        const w = cv.width;
        const h = cv.height;
        const c = cv.getContext('2d');

        let n = new THREE.Vector3(0,0,1);
        n = n.addScalar(1.0).multiplyScalar(0.5).multiplyScalar(255.0);

        c.fillStyle = `rgba(0.5, 0.5, 1.0, 1)`;
        c.fillRect(0,0, w,h);

        for (let i = 0; i < 16; ++i) {
            c.beginPath();
//            c.arc(w/2, h/2, w/2 - 40, 0, Math.PI * 1);
            c.moveTo(i/16*w, 0);
            c.lineTo(i/16*w, h);
            c.lineWidth = 10;
            c.strokeStyle = this.tos(1,1,1);
            c.stroke();
        }
    }

/**
 * MatCap 法線で加算
 * @param {HTMLCanvasElement} cv 
 */
    draw3(cv) {
        console.log(this.cl, `draw3 called add`);

        const w = cv.width;
        const h = cv.height;
        const c = cv.getContext('2d');
        c.fillStyle = `rgba(0,0,0, 1)`;
        c.fillRect(0,0, w,h);

        c.beginPath();
        c.arc(w/2, h/2, w/2 - 40, 0, Math.PI * 1);
        c.lineWidth = 16;
        c.strokeStyle = `rgba(128,128,255, 1)`;
        c.strokeStyle = `rgba(255, 0, 0, 1)`;
        c.stroke();

        c.beginPath();
        c.arc(w/2, h/2, w/2 - 40, Math.PI * 1, Math.PI * 2);
        c.lineWidth = 16;
        c.strokeStyle = `rgba(128,128,255, 1)`;
        //c.strokeStyle = `rgba(255, 0, 0, 1)`;
        c.stroke();
    }

    /**
     * 
     * @param {HTMLCanvasElement} cv 
     */
    draw4(cv) {
        console.log(this.cl, `draw4 called add`);

        const w = cv.width;
        const h = cv.height;
        const c = cv.getContext('2d');
        const data = c.getImageData(0,0, w,h);

        for (let i = 0; i < h; ++i) {
            for (let j = 0; j < w; ++j) {
                let x = 2.0 * j / (w - 1) - 1.0;
                let y = 2.0 * i / (h - 1) - 1.0;

                let ft = (w * i + j) * 4; // bgra
                let r = Math.max(0, Math.floor(x * 255.0));
                data.data[ft] = r;
                data.data[ft+1] = 128;
                data.data[ft+2] = 0;
                data.data[ft+3] = 255;
            }
        }
        c.putImageData(data, 0,0);
    }

    /**
     * テクスチャ
     * @param {HTMLCanvasElement} cv 
     */
    draw5(cv) {
        console.log(this.cl, `draw5 called texture`);

        const w = cv.width;
        const h = cv.height;
        const c = cv.getContext('2d');
        const data = c.getImageData(0,0, w,h);

        for (let i = 0; i < h; ++i) {
            for (let j = 0; j < w; ++j) {
                let ft = (w * i + j) * 4;

                let nmx = (j * 2 - w) / w;
                let nmy = (i * 2 - h) / h;
                let x = 0.0;
                let y = 0.0;
                let z = 1.0;
                if (-0.5 <= nmx && nmx <= -0.3) {
                    x = (nmx - (-0.4)) / 0.1;
                }
                if (-0.5 <= nmy && nmy <= -0.3) {
                    y = nmy - (-0.4);
                }

                // 正規化
                let k = x ** 2 + y ** 2 + z ** 2;
                if (k > 0) {
                    k = 1 / Math.sqrt(k);
                }
                x *= k;
                y *= k;
                z *= k;

                let r = (x + 1) / 2 * 255;
                let g = (y + 1) / 2 * 255;
                let b = (z + 1) / 2 * 255;

                r = Math.max(0, Math.min(255, r));
                g = Math.max(0, Math.min(255, g));
                b = Math.max(0, Math.min(255, b));

                data.data[ft] = r;
                data.data[ft+1] = g;
                data.data[ft+2] = b;
                data.data[ft+3] = 255;
            }
        }
        c.putImageData(data, 0,0);
    }

    /**
     * 面用通常用テクスチャ
     * 
     * @param {HTMLCanvasElement} cv 
     */
    draw6(cv) {
        console.log(this.cl, `draw6 called texture`);

        const w = cv.width;
        const h = cv.height;
        const c = cv.getContext('2d');
        const data = c.getImageData(0,0, w,h);

        for (let i = 0; i < h; ++i) {
            for (let j = 0; j < w; ++j) {
                let ft = (w * i + j) * 4; // bgra

                let lv = 1;
                let x = 2.0 * j / (w - 1) - 1.0;
                let y = 2.0 * i / (h - 1) - 1.0;
                let d = Math.sqrt(x ** 2 + y ** 2);
                // 0 - 0 - 1 - 0 - 0
                d = d * 2;
                if (d > 1) {
                    d = 1;
                }
                lv = 1 - Math.cos(d * Math.PI) * 0.2;
                //lv = 1; // TODO: 模様無し

                let r = 255;
                let g = 204;
                let b = 153;
                r *= lv;
                g *= lv;
                b *= lv;

                r = Math.max(0, Math.min(255, Math.floor(r)));
                g = Math.max(0, Math.min(255, Math.floor(g)));
                b = Math.max(0, Math.min(255, Math.floor(b)));

                data.data[ft] = r;
                data.data[ft+1] = g;
                data.data[ft+2] = b;
                data.data[ft+3] = 255;
            }
        }
        c.putImageData(data, 0,0);
    }

    /**
     * テクスチャ
     * @param {HTMLCanvasElement} cv 
     */
    draw7(cv) {
        console.log(this.cl, `draw7 called texture`);

        const w = cv.width;
        const h = cv.height;
        const c = cv.getContext('2d');
        const data = c.getImageData(0,0, w,h);

        for (let i = 0; i < h; ++i) {
            for (let j = 0; j < w; ++j) {
                let x = 2.0 * j / (w - 1) - 1.0;
                let y = 2.0 * i / (h - 1) - 1.0;

                let ft = (w * i + j) * 4; // bgra

                let d = Math.abs(x);
                d *= 2;
                if (d > 1) {
                    d = 1;
                }
                let lv = (Math.cos(d * Math.PI) + 1) * 0.5;
                //lv = 1;

                lv = Math.floor(lv * 255);
                lv = Math.max(0, Math.min(255, lv));

                data.data[ft] = lv;
                data.data[ft+1] = 0;
                data.data[ft+2] = 0;
                data.data[ft+3] = 255;
            }
        }
        c.putImageData(data, 0,0);
    }

    /**
     * 
     * @param {HTMLCanvasElement} cv 
     */
    drawInner(cv) {
        console.log(this.cl, `drawInner called add`);

        const w = cv.width;
        const h = cv.height;
        const c = cv.getContext('2d');
        const data = c.getImageData(0,0, w,h);

        for (let i = 0; i < h; ++i) {
            for (let j = 0; j < w; ++j) {
                let r = 0;
                let g = 0;
                let b = 0;

                data.data[ft] = r;
                data.data[ft+1] = g;
                data.data[ft+2] = b;
                data.data[ft+3] = 255;
            }
        }

        c.putImageData(data, 0,0);
    }

/**
 * メイン
 */
    makeFile() {
        console.log(this.cl, `makeFile called`);
        { // バイナリ作る
            this.vrmexporter.makeData2();

            let isdownload = false;
            const el = document.getElementById('idwithdownload');
            if (el?.checked) {
                isdownload = true;
            }

            const urlstr = this.vrmexporter.save(true, isdownload);
            if (urlstr) {
                this.threed.setModel(urlstr);
                URL.revokeObjectURL(urlstr);

                setTimeout(() => {
                    this.saveSetting();
                }, 3000);
            }
        }
    }

    loadSetting() {
        console.log(`loadSetting called`);

        let str = localStorage.getItem(this.STORAGE);
        try {
            const obj = JSON.parse(str);
            if (obj) {

            }
        } catch(ec) {
            console.warn(`parse catch`, ec.message);
        }
    }
    saveSetting() {
        console.log(this.cl, `saveSetting called`);

        const obj = {};
        let str = '';
        if (true) {
            const cv = document.getElementById('idcanvas');
            str = cv.toDataURL('image/png');
        }
        localStorage.setItem(this.STORAGE_THUMB, str);
        console.log(this.cl, `saveSetting leave`, obj, str.length);
    }

    async onload() {
        console.log('onload called');
        this.loadSetting();
    
        const sp = new URLSearchParams(location.search);
        for (const k of ['style']) {
            if (!sp.has(k)) {
                continue;
            }
            let val = sp.get(k) ?? true;
            try {
                val = JSON.parse(val);
            } catch(ec) {

            }
            this[k] = val;
        }

        {
            const vrmexporter = new VrmExporter10();
            this.vrmexporter = vrmexporter;
        }
    
        {
            idsave3.addEventListener('click', ev => {
                this.makeFile();
            });
        }

        {
            const elopen = document.getElementById('idopen');
            if (elopen) {
                elopen.addEventListener('click', ev => {
                    let optstr = `popup,innerWidth=512,innerHeight=512`;
                    window.open(location.href + '?style=fix', null, optstr);
                });
            }

            const elbegin = document.getElementById('idbeginrec');
            const elend = document.getElementById('idendrec');
            if (elbegin && elend) {
                elbegin.addEventListener('click', ev => {
                    elbegin.setAttribute('disabled', 'disabled');
                    elend.removeAttribute('disabled');
                    this.beginRec();
                });

                elend.addEventListener('click', ev => {
                    elbegin.removeAttribute('disabled');
                    elend.setAttribute('disabled', 'disabled');
                    this.endRec();
                });


                document.addEventListener('keydown', ev => {
                    switch(ev.key) {
                    case 'b':
                        elbegin.dispatchEvent(new MouseEvent('click'));
                        break;
                    case 'e':
                        elend.dispatchEvent(new MouseEvent('click'));
                        break;
                    case 'm':
                        idsave3.dispatchEvent(new MouseEvent('click'))
                        break;
                    }
                });
            }
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

    beginRec() {
        const stream = this.stream;
        const recordOpt = {
            videoBitsPerSecond: 1000 * 1000 * 10,
            //mimeType: 'video/mp4'
        };
        const mr = new MediaRecorder(stream, recordOpt);
        this.mr = mr;
        const chunks = [];
        mr.addEventListener('dataavailable', ev => {
            chunks.push(ev.data);
        });
        mr.addEventListener('stop', ev => {
            Util.download(new Blob(chunks), `m_${Util.dtstr()}.webm`);
        });
        mr.start();
    }

    endRec() {
        this.mr.stop();
    }

/**
 * 高頻度に呼ばれる関数
 */
    update() {
        requestAnimationFrame(() => {
            this.update();
        });

        this.threed.update();
    }

}

const misc = new Misc();
misc.onload();

