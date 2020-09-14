
importScripts('./gltfparser.js');

self.addEventListener('message', ev => {
    console.log(`worker message fire`, ev.data);

    switch(ev.data.type) {
    case 'parse':
        {
            const parser = new GltfParser();
            console.log(`not implemented`);
        }
        break;
    }

    const obj = {
        type: 'result',
        value: {
            buf: new Uint8Array(65536)
        }
    };
    self.postMessage(obj);
    //self.postMessage(obj, [obj.value.buf]);
});
