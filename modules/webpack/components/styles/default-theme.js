require("@polymer/polymer/polymer.js");
require("@polymer/paper-styles/color.js");
const $_documentContainer = document.createElement("div");
$_documentContainer.setAttribute("style", "display: none;");

$_documentContainer.innerHTML = `<custom-style>
  <style is="custom-style">
    html {
      /*
       * You can use these generic variables in your elements for easy theming.
       * For example, if all your elements use \`--primary-text-color\` as its main
       * color, then switching from a light to a dark theme is just a matter of
       * changing the value of \`--primary-text-color\` in your application.
       */
      --primary-text-color: var(--dark-theme-text-color);
      --primary-background-color: var(--dark-theme-background-color);
      --secondary-text-color: var(--dark-theme-secondary-color);
      --disabled-text-color: var(--dark-theme-disabled-color);
      --divider-color: var(--dark-theme-divider-color);
      --error-color: var(--paper-deep-orange-a700);
      /*
       * Primary and accent colors. Also see color.html for more colors.
       */
      --primary-color: var(--paper-red-500);
      --light-primary-color: var(--paper-red-100);
      --dark-primary-color: var(--paper-red-700);
      --accent-color: var(--paper-cyan-a700);
      --light-accent-color: var(--paper-cyan-a400);
      --dark-accent-color: var(--paper-cyan-800);
      /*
       * Material Design Light background theme
       */
      --light-theme-background-color: #ffffff;
      --light-theme-base-color: #000000;
      --light-theme-text-color: var(--paper-grey-900);
      --light-theme-secondary-color: #737373;  /* for secondary text and icons */
      --light-theme-disabled-color: #9b9b9b;  /* disabled/hint text */
      --light-theme-divider-color: #dbdbdb;
      /*
       * Material Design Dark background theme
       */
      --dark-theme-background-color: var(--paper-grey-900);
      --dark-theme-base-color: #ffffff;
      --dark-theme-text-color: #ffffff;
      --dark-theme-secondary-color: #bcbcbc;  /* for secondary text and icons */
      --dark-theme-disabled-color: #646464;  /* disabled/hint text */
      --dark-theme-divider-color: #3c3c3c;
      /*
       * Deprecated values because of their confusing names.
       */
      --text-primary-color: var(--dark-theme-text-color);
      --default-primary-color: var(--primary-color);
    }
  </style>
</custom-style>`;
document.head.appendChild($_documentContainer);