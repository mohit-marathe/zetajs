/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

'use strict';

// Adapted sample code from <https://git.libreoffice.org/core> static/README.wasm.md:

Module.zetajs.then(function(zetajs) {
  function getTextDocument() {
    const css = zetajs.uno.com.sun.star;
    const context = zetajs.getUnoComponentContext();
    const desktop = css.frame.Desktop.create(context);
    let xModel = desktop.getCurrentFrame().getController().getModel();
    if (xModel === null
      || !zetajs.fromAny(
        xModel.queryInterface(zetajs.type.interface(css.text.XTextDocument))))
    {
      xModel = desktop.loadComponentFromURL(
        'file:///android/default-document/example.odt', '_default', 0, []);
    }
    const toolkit = css.awt.Toolkit.create(context);
    setInterval(function() {try {toolkit.getActiveTopWindow().FullScreen = true} catch {}}, 1000);
    return xModel;
  };
  {
    const xModel = getTextDocument();
    const xText = xModel.getText();
    const xTextCursor = xText.createTextCursor();
    xTextCursor.setString("string here!");
  }
  {
    const xModel = getTextDocument();
    const xText = xModel.getText();
    const xParaEnumeration = xText.createEnumeration();
    for (const next of xParaEnumeration) {
      const xParagraph = zetajs.fromAny(next);
      const color = Math.floor(Math.random() * 0xFFFFFF);
      xParagraph.setPropertyValue("CharColor", color);
    }
  }
});

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
