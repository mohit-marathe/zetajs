An example of a stripped-down, standalone Writer document canvas without any surrounding menubars,
toolbars, side panels, etc., but just some HTML buttons to control bold, italic, and underlined when
typing text.

To build the example, the LOWAINSTDIR make variable must point to a LOWA installation directory (and
must end in a slash).  Something like
```
$ make LOWAINSTDIR=/path-to-libreoffice-build/workdir/installation/LibreOffice/emscripten/
$ emrun out/standalone.html
```
