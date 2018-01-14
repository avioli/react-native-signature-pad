export default function ({ sendChangeEvents, penColor, backgroundColor, dataURL, penMinWidth, penMaxWidth, pixelRatio }) {
    return `
window.onerror = function (message, url, line, column, error) {
  window.postMessage(JSON.stringify({ message, url, line, column, error }));
};

var devicePixelRatio = ${pixelRatio} || Math.max(window.devicePixelRatio || 1, 1);

var canvas = document.getElementById('canvas');
var signaturePad = new SignaturePad(canvas, {
  penColor: '${penColor || 'black'}',
  backgroundColor: '${backgroundColor || 'white'}',
  onEnd: ${sendChangeEvents ? 'sendBase64DataUrl' : 'false'}
});

signaturePad.minWidth = ${penMinWidth || 1};
signaturePad.maxWidth = ${penMaxWidth || 4};

if (${!!dataURL}) {
  signaturePad.fromDataURL('${dataURL}');
}

function resizeCanvas () {
  canvas.width = canvas.offsetWidth * devicePixelRatio;
  canvas.height = canvas.offsetHeight * devicePixelRatio;
  canvas.getContext('2d').scale(devicePixelRatio, devicePixelRatio);
  signaturePad && signaturePad.clear();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

document.addEventListener('message', function (event) {
  var data;
  try {
    data = JSON.parse(event.data);
  } catch (err) {
    return;
  }

  if (!data) return;

  var action = data['action'];
  if (!action) return;

  if (action === 'clear') {
    signaturePad && signaturePad.clear();
    return;
  } else if (action === 'setState') {
    setState(data['state']);
  } else if (action === 'isEmpty') {
    sendIsEmpty();
  } else if (action === 'getData') {
    sendData();
  }
});

function setState (newState) {
  if (!newState) return;
  if ('backgroundColor' in newState) {
    signaturePad.backgroundColor = newState.backgroundColor;
    signaturePad.clear();
  }
  if ('penColor' in newState) signaturePad.penColor = newState.penColor;
  if ('penMinWidth' in newState) signaturePad.minWidth = newState.penMinWidth;
  if ('penMaxWidth' in newState) signaturePad.maxWidth = newState.penMaxWidth;
  if ('sendChangeEvents' in newState) signaturePad.onEnd = newState.sendChangeEvents && sendBase64DataUrl;
  if ('pixelRatio' in newState) {
    devicePixelRatio = newState.pixelRatio;
    resizeCanvas()
  }
}

function sendIsEmpty () {
  var isEmpty = signaturePad.isEmpty();
  var payload = {
    action: 'isEmpty',
    value: isEmpty 
  };
  window.postMessage(JSON.stringify(payload));
}

function sendBase64DataUrl () {
  var payload = {
    base64DataUrl: signaturePad.toDataURL()
  };
  window.postMessage(JSON.stringify(payload));
}

function sendData () {
  var payload = {
    action: 'getData',
    value: signaturePad.toDataURL()
  };
  window.postMessage(JSON.stringify(payload));
}
`;
}
