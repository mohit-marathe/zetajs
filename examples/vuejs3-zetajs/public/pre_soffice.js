/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2; fill-column: 100 -*- */

'use strict';

let thrPort;   // zetajs thread communication
let tbDataJs;  // toolbar dataset passed from vue.js for JS

const canvas = document.getElementById('qtcanvas');
var Module = {canvas, uno_scripts: ['./jsuno.js', './standalone.js']};


function passTbDataToJs(pTbDataJs) {
  tbDataJs = pTbDataJs;
  console.log('PLUS: assigned tbDataJs');
}

function toggleFormatting(id) {
  setToolbarActive(id, !tbDataJs.active[id]);
  thrPort.postMessage({cmd: 'toggle', id});
  // Give focus to the LO canvas to avoid issues with
  // <https://bugs.documentfoundation.org/show_bug.cgi?id=162291> "Setting Bold is
  // undone when clicking into non-empty document" when the user would need to click
  // into the canvas to give back focus to it:
  canvas.focus();
}

function setToolbarActive(id, value) {
  tbDataJs.active[id] = value;
  // Need to set "active" on "tbDataJs" to trigger an UI update.
  tbDataJs.active = tbDataJs.active;
}


const soffice_js = document.createElement("script");
soffice_js.src = "/soffice.js";
// "onload" runs after the loaded script has run.
soffice_js.onload = function() {
  console.log('PLUS: Configuring Module');
  Module.uno_main.then(function(pThrPort) {
    thrPort = pThrPort;
    thrPort.onmessage = function(e) {
      switch (e.data.cmd) {
      case 'enable':
        setToolbarActive(e.data.id, true);
        break;
      case 'state':
        setToolbarActive(e.data.id, e.data.state);
        break;
      default:
        throw Error('Unknown message command ' + e.data.cmd);
      }
    };
  });
};
// Hint: "canvas" and "Module" must exist before the next line.
document.body.appendChild(soffice_js);

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
