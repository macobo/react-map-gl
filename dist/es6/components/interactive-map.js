import _defineProperty from '@babel/runtime/helpers/esm/defineProperty';
import {PureComponent, createElement, createRef} from 'react';
import PropTypes from 'prop-types';
import StaticMap from './static-map';
import {MAPBOX_LIMITS} from '../utils/map-state';
import WebMercatorViewport from 'viewport-mercator-project';
import TransitionManager from '../utils/transition-manager';
import MapContext from './map-context';
import {EventManager} from 'mjolnir.js';
import MapController from '../utils/map-controller';
import deprecateWarn from '../utils/deprecate-warn';
const propTypes = Object.assign({}, StaticMap.propTypes, {
  maxZoom: PropTypes.number,
  minZoom: PropTypes.number,
  maxPitch: PropTypes.number,
  minPitch: PropTypes.number,
  onViewStateChange: PropTypes.func,
  onViewportChange: PropTypes.func,
  onInteractionStateChange: PropTypes.func,
  transitionDuration: PropTypes.number,
  transitionInterpolator: PropTypes.object,
  transitionInterruption: PropTypes.number,
  transitionEasing: PropTypes.func,
  onTransitionStart: PropTypes.func,
  onTransitionInterrupt: PropTypes.func,
  onTransitionEnd: PropTypes.func,
  scrollZoom: PropTypes.bool,
  dragPan: PropTypes.bool,
  dragRotate: PropTypes.bool,
  doubleClickZoom: PropTypes.bool,
  touchZoom: PropTypes.bool,
  touchRotate: PropTypes.bool,
  keyboard: PropTypes.bool,
  onHover: PropTypes.func,
  onClick: PropTypes.func,
  onDblClick: PropTypes.func,
  onContextMenu: PropTypes.func,
  onMouseDown: PropTypes.func,
  onMouseMove: PropTypes.func,
  onMouseUp: PropTypes.func,
  onTouchStart: PropTypes.func,
  onTouchMove: PropTypes.func,
  onTouchEnd: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onMouseOut: PropTypes.func,
  onWheel: PropTypes.func,
  touchAction: PropTypes.string,
  clickRadius: PropTypes.number,
  interactiveLayerIds: PropTypes.array,
  getCursor: PropTypes.func,
  controller: PropTypes.instanceOf(MapController)
});

const getDefaultCursor = _ref => {
  let isDragging = _ref.isDragging,
    isHovering = _ref.isHovering;
  return isDragging ? 'grabbing' : isHovering ? 'pointer' : 'grab';
};

const defaultProps = Object.assign(
  {},
  StaticMap.defaultProps,
  MAPBOX_LIMITS,
  TransitionManager.defaultProps,
  {
    onViewStateChange: null,
    onViewportChange: null,
    onClick: null,
    onNativeClick: null,
    onHover: null,
    onContextMenu: event => event.preventDefault(),
    scrollZoom: true,
    dragPan: true,
    dragRotate: true,
    doubleClickZoom: true,
    touchZoom: true,
    touchRotate: false,
    keyboard: true,
    touchAction: 'none',
    clickRadius: 0,
    getCursor: getDefaultCursor
  }
);
export default class InteractiveMap extends PureComponent {
  static supported() {
    return StaticMap.supported();
  }

  constructor(props) {
    var _this;

    super(props);
    _this = this;

    _defineProperty(this, 'state', {
      isLoaded: false,
      isDragging: false,
      isHovering: false
    });

    _defineProperty(this, '_controller', void 0);

    _defineProperty(this, '_eventManager', void 0);

    _defineProperty(this, '_interactiveContext', void 0);

    _defineProperty(this, '_width', 0);

    _defineProperty(this, '_height', 0);

    _defineProperty(this, '_eventCanvasRef', createRef());

    _defineProperty(this, '_staticMapRef', createRef());

    _defineProperty(this, 'getMap', () => {
      return this._staticMapRef.current ? this._staticMapRef.current.getMap() : null;
    });

    _defineProperty(this, 'queryRenderedFeatures', function(geometry) {
      let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      const map = _this.getMap();

      return map && map.queryRenderedFeatures(geometry, options);
    });

    _defineProperty(this, '_onInteractionStateChange', interactionState => {
      const _interactionState$isD = interactionState.isDragging,
        isDragging = _interactionState$isD === void 0 ? false : _interactionState$isD;

      if (isDragging !== this.state.isDragging) {
        this._updateInteractiveContext({
          isDragging
        });

        this.setState({
          isDragging
        });
      }

      const onInteractionStateChange = this.props.onInteractionStateChange;

      if (onInteractionStateChange) {
        onInteractionStateChange(interactionState);
      }
    });

    _defineProperty(this, '_onResize', _ref2 => {
      let width = _ref2.width,
        height = _ref2.height;
      this._width = width;
      this._height = height;

      this._setControllerProps(this.props);

      this.props.onResize({
        width,
        height
      });
    });

    _defineProperty(this, '_onViewportChange', (viewState, interactionState, oldViewState) => {
      const _this$props = this.props,
        onViewStateChange = _this$props.onViewStateChange,
        onViewportChange = _this$props.onViewportChange;

      if (onViewStateChange) {
        onViewStateChange({
          viewState,
          interactionState,
          oldViewState
        });
      }

      if (onViewportChange) {
        onViewportChange(viewState, interactionState, oldViewState);
      }
    });

    _defineProperty(this, '_onLoad', event => {
      this.setState({
        isLoaded: true
      });
      this.props.onLoad(event);
    });

    _defineProperty(this, '_onEvent', (callbackName, event) => {
      const func = this.props[callbackName];

      if (func) {
        func(this._normalizeEvent(event));
      }
    });

    _defineProperty(this, '_onPointerDown', event => {
      switch (event.pointerType) {
        case 'touch':
          this._onEvent('onTouchStart', event);

          break;

        default:
          this._onEvent('onMouseDown', event);
      }
    });

    _defineProperty(this, '_onPointerUp', event => {
      switch (event.pointerType) {
        case 'touch':
          this._onEvent('onTouchEnd', event);

          break;

        default:
          this._onEvent('onMouseUp', event);
      }
    });

    _defineProperty(this, '_onPointerMove', event => {
      switch (event.pointerType) {
        case 'touch':
          this._onEvent('onTouchMove', event);

          break;

        default:
          this._onEvent('onMouseMove', event);
      }

      if (!this.state.isDragging) {
        const _this$props2 = this.props,
          onHover = _this$props2.onHover,
          interactiveLayerIds = _this$props2.interactiveLayerIds;
        let features;
        event = this._normalizeEvent(event);

        if (this.state.isLoaded && (interactiveLayerIds || onHover)) {
          features = this._getFeatures({
            pos: event.point,
            radius: this.props.clickRadius
          });
        }

        if (onHover) {
          event.features = features;
          onHover(event);
        }

        const isHovering = Boolean(interactiveLayerIds && features && features.length > 0);
        const isEntering = isHovering && !this.state.isHovering;
        const isExiting = !isHovering && this.state.isHovering;

        if (isEntering) {
          this._onEvent('onMouseEnter', event);
        }

        if (isExiting) {
          this._onEvent('onMouseLeave', event);
        }

        if (isEntering || isExiting) {
          this.setState({
            isHovering
          });
        }
      }
    });

    _defineProperty(this, '_onClick', event => {
      const _this$props3 = this.props,
        onClick = _this$props3.onClick,
        onNativeClick = _this$props3.onNativeClick,
        onDblClick = _this$props3.onDblClick,
        doubleClickZoom = _this$props3.doubleClickZoom;
      let callbacks = [];
      const isDoubleClickEnabled = onDblClick || doubleClickZoom;

      switch (event.type) {
        case 'anyclick':
          callbacks.push(onNativeClick);

          if (!isDoubleClickEnabled) {
            callbacks.push(onClick);
          }

          break;

        case 'click':
          if (isDoubleClickEnabled) {
            callbacks.push(onClick);
          }

          break;

        default:
      }

      callbacks = callbacks.filter(Boolean);

      if (callbacks.length) {
        event = this._normalizeEvent(event);
        event.features = this._getFeatures({
          pos: event.point,
          radius: this.props.clickRadius
        });
        callbacks.forEach(cb => cb(event));
      }
    });

    deprecateWarn(props);
    this._controller = props.controller || new MapController();
    this._eventManager = new EventManager(null, {
      touchAction: props.touchAction
    });

    this._updateInteractiveContext({
      isDragging: false,
      eventManager: this._eventManager
    });
  }

  componentDidMount() {
    const eventManager = this._eventManager;
    const mapContainer = this._eventCanvasRef.current;
    eventManager.setElement(mapContainer);
    eventManager.on({
      pointerdown: this._onPointerDown,
      pointermove: this._onPointerMove,
      pointerup: this._onPointerUp,
      pointerleave: this._onEvent.bind(this, 'onMouseOut'),
      click: this._onClick,
      anyclick: this._onClick,
      dblclick: this._onEvent.bind(this, 'onDblClick'),
      wheel: this._onEvent.bind(this, 'onWheel'),
      contextmenu: this._onEvent.bind(this, 'onContextMenu')
    });

    this._setControllerProps(this.props);

    this._updateInteractiveContext({
      mapContainer
    });
  }

  componentWillUnmount() {
    this._eventManager.destroy();
  }

  _setControllerProps(props) {
    props = Object.assign({}, props, props.viewState, {
      isInteractive: Boolean(props.onViewStateChange || props.onViewportChange),
      onViewportChange: this._onViewportChange,
      onStateChange: this._onInteractionStateChange,
      eventManager: this._eventManager,
      width: this._width,
      height: this._height
    });

    this._controller.setOptions(props);

    const context = this._interactiveContext;
    context.onViewportChange = props.onViewportChange;
    context.onViewStateChange = props.onViewStateChange;
  }

  _getFeatures(_ref3) {
    let pos = _ref3.pos,
      radius = _ref3.radius;
    let features;
    const queryParams = {};
    const map = this.getMap();

    if (this.props.interactiveLayerIds) {
      queryParams.layers = this.props.interactiveLayerIds;
    }

    if (radius) {
      const size = radius;
      const bbox = [[pos[0] - size, pos[1] + size], [pos[0] + size, pos[1] - size]];
      features = map && map.queryRenderedFeatures(bbox, queryParams);
    } else {
      features = map && map.queryRenderedFeatures(pos, queryParams);
    }

    return features;
  }

  _updateInteractiveContext(updatedContext) {
    this._interactiveContext = Object.assign({}, this._interactiveContext, updatedContext);
  }

  _normalizeEvent(event) {
    if (event.lngLat) {
      return event;
    }

    const _event$offsetCenter = event.offsetCenter,
      x = _event$offsetCenter.x,
      y = _event$offsetCenter.y;
    const pos = [x, y];
    const viewport = new WebMercatorViewport(
      Object.assign({}, this.props, {
        width: this._width,
        height: this._height
      })
    );
    event.point = pos;
    event.lngLat = viewport.unproject(pos);
    return event;
  }

  render() {
    this._setControllerProps(this.props);

    const _this$props4 = this.props,
      width = _this$props4.width,
      height = _this$props4.height,
      style = _this$props4.style,
      getCursor = _this$props4.getCursor;
    const eventCanvasStyle = Object.assign(
      {
        position: 'relative'
      },
      style,
      {
        width,
        height,
        cursor: getCursor(this.state)
      }
    );
    return createElement(
      MapContext.Provider,
      {
        value: this._interactiveContext
      },
      createElement(
        'div',
        {
          key: 'event-canvas',
          ref: this._eventCanvasRef,
          style: eventCanvasStyle
        },
        createElement(
          StaticMap,
          Object.assign({}, this.props, {
            width: '100%',
            height: '100%',
            style: null,
            onResize: this._onResize,
            onLoad: this._onLoad,
            ref: this._staticMapRef,
            children: this.props.children
          })
        )
      )
    );
  }
}

_defineProperty(InteractiveMap, 'propTypes', propTypes);

_defineProperty(InteractiveMap, 'defaultProps', defaultProps);
//# sourceMappingURL=interactive-map.js.map
