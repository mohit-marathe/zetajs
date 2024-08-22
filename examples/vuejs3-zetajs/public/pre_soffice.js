/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2; fill-column: 100 -*- */

'use strict';

let thrPort;   // zetajs thread communication
let tbDataJs;  // toolbar dataset passed from vue.js for JS

const canvas = document.getElementById('qtcanvas');
var Module = {canvas, uno_scripts: ['./jsuno.js', './standalone.js']};


console.log('PLUS: Module: poll and wait for Embind "Module"');
let moduleIntMax = 200;
const moduleInt = setInterval(function() {
  console.log('PLUS: Module: looping');
  if (moduleIntMax-- < 1) clearInterval(moduleInt);
  // When loaded as external script with LOWA *sometimes* this needs a moment to become defined.
  if (typeof Module.uno_init === 'undefined') return;
  clearInterval(moduleInt);
  console.log('PLUS: Module: found');
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
}, 50);  // 0.05 seconds

function passTbDataToJs(pTbDataJs) {
  tbDataJs = pTbDataJs;
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

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
