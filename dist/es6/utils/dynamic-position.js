export const ANCHOR_POSITION = {
  top: {
    x: 0.5,
    y: 0
  },
  'top-left': {
    x: 0,
    y: 0
  },
  'top-right': {
    x: 1,
    y: 0
  },
  bottom: {
    x: 0.5,
    y: 1
  },
  'bottom-left': {
    x: 0,
    y: 1
  },
  'bottom-right': {
    x: 1,
    y: 1
  },
  left: {
    x: 0,
    y: 0.5
  },
  right: {
    x: 1,
    y: 0.5
  }
};
const ANCHOR_TYPES = Object.keys(ANCHOR_POSITION);
export function getDynamicPosition(_ref) {
  let x = _ref.x,
    y = _ref.y,
    width = _ref.width,
    height = _ref.height,
    selfWidth = _ref.selfWidth,
    selfHeight = _ref.selfHeight,
    anchor = _ref.anchor,
    _ref$padding = _ref.padding,
    padding = _ref$padding === void 0 ? 0 : _ref$padding;
  let _ANCHOR_POSITION$anch = ANCHOR_POSITION[anchor],
    anchorX = _ANCHOR_POSITION$anch.x,
    anchorY = _ANCHOR_POSITION$anch.y;
  let top = y - anchorY * selfHeight;
  let bottom = top + selfHeight;
  const yStep = 0.5;

  if (top < padding) {
    while (top < padding && anchorY >= yStep) {
      anchorY -= yStep;
      top += yStep * selfHeight;
    }
  } else if (bottom > height - padding) {
    while (bottom > height - padding && anchorY <= 1 - yStep) {
      anchorY += yStep;
      bottom -= yStep * selfHeight;
    }
  }

  let left = x - anchorX * selfWidth;
  let right = left + selfWidth;
  let xStep = 0.5;

  if (anchorY === 0.5) {
    anchorX = Math.floor(anchorX);
    xStep = 1;
  }

  if (left < padding) {
    while (left < padding && anchorX >= xStep) {
      anchorX -= xStep;
      left += xStep * selfWidth;
    }
  } else if (right > width - padding) {
    while (right > width - padding && anchorX <= 1 - xStep) {
      anchorX += xStep;
      right -= xStep * selfWidth;
    }
  }

  return (
    ANCHOR_TYPES.find(positionType => {
      const anchorPosition = ANCHOR_POSITION[positionType];
      return anchorPosition.x === anchorX && anchorPosition.y === anchorY;
    }) || anchor
  );
}
//# sourceMappingURL=dynamic-position.js.map
