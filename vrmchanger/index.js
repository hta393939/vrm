/**
 * @file index.js
 */
// MIT License (c) 2018- Usagi

'use strict';

/** */
const pad = (v, n = 2) => {
    return String(v).padStart(n, '0');
};

/** */
const datestr = (d = new Date()) => {
    let s = '';
    s += `${pad(d.getFullYear(), 4)}`;
    s += `${pad(d.getMonth() + 1)}`;
    s += `${pad(d.getDate())}`;
    s += `_${pad(d.getHours())}`;
    s += `${pad(d.getMinutes())}`;
    s += `${pad(d.getSeconds())}`;
    return s;
};

/**
 * 
 */
class Changer {
    constructor() {
/**
 * 
 */
        this.cl = this.constructor.name;
/**
 * パーサ兼維持用
 * @type {GltfParser}
 */
        this.parser = new GltfParser({});
    }

/**
 * サーバのパスを指定する場合
 * @param {string} inPath 
 */
    loadFile(inPath) {
        console.log(this.cl, `loadFile called`, inPath);
        {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', inPath);
            xhr.responseType = 'arraybuffer';
            xhr.addEventListener('load', ev => {
                this.parser.parse(ev.currentTarget.response);
            });
            xhr.send();
        }
    }

    /**
     * .vrm をドロップしたとき
     * @param {File} file 
     */
    async readFile(file) {
        console.log(this.cl, `readFile called`);

        window.idtextsame.value = file.name;

        const ab = await file.arrayBuffer();
        this.parser.parse(ab);
        this.parser.view();
        this.parser.atari();
    }

/**
 * 初期化する
 */
    init() {
        console.log(this.cl, `init called`);
        {
            const threed = new Threed();
            const dom = threed.init(640,360, 30);
            if (dom) {
                idwebgl.appendChild(dom);
                threed.makeControl(dom);


            }
            this.threed = threed;
        }

        {
            const worker = new Worker(`./parser_ww.js`);
            this.worker = worker;

            worker.addEventListener('message', ev => {
                console.log(`message fire`, ev.data);

            });

            const obj = {
                type: 'parse',
                param: {}
            };
            worker.postMessage(obj);
        }

        {
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
    
        {
            document.body.addEventListener('dragover', ev => {
                ev.preventDefault();
                ev.stopPropagation();
                ev.dataTransfer.dropEffect = 'none';
            });

            {
                const el = window.iddrop;
                el.addEventListener('dragover', ev => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    ev.dataTransfer.dropEffect = 'link';
                });
                el.addEventListener('drop', ev => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    this.readFile(ev.dataTransfer.files[0]);
                });
            }

            {
                const el = window.idjson;
                el.addEventListener('dragover', ev => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    ev.dataTransfer.dropEffect = 'link';
                });
                el.addEventListener('drop', ev => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    this.changeFile(ev.dataTransfer.files[0]);
                });
            }
        }
    
        {
            const el = document.getElementById('idpreset');
            if (el) {
                el.addEventListener('click', async ev => {
                    const res = await fetch('./data01.json');
                    const blob = await res.blob();
                    this.changeFile(blob);
                });
            }
        }

        this.setListener();

        this.update();
        console.log(`leave`);
    }

    setListener() {
        for (const k of ['x', 'y', 'z']) {
            const el = document.getElementById(`id${k}`);
            if (el) {
                el.addEventListener('input', () => {
                    const q = window[`id${k}view`];
                    q.textContent = `${(el.value / 1000).toFixed(3)}`;
                });
            }
        }
    }

    update() {
        requestAnimationFrame(this.update.bind(this));

        this.threed.update();
    }

/**
 * 
 * @param {File} file 
 */
    async changeFile(file) {
        console.log(this.cl, `changeFile called`);
        try {
            const text = await file.text();
            const obj = JSON.parse(text);

            console.log(`obj parse`, obj);

            const whole = this.parser.getChange(obj);

            let name = `tmp.vrm`;
            if (window.idnamesame.checked) {
                name = window.idtextsame.value;
            } else if (window.idnametime.checked) {
                name = `a_${datestr()}.vrm`;
                window.idtexttime.value = name;
            } else if (window.idnameany.checked) {
                name = window.idtextany.value;
            }
            this.download(whole, name);

        } catch(ec) {
            console.warn(this.cl, `changeFile catch`, ec.message);
        }
    }

/**
 * ダウンロードする
 * @param {ArrayBuffer} ab 変更後バイナリ
 * @param {string} name 保存名
 */
    download(ab, name) {
        console.log(this.cl, `download called`);

        {
            const a = document.createElement('a');
            a.download = `${name}`;
            a.href = URL.createObjectURL(new Blob([ab]));
            a.dispatchEvent(new MouseEvent('click'));
        }
    }

}

const misc = new Changer();

window.addEventListener('load', () => {
    misc.init();
});

