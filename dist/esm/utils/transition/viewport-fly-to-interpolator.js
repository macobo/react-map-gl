import _classCallCheck from '@babel/runtime/helpers/esm/classCallCheck';
import _createClass from '@babel/runtime/helpers/esm/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/esm/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/esm/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/esm/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/esm/inherits';
import _defineProperty from '@babel/runtime/helpers/esm/defineProperty';
import assert from '../assert';
import TransitionInterpolator from './transition-interpolator';
import {flyToViewport} from 'viewport-mercator-project';
import {isValid, getEndValueByShortestPath} from './transition-utils';
import {lerp} from '../math-utils';
var VIEWPORT_TRANSITION_PROPS = ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'];
var REQUIRED_PROPS = ['latitude', 'longitude', 'zoom', 'width', 'height'];
var LINEARLY_INTERPOLATED_PROPS = ['bearing', 'pitch'];

var ViewportFlyToInterpolator = (function(_TransitionInterpolat) {
  _inherits(ViewportFlyToInterpolator, _TransitionInterpolat);

  function ViewportFlyToInterpolator() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, ViewportFlyToInterpolator);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(
      this,
      (_getPrototypeOf2 = _getPrototypeOf(ViewportFlyToInterpolator)).call.apply(
        _getPrototypeOf2,
        [this].concat(args)
      )
    );

    _defineProperty(_assertThisInitialized(_this), 'propNames', VIEWPORT_TRANSITION_PROPS);

    return _this;
  }

  _createClass(ViewportFlyToInterpolator, [
    {
      key: 'initializeProps',
      value: function initializeProps(startProps, endProps) {
        var startViewportProps = {};
        var endViewportProps = {};

        for (var _i = 0, _REQUIRED_PROPS = REQUIRED_PROPS; _i < _REQUIRED_PROPS.length; _i++) {
          var key = _REQUIRED_PROPS[_i];
          var startValue = startProps[key];
          var endValue = endProps[key];
          assert(
            isValid(startValue) && isValid(endValue),
            ''.concat(key, ' must be supplied for transition')
          );
          startViewportProps[key] = startValue;
          endViewportProps[key] = getEndValueByShortestPath(key, startValue, endValue);
        }

        for (
          var _i2 = 0, _LINEARLY_INTERPOLATE = LINEARLY_INTERPOLATED_PROPS;
          _i2 < _LINEARLY_INTERPOLATE.length;
          _i2++
        ) {
          var _key2 = _LINEARLY_INTERPOLATE[_i2];

          var _startValue = startProps[_key2] || 0;

          var _endValue = endProps[_key2] || 0;

          startViewportProps[_key2] = _startValue;
          endViewportProps[_key2] = getEndValueByShortestPath(_key2, _startValue, _endValue);
        }

        return {
          start: startViewportProps,
          end: endViewportProps
        };
      }
    },
    {
      key: 'interpolateProps',
      value: function interpolateProps(startProps, endProps, t) {
        var viewport = flyToViewport(startProps, endProps, t);

        for (
          var _i3 = 0, _LINEARLY_INTERPOLATE2 = LINEARLY_INTERPOLATED_PROPS;
          _i3 < _LINEARLY_INTERPOLATE2.length;
          _i3++
        ) {
          var key = _LINEARLY_INTERPOLATE2[_i3];
          viewport[key] = lerp(startProps[key], endProps[key], t);
        }

        return viewport;
      }
    }
  ]);

  return ViewportFlyToInterpolator;
})(TransitionInterpolator);

export {ViewportFlyToInterpolator as default};
//# sourceMappingURL=viewport-fly-to-interpolator.js.map
