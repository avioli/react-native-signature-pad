# react-native-signature-pad
React Native wrapper around @[szimek's](https://github.com/szimek) HTML5 Canvas based [Signature Pad](https://github.com/szimek/signature_pad)

- Supports Android and iOS
- Pure JavaScript implementation with no native dependencies
- Tested with RN 0.20
- Can easily be rotated using the "transform" style
- Generates a base64 encoded png image of the signature

## Demo

![SignaturePadDemo](https://cloud.githubusercontent.com/assets/7293984/13297035/303fefc6-dae5-11e5-99e8-edb8335633b5.gif) ![SignaturePadDemoAndroid](https://cloud.githubusercontent.com/assets/7293984/13299954/72bc3bf4-daf2-11e5-8606-388c05c26d6d.gif)

## Installation

```sh
npm install --save react-native-signature-pad
```

## Example

```js
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import SignaturePad from 'react-native-signature-pad';

export default class Demo extends Component {
  render () {
    return (
      <View style={styles.flex1}>
        <SignaturePad 
          onError={this._signaturePadError}
          onChange={this._signaturePadChange}
          style={styles.pad}
        />
      </View>
    )
  }

  _signaturePadError = (error) => {
    console.error(error);
  }

  _signaturePadChange = ({ base64DataUrl }) => {
    console.log('Got new signature:', base64DataUrl);
  }
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  pad: { flex: 1, backgroundColor: 'white' }
});
```

```js
import React, { Component } from 'react';
import { View, StyleSheet, Alert } from 'react-native';

import SignaturePad from 'react-native-signature-pad';

export default class Demo extends Component {
  render () {
    return (
      <View style={styles.flex1}>
        <SignaturePad 
          ref={(ref) => { this._pad = ref }}
          onError={this._signaturePadError}
          style={styles.pad}
        />
        <Button
          onPress={this._getSig}
          title='Get sig'
        />
      </View>
    )
  }

  _signaturePadError = (error) => {
    console.error(error);
  }

  _getSig = async () => {
    if (!this._pad) return;

    try {
      const isEmpty = await this._pad.isEmpty()
      if (isEmpty) {
        Alert.alert('Signature is empty!')
        return
      }
    } catch (err) {
      console.error(err)
      return
    }

    let base64DataUrl
    try {
      base64DataUrl = await this._pad.getBase64Data()
    } catch (err) {
      console.error(err)
      return
    }

    console.log('Got new signature:', base64DataUrl);
  }
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  pad: { width: 600, height: 300, backgroundColor: '#eee' }
});
```
