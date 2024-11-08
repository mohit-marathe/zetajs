/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

"use strict";

// Make variables accessible from the console for debugging.
let zetajs, css, context, xModel, toolkit, xModel_from_component, xController, refXKeyHandler;
let evtPressed, evtReleased;


function demo() {
  console.log('PLUS: execute example code');

  /* Implements com.sun.star.awt.XKeyHandler
   * Outputs printable characters typed into the OfficeDocument.
   * Browser console is used for output.
   */
  const myXKeyHandler = zetajs.unoObject(
    [css.awt.XKeyHandler],
    {
      keyPressed(e) {
        console.log('key pressed (' + e.KeyCode + "): " + e.KeyChar);
        evtPressed = e;
        return false;  // false: don't consume (run other event handlers)
      },
      keyReleased(e) {
        console.log('key released (' + e.KeyCode + "): " + e.KeyChar);
        evtReleased = e;
        return false;  // false: don't consume (run other event handlers)
      }
    });

  context = zetajs.getUnoComponentContext();
  // Open a new writer document.
  // xModel is somethink like: SwXTextDocument, ScModelObj, SdXImpressDocument
  xModel = css.frame.Desktop.create(context)
      .loadComponentFromURL('private:factory/swriter', '_default', 0, []);
  xController = xModel.getCurrentController();

  toolkit = css.awt.Toolkit.create(context);
  setInterval(function() {try {toolkit.getActiveTopWindow().FullScreen = true} catch {}}, 1000);

  xController.addKeyHandler(myXKeyHandler);
  // addKeyListener != addKeyHandler (that's something very DIFFERENT)

  const xText = xModel.getText();
  const xTextCursor = xText.createTextCursor();
  xTextCursor.setString("Open browser console and type something in LibreOffice!");
}


Module.zetajs.then(function(pZetajs) {
  // initializing zetajs environment
  zetajs = pZetajs;
  css = zetajs.uno.com.sun.star;
  // launching demo
  demo();
});

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
