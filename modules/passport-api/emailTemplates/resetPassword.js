var mjml2html = require("mjml").mjml2html;
var config = require("config");

module.exports = function(name, activateLinkKey) {
  var bURL = config.get("server.domain");
  var activateLink = bURL + "/account/resetPassword?utm_source=password_reset_email&utm_medium=email&key=" + activateLinkKey;
  return mjml2html(`
<mjml>
<mj-head>
  <mj-title>Your Passport ID</mj-title>
  <mj-attributes>
    <mj-all />
    <mj-text font-size="16" />
  </mj-attributes>
</mj-head>
<mj-body >
  <mj-container background-color="#E0E0E0">
    <mj-navbar background-color="#F44336">
        <mj-column width="20%">
          <mj-image width="300px" href="` + bURL + `?utm_source=password_reset_email&utm_medium=email" src="` + bURL + `/images/logo/48x48.png"></mj-image>
        </mj-column>
        <mj-column width="80%">
          <mj-inline-links base-url="" hamburger="hamburger" ico-color="#ffffff">
            <mj-link href="` + bURL + `/auth/login?utm_source=password_reset_email&utm_medium=email" color="#ffffff">Login</mj-link>
            <mj-link href="https://getpassport.live" color="#ffffff">Project Page</mj-link>
            <mj-link href="https://github.com/poster983/Passport-Live" color="#ffffff">Github Page</mj-link>
          </mj-inline-links>
        </mj-column>
      </mj-navbar>
      <mj-hero
        mode="Fluid height"
        height="469px"
        background-width="600px"
        background-height="469px"
        background-url="https://source.unsplash.com/7i9yLoUgoP8/1600x900"
        background-color="#2a3448"
        padding="100px 0px">
        <!-- To add content like mj-image, mj-text, mj-button ... use the mj-hero-content component -->
        <mj-image width="148px" src="` + bURL + `/images/logo/full.svg"></mj-image>
        <mj-hero-content width="100%">
          <mj-text
            padding="10px"
            color="#ffffff"
            font-family="Roboto"
            align="center"
            font-size="30"
            line-height="45px"
            font-weight="500">
            <br><br>
            Really ` + name.first + `
          </mj-text>
          <mj-text
            padding="10px"
            color="#ffffff"
            font-family="Roboto"
            align="center"
            font-size="45"
            line-height="45px"
            font-weight="900">
            Let's Reset Your Password
          </mj-text>
          <mj-button href="` + activateLink + `" background-color="#00B8D4" align="center">
            Reset it!
          </mj-button>
        </mj-hero-content>
      </mj-hero>
      
      
      <mj-spacer height="12px"  />
      <mj-section padding="20px" background-color="#BDBDBD" border-radius="4px">
        <mj-text
          padding="20px"
          color="#000"
          font-family="Roboto"
          align="center"
          font-size="30"
          line-height="45px"
          font-weight="900">
          Confused?
        </mj-text>
        <mj-text font-size="15" padding="20px">
          Someone (hopefully you) requested a password reset for the account associated with this email. If you receive this email again within 24 hours, please contact IT.
        </mj-text>
      </mj-section>
      <mj-spacer height="12px"  />
      <mj-section padding="20px" background-color="#BDBDBD" border-radius="4px">
        <mj-text
          padding="20px"
          color="#000"
          font-family="Roboto"
          align="center"
          font-size="30"
          line-height="45px"
          font-weight="900">
          Problems Clicking The Button?
        </mj-text>
        <mj-text font-size="15" padding="20px">
          Paste this into your browser's omnibox: 
          <br>
          <a href="` + activateLink + `">` + activateLink + `</a>
        </mj-text>
      </mj-section>
      <mj-spacer height="12px"  />
    </mj-container>
</mj-body>
</mjml>`);
}