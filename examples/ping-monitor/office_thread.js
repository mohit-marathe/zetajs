/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

// Debugging note:
// Switch the web worker in the browsers debug tab to debug this code.
// It's the "em-pthread" web worker with the most memory usage, where "zetajs" is defined.

'use strict';


// global variables - zetajs environment:
let zetajs, css;

// = global variables (some are global for easier debugging) =
// common variables:
let context, desktop, xModel, toolkit, topwin, ctrl;
// example specific:
let ready, activeSheet, cellRange, dataAry, oldUrl;

const max_values = 20;  // setting, adjust as needed


function demo() {
  context = zetajs.getUnoComponentContext();

  // Turn off toolbars:
  const config = css.configuration.ReadWriteAccess.create(context, 'en-US');
  const uielems = config.getByHierarchicalName(
    '/org.openoffice.Office.UI.CalcWindowState/UIElements/States');
  for (const i of uielems.getElementNames()) {
    const uielem = uielems.getByName(i);
    if (uielem.getByName('Visible')) {
      uielem.setPropertyValue('Visible', false);
    }
  }
  config.commitChanges();

  toolkit = css.awt.Toolkit.create(context);
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
        getTopwin().FullScreen = true;
        if (!ready) {
          ready = true;
          zetajs.mainPort.postMessage({cmd: 'ready'});
        }
      },
      windowDeactivated(e) {},
    }));

  desktop = css.frame.Desktop.create(context);
  xModel = desktop.loadComponentFromURL('file:///tmp/ping_monitor.ods', '_default', 0, []);
  ctrl = xModel.getCurrentController();

  // Turn off UI elements:
  dispatch('.uno:Sidebar');
  dispatch('.uno:InputLineVisible');  // FormulaBar at the top
  dispatch('.uno:ViewRowColumnHeaders');
  ctrl.getFrame().LayoutManager.hideElement("private:resource/statusbar/statusbar");
  // getTopwin.setMenuBar(null) has race conditions on fast networks like localhost.
  ctrl.getFrame().LayoutManager.hideElement("private:resource/menubar/menubar");
  ctrl.setPropertyValue('SheetTabs', false);
  ctrl.setPropertyValue('HasHorizontalScrollBar', false);
  ctrl.setPropertyValue('HasVerticalScrollBar', false);

  activeSheet = ctrl.getActiveSheet();
  cellRange = activeSheet.getCellRangeByPosition(0, 1, 0, max_values+1);
  dataAry = cellRange.getDataArray();  // 2 dimensional array
  zetajs.mainPort.onmessage = function (e) {
    switch (e.data.cmd) {
    case 'ping_result':
      const newUrl = e.data.url;
      if (newUrl == oldUrl) {
        moveRows(dataAry);
      } else {
        clearRows(dataAry);
      }
      oldUrl = newUrl;
      setCell(dataAry[max_values-1], e.data.ping_value);
      cellRange.setDataArray(dataAry);
      break;
    default:
      throw Error('Unknown message command: ' + e.data.cmd);
    }
  }
}

function getTopwin() {
  if (!topwin) topwin = toolkit.getActiveTopWindow();
  return topwin;
}

function moveRows(ary) {
  for (let i = 0; i < max_values-1; i++) {
    const writeCell = ary[i];
    const readCell  = ary[i+1];
    const ping_value = readCell[0];
    setCell(writeCell, ping_value);
  }
}

function clearRows(ary) {
  for (let i = 0; i < max_values-1; i++) {
    setCell(ary[i], '');
  }
}

function setCell(cell, value) {
  let num = value;  // keep original value
  if (typeof(value) === 'number' || !isNaN(num=parseFloat(value))) {
    cell[0] = num;
  } else {
    cell[0] = value.toString();
  }
}

function transformUrl(unoUrl) {
  const ioparam = {val: new css.util.URL({Complete: unoUrl})};
  css.util.URLTransformer.create(context).parseStrict(ioparam);
  return ioparam.val;
}

function queryDispatch(urlObj) {
  return ctrl.queryDispatch(urlObj, '_self', 0);
}

function dispatch(unoUrl) {
  const urlObj = transformUrl(unoUrl);
  queryDispatch(urlObj).dispatch(urlObj, []);
}

Module.zetajs.then(function(pZetajs) {
  // initializing zetajs environment:
  zetajs = pZetajs;
  css = zetajs.uno.com.sun.star;
  demo();  // launching demo
});

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
