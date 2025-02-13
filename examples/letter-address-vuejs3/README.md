# A ZetaJS Letter Address Tool (Writer Demo using Vue.js-3)

An example of a Web form letter demo, using a stripped-down, standalone Writer document canvas
without any surrounding menubars, toolbars, side panels, etc. This version uses Vue.js-3.

[online demo](https://zetaoffice.net/demos/letter-address-vuejs3/)

For Vue.js-3 you'll need nodejs.  
And either you also install npm system wide or you use:  
`nodeenv --node=system --with-npm nodeenv/`  
https://packages.debian.org/bookworm/nodejs  
https://packages.debian.org/bookworm/nodeenv

# vuejs3

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

The following HTTP headers must be set in the web server configuration.
```
Cross-Origin-Opener-Policy "same-origin"
Cross-Origin-Embedder-Policy "require-corp"
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
