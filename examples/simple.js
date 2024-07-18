/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */

'use strict';

// Adapted sample code from <https://git.libreoffice.org/core> static/README.wasm.md:

Module.jsuno_init.then(function() {
    setTimeout(function() {
        {
            const css = Module.jsuno.uno.com.sun.star;
            const xModel = css.frame.Desktop.create(Module.jsuno.getUnoComponentContext())
                  .getCurrentFrame().getController().getModel();
            const xText = xModel.getText();
            const xTextCursor = xText.createTextCursor();
            xTextCursor.setString("string here!");
        }
        {
            const css = Module.jsuno.uno.com.sun.star;
            const xModel = css.frame.Desktop.create(Module.jsuno.getUnoComponentContext())
                  .getCurrentFrame().getController().getModel();
            const xText = xModel.getText();
            const xParaEnumeration = xText.createEnumeration();
            while (xParaEnumeration.hasMoreElements()) {
                const next = xParaEnumeration.nextElement();
                const xParagraph = next.val;
                const color = Math.floor(Math.random() * 0xFFFFFF);
                xParagraph.setPropertyValue("CharColor", color);
            }
        }
    }, 10000);
});

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
