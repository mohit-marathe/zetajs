<!-- SPDX-License-Identifier: MIT -->
<script setup lang=ts>
  import ControlBar from '@/components/ControlBar.vue';
  import Ping from 'ping.js';
</script>

<script lang=ts>
  export default {
    mounted() {
      const pre_soffice_js = document.createElement("script");
      pre_soffice_js.src = "./pre_soffice.js";
      pre_soffice_js.onload = function() {
        PingModule = Ping;  // pass Ping module to plain JS
        ControlBar.init_control_bar();
      }
      document.body.appendChild(pre_soffice_js);
    },
  };
</script>

<template>
  <div id="app">
    <table style="width:1150px; border-spacing: 10px;">
      <tr>
        <td>
          <div><h1>ZetaJS Calc Demo</h1></div>
          <ControlBar/>
        </td>
      </tr>
      <tr>
        <td>
          <canvas
            id="qtcanvas" contenteditable="true"
            oncontextmenu="event.preventDefault()" onkeydown="event.preventDefault()"
            width="900px" height="450px"/>
        </td>
        <td style="vertical-align: top; width:250px">
          <div>
            <button onclick="btnPing()">Ping</button>&nbsp; 
              <input type="text" id="ping_target" name="ping_target" value="https://zetaoffice.org/">
          </div>
          <div>
            <span id="ping_section">Loading ping tool...</span>
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>
