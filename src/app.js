import React from 'react';
import { PixelRatio, StyleSheet, Text, View, PanResponder, Animated, TouchableOpacity } from 'react-native';

const REACTIONS = ["Terrible", "Bad", "Okay", "Good", "Great"];
const WIDTH = 320;
const DISTANCE =  WIDTH / REACTIONS.length;
const END = WIDTH - DISTANCE;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this._pan = new Animated.Value(0);
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (e, gestureState) => {
        this._pan.setOffset(this._pan._value);
        this._pan.setValue(0);
      },
      onPanResponderMove: Animated.event([null, {dx: this._pan}]),
      onPanResponderRelease: () => {
        this._pan.flattenOffset();

        let offset = Math.max(0, this._pan._value + 0);
        if (offset < 0) return this._pan.setValue(0);
        if (offset > END) return this._pan.setValue(END);

        const modulo = offset % DISTANCE;
        offset = (modulo >= DISTANCE/2) ? (offset+(DISTANCE-modulo)) : (offset-modulo);

        this.updatePan(offset);
      }
    });
  }

  updatePan(toValue) {
    Animated.spring(this._pan, { toValue, friction: 7 }).start();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.wrap}>
          <Text style={styles.welcome}>
            How was the help you received?
          </Text>
          
          <View style={styles.line} />

          <View style={styles.reactions}>
            {REACTIONS.map((reaction, idx) => {
              const u = idx * DISTANCE;
              let inputRange = [u-20, u, u+20];
              let scaleOutputRange = [1, 0.25, 1];
              let topOutputRange = [0, 10, 0];
              let colorOutputRange = ['#999', '#222', '#999'];

              if (u-20 < 0) {
                inputRange = [u, u+20];
                scaleOutputRange = [0.25, 1];
                topOutputRange = [10, 0];
                colorOutputRange = ['#222', '#999'];
              }

              if (u+20 > END) {
                inputRange = [u-20, u];
                scaleOutputRange = [1, 0.25];
                topOutputRange = [0, 10];
                colorOutputRange = ['#999', '#222'];
              }


              return (
                <TouchableOpacity onPress={() => this.updatePan(u)} activeOpacity={0.9} key={idx}>
                  <View style={styles.smileyWrap}>
                    <Animated.View style={[styles.smiley, {
                      transform: [{
                        scale: this._pan.interpolate({
                          inputRange,
                          outputRange: scaleOutputRange,
                          extrapolate: 'clamp',
                        })
                      }]
                    }]} />
                  </View>

                  <Animated.Text style={[styles.reactionText, {
                    top: this._pan.interpolate({
                      inputRange,
                      outputRange: topOutputRange,
                      extrapolate: 'clamp',
                    }),
                    color: this._pan.interpolate({
                      inputRange,
                      outputRange: colorOutputRange,
                      extrapolate: 'clamp',
                    })
                  }]}>
                    {reaction}
                  </Animated.Text>
                </TouchableOpacity>
              );
            })}
            <Animated.View {...this._panResponder.panHandlers} style={[styles.bigSmiley, {
              backgroundColor: this._pan.interpolate({
                inputRange: [0, 2*DISTANCE, END],
                outputRange: ['#ffb18d', '#ffd885', '#ffd885'],
              }),
              transform: [{
                translateX: this._pan.interpolate({
                  inputRange: [0, END],
                  outputRange: [0, END],
                  extrapolate: 'clamp',
                })
              }]
            }]} />
          </View>
        </View>
      </View>
    );
  }
}

const size = 42;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  wrap: {
    width: WIDTH,
    marginBottom: 50,
  },
  welcome: {
    fontSize: 18,
    textAlign: 'center',
    color: '#777',
    fontWeight: '600',
    fontFamily: 'Avenir',
    marginBottom: 50,
  },
  reactions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  smileyWrap: {
    width: DISTANCE,
    height: DISTANCE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smiley: {
    width: size,
    height: size,
    borderRadius: size/2,
    backgroundColor: '#c7ced3',
  },
  bigSmiley: {
    width: DISTANCE,
    height: DISTANCE,
    borderRadius: DISTANCE/2,
    backgroundColor: '#ffb18d',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  reactionText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#999',
    fontWeight: '400',
    fontFamily: 'Avenir',
    marginTop: 5,
  },
  line: {
    height: 4 / PixelRatio.get(),
    backgroundColor: '#eee',
    width: WIDTH - (DISTANCE-size),
    left: (DISTANCE-size) / 2,
    top: DISTANCE/2 + (2 / PixelRatio.get()),
  }
});