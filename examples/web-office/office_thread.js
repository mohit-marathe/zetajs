/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

// Debugging note:
// Switch the web worker in the browsers debug tab to debug this code.
// It's the "em-pthread" web worker with the most memory usage, where "zetajs" is defined.

'use strict';


// global variables: zetajs environment
let zetajs, css;

// global variables: demo specific
const max_values = 20;
let canvas_height, canvas_width, context, desktop, toolkit, topwin, doc, ctrl;


function demo() {
  // The following 'ready' message needs to trigger a 'resize'.
  // Unfortunately there's a bug where resize increases the canvas size always by +2.
  // This is needed to workaround that. (tested in Chromium-129)
  canvas_height = Module.canvas.height;
  canvas_width = Module.canvas.width;

  context = zetajs.getUnoComponentContext();
  const bean_overwrite = new css.beans.PropertyValue({Name: 'Overwrite', Value: true});
  const bean_odt_export = new css.beans.PropertyValue({Name: 'FilterName', Value: 'writer8'});
  toolkit = css.awt.Toolkit.create(context);
  desktop = css.frame.Desktop.create(context);
  topWinListener();

  zetajs.mainPort.onmessage = function (e) {
    switch (e.data.cmd) {
    case 'upload':
      loadFile(e.data.filename);
      break;
    case 'download':
      doc.store();
      zetajs.mainPort.postMessage({cmd: 'download', id: e.data.id});
      break;
    default:
      throw Error('Unknonwn message command ' + e.data.cmd);
    }
  }
}

function loadFile(filename) {
  topwin = false;
  topWinListener();
  const in_path = 'file:///tmp/office/' + filename;
  doc = desktop.loadComponentFromURL(in_path, '_default', 0, []);
  ctrl = doc.getCurrentController();
}

function topWinListener() {
  // css.awt.XExtendedToolkit::getActiveTopWindow only becomes non-null asynchronously, so wait
  // for it if necessary.
  // addTopWindowListener only works as intended when the following loadComponentFromURL sets
  // '_default' as target and no other document is already open.
  toolkit.addTopWindowListener(
    zetajs.unoObject([css.awt.XTopWindowListener], {
      disposing(Source) {},
      windowOpened(e) {},
      windowClosing(e) {},
      windowClosed(e) {},
      windowMinimized(e) {},
      windowNormalized(e) {},
      windowActivated(e) {
        if (!topwin) {
          topwin = toolkit.getActiveTopWindow();
          topwin.FullScreen = true;
          zetajs.mainPort.postMessage({cmd: 'ready'});
        }
      },
      windowDeactivated(e) {},
    }));
}

Module.zetajs.then(function(pZetajs) {
  // initializing zetajs environment
  zetajs = pZetajs;
  css = zetajs.uno.com.sun.star;
  demo();  // launching demo
});

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
