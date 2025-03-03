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


function demo() {
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
  dispatch('.uno:Sidebar');
  dispatch('.uno:Ruler');

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
      dispatch('.uno:' + e.data.id);
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
          zetajs.mainPort.postMessage({cmd: 'ready'});
        }
      },
      windowDeactivated(e) {},
    }));

  const in_path = 'file:///tmp/Modern_business_letter_sans_serif.ott'
  xModel = desktop.loadComponentFromURL(in_path, '_default', 0, []);
  ctrl = xModel.getCurrentController();

  // Turn off UI elements (idempotent operations):
  ctrl.getFrame().LayoutManager.hideElement("private:resource/statusbar/statusbar");
  // topwin.setMenuBar(null) has race conditions on fast networks like localhost.
  ctrl.getFrame().LayoutManager.hideElement("private:resource/menubar/menubar");

  for (const id of ['Bold', 'Italic', 'Underline']) {
    const urlObj = transformUrl('.uno:' + id);
    const listener = zetajs.unoObject([css.frame.XStatusListener], {
      disposing: function(source) {},
      statusChanged: function(state) {
        zetajs.mainPort.postMessage({cmd: 'setFormat', id, state: zetajs.fromAny(state.State)});
      }
    });
    queryDispatch(urlObj).addStatusListener(listener, urlObj);
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
