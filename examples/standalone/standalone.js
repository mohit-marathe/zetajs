/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */

'use strict';

Module.jsuno_init.then(function() {
    const bold = document.getElementById('bold');
    const italic = document.getElementById('italic');
    const underline = document.getElementById('underline');

    const css = Module.jsuno.uno.com.sun.star;
    const context = Module.jsuno.getUnoComponentContext();

    // Turn off toolbars:
    const config = css.configuration.ReadWriteAccess.create(context, 'en-US')
    const uielems = Module.jsuno.fromAny(
        config.getByHierarchicalName(
            '/org.openoffice.Office.UI.WriterWindowState/UIElements/States'));
    for (const i of uielems.getElementNames()) {
        const uielem = Module.jsuno.fromAny(uielems.getByName(i));
        if (Module.jsuno.fromAny(uielem.getByName('Visible'))) {
            uielem.setPropertyValue('Visible', false);
        }
    }
    config.commitChanges();

    const ctrl = css.frame.Desktop.create(context)
          .loadComponentFromURL('private:factory/swriter', '_default', 0, [])
          .getCurrentController();
    const transformUrl = function(url) {
        const ioparam = {val: new css.util.URL({Complete: url})};
        css.util.URLTransformer.create(context).parseStrict(ioparam);
        return ioparam.val;
    }
    const queryDispatch = function(urlObj) { return ctrl.queryDispatch(urlObj, '_self', 0); }
    const dispatch = function(url) {
        const urlObj = transformUrl(url);
        queryDispatch(urlObj).dispatch(urlObj, []);
    }

    const topwin = css.awt.Toolkit.create(context).getActiveTopWindow();
    topwin.FullScreen = true;
    topwin.setMenuBar(null);

    // Turn off sidebar:
    dispatch('.uno:Sidebar');

    const button = function(element, url) {
        const urlObj = transformUrl(url);
        const listener = Module.jsuno.unoObject([css.frame.XStatusListener], {
            disposing: function(source) {},
            statusChanged: function(state) { element.checked = Module.jsuno.fromAny(state.State); }
        });
        queryDispatch(urlObj).addStatusListener(listener, urlObj);
        element.onchange = function() {
            dispatch(url);
            // Give focus to the LO canvas to avoid issues with
            // <https://bugs.documentfoundation.org/show_bug.cgi?id=162291> "Setting Bold is undone
            // when clicking into non-empty document" when the user would need to click into the
            // canvas to give back focus to it:
            canvas.focus();
        };
        element.disabled = false;
    };
    button(bold, '.uno:Bold');
    button(italic, '.uno:Italic');
    button(underline, '.uno:Underline');
});

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
