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
    <table style="width:1150px; border-spacing: 0px;" class="special-table">
      <tbody>
        <tr>
          <td colspan="3">
            <div><h1>ZetaJS: Letter Address Tool</h1></div>
          </td>
        </tr>
        <tr>
          <td rowspan="2" style="white-space: nowrap; width: 1%; border-width: 1px 1px 0 1px; padding: 0px;">
            <button class="w3-button w3-white" id="btnLetter" onclick="btnSwitchTab('letter')" disabled>Letter</button> <button class="w3-button w3-theme" id="btnTable" onclick="btnSwitchTab('table')" disabled>Addresses</button>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="border-width: 0 0 1px 0;
    padding: 0;">
            &nbsp;
            <label class="w3-button w3-disabled w3-round w3-padding-small w3-spacing-large w3-theme" id="lblUpload">
              Upload File
              <input accept=".odt" style="display: none;" class="w3-round" type="file" id="btnUpload" onchange="btnUploadFunc()" required disabled>
            </label>
            &nbsp;
            <button class="w3-button w3-round w3-padding-small w3-spacing-large w3-theme" id="btnReload" onclick="btnReloadFunc()" disabled>Reload File</button>
            &nbsp;
            <button class="w3-button w3-round w3-padding-small w3-theme" id="btnInsert" onclick="btnInsertFunc()" disabled>Insert Address</button>
          </td>
        </tr>
        <tr>
          <td colspan="3" style="border-width: 0 1px 0 1px; padding: 10px 10px 0 10px;" id="controlbar_row">
            <ControlBar id="controlbar"/>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="border-width: 0 0 1px 1px;" id="canvasCell">
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
          <td style="vertical-align: top; width:250px; border-width: 0 1px 1px 0;" id="addrNameCell">
            <div>
              <select class="w3-select w3-round w3-light-grey" id="addrName" size="24" style="width: 100%;" autofocus disabled></select>
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

  /* Disable dark mode. ControlBar doesn't work well with it. */
  body {
    background-color: var(--background-color);
    color: var(--text-color);
  }

  select option {
    /* Same spacing in select lists for Firefox-128 as for Chromium-130. */
    padding: 0;
    height: 18px;
  }
  .w3-theme {
    color: #1F2937 !important; /* ZetaOffice brand color */
    background-color: #059669 !important; /* ZetaOffice brand color */
  }

  .special-table td {
    padding: 10px;
    border-color: #B0B0B0;
    border-style: solid;
    border-width: 0 0 0 0;
  }
</style>
