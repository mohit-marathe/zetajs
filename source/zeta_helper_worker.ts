'use strict';




class ZetaHelperWorker {
  css: any;
  zetajs: any;

  constructor(zetajs: any) {
    this.css = zetajs.uno.com.sun.star;
    this.zetajs = zetajs;
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
