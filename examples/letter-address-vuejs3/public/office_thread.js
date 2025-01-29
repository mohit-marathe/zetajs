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
let canvas_height, canvas_width;
const readyList = {Fonts: false, Window: false};
let fontsList;


function demo() {
  // The following 'ready' message needs to trigger a 'resize'.
  // Unfortunately there's a bug where resize increases the canvas size always by +2.
  // This is needed to workaround that. (tested in Chromium-129)
  canvas_height = Module.canvas.height;
  canvas_width = Module.canvas.width;

  context = zetajs.getUnoComponentContext();
  const bean_overwrite = new css.beans.PropertyValue({Name: 'Overwrite', Value: true});
  const bean_odt_export = new css.beans.PropertyValue({Name: 'FilterName', Value: 'writer8'});
  const bean_pdf_export = new css.beans.PropertyValue({Name: 'FilterName', Value: 'writer_pdf_Export'});

  // Turn off toolbars:
  const config = css.configuration.ReadWriteAccess.create(context, 'en-US');
  const uielems = config.getByHierarchicalName(
    '/org.openoffice.Office.UI.WriterWindowState/UIElements/States');
  for (const i of uielems.getElementNames()) {
    const uielem = uielems.getByName(i);
    if (uielem.getByName('Visible')) {
      uielem.setPropertyValue('Visible', false);
    }
  }
  config.commitChanges();

  toolkit = css.awt.Toolkit.create(context);
  desktop = css.frame.Desktop.create(context);
  loadFile();
  // Turn off UI elements.
  // Permanant settings. Don't run again on a document reload.
  dispatch('.uno:Sidebar', []);
  dispatch('.uno:Ruler', []);

  zetajs.mainPort.onmessage = function (e) {
    switch (e.data.cmd) {
    case 'download':
      const format = e.data.id === 'btnOdt' ? bean_odt_export : bean_pdf_export;
      xModel.storeToURL( 'file:///tmp/output', [bean_overwrite, format]);
      zetajs.mainPort.postMessage({cmd: 'download', id: e.data.id});
      break;
    case 'reload':
      xModel.close(true)
      loadFile();
      break;
    case 'toggleFormat':
      const params = [];
      const value = e.data.value;
      for (let i = 0; i < value.length; i++) {
        params[i] = new css.beans.PropertyValue({Name: value[i][0], Value: value[i][1]});
      }
      dispatch('.uno:' + e.data.id, params);
      break;
    case 'insert_address':
      const recipient = e.data.recipient;
      const fieldsEnum = xModel.getTextFields().createEnumeration();
      let state_count=0, city_count=0, postal_code_count=0, street_count=0;
      while (fieldsEnum.hasMoreElements()) {
        const field = fieldsEnum.nextElement().getAnchor();
        switch (field.getString()) {
          case "<Recipient's Title>": // additional space is needed
            field.setString(recipient.title === '' ? '' : recipient.title+' ');  // recipient
            break;
          case "<Recipient's name>":
            field.setString(recipient.name);
            break;
          case "<Recipient's street>":
            field.setString(recipient.street);
            break;
          case "<Recipient's postal code>":  // additional space is needed
            field.setString(recipient.postal_code+' ');
            break;
          case "<Recipient's city>":
            field.setString(recipient.city);
            break;
          case "<Recipient's state>":
            field.setString(recipient.state);
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
      throw Error('Unknonwn message command ' + e.data.cmd);
    }
  }
}

function loadFile() {
  Module.canvas.height = canvas_height-2;
  Module.canvas.width = canvas_width-2;

  topwin = false;
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
          startupReady('Window');
        }
      },
      windowDeactivated(e) {},
    }));

  const in_path = 'file:///tmp/modern_business_letter_sans_serif.odt'
  xModel = desktop.loadComponentFromURL(in_path, '_default', 0, []);
  ctrl = xModel.getCurrentController();

  // Turn off UI elements (idempotent operations):
  ctrl.getFrame().LayoutManager.hideElement("private:resource/statusbar/statusbar");
  // topwin.setMenuBar(null) has race conditions on fast networks like localhost.
  ctrl.getFrame().LayoutManager.hideElement("private:resource/menubar/menubar");
  
  // Get font list for toolbar.
  const fontListener = zetajs.unoObject(
    [css.frame.XStatusListener],
    { statusChanged(e) {
      fontsList = e.State.val;
      startupReady('Fonts');
    }});
  const fontsUrlObj = transformUrl('.uno:FontNameList');
  const fontsDispatcher = ctrl.queryDispatch(fontsUrlObj, '_self', 0);
  const fontsDispatchNotifier = css.frame.XDispatch.constructor(fontsDispatcher)
  fontsDispatchNotifier.addStatusListener(fontListener, fontsUrlObj);
  fontsDispatchNotifier.removeStatusListener(fontListener, fontsUrlObj);

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
        if (id == 'FontHeight') state = state.Height;
        if (id == 'CharFontName') state = state.Name;
        if (id == 'Color' && state == -1) state = 0x000000;
        if (id == 'CharBackColor' && state == -1) state = 0xFFFFFF;
        if (['Color', 'CharBackColor'].includes(id))  // int to #RRGGBB
          state = '#' + (0x1000000 + state).toString(16).substring(1, 7);
        zetajs.mainPort.postMessage({cmd: 'setFormat', id, state});
      }
    });
    queryDispatch(urlObj).addStatusListener(listener, urlObj);
  }
}

function startupReady(startupStep) {
  readyList[startupStep] = true;
  if (Object.values(readyList).indexOf(false) == -1) {
    zetajs.mainPort.postMessage({cmd: 'ready', fontsList});
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

function dispatch(unoUrl, params) {
  const urlObj = transformUrl(unoUrl);
  queryDispatch(urlObj).dispatch(urlObj, params);
}

Module.zetajs.then(function(pZetajs) {
  // initializing zetajs environment:
  zetajs = pZetajs;
  css = zetajs.uno.com.sun.star;
  demo();  // launching demo
});

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
