/**
 * @file index.js
 */
// MIT License (c) 2018- Usagi

/// <reference path="./index.d.ts" />

'use strict';

/**
 * 
 */
class Changer {
    constructor() {
        this.cl = this.constructor.name;
/**
 * パーサ兼維持用
 */
        this.parser = new GltfParser({});
    }

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
        const ab = await file.arrayBuffer();
        this.parser.parse(ab);
        this.parser.view();
    }

    onload() {
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
    
        {
            document.body.addEventListener('dragover', ev => {
                ev.preventDefault();
                ev.stopPropagation();
                ev.dataTransfer.dropEffect = 'none';
            });
    
            iddrop.addEventListener('dragover', ev => {
                ev.preventDefault();
                ev.stopPropagation();
                ev.dataTransfer.dropEffect = 'link';
            });
            iddrop.addEventListener('drop', ev => {
                ev.preventDefault();
                ev.stopPropagation();
                this.readFile(ev.dataTransfer.files[0]);
            });

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
    
        update();
        console.log(`leave`);
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

            const whole = new ArrayBuffer(32);
            this.download(whole, `a_${'1234'}.vrm`);

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

        const a = document.createElement('a');
        a.download = name;
        a.href = URL.createObjectURL(new Blob([ab]));
        a.dispatchEvent(new MouseEvent('click'));
    }

}

const misc = new Changer();

window.addEventListener('load', () => {
    misc.onload();
});

