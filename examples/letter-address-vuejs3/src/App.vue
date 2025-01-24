<!-- SPDX-License-Identifier: MIT -->
<script setup lang=ts>
  import ControlBar from '@/components/ControlBar.vue';
</script>

<script lang=ts>
  export default {
    mounted() {
      const config_js = document.createElement("script");
      config_js.src = "./config.js";
      document.body.appendChild(config_js);  // May fail. config.js is optional.
      const pre_soffice_js = document.createElement("script");
      pre_soffice_js.src = "./pre_soffice.js";
      pre_soffice_js.onload = function() {
        ControlBar.init_control_bar();
      }
      document.body.appendChild(pre_soffice_js);
    },
  };
</script>

<template>
  <div id="app">
    <table style="width:1150px; border-spacing: 10px;">
      <tbody>
        <tr>
          <td>
            <div><h1>ZetaJS: Letter Address Tool (Writer Demo with Vue.js-3)</h1></div>
            <ControlBar/>
          </td>
        </tr>
        <tr>
          <td>
            <div onselectstart="event.preventDefault()" style="position: relative">
              <!--  position: Makes the loading animation overlay the canvas.
                      Needs a surrounding table with fixed width to work properly.
                    onselectstart: Prevents accidently selecting / highlighting the canvas.
                      Must be set on the surrounding HTML element. (tested in Firefox-128) -->
              <div id="loadingInfo"
                  style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                <div class="spinner"></div><br>
                <h2>ZetaOffice is loading...</h2>
              </div>
              <canvas
                id="qtcanvas" contenteditable="true"
                oncontextmenu="event.preventDefault()" onkeydown="event.preventDefault()"
                width="900px" height="450px"
                style="border: 0px none; padding: 0; outline: 1px solid #cccccc;">
                <!-- QT requires the canvas to have the ID "qtcanvas". -->
                <!-- The canvas *must not* have any border or padding, or mouse coords will be wrong. -->
                <!-- An outline is fine though. -->
              </canvas>
            </div>
          </td>
          <td style="vertical-align: top; width:250px">
            <div class="w3-margin-bottom">
              <button class="w3-button w3-round w3-grey w3-padding-small w3-theme" id="btnInsert" onclick="btnInsertFunc()" disabled>Insert Address</button> <button class="w3-button w3-round w3-grey w3-padding-small w3-theme" id="btnReload" onclick="btnReloadFunc()" disabled>Reload file</button>
            </div>
            <div>
              <!-- size="18" looks best with canvas height="450px" in Firefox-128. -->
              <select class="w3-select w3-round w3-light-grey" id="addrName" size="18" style="width: 100%;" autofocus></select>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>


<style>
  .spinner {
    border: 16px solid #1F2937; /* ZetaOffice brand color */
    border-top: 16px solid #059669; /* ZetaOffice brand color */
    border-radius: 50%;
    width: 120px;
    height: 120px;
    position: relative;
    left: 60px;  /* adjust to center */
    animation: spin 2s linear 30; /* 60 seconds */
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
