import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  ViewPropTypes,
  WebView,
  StyleSheet,
} from 'react-native';

import htmlContent from './injectedHtml';
import injectedSignaturePad from './injectedJavaScript/signaturePad';
import injectedApplication from './injectedJavaScript/application';

export default class SignaturePad extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    onError: PropTypes.func,
    style: ViewPropTypes.style,
    penColor: PropTypes.string,
    dataURL: PropTypes.string,
    penMinWidth: PropTypes.number,
    penMaxWidth: PropTypes.number,
    backgroundColor: PropTypes.string,
    webViewBackgroundColor: PropTypes.string,
    pixelRatio: PropTypes.number
  };

  static defaultProps = {
    style: {},
    backgroundColor: 'rgba(0,0,0,0)'
  };

  constructor (props) {
    super(props);

    this.state = {
      isEmptyResolver: null,
      getDataResolver: null
    };

    let {
      onChange,
      style,
      backgroundColor,
      webViewBackgroundColor,
      penColor,
      dataURL,
      penMinWidth,
      penMaxWidth,
      pixelRatio
    } = props;

    if (backgroundColor === 'inherit') {
      backgroundColor = StyleSheet.flatten(style).backgroundColor
    }
    if (webViewBackgroundColor === 'inherit') {
      webViewBackgroundColor = StyleSheet.flatten(style).backgroundColor
    }

    penMinWidth = Math.max(isNaN(penMinWidth) ? 0.5 : parseFloat(penMinWidth), 0)
    penMaxWidth = Math.max(isNaN(penMaxWidth) ? 2.5 : parseFloat(penMaxWidth), 0)
    pixelRatio = Math.max(isNaN(pixelRatio) ? 0 : parseInt(pixelRatio, 10), 0)

    const script = injectedSignaturePad + injectedApplication({
      sendChangeEvents: !!onChange,
      penColor,
      backgroundColor,
      dataURL,
      penMinWidth,
      penMaxWidth,
      pixelRatio
    });

    this._source = {
      html: htmlContent({
        script,
        webViewBackgroundColor
      })
    };
  }

  componentWillReceiveProps (nextProps) {
    if (!this._webview) return;

    const state = {};

    if (nextProps.backgroundColor !== this.props.backgroundColor ||
      nextProps.style !== this.props.style) {
      state.backgroundColor = (nextProps.backgroundColor === 'inherit' ?
        StyleSheet.flatten(nextProps.style).backgroundColor :
        nextProps.backgroundColor);
    }

    if (nextProps.penColor !== this.props.penColor) {
      state.penColor = nextProps.penColor;
    }

    if (nextProps.penMinWidth !== this.props.penMinWidth) {
      state.penMinWidth = Math.max(isNaN(nextProps.penMinWidth) ? 0.5 : parseFloat(nextProps.penMinWidth), 0);
    }

    if (nextProps.penMaxWidth !== this.props.penMaxWidth) {
      state.penMaxWidth = Math.max(isNaN(nextProps.penMaxWidth) ? 2.5 : parseFloat(nextProps.penMaxWidth), 0);
    }

    if (nextProps.onChange !== this.props.onChange) {
      state.sendChangeEvents = typeof nextProps.onChange === 'function'
    }

    if (nextProps.pixelRatio !== this.props.pixelRatio) {
      state.pixelRatio = Math.max(isNaN(nextProps.pixelRatio) ? 0 : parseInt(nextProps.pixelRatio, 10), 0)
    }

    if (Object.keys(state).length === 0) return;

    const payload = {
      action: 'setState',
      state
    };
    this._webview.postMessage(JSON.stringify(payload));
  }

  render () {
    return (
      <WebView
        ref={(ref) => { this._webview = ref }}
        automaticallyAdjustContentInsets={false}
        onMessage={this._onMessage}
        source={this._source}
        scrollEnabled={false}
        javaScriptEnabled={true}
        style={this.props.style}
      />
    );
  }

  clear = () => {
    this._webview.postMessage(JSON.stringify({ action: 'clear' }));
  }

  isEmpty = async () => {
    if (!this._webview) {
      throw new Error('No webview');
    }

    return await new Promise((resolve, reject) => {
      this.setState(({ isEmptyResolver }) => {
        if (isEmptyResolver) {
          isEmptyResolver.reject(new Error('New request issued'));
        }
        return {
          isEmptyResolver: {
            resolve,
            reject
          }
        }
      });

      this._webview.postMessage(JSON.stringify({ action: 'isEmpty' }));
    })
  }

  getBase64Data = async () => {
    if (!this._webview) {
      throw new Error('No webview');
    }

    return await new Promise((resolve, reject) => {
      this.setState(({ getDataResolver }) => {
        if (getDataResolver) {
          getDataResolver.reject(new Error('New request issued'));
        }
        return {
          getDataResolver: {
            resolve,
            reject
          }
        }
      });

      this._webview.postMessage(JSON.stringify({ action: 'getData' }));
    })
  }

  _jsError = (err, args) => {
    if (!this.props.onError) return;
    this.props.onError({ err, details: args });
  }

  _finishedStroke = ({ base64DataUrl }) => {
    if (!this.props.onChange) return;
    this.props.onChange({ base64DataUrl });
  }

  _onMessage = (event) => {
    let data;
    try {
      data = JSON.parse(event.nativeEvent.data);
    } catch (err) {
      this._jsError(err);
      return;
    }

    if (!data) return;

    if (data['error']) {
      this._jsError(data['error'], data);
      return;
    }

    if (data['base64DataUrl']) {
      this._finishedStroke(data);
      return;
    }

    if (data['action']) {
      const action = data['action'];
      if (action === 'isEmpty') {
        this._resolveIsEmpty(data['value']);
      } else if (action === 'getData') {
        this._resolveGetData(data['value'])
      }
      return;
    }

    console.warn('data', data);
  }

  _resolveIsEmpty = (isEmpty) => {
    this.setState(({ isEmptyResolver }) => {
      isEmptyResolver && isEmptyResolver.resolve(isEmpty);

      return {
        isEmptyResolver: null
      };
    });
  }

  _resolveGetData = (data) => {
    this.setState(({ getDataResolver }) => {
      getDataResolver && getDataResolver.resolve(data);

      return {
        getDataResolver: null
      };
    });
  }
}
