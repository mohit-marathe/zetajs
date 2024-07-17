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

// Make variables accessible from the console for debugging.
let xModel, xModel_from_component, xController, refXKeyHandler;
let evtPressed, evtReleased;


function demo() {
    console.log('PLUS: execute example code');

    Module.jsuno_init();

    /* Implements com.sun.star.awt.XKeyHandler
     * Outputs printable characters typed into the OfficeDocument.
     * Browser console is used for output.
     */
    const myXKeyHandler = Module.unoObject(
        ['com.sun.star.awt.XKeyHandler'],
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

    // Get the currently opened view context.
    // xModel is somethink like: SwXTextDocument, ScModelObj, SdXImpressDocument
    xModel = Module.jsuno.proxy(Module.getCurrentModelFromViewSh());
    if (xModel === null) {
        console.log("No OfficeDocument opened.");
        return;
    }
    xController = xModel.getCurrentController();

    xController.addKeyHandler(myXKeyHandler);
    // addKeyListener != addKeyHandler (that's something very DIFFERENT)

    // Disabled, so variables can be accessed from console.
    // Embind-3.1.56 does this if the variables are locally scoped, but
    // warns it's not reliable.
    // Seems not actually to delete the object if there are other references
    // to it. Probably some smart pointer logic.
    //[refXKeyHandler, xController, xModel].forEach((o) => o.delete());
}


function onLoad(block) {
    if (typeof Module.addOnPostRun === 'undefined') {
        // When compiled into LOWA via EMSCRIPTEN_EXTRA_SOFFICE_POST_JS.
        console.log('PLUS: poll and wait for Embind "Module"');  // not needed for QT5
        const interval = setInterval(function() {
            console.log('looping');
            if (typeof Module === 'undefined') return;
            clearInterval(interval);
            block();
        }, 0.1);
    } else {
        // When loaded as external script.
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
