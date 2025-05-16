/* -*- Mode: JS; tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2; fill-column: 100 -*- */
// SPDX-License-Identifier: MIT

'use strict';

// IMPORTANT:
// Set base URL to the soffice.* files.
// Use an empty string if those files are in the same directory.
let soffice_base_url = 'https://cdn.zetaoffice.net/zetaoffice_latest/';
try {
  soffice_base_url = config_soffice_base_url; // May fail. config.js is optional.
} catch {}


let thrPort;     // zetajs thread communication
let tbDataJs;    // toolbar dataset passed from vue.js for plain JS
let PingModule;  // Ping module passed from vue.js for plain JS
let letterForeground = true;
let data = [];
let lastDevicePixelRatio = window.devicePixelRatio;

const loadingInfo = document.getElementById('loadingInfo');
const canvas = document.getElementById('qtcanvas');
const controlbar = document.getElementById('controlbar');
const addrNameCell = document.getElementById('addrNameCell');
const canvasCell = document.getElementById('canvasCell');
const btnLetter = document.getElementById('btnLetter');
const btnTable = document.getElementById('btnTable');
const lblUpload = document.getElementById('lblUpload');
const btnUpload = document.getElementById('btnUpload');
const btnReload = document.getElementById('btnReload');
const btnInsert = document.getElementById('btnInsert');
const addrName = document.getElementById('addrName');
const disabledElementsAry =
  [btnLetter, btnTable, btnUpload, btnReload, btnInsert, addrName];
const canvas_height = parseInt(canvas.style.height);
const canvas_width = parseInt(canvas.style.width);


// Debugging note:
// Switch the web worker in the browsers debug tab to debug code inside uno_scripts.
var Module = {
  canvas,
  uno_scripts: ['./zeta.js', './office_thread.js'],
  locateFile: function(path, prefix) { return (prefix || soffice_base_url) + path; },
};
if (soffice_base_url !== '') {
  // Must not be set when soffice.js is in the same directory.
  Module.mainScriptUrlOrBlob = new Blob(
    ["importScripts('"+soffice_base_url+"soffice.js');"], {type: 'text/javascript'});
}


function jsPassCtrlBar(pTbDataJs) {
  tbDataJs = pTbDataJs;
  disabledElementsAry.push(tbDataJs);
}

function toggleFormatting(id, value) {
  setToolbarActive(id, !tbDataJs.active[id]);
  thrPort.postMessage({cmd: 'toggleFormat', id, value});
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

function btnSwitchTab(tab) {
  if (tab === 'letter') {
    letterForeground = true;
    btnLetter.classList.add('active');
    btnTable.classList.remove('active');
    controlbar.style.display = null;
    btnUpload.accept = '.odt';
    btnInsert.disabled = false;
    addrNameCell.style.visibility = null;
    addrName.style.visibility = null;
  } else {  // table
    letterForeground = false;
    btnLetter.classList.remove('active');
    btnTable.classList.add('active');
    controlbar.style.display = 'none';
    btnUpload.accept = '.ods';
    btnInsert.disabled = true;
    addrNameCell.style.visibility = 'hidden';
    addrName.style.visibility = 'hidden';
  }
  thrPort.postMessage({cmd: 'switch_tab', id: tab});
}

function btnDownloadFunc(btnId) {
  thrPort.postMessage({cmd: 'download', id: btnId});
}

function btnUploadFunc(btnId) {
  for (const elem of disabledElementsAry) elem.disabled = true;
  lblUpload.classList.add('w3-disabled');
  const filename = letterForeground ? 'letter.odt' : 'table.ods';
  btnUpload.files[0].arrayBuffer().then(aryBuf => {
    FS.writeFile('/tmp/' + filename, new Uint8Array(aryBuf));
    btnReloadFunc();
  });
}

function btnReloadFunc() {
  for (const elem of disabledElementsAry) elem.disabled = true;
  lblUpload.classList.add('w3-disabled');
  loadingInfo.style.display = null;
  canvas.style.visibility = 'hidden';
  thrPort.postMessage({cmd: 'reload', id: letterForeground});
}

function btnInsertFunc() {
  if (addrName.selectedIndex != -1) {
    const recipient = data[addrName.selectedIndex];
    thrPort.postMessage({cmd: 'insertAddress', recipient});
  }
}


async function getDataFile(file_url) {
  const response = await fetch(file_url);
  return response.arrayBuffer();
}

window.onresize = function() {
  // Workaround to inform Qt5 about changed browser zoom.
  setTimeout(function() {
    if (lastDevicePixelRatio) {
      if (lastDevicePixelRatio != window.devicePixelRatio) {
        lastDevicePixelRatio = false;
        canvas.style.width = parseInt(canvas.style.width) + 1 + 'px';
        window.dispatchEvent(new Event('resize'));
      }
    } else {
      lastDevicePixelRatio = window.devicePixelRatio
      canvas.style.width = parseInt(canvas.style.width) - 1 + 'px';
      window.dispatchEvent(new Event('resize'));
    }
  }, 100);
};


const soffice_js = document.createElement("script");
soffice_js.src = soffice_base_url + "soffice.js";
// "onload" runs after the loaded script has run.
soffice_js.onload = function() {
  Module.uno_main.then(function(pThrPort) {
    thrPort = pThrPort;
    thrPort.onmessage = function(e) {
      switch (e.data.cmd) {
      case 'ui_ready':
        // Trigger resize of the embedded window to match the canvas size.
        // May somewhen be obsoleted by:
        //   https://gerrit.libreoffice.org/c/core/+/174040
        window.dispatchEvent(new Event('resize'));
        setTimeout(function() {  // display Office UI properly
          loadingInfo.style.display = 'none';
          canvas.style.visibility = null;
          tbDataJs.font_name_list = e.data.fontsList;
          for (const elem of disabledElementsAry) elem.disabled = false;
          lblUpload.classList.remove('w3-disabled');
          btnInsert.disabled = !letterForeground;
        }, 1000);  // milliseconds
        break;
      case 'resizeEvt':
        window.dispatchEvent(new Event('resize'));
        break;
      case 'addrData':
        data = e.data.data;
        addrName.innerHTML = '';
        for (const recipient of data) {
          const option = document.createElement('option');
          option.innerHTML = recipient[1];
          addrName.appendChild(option);
        }
        break;
      case 'setFormat':
        setToolbarActive(e.data.id, e.data.state);
        break;
      case 'download':
        const bytes = FS.readFile('/tmp/output');
        const format = e.data.id === 'btnOdt' ? 'odt' : 'pdf';
        const blob = new Blob([bytes], {type: 'application/' + format});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'letter.' + format;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        break;
      default:
        throw Error('Unknown message command: ' + e.data.cmd);
      }
    };

    getDataFile('./letter.odt').then(function(aryBuf) {
      FS.writeFile('/tmp/letter.odt', new Uint8Array(aryBuf));
    });
    getDataFile('./table.ods').then(function(aryBuf) {
      FS.writeFile('/tmp/table.ods', new Uint8Array(aryBuf));
    });
  });
};
console.log('Loading WASM binaries for ZetaJS from: ' + soffice_base_url);
// Hint: The global objects "canvas" and "Module" must exist before the next line.
document.body.appendChild(soffice_js);

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
