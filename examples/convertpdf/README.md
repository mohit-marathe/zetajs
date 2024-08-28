An example of a local file to PDF conversion service.  If the "Download" button is checked, the
converted PDF document is downloaded to the local file system, in addition to being shown in an
iframe on the web page.

This example requires a LOWA installation that is configured with `--disable-gui`.

To build the example, the `LOWAINSTDIR` make variable must point to a LOWA installation directory
(and must end in a slash).  Something like
```
$ make LOWAINSTDIR=/path-to-libreoffice-build/workdir/installation/LibreOffice/emscripten/
$ emrun out/convertpdf.html
```
