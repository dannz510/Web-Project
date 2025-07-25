"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _react = _interopRequireWildcard(require("https://cdn.skypack.dev/react@17"));
var _reactDom = _interopRequireDefault(require("https://cdn.skypack.dev/react-dom@17"));
var _gsap = _interopRequireDefault(require("https://cdn.skypack.dev/gsap@3.6.1"));
var _MotionPathPlugin = require("https://cdn.skypack.dev/gsap@3.6.1/MotionPathPlugin");
var THREE = _interopRequireWildcard(require("https://cdn.skypack.dev/three@0.129.0"));
var _GLTFLoader = require("https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
console.clear();
var FILES = {
  drum: "https://assets.codepen.io/557388/drums.glb",
  burger: "https://assets.codepen.io/557388/burger.glb",
  snare: "https://assets.codepen.io/557388/snare.mp3",
  bass: "https://assets.codepen.io/557388/bass.mp3",
  tom1: "https://assets.codepen.io/557388/tom-1.mp3",
  tom2: "https://assets.codepen.io/557388/tom-2.mp3",
  tom3: "https://assets.codepen.io/557388/tom-3.mp3",
  cymbal1: "https://assets.codepen.io/557388/cymbal-1.mp3",
  cymbal2: "https://assets.codepen.io/557388/cymbal-2.mp3"
};
_gsap["default"].registerPlugin(_MotionPathPlugin.MotionPathPlugin);
function App() {
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "App"
  }, /*#__PURE__*/_react["default"].createElement(BurgerDrum, null), /*#__PURE__*/_react["default"].createElement("a", {
    href: "https://youtu.be/VtmsuVT7BGI",
    target: "_blank",
    className: "component-carousel"
  }, /*#__PURE__*/_react["default"].createElement("span", null, "Watch us make this on"), /*#__PURE__*/_react["default"].createElement("img", {
    src: "https://assets.codepen.io/557388/component-carousel.png",
    alt: "Component Carousel"
  })));
}
function BurgerDrum() {
  var mount = (0, _react.useRef)();
  var _useState = (0, _react.useState)('loading'),
    _useState2 = _slicedToArray(_useState, 2),
    view = _useState2[0],
    setView = _useState2[1];
  var _useState3 = (0, _react.useState)(null),
    _useState4 = _slicedToArray(_useState3, 2),
    manager = _useState4[0],
    setManager = _useState4[1];
  var init = function init() {
    if (mount.current) {
      var stage = new Stage(mount.current);
      var _manager = new Manager(stage, view, setView);
      setManager(_manager);
      return function () {
        stage.destroy();
        _manager.fire();
      };
    }
  };
  var toggleView = function toggleView() {
    setView(view === 'burger' ? 'drums' : 'burger');
  };
  (0, _react.useEffect)(init, [mount]);
  (0, _react.useEffect)(function () {
    if (manager) manager.updateView(view);
  }, [view, manager]);
  return /*#__PURE__*/_react["default"].createElement("div", {
    className: "burger-drum ".concat(view)
  }, /*#__PURE__*/_react["default"].createElement("div", {
    className: "container",
    ref: mount
  }), /*#__PURE__*/_react["default"].createElement("div", {
    className: "info"
  }, /*#__PURE__*/_react["default"].createElement("p", {
    className: "presents"
  }, "Buns N' Roses presents:"), /*#__PURE__*/_react["default"].createElement("h1", null, "Beat Burger"), /*#__PURE__*/_react["default"].createElement("p", null, "Our signature burger, inspired by legendary drummer ", /*#__PURE__*/_react["default"].createElement("i", null, "[your favorite drummer here]"), ". Order online now ", /*#__PURE__*/_react["default"].createElement("i", null, "(or don't because this is all pretend)"), " or transform this burger into a drum kit and play some sweet beats!"), /*#__PURE__*/_react["default"].createElement("div", {
    className: "buttons"
  }, /*#__PURE__*/_react["default"].createElement("button", {
    disabled: true
  }, "Order now"), /*#__PURE__*/_react["default"].createElement("button", {
    onClick: toggleView
  }, "Play"))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "controls"
  }, /*#__PURE__*/_react["default"].createElement("button", {
    onClick: toggleView
  }, "Back"), /*#__PURE__*/_react["default"].createElement("div", null, "Tap the drums or use these keyboard keys: ", /*#__PURE__*/_react["default"].createElement("span", null, "Q"), /*#__PURE__*/_react["default"].createElement("span", null, "W"), /*#__PURE__*/_react["default"].createElement("span", null, "E"), /*#__PURE__*/_react["default"].createElement("span", null, "R"), /*#__PURE__*/_react["default"].createElement("span", null, "T"), /*#__PURE__*/_react["default"].createElement("span", null, "Y"), /*#__PURE__*/_react["default"].createElement("span", null, "U"))), /*#__PURE__*/_react["default"].createElement("div", {
    className: "loader"
  }, "\uD83E\uDD18 Loading \uD83E\uDD18"));
}
var Manager = /*#__PURE__*/function () {
  function Manager(stage, view, setView) {
    _classCallCheck(this, Manager);
    this.stage = stage;
    this.setView = setView;
    this.debug = false;
    this.sounds = {};
    this.raycaster = new THREE.Raycaster();
    this.view = view;
    this.models = {
      burger: {
        file: FILES.burger,
        items: {}
      },
      drumkit: {
        file: FILES.drum,
        items: {}
      }
    };
    this.setupSpotLights();
    this.loadModels();
  }
  return _createClass(Manager, [{
    key: "setupSpotLights",
    value: function setupSpotLights() {
      var _this = this;
      this.spotlights = {
        left: {
          light: new THREE.SpotLight('white', 0),
          target: new THREE.Object3D()
        },
        right: {
          light: new THREE.SpotLight('white', 0),
          target: new THREE.Object3D()
        }
      };
      var sides = ['left', 'right'];
      sides.forEach(function (side) {
        var spotLight = _this.spotlights[side].light;
        var target = _this.spotlights[side].target;
        spotLight.penumbra = 0.1;
        spotLight.angle = 0.6;
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.near = 1;
        spotLight.shadow.camera.far = 10;
        spotLight.shadow.camera.fov = 50;
        spotLight.target = target;
        _this.stage.add(spotLight);
        _this.stage.add(target);
      });
      this.spotlights.left.light.position.set(-3, 5, 1);
      this.spotlights.right.light.position.set(3, 5, 1);
    }
  }, {
    key: "playSound",
    value: function playSound(id) {
      var sound = this.sounds[id];
      if (this.view === 'drums' && sound) {
        sound.audio.currentTime = 0;
        sound.audio.play();
        _gsap["default"].fromTo(sound.object.position, _objectSpread({}, sound.from), _objectSpread(_objectSpread({}, sound.to), {}, {
          ease: 'elastic'
        }));
      }
    }
  }, {
    key: "setupSounds",
    value: function setupSounds() {
      var _this2 = this;
      var testObjects = [];
      var _loop = function _loop() {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          name = _Object$entries$_i[0],
          drum = _Object$entries$_i[1];
        if (drum.sound) {
          var sound = {
            audio: new Audio(drum.sound),
            object: _this2.models.burger.items[name],
            from: _defineProperty({}, drum.direction, drum.position[drum.direction] - 0.3),
            to: _defineProperty({}, drum.direction, drum.position[drum.direction])
          };

          // test doesn't work on groups, so need to add children and rename
          if (sound.object instanceof THREE.Mesh) {
            testObjects.push(sound.object);
          } else {
            sound.object.children.forEach(function (obj) {
              obj.name = sound.object.name;
              testObjects.push(obj);
            });
          }
          _this2.sounds[drum.key] = sound;
          _this2.sounds[name] = sound;
        }
      };
      for (var _i = 0, _Object$entries = Object.entries(drumSettings); _i < _Object$entries.length; _i++) {
        _loop();
      }
      document.addEventListener("keydown", function (event) {
        _this2.playSound(event.key);
      });
      this.stage.container.addEventListener('click', function (event) {
        var mouse = {
          x: event.offsetX / _this2.stage.size.width * 2 - 1,
          y: -(event.offsetY / _this2.stage.size.height) * 2 + 1
        };
        _this2.raycaster.setFromCamera(mouse, _this2.stage.camera);
        var intersects = _this2.raycaster.intersectObjects(testObjects);
        if (intersects.length) {
          _this2.playSound(intersects[0].object.name);
        }
      });
    }
  }, {
    key: "loadModels",
    value: function loadModels() {
      var _this3 = this;
      var loadingManager = new THREE.LoadingManager(function () {
        _this3.setupSounds();
        _this3.setView('burger');
      });
      var gltfLoader = new _GLTFLoader.GLTFLoader(loadingManager);
      Object.keys(this.models).forEach(function (id) {
        var model = _this3.models[id];
        gltfLoader.load(model.file, function (gltf) {
          gltf.scene.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
              child.receiveShadow = true;
              child.castShadow = true;
            }
          });
          var children = _toConsumableArray(gltf.scene.children);
          children.forEach(function (child) {
            model.items[child.name] = child;
            child.home = {
              position: _objectSpread({}, child.position),
              rotation: {
                x: child.rotation.x,
                y: child.rotation.y,
                z: child.rotation.z
              },
              scale: _objectSpread({}, child.scale)
            };
            child.position.y *= 2;
            child.visible = false;
            _this3.stage.add(child);
          });
        });
      });
    }
  }, {
    key: "moveToDrums",
    value: function moveToDrums() {
      var _this4 = this;
      _gsap["default"].to(this.stage.camera.position, {
        x: 0,
        y: 6,
        z: 6
      });
      _gsap["default"].to(this.stage.lookAt, {
        x: 0,
        y: 1,
        z: -1
      });
      _gsap["default"].to(this.stage, {
        light: 0
      });
      _gsap["default"].to(this.spotlights.left.target.position, {
        x: -1,
        z: -1
      });
      _gsap["default"].to(this.spotlights.right.target.position, {
        x: 1,
        z: -1
      });
      _gsap["default"].to(this.spotlights.left.light, {
        intensity: 10,
        delay: 0.3
      });
      _gsap["default"].to(this.spotlights.right.light, {
        intensity: 10,
        delay: 0.3
      });
      Object.keys(this.models.burger.items).forEach(function (key) {
        var item = _this4.models.burger.items[key];
        var pos = drumSettings[item.name];
        var delay = 0.6 - item.home.position.y * 0.6;
        _gsap["default"].to(item.position, {
          motionPath: [{
            x: pos.position.x,
            y: pos.position.y + 0.5,
            z: pos.position.z
          }, _objectSpread({}, pos.position)],
          delay: delay,
          duration: 1,
          ease: 'power2.inOut'
        });
        _gsap["default"].to(item.rotation, _objectSpread(_objectSpread({}, pos.rotation), {}, {
          duration: 3,
          delay: delay + 0.5,
          ease: 'elastic'
        }));
        _gsap["default"].to(item.scale, _objectSpread(_objectSpread({}, pos.scale), {}, {
          duration: 1,
          delay: delay,
          ease: 'power2.inOut'
        }));
      });
      Object.keys(this.models.drumkit.items).forEach(function (key) {
        var item = _this4.models.drumkit.items[key];
        item.visible = true;
        _gsap["default"].to(item.position, _objectSpread(_objectSpread({}, item.home.position), {}, {
          duration: 1,
          ease: 'power4.out'
        }));
        _gsap["default"].to(item.rotation, _objectSpread(_objectSpread({}, item.home.rotation), {}, {
          duration: 1,
          ease: 'power4.out'
        }));
        _gsap["default"].to(item.scale, _objectSpread(_objectSpread({}, item.home.scale), {}, {
          duration: 1,
          ease: 'power4.out'
        }));
      });
    }
  }, {
    key: "moveToBurger",
    value: function moveToBurger() {
      var _this5 = this;
      _gsap["default"].to(this.stage.camera.position, _objectSpread(_objectSpread({}, this.stage.camera.home.position), {}, {
        duration: 0.6
      }));
      _gsap["default"].to(this.stage.lookAt, {
        x: -1.5,
        y: 1,
        z: 0,
        duration: 0.6
      });
      _gsap["default"].to(this.stage, {
        light: 2
      });
      _gsap["default"].to(this.spotlights.left.target.position, {
        x: -10,
        y: 1
      });
      _gsap["default"].to(this.spotlights.right.target.position, {
        x: 10,
        y: 1
      });
      _gsap["default"].to(this.spotlights.left.light, {
        intensity: 0
      });
      _gsap["default"].to(this.spotlights.right.light, {
        intensity: 0
      });
      Object.keys(this.models.burger.items).forEach(function (key) {
        var item = _this5.models.burger.items[key];
        var delay = 0.2 + item.home.position.y * 0.4;
        item.visible = true;
        _gsap["default"].to(item.position, {
          motionPath: [{
            x: item.home.position.x,
            y: item.home.position.y * 3,
            z: item.home.position.z
          }, _objectSpread({}, item.home.position)],
          delay: delay,
          duration: 1.5,
          ease: 'bounce'
        });
        _gsap["default"].to(item.rotation, _objectSpread(_objectSpread({}, item.home.rotation), {}, {
          duration: 1,
          delay: delay,
          ease: 'power4.inOut'
        }));
        _gsap["default"].to(item.scale, _objectSpread(_objectSpread({}, item.home.scale), {}, {
          duration: 1,
          delay: delay,
          ease: 'power4.inOut'
        }));
      });
      Object.keys(this.models.drumkit.items).forEach(function (key) {
        var item = _this5.models.drumkit.items[key];
        _gsap["default"].to(item.position, {
          y: -3,
          duration: 0.5
        });
        _gsap["default"].to(item.rotation, {
          z: Math.random() * 0.5 - 0.25,
          duration: 0.5
        });
      });
    }
  }, {
    key: "updateView",
    value: function updateView(newState) {
      this.view = newState;
      _gsap["default"].globalTimeline.clear();
      if (newState === 'burger') this.moveToBurger();
      if (newState === 'drums') this.moveToDrums();
    }
  }, {
    key: "fire",
    value: function fire() {
      this.gui.destroy();
    }
  }]);
}();
var COLORS = {
  background: '#142522',
  floor: '#522142'
};
var Stage = /*#__PURE__*/function () {
  function Stage(mount) {
    var _this6 = this;
    _classCallCheck(this, Stage);
    this.container = mount;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.background);
    this.size = {
      width: 1,
      height: 1
    };
    this.setupLights();
    this.setupCamera();
    this.setupFloor();
    this.setupFog();
    this.setupRenderer();
    this.onResize();
    window.addEventListener('resize', function () {
      return _this6.onResize();
    });
    this.tick();
  }
  return _createClass(Stage, [{
    key: "setupLights",
    value: function setupLights() {
      this.directionalLight = new THREE.DirectionalLight('#ffffff', 2);
      this.directionalLight.castShadow = true;
      this.directionalLight.shadow.camera.far = 10;
      this.directionalLight.shadow.mapSize.set(1024, 1024);
      this.directionalLight.shadow.normalBias = 0.05;
      this.directionalLight.position.set(2, 4, 1);
      this.add(this.directionalLight);
      var hemisphereLight = new THREE.HemisphereLight(0xffffff, COLORS.floor, 0.5);
      this.add(hemisphereLight);
    }
  }, {
    key: "setupCamera",
    value: function setupCamera() {
      this.lookAt = new THREE.Vector3(2, 1, 0);
      this.camera = new THREE.PerspectiveCamera(40, this.size.width / this.size.height, 0.1, 100);
      this.camera.position.set(0, 3, 6);
      this.camera.home = {
        position: _objectSpread({}, this.camera.position)
      };
      this.add(this.camera);
    }
  }, {
    key: "setupFloor",
    value: function setupFloor() {
      var plane = new THREE.PlaneGeometry(100, 100);
      var floorMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.floor
      });
      var floor = new THREE.Mesh(plane, floorMaterial);
      floor.receiveShadow = true;
      floor.rotateX(-Math.PI * 0.5);
      this.add(floor);
    }
  }, {
    key: "setupFog",
    value: function setupFog() {
      var fog = new THREE.Fog(COLORS.background, 6, 20);
      this.scene.fog = fog;
    }
  }, {
    key: "setupRenderer",
    value: function setupRenderer() {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true
      });
      this.renderer.physicallyCorrectLights = true;
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.toneMapping = THREE.ReinhardToneMapping;
      this.renderer.toneMappingExposure = 3;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.container.appendChild(this.renderer.domElement);
    }
  }, {
    key: "onResize",
    value: function onResize() {
      this.size.width = this.container.clientWidth;
      this.size.height = this.container.clientHeight;
      this.camera.aspect = this.size.width / this.size.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.size.width, this.size.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  }, {
    key: "tick",
    value: function tick() {
      var _this7 = this;
      this.camera.lookAt(this.lookAt);
      this.renderer.render(this.scene, this.camera);
      window.requestAnimationFrame(function () {
        return _this7.tick();
      });
    }
  }, {
    key: "add",
    value: function add(element) {
      this.scene.add(element);
    }
  }, {
    key: "light",
    get: function get() {
      return this.directionalLight.intensity;
    },
    set: function set(value) {
      this.directionalLight.intensity = value;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.container.removeChild(this.renderer.domElement);
      window.removeEventListener('resize', this.onResize);
    }
  }]);
}();
var drumSettings = {
  "bun-bottom": {
    "sound": FILES.snare,
    "key": "q",
    "direction": "y",
    "position": {
      "x": -1.6,
      "y": 1.55,
      "z": 0
    },
    "rotation": {
      "x": 0,
      "y": 0.67,
      "z": 0
    },
    "scale": {
      "x": 0.6000000000000001,
      "y": 0.6000000000000001,
      "z": 0.6000000000000001
    }
  },
  "bun-top": {
    "sound": FILES.bass,
    "key": "w",
    "direction": "z",
    "position": {
      "x": 0,
      "y": 0.9,
      "z": -0.5
    },
    "rotation": {
      "x": -1.9000000000000001,
      "y": 1.7000000000000002,
      "z": 0
    },
    "scale": {
      "x": 0.8,
      "y": 0.8,
      "z": 0.8
    }
  },
  "tomato-1": {
    "position": {
      "x": 1.6,
      "y": 1,
      "z": 0.2
    },
    "rotation": {
      "x": -3.141592653589793,
      "y": -5,
      "z": 0
    },
    "scale": {
      "x": 0.7000000000000001,
      "y": 0.7000000000000001,
      "z": 0.7000000000000001
    }
  },
  "patty-1": {
    "sound": FILES.tom1,
    "key": "e",
    "direction": "y",
    "position": {
      "x": -0.5,
      "y": 2.1,
      "z": -0.1
    },
    "rotation": {
      "x": 0,
      "y": 3.1,
      "z": 0
    },
    "scale": {
      "x": 0.5,
      "y": 0.5,
      "z": 0.5
    }
  },
  "lettuce": {
    "sound": FILES.tom3,
    "key": "r",
    "direction": "y",
    "position": {
      "x": 1.6,
      "y": 1.4000000000000001,
      "z": 0.2
    },
    "rotation": {
      "x": 0,
      "y": 0,
      "z": 0
    },
    "scale": {
      "x": 0.6000000000000001,
      "y": 0.6000000000000001,
      "z": 0.6000000000000001
    }
  },
  "tomato-2": {
    "position": {
      "x": 1.5,
      "y": 1.2000000000000002,
      "z": 0.30000000000000004
    },
    "rotation": {
      "x": -3.141592653589793,
      "y": 0.39626465267840905,
      "z": 0
    },
    "scale": {
      "x": 0.7000000000000001,
      "y": 0.7000000000000001,
      "z": 0.7000000000000001
    }
  },
  "cheese-2": {
    "sound": FILES.cymbal1,
    "key": "t",
    "direction": "y",
    "position": {
      "x": -0.98,
      "y": 2.43,
      "z": -0.5
    },
    "rotation": {
      "x": 0.01,
      "y": -1.6500000000000001,
      "z": 0.01
    },
    "scale": {
      "x": 0.7000000000000001,
      "y": 0.7000000000000001,
      "z": 0.7000000000000001
    }
  },
  "patty-2": {
    "sound": FILES.tom2,
    "key": "y",
    "direction": "y",
    "position": {
      "x": 0.6000000000000001,
      "y": 2.1,
      "z": -0.1
    },
    "rotation": {
      "x": 0,
      "y": -4.18,
      "z": 0
    },
    "scale": {
      "x": 0.5,
      "y": 0.5,
      "z": 0.5
    }
  },
  "cheese-1": {
    "sound": FILES.cymbal2,
    "key": "u",
    "direction": "y",
    "position": {
      "x": 1,
      "y": 2.85,
      "z": -0.4
    },
    "rotation": {
      "x": -3.141592653589793,
      "y": -1.32,
      "z": -3.141592653589793
    },
    "scale": {
      "x": 0.6,
      "y": 0.6,
      "z": 0.6
    }
  }
};
_reactDom["default"].render(/*#__PURE__*/_react["default"].createElement(_react["default"].StrictMode, null, /*#__PURE__*/_react["default"].createElement(App, null)), document.getElementById('root'));
