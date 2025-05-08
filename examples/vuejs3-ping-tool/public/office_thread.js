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
const context = zHT.context;
const desktop = zHT.desktop;
const toolkit = zHT.toolkit;

// = global variables =
// common variables:
let xModel, topwin, ctrl;
// example specific:
let unoUrlsAry, ping_line, xComponent, charLocale, formatNumber, formatText, activeSheet, cell;

// export variables for debugging
// Available for debugging via:
//   globalThis.zetajsStore.threadJsContext
export { zHT, xModel, topwin, ctrl, unoUrlsAry, ping_line, xComponent, charLocale, formatNumber, formatText, activeSheet, cell };


function demo() {
  zHT.configDisableToolbars(["Calc"]);

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
          zHT.thrPort.postMessage({cmd: 'ui_ready'});
        }
      },
      windowDeactivated(e) {},
    }));

  xModel = desktop.loadComponentFromURL('file:///tmp/calc_ping_example.ods', '_default', 0, []);
  ctrl = xModel.getCurrentController();
  xComponent = ctrl.getModel();
  charLocale = xComponent.getPropertyValue('CharLocale');
  formatNumber = xComponent.getNumberFormats().
    queryKey('0', charLocale, false);
  formatText = xComponent.getNumberFormats().
    queryKey('@', charLocale, false);

  // Turn off UI elements:
  zHT.dispatch(ctrl, context, '.uno:Sidebar');
  zHT.dispatch(ctrl, context, '.uno:InputLineVisible');  // FormulaBar at the top
  ctrl.getFrame().LayoutManager.hideElement("private:resource/statusbar/statusbar");
  // topwin.setMenuBar(null) has race conditions on fast networks like localhost.
  ctrl.getFrame().LayoutManager.hideElement("private:resource/menubar/menubar");

  unoUrlsAry = {};
  button('bold', '.uno:Bold');
  button('italic', '.uno:Italic');
  button('underline', '.uno:Underline');

  activeSheet = ctrl.getActiveSheet();
  zHT.thrPort.onmessage = function (e) {
    switch (e.data.cmd) {
    case 'toggle':
      zHT.dispatch(ctrl, context, unoUrlsAry[e.data.id]);
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

function button(id, unoUrl) {
  unoUrlsAry[id] = unoUrl;
  const urlObj = zHT.transformUrl(context, unoUrl);
  const listener = zetajs.unoObject([css.frame.XStatusListener], {
    disposing: function(source) {},
    statusChanged: function(state) {
      zHT.thrPort.postMessage({cmd: 'state', id, state: zetajs.fromAny(state.State)});
    }
  });
  zHT.queryDispatch(ctrl, urlObj).addStatusListener(listener, urlObj);
  zHT.thrPort.postMessage({cmd: 'enable', id});
}

demo();  // launching demo

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
