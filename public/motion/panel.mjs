/**
 * @file panel.mjs
 */

class Panel {
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
    }
}

const panel = new Panel();
panel.init();

