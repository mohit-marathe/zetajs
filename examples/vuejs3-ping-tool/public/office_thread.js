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
const css = zHT.css;
const desktop = zHT.desktop;

// = global variables =
// common variables:
let xModel, ctrl;
// example specific:
let ping_line, xComponent, charLocale, formatNumber, formatText, activeSheet, cell;

// Export variables for debugging. Available for debugging via:
//   globalThis.zetajsStore.threadJsContext
export { zHT, xModel, ctrl, ping_line, xComponent, charLocale, formatNumber, formatText, activeSheet, cell };


function demo() {
  zHT.configDisableToolbars(["Calc"]);

  xModel = desktop.loadComponentFromURL('file:///tmp/calc_ping_example.ods', '_default', 0, []);
  ctrl = xModel.getCurrentController();
  ctrl.getFrame().getContainerWindow().FullScreen = true;

  xComponent = ctrl.getModel();
  charLocale = xComponent.getPropertyValue('CharLocale');
  formatNumber = xComponent.getNumberFormats().
    queryKey('0', charLocale, false);
  formatText = xComponent.getNumberFormats().
    queryKey('@', charLocale, false);

  // Turn off UI elements:
  zHT.dispatch(ctrl, 'Sidebar');
  zHT.dispatch(ctrl, 'InputLineVisible');  // FormulaBar at the top
  ctrl.getFrame().LayoutManager.hideElement("private:resource/statusbar/statusbar");
  ctrl.getFrame().LayoutManager.hideElement("private:resource/menubar/menubar");

  for (const id of 'Bold Italic Underline'.split(' ')) {
    const urlObj = zHT.transformUrl(id);
    const listener = zetajs.unoObject([css.frame.XStatusListener], {
      disposing: function(source) {},
      statusChanged: function(state) {
        state = zetajs.fromAny(state.State);
        // Behave like desktop UI if a non uniformly formatted area is selected.
        if (typeof state !== 'boolean') state = false;  // like desktop UI
        zetajs.mainPort.postMessage({cmd: 'setFormat', id, state: state});
      }
    });
    zHT.queryDispatch(ctrl, urlObj).addStatusListener(listener, urlObj);
  }

  activeSheet = ctrl.getActiveSheet();
  zHT.thrPort.onmessage = function (e) {
    switch (e.data.cmd) {
    case 'toggleFormatting':
      zHT.dispatch(ctrl, e.data.id);
      break;
    case 'ping_result':
      if (ping_line === undefined) {
          ping_line = 1;  // start at line 1 (line 0 is the header)
      } else {
          ping_line = findEmptyRowInCol1(activeSheet);
      }

      const url = e.data.id['url'];
      cell = activeSheet.getCellByPosition(0, ping_line);
      cell.setPropertyValue('NumberFormat', formatText);  // optional
      cell.setString((new URL(url)).hostname);

      cell = activeSheet.getCellByPosition(1, ping_line);
      let ping_value = String(e.data.id['data']);
      if (!isNaN(ping_value)) {
        cell.setPropertyValue('NumberFormat', formatNumber);  // optional
        cell.setValue(parseFloat(ping_value));
      } else {
        // in case e.data.id['data'] contains an error message
        cell.setPropertyValue('NumberFormat', formatText);  // optional
        cell.setString(ping_value);
      }
      break;
    default:
      throw Error('Unknown message command: ' + e.data.cmd);
    }
  }
  zHT.thrPort.postMessage({cmd: 'ui_ready'});
}

function findEmptyRowInCol1(activeSheet) {
  let str;
  let line = 0;
  while (str != "") {
    line++;
    str = activeSheet.getCellByPosition(0, line).getString();
  }
  return line;
}

demo();  // launching demo

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
