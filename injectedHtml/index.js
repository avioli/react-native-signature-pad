export default function ({ script, webViewBackgroundColor }) {
  return `
<html>
<style>
*{margin:0;padding:0}
html,body{height:100%;width:100%;margin:0}
canvas{position:absolute;transform:translateZ(0);margin:0;top:0;left:0;width:100%;height:100%}
body{background-color:${webViewBackgroundColor || 'white'}}
</style>
<body>
<canvas id="canvas"></canvas>
<script>${script}</script>
</body>
</html>
`;
}
