// SPDX-License-Identifier: MIT

"use strict";

let zetajs, css;

// Make variables accessible from the console for debugging.
let context, desktop, xModel, toolkit, searchDescriptor, xTextCursor;


function demo() {
  // Replaces every occurence of "LibreOffice" with "LIBRE-OFFICE YEAH".
  console.log('PLUS: execute example code');

  context = zetajs.getUnoComponentContext();
  desktop = css.frame.Desktop.create(context);
  const in_path = 'file:///android/default-document/example.odt'
  xModel = desktop.loadComponentFromURL(in_path, '_default', 0, []);

  toolkit = css.awt.Toolkit.create(context);
  setInterval(function() {try {toolkit.getActiveTopWindow().FullScreen = true} catch {}}, 1000);

  searchDescriptor = xModel.createSearchDescriptor();
  searchDescriptor.setSearchString('LibreOffice');
  xTextCursor = xModel.findFirst(searchDescriptor);
  while (xTextCursor !== null) {
    //xTextCursor.goRight(0, false);  // Appending instead of replacing.
    xTextCursor.setString("LIBRE-OFFICE YEAH");
    xTextCursor = xModel.findNext(xTextCursor, searchDescriptor);
  }
}


Module.zetajs.then(function(pZetajs) {
  // initializing zetajs environment
  zetajs = pZetajs;
  css = zetajs.uno.com.sun.star;
  // launching demo
  demo();
});
