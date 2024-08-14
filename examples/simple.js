/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */

'use strict';

// Adapted sample code from <https://git.libreoffice.org/core> static/README.wasm.md:

Module.jsuno_init.then(function() {
    function getTextDocument() {
        const css = Module.jsuno.uno.com.sun.star;
        const desktop = css.frame.Desktop.create(Module.jsuno.getUnoComponentContext());
        let xModel = desktop.getCurrentFrame().getController().getModel();
        if (xModel === null
            || !Module.jsuno.fromAny(
                xModel.queryInterface(Module.jsuno.type.interface(css.text.XTextDocument))))
        {
            xModel = desktop.loadComponentFromURL(
                'file:///android/default-document/example.odt', '_default', 0, []);
        }
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
        while (xParaEnumeration.hasMoreElements()) {
            const next = xParaEnumeration.nextElement();
            const xParagraph = Module.jsuno.fromAny(next);
            const color = Math.floor(Math.random() * 0xFFFFFF);
            xParagraph.setPropertyValue("CharColor", color);
        }
    }
});

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
