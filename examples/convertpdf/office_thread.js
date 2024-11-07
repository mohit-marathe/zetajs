/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

'use strict';


// for debugging
let zetajs, css, context, desktop, bean_hidden, bean_overwrite, bean_pdf_export, e, from, to, doc;

function demo() {
  context = zetajs.getUnoComponentContext();
  desktop = css.frame.Desktop.create(context);

  bean_hidden = new css.beans.PropertyValue({Name: 'Hidden', Value: true});
  bean_overwrite = new css.beans.PropertyValue({Name: 'Overwrite', Value: true});
  bean_pdf_export = new css.beans.PropertyValue({Name: 'FilterName', Value: 'writer_pdf_Export'});

  zetajs.mainPort.onmessage = function (eArg) {
    e = eArg;
    switch (e.data.cmd) {
    case 'convert':
      try {
        // Close old doc in advance. Keep doc open afterwards for debugging.
        if (doc !== undefined &&
            zetajs.fromAny(doc.queryInterface(zetajs.type.interface(css.util.XCloseable)))
            !== undefined) {
          doc.close(false);
        }
        from = e.data.from;
        to = e.data.to;
        doc = desktop.loadComponentFromURL('file://' + from, '_blank', 0, [bean_hidden]);
        doc.storeToURL( 'file://' + to, [bean_overwrite, bean_pdf_export]);
        zetajs.mainPort.postMessage({cmd: 'converted', name: e.data.name, from, to});
      } catch (e) {
        const exc = zetajs.catchUnoException(e);
        console.log('TODO', zetajs.getAnyType(exc), zetajs.fromAny(exc).Message);
      }
      break;
    default:
      throw Error('Unknonwn message command ' + e.data.cmd);
    }
  }

  zetajs.mainPort.postMessage({cmd: 'start'});
}

Module.zetajs.then(function(pZetajs) {
  // initializing zetajs environment
  zetajs = pZetajs;
  css = zetajs.uno.com.sun.star;
  demo();  // launching demo
});

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
