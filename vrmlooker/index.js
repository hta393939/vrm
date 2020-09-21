/**
 * @file index.js
 */
// MIT License (c) 2018- Usagi

/// <reference path="./index.d.ts" />

'use strict';

class Misc {
    constructor() {
/**
 * 
 */
        this.cl = this.constructor.name;
/**
 * パーサ兼維持用
 */
        this.parser = new GltfParser({});
    }

    init() {
        console.log(this.cl, `init called`);

        {
            const worker = new Worker(`./parser_ww.js`);
            this.worker = worker;

            worker.addEventListener('message', ev => {
                console.log(`worker message fire`, ev.data);


            });

            const obj = {
                type: 'parse',
                param: {}
            };
            worker.postMessage(obj);
        }
    }

    /**
     * .vrm をドロップしたとき
     * @param {File} file 
     */
    async readFile(file) {
        console.log(this.cl, `readFile called`, file.name);

        const ab = await file.arrayBuffer();
        this.parser.parse(ab);
        this.parser.view();
    }

    onload() {    
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
        }
    
        console.log(`leave`);
    }

}

const misc = new Misc();

window.addEventListener('load', () => {
    misc.onload();
});

