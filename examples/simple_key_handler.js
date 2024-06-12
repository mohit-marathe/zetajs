/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */
// SPDX-License-Identifier: MPL-2.0
"use strict";

// Make variables accessible from the console for debugging.
let css, xModel, xModel_from_component, xController, refXKeyHandler;
let evtPressed, evtReleased;


//TODO: copied from <https://git.libreoffice.org/core> unotest/source/embindtest/embindtest.js for
// now:
const unoObject = function(interfaces, obj) {
    interfaces = ['com.sun.star.lang.XTypeProvider'].concat(interfaces);
    obj.impl_refcount = 0;
    obj.impl_types = new Module.uno_Sequence_type(
        interfaces.length, Module.uno_Sequence.FromSize);
    for (let i = 0; i !== interfaces.length; ++i) {
        obj.impl_types.set(i, Module.uno_Type.Interface(interfaces[i]));
    }
    obj.impl_implementationId = new Module.uno_Sequence_byte([]);
    obj.queryInterface = function(type) {
        for (const i in obj._types) {
            if (i === type.toString()) {
                return new Module.uno_Any(
                    type,
                    Module['uno_Type_' + i.replace(/\./g, '$')].reference(
                        obj._impl[obj._types[i]]));
            }
        }
        return new Module.uno_Any(Module.uno_Type.Void(), undefined);
    };
    obj.acquire = function() { ++obj.impl_refcount; };
    obj.release = function() {
        if (--obj.impl_refcount === 0) {
            for (const i in obj._impl) {
                i.delete();
            }
            obj.impl_types.delete();
            obj.impl_implementationId.delete();
        }
    };
    obj.getTypes = function() { return obj.impl_types; };
    obj.getImplementationId = function() { return obj.impl_implementationId; };
    obj._impl = {};
    interfaces.forEach((i) => {
        obj._impl[i] = Module['uno_Type_' + i.replace(/\./g, '$')].implement(obj);
    });
    obj._types = {};
    const walk = function(td, impl) {
        const name = td.getName();
        if (!Object.hasOwn(obj._types, name)) {
            if (td.getTypeClass() != css.uno.TypeClass.INTERFACE) {
                throw new Error('not a UNO interface type: ' + name);
            }
            obj._types[name] = impl;
            const bases = css.reflection.XInterfaceTypeDescription2.query(td).getBaseTypes();
            for (let i = 0; i !== bases.size(); ++i) {
                walk(bases.get(i), impl)
            }
            bases.delete();
        }
    };
    const tdmAny = Module.getUnoComponentContext().getValueByName(
        '/singletons/com.sun.star.reflection.theTypeDescriptionManager');
    const tdm = css.container.XHierarchicalNameAccess.query(tdmAny.get());
    interfaces.forEach((i) => {
        const td = tdm.getByHierarchicalName(i);
        walk(css.reflection.XTypeDescription.query(td.get()), i);
        td.delete();
    })
    tdmAny.delete();
    obj._types['com.sun.star.uno.XInterface'] = 'com.sun.star.lang.XTypeProvider';
    obj.acquire();
    return obj;
};

function demo() {
    console.log('PLUS: execute example code');

    css = init_unoembind_uno(Module).com.sun.star;

    /* Implements com.sun.star.awt.XKeyHandler
     * Outputs printable characters typed into the OfficeDocument.
     * Browser console is used for output.
     */
    const myXKeyHandler = unoObject(
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

    refXKeyHandler = css.awt.XKeyHandler.reference(css.awt.XKeyHandler.implement(myXKeyHandler));
    xController.addKeyHandler(refXKeyHandler);
    // addKeyListener != addKeyHandler (that's something very DIFFERENT)

    // Disabled, so variables can be accessed from console.
    // Embind-3.1.56 does this if the variables are locally scoped, but
    // warns it's not reliable.
    // Seems not actually to delete the object if there are other references
    // to it. Probably some smart pointer logic.
    //[refXKeyHandler, xController, xModel].forEach((o) => o.delete());
}


Module.addOnPostRun(function() {
    console.log('PLUS: wait 10 seconds for LO UI and UNO to settle');
    setTimeout(function() {  // Waits 10 seconds for UNO.
        demo();
    }, 10000);
});

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
