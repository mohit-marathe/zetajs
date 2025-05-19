/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

// Debugging note:
// Switch the web worker in the browsers debug tab to debug this code.
// It's the "em-pthread" web worker with the most memory usage, where "zetajs" is defined.

// JS mode: script
'use strict';


// global variables - zetajs environment:
let zetajs, css;

// = global variables (some are global for easier debugging) =
// common variables:
let zHT, desktop, xModel, ctrl;


function demo() {
  const bean_overwrite = new css.beans.PropertyValue({Name: 'Overwrite', Value: true});
  const bean_odt_export = new css.beans.PropertyValue({Name: 'FilterName', Value: 'writer8'});
  const bean_pdf_export = new css.beans.PropertyValue({Name: 'FilterName', Value: 'writer_pdf_Export'});
  zHT.configDisableToolbars(["Writer"]);

  loadFile();
  // Turn off UI elements.
  // Permanant settings. Don't run again on a document reload.
  zHT.dispatch(ctrl, 'Sidebar');
  zHT.dispatch(ctrl, 'Ruler');

  zHT.thrPort.onmessage = function (e) {
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
      zHT.dispatch(ctrl, e.data.id);
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
      throw Error('Unknown message command: ' + e.data.cmd);
    }
  }
}

function loadFile() {
  const in_path = 'file:///tmp/Modern_business_letter_sans_serif.ott'
  xModel = desktop.loadComponentFromURL(in_path, '_default', 0, []);
  ctrl = xModel.getCurrentController();
  const frame = ctrl.getFrame();

  // Turn off UI elements (idempotent operations):
  frame.LayoutManager.hideElement("private:resource/statusbar/statusbar");
  frame.LayoutManager.hideElement("private:resource/menubar/menubar");

  frame.getContainerWindow().FullScreen = true;

  for (const id of 'Bold Italic Underline'.split(' ')) {
    const urlObj = zHT.transformUrl(id);
    const listener = zetajs.unoObject([css.frame.XStatusListener], {
      disposing: function(source) {},
      statusChanged: function(state) {
        state = zetajs.fromAny(state.State);
        // Behave like desktop UI if a non uniformly formatted area is selected.
        if (typeof state !== 'boolean') state = false;
        zetajs.mainPort.postMessage({cmd: 'setFormat', id, state});
      }
    });
    zHT.queryDispatch(ctrl, urlObj).addStatusListener(listener, urlObj);
  }
  zetajs.mainPort.postMessage({cmd: 'ui_ready'});
}


import('./assets/vendor/zetajs/zetaHelper.js').then(zetaHelper => {
  zHT = new zetaHelper.ZetaHelperThread();
  zetajs = zHT.zetajs;
  css = zHT.css;
  desktop = zHT.desktop;
  demo();  // launching demo
});

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
