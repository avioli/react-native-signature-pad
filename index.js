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
    backgroundColor: PropTypes.string,
  };

  static defaultProps = {
    style: {},
    backgroundColor: 'rgba(0,0,0,0)'
  };

  constructor (props) {
    super(props);

    this.state = {};

    let {
      style,
      backgroundColor,
      penColor,
      dataURL
    } = props;

    if (backgroundColor === 'inherit') {
      backgroundColor = StyleSheet.flatten(style);
    }

    var injectedJavaScript = injectedSignaturePad + injectedApplication({
      penColor,
      backgroundColor,
      dataURL
    });

    // We don't use WebView's injectedJavaScript because on Android, the WebView
    // re-injects the JavaScript upon every url change. Given that we use url
    // changes to communicate signature changes to the React Native app, the JS
    // is re-injected every time a stroke is drawn.
    this.source = {
      html: htmlContent(injectedJavaScript)
    }; 
  }

  render () {
    return (
      <WebView
        automaticallyAdjustContentInsets={false}
        onMessage={this._onMessage}
        source={this.source}
        scrollEnabled={false}
        javaScriptEnabled={true}
        style={this.props.style}
      />
    )
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

    // NOTE: catch-all
    console.warn('Signature-pad: data', data);
  }

  _jsError = (err, args) => {
    if (!this.props.onError) return;
    this.props.onError({ err, details: args });
  }

  _finishedStroke = ({ base64DataUrl }) => {
    if (!this.props.onChange) return;
    this.props.onChange({ base64DataUrl });
  }
}
