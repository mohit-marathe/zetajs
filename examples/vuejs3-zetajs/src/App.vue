<script setup lang=ts>
  import ControlBar from '@/components/ControlBar.vue'
</script>

<script lang=ts>
  export default {
    mounted() {
      const pre_soffice_js = document.createElement("script");
      pre_soffice_js.src = "/pre_soffice.js";
      pre_soffice_js.onload = ControlBar.init_control_bar;
      document.body.appendChild(pre_soffice_js);
    },
  };
</script>

<template>
  <div id="app">
    <h1>zetajs</h1><br>
    <ControlBar/>
    <canvas
      id="qtcanvas" contenteditable="true"
      oncontextmenu="event.preventDefault()" onkeydown="event.preventDefault()"
      width="560" height="360"/><br>
  </div>
</template>
