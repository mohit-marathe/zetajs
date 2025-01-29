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

const loadingInfo = document.getElementById('loadingInfo');
const canvas = document.getElementById('qtcanvas');
const addrName = document.getElementById('addrName');
const btnNamedAry = {  // enables buttons after loading
  Insert: document.getElementById('btnInsert'),
  Reload: document.getElementById('btnReload'),
};


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
  console.log('PLUS: assigned tbDataJs');
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

function btnDownloadFunc(btnId) {
  thrPort.postMessage({cmd: 'download', id: btnId});
}

function btnInsertFunc() {
  if (addrName.selectedIndex != -1) {
    const recipient = data[addrName.selectedIndex];
    thrPort.postMessage({cmd: 'insert_address', recipient});
  }
}

function btnReloadFunc() {
  for (const [_, btn] of Object.entries(btnNamedAry)) btn.disabled = true;
  thrPort.postMessage({cmd: 'reload'});
}


async function get_modern_business_letter_sans_serif_odt() {
  const response = await fetch("./modern_business_letter_sans_serif.odt");
  return response.arrayBuffer();
}
let modern_business_letter_sans_serif_odt;


const data = [
  {
    title:       "Dr.",
    name:        "Bashir, Julian Subatoi",
    street:      "Level 42",
    postal_code: "DS9",
    city:        "Deep Space 9",
    state:       "Bajoran Republic",
  }, {
    title:       "Dr.",
    name:        "Chapel, Christine",
    street:      "Deck 42",
    postal_code: "NCC-1701",
    city:        "USS Enterprise",
    state:       "United Federation of Planets",
  }, {
    title:       "Mr.",
    name:        "Chekov, Pavel",
    street:      "Deck 42",
    postal_code: "NCC-1701",
    city:        "USS Enterprise",
    state:       "United Federation of Planets",
  }, {
    title:       "Mrs.",
    name:        "Dax, Jadzia",
    street:      "Section 25 Alpha",
    postal_code: "DS9",
    city:        "Deep Space 9",
    state:       "Bajoran Republic",
  }, {
    title:       "Mr.",
    name:        "de Monti, Mario",
    street:      "Mariosstreet",
    postal_code: "1B 1B1B",
    city:        "Deepseabase 104",
    state:       "Earth",
  }, {
    title:       "Mr.",
    name:        "Sigbjörnson, Hasso",
    street:      "Hassosstreet",
    postal_code: "1B 1B1B",
    city:        "Deepseabase 104",
    state:       "Earth",
  }, {
    title:       "Mrs.",
    name:        "Jagellovsk, Tamara",
    street:      "Tamarasstreet",
    postal_code: "1B 1B1B",
    city:        "Deepseabase 104",
    state:       "Earth",
  }, {
    title:       "Mr.",
    name:        "Kirk, James T.",
    street:      "Deck 5",
    postal_code: "NCC-1701",
    city:        "USS Enterprise",
    state:       "United Federation of Planets",
  }, {
    title:       "Mrs.",
    name:        "Legrelle, Helga",
    street:      "Helgasstreet",
    postal_code: "1B 1B1B",
    city:        "Deepseabase 104",
    state:       "Earth",
  }, {
    title:       "Dr.",
    name:        "McCoy, Leonard",
    street:      "Deck 9, Section 2, 3F 127",
    postal_code: "NCC-1701",
    city:        "USS Enterprise",
    state:       "United Federation of Planets",
  }, {
    title:       "Mr.",
    name:        "McLane, Cliff Allister",
    street:      "Cliffsstreet",
    postal_code: "1B 1B1B",
    city:        "Deepseabase 104",
    state:       "Earth",
  }, {
    title:       "Mrs.",
    name:        "Nerys, Kira",
    street:      "Level 42",
    postal_code: "DS9",
    city:        "Deep Space 9",
    state:       "Bajoran Republic",
  }, {
    title:       "Mr.",
    name:        "O'Brien, Miles Edward",
    street:      "Level 5",
    postal_code: "DS9",
    city:        "Deep Space 9",
    state:       "Bajoran Republic",
  }, {
    title:       "Mrs.",
    name:        "O'Brien, Keiko",
    street:      "Level 5",
    postal_code: "DS9",
    city:        "Deep Space 9",
    state:       "Bajoran Republic",
  }, {
    title:       "",
    name:        "Odo, Mr.",
    street:      "Level 42",
    postal_code: "DS9",
    city:        "Deep Space 9",
    state:       "Bajoran Republic",
  }, {
    title:       "",
    name:        "Quark, Mr.",
    street:      "Level 7, Section 5",
    postal_code: "DS9",
    city:        "Deep Space 9",
    state:       "Bajoran Republic",
  }, {
    title:       "Mrs.",
    name:        "Rand, Janice",
    street:      "Deck 42",
    postal_code: "NCC-1701",
    city:        "USS Enterprise",
    state:       "United Federation of Planets",
  }, {
    title:       "Mr.",
    name:        "Scott, Montgomery",
    street:      "Deck 42",
    postal_code: "NCC-1701",
    city:        "USS Enterprise",
    state:       "United Federation of Planets",
  }, {
    title:       "Mr.",
    name:        "Shubashi, Atan",
    street:      "Atansstreet",
    postal_code: "1B 1B1B",
    city:        "Deepseabase 104",
    state:       "Earth",
  }, {
    title:       "Mr.",
    name:        "Sisko, Benjamin Lafayette",
    street:      "Level 42",
    postal_code: "DS9",
    city:        "Deep Space 9",
    state:       "Bajoran Republic",
  }, {
    title:       "",
    name:        "Spock, Mr.",
    street:      "Spocksstreet",
    postal_code: "NCC-1701",
    city:        "USS Enterprise",
    state:       "United Federation of Planets",
  }, {
    title:       "Mr.",
    name:        "Sulu, Hikaru",
    street:      "Deck 42",
    postal_code: "NCC-1701",
    city:        "USS Enterprise",
    state:       "United Federation of Planets",
  }, {
    title:       "Mrs.",
    name:        "Uhura, Nyota",
    street:      "Deck 42",
    postal_code: "NCC-1701",
    city:        "USS Enterprise",
    state:       "United Federation of Planets",
  }, {
    title:       "",
    name:        "Worf, Mr.",
    street:      "Level 3, Section 27, Room 9",
    postal_code: "DS9",
    city:        "Deep Space 9",
    state:       "Bajoran Republic",
  }, {
    title:       "Mrs.",
    name:        "Yates-Sisko, Kasidy Danielle",
    street:      "Deck B",
    postal_code: "ECV-197",
    city:        "The Orville",
    state:       "Planetary Union",
  },
];
for (const recipient of data) {
  const option = document.createElement('option');
  option.innerHTML = recipient.name;
  addrName.appendChild(option);
}


const soffice_js = document.createElement("script");
soffice_js.src = soffice_base_url + "soffice.js";
// "onload" runs after the loaded script has run.
soffice_js.onload = function() {
  console.log('PLUS: Configuring Module');
  Module.uno_main.then(function(pThrPort) {
    thrPort = pThrPort;
    thrPort.onmessage = function(e) {
      switch (e.data.cmd) {
      case 'ready':
        loadingInfo.style.display = 'none';
        tbDataJs.font_name_list = e.data.fontsList;
        for (const [_, btn] of Object.entries(btnNamedAry)) btn.disabled = false;
        tbDataJs.disabled = false;
        // Trigger resize of the embedded window to match the canvas size.
        // May somewhen be obsoleted by:
        //   https://gerrit.libreoffice.org/c/core/+/174040
        window.dispatchEvent(new Event('resize'));
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
        link.style = 'display:none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        break;
      default:
        throw Error('Unknown message command ' + e.data.cmd);
      }
    };

    get_modern_business_letter_sans_serif_odt().then(function(aryBuf) {
      modern_business_letter_sans_serif_odt = aryBuf;
      FS.writeFile('/tmp/modern_business_letter_sans_serif.odt', new Uint8Array(modern_business_letter_sans_serif_odt));
    });
  });
};
console.log('Loading WASM binaries for ZetaJS from: ' + soffice_base_url);
// Hint: The global objects "canvas" and "Module" must exist before the next line.
document.body.appendChild(soffice_js);

/* vim:set shiftwidth=2 softtabstop=2 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
