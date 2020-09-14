/// <reference path="./index.d.ts" />

'use strict';

class Vtx {
    /**
     * 頂点1個分
     */
    constructor() {
        this.p = new THREE.Vector3();
        this.n = new THREE.Vector3(0,1,0);
        this.uv = new THREE.Vector2(0.5, 0.5);

        this.tan = new THREE.Vector4(1,0,0, 1);
        this.wei = new THREE.Vector4(1,0,0,0);
        this.jnt = new THREE.Vector4(0,0,0,0);

        this.NAME = 'Vtx';
    }

    /**
     * n をセットした後に tan を計算する
     */
    calcStandardTan() {
        const _this = this;
        let up = new THREE.Vector3(0,1,0);
        let d = up.dot(_this.n);
        if (Math.abs(d) <= 0.9) {
            let vec = new THREE.Vector3();
            vec.crossVectors(up, _this.n);
            _this.tan.set(vec.x, vec.y, vec.z, 1);
        } else {
            if (d > 0) {
                _this.tan.set(1, 0, 0, 1);
            } else {
                _this.tan.set(1, 0, 0, 1);
            }
        }

    }

}
