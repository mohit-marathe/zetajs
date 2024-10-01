An example of a stripped-down, standalone Calc document canvas without any surrounding menubars,
toolbars, side panels, etc..

To build the example, the `LOWAINSTDIR` make variable must point to a LOWA installation directory
(and must end in a slash).  Something like
```
$ make LOWAINSTDIR=/path-to-libreoffice-build/workdir/installation/LibreOffice/emscripten/
$ emrun out/index.html
```
