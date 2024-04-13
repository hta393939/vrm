/*!
 * index.mjs
 * Copyright (c) 2024- Usagi ウサギ
 * This software is released under the MIT License.
 */

import { Threed } from './threed.mjs';
import { VrmaExporter } from './vrmaexporter.mjs';
import {} from '../thirdparty/threejs/three-vrm.module.min.2.1.1.js';

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
        {
            const threed = new Threed();
            const w = 512;
            const h = 512;
            const opt = {
                canvas: window.idcanvas2
            };
            threed.init(opt, w,h, 50);
            threed.makeControl(opt.canvas);

            this.threed2 = threed; 
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
        return;

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
        //console.log(`saveSetting called`);
        //console.log(`saveSetting leave`);
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
            const vrmaexporter = new VrmaExporter();
            this.vrmexporter = vrmaexporter;
        }
    
        {
            window.idsave3?.addEventListener('click', ev => {
                this.makeFile();
            });
        }

        {
            const elopen = document.getElementById('idopen');
            elopen?.addEventListener('click', ev => {
                let optstr = `popup,innerWidth=512,innerHeight=512`;
                window.open(location.href + '?style=fix', null, optstr);
            });

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
            window.idvis?.addEventListener('change', ev => {
                this.threed.setVisible('model', ev.currentTarget.checked);
            });
            window.idwire?.addEventListener('change', ev => {
                this.threed.setWire(ev.currentTarget.checked);
            });
            window.idaxes?.addEventListener('change', ev => {
                this.threed.setVisible('axes', ev.currentTarget.checked);
            });
        }
        {
            document.body?.addEventListener('dragover', ev => {
                ev.preventDefault();
                ev.stopPropagation();
                ev.dataTransfer.dropEffect = 'none';
            });

            const el = document.getElementById('drop');
            el?.addEventListener('dragover', ev => {
                ev.preventDefault();
                ev.stopPropagation();
                ev.dataTransfer.dropEffect = 'link';
            });
            el?.addEventListener('drop', ev => {
                ev.preventDefault();
                ev.stopPropagation();
                this.glb(ev.dataTransfer.files[0]);
            });
        }
    
        this.update();
        console.log(`leave`, this);
    }

/**
 * ドロップしたファイルの JSON だけ取り出す
 * @param {File} file 
 */
    async glb(file) {
        const ab = await file.arrayBuffer();
        const p = new DataView(ab);
        let c = 0;
        c = 12;
        const jsonByte = p.getUint32(c, true);
        c += 8;
        const jsonText = new TextDecoder().decode(ab.slice(c, c + jsonByte));
        const obj = JSON.parse(jsonText);
        console.log('JSON', obj);
    }

/**
 * 高頻度に呼ばれる関数
 */
    update() {
        requestAnimationFrame(() => {
            this.update();
        });

        this.threed.update();
        this.threed2.update();
    }

}

const misc = new Misc();
misc.onload();

