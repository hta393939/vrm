/**
 * @file panel.mjs
 */

class Panel {
    static els = ['x', 'y', 'z'];

    constructor() {

    }

    static origin() {
        return `${location.protocol}/${location.host}`;
    }

    init() {

        const sp = new URLSearchParams(location.search);


        window.addEventListener('message', ev => {
            switch(ev.data.type) {
            case 'ping':
                console.log(ev.data.type, ev.data);
                break;
            }
        });

        const parent = window.opener;
        const obj = {
            type: 'opened',
            erot: [0, 45, 0],
            target: 'left',
        };
        console.log('parent', parent, location.host);
        parent.postMessage(obj, Panel.origin());

        {
            const els = ['x', 'y', 'z'];
            for (let i = 0; i < 3; ++i) {
                const id = `erot${els[i]}`;
                const el = document.getElementById(id);
                const view = document.getElementById(`${id}view`);
                el?.addEventListener('input', () => {
                    const val = Number.parseFloat(el.value);
                    view.textContent = `${val}`;

                    this.sendMotion();
                });
                el?.addEventListener('change', () => {
                    //this.sendMotion();
                });
                el?.dispatchEvent(new CustomEvent('input'));
            }
        }

        {
            const el = document.getElementById('targetname');
            const selCenter = document.getElementById('centernames');
            selCenter?.addEventListener('change', () => {
                if (el) {
                    el.value = selCenter.value;
                }
            });
        }
    }

    sendMotion() {
        // 収集して送信
        const obj = {
            type: 'sendmotion',
            erot: [],
        };
        {
            const el = document.getElementById('targetname');
            obj.targetname = el.value;
        }
        for (let i = 0; i < 3; ++i) {
            const id = `erot${Panel.els[i]}`;
            const el = document.getElementById(id);
            const val = Number.parseFloat(el.value);
            obj.erot.push(val);
        }

        window.opener?.postMessage(obj,
            Panel.origin());
    }

}

const panel = new Panel();
panel.init();

