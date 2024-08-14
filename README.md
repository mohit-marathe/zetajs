# Nice LOWA Access from JavaScript via UNO

`source/jsuno.js` provides a JS-`Proxy`-based wrapper on top of the
[Embind-based](https://blog.allotropia.de/2024/04/30/libreoffice-javascripted/) JS scripting
capabilities for LOWA.  It aims to provide a nicer, more idiomatic JS experience compared to the
Embind-based approach.

The starting point is to wrap initial UNO objects obtained through the Embind layer (i.e.,
`Module.getUnoComponentContext()`) in a call to
`Module.jsuno.proxy(...)`.  The resulting `Proxy` internally uses UNO's `css.script.Invocation`
service to directly make available all the UNO interfaces implemented by the given UNO object.
There is no more need for `query` calls to obtain a reference to specific UNO interfaces.

Also, values of certain UNO types map to more idiomatic JS values now:  UNO sequences map to JS
arrays, and UNO `ANY` values map to JS Module.jsuno.Any objects.  There is no more need to call
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
cases.  But client code can always explicitly provide a JS Module.jsuno.Any object.

## Examples and test code

One way to run all the provided example and test code is to build LOWA with a `EMSCRIPTEN_EXTRA_SOFFICE_POST_JS=/path/to/jsuno/source/jsuno.js /path/to/jsuno/test/smoketest.js /path/to/jsuno/examples/simple.js /path/to/jsuno/examples/TableSample.js` configuration option (e.g., as a line in `autogen.input`), with `/path/to/jsuno` adapted accordingly.  (The `test/smoketest.js` code requires a LibreOffice configured with `--enable-dbgutil` to have the `org.libreoffice.embindtest` UNOIDL entities available.)
