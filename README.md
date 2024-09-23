# zetajs: Access ZetaOffice in the Browser from JavaScript via UNO

The `zeta.js` library provides the facilities to run an instance of ZetaOffice integrated in your
web site, allowing you to control it with JavaScript code via the LibreOffice
[UNO](https://wiki.documentfoundation.org/Documentation/DevGuide) technology.

Use cases range from an in-browser office suite that looks and feels just like its desktop
counterpart, to fine-tuned custom text editing and spreadsheet capabilites embedded in your web
site, to a headless zetajs instance that does document conversion in the background.

For a detailed description of zetajs, see the [Starting Points](docs/start.md) documentation.

(Technically, `zeta.js` provides a wrapper on top of the
[Embind-based](https://blog.allotropia.de/2024/04/30/libreoffice-javascripted/) JavaScript scripting
capabilities for LibreOffice.  But it aims to provide a nicer, more idiomatic JavaScript experience,
and completely hides the underlying machinery.  In the future, it may even move away from that
underyling Embind layer, in a backward-compatible way.)

## Examples and test code

You'll need a LOWA (LibreOffice WASM) build. There the folder `workdir/installation/LibreOffice/emscripten/` will contain the files for the webroot.

Examples in the sub-folder of `examples/` have own instructions how to run.
The single files directly in the `examples/` folder may be run according to one of the following descriptions.

If you're not using emrun as webserver, you'll need to set two headers. Here are the needed config lines for Apache:

```
Header add Cross-Origin-Opener-Policy "same-origin"
Header add Cross-Origin-Embedder-Policy "require-corp"
```

### Via uno_scripts in qt_soffice.html

Add this line right before `</body>` in `qt_soffice.html` and replace `EXAMPLE_FILE.js` with the example you choose.
Then add the mentioned files to the webroot.

```
    <script type="text/javascript">Module["uno_scripts"] = ['zeta.js', 'EXAMPLE_FILE.js']</script>
```

### Via building with EMSCRIPTEN_EXTRA_SOFFICE_PRE_JS

One way to run some of the provided example and test code is to serve those files next to `qt_soffice.html`, along with some `include.js` that looks like
```
Module.uno_scripts = [
    'zetajs/source/zeta.js',
    'zetajs/test/smoketest.js',
    'zetajs/examples/simple.js',
    'zetajs/examples/TableSample.js'];
```
(or whatever the paths where you serve them, relative to `qt_soffice.html`; `zeta.js` always needs to come first), and to build LOWA with an `EMSCRIPTEN_EXTRA_SOFFICE_PRE_JS=/path/to/include.js` configuration option (e.g., as a line in `autogen.input`), with `/path/to` adapted accordingly.  (The `test/smoketest.js` code requires a LibreOffice configured with `--enable-dbgutil` to have the `org.libreoffice.embindtest` UNOIDL entities available.)
