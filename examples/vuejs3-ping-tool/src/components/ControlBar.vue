<!-- SPDX-License-Identifier: MIT -->
<script lang="ts">
import VueFileToolbarMenu from "vue-file-toolbar-menu";

let tbDataForJs;

export default {
  components: { VueFileToolbarMenu },
  data() {
    return {
      active: {
        bold: false,
        italic: false,
        underline: false
      },
    };
  },

  computed: {
    my_menu() {
      tbDataForJs = this;  // line may run multiple times
      return [
        {
          icon: "format_bold", title: "Bold",
          click: () => toggleFormatting('bold'),
          active: this.active['bold'],
        },
        {
          icon: "format_italic", title: "Italic",
          click: () => toggleFormatting('italic'),
          active: this.active['italic'],
        },
        {
          icon: "format_underline", title: "Underline",
          click: () => toggleFormatting('underline'),
          active: this.active['underline'],
        },
      ];
    },
  },
  init_control_bar: function() {
    jsPassCtrlBar(tbDataForJs);
  },
};
</script>




<template>
  <div>
    <vue-file-toolbar-menu :content="my_menu" />
  </div>
</template>

<style scoped>
</style>
