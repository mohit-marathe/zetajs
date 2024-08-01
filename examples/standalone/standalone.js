/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */

'use strict';

Module.jsuno_init.then(function() {
    const bold = document.getElementById('bold');

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
          .loadComponentFromURL('private:factory/swriter', '_blank', 0, []).getCurrentController();
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

    // Turn off sidebar:
    dispatch('.uno:Sidebar');

    const urlObj = transformUrl('.uno:Bold');
    const listener = Module.jsuno.unoObject([css.frame.XStatusListener], {
        disposing: function(source) {},
        statusChanged: function(state) { bold.checked = Module.jsuno.fromAny(state.State); }
    });
    queryDispatch(urlObj).addStatusListener(listener, urlObj);

    bold.onchange = function() {
        dispatch('.uno:Bold');
    };
    bold.disabled = false;
});

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
