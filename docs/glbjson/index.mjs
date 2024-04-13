/*!
 * index.mjs
 * Copyright (c) 2024- Usagi ウサギ
 * This software is released under the MIT License.
 */

/**
 * メインクラス
 */
class Misc {
/**
 * コンストラクタ
 */
    constructor() {
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
        for (const key in obj) {
            const val = obj[key];
            console.log(key, val);
        }
    }

}

const misc = new Misc();
misc.onload();

