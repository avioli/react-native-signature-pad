var content = script =>
  `<html>
    <style>
    *{margin:0;padding:0;}
    canvas{position:absolute;transform:translateZ(0);margin-left:0;margin-top:0;}
    </style>
    <body>
      <canvas></canvas>
      <script>${script}</script>
    </body>
  </html>`;

export default content;
