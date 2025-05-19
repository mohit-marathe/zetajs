/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

// Debugging note:
// Switch the web worker in the browsers debug tab to debug this code.
// It's the "em-pthread" web worker with the most memory usage, where "zetajs" is defined.

// JS mode: module
import { ZetaHelperThread } from './assets/vendor/zetajs/zetaHelper.js';


// global variables - zetajs environment:
const zHT = new ZetaHelperThread();
const zetajs = zHT.zetajs;

// = global variables (some are global for easier debugging) =
// common variables:
let xModel, ctrl;
// example specific:
let activeSheet, cellRange, dataAry, oldUrl;

// Export variables for debugging. Available for debugging via:
//   globalThis.zetajsStore.threadJsContext
export { zHT, xModel, ctrl, activeSheet, cellRange, dataAry, oldUrl };

const max_values = 20;  // setting, adjust as needed


function demo() {
  zHT.configDisableToolbars(['Calc']);
  xModel = zHT.desktop.loadComponentFromURL('file:///tmp/ping_monitor.ods', '_default', 0, []);
  ctrl = xModel.getCurrentController();

  // Turn off UI elements:
  zHT.dispatch(ctrl, 'Sidebar');
  zHT.dispatch(ctrl, 'InputLineVisible');  // FormulaBar at the top
  zHT.dispatch(ctrl, 'ViewRowColumnHeaders');
  const frame = ctrl.getFrame();
  frame.LayoutManager.hideElement("private:resource/statusbar/statusbar");
  frame.LayoutManager.hideElement("private:resource/menubar/menubar");
  ctrl.setPropertyValue('SheetTabs', false);
  ctrl.setPropertyValue('HasHorizontalScrollBar', false);
  ctrl.setPropertyValue('HasVerticalScrollBar', false);
  ctrl.getFrame().getContainerWindow().FullScreen = true;

  activeSheet = ctrl.getActiveSheet();
  cellRange = activeSheet.getCellRangeByPosition(0, 1, 0, max_values+1);
  dataAry = cellRange.getDataArray();  // 2 dimensional array
  zHT.thrPort.onmessage = (e) => {
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
  zHT.thrPort.postMessage({cmd: 'ui_ready'});
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

demo();  // launching demo

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
