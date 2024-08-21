/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */

'use strict';


// global variables: zetajs environment
let jsuno, css = null;

// global variables: demo specific
let context, ctrl, urls = null;


function demo() {
    context = jsuno.getUnoComponentContext();

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

    ctrl = css.frame.Desktop.create(context)
          .loadComponentFromURL('private:factory/swriter', '_default', 0, [])
          .getCurrentController();

    const topwin = css.awt.Toolkit.create(context).getActiveTopWindow();
    topwin.FullScreen = true;
    topwin.setMenuBar(null);

    // Turn off sidebar:
    dispatch('.uno:Sidebar');

    urls = {};
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
}

function button(id, url) {
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
}

function transformUrl(url) {
    const ioparam = {val: new css.util.URL({Complete: url})};
    css.util.URLTransformer.create(context).parseStrict(ioparam);
    return ioparam.val;
}

function queryDispatch(urlObj) {
    return ctrl.queryDispatch(urlObj, '_self', 0);
}

function dispatch(url) {
    const urlObj = transformUrl(url);
    queryDispatch(urlObj).dispatch(urlObj, []);
}

Module.jsuno.then(function(pJsuno) {
    // initializing zetajs environment
    jsuno = pJsuno;
    css = jsuno.uno.com.sun.star;
    // launching demo
    demo();
});

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
