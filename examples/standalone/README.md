# Writer Document canvas

An example of a stripped-down, standalone Writer document canvas without any surrounding menubars,
toolbars, side panels, etc.

Includes HTML buttons to for simple formatting (bold, italic, underlined).

## Try it

To run with default ZetaOffice delivered by our CDN:

```
npm install
npm start
```

Optionally pass options behind the "--" parameter.
"--soffice_base ''" expects the soffice.* files in the public/ folder.
"--clean_disabled" prevents the public/ being wiped.

```
npm install
npm run start -- --clean_disabled --soffice_base '' --port 8080 --browser chromium

```

To use with local ZetaOffice build, place your soffice.* files in the public/ subfolder and do:

```
npm install
npm run debug
```

Attention: When using in production, replace the zetajs 'file:' link in `package.json` with a proper version from npmjs.com.
