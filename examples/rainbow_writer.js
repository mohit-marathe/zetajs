/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */
// SPDX-License-Identifier: MPL-2.0

/* USAGE:
 * Use as described in README.md.
 * Alternatively add the following files to the webroot and to qt_soffice.html
 * before </body>:
 *     <script type="text/javascript" src="jsuno.js"></script>
 *     <script type="text/javascript" src="THIS_SCRIPT.js"></script>
 */

"use strict";

//              [     red,   orange,   yellow,    green,     blue,   violet]
const rainbow = [0xE50000, 0xF08500, 0xFFEE00, 0x008121, 0x004CFF, 0x760188];
let css, uno_bold, uno_long, uno_font_monospace;


function demo() {
    init_demo();  // run once
    run_demo();   // run per loaded document
}


function run_demo() {
    console.log('PLUS: execute example code');

    // Get the currently opened view context.
    const xModel = Module.jsuno.proxy(Module.getCurrentModelFromViewSh());
    if (xModel === null) {
        console.log("No OfficeDocument opened.");
        return;
    }
    const xController = xModel.getCurrentController();

    const xKeyHandler = Module.unoObject(['com.sun.star.awt.XKeyHandler'], new ColorXKeyHandler(xModel));
    xController.addKeyHandler(xKeyHandler);                   // XUserInputInterception.addKeyHandler()

    const xTextCursor = xModel.getText().createTextCursor();  // XTextDocument.getText()
    xTextCursor.setPropertyValue("CharWeight", uno_bold);     // XPropertySet.setPropertyValue()
    xTextCursor.setString("Please type something!\n\n");
}


function ColorXKeyHandler(xModel) {
    this.rainbow_i = 0;
    this.xModel = null;
    this.keyPressed = function(e) { return false; };
    this.keyReleased = function(e) {
        if (e.KeyChar === "\x00") { return false; }  // non symbol keys (e.g. arrow keys)

        const xController = this.xModel.getCurrentController();
        const xTextViewCursor = xController.getViewCursor();  // XTextViewCursorSupplier.getViewCursor()
        const xText = this.xModel.getText();  // XTextDocument.getText()
        const xTextCursor = xText.createTextCursorByRange(xTextViewCursor.getStart());
        xTextCursor.goLeft(1, true);

        // Walk the rainbow ;-)
        const color = new Module.uno_Any(uno_long, rainbow[this.rainbow_i]);
        this.rainbow_i++;
        if (this.rainbow_i >= rainbow.length) { this.rainbow_i = 0; }

        xTextCursor.setPropertyValue("CharBackColor", color);  // xPropertySet.setPropertyValue
        xTextCursor.setPropertyValue("CharWeight", uno_bold);
        xTextCursor.setPropertyValue("CharFontName", uno_font_monospace);
        // More properties:
        //   https://api.libreoffice.org/docs/idl/ref/servicecom_1_1sun_1_1star_1_1style_1_1CharacterProperties.html

        return false;
    };

    const xModel_types = xModel.getTypes();  // XTypeProvider.getTypes()
    for (let i=0; i<xModel_types.length; i++) {
        if (xModel_types[i].toString() == "com.sun.star.text.XTextDocument") {
            i = xModel_types.length + 1;
            this.xModel = xModel;
        }
    }
};


function init_demo() {
    Module.jsuno_init();
    css = Module.uno.com.sun.star;
    uno_bold = new Module.uno_Any(Module.uno_Type.Float(), css.awt.FontWeight.BOLD);
    uno_long = Module.uno_Type.Long();
    uno_font_monospace = new Module.uno_Any(Module.uno_Type.String(), "Monospace");
}


function onLoad(block) {
    if (typeof Module.addOnPostRun === 'undefined') {
        // When loaded as external script with LOWA.
        console.log('PLUS: poll and wait for Embind "Module"');  // not needed for QT5
        const interval = setInterval(function() {
            console.log('looping');
            if (typeof Module === 'undefined') return;
            clearInterval(interval);
            block();
        }, 0.1);
    } else {
        // When compiled into LOWA via EMSCRIPTEN_EXTRA_SOFFICE_POST_JS.
        Module.addOnPostRun(block);
    }
}


onLoad(function() {
    console.log('PLUS: wait 10 seconds for LO UI and UNO to settle');
    setTimeout(function() {  // Waits 10 seconds for UNO.
        demo();
    }, 10000);
});

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
