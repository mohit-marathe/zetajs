/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2; fill-column: 100 -*- */

'use strict';

const canvas = document.getElementById('qtcanvas');
var Module = {canvas, uno_scripts: ['./jsuno.js', './standalone.js']};


console.log('PLUS: poll and wait for Embind "Module"');
const interval = setInterval(function() {
  console.log('PLUS: looping');
  // When loaded as external script with LOWA *sometimes* this needs a moment to become defined.
  if (typeof Module.uno_init === 'undefined') return;
  clearInterval(interval);
  console.log('PLUS: running');

  Module.uno_main.then(function(port) {
    const elements = {};
    function buttonBy(id) {
      const element = document.getElementById(id);
      element.onchange = function() {
        port.postMessage({cmd: 'toggle', id});
        // Give focus to the LO canvas to avoid issues with
        // <https://bugs.documentfoundation.org/show_bug.cgi?id=162291> "Setting Bold is
        // undone when clicking into non-empty document" when the user would need to click
        // into the canvas to give back focus to it:
        canvas.focus();
      }
      elements[id] = element;
    };
    buttonBy('bold');
    buttonBy('italic');
    buttonBy('underline');
    port.onmessage = function(e) {
      switch (e.data.cmd) {
      case 'enable':
        elements[e.data.id].disabled = false;
        break;
      case 'state':
        elements[e.data.id].checked = e.data.state;
        break;
      default:
        throw Error('Unknonwn message command ' + e.data.cmd);
      }
    };
  });
}, 50);  // 0.05 seconds

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
