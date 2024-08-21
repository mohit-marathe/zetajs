<script setup lang=ts>
  // TODO...
</script>

<script lang=ts>
  export default {
    mounted() {
      const pre_soffice_js = document.createElement("script");
      pre_soffice_js.src = "/pre_soffice.js";
      document.body.appendChild(pre_soffice_js);

      const soffice_js = document.createElement("script");
      soffice_js.src = "/soffice.js";
      document.body.appendChild(soffice_js);
    },
  };
</script>

<template>
  <div id="app">
    <h1>zetajs</h1><br>
    <label><input type=checkbox id="bold" disabled="true"/> Bold</label>
    <label><input type=checkbox id="italic" disabled="true"/> Italic</label>
    <label><input type=checkbox id="underline" disabled="true"/> Underline</label><br>
    <canvas
      id="qtcanvas" contenteditable="true"
      oncontextmenu="event.preventDefault()" onkeydown="event.preventDefault()"
      width="560" height="360"/><br>
    <h1>bottom</h1>
  </div>
</template>
