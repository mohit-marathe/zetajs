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
let context, desktop, tableXModel, letterXModel, tableCtrl, letterCtrl;
// example specific:
let writerModuleConfigured=false, calcModuleConfigured=false;
const readyList = {Fonts: false, Window: false};
let letterFrame, tableFrame, fontsList, switchVals;
// switchVals needed globally in case the user switches tabs rapidly.


function demo() {
  context = zetajs.getUnoComponentContext();
  const bean_overwrite = new css.beans.PropertyValue({Name: 'Overwrite', Value: true});
  const bean_odt_export = new css.beans.PropertyValue({Name: 'FilterName', Value: 'writer8'});
  const bean_pdf_export = new css.beans.PropertyValue({Name: 'FilterName', Value: 'writer_pdf_Export'});

  // Turn off toolbars:
  const config = css.configuration.ReadWriteAccess.create(context, 'en-US');
  const writerUiElems = config.getByHierarchicalName(
    '/org.openoffice.Office.UI.WriterWindowState/UIElements/States');
  for (const i of writerUiElems.getElementNames()) {
    const uielem = writerUiElems.getByName(i);
    if (uielem.getByName('Visible')) {
      uielem.setPropertyValue('Visible', false);
    }
  }
  const calcUiElems = config.getByHierarchicalName(
    '/org.openoffice.Office.UI.CalcWindowState/UIElements/States');
  for (const i of calcUiElems.getElementNames()) {
    const uielem = calcUiElems.getByName(i);
    if (uielem.getByName('Visible')) {
      uielem.setPropertyValue('Visible', false);
    }
  }
  config.commitChanges();

  desktop = css.frame.Desktop.create(context);
  loadFile('both');
  tableToHtml();

  zetajs.mainPort.onmessage = function (e) {
    switch (e.data.cmd) {
    case 'switch_tab':
      if (e.data.id === 'letter') {
        switchVals = [true, false];
        tableToHtml();
      } else switchVals = [false, true];  // table
      function setVals() {
        letterFrame.getContainerWindow().FullScreen = switchVals[0];
        tableFrame.getContainerWindow().FullScreen = switchVals[1];
        zetajs.mainPort.postMessage({cmd: 'resizeEvt'});
      }
      setVals();  // sometimes needed twice to apply resize
      setTimeout(() => { setVals(); }, 500);
      break;
    case 'download':
      const format = e.data.id === 'btnOdt' ? bean_odt_export : bean_pdf_export;
      letterXModel.storeToURL( 'file:///tmp/output', [bean_overwrite, format]);
      zetajs.mainPort.postMessage({cmd: 'download', id: e.data.id});
      break;
    case 'reload':
      const letterForeground = e.data.id;
      if (letterForeground) letterXModel.close(true)
        else tableXModel.close(true);
      loadFile(letterForeground ? 'letter' : 'table');
      break;
    case 'toggleFormat':
      const params = [];
      const value = e.data.value;
      for (let i = 0; i < value.length; i++) {
        params[i] = new css.beans.PropertyValue({Name: value[i][0], Value: value[i][1]});
      }
      dispatch(letterCtrl, '.uno:' + e.data.id, params);
      break;
    case 'insertAddress':
      const recipient = e.data.recipient;
      const fieldsEnum = letterXModel.getTextFields().createEnumeration();
      let state_count=0, city_count=0, postal_code_count=0, street_count=0;
      while (fieldsEnum.hasMoreElements()) {
        const field = fieldsEnum.nextElement().getAnchor();
        switch (field.getString()) {
          case "<Recipient's Title>": // additional space is needed
            field.setString(recipient[0] === '' ? '' : recipient[0]+' ');  // recipient
            break;
          case "<Recipient's name>":
            field.setString(recipient[1]);
            break;
          case "<Recipient's street>":
            field.setString(recipient[2]);
            break;
          case "<Recipient's postal code>":  // additional space is needed
            field.setString(recipient[3]+' ');
            break;
          case "<Recipient's city>":
            field.setString(recipient[4]);
            break;
          case "<Recipient's state>":
            field.setString(recipient[5]);
            break;
          case "<Sender's name>":
            field.setString("Dent, Arthur Phillip");
            break;
          case "<Sender's Company Name>":
            field.setString("Cottingshire Radio");
            break;
          case "<Sender's street>":
            field.setString("155 Country Lane");
            break;
          case "<Sender's postal code>":  // additional space is needed
            field.setString("2A 2A2A"+' ');
            break;
          case "<Sender's city>":
            field.setString("Cottington");
            break;
          case "<Sender's state>":
            field.setString("Cottingshire County");
            break;
        }
      }
      break;
    default:
      throw Error('Unknown message command: ' + e.data.cmd);
    }
  }
}


function tableToHtml() {
  const activeSheet = tableCtrl.getActiveSheet();
  const data = [];
  let row_10 = 0;
  let local_row = 0;
  while (local_row >= 0) {
    local_row = 0;
    const lines_block = activeSheet.
      getCellRangeByPosition(0, row_10*10+1, 5, row_10*10+9+1).getDataArray();
    while (local_row >= 0 && local_row < 10) {
      const recipient = [];
      for (let rowData of lines_block[local_row]) recipient.push(rowData);
      if (!recipient.reduce((acc,v) => acc &&= v==='', true)) {
        data.push(recipient);
        local_row += 1;
      } else local_row = -1;
    }
    if (local_row > 0) local_row = 0;
    row_10 += 1;
  }
  zetajs.mainPort.postMessage({cmd: 'addrData', data});
}


function loadFile(fileTab) {
  if (fileTab != 'letter') {  // table or both
    tableXModel = desktop.loadComponentFromURL('file:///tmp/table.ods', '_default', 0, []);
    tableCtrl = tableXModel.getCurrentController();
    if (!calcModuleConfigured) {
      calcModuleConfigured = true;
      // Permanant Calc module toggles. Don't run again on a document reload.
      dispatch(tableCtrl, '.uno:Sidebar', []);
      dispatch(tableCtrl, '.uno:InputLineVisible', []); // FormulaBar at the top
    }
    tableFrame = tableCtrl.getFrame();
    // Turn off UI elements (idempotent operations):
    tableFrame.LayoutManager.hideElement("private:resource/statusbar/statusbar");
    tableFrame.LayoutManager.hideElement("private:resource/menubar/menubar");
    tableCtrl.setPropertyValue('SheetTabs', false);
    if (fileTab == 'table') {
      // Storing the getContainerWindow() result is unstable.
      tableFrame.getContainerWindow().setPosSize(-1000,-1000,500,500,15);
      tableFrame.getContainerWindow().FullScreen = true;
    }
  }

  if (fileTab != 'table') {  // letter or both
    letterXModel = desktop.loadComponentFromURL('file:///tmp/letter.odt', '_default', 0, []);
    letterCtrl = letterXModel.getCurrentController();
    if (!writerModuleConfigured) {
      writerModuleConfigured = true;
      // Permanant Writer module toggles. Don't run again on a document reload.
      dispatch(letterCtrl, '.uno:Sidebar', []);
      dispatch(letterCtrl, '.uno:Ruler', []);
    }
    letterFrame = letterCtrl.getFrame();
    // Turn off UI elements (idempotent operations):
    letterFrame.LayoutManager.hideElement("private:resource/statusbar/statusbar");
    letterFrame.LayoutManager.hideElement("private:resource/menubar/menubar");
    // Storing the getContainerWindow() result is unstable.
    letterFrame.getContainerWindow().setPosSize(-1000,-1000,500,500,15);
    letterFrame.getContainerWindow().FullScreen = true;

    // Get font list for toolbar.
    const fontsUrlObj = transformUrl('.uno:FontNameList');
    const fontsDispatcher = queryDispatch(letterCtrl, fontsUrlObj);
    const fontsDispatchNotifier = css.frame.XDispatch.constructor(fontsDispatcher)
    const fontListener = zetajs.unoObject(
      [css.frame.XStatusListener],
      { statusChanged(e) {
        fontsDispatchNotifier.removeStatusListener(fontListener, fontsUrlObj);
        fontsList = e.State.val;
        startupReady('Fonts');
      }});
    fontsDispatchNotifier.addStatusListener(fontListener, fontsUrlObj);

    for (const id of [
        'Bold', 'Italic', 'Underline',
        'Overline', 'Strikeout', 'Shadowed', 'Color', 'CharBackColor',
        'LeftPara', 'CenterPara', 'RightPara', 'JustifyPara', 'DefaultBullet',
        'FontHeight', 'CharFontName'
        ]) {
      const urlObj = transformUrl('.uno:' + id);
      const listener = zetajs.unoObject([css.frame.XStatusListener], {
        disposing: function(source) {},
        statusChanged: function(state) {
          state = zetajs.fromAny(state.State);
          if (id == 'FontHeight') state = Math.round(state.Height * 10) / 10;
          if (id == 'CharFontName') state = state.Name;
          if (id == 'Color' && state == -1) state = 0x000000;
          if (id == 'CharBackColor' && state == -1) state = 0xFFFFFF;
          if (['Color', 'CharBackColor'].includes(id))  // int to #RRGGBB
            state = '#' + (0x1000000 + state).toString(16).substring(1, 7);
          zetajs.mainPort.postMessage({cmd: 'setFormat', id, state});
        }
      });
      queryDispatch(letterCtrl, urlObj).addStatusListener(listener, urlObj);
    }
  }
  startupReady('Window');
}


function startupReady(startupStep) {
  readyList[startupStep] = true;
  if (Object.values(readyList).indexOf(false) == -1) {
    zetajs.mainPort.postMessage({cmd: 'ui_ready', fontsList});
  }
}

function transformUrl(unoUrl) {
  const ioparam = {val: new css.util.URL({Complete: unoUrl})};
  css.util.URLTransformer.create(context).parseStrict(ioparam);
  return ioparam.val;
}

function queryDispatch(ctrl, urlObj) {
  return ctrl.queryDispatch(urlObj, '_self', 0);
}

function dispatch(ctrl, unoUrl, params) {
  const urlObj = transformUrl(unoUrl);
  queryDispatch(ctrl, urlObj).dispatch(urlObj, params);
}

Module.zetajs.then(function(pZetajs) {
  // initializing zetajs environment:
  zetajs = pZetajs;
  css = zetajs.uno.com.sun.star;
  demo();  // launching demo
});

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
