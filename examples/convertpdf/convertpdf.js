/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */

'use strict';

Module.jsuno.then(function(jsuno) {
    const css = jsuno.uno.com.sun.star;
    const context = jsuno.getUnoComponentContext();
    const desktop = css.frame.Desktop.create(context);

    jsuno.mainPort.onmessage = function (e) {
        switch (e.data.cmd) {
        case 'convert':
            try {
                const from = e.data.from;
                const to = e.data.to;
                const doc = desktop.loadComponentFromURL(
                    'file://' + from, '_blank', 0,
                    [new css.beans.PropertyValue({Name: 'Hidden', Value: true})]);
                doc.storeToURL(
                    'file://' + to,
                    [new css.beans.PropertyValue({Name: 'Overwrite', Value: true}),
                     new css.beans.PropertyValue(
                         {Name: 'FilterName', Value: 'writer_pdf_Export'})]);
                if (jsuno.fromAny(doc.queryInterface(jsuno.type.interface(css.util.XCloseable))) !==
                    undefined)
                {
                    doc.close(false);
                }
                jsuno.mainPort.postMessage({cmd: 'converted', name: e.data.name, from, to});
            } catch (e) {
                const exc = jsuno.catchUnoException(e);
                console.log('TODO', exc.type, jsuno.fromAny(exc).Message);
            }
            break;
        default:
            throw Error('Unknonwn message command ' + e.data.cmd);
        }
    }

    jsuno.mainPort.postMessage({cmd: 'start'});
});

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
