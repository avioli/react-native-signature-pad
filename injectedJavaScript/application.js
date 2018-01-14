export default function ({ penColor, backgroundColor, dataURL }) {
  return `
  window.onerror = function (message, url, line, column, error) {
    window.postMessage(JSON.stringify({ message, url, line, column, error }));
  };

  var bodyWidth = document.body.clientWidth;
  var bodyHeight = document.body.clientHeight;
  if(!bodyWidth) {
    bodyWidth = window.innerWidth;
  }
  if(!bodyHeight) {
    bodyHeight = window.innerHeight;
  }

  var canvasElement = document.querySelector('canvas');

  var sizeSignaturePad = function () {
    var devicePixelRatio = 1; /*window.devicePixelRatio || 1;*/
    var canvasWidth = bodyWidth * devicePixelRatio;
    var canvasHeight = bodyHeight * devicePixelRatio;
    canvasElement.width = canvasWidth;
    canvasElement.height = canvasHeight;
    canvasElement.getContext('2d').scale(devicePixelRatio, devicePixelRatio);
  };

  var finishedStroke = function(base64DataUrl) {
     executeNativeFunction('finishedStroke', {base64DataUrl: base64DataUrl});
  };

  var enableSignaturePadFunctionality = function () {
    var signaturePad = new SignaturePad(canvasElement, {
      penColor: '${penColor || 'black'}',
      backgroundColor: '${backgroundColor || 'white'}',
      onEnd: sendBase64DataUrl
    });
    signaturePad.minWidth = 1;
    signaturePad.maxWidth = 4;
    if (${!!dataURL}) {
      signaturePad.fromDataURL('${dataURL}');
    }
  };

  sizeSignaturePad();
  enableSignaturePadFunctionality();

  function sendBase64DataUrl () {
    var payload = {
      base64DataUrl: signaturePad.toDataURL()
    };
    window.postMessage(JSON.stringify(payload));
  }
`;
}
