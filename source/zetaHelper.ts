// ATTENTION: Experimental code! Expect heavy API changes.



export class ZetaHelperMain {
  canvas: HTMLElement;
  Module: any;
  threadJs: string | null;   // JavaScript code to run in the office web worker.
  threadJsMode = 'classic';  // 'classic' || 'module'
  soffice_base_url: string;
  thrPort!: MessagePort;  // zetajs thread communication
  FS!: any;  // Emscripten Unix like virtual file system


  constructor(
      threadJs: string | URL | null,
      options: {threadJsMode: string | null, soffice_base_url: string | URL | null}) {
    // Enable usage of LOWA builds with UI.
    const canvas = document.getElementById('qtcanvas')!;

    const thisFileUrl = import.meta.url;
    const modUrlDir = thisFileUrl.substring(0, thisFileUrl.length - 'zetaHelper.js'.length);

    if (threadJs) threadJs = (new URL(threadJs, location.href)).toString();

    const zetajsScript = modUrlDir + 'zeta.js';
    const threadWrapScript = 'data:text/javascript;charset=UTF-8,' +
      'import("' + import.meta.url + '").then(m => {m.zetaHelperWrapThread();});';
    let soffice_base_url = options.soffice_base_url;
    if (soffice_base_url == null) {
      soffice_base_url = 'https://cdn.zetaoffice.net/zetaoffice_latest/';
    } else {
      if (soffice_base_url === '') soffice_base_url = './';
      soffice_base_url = (new URL(soffice_base_url, location.href)).toString();
    }
    const Module: any = {
      canvas,
      uno_scripts: [zetajsScript, threadWrapScript],
      locateFile: function(path: string, prefix: string) { return (prefix || soffice_base_url) + path; },
      modUrlDir,
    };
    Module.mainScriptUrlOrBlob = new Blob(
      ["importScripts('"+(new URL('soffice.js', soffice_base_url))+"');"],
      {type: 'text/javascript'});

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
    this.threadJs = threadJs?.toString() || null;
    if (options.threadJsMode === 'module') this.threadJsMode = 'module';
    this.soffice_base_url = soffice_base_url;
  }


  start(app_init: () => void) {
    const zHM = this;
    const soffice_js = document.createElement("script");
    soffice_js.src = zHM.soffice_base_url + "soffice.js";
    // "onload" runs after the loaded script has run.
    soffice_js.onload = function() {
      console.log('zetaHelper: Configuring Module');
      zHM.Module.uno_main.then(function(pThrPort: MessagePort) {
        zHM.thrPort = pThrPort;
        zHM.FS = (window as any).FS;
        zHM.thrPort.onmessage = function(e: any) {
          switch (e.data.cmd) {
          case 'ZetaHelper::thr_started':
            // Trigger resize of the embedded window to match the canvas size.
            // May somewhen be obsoleted by:
            //   https://gerrit.libreoffice.org/c/core/+/174040
            window.dispatchEvent(new Event('resize'));
            zHM.thrPort.postMessage({
              cmd: 'ZetaHelper::run_thr_script',
              threadJs: zHM.threadJs,
              threadJsMode: zHM.threadJsMode
            });
            app_init();
            break;
          default:
            throw Error('Unknown message command: ' + e.data.cmd);
          };
        }
      });
    };
    console.log('zetaHelper: Loading WASM binaries for ZetaJS from: ' + zHM.soffice_base_url);
    // Hint: The global objects "canvas" and "Module" must exist before the next line.
    document.body.appendChild(soffice_js);
  }
}




/* Initializes zetajs in the office thread. */
export function zetaHelperWrapThread() {
  const zJsModule = (globalThis as any).Module;
  zJsModule.zetajs.then(function(zetajs: any) {
    const port: MessagePort = zetajs.mainPort;
    port.onmessage = function(e) {
      switch (e.data.cmd) {
      case 'ZetaHelper::run_thr_script':
        port.onmessage = null;
        globalThis.zetajsStore = {zetajs, zJsModule};
        let threadJs = e.data.threadJs;
        if (threadJs) {
          if (e.data.threadJsMode) {
            console.log('zetaHelper: Loading threadJs as module from: ' + threadJs);
            import(threadJs).then(module => {
              // Make exports of threadJs accessible for debugging.
              globalThis.zetajsStore.threadJsContext = module;
            });
          } else {
            console.log('zetaHelper: Loading threadJs as script from: ' + threadJs);
            importScripts(threadJs);
          }
        } else {
          console.log('zetaHelper: Office loaded. No threadJs given.');
        }
        break;
      default:
        throw Error('Unknown message command BBBBBBBB ' + e.data.cmd);
      };
    }
    port.postMessage({
      cmd: 'ZetaHelper::thr_started'
    });
  });
}




export class ZetaHelperThread {
  config: any;
  context: any;
  css: any;
  desktop: any;
  thrPort: MessagePort;
  toolkit: any;
  zetajs: any;
  zJsModule: any;


  constructor() {
    this.zetajs = globalThis.zetajsStore.zetajs;

    this.zJsModule = globalThis.zetajsStore.zJsModule;

    this.thrPort = this.zetajs.mainPort;
    this.css = this.zetajs.uno.com.sun.star;
    this.context = this.zetajs.getUnoComponentContext();
    this.toolkit = this.css.awt.Toolkit.create(this.context);
    this.desktop = this.css.frame.Desktop.create(this.context);
    this.config = this.css.configuration.ReadWriteAccess.create(this.context, 'en-US');
  }


  /* Turn off toolbars.
   * officeModules: ["Base", "Calc", "Draw", "Impress", "Math", "Writer"];
   */
  configDisableToolbars(officeModules: string[]) {
    for (const mod of officeModules) {
      const modName = "/org.openoffice.Office.UI." + mod + "WindowState/UIElements/States";
      const uielems = this.config.getByHierarchicalName(modName);
      for (const i of uielems.getElementNames()) {
        if (i.startsWith("private:resource/toolbar/")) {
          const uielem = uielems.getByName(i);  // SLOW OPERATION
          if (uielem.getByName('Visible')) {
            uielem.setPropertyValue('Visible', false);
          }
        }
      }
    }
    this.config.commitChanges();
  }

  transformUrl(context: any, unoUrl: string) {
    const ioparam = {val: new this.css.util.URL({Complete: unoUrl})};
    this.css.util.URLTransformer.create(context).parseStrict(ioparam);
    return ioparam.val;
  }

  queryDispatch(ctrl: any, urlObj: any) {
    return ctrl.queryDispatch(urlObj, '_self', 0);
  }

  dispatch(ctrl: any, context: any, unoUrl: string) {
    const urlObj = this.transformUrl(context, unoUrl);
    this.queryDispatch(ctrl, urlObj).dispatch(urlObj, []);
  }
}
