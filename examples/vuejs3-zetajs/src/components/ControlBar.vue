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
};

console.log('PLUS: poll and wait for "passTbDataToJs"');
let passTbDataIntMax = 200;
const passTbDataInt = setInterval(function() {
  console.log('PLUS: passTbDataToJs: looping');
  if (passTbDataIntMax-- < 1) clearInterval(moduleInt);
  // pre_soffice.js defines passTbDataToJs after this file ran.
  // And Variables can't be accessed the other way around.
  if (typeof passTbDataToJs === 'undefined') return;
  clearInterval(passTbDataInt);
  console.log('PLUS: passTbDataToJs: found');
  passTbDataToJs(tbDataForJs);
}, 50);  // 0.05 seconds
</script>




<template>
  <div>
    <vue-file-toolbar-menu :content="my_menu" />
  </div>
</template>

<style scoped>
</style>
