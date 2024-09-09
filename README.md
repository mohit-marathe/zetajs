# Nice LOWA Access from JavaScript via UNO

`source/zetajs.js` provides a wrapper on top of the
[Embind-based](https://blog.allotropia.de/2024/04/30/libreoffice-javascripted/) JS scripting
capabilities for LOWA.  It aims to provide a nicer, more idiomatic JS experience compared to the
Embind-based approach.  The starting point is the `Module.zetajs` `Promise` that provides the
`zetajs` facilities.

Compared to the underlying Embind layer, UNO objects are represented by proxying JS objects that
internally uses UNO's `css.script.Invocation` service to directly make available all the UNO
interfaces implemented by the given UNO object.  There is no more need for `query` calls to obtain a
reference to specific UNO interfaces.

Also, values of certain UNO types map to more idiomatic JS values now:  UNO sequences map to JS
arrays, and UNO `ANY` values map to JS `zetajs.Any` objects.  There is no more need to call
`.delete()` on such values.  Similarly, out and in-out parameters can be passed via any plain JS
objects with a `val` property, instead of requiring the special `Module.uno_InOutParam_...` objects
(which had to be `.delete()`'ed).  And UNO `BOOLEAN` more consistently maps to JS `Boolean` now,
avoiding mappings to `0`/`1`.

`examples/simple.js` shows how this leads to shorter and more idiomatic code compared to the
Embind-based example code in the [core repo's](https://git.libreoffice.org/core)
`static/README.wasm.md` file.

When a UNO interface method takes a parameter of a specific non-`ANY` UNO type, the conversion
between these convenient JS argument values and the underlying Embind values works well.  However,
when such a method parameter is of generic `ANY` type, the conversion code needs to guess an
appropriate UNO type based solely on the given JS argument value, which does not work well in all
cases.  But client code can always explicitly provide a JS `zetajs.Any` object.

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
    <script type="text/javascript">Module["uno_scripts"] = ['zetajs.js', 'EXAMPLE_FILE.js']</script>
```

### Via building with EMSCRIPTEN_EXTRA_SOFFICE_PRE_JS

One way to run some of the provided example and test code is to serve those files next to `qt_soffice.html`, along with some `include.js` that looks like
```
Module.uno_scripts = [
    'zetajs/source/zetajs.js',
    'zetajs/test/smoketest.js',
    'zetajs/examples/simple.js',
    'zetajs/examples/TableSample.js'];
```
(or whatever the paths where you serve them, relative to `qt_soffice.html`; `zetajs.js` always needs to come first), and to build LOWA with an `EMSCRIPTEN_EXTRA_SOFFICE_PRE_JS=/path/to/include.js` configuration option (e.g., as a line in `autogen.input`), with `/path/to` adapted accordingly.  (The `test/smoketest.js` code requires a LibreOffice configured with `--enable-dbgutil` to have the `org.libreoffice.embindtest` UNOIDL entities available.)
