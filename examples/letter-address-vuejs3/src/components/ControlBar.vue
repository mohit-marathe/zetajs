<!-- SPDX-License-Identifier: MIT -->
<script lang="ts">
import VueFileToolbarMenu from "vue-file-toolbar-menu";

let tbDataForJs;

export default {
  components: { VueFileToolbarMenu },
  data() {
    return {
      active: {
        Bold: false,
        Italic: false,
        Underline: false,
        //
        Overline: false,
        Strikeout: false,
        Shadowed: false,
        Color: "#000000",
        CharBackColor: "#FFFFFF",
        //
        FontHeight: 12,
        //
        LeftPara: false,
        CenterPara: false,
        RightPara: false,
        JustifyPara: false,
        DefaultBullet: false,
      },
      disabled: false,  // TODO: vuejs-ify
    };
  },

  computed: {
    my_menu() {
      tbDataForJs = this;  // line may run multiple times
      // https://wiki.documentfoundation.org/Development/DispatchCommands
      return [
        {
          icon: "format_bold", title: "Bold",
          click: () => toggleFormatting('Bold', []),
          active: this.active['Bold'],
          disabled: this.disabled,
        },
        {
          icon: "format_italic", title: "Italic",
          click: () => toggleFormatting('Italic', []),
          active: this.active['Italic'],
          disabled: this.disabled,
        },
        {
          icon: "format_underline", title: "Underline",
          click: () => toggleFormatting('Underline', []),
          active: this.active['Underline'],
          disabled: this.disabled,
        },
        { is: "separator" },
        {
          icon: "format_overline", title: "Overline",
          click: () => toggleFormatting('Overline', []),
          active: this.active['Overline'],
          disabled: this.disabled,
        },
        {
          icon: "strikethrough_s", title: "Striketrough",
          click: () => toggleFormatting('Strikeout', []),
          active: this.active['Strikeout'],
          disabled: this.disabled,
        },
        {
          icon: "text_fields", title: "Shadowed",
          click: () => toggleFormatting('Shadowed', []),
          active: this.active['Shadowed'],
          disabled: this.disabled,
        },
        {
          title: "Character Color",
          is: "button-color",
          color: this.active['Color'],
          update_color: (color) => {
            const rgb = (color.rgba.r<<16) | (color.rgba.g<<8) | color.rgba.b;
            toggleFormatting('Color', [['Color', rgb]])
          },
          disabled: this.disabled,
        },
        {
          title: "Background Color",
          is: "button-color",
          color: this.active['CharBackColor'],
          update_color: (color) => {
            const rgb = (color.rgba.r<<16) | (color.rgba.g<<8) | color.rgba.b;
            toggleFormatting('CharBackColor', [['CharBackColor', rgb]])
          },
          disabled: this.disabled,
        },
        { is: "separator" },
        {
          icon: "text_increase", title: "Increase Font Size",
          click: () => toggleFormatting('Grow', []),
          disabled: this.disabled,
        },
        {
          icon: "text_decrease", title: "Decrease Font Size",
          click: () => toggleFormatting('Shrink', []),
          disabled: this.disabled,
        },
        {
          html: this.active['FontHeight'],
          title: "Font Size",
          chevron: true,
          menu: this.font_height_menu,
          menu_height: 300
        },
        { is: "separator" },
        {
          icon: "format_align_left", title: "Align Left",
          click: () => toggleFormatting('LeftPara', []),
          active: this.active['LeftPara'],
          disabled: this.disabled,
        },
        {
          icon: "format_align_center", title: "Align Center",
          click: () => toggleFormatting('CenterPara', []),
          active: this.active['CenterPara'],
          disabled: this.disabled,
        },
        {
          icon: "format_align_right", title: "Align Right",
          click: () => toggleFormatting('RightPara', []),
          active: this.active['RightPara'],
          disabled: this.disabled,
        },
        {
          icon: "format_align_justify", title: "Justified",
          click: () => toggleFormatting('JustifyPara', []),
          active: this.active['JustifyPara'],
          disabled: this.disabled,
        },
        {
          icon: "list", title: "Unordered List",
          click: () => toggleFormatting('DefaultBullet', []),
          active: this.active['DefaultBullet'],
          disabled: this.disabled,
        },
        { is: "separator" },
        {
          icon: "download", title: "Download ODT",
          click: () => btnDownloadFunc('btnOdt'),
          disabled: this.disabled,
        },
        {
          icon: "picture_as_pdf", title: "Download PDF",
          click: () => btnDownloadFunc('btnPdf'),
          disabled: this.disabled,
        },
      ];
    },
    font_height_menu() {
      return this.font_height_list.map(font_height => {
        return {
          html: font_height,
          /* icon: (this.theme != "default" && this.active['FontHeight'] == font_height) ? 'check' : false, */
          active: (this.active['FontHeight'] == font_height),
          height: 20,
          click: () => {
            toggleFormatting('FontHeight', [['FontHeight.Height', font_height]]),
            this.active['FontHeight'] = font_height;
          }
        };
      });
    },
    font_height_list: () => [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32],
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
