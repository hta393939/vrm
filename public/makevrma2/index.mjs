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

