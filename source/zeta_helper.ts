'use strict';




class ZetaHelperMain {
  canvas: HTMLElement;
  Module: any;
  soffice_base_url: string;
  thrPort!: MessagePort;  // zetajs thread communication


  constructor(soffice_base_url: string) {
    // Enable usage of LOWA builds with UI.
    const canvas = document.getElementById('qtcanvas')!;

    const Module: any = {
      canvas,
      uno_scripts: ['./assets/vendor/zetajs/zeta.js', './office_thread.js'],
      locateFile: function(path: string, prefix: string) { return (prefix || soffice_base_url) + path; },
    };
    if (soffice_base_url !== '') {
      // Must not be set when soffice.js is in the same directory.
      Module.mainScriptUrlOrBlob = new Blob(
        ["importScripts('"+soffice_base_url+"soffice.js');"], {type: 'text/javascript'});
    }

    let lastDevicePixelRatio = window.devicePixelRatio;
    window.onresize = function() {
      // Workaround to inform Qt5 about changed browser zoom.
      setTimeout(function() {
        if (lastDevicePixelRatio != -1) {
          if (lastDevicePixelRatio != window.devicePixelRatio) {
            lastDevicePixelRatio = -1;
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

    (window as any).Module = Module;  // window.* is global
    this.canvas = canvas;
    this.Module = Module;
    this.soffice_base_url = soffice_base_url;
  }


  start(app_init: () => void) {
    const zHM = this;
    const soffice_js = document.createElement("script");
    soffice_js.src = this.soffice_base_url + "soffice.js";
    // "onload" runs after the loaded script has run.
    soffice_js.onload = function() {
      console.log('PLUS: Configuring Module');
      zHM.Module.uno_main.then(function(pThrPort: MessagePort) {
        zHM.thrPort = pThrPort;
        app_init();
      });
    };
    console.log('Loading WASM binaries for ZetaJS from: ' + this.soffice_base_url);
    // Hint: The global objects "canvas" and "Module" must exist before the next line.
    document.body.appendChild(soffice_js);
  }
}
