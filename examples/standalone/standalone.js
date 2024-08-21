/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */

'use strict';

Module.jsuno.then(function(jsuno) {
    const css = jsuno.uno.com.sun.star;
    const context = jsuno.getUnoComponentContext();

    // Turn off toolbars:
    const config = css.configuration.ReadWriteAccess.create(context, 'en-US')
    const uielems = jsuno.fromAny(
        config.getByHierarchicalName(
            '/org.openoffice.Office.UI.WriterWindowState/UIElements/States'));
    for (const i of uielems.getElementNames()) {
        const uielem = jsuno.fromAny(uielems.getByName(i));
        if (jsuno.fromAny(uielem.getByName('Visible'))) {
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

    const urls = {};
    const button = function(id, url) {
        urls[id] = url;
        const urlObj = transformUrl(url);
        const listener = jsuno.unoObject([css.frame.XStatusListener], {
            disposing: function(source) {},
            statusChanged: function(state) {
                jsuno.mainPort.postMessage({cmd: 'state', id, state: jsuno.fromAny(state.State)});
            }
        });
        queryDispatch(urlObj).addStatusListener(listener, urlObj);
        jsuno.mainPort.postMessage({cmd: 'enable', id});
    };
    button('bold', '.uno:Bold');
    button('italic', '.uno:Italic');
    button('underline', '.uno:Underline');

    jsuno.mainPort.onmessage = function (e) {
        switch (e.data.cmd) {
        case 'toggle':
            dispatch(urls[e.data.id]);
            break;
        default:
            throw Error('Unknonwn message command ' + e.data.cmd);
        }
    }
});

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
