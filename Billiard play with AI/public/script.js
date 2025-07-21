"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
console.clear();
noise.seed(Math.random() * 1000);
var ASSET_PREFIX = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/111863/';
var PI = Math.PI,
  PI2 = PI * 2;
var
  // module aliases
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  Composite = Matter.Composite,
  Constraint = Matter.Constraint,
  Engine = Matter.Engine,
  Events = Matter.Events,
  Mouse = Matter.Mouse,
  MouseConstraint = Matter.MouseConstraint,
  Render = Matter.Render,
  Vector = Matter.Vector,
  World = Matter.World;
var COLORS = {
  white: 'white',
  red: '#F44336',
  black: '#212121',
  purple: '#9C27B0',
  blue: '#2196F3',
  green: '#8bc34a',
  yellow: '#FFC107',
  orange: '#FF9800',
  brown: '#795548',
  felt: '#757575',
  pocket: '#121212',
  frame: '#3E2723'
};
var WIREFRAMES = false,
  INCH = 12,
  FOOT = INCH * 12,
  BALL_DI = 2.4375 * INCH,
  BALL_RAD = BALL_DI / 2,
  // POCKET_DI = 3.5 * INCH,
  POCKET_DI = 4.5 * INCH,
  POCKET_RAD = POCKET_DI / 2,
  WALL_DI = 5 * INCH,
  WALL_RAD = WALL_DI / 2,
  // TABLE_W = 9 * FOOT,
  TABLE_W = 8 * FOOT,
  // TABLE_H = 4.5 * FOOT,
  TABLE_H = 3.5 * FOOT,
  RETURN_H = BALL_DI * 1.75,
  VIEW_W = WALL_DI * 2 + TABLE_W,
  VIEW_H = WALL_DI * 2 + TABLE_H + RETURN_H;
var Ball = /*#__PURE__*/function () {
  function Ball(_ref) {
    var number = _ref.number,
      cueball = _ref.cueball;
    _classCallCheck(this, Ball);
    this.cue = number === 0;
    this.eight = number === 8;
    this.stripes = number > 8;
    this.solids = number > 0 && number < 8;
    this.number = number;
    this.diameter = BALL_DI;
    this.pocketed = false;
    this.setInitialCoordinates();
    this.setRender();
    this.setColor();
    this.cueball = cueball;
    this.build();
  }
  return _createClass(Ball, [{
    key: "fromCueball",
    get: function get() {
      return {
        angle: Vector.angle(this.body.position, this.cueball.body.position)
      };
    }
  }, {
    key: "setInitialCoordinates",
    value: function setInitialCoordinates() {
      var pos = Ball.positions[this.number].map(function (p) {
        return rel(p);
      });
      this.x = pos[0];
      this.y = pos[1];
    }
  }, {
    key: "setColor",
    value: function setColor() {
      this.color = COLORS[['white', 'yellow', 'blue', 'red', 'purple', 'orange', 'green', 'brown', 'black', 'yellow', 'blue', 'red', 'purple', 'orange', 'green', 'brown'][this.number]];
    }
  }, {
    key: "setRender",
    value: function setRender() {
      this.render = {
        fillStyle: 'transparent',
        lineWidth: 0
      };
    }
  }, {
    key: "enable",
    value: function enable() {
      Body.setStatic(this.body, false);
      this.pocketed = false;
      this.body.isSensor = false;
    }
  }, {
    key: "disable",
    value: function disable() {
      if (!this.cue) Body.setStatic(this.body, true);
      this.pocketed = true;
      this.body.isSensor = true;
    }
  }, {
    key: "rest",
    value: function rest() {
      this.setVelocity({
        x: 0,
        y: 0
      });
      Body.setPosition(this.body, this.body.position);
      Body.update(this.body, 0, 0, 0);
    }
  }, {
    key: "reset",
    value: function reset() {
      this.enable();
      this.setVelocity({
        x: 0,
        y: 0
      });
      Body.setPosition(this.body, {
        x: this.x,
        y: this.y
      });
    }
  }, {
    key: "pocket",
    value: function pocket(_ref2) {
      var x = _ref2.x,
        y = _ref2.y;
      this.disable();
      Body.setVelocity(this.body, {
        x: 0,
        y: 0
      });
      Body.setAngle(this.body, 0);
      Body.setPosition(this.body, {
        x: x,
        y: y
      });
      Body.update(this.body, 0, 0, 0);
    }
  }, {
    key: "setVelocity",
    value: function setVelocity(_ref3) {
      var x = _ref3.x,
        y = _ref3.y;
      Body.setVelocity(this.body, {
        x: x,
        y: y
      });
    }
  }, {
    key: "build",
    value: function build() {
      this.body = Bodies.circle(this.x, this.y, this.diameter / 2, {
        render: this.render,
        label: 'ball',
        restitution: 0.9,
        friction: 0.001,
        density: this.cue ? 0.00021 : 0.0002
      });
    }
  }], [{
    key: "positions",
    get: function get() {
      var radians60 = 60 * (Math.PI / 180),
        radians60Sin = Math.sin(radians60),
        radians60Cos = Math.cos(radians60);
      var postStartX = TABLE_W - TABLE_W / 4,
        postStartY = TABLE_H / 2,
        pos1 = [postStartX, postStartY],
        pos2 = [postStartX + radians60Sin * BALL_DI, postStartY - radians60Cos * BALL_DI],
        pos3 = [postStartX + radians60Sin * (BALL_DI * 2), postStartY - radians60Cos * (BALL_DI * 2)],
        pos4 = [postStartX + radians60Sin * (BALL_DI * 3), postStartY - radians60Cos * (BALL_DI * 3)],
        pos5 = [postStartX + radians60Sin * (BALL_DI * 4), postStartY - radians60Cos * (BALL_DI * 4)];
      return [[
      // cue
      TABLE_W / 4, TABLE_H / 2], pos1,
      // 1
      pos2,
      // 2
      pos3,
      // 3
      pos4,
      // 4
      [
      // 5
      pos1[0] + radians60Sin * (BALL_DI * 4), pos1[1] + radians60Cos * (BALL_DI * 4)], [
      // 6
      pos4[0] + radians60Sin * BALL_DI, pos4[1] + radians60Cos * BALL_DI], [
      // 7
      pos2[0] + radians60Sin * BALL_DI * 2, pos2[1] + radians60Cos * BALL_DI * 2], [
      // 8
      pos2[0] + radians60Sin * BALL_DI, pos2[1] + radians60Cos * BALL_DI], [
      // 9
      pos1[0] + radians60Sin * BALL_DI, pos1[1] + radians60Cos * BALL_DI], [
      // 10
      pos1[0] + radians60Sin * (BALL_DI * 2), pos1[1] + radians60Cos * (BALL_DI * 2)], [
      // 11
      pos1[0] + radians60Sin * (BALL_DI * 3), pos1[1] + radians60Cos * (BALL_DI * 3)], pos5,
      // 12
      [
      // 13
      pos2[0] + radians60Sin * (BALL_DI * 3), pos2[1] + radians60Cos * (BALL_DI * 3)], [
      // 14
      pos3[0] + radians60Sin * BALL_DI, pos3[1] + radians60Cos * BALL_DI], [
      // 15
      pos3[0] + radians60Sin * (BALL_DI * 2), pos3[1] + radians60Cos * (BALL_DI * 2)]];
    }
  }]);
}();
var Table = /*#__PURE__*/function () {
  function Table() {
    _classCallCheck(this, Table);
    this.width = TABLE_W;
    this.height = TABLE_H;
    this.hypot = Math.hypot(TABLE_W, TABLE_H);
    this.build();
  }
  return _createClass(Table, [{
    key: "build",
    value: function build() {
      this.buildBounds();
      this.buildWall();
      this.buildPockets();
    }
  }, {
    key: "buildBounds",
    value: function buildBounds() {
      var boundsOptions = {
        isStatic: true,
        render: {
          fillStyle: 'red'
        },
        label: 'bounds',
        friction: 1,
        restitution: 0,
        density: 1
      };
      var hw = VIEW_W + VIEW_H * 2;
      var vw = VIEW_H;
      var h = VIEW_H;
      this.bounds = [
      // Top
      Bodies.rectangle(VIEW_W * 0.5, h * -0.5, hw, h, boundsOptions),
      // Bottom
      Bodies.rectangle(VIEW_W * 0.5, VIEW_H + h * 0.5, hw, h, boundsOptions),
      // Left
      Bodies.rectangle(vw * -0.5, VIEW_H * 0.5, vw, h, boundsOptions),
      // Left
      Bodies.rectangle(VIEW_W + vw * 0.5, VIEW_H * 0.5, vw, h, boundsOptions)];
    }
  }, {
    key: "buildWall",
    value: function buildWall() {
      var wallOptions = {
        isStatic: true,
        render: {
          fillStyle: 'transparent'
        },
        label: 'wall',
        friction: 0.0025,
        restitution: 0.6,
        density: 0.125,
        slop: 0.5
      };
      var quarterW = (TABLE_W - POCKET_RAD * 2) / 4;
      var halfH = (TABLE_H - POCKET_RAD) / 2;
      var vertices = Table.wallVertices;
      var horizontalBlock = {
        width: WALL_DI * 1.5,
        height: WALL_DI - POCKET_RAD
      };
      var verticalBlock = {
        width: WALL_DI - POCKET_RAD,
        height: WALL_DI * 1.5
      };
      var middleBlock = {
        width: WALL_DI - POCKET_RAD,
        height: WALL_DI - POCKET_RAD
      };
      var horTY = horizontalBlock.height / 2,
        horBY = rel(TABLE_H + WALL_DI - horizontalBlock.height / 2),
        horLX = horizontalBlock.width / 2,
        horRX = rel(TABLE_W + WALL_DI - horizontalBlock.width / 2),
        verTY = verticalBlock.height / 2,
        verBY = rel(TABLE_H + WALL_DI - verticalBlock.height / 2),
        verLX = verticalBlock.width / 2,
        verRX = rel(TABLE_W + WALL_DI - verticalBlock.width / 2);
      this.walls = [
      // Bottom Left
      Bodies.fromVertices(rel(TABLE_W / 4), rel(TABLE_H + WALL_RAD), vertices.bottom, wallOptions),
      // Bottom Right
      Bodies.fromVertices(rel(TABLE_W / 4 + TABLE_W / 2), rel(TABLE_H + WALL_RAD), vertices.bottom, wallOptions),
      // Top Left
      Bodies.fromVertices(rel(TABLE_W / 4), rel(0 - WALL_RAD), vertices.top, wallOptions),
      // Top Right
      Bodies.fromVertices(rel(TABLE_W / 4 + TABLE_W / 2), rel(0 - WALL_RAD), vertices.top, wallOptions),
      // Left
      Bodies.fromVertices(rel(0 - WALL_RAD), rel(TABLE_H / 2), vertices.left, wallOptions),
      // Right
      Bodies.fromVertices(rel(TABLE_W + WALL_RAD), rel(TABLE_H / 2), vertices.right, wallOptions),
      // TL horizontal
      Bodies.rectangle(horLX, horTY, horizontalBlock.width, horizontalBlock.height, wallOptions),
      // TR horizontal
      Bodies.rectangle(horRX, horTY, horizontalBlock.width, horizontalBlock.height, wallOptions),
      // BL horizontal
      Bodies.rectangle(horLX, horBY, horizontalBlock.width, horizontalBlock.height, wallOptions),
      // BR horizontal
      Bodies.rectangle(horRX, horBY, horizontalBlock.width, horizontalBlock.height, wallOptions),
      // TL vertical
      Bodies.rectangle(verLX, verTY, verticalBlock.width, verticalBlock.height, wallOptions),
      // TR vertical
      Bodies.rectangle(verRX, verTY, verticalBlock.width, verticalBlock.height, wallOptions),
      // BL vertical
      Bodies.rectangle(verLX, verBY, verticalBlock.width, verticalBlock.height, wallOptions),
      // BR vertical
      Bodies.rectangle(verRX, verBY, verticalBlock.width, verticalBlock.height, wallOptions),
      // B middle
      Bodies.rectangle(rel(TABLE_W / 2), horBY, middleBlock.width, middleBlock.height, wallOptions),
      // T middle
      Bodies.rectangle(rel(TABLE_W / 2), horTY, middleBlock.width, middleBlock.height, wallOptions)];
    }
  }, {
    key: "buildPockets",
    value: function buildPockets() {
      var pocketOptions = {
        render: {
          fillStyle: 'transparent',
          lineWidth: 0
        },
        label: 'pocket',
        isSensor: true
      };
      var pocketTopY = WALL_DI * 0.75;
      var pocketBottomY = TABLE_H + WALL_DI * 1.25;
      var pocketLeftX = WALL_DI * 0.75;
      var pocketRightX = TABLE_W + WALL_DI * 1.25;
      this.pockets = [Bodies.circle(pocketLeftX, pocketTopY, POCKET_RAD, pocketOptions), Bodies.circle(TABLE_W / 2 + WALL_DI, pocketTopY, POCKET_RAD, pocketOptions), Bodies.circle(pocketRightX, pocketTopY, POCKET_RAD, pocketOptions), Bodies.circle(pocketLeftX, pocketBottomY, POCKET_RAD, pocketOptions), Bodies.circle(TABLE_W / 2 + WALL_DI, pocketBottomY, POCKET_RAD, pocketOptions), Bodies.circle(pocketRightX, pocketBottomY, POCKET_RAD, pocketOptions)];
    }
  }], [{
    key: "wallVertices",
    get: function get() {
      var obj = {};
      var quarterW = (TABLE_W - POCKET_RAD * 2) / 4;
      var halfH = (TABLE_H - POCKET_RAD) / 2;
      obj.bottom = [{
        x: -quarterW,
        y: WALL_DI
      }, {
        x: quarterW,
        y: WALL_DI
      }, {
        x: quarterW,
        y: POCKET_RAD
      }, {
        x: quarterW - POCKET_RAD,
        y: 0
      }, {
        x: -quarterW + POCKET_RAD,
        y: 0
      }, {
        x: -quarterW,
        y: POCKET_RAD
      }];
      obj.top = [{
        x: -quarterW,
        y: 0
      }, {
        x: quarterW,
        y: 0
      }, {
        x: quarterW,
        y: WALL_DI - POCKET_RAD
      }, {
        x: quarterW - POCKET_RAD,
        y: WALL_DI
      }, {
        x: -quarterW + POCKET_RAD,
        y: WALL_DI
      }, {
        x: -quarterW,
        y: WALL_DI - POCKET_RAD
      }];
      obj.left = [{
        y: -halfH,
        x: 0
      }, {
        y: halfH,
        x: 0
      }, {
        y: halfH,
        x: WALL_DI - POCKET_RAD
      }, {
        y: halfH - POCKET_RAD,
        x: WALL_DI
      }, {
        y: -halfH + POCKET_RAD,
        x: WALL_DI
      }, {
        y: -halfH,
        x: WALL_DI - POCKET_RAD
      }];
      obj.right = [{
        y: -halfH,
        x: WALL_DI
      }, {
        y: halfH,
        x: WALL_DI
      }, {
        y: halfH,
        x: POCKET_RAD
      }, {
        y: halfH - POCKET_RAD,
        x: 0
      }, {
        y: -halfH + POCKET_RAD,
        x: 0
      }, {
        y: -halfH,
        x: POCKET_RAD
      }];
      return obj;
    }
  }]);
}();
var Machine = /*#__PURE__*/function () {
  function Machine() {
    _classCallCheck(this, Machine);
    this.clock = 0;
    this.fireCount = 0;
    this.x = rel(TABLE_W * 0.5);
    this.y = rel(TABLE_H * 0.5);
  }
  return _createClass(Machine, [{
    key: "reset",
    value: function reset(_ref4, placingCueball) {
      var x = _ref4.x,
        y = _ref4.y;
      if (placingCueball) {
        this.x = rel(TABLE_W * 0.5);
        this.y = rel(TABLE_H * 0.5);
      } else {
        this.x = x;
        this.y = y;
      }
      this.power = 0;
    }
  }, {
    key: "fire",
    value: function fire() {
      if (this.fireCount > 100) {
        this.fireCount = 0;
        return true;
      }
      var shouldFire = Math.random() < 0.0125;
      if (shouldFire) this.fireCount = 0;else this.fireCount++;
      return shouldFire;
    }
  }, {
    key: "tick",
    value: function tick() {
      var n1 = noise.perlin2(this.clock, this.clock);
      var n2 = noise.perlin2(this.clock + 100, this.clock + 100);
      var n3 = noise.perlin2(this.clock + 1000, this.clock + 1000);
      var max = 16;
      this.x = Math.max(Math.min(this.x + n1 * max, rel(TABLE_W)), rel(0));
      this.y = Math.max(Math.min(this.y + n2 * max, rel(TABLE_H)), rel(0));
      this.clock += 0.02;
      this.power = (n3 + 1) * 0.5 * 0.8 + 0.2;
    }
  }]);
}();
var Player = /*#__PURE__*/function () {
  function Player(number) {
    _classCallCheck(this, Player);
    this.number = number;
    this.stripes = false;
    this.solids = false;
    this.points = 0;
  }
  return _createClass(Player, [{
    key: "onEight",
    get: function get() {
      return this.points === 7;
    }
  }, {
    key: "winner",
    get: function get() {
      return this.points === 8;
    }
  }, {
    key: "denomText",
    get: function get() {
      if (this.stripes) return 'Stripes';
      if (this.solids) return 'Solids';
      return '';
    }
  }, {
    key: "invalidContactText",
    get: function get() {
      if (this.stripes) return "".concat(this.nameText, " did not hit a Stripe first.");
      if (this.solids) return "".concat(this.nameText, " did not hit a Solid first.");
    }
  }, {
    key: "nameText",
    get: function get() {
      if (this.number === 1) return '<strong>You</strong>';
      return '<strong>AI</strong>';
    }
  }, {
    key: "eightText",
    get: function get() {
      return "".concat(this.nameText, " Pocketed the Eight.");
    }
  }, {
    key: "scratchText",
    get: function get() {
      return "".concat(this.nameText, " Scratched!");
    }
  }, {
    key: "turnText",
    get: function get() {
      var txt = this.number === 1 ? 'Your' : 'AI\'s';
      txt = "<strong>".concat(txt, "</strong>");
      txt += ' Turn ';
      if (this.stripes || this.solids) txt += "(".concat(this.denomText, ")");
      return txt;
    }
  }, {
    key: "winText",
    get: function get() {
      if (this.number === 1) return '<strong>You</strong> Win!';
      return '<strong>AI</strong> Wins!';
    }
  }, {
    key: "teamText",
    get: function get() {
      return "".concat(this.nameText, " is ").concat(this.denomText);
    }
  }, {
    key: "assign",
    value: function assign(stripes) {
      stripes ? this.stripes = true : this.solids = true;
    }
  }, {
    key: "score",
    value: function score(count) {
      this.points += count;
    }
  }]);
}();
var Canvas = /*#__PURE__*/function () {
  function Canvas(_ref5) {
    var context = _ref5.context;
    _classCallCheck(this, Canvas);
    this.context = context;
  }
  return _createClass(Canvas, [{
    key: "drawCrosshair",
    value: function drawCrosshair(_ref6) {
      var x = _ref6.x,
        y = _ref6.y;
      this.context.fillStyle = 'rgba(255, 255, 255, 0.25)';
      this.context.beginPath();
      this.context.arc(x, y, BALL_RAD, 0, PI2, false);
      this.context.fill();
    }
  }, {
    key: "drawMovingCrosshair",
    value: function drawMovingCrosshair(_ref7) {
      var x = _ref7.x,
        y = _ref7.y;
      var rad = BALL_RAD - 2;
      this.context.strokeStyle = COLORS.red;
      this.context.lineWidth = 4;
      this.context.translate(x, y);
      this.context.rotate(-PI * 0.25);
      // circle
      this.context.beginPath();
      this.context.arc(0, 0, rad, 0, PI2, false);
      this.context.stroke();
      // slash
      this.context.beginPath();
      this.context.moveTo(0, (BALL_RAD + 2) * -0.5);
      this.context.lineTo(0, (BALL_RAD + 2) * 0.5);
      this.context.stroke();
      // rotating back
      this.context.rotate(PI * 0.25);
      this.context.translate(-x, -y);
    }
  }, {
    key: "drawTable",
    value: function drawTable(_ref8) {
      var wallBodies = _ref8.wallBodies,
        pocketBodies = _ref8.pocketBodies;
      this.drawSlate();
      this.drawWall(wallBodies);
      this.drawReturn();
      this.drawPockets(pocketBodies);
      this.drawPoints();
    }
  }, {
    key: "drawSlate",
    value: function drawSlate() {
      var grad = this.context.createRadialGradient(VIEW_W * 0.5, (VIEW_H - RETURN_H) * 0.5, TABLE_H * 0.75 * 0.125, VIEW_W * 0.5, (VIEW_H - RETURN_H) * 0.5, TABLE_H * 0.75 * 1.5);
      grad.addColorStop(0, 'rgba(255,255,255,0.05)');
      grad.addColorStop(0.25, 'rgba(255,255,255,0.05)');
      grad.addColorStop(1, 'rgba(255,255,255,0.15)');
      this.context.fillStyle = COLORS.felt;
      this.context.fillRect(WALL_RAD, WALL_RAD, TABLE_W + WALL_DI, TABLE_H + WALL_DI);
      this.context.fillStyle = grad;
      this.context.fillRect(WALL_RAD, WALL_RAD, TABLE_W + WALL_DI, TABLE_H + WALL_DI);
    }
  }, {
    key: "drawReturn",
    value: function drawReturn() {
      var gutter = (RETURN_H - BALL_DI * 1.2) * 0.5;
      this.context.fillStyle = COLORS.pocket;
      this.context.fillRect(gutter, VIEW_H - RETURN_H + gutter, VIEW_W - gutter * 2, RETURN_H - gutter * 2);
    }
  }, {
    key: "drawWall",
    value: function drawWall(wallBodies) {
      var _this = this;
      this.context.fillStyle = COLORS.frame;
      wallBodies.forEach(function (body, i) {
        _this.context.beginPath();
        body.vertices.forEach(function (_ref9, j) {
          var x = _ref9.x,
            y = _ref9.y;
          if (j === 0) {
            _this.context.moveTo(x, y);
          } else {
            _this.context.lineTo(x, y);
          }
        });
        _this.context.fill();

        // BUMPERS
        _this.context.save();
        _this.context.beginPath();
        body.vertices.forEach(function (_ref0, j) {
          var x = _ref0.x,
            y = _ref0.y;
          if (j === 0) {
            _this.context.moveTo(x, y);
          } else {
            _this.context.lineTo(x, y);
          }
        });
        _this.context.clip();
        _this.context.fillStyle = '#787878';
        var clipOff = WALL_DI * 0.75;
        var clipDiff = WALL_DI - clipOff;
        _this.context.fillRect(clipOff, clipOff, TABLE_W + clipDiff * 2, TABLE_H + clipDiff * 2);
        _this.context.restore();
      });
    }
  }, {
    key: "drawPockets",
    value: function drawPockets(pocketBodies) {
      var _this2 = this;
      this.context.fillStyle = COLORS.pocket;
      pocketBodies.forEach(function (_ref1) {
        var position = _ref1.position,
          circleRadius = _ref1.circleRadius;
        _this2.context.beginPath();
        _this2.context.arc(position.x, position.y, circleRadius, 0, PI2, false);
        _this2.context.fill();
      });
    }
  }, {
    key: "drawPoints",
    value: function drawPoints() {
      var _this3 = this;
      var di = 10,
        rad = di * 0.5,
        inc = TABLE_W / 7,
        xc1 = rel(TABLE_W * 0.25),
        xl1 = xc1 - inc,
        xr1 = xc1 + inc,
        xc2 = xc1 + TABLE_W * 0.5,
        xl2 = xc2 - inc,
        xr2 = xc2 + inc,
        x3 = WALL_RAD * 0.75,
        x4 = rel(TABLE_W + WALL_RAD * 1.25),
        y1 = WALL_RAD * 0.75,
        y2 = rel(TABLE_H + WALL_RAD * 1.25),
        yc3 = rel(TABLE_H * 0.5),
        yt3 = yc3 - inc,
        yb3 = yc3 + inc;
      var positions = [[xl1, y1], [xc1, y1], [xr1, y1], [xl1, y2], [xc1, y2], [xr1, y2], [xl2, y1], [xc2, y1], [xr2, y1], [xl2, y2], [xc2, y2], [xr2, y2], [x3, yt3], [x3, yc3], [x3, yb3], [x4, yt3], [x4, yc3], [x4, yb3]];
      this.context.fillStyle = COLORS.brown;
      positions.forEach(function (coords) {
        var x = coords[0],
          y = coords[1];
        _this3.context.beginPath();
        _this3.context.moveTo(x, y - rad);
        _this3.context.lineTo(x + rad, y);
        _this3.context.lineTo(x, y + rad);
        _this3.context.lineTo(x - rad, y);
        _this3.context.fill();
      });
    }
  }, {
    key: "drawIndicator",
    value: function drawIndicator(_ref10) {
      var x = _ref10.x,
        y = _ref10.y,
        cueball = _ref10.cueball,
        power = _ref10.power,
        maxDistance = _ref10.maxDistance;
      this.cueX = cueball.position.x;
      this.cueY = cueball.position.y;
      this.angle = Math.atan2(y - this.cueY, x - this.cueX);
      this.angleCos = Math.cos(this.angle);
      this.angleSin = Math.sin(this.angle);

      // coordinates for starting power just off the cueball
      var lineMinX = this.cueX + BALL_DI * 1.2 * this.angleCos;
      var lineMinY = this.cueY + BALL_DI * 1.2 * this.angleSin;

      // coordinates for showing power
      var lineMaxX = lineMinX + maxDistance * this.angleCos;
      var lineMaxY = lineMinY + maxDistance * this.angleSin;

      // coordinates for calculating power
      var newX = lineMinX + power * maxDistance * this.angleCos;
      var newY = lineMinY + power * maxDistance * this.angleSin;

      // setting the force relative to power
      this.forceX = (newX - lineMinX) / maxDistance * 0.02;
      this.forceY = (newY - lineMinY) / maxDistance * 0.02;
      this.context.lineCap = 'round';

      // max power
      this.context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      this.context.lineWidth = 4;
      this.context.beginPath();
      this.context.moveTo(lineMinX, lineMinY);
      this.context.lineTo(lineMaxX, lineMaxY);
      this.context.stroke();
      this.context.closePath();

      // power level
      this.context.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      this.context.lineWidth = 4;
      this.context.beginPath();
      this.context.moveTo(lineMinX, lineMinY);
      this.context.lineTo(newX, newY);
      this.context.stroke();
      this.context.closePath();
    }
  }, {
    key: "drawBalls",
    value: function drawBalls(_ref11) {
      var balls = _ref11.balls,
        ballIds = _ref11.ballIds;
      var inAngle = [];
      for (var i = 0, len = ballIds.length; i < len; i++) {
        var ballId = ballIds[i];
        var ball = balls[ballId];
        this.drawBall(ball);
      }
    }
  }, {
    key: "drawBall",
    value: function drawBall(ball) {
      var x = ball.body.position.x,
        y = ball.body.position.y,
        rad = ball.body.circleRadius,
        di = rad * 2,
        a = ball.body.angle;
      this.context.translate(x, y);
      this.context.rotate(a);

      // offset from center
      var offsetX = (x - WALL_DI) / TABLE_W * 2 - 1,
        offsetY = (y - WALL_DI) / TABLE_H * 2 - 1;
      var grad = this.context.createRadialGradient(rad * offsetX, rad * offsetY, rad * 0.125, rad * offsetX, rad * offsetY, rad * 1.5);
      if (ball.eight) {
        grad.addColorStop(0, 'rgba(255,255,255,0.15)');
        grad.addColorStop(1, 'rgba(255,255,255,0.05)');
      } else {
        grad.addColorStop(0, 'rgba(0,0,0,0.05)');
        grad.addColorStop(1, 'rgba(0,0,0,0.3)');
      }
      this.context.shadowColor = 'rgba(0,0,0,0.05)';
      this.context.shadowBlur = 2;
      this.context.shadowOffsetX = -offsetX * BALL_RAD * 0.5;
      this.context.shadowOffsetY = -offsetY * BALL_RAD * 0.5;
      this.context.fillStyle = ball.color;
      this.context.beginPath();
      this.context.arc(0, 0, rad, 0, PI2, false);
      this.context.fill();
      this.context.shadowColor = 'transparent';
      if (ball.stripes) {
        var s1 = PI * 0.15,
          e1 = PI - s1,
          s2 = PI * -0.15,
          e2 = PI - s2;
        this.context.fillStyle = 'white';
        this.context.beginPath();
        this.context.arc(0, 0, rad, s1, e1, false);
        this.context.fill();
        this.context.beginPath();
        this.context.arc(0, 0, rad, s2, e2, true);
        this.context.fill();
      }
      this.context.rotate(-a);
      this.context.beginPath();
      this.context.arc(0, 0, rad, 0, PI2, false);
      this.context.fillStyle = grad;
      this.context.fill();
      this.context.translate(-x, -y);
    }
  }]);
}();
var Game = /*#__PURE__*/function () {
  function Game(_ref12) {
    var _this4 = this;
    var world = _ref12.world,
      canvas = _ref12.canvas,
      sounds = _ref12.sounds;
    _classCallCheck(this, Game);
    this.machine = new Machine();
    this.sounds = sounds;
    this.world = world;
    this.canvas = canvas;
    this.$score = document.querySelector('div.score');
    this.$message = document.querySelector('div.message');
    this.table = new Table();
    this.balls = {};
    this.ballIds = [];
    this.ballNumbers.forEach(function (number) {
      var ball = new Ball({
        number: number,
        cueball: _this4.cueball
      });
      if (ball.cue) _this4.cueId = ball.body.id;
      if (ball.eight) _this4.eightId = ball.body.id;
      _this4.balls[ball.body.id] = ball;
      _this4.ballIds.push(ball.body.id);
    });
    this.addBodiesToWorld();
    initEscapedBodiesRetrieval(this.ballIds.map(function (id) {
      return _this4.balls[id].body;
    }));
    this.reset();
  }
  return _createClass(Game, [{
    key: "handleEscapedBall",
    value: function handleEscapedBall(ballId) {
      console.log('ESCAPED', this.balls[ballId]);
      this.balls[ballId].reset();
    }
  }, {
    key: "reset",
    value: function reset() {
      var _this5 = this;
      this.gameOver = false;
      this["break"] = true;
      this.mousedown = false;
      this.power = 0;
      this.powerStep = 0.015;
      this.powerDirection = 1;
      this.players = [new Player(1), new Player(2)];
      this.playersAssigned = false;
      this.currentPlayerIdx = 0;
      this.messages = [this.currentPlayer.turnText];
      this.pocketedThisTurn = [];
      this.pocketedStripes = 0;
      this.pocketedSolids = 0;
      this.placingCueball = true;
      this.ballIds.forEach(function (ballId) {
        return _this5.balls[ballId].reset();
      });
      this.updateDOM();
    }
  }, {
    key: "currentPlayer",
    get: function get() {
      return this.players[this.currentPlayerIdx % 2];
    }
  }, {
    key: "otherPlayer",
    get: function get() {
      return this.players[(this.currentPlayerIdx + 1) % 2];
    }
  }, {
    key: "isMachine",
    get: function get() {
      return this.currentPlayerIdx % 2 !== 0;
    }
  }, {
    key: "addBodiesToWorld",
    value: function addBodiesToWorld() {
      var _this6 = this;
      World.add(this.world, this.table.bounds);
      World.add(this.world, this.table.walls);
      World.add(this.world, this.table.pockets);
      World.add(this.world, this.ballIds.map(function (b) {
        return _this6.balls[b].body;
      }));
    }
  }, {
    key: "handleMousedown",
    value: function handleMousedown() {
      if (this.gameOver) return;
      if (this.moving) return;
      if (!this.placingCueball) this.mousedown = true;
    }
  }, {
    key: "handleMouseup",
    value: function handleMouseup() {
      if (this.gameOver) return;
      this.mousedown = false;
      if (this.moving) return;
      if (this.placingCueball) this.placeCueball();else this.strikeCueball();
    }
  }, {
    key: "handlePocketed",
    value: function handlePocketed(ballId) {
      var ball = this.balls[ballId];
      if (ball.cue) this.setupCueball();
      this.handlePocketedBall(ball);
    }
  }, {
    key: "handlePocketedBall",
    value: function handlePocketedBall(ball) {
      this.pocketedThisTurn.push(ball);
      var x,
        y = VIEW_H - RETURN_H / 2;
      if (ball.stripes) {
        x = VIEW_W - this.pocketedStripes * (BALL_DI * 1.2) - RETURN_H * 0.5;
        this.pocketedStripes++;
      } else if (ball.solids) {
        x = this.pocketedSolids * (BALL_DI * 1.2) + RETURN_H * 0.5;
        this.pocketedSolids++;
      } else if (ball.cue) {
        x = VIEW_W * 0.5 + BALL_RAD * 1.1;
      } else {
        // ball.eight
        x = VIEW_W * 0.5 - BALL_RAD * 1.1;
      }
      ball.pocket({
        x: x,
        y: y
      });
    }
  }, {
    key: "handleTickAfter",
    value: function handleTickAfter(_ref13) {
      var x = _ref13.x,
        y = _ref13.y;
      this.tickPower();
      var power = this.power;
      var wasMoving = this.moving;
      this.checkMovement();
      var isMoving = this.moving;
      if (wasMoving && !isMoving) this.handleTurnEnd();
      var movingCrosshair = {
        x: x,
        y: y
      };
      this.canvas.drawTable({
        wallBodies: this.table.walls,
        pocketBodies: this.table.pockets
      });
      this.canvas.drawBalls({
        balls: this.balls,
        ballIds: this.ballIds
      });
      var isMachineClick = this.isMachine && this.machine.fire();
      if (this.isMachine) {
        this.machine.tick();
        x = this.machine.x;
        y = this.machine.y;
        power = this.machine.power;
      }
      if (isMachineClick) this.handleMousedown();
      if (this.placingCueball) {
        this.moveCueball(x, y);
      } else if (!this.moving && !this.gameOver) {
        this.canvas.drawIndicator({
          x: x,
          y: y,
          power: power,
          cueball: this.cueball.body,
          maxDistance: this.table.height * 0.5
        });
      }
      if (isMachineClick) this.handleMouseup();
      if (isMoving || this.isMachine) this.canvas.drawMovingCrosshair(movingCrosshair);
      if (!isMoving) this.canvas.drawCrosshair({
        x: x,
        y: y
      });
    }
  }, {
    key: "handleCollisionActive",
    value: function handleCollisionActive(_ref14) {
      var _this7 = this;
      var pairs = _ref14.pairs;
      pairs.forEach(function (_ref15, i) {
        var bodyA = _ref15.bodyA,
          bodyB = _ref15.bodyB;
        var coll = bodyA.label + bodyB.label;
        if (coll === 'ballpocket' || coll == 'pocketball') {
          var ball = bodyA.label === 'ball' ? bodyA : bodyB;
          var distance = Math.hypot(bodyA.position.y - bodyB.position.y, bodyA.position.x - bodyB.position.x);
          if (distance / BALL_DI <= 1) _this7.handlePocketed(ball.id);
        }
      });
    }
  }, {
    key: "handleCollisionStart",
    value: function handleCollisionStart(_ref16) {
      var _this8 = this;
      var pairs = _ref16.pairs;
      if (this.placingCueball) return;
      pairs.forEach(function (collision, i) {
        var bodyA = collision.bodyA,
          bodyB = collision.bodyB;
        var speed = collision.collision.axisBody.speed;
        var coll = bodyA.label + bodyB.label;
        if (!_this8.firstContact && coll === 'ballball') _this8.firstContact = [bodyA, bodyB];
        if (coll === 'ballball') {
          var vol = Math.min(0.5, speed) + 0.05;
          var rate = Math.random() - 0.5 + 1;
          _this8.sounds.ball.rate(rate);
          _this8.sounds.ball.volume(vol);
          _this8.sounds.ball.play();
        } else if (coll === 'ballwall' || coll === 'wallball') {
          var _vol = Math.min(1, speed) * 0.8 + 0.2;
          var _rate = Math.random() - 0.5 + 0.75;
          _this8.sounds.rail.rate(_rate);
          _this8.sounds.rail.volume(_vol);
          _this8.sounds.rail.play();
        }
      });
    }

    // logic for valid first contact, scoring, and game end.
  }, {
    key: "handleTurnEnd",
    value: function handleTurnEnd() {
      var _this9 = this;
      this.restBalls();
      this.messages = [];
      this.power = 0;
      var pocketed = this.pocketedThisTurn;
      var winner = null;
      var isCue = pocketed.filter(function (b) {
          return b.cue;
        }).length > 0,
        isEight = pocketed.filter(function (b) {
          return b.eight;
        }).length > 0;

      // determining valid first contact
      var validFirstContact = true;
      if (this.firstContact) {
        var balls = this.firstContact.map(function (b) {
          return _this9.balls[b.id];
        });
        var ball = balls.filter(function (b) {
          return !b.cue;
        })[0];
        if (this.playersAssigned && !isCue && !isEight) if (this.currentPlayer.stripes && !ball.stripes || this.currentPlayer.solids && !ball.solids) validFirstContact = false;
        this.firstContact = null;
      }

      // handling pocketed balls
      if (pocketed.length > 0) {
        var stripes = pocketed.filter(function (b) {
            return b.stripes;
          }),
          solids = pocketed.filter(function (b) {
            return b.solids;
          }),
          hasStripes = stripes.length > 0,
          hasSolids = solids.length > 0;

        // assigning players
        if (!this.playersAssigned) {
          // only assign if one kind of ball went in and cueball and eightball were not pocketed
          if ((!hasStripes || !hasSolids) && !isCue && !isEight) {
            this.currentPlayer.assign(hasStripes);
            this.otherPlayer.assign(!hasStripes);
            this.playersAssigned = true;
          }
        }

        // calculate scores
        if (this.currentPlayer.stripes) {
          this.currentPlayer.score(stripes.length);
          this.otherPlayer.score(solids.length);
        } else if (this.currentPlayer.solids) {
          this.currentPlayer.score(solids.length);
          this.otherPlayer.score(stripes.length);
        }

        // handling game over
        if (isEight) {
          this.messageEight();
          winner = this.currentPlayer.onEight ? this.currentPlayer : this.otherPlayer;
          // handling cueball
        } else if (isCue) {
          this.messageScratch();
          this.switchTurns();
          // handling invalid contact
        } else if (!validFirstContact) {
          this.messageInvalidContact();
          this.switchTurns();
          // handling the wrong ball
        } else if (!hasStripes && this.currentPlayer.stripes || !hasSolids && this.currentPlayer.solids) {
          this.switchTurns();
        }
        // scratching with no other pocketed balls
      } else if (isCue) {
        this.messageScratch();
        this.switchTurns();
        // switching turns on nothing going in
      } else {
        this.switchTurns();
      }
      // ending the turn
      this.pocketedThisTurn = [];
      if (winner) {
        this.messageWin(winner);
        this.handleGameOver();
      } else {
        this.messageTurn();
      }
      if (this.isMachine) {
        var aMachineBall = this.aMachineBall;
        this.machine.reset(aMachineBall.body.position, this.placingCueball);
      }
      this.updateDOM();
    }
  }, {
    key: "handleGameOver",
    value: function handleGameOver() {
      var _this0 = this;
      this.gameOver = true;
      var $button = document.createElement('button');
      $button.innerHTML = 'New Game';
      $button.addEventListener('click', function () {
        $button.remove();
        _this0.reset();
      });
      document.body.appendChild($button);
    }
  }, {
    key: "messageTurn",
    value: function messageTurn() {
      this.messages.push(this.currentPlayer.turnText);
    }
  }, {
    key: "messageScratch",
    value: function messageScratch() {
      this.messages.push(this.currentPlayer.scratchText);
    }
  }, {
    key: "messageInvalidContact",
    value: function messageInvalidContact() {
      this.messages.push(this.currentPlayer.invalidContactText);
    }
  }, {
    key: "messageEight",
    value: function messageEight() {
      this.messages.push(this.currentPlayer.eightText);
    }
  }, {
    key: "messageWin",
    value: function messageWin(winner) {
      this.messages.push(winner.winText);
    }
  }, {
    key: "restBalls",
    value: function restBalls() {
      var _this1 = this;
      this.ballIds.forEach(function (id) {
        return _this1.balls[id].rest();
      });
    }
  }, {
    key: "strikeCueball",
    value: function strikeCueball() {
      this["break"] = false;
      this.moving = true;
      var power = this.isMachine ? this.machine.power : this.power;
      var vol = Math.min(1, power) * 0.9 + 0.1;
      this.sounds.cue.volume(vol);
      this.sounds.cue.play();
      Body.applyForce(this.cueball.body, this.cueball.body.position, {
        x: this.canvas.forceX,
        y: this.canvas.forceY
      });
    }
  }, {
    key: "setupCueball",
    value: function setupCueball() {
      this.cueball.disable();
      this.placingCueball = true;
    }
  }, {
    key: "placeCueball",
    value: function placeCueball() {
      this.cueball.enable();
      this.cueball.pocketed = false;
      this.placingCueball = false;
    }
  }, {
    key: "moveCueball",
    value: function moveCueball(x, y) {
      if (this.moving) {
        x = rel(TABLE_W / 2);
        y = rel(TABLE_H + WALL_DI + RETURN_H * 0.5);
      } else {
        var maxX = this["break"] ? rel(TABLE_W / 4 - BALL_RAD) : rel(TABLE_W - BALL_RAD),
          minX = rel(0 + BALL_RAD),
          maxY = rel(TABLE_H - BALL_RAD),
          minY = rel(0 + BALL_RAD);
        x = Math.min(maxX, Math.max(minX, x));
        y = Math.min(maxY, Math.max(minY, y));
      }
      this.cueball.setVelocity({
        x: 0,
        y: 0
      });
      Body.setPosition(this.cueball.body, {
        x: x,
        y: y
      });
    }
  }, {
    key: "tickPower",
    value: function tickPower() {
      if (this.mousedown) {
        this.power += this.powerStep * this.powerDirection;
        if (this.power < 0) {
          this.powerDirection = 1;
          this.power = 0;
        } else if (this.power > 1) {
          this.powerDirection = -1;
          this.power = 1;
        }
      }
    }
  }, {
    key: "updateDOM",
    value: function updateDOM() {
      var current = this.currentPlayerIdx % 2;
      this.$score.innerHTML = this.updatePlayerDOM(this.players[0], current === 0) + this.updatePlayerDOM(this.players[1], current === 1);
      this.$message.innerHTML = '<p>' + this.messages.map(function (m) {
        return m;
      }).join(' ') + '</p>';
    }
  }, {
    key: "updatePlayerDOM",
    value: function updatePlayerDOM(player, current) {
      return "<span>\n  <span>".concat(player.nameText, "</span>\n  <span>").concat(player.points, "</span>\n</span>");
    }
  }, {
    key: "switchTurns",
    value: function switchTurns() {
      this.currentPlayerIdx++;
    }
  }, {
    key: "checkMovement",
    value: function checkMovement() {
      if (this.moving) {
        var moving = false;
        for (var i = 0, len = this.ballIds.length; i < len && !moving; i++) {
          var ballId = this.ballIds[i];
          var ball = this.balls[ballId];
          if (ball.body && ball.body.speed > 0.125) moving = true;
        }
        this.moving = moving;
      }
    }
  }, {
    key: "aMachineBall",
    get: function get() {
      var _this10 = this;
      var balls = this.ballIds.map(function (id) {
        return _this10.balls[id];
      }).filter(function (b) {
        return !b.pocketed;
      });
      if (this.players[1].onEight) {
        balls = [this.eightball];
      } else if (this.players[1].stripes) {
        balls = balls.filter(function (b) {
          return b.stripes;
        });
      } else if (this.players[1].solids) {
        balls = balls.filter(function (b) {
          return b.solids;
        });
      } else {
        balls = balls.filter(function (b) {
          return !b.cue && !b.eight;
        });
      }
      return balls[Math.floor(Math.random() * balls.length)];
    }
  }, {
    key: "cueball",
    get: function get() {
      return this.balls[this.cueId];
    }
  }, {
    key: "eightball",
    get: function get() {
      return this.balls[this.eightId];
    }
  }, {
    key: "ballNumbers",
    get: function get() {
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    }
  }]);
}(); // create a world and engine
var world = World.create({
  gravity: {
    x: 0,
    y: 0
  }
});
var engine = Engine.create({
  world: world,
  timing: {
    timeScale: 1
  }
});

// create a renderer
var element = document.querySelector('div.canvas');
var render = Render.create({
  element: element,
  engine: engine,
  options: {
    width: VIEW_W,
    height: VIEW_H,
    wireframes: WIREFRAMES,
    background: COLORS.frame
  }
});
if (window.location.href.match(/cpgrid/)) {
  document.body.classList.add('screenshot');
  var src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/111863/billiards.png';
  var img = new Image();
  img.src = src;
  document.body.appendChild(img);
} else {
  var canvas = new Canvas(render);
  var mouse = Mouse.create(render.canvas);
  var sounds = {
    cue: new Howl({
      src: [ASSET_PREFIX + 'billiards-cue.mp3', ASSET_PREFIX + 'billiards-cue.ogg']
    }),
    ball: new Howl({
      src: [ASSET_PREFIX + 'billiards-ball.mp3', ASSET_PREFIX + 'billiards-ball.ogg']
    }),
    rail: new Howl({
      src: [ASSET_PREFIX + 'billiards-rail.mp3', ASSET_PREFIX + 'billiards-rail.ogg']
    })
  };
  var _game = new Game({
    world: world,
    canvas: canvas,
    sounds: sounds
  });
  Events.on(render, 'afterRender', function () {
    _game.handleTickAfter({
      x: mouse.position.x,
      y: mouse.position.y
    });
  });
  var constraint = MouseConstraint.create(engine, {
    mouse: mouse
  });
  Events.on(constraint, 'mousedown', function (_ref17) {
    var mouse = _ref17.mouse;
    _game.handleMousedown();
  });
  Events.on(constraint, 'mouseup', function (_ref18) {
    var mouse = _ref18.mouse;
    _game.handleMouseup();
  });
  Events.on(engine, 'collisionActive', function (e) {
    _game.handleCollisionActive({
      pairs: e.pairs
    });
  });
  Events.on(engine, 'collisionStart', function (e) {
    _game.handleCollisionStart({
      pairs: e.pairs
    });
  });

  // run the engine
  Engine.run(engine);

  // run the renderer
  Render.run(render);
}
function rel(x) {
  return x + WALL_DI;
}
function initEscapedBodiesRetrieval(allBodies) {
  function hasBodyEscaped(body) {
    var _body$position = body.position,
      x = _body$position.x,
      y = _body$position.y;
    return x < 0 || x > VIEW_W || y < 0 || y > VIEW_H;
  }
  setInterval(function () {
    var i, body;
    for (i = 0; i < allBodies.length; i++) {
      body = allBodies[i];
      if (hasBodyEscaped(body)) game.handleEscapedBall(body.id);
    }
  }, 300);
}
