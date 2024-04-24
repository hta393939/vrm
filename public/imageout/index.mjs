/*!
 * index.mjs
 * Copyright (c) 2024- Usagi ウサギ
 * This software is released under the MIT License.
 */

import { Threed } from './threed.mjs';

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

  static pad(v, n = 2) {
    return String(v).padStart(n, '0');
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
 * 
 * @param {string} url 
 * @param {HTMLProgressElement} progress 
 * @returns 
 */
  async loadFile(url, progress) {
    const res = await fetch(url);
    let length = Number.parseInt(res.headers['content-length']);
    if (!Number.isFinite(length)) {
      length = 18776268;
    }
    progress.max = length;

    let sum = 0;
    const reader = res.body.getReader();
    const chunks = [];
    while(true) {
      const result = await reader.read();
      if (result.value) {
        chunks.push(result.value);
        sum += result.value.byteLength;
        progress.value = sum;
        //console.log(sum, length, (sum / length).toFixed(2));
      }
      if (result.done) {
        break;
      }
    }
    progress.value = progress.max;
    const blob = new Blob(chunks);
    return blob;
  }

  static origin() {
    return `${location.protocol}/${location.host}`;
  }

/**
 * 初期化する
 */
  async init() {
    console.log(this.cl, `init called`);

    const modelBlob = await this.loadFile('Zundamon(Human)_VRM_10.vrm',
      window.progressbar);
    const bloburl = URL.createObjectURL(modelBlob);
    //const bloburl2 = URL.createObjectURL(modelBlob);
    {
      const threed = new Threed();
      //const w = 512;
      //const h = 512;
      const w = 960;
      const h = 540;
      const opt = {
        canvas: window.idcanvas,
        model: bloburl,
      };
      threed?.init(opt, w,h, 50);
      threed?.makeControl(opt.canvas);

      //this.threed = threed;
    }
    {
      const threed = new Threed();
      //const w = 512;
      //const h = 512;
      const w = 960;
      const h = 540;
      const opt = {
        canvas: window.idcanvas2,
        model: bloburl,
      };
      threed.init(opt, w,h, 50);
      threed.makeControl(opt.canvas);

      this.threed2 = threed; 
    }

    {
      window.addEventListener('message', ev => {
        switch(ev.data.type) {
        case 'sendmotion':
          console.log(ev.data.type, ev.data);

          this.threed?.setOneJoint(ev.data);
          break;

        case 'geterot':
          {
            const erot = this.threed?.geterot(ev.data.targetname);
            const obj = {
              type: 'reserot',
              erot,
            };
            ev.source.postMessage(obj);
          }
          break;

        case 'opened':
          console.log('panel opened');
          {
            const obj = {
              type: 'ping',
            };
            this.panel?.postMessage(obj, Misc.origin());
            break;
          }
        }
      });
    }

  }

  initWS() {
    const port = 40080;
    let url = `ws://localhost:${port}/ws`;
    const ws = new WebSocket(url);
    this.ws = ws;
    this.setHandler(ws);
  }

/**
 * 
 * @param {WebSocket} ws 
 */
  setHandler(ws) {
    ws.addEventListener('open', () => {
      console.log('open fire');
      this.threed2?.ms?.splice(0);
      this.applyMotion();
    });
    ws.addEventListener('error', ev => {
      console.log('error fire', ev);
    });
    ws.addEventListener('close', ev => {
      console.log('close fire', ev);
    });
    ws.addEventListener('message', ev => {
      const el = document.getElementById('isws');
      if (!(el?.checked)) {
        return;
      }

      const ms = this.threed2?.ms || [];
      const data = ev.data;
      switch(data.type) {
      case 'motion':
        { // 時刻が正しいところに追加する
          const num = ms.length;
          if (num === 0) {
            ms.push(ev.data);
            this.applyMotion();
            return;
          }
          for (let i = 0; i < num; ++i) {
            const m = ms[i];
            if (m.ts === data.ts) {
              ms[i] = data;
              this.applyMotion();
              return;
            }
            if (m.ts < data.ts) {
              continue;
            }
            // data.ts < ms[i].ts
            // i-1 と i の間に挿入。i === 0 のときも ok
            ms.splice(i, 0, data);
            this.applyMotion();
            return;
          }
          // 最後に追加する
          ms.push(m);
          this.applyMotion();
        }
        break;
      }
    });
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

/**
 * ディレクトリを指定する
 */
  async selectDir() {
    let dirHandle = await window.showDirectoryPicker({
      mode: 'readwrite'
    });
    this.dirHandle = dirHandle;
    // kind, name
    console.log('selectDir leave', dirHandle);
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
      const el = document.getElementById('selectdir');
      el?.addEventListener('click', async () => {
        this.selectDir();
      });
    }

    {
      const elopen = document.getElementById('idopen');
      elopen?.addEventListener('click', ev => {
        let optstr = `popup,innerWidth=512,innerHeight=512`;
        window.open(location.href + '?style=fix', null, optstr);
      });
// 録画の開始
      const elbegin = document.getElementById('idbeginrec');
      const elend = document.getElementById('idendrec');
      if (elbegin && elend) {
        elbegin.addEventListener('click', ev => {
          elbegin.setAttribute('disabled', 'disabled');
          elend.removeAttribute('disabled');
          this.record();
        });

        elend.addEventListener('click', ev => {
          //elbegin.removeAttribute('disabled');
          //elend.setAttribute('disabled', 'disabled');
          //this.endRec();
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

        const isws = document.getElementById('isws');
        if (isws) {
          isws.checked = false;
          this.threed2?.ms?.splice(0);
          this.applyMotion();
        }

        const file = ev.dataTransfer.files[0];
        const url = URL.createObjectURL(file);
        this.threed2.setAnimation(url, file);
      });
    }

    {
      const el = document.getElementById('downloadmulti');
      el?.addEventListener('click', () => {
        console.log('download');
        Misc.download(new Blob([JSON.stringify({
          ms: this.threed2.ms,
        })]), `a.json`);
      });
    }
    {
      const el = document.getElementById('clearmulti');
      el?.addEventListener('click', () => {
        console.log('clearmulti');
        this.threed2?.ms?.splice(0);
        this.applyMotion();
      });
    }
    {
      const el = document.getElementById('pseudosend');
      el?.addEventListener('click', () => {
        console.log('pseudosend');
        const obj = {
          type: 'motion',
          b: {},
          e: {},
          ts: 123,
        };
        this.ws?.send(JSON.stringify(obj));
      });
    }

    this.initWS();

    this.update();
    console.log(`leave`, this);
  }

  applyMotion() {
    {
      const el = document.getElementById('multiview');
      if (el) {
        const ms = this.threed2?.ms || [];
        el.textContent = `${ms?.length}, ${ms?.[0]?.ts}, ${ms?.[ms?.length - 1]?.ts}`;
      }
    }
  }

/**
 * 
 * @param {Blob} blob 
 * @param {string} name 
 */
  static download(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  }

/**
 * 
 * @param {HTMLCanvasElement} canvas 
 * @returns {Promise<Blob>}
 */
  getImage(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        resolve(blob);
      }, 'image/png');
    });
  }

/**
 * オフライン録画を開始したい
 */
  async record() {
    let durationSec = 1;
    let fps = 30;
    const canvas = document.getElementById('idcanvas2');
    this.threed2.clearSec();
/**
 * @type {FileSystemDirectoryHandle}
 */
    const dirHandle = this.dirHandle;

    for (let i = 0; i <= fps * durationSec; ++i) {
      const name = `a${Misc.pad(i, 5)}.png`;
      // 更新する
      let sec = i / fps;
      // アップデートする
      this.threed2?.updateSec(sec);
      // 画像を作成する
      const blob = await this.getImage(canvas);
      // フォルダに書き出す
      console.log('blob', blob.size, name);

      const fileHandle = await dirHandle.getFileHandle(name,
        { create: true });
      console.log('fileHandle', fileHandle);
      const writer = await fileHandle.createWritable();
      const ab = await blob.arrayBuffer();
      await writer.write(ab);
      await writer.close();
    }
  }

/**
 * 高頻度に呼ばれる関数
 */
  update() {
    requestAnimationFrame(() => {
      this.update();
    });

    this.threed?.update();
    this.threed2?.update();
  }

}

const misc = new Misc();
misc.onload();

