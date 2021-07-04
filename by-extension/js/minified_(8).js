(function () {
  var n = function (e, t) {
    var a = n.resolve(e, t || "/"),
      r = n.modules[a];
    if (!r) throw Error("Failed to resolve module " + e + ", tried " + a);
    var o = n.cache[a],
      i = o ? o.exports : r();
    return i;
  };
  (n.paths = []),
    (n.modules = {}),
    (n.cache = {}),
    (n.extensions = [".js", ".coffee", ".json"]),
    (n._core = { assert: !0, events: !0, fs: !0, path: !0, vm: !0 }),
    (n.resolve = (function () {
      return function (e, t) {
        function a(e) {
          if (((e = s.normalize(e)), n.modules[e])) return e;
          for (var t = 0; n.extensions.length > t; t++) {
            var a = n.extensions[t];
            if (n.modules[e + a]) return e + a;
          }
        }
        function r(e) {
          e = e.replace(/\/+$/, "");
          var t = s.normalize(e + "/package.json");
          if (n.modules[t]) {
            var r = n.modules[t](),
              o = r.browserify;
            if ("object" == typeof o && o.main) {
              var i = a(s.resolve(e, o.main));
              if (i) return i;
            } else if ("string" == typeof o) {
              var i = a(s.resolve(e, o));
              if (i) return i;
            } else if (r.main) {
              var i = a(s.resolve(e, r.main));
              if (i) return i;
            }
          }
          return a(e + "/index");
        }
        function o(n, e) {
          for (var t = i(e), o = 0; t.length > o; o++) {
            var s = t[o],
              u = a(s + "/" + n);
            if (u) return u;
            var c = r(s + "/" + n);
            if (c) return c;
          }
          var u = a(n);
          return u ? u : void 0;
        }
        function i(n) {
          var e;
          e = "/" === n ? [""] : s.normalize(n).split("/");
          for (var t = [], a = e.length - 1; a >= 0; a--)
            if ("node_modules" !== e[a]) {
              var r = e.slice(0, a + 1).join("/") + "/node_modules";
              t.push(r);
            }
          return t;
        }
        if ((t || (t = "/"), n._core[e])) return e;
        var s = n.modules.path();
        t = s.resolve("/", t);
        var u = t || "/";
        if (e.match(/^(?:\.\.?\/|\/)/)) {
          var c = a(s.resolve(u, e)) || r(s.resolve(u, e));
          if (c) return c;
        }
        var l = o(e, u);
        if (l) return l;
        throw Error("Cannot find module '" + e + "'");
      };
    })()),
    (n.alias = function (e, t) {
      var a = n.modules.path(),
        r = null;
      try {
        r = n.resolve(e + "/package.json", "/");
      } catch (o) {
        r = n.resolve(e, "/");
      }
      for (
        var i = a.dirname(r),
          s = (
            Object.keys ||
            function (n) {
              var e = [];
              for (var t in n) e.push(t);
              return e;
            }
          )(n.modules),
          u = 0;
        s.length > u;
        u++
      ) {
        var c = s[u];
        if (c.slice(0, i.length + 1) === i + "/") {
          var l = c.slice(i.length);
          n.modules[t + l] = n.modules[i + l];
        } else c === i && (n.modules[t] = n.modules[i]);
      }
    }),
    (function () {
      var e = {},
        t = "undefined" != typeof window ? window : {},
        a = !1;
      n.define = function (r, o) {
        !a &&
          n.modules.__browserify_process &&
          ((e = n.modules.__browserify_process()), (a = !0));
        var i = n._core[r] ? "" : n.modules.path().dirname(r),
          s = function (e) {
            var t = n(e, i),
              a = n.cache[n.resolve(e, i)];
            return a && null === a.parent && (a.parent = u), t;
          };
        (s.resolve = function (e) {
          return n.resolve(e, i);
        }),
          (s.modules = n.modules),
          (s.define = n.define),
          (s.cache = n.cache);
        var u = { id: r, filename: r, exports: {}, loaded: !1, parent: null };
        n.modules[r] = function () {
          return (
            (n.cache[r] = u),
            o.call(u.exports, s, u, u.exports, i, r, e, t),
            (u.loaded = !0),
            u.exports
          );
        };
      };
    })(),
    n.define(
      "path",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "function filter (xs, fn) {\n    var res = [];\n    for (var i = 0; i < xs.length; i++) {\n        if (fn(xs[i], i, xs)) res.push(xs[i]);\n    }\n    return res;\n}\n\n// resolves . and .. elements in a path array with directory names there\n// must be no slashes, empty elements, or device names (c:\\) in the array\n// (so also no leading and trailing slashes - it does not distinguish\n// relative and absolute paths)\nfunction normalizeArray(parts, allowAboveRoot) {\n  // if the path tries to go above the root, `up` ends up > 0\n  var up = 0;\n  for (var i = parts.length; i >= 0; i--) {\n    var last = parts[i];\n    if (last == '.') {\n      parts.splice(i, 1);\n    } else if (last === '..') {\n      parts.splice(i, 1);\n      up++;\n    } else if (up) {\n      parts.splice(i, 1);\n      up--;\n    }\n  }\n\n  // if the path is allowed to go above the root, restore leading ..s\n  if (allowAboveRoot) {\n    for (; up--; up) {\n      parts.unshift('..');\n    }\n  }\n\n  return parts;\n}\n\n// Regex to split a filename into [*, dir, basename, ext]\n// posix version\nvar splitPathRe = /^(.+\\/(?!$)|\\/)?((?:.+?)?(\\.[^.]*)?)$/;\n\n// path.resolve([from ...], to)\n// posix version\nexports.resolve = function() {\nvar resolvedPath = '',\n    resolvedAbsolute = false;\n\nfor (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {\n  var path = (i >= 0)\n      ? arguments[i]\n      : process.cwd();\n\n  // Skip empty and invalid entries\n  if (typeof path !== 'string' || !path) {\n    continue;\n  }\n\n  resolvedPath = path + '/' + resolvedPath;\n  resolvedAbsolute = path.charAt(0) === '/';\n}\n\n// At this point the path should be resolved to a full absolute path, but\n// handle relative paths to be safe (might happen when process.cwd() fails)\n\n// Normalize the path\nresolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {\n    return !!p;\n  }), !resolvedAbsolute).join('/');\n\n  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';\n};\n\n// path.normalize(path)\n// posix version\nexports.normalize = function(path) {\nvar isAbsolute = path.charAt(0) === '/',\n    trailingSlash = path.slice(-1) === '/';\n\n// Normalize the path\npath = normalizeArray(filter(path.split('/'), function(p) {\n    return !!p;\n  }), !isAbsolute).join('/');\n\n  if (!path && !isAbsolute) {\n    path = '.';\n  }\n  if (path && trailingSlash) {\n    path += '/';\n  }\n  \n  return (isAbsolute ? '/' : '') + path;\n};\n\n\n// posix version\nexports.join = function() {\n  var paths = Array.prototype.slice.call(arguments, 0);\n  return exports.normalize(filter(paths, function(p, index) {\n    return p && typeof p === 'string';\n  }).join('/'));\n};\n\n\nexports.dirname = function(path) {\n  var dir = splitPathRe.exec(path)[1] || '';\n  var isWindows = false;\n  if (!dir) {\n    // No dirname\n    return '.';\n  } else if (dir.length === 1 ||\n      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {\n    // It is just a slash or a drive letter with a slash\n    return dir;\n  } else {\n    // It is a full dirname, strip trailing slash\n    return dir.substring(0, dir.length - 1);\n  }\n};\n\n\nexports.basename = function(path, ext) {\n  var f = splitPathRe.exec(path)[2] || '';\n  // TODO: make this comparison case-insensitive on windows?\n  if (ext && f.substr(-1 * ext.length) === ext) {\n    f = f.substr(0, f.length - ext.length);\n  }\n  return f;\n};\n\n\nexports.extname = function(path) {\n  return splitPathRe.exec(path)[3] || '';\n};\n\nexports.relative = function(from, to) {\n  from = exports.resolve(from).substr(1);\n  to = exports.resolve(to).substr(1);\n\n  function trim(arr) {\n    var start = 0;\n    for (; start < arr.length; start++) {\n      if (arr[start] !== '') break;\n    }\n\n    var end = arr.length - 1;\n    for (; end >= 0; end--) {\n      if (arr[end] !== '') break;\n    }\n\n    if (start > end) return [];\n    return arr.slice(start, end - start + 1);\n  }\n\n  var fromParts = trim(from.split('/'));\n  var toParts = trim(to.split('/'));\n\n  var length = Math.min(fromParts.length, toParts.length);\n  var samePartsLength = length;\n  for (var i = 0; i < length; i++) {\n    if (fromParts[i] !== toParts[i]) {\n      samePartsLength = i;\n      break;\n    }\n  }\n\n  var outputParts = [];\n  for (var i = samePartsLength; i < fromParts.length; i++) {\n    outputParts.push('..');\n  }\n\n  outputParts = outputParts.concat(toParts.slice(samePartsLength));\n\n  return outputParts.join('/');\n};\n\n//@ sourceURL=path"
      )
    ),
    n.define(
      "__browserify_process",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "var process = module.exports = {};\n\nprocess.nextTick = (function () {\n    var canSetImmediate = typeof window !== 'undefined'\n        && window.setImmediate;\n    var canPost = typeof window !== 'undefined'\n        && window.postMessage && window.addEventListener\n    ;\n\n    if (canSetImmediate) {\n        return function (f) { return window.setImmediate(f) };\n    }\n\n    if (canPost) {\n        var queue = [];\n        window.addEventListener('message', function (ev) {\n            if (ev.source === window && ev.data === 'browserify-tick') {\n                ev.stopPropagation();\n                if (queue.length > 0) {\n                    var fn = queue.shift();\n                    fn();\n                }\n            }\n        }, true);\n\n        return function nextTick(fn) {\n            queue.push(fn);\n            window.postMessage('browserify-tick', '*');\n        };\n    }\n\n    return function nextTick(fn) {\n        setTimeout(fn, 0);\n    };\n})();\n\nprocess.title = 'browser';\nprocess.browser = true;\nprocess.env = {};\nprocess.argv = [];\n\nprocess.binding = function (name) {\n    if (name === 'evals') return (require)('vm')\n    else throw new Error('No such module. (Possibly not yet loaded)')\n};\n\n(function () {\n    var cwd = '/';\n    var path;\n    process.cwd = function () { return cwd };\n    process.chdir = function (dir) {\n        if (!path) path = require('path');\n        cwd = path.resolve(dir, cwd);\n    };\n})();\n\n//@ sourceURL=__browserify_process"
      )
    ),
    n.define(
      "/node_modules/voxel-engine/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = {}\n//@ sourceURL=/node_modules/voxel-engine/package.json"
      )
    ),
    n.define(
      "/node_modules/voxel-engine/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "var voxel = require('voxel')\nvar voxelMesh = require('voxel-mesh')\nvar voxelChunks = require('voxel-chunks')\nvar THREE = require('three')\nvar Stats = require('./lib/stats')\nvar Detector = require('./lib/detector')\nvar inherits = require('inherits')\nvar path = require('path')\nvar EventEmitter = require('events').EventEmitter\nif (process.browser) var interact = require('interact')\nvar playerPhysics = require('player-physics')\nvar requestAnimationFrame = require('raf')\nvar collisions = require('collide-3d-tilemap')\nvar aabb = require('aabb-3d')\nvar SpatialEventEmitter = require('spatial-events')\nvar regionChange = require('voxel-region-change')\nvar AXISES = ['x', 'y', 'z']\n\nmodule.exports = Game\n\nfunction Game(opts) {\n  if (!(this instanceof Game)) return new Game(opts)\n  var self = this\n  if (!opts) opts = {}\n  if (process.browser && this.notCapable()) return\n  if (!('generateChunks' in opts)) opts.generateChunks = true\n  this.generateChunks = opts.generateChunks\n  this.setConfigurablePositions(opts)\n  this.configureChunkLoading(opts)\n  this.THREE = THREE\n  this.cubeSize = opts.cubeSize || 25\n  this.chunkSize = opts.chunkSize || 32\n  // chunkDistance and removeDistance should not be set to the same thing\n  // as it causes lag when you go back and forth on a chunk boundary\n  this.chunkDistance = opts.chunkDistance || 2\n  this.removeDistance = opts.removeDistance || this.chunkDistance + 1\n  this.playerHeight = opts.playerHeight || 1.62 // gets multiplied by cubeSize\n  this.meshType = opts.meshType || 'surfaceMesh'\n  this.controlOptions = opts.controlOptions || {}\n  this.mesher = opts.mesher || voxel.meshers.greedy\n  this.items = []\n  this.voxels = voxel(this)\n  this.chunkGroups = voxelChunks(this)  \n  this.height = typeof window === \"undefined\" ? 1 : window.innerHeight\n  this.width = typeof window === \"undefined\" ? 1 : window.innerWidth\n  this.scene = new THREE.Scene()\n  this.camera = this.createCamera(this.scene)\n  this.controls = this.createControls()\n  if (!opts.lightsDisabled) this.addLights(this.scene)\n  this.controlLayouts = {\n    qwerty: {\n      87: 'moveForward', //w\n      65: 'moveLeft', //a\n      83: 'moveBackward', //s\n      68: 'moveRight', //d\n      32: 'wantsJump', //space\n    },\n    azerty: {\n      90: 'moveForward', //z\n      81: 'moveLeft', //q\n      83: 'moveBackward', //s\n      68: 'moveRight', //d\n      32: 'wantsJump', //space\n    },\n    dvorak: {\n      188: 'moveForward', //comma\n      65: 'moveLeft', //a\n      79: 'moveBackward', //o\n      69: 'moveRight', //e\n      32: 'wantsJump', //space\n    }\n  }\n  this.playerControls = opts.controlLayout ? this.controlLayouts[opts.controlLayout] : this.controlLayouts.qwerty\n  this.skyColor = opts.skyColor || 0xBFD1E5\n  this.fogScale = opts.fogScale || 1\n  if (!opts.controlsDisabled) this.bindControls(this.controls)\n  if (!opts.fogDisabled) this.scene.fog = new THREE.Fog( this.skyColor, 0.00025, this.worldWidth() * this.fogScale )\n  this.moveToPosition(this.startingPosition)\n  this.collideVoxels = collisions(\n    this.getTileAtIJK.bind(this),\n    this.cubeSize,\n    [Infinity, Infinity, Infinity],\n    [-Infinity, -Infinity, -Infinity]\n  )\n  this.spatial = new SpatialEventEmitter()\n  this.voxelRegion = regionChange(this.spatial, this.cubeSize)\n  this.chunkRegion = regionChange(this.spatial, this.cubeSize * this.chunkSize)\n  \n  // contains chunks that has had an update this tick. Will be generated right before redrawing the frame\n  this.chunksNeedsUpdate = {}\n\n  // client side only\n  if (process.browser) {\n    this.materials = require('voxel-texture')({\n      THREE: THREE,\n      texturePath: opts.texturePath || './textures/',\n      materialType: opts.materialType || THREE.MeshLambertMaterial,\n      materialParams: opts.materialParams || {}\n    })\n    this.materials.load(opts.materials || [['grass', 'dirt', 'grass_dirt'], 'brick', 'dirt'])\n    this.initializeRendering()\n  }\n  \n  if (this.generateChunks) {\n    self.voxels.on('missingChunk', function(chunkPos) {\n      var chunk = self.voxels.generateChunk(chunkPos[0], chunkPos[1], chunkPos[2])\n      if (process.browser) self.showChunk(chunk)\n    })\n    this.voxels.requestMissingChunks(this.worldOrigin)\n  }\n}\n\ninherits(Game, EventEmitter)\n\nGame.prototype.configureChunkLoading = function(opts) {\n  var self = this\n  if (!opts.generateChunks) return\n  if (!opts.generate) {\n    this.generate = function(x,y,z) {\n      return x*x+y*y+z*z <= 15*15 ? 1 : 0 // sphere world\n    }\n  } else {\n    this.generate = opts.generate\n  }\n  if (opts.generateVoxelChunk) {\n    this.generateVoxelChunk = opts.generateVoxelChunk\n  } else {\n    this.generateVoxelChunk = function(low, high) {\n      return voxel.generate(low, high, self.generate)\n    }\n  }\n}\n\nGame.prototype.worldWidth = function() {\n  return this.chunkSize * 2 * this.chunkDistance * this.cubeSize\n}\n\nGame.prototype.getTileAtIJK = function(i, j, k) {\n  var pos = this.tilespaceToWorldspace(i, j, k)\n  // TODO: @chrisdickinson: cache the chunk lookup by `i|j|k`\n  // since we'll be seeing the same chunk so often\n  var chunk = this.getChunkAtPosition(pos)\n\n  if(!chunk) {\n    return\n  }\n\n  var chunkPosition = this.chunkspaceToTilespace(chunk.position)\n  var chunkID = this.voxels.chunkAtPosition(pos).join('|') \n  var chunk = this.voxels.chunks[chunkID]\n   \n  i -= chunkPosition.i\n  j -= chunkPosition.j\n  k -= chunkPosition.k\n\n  var tileOffset = \n    i +\n    j * this.chunkSize +\n    k * this.chunkSize * this.chunkSize\n\n  return chunk.voxels[tileOffset] \n}\n\nGame.prototype.tilespaceToWorldspace = function(i, j, k) {\n  return {\n    x: i * this.cubeSize,\n    y: j * this.cubeSize,\n    z: k * this.cubeSize\n  }\n}\n\nGame.prototype.chunkspaceToTilespace = function(pos) {\n  return {\n    i: pos[0] * this.chunkSize,\n    j: pos[1] * this.chunkSize,\n    k: pos[2] * this.chunkSize\n  }\n}\n\nGame.prototype.getChunkAtPosition = function(pos) {\n  var chunkID = this.voxels.chunkAtPosition(pos).join('|') \n\n  var chunk = this.voxels.chunks[chunkID]\n  return chunk\n}\n\nGame.prototype.initializeRendering = function() {\n  var self = this\n  this.renderer = this.createRenderer()\n  if (!this.statsDisabled) this.addStats()\n  window.addEventListener('resize', this.onWindowResize.bind(this), false)\n  window.addEventListener('mousedown', this.onMouseDown.bind(this), false)\n  window.addEventListener('mouseup', this.onMouseUp.bind(this), false)\n  requestAnimationFrame(window).on('data', this.tick.bind(this))\n  this.chunkRegion.on('change', function(newChunk) {\n    self.removeFarChunks()\n  })\n}\n\nGame.prototype.removeFarChunks = function(playerPosition) {\n  var self = this\n  playerPosition = playerPosition || this.controls.yawObject.position\n  var nearbyChunks = this.voxels.nearbyChunks(playerPosition, this.removeDistance).map(function(chunkPos) {\n    return chunkPos.join('|')\n  })\n  Object.keys(self.voxels.chunks).map(function(chunkIndex) {\n    if (nearbyChunks.indexOf(chunkIndex) > -1) return\n    self.scene.remove(self.voxels.meshes[chunkIndex][self.meshType])\n    delete self.voxels.chunks[chunkIndex]\n  })\n  self.voxels.requestMissingChunks(playerPosition)\n}\n\nGame.prototype.parseVectorOption = function(vector) {\n  if (!vector) return\n  if (vector.length && typeof vector.length === 'number') return new THREE.Vector3(vector[0], vector[1], vector[2])\n  if (typeof vector === 'object') return new THREE.Vector3(vector.x, vector.y, vector.z)\n}\n\nGame.prototype.setConfigurablePositions = function(opts) {\n  var sp = opts.startingPosition\n  if (sp) sp = this.parseVectorOption(sp)\n  this.startingPosition = sp || new THREE.Vector3(35,1024,35)\n  var wo = opts.worldOrigin\n  if (wo) wo = this.parseVectorOption(wo)\n  this.worldOrigin = wo || new THREE.Vector3(0,0,0)\n}\n\nGame.prototype.notCapable = function() {\n  if( !Detector().webgl ) {\n    var wrapper = document.createElement('div')\n    wrapper.className = \"errorMessage\"\n    var a = document.createElement('a')\n    a.title = \"You need WebGL and Pointer Lock (Chrome 23/Firefox 14) to play this game. Click here for more information.\"\n    a.innerHTML = a.title\n    a.href = \"http://get.webgl.org\"\n    wrapper.appendChild(a)\n    this.element = wrapper\n    return true\n  }\n  return false\n}\n\nGame.prototype.setupPointerLock = function(element) {\n  var self = this\n  element = element || document.body\n  if (typeof element !== 'object') element = document.querySelector(element)\n  var pointer = this.pointer = interact(element)\n  if (!pointer.pointerAvailable()) this.pointerLockDisabled = true\n  pointer.on('attain', function(movements) {\n    self.controls.enabled = true\n    movements.pipe(self.controls)\n  })\n  pointer.on('release', function() {\n    self.controls.enabled = false\n  })\n  pointer.on('error', function() {\n    // user denied pointer lock OR it's not available\n    self.pointerLockDisabled = true\n    console.error('pointerlock error')\n  })\n}\n\nGame.prototype.requestPointerLock = function(element) {\n  if (!this.pointer) this.setupPointerLock(element)\n  this.pointer.request()\n}\n\nGame.prototype.moveToPosition = function(position) {\n  var pos = this.controls.yawObject.position\n  pos.x = position.x\n  pos.y = position.y\n  pos.z = position.z\n}\n\nGame.prototype.onWindowResize = function() {\n  this.camera.aspect = window.innerWidth / window.innerHeight\n  this.camera.updateProjectionMatrix()\n  this.renderer.setSize( window.innerWidth, window.innerHeight )\n}\n\nGame.prototype.addMarker = function(position) {\n  var geometry = new THREE.SphereGeometry( 1, 4, 4 );\n  var material = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } );\n  var mesh = new THREE.Mesh( geometry, material );\n  mesh.position.copy(position)\n  this.scene.add(mesh)\n}\n\nGame.prototype.addAABBMarker = function(aabb, color) {\n  var geometry = new THREE.CubeGeometry(aabb.width(), aabb.height(), aabb.depth())\n  var material = new THREE.MeshBasicMaterial({ color: color || 0xffffff, wireframe: true, transparent: true, opacity: 0.5, side: THREE.DoubleSide })\n  var mesh = new THREE.Mesh(geometry, material)\n  mesh.position.set(aabb.x0() + aabb.width() / 2, aabb.y0() + aabb.height() / 2, aabb.z0() + aabb.depth() / 2)\n  this.scene.add(mesh)\n}\n\nGame.prototype.addItem = function(item) {\n  var self = this\n  self.items.push(item)\n  item.velocity = item.velocity || { x: 0, y: 0, z: 0 }\n  item.collisionRadius = item.collisionRadius || item.size\n  if (!item.width) item.width = item.size\n  if (!item.height) item.height = item.size\n  if (!item.depth) item.depth = item.width\n\n  var ticker = item.tick\n  item.tick = function (dt) {\n    if (item.collisionRadius) {\n      var p0 = self.controls.yawObject.position.clone()\n      var p1 = self.controls.yawObject.position.clone()\n      p1.y -= 25\n      var d0 = distance(item.mesh.position, p0)\n      var d1 = distance(item.mesh.position, p1)\n      if (Math.min(d0, d1) <= item.collisionRadius) {\n        self.emit('collision', item)\n      }\n    }\n\n    if (!item.resting) {\n      var c = self.getCollisions(item.mesh.position, item)\n      if (c.bottom.length > 0) {\n        if (item.velocity.y <= 0) {\n          item.mesh.position.y -= item.velocity.y\n          item.velocity.y = 0\n          item.resting = true\n        }\n        item.velocity.x = 0\n        item.velocity.z = 0\n      } else if (c.middle.length || c.top.length) {\n        item.velocity.x *= -1\n        item.velocity.z *= -1\n      }\n\n      item.velocity.y -= 0.003\n      item.mesh.position.x += item.velocity.x * dt\n      item.mesh.position.y += item.velocity.y * dt\n      item.mesh.position.z += item.velocity.z * dt\n    }\n\n    if (ticker) ticker(item)\n  }\n  self.scene.add(item.mesh)\n}\n\nGame.prototype.removeItem = function(item) {\n  var ix = this.items.indexOf(item)\n  if (ix < 0) return\n  this.items.splice(ix, 1)\n  this.scene.remove(item.mesh)\n}\n\nGame.prototype.onMouseDown = function(e) {\n  if (!this.controls.enabled) return\n  var intersection = this.raycast()\n  if (intersection) this.emit('mousedown', intersection, e)\n}\n\nGame.prototype.onMouseUp = function(e) {\n  if (!this.controls.enabled) return\n  var intersection = this.raycast()\n  if (intersection) this.emit('mouseup', intersection, e)\n}\n\nGame.prototype.intersectAllMeshes = function(start, direction, maxDistance) {\n  var self = this\n  var meshes = Object.keys(self.voxels.meshes).map(function(key) {\n    return self.voxels.meshes[key][self.meshType]\n  }).concat(self.chunkGroups.meshes)\n  \n  var d = direction.subSelf(start).normalize()\n  var ray = new THREE.Raycaster(start, d, 0, maxDistance)\n  var intersections = ray.intersectObjects(meshes)\n  if (intersections.length === 0) return false\n  \n  var dists = intersections.map(function (i) { return i.distance })\n  var inter = intersections[dists.indexOf(Math.min.apply(null, dists))]\n  \n  var p = new THREE.Vector3()\n  p.copy(inter.point)\n  p.intersection = inter\n  p.direction = d\n  \n  var cm = self.chunkGroups.chunkMatricies[inter.object.id]\n  if (cm) p.chunkMatrix = cm\n  \n  p.x += d.x\n  p.y += d.y\n  p.z += d.z\n  return p\n}\n\nGame.prototype.raycast = function(maxDistance) {\n  var start = this.controls.yawObject.position.clone()\n  var direction = this.camera.matrixWorld.multiplyVector3(new THREE.Vector3(0,0,-1))\n  var intersects = this.intersectAllMeshes(start, direction, maxDistance)\n  return intersects\n}\n\nGame.prototype.createCamera = function() {\n  var camera;\n  camera = new THREE.PerspectiveCamera(60, this.width / this.height, 1, 10000)\n  camera.lookAt(new THREE.Vector3(0, 0, 0))\n  this.scene.add(camera)\n  return camera\n}\n\nGame.prototype.createControls = function(camera) {\n  var controls = playerPhysics(this.camera, this.controlOptions)\n  this.scene.add( controls.yawObject )\n  return controls\n}\n\nGame.prototype.createRenderer = function() {\n  this.renderer = new THREE.WebGLRenderer({\n    antialias: true\n  })\n  this.renderer.setSize(this.width, this.height)\n  this.renderer.setClearColorHex(this.skyColor, 1.0)\n  this.renderer.clear()\n  this.element = this.renderer.domElement\n  return this.renderer\n}\n\nGame.prototype.appendTo = function (element) {\n  if (typeof element === 'object') {\n    element.appendChild(this.element)\n  }\n  else {\n    document.querySelector(element).appendChild(this.element)\n  }\n}\n\nGame.prototype.addStats = function() {\n  stats = new Stats()\n  stats.domElement.style.position  = 'absolute'\n  stats.domElement.style.bottom  = '0px'\n  document.body.appendChild( stats.domElement )\n}\n\nGame.prototype.cameraRotation = function() {\n  var xAngle = this.controls.pitchObject.rotation.x\n  var yAngle = this.controls.yawObject.rotation.y\n  return {x: xAngle, y: yAngle}\n}\n\nGame.prototype.getCollisions = function(position, dims, checker, controls) {\n  var self = this\n  var p = position.clone()\n  var w = dims.width / 2\n  var h = dims.height / 2\n  var d = dims.depth / 2\n\n  controls = controls || this.controls\n  var rx = controls.pitchObject.rotation.x\n  var ry = controls.yawObject.rotation.y\n\n  var vertices = {\n    bottom: [\n      new THREE.Vector3(p.x - w, p.y - h, p.z - d),\n      new THREE.Vector3(p.x - w, p.y - h, p.z + d),\n      new THREE.Vector3(p.x + w, p.y - h, p.z - d),\n      new THREE.Vector3(p.x + w, p.y - h, p.z + d)\n    ],\n    middle: [\n      new THREE.Vector3(p.x - w, p.y, p.z - d),\n      new THREE.Vector3(p.x - w, p.y, p.z + d),\n      new THREE.Vector3(p.x + w, p.y, p.z - d),\n      new THREE.Vector3(p.x + w, p.y, p.z + d)\n    ],\n    top: [\n      new THREE.Vector3(p.x - w, p.y + h, p.z - d),\n      new THREE.Vector3(p.x - w, p.y + h, p.z + d),\n      new THREE.Vector3(p.x + w, p.y + h, p.z - d),\n      new THREE.Vector3(p.x + w, p.y + h, p.z + d)\n    ],\n    // -------------------------------\n    up: [ new THREE.Vector3(p.x, p.y + h, p.z) ],\n    down: [ new THREE.Vector3(p.x, p.y - h, p.z) ],\n    left: [\n      new THREE.Vector3(\n        p.x + w * Math.cos(ry + Math.PI / 2),\n        p.y,\n        p.z + d * Math.sin(ry + Math.PI / 2)\n      ) ,\n      new THREE.Vector3(\n        p.x + w * Math.cos(ry + Math.PI / 2),\n        p.y + h * 1.5,\n        p.z + d * Math.sin(ry + Math.PI / 2)\n      )\n    ],\n    right: [\n      new THREE.Vector3(\n        p.x + w * Math.cos(ry - Math.PI / 2),\n        p.y,\n        p.z + d * Math.sin(ry - Math.PI / 2)\n      ),\n      new THREE.Vector3(\n        p.x + w * Math.cos(ry - Math.PI / 2),\n        p.y + h * 1.5,\n        p.z + d * Math.sin(ry - Math.PI / 2)\n      )\n    ],\n    back: [\n      new THREE.Vector3(\n        p.x + w * Math.cos(ry),\n        p.y,\n        p.z + d * Math.sin(ry)\n      ),\n      new THREE.Vector3(\n        p.x + w * Math.cos(ry),\n        p.y + h * 1.5,\n        p.z + d * Math.sin(ry)\n      )\n    ],\n    forward: [\n      new THREE.Vector3(\n        p.x + w * Math.cos(ry + Math.PI),\n        p.y,\n        p.z + d * Math.sin(ry + Math.PI)\n      ),\n      new THREE.Vector3(\n        p.x + w * Math.cos(ry + Math.PI),\n        p.y + h * 1.5,\n        p.z + d * Math.sin(ry + Math.PI)\n      )\n    ]\n  }\n\n  return {\n    bottom: vertices.bottom.map(check).filter(Boolean),\n    middle: vertices.middle.map(check).filter(Boolean),\n    top: vertices.top.map(check).filter(Boolean),\n    // ----\n    up: vertices.up.map(check).filter(Boolean),\n    down: vertices.down.map(check).filter(Boolean),\n    left: vertices.left.map(check).filter(Boolean),\n    right: vertices.right.map(check).filter(Boolean),\n    forward: vertices.forward.map(check).filter(Boolean),\n    back: vertices.back.map(check).filter(Boolean)\n  }\n\n  function check(vertex) {\n    if (checker) return checker(vertex) && vertex\n    var val = self.voxels.voxelAtPosition(vertex)\n    return val && vertex\n  }\n}\n\nGame.prototype.addLights = function(scene) {\n  var ambientLight, directionalLight\n  ambientLight = new THREE.AmbientLight(0xcccccc)\n  scene.add(ambientLight)\n  var light	= new THREE.DirectionalLight( 0xffffff , 1)\n  light.position.set( 1, 1, 0.5 ).normalize()\n  scene.add( light )\n};\n\nGame.prototype.currentMesh = function() {\n  var cid = this.voxels.chunkAtPosition(this.controls.yawObject.position).join('|')\n  return this.voxels.meshes[cid]\n}\n\nGame.prototype.checkBlock = function(pos) {\n  var self = this\n  var direction = self.camera.matrixWorld.multiplyVector3(new THREE.Vector3(0,0,-1))\n  var start = self.controls.yawObject.position.clone()\n  var d = direction.subSelf(start).normalize()\n\n  var p = new THREE.Vector3()\n  p.copy(pos)\n  p.x -= 1.1 * d.x\n  p.y -= 1.1 * d.y\n  p.z -= 1.1 * d.z\n  var block = self.getBlock(p)\n  if (block) return false\n\n  var voxelVector = self.voxels.voxelVector(p)\n  var vidx = self.voxels.voxelIndex(voxelVector)\n  var c = self.voxels.chunkAtPosition(p)\n  var ckey = c.join('|')\n  var chunk = self.voxels.chunks[ckey]\n  if (!chunk) return false\n\n  var aabb = this.playerAABB()\n  var bottom = {x: aabb.x0(), y: aabb.y0(), z: aabb.z0()}\n  var playerVector = self.voxels.voxelVector(bottom)\n\n  if ( playerVector.x === voxelVector.x\n    && playerVector.y === voxelVector.y\n    && playerVector.z === voxelVector.z) return false\n  \n  return {chunkIndex: ckey, voxelVector: voxelVector}\n}\n\nGame.prototype.addChunkToNextUpdate = function(chunk) {\n  this.chunksNeedsUpdate[chunk.position.join('|')] = chunk\n}\n\nGame.prototype.updateDirtyChunks = function() {\n  var self = this;\n  Object.keys(this.chunksNeedsUpdate).forEach(function showChunkAtIndex(chunkIndex) {\n    var chunk = self.chunksNeedsUpdate[chunkIndex];\n    self.showChunk(chunk);\n  })\n  this.chunksNeedsUpdate = {}\n}\n\nGame.prototype.createBlock = function(pos, val) {\n  if (pos.chunkMatrix) {\n    return this.chunkGroups.createBlock(pos, val)\n  }\n  \n  var newBlock = this.checkBlock(pos)\n  if (!newBlock) return\n  var chunk = this.voxels.chunks[newBlock.chunkIndex]\n  var old = chunk.voxels[this.voxels.voxelIndex(newBlock.voxelVector)]\n  chunk.voxels[this.voxels.voxelIndex(newBlock.voxelVector)] = val\n  this.addChunkToNextUpdate(chunk)\n  this.spatial.emit('change-block', [pos.x, pos.y, pos.z], pos, old, val)\n  return true\n}\n\nGame.prototype.setBlock = function(pos, val) {\n  if (pos.chunkMatrix) {\n    return this.chunkGroups.setBlock(pos, val)\n  }\n  \n  var hitVoxel = this.voxels.voxelAtPosition(pos, val)\n  var c = this.voxels.chunkAtPosition(pos)\n  this.addChunkToNextUpdate(this.voxels.chunks[c.join('|')])\n\n  this.spatial.emit('change-block', [pos.x, pos.y, pos.z], pos, hitVoxel, val)\n}\n\nGame.prototype.getBlock = function(pos) {\n  if (pos.chunkMatrix) {\n    return this.chunkGroups.getBlock(pos)\n  }\n  return this.voxels.voxelAtPosition(pos)\n}\n\nGame.prototype.showChunk = function(chunk) {\n  var chunkIndex = chunk.position.join('|')\n  var bounds = this.voxels.getBounds.apply(this.voxels, chunk.position)\n  var cubeSize = this.cubeSize\n  var scale = new THREE.Vector3(cubeSize, cubeSize, cubeSize)\n  var mesh = voxelMesh(chunk, this.mesher, scale)\n  this.voxels.chunks[chunkIndex] = chunk\n  if (this.voxels.meshes[chunkIndex]) this.scene.remove(this.voxels.meshes[chunkIndex][this.meshType])\n  this.voxels.meshes[chunkIndex] = mesh\n  if (this.meshType === 'wireMesh') mesh.createWireMesh()\n  else mesh.createSurfaceMesh(new THREE.MeshFaceMaterial(this.materials.get()))\n  mesh.setPosition(bounds[0][0] * cubeSize, bounds[0][1] * cubeSize, bounds[0][2] * cubeSize)\n  mesh.addToScene(this.scene)\n  this.materials.paint(mesh.geometry)\n  this.items.forEach(function (item) { item.resting = false })\n  return mesh\n}\n\nGame.prototype.playerAABB = function(position) {\n  var pos = position || this.controls.yawObject.position\n  var size = this.cubeSize\n\n  var bbox = aabb([\n    pos.x - size / 4,\n    pos.y - size * this.playerHeight,\n    pos.z - size / 4\n  ], [\n    size / 2,\n    size * this.playerHeight,\n    size / 2\n  ])\n  return bbox\n}\n\nGame.prototype.updatePlayerPhysics = function(bbox, controls) {\n  var self = this\n  var pos = controls.yawObject.position\n  var yaw = controls.yawObject\n  var size = self.cubeSize\n\n  var base = [ pos.x, pos.y, pos.z ]\n  \n  var velocity = [\n    controls.velocity.x,\n    controls.velocity.y,\n    controls.velocity.z\n  ]\n  \n  var worldVector\n\n  yaw.translateX(velocity[0])\n  yaw.translateY(velocity[1])\n  yaw.translateZ(velocity[2])\n\n  worldVector = [\n    pos.x - base[0],\n    pos.y - base[1],\n    pos.z - base[2]\n  ]\n\n  yaw.translateX(-velocity[0])\n  yaw.translateY(-velocity[1])\n  yaw.translateZ(-velocity[2])\n\n  controls.freedom['y-'] = true\n\n  self.collideVoxels(bbox, worldVector, function(axis, tile, coords, dir, edgeVector) {\n    if (tile) {\n      worldVector[axis] = edgeVector\n      if (axis === 1 && dir === -1) {\n        controls.freedom['y-'] = false\n      }\n      self.spatial.emit(\n        'collide-'+AXISES[axis],\n        [worldVector[0] + base[0], worldVector[1] + base[1], worldVector[2] + base[2]],\n        tile, coords, dir\n      )\n      return true\n    }\n  })  \n  \n  var newLocation = new THREE.Vector3(\n    worldVector[0] + base[0], worldVector[1] + base[1], worldVector[2] + base[2]\n  )\n\n  pos.copy(newLocation)\n\n  self.spatial.emit('position', bbox, newLocation)\n\n}\n\nGame.prototype.bindControls = function (controls) {\n  var self = this\n  var onKeyDown = function ( event ) {\n    var command = self.playerControls[event.keyCode];\n    if (command) { controls.emit('command', command, true); }\n  }\n\n  var onKeyUp = function ( event ) {\n    var command = self.playerControls[event.keyCode];\n    if (command) { controls.emit('command', command, false); }\n  }\n\n  document.addEventListener( 'keydown', onKeyDown, false )\n  document.addEventListener( 'keyup', onKeyUp, false )\n}\n\nGame.prototype.tick = function(delta) {\n  var self = this\n  this.controls.tick(delta, function(controls) {\n    var bbox = self.playerAABB()\n    self.updatePlayerPhysics(bbox, controls)\n  })\n  this.items.forEach(function (item) { item.tick(delta) })\n  if (this.materials) this.materials.tick()\n  if (Object.keys(this.chunksNeedsUpdate).length > 0) this.updateDirtyChunks();\n  this.emit('tick', delta)\n  this.render(delta)\n  stats.update()\n}\n\nGame.prototype.render = function(delta) {\n  this.renderer.render(this.scene, this.camera)\n}\n\nfunction distance (a, b) {\n  var x = a.x - b.x\n  var y = a.y - b.y\n  var z = a.z - b.z\n  return Math.sqrt(x*x + y*y + z*z)\n}\n\n//@ sourceURL=/node_modules/voxel-engine/index.js"
      )
    ),
    n.define(
      "/node_modules/voxel/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"index.js"}\n//@ sourceURL=/node_modules/voxel/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "var chunker = require('./chunker')\n\nmodule.exports = function(opts) {\n  if (!opts.generateVoxelChunk) opts.generateVoxelChunk = function(low, high) {\n    return generate(low, high, module.exports.generator['Valley'])\n  }\n  return chunker(opts)\n}\n\nmodule.exports.meshers = {\n  culled: require('./meshers/culled').mesher,\n  greedy: require('./meshers/greedy').mesher,\n  monotone: require('./meshers/monotone').mesher,\n  stupid: require('./meshers/stupid').mesher\n}\n\nmodule.exports.Chunker = chunker.Chunker\nmodule.exports.geometry = {}\nmodule.exports.generator = {}\nmodule.exports.generate = generate\n\n// from https://github.com/mikolalysenko/mikolalysenko.github.com/blob/master/MinecraftMeshes2/js/testdata.js#L4\nfunction generate(l, h, f) {\n  var d = [ h[0]-l[0], h[1]-l[1], h[2]-l[2] ]\n  var v = new Int8Array(d[0]*d[1]*d[2])\n  var n = 0\n  for(var k=l[2]; k<h[2]; ++k)\n  for(var j=l[1]; j<h[1]; ++j)\n  for(var i=l[0]; i<h[0]; ++i, ++n) {\n    v[n] = f(i,j,k,n)\n  }\n  return {voxels:v, dims:d}\n}\n\n// shape and terrain generator functions\nmodule.exports.generator['Sphere'] = function(i,j,k) {\n  return i*i+j*j+k*k <= 16*16 ? 1 : 0\n}\n\nmodule.exports.generator['Noise'] = function(i,j,k) {\n  return Math.random() < 0.1 ? Math.random() * 0xffffff : 0;\n}\n\nmodule.exports.generator['Dense Noise'] = function(i,j,k) {\n  return Math.round(Math.random() * 0xffffff);\n}\n\nmodule.exports.generator['Checker'] = function(i,j,k) {\n  return !!((i+j+k)&1) ? (((i^j^k)&2) ? 1 : 0xffffff) : 0;\n}\n\nmodule.exports.generator['Hill'] = function(i,j,k) {\n  return j <= 16 * Math.exp(-(i*i + k*k) / 64) ? 1 : 0;\n}\n\nmodule.exports.generator['Valley'] = function(i,j,k) {\n  return j <= (i*i + k*k) * 31 / (32*32*2) + 1 ? 1 : 0;\n}\n\nmodule.exports.generator['Hilly Terrain'] = function(i,j,k) {\n  var h0 = 3.0 * Math.sin(Math.PI * i / 12.0 - Math.PI * k * 0.1) + 27;    \n  if(j > h0+1) {\n    return 0;\n  }\n  if(h0 <= j) {\n    return 1;\n  }\n  var h1 = 2.0 * Math.sin(Math.PI * i * 0.25 - Math.PI * k * 0.3) + 20;\n  if(h1 <= j) {\n    return 2;\n  }\n  if(2 < j) {\n    return Math.random() < 0.1 ? 0x222222 : 0xaaaaaa;\n  }\n  return 3;\n}\n\nmodule.exports.scale = function ( x, fromLow, fromHigh, toLow, toHigh ) {\n  return ( x - fromLow ) * ( toHigh - toLow ) / ( fromHigh - fromLow ) + toLow\n}\n\n// convenience function that uses the above functions to prebake some simple voxel geometries\nmodule.exports.generateExamples = function() {\n  return {\n    'Sphere': generate([-16,-16,-16], [16,16,16], module.exports.generator['Sphere']),\n    'Noise': generate([0,0,0], [16,16,16], module.exports.generator['Noise']),\n    'Dense Noise': generate([0,0,0], [16,16,16], module.exports.generator['Dense Noise']),\n    'Checker': generate([0,0,0], [8,8,8], module.exports.generator['Checker']),\n    'Hill': generate([-16, 0, -16], [16,16,16], module.exports.generator['Hill']),\n    'Valley': generate([0,0,0], [32,32,32], module.exports.generator['Valley']),\n    'Hilly Terrain': generate([0, 0, 0], [32,32,32], module.exports.generator['Hilly Terrain'])\n  }\n}\n\n\n//@ sourceURL=/node_modules/voxel/index.js"
      )
    ),
    n.define(
      "/node_modules/voxel/chunker.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "var events = require('events')\nvar inherits = require('inherits')\n\nmodule.exports = function(opts) {\n  return new Chunker(opts)\n}\n\nmodule.exports.Chunker = Chunker\n\nfunction Chunker(opts) {\n  this.distance = opts.chunkDistance || 2\n  this.chunkSize = opts.chunkSize || 32\n  this.cubeSize = opts.cubeSize || 25\n  this.generateVoxelChunk = opts.generateVoxelChunk\n  this.chunks = {}\n  this.meshes = {}\n}\n\ninherits(Chunker, events.EventEmitter)\n\nChunker.prototype.nearbyChunks = function(position, distance) {\n  var current = this.chunkAtPosition(position)\n  var x = current[0]\n  var y = current[1]\n  var z = current[2]\n  var dist = distance || this.distance\n  var nearby = []\n  for (var cx = (x - dist); cx !== (x + dist); ++cx) {\n    for (var cy = (y - dist); cy !== (y + dist); ++cy) {\n      for (var cz = (z - dist); cz !== (z + dist); ++cz) {\n        nearby.push([cx, cy, cz])\n      }\n    }\n  }\n  return nearby\n}\n\nChunker.prototype.requestMissingChunks = function(position) {\n  var self = this\n  this.nearbyChunks(position).map(function(chunk) {\n    if (!self.chunks[chunk.join('|')]) {\n      self.emit('missingChunk', chunk)\n    }\n  })\n}\n\nChunker.prototype.getBounds = function(x, y, z) {\n  var size = this.chunkSize\n  var low = [x * size, y * size, z * size]\n  var high = [low[0] + size, low[1] + size, low[2] + size]\n  return [low, high]\n}\n\nChunker.prototype.generateChunk = function(x, y, z) {\n  var self = this\n  var bounds = this.getBounds(x, y, z)\n  var chunk = this.generateVoxelChunk(bounds[0], bounds[1], x, y, z)\n  var position = [x, y, z]\n  chunk.position = position\n  this.chunks[position.join('|')] = chunk\n  return chunk\n}\n\nChunker.prototype.chunkAtPosition = function(position) {\n  var chunkSize = this.chunkSize\n  var cubeSize = this.cubeSize\n  var cx = position.x / cubeSize / chunkSize\n  var cy = position.y / cubeSize / chunkSize\n  var cz = position.z / cubeSize / chunkSize\n  var chunkPos = [Math.floor(cx), Math.floor(cy), Math.floor(cz)]\n  return chunkPos\n};\n\nChunker.prototype.voxelIndex = function(voxelVector) {\n  var size = this.chunkSize\n  var vidx = voxelVector.x + voxelVector.y*size + voxelVector.z*size*size\n  return vidx\n}\n\nChunker.prototype.voxelIndexFromPosition = function(pos) {\n  var v = this.voxelVector(pos)\n  return this.voxelIndex(v)\n}\n\nChunker.prototype.voxelAtPosition = function(pos, val) {\n  var ckey = this.chunkAtPosition(pos).join('|')\n  var chunk = this.chunks[ckey]\n  if (!chunk) return false\n  var vector = this.voxelVector(pos)\n  var vidx = this.voxelIndex(vector)\n  if (!vidx && vidx !== 0) return false\n  if (typeof val !== 'undefined') {\n    chunk.voxels[vidx] = val\n  }\n  var v = chunk.voxels[vidx]\n  return v\n}\n\nChunker.prototype.voxelVector = function(pos) {\n  var size = this.chunkSize\n  var cubeSize = this.cubeSize\n  var vx = (size + Math.floor(pos.x / cubeSize) % size) % size\n  var vy = (size + Math.floor(pos.y / cubeSize) % size) % size\n  var vz = (size + Math.floor(pos.z / cubeSize) % size) % size\n  return {x: Math.abs(vx), y: Math.abs(vy), z: Math.abs(vz)}\n};\n\n//@ sourceURL=/node_modules/voxel/chunker.js"
      )
    ),
    n.define(
      "events",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "if (!process.EventEmitter) process.EventEmitter = function () {};\n\nvar EventEmitter = exports.EventEmitter = process.EventEmitter;\nvar isArray = typeof Array.isArray === 'function'\n    ? Array.isArray\n    : function (xs) {\n        return Object.prototype.toString.call(xs) === '[object Array]'\n    }\n;\nfunction indexOf (xs, x) {\n    if (xs.indexOf) return xs.indexOf(x);\n    for (var i = 0; i < xs.length; i++) {\n        if (x === xs[i]) return i;\n    }\n    return -1;\n}\n\n// By default EventEmitters will print a warning if more than\n// 10 listeners are added to it. This is a useful default which\n// helps finding memory leaks.\n//\n// Obviously not all Emitters should be limited to 10. This function allows\n// that to be increased. Set to zero for unlimited.\nvar defaultMaxListeners = 10;\nEventEmitter.prototype.setMaxListeners = function(n) {\n  if (!this._events) this._events = {};\n  this._events.maxListeners = n;\n};\n\n\nEventEmitter.prototype.emit = function(type) {\n  // If there is no 'error' event listener then throw.\n  if (type === 'error') {\n    if (!this._events || !this._events.error ||\n        (isArray(this._events.error) && !this._events.error.length))\n    {\n      if (arguments[1] instanceof Error) {\n        throw arguments[1]; // Unhandled 'error' event\n      } else {\n        throw new Error(\"Uncaught, unspecified 'error' event.\");\n      }\n      return false;\n    }\n  }\n\n  if (!this._events) return false;\n  var handler = this._events[type];\n  if (!handler) return false;\n\n  if (typeof handler == 'function') {\n    switch (arguments.length) {\n      // fast cases\n      case 1:\n        handler.call(this);\n        break;\n      case 2:\n        handler.call(this, arguments[1]);\n        break;\n      case 3:\n        handler.call(this, arguments[1], arguments[2]);\n        break;\n      // slower\n      default:\n        var args = Array.prototype.slice.call(arguments, 1);\n        handler.apply(this, args);\n    }\n    return true;\n\n  } else if (isArray(handler)) {\n    var args = Array.prototype.slice.call(arguments, 1);\n\n    var listeners = handler.slice();\n    for (var i = 0, l = listeners.length; i < l; i++) {\n      listeners[i].apply(this, args);\n    }\n    return true;\n\n  } else {\n    return false;\n  }\n};\n\n// EventEmitter is defined in src/node_events.cc\n// EventEmitter.prototype.emit() is also defined there.\nEventEmitter.prototype.addListener = function(type, listener) {\n  if ('function' !== typeof listener) {\n    throw new Error('addListener only takes instances of Function');\n  }\n\n  if (!this._events) this._events = {};\n\n  // To avoid recursion in the case that type == \"newListeners\"! Before\n  // adding it to the listeners, first emit \"newListeners\".\n  this.emit('newListener', type, listener);\n\n  if (!this._events[type]) {\n    // Optimize the case of one listener. Don't need the extra array object.\n    this._events[type] = listener;\n  } else if (isArray(this._events[type])) {\n\n    // Check for listener leak\n    if (!this._events[type].warned) {\n      var m;\n      if (this._events.maxListeners !== undefined) {\n        m = this._events.maxListeners;\n      } else {\n        m = defaultMaxListeners;\n      }\n\n      if (m && m > 0 && this._events[type].length > m) {\n        this._events[type].warned = true;\n        console.error('(node) warning: possible EventEmitter memory ' +\n                      'leak detected. %d listeners added. ' +\n                      'Use emitter.setMaxListeners() to increase limit.',\n                      this._events[type].length);\n        console.trace();\n      }\n    }\n\n    // If we've already got an array, just append.\n    this._events[type].push(listener);\n  } else {\n    // Adding the second element, need to change to array.\n    this._events[type] = [this._events[type], listener];\n  }\n\n  return this;\n};\n\nEventEmitter.prototype.on = EventEmitter.prototype.addListener;\n\nEventEmitter.prototype.once = function(type, listener) {\n  var self = this;\n  self.on(type, function g() {\n    self.removeListener(type, g);\n    listener.apply(this, arguments);\n  });\n\n  return this;\n};\n\nEventEmitter.prototype.removeListener = function(type, listener) {\n  if ('function' !== typeof listener) {\n    throw new Error('removeListener only takes instances of Function');\n  }\n\n  // does not use listeners(), so no side effect of creating _events[type]\n  if (!this._events || !this._events[type]) return this;\n\n  var list = this._events[type];\n\n  if (isArray(list)) {\n    var i = indexOf(list, listener);\n    if (i < 0) return this;\n    list.splice(i, 1);\n    if (list.length == 0)\n      delete this._events[type];\n  } else if (this._events[type] === listener) {\n    delete this._events[type];\n  }\n\n  return this;\n};\n\nEventEmitter.prototype.removeAllListeners = function(type) {\n  // does not use listeners(), so no side effect of creating _events[type]\n  if (type && this._events && this._events[type]) this._events[type] = null;\n  return this;\n};\n\nEventEmitter.prototype.listeners = function(type) {\n  if (!this._events) this._events = {};\n  if (!this._events[type]) this._events[type] = [];\n  if (!isArray(this._events[type])) {\n    this._events[type] = [this._events[type]];\n  }\n  return this._events[type];\n};\n\n//@ sourceURL=events"
      )
    ),
    n.define(
      "/node_modules/voxel/node_modules/inherits/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"./inherits.js"}\n//@ sourceURL=/node_modules/voxel/node_modules/inherits/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel/node_modules/inherits/inherits.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = inherits\n\nfunction inherits (c, p, proto) {\n  proto = proto || {}\n  var e = {}\n  ;[c.prototype, proto].forEach(function (s) {\n    Object.getOwnPropertyNames(s).forEach(function (k) {\n      e[k] = Object.getOwnPropertyDescriptor(s, k)\n    })\n  })\n  c.prototype = Object.create(p.prototype, e)\n  c.super = p\n}\n\n//function Child () {\n//  Child.super.call(this)\n//  console.error([this\n//                ,this.constructor\n//                ,this.constructor === Child\n//                ,this.constructor.super === Parent\n//                ,Object.getPrototypeOf(this) === Child.prototype\n//                ,Object.getPrototypeOf(Object.getPrototypeOf(this))\n//                 === Parent.prototype\n//                ,this instanceof Child\n//                ,this instanceof Parent])\n//}\n//function Parent () {}\n//inherits(Child, Parent)\n//new Child\n\n//@ sourceURL=/node_modules/voxel/node_modules/inherits/inherits.js"
      )
    ),
    n.define(
      "/node_modules/voxel/meshers/culled.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "//Naive meshing (with face culling)\nfunction CulledMesh(volume, dims) {\n  //Precalculate direction vectors for convenience\n  var dir = new Array(3);\n  for(var i=0; i<3; ++i) {\n    dir[i] = [[0,0,0], [0,0,0]];\n    dir[i][0][(i+1)%3] = 1;\n    dir[i][1][(i+2)%3] = 1;\n  }\n  //March over the volume\n  var vertices = []\n    , faces = []\n    , x = [0,0,0]\n    , B = [[false,true]    //Incrementally update bounds (this is a bit ugly)\n          ,[false,true]\n          ,[false,true]]\n    , n = -dims[0]*dims[1];\n  for(           B[2]=[false,true],x[2]=-1; x[2]<dims[2]; B[2]=[true,(++x[2]<dims[2]-1)])\n  for(n-=dims[0],B[1]=[false,true],x[1]=-1; x[1]<dims[1]; B[1]=[true,(++x[1]<dims[1]-1)])\n  for(n-=1,      B[0]=[false,true],x[0]=-1; x[0]<dims[0]; B[0]=[true,(++x[0]<dims[0]-1)], ++n) {\n    //Read current voxel and 3 neighboring voxels using bounds check results\n    var p =   (B[0][0] && B[1][0] && B[2][0]) ? volume[n]                 : 0\n      , b = [ (B[0][1] && B[1][0] && B[2][0]) ? volume[n+1]               : 0\n            , (B[0][0] && B[1][1] && B[2][0]) ? volume[n+dims[0]]         : 0\n            , (B[0][0] && B[1][0] && B[2][1]) ? volume[n+dims[0]*dims[1]] : 0\n          ];\n    //Generate faces\n    for(var d=0; d<3; ++d)\n    if((!!p) !== (!!b[d])) {\n      var s = !p ? 1 : 0;\n      var t = [x[0],x[1],x[2]]\n        , u = dir[d][s]\n        , v = dir[d][s^1];\n      ++t[d];\n      \n      var vertex_count = vertices.length;\n      vertices.push([t[0],           t[1],           t[2]          ]);\n      vertices.push([t[0]+u[0],      t[1]+u[1],      t[2]+u[2]     ]);\n      vertices.push([t[0]+u[0]+v[0], t[1]+u[1]+v[1], t[2]+u[2]+v[2]]);\n      vertices.push([t[0]     +v[0], t[1]     +v[1], t[2]     +v[2]]);\n      faces.push([vertex_count, vertex_count+1, vertex_count+2, vertex_count+3, s ? b[d] : p]);\n    }\n  }\n  return { vertices:vertices, faces:faces };\n}\n\n\nif(exports) {\n  exports.mesher = CulledMesh;\n}\n\n//@ sourceURL=/node_modules/voxel/meshers/culled.js"
      )
    ),
    n.define(
      "/node_modules/voxel/meshers/greedy.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "var GreedyMesh = (function() {\n//Cache buffer internally\nvar mask = new Int32Array(4096);\n\nreturn function(volume, dims) {\n  var vertices = [], faces = []\n    , dimsX = dims[0]\n    , dimsY = dims[1]\n    , dimsXY = dimsX * dimsY;\n\n  //Sweep over 3-axes\n  for(var d=0; d<3; ++d) {\n    var i, j, k, l, w, W, h, n, c\n      , u = (d+1)%3\n      , v = (d+2)%3\n      , x = [0,0,0]\n      , q = [0,0,0]\n      , du = [0,0,0]\n      , dv = [0,0,0]\n      , dimsD = dims[d]\n      , dimsU = dims[u]\n      , dimsV = dims[v]\n      , qdimsX, qdimsXY\n      , xd\n\n    if (mask.length < dimsU * dimsV) {\n      mask = new Int32Array(dimsU * dimsV);\n    }\n\n    q[d] =  1;\n    x[d] = -1;\n\n    qdimsX  = dimsX  * q[1]\n    qdimsXY = dimsXY * q[2]\n\n    // Compute mask\n    while (x[d] < dimsD) {\n      xd = x[d]\n      n = 0;\n\n      for(x[v] = 0; x[v] < dimsV; ++x[v]) {\n        for(x[u] = 0; x[u] < dimsU; ++x[u], ++n) {\n          var a = xd >= 0      && volume[x[0]      + dimsX * x[1]          + dimsXY * x[2]          ]\n            , b = xd < dimsD-1 && volume[x[0]+q[0] + dimsX * x[1] + qdimsX + dimsXY * x[2] + qdimsXY]\n          if (a ? b : !b) {\n            mask[n] = 0; continue;\n          }\n          mask[n] = a ? a : -b;\n        }\n      }\n\n      ++x[d];\n\n      // Generate mesh for mask using lexicographic ordering\n      n = 0;\n      for (j=0; j < dimsV; ++j) {\n        for (i=0; i < dimsU; ) {\n          c = mask[n];\n          if (!c) {\n            i++;  n++; continue;\n          }\n\n          //Compute width\n          w = 1;\n          while (c === mask[n+w] && i+w < dimsU) w++;\n\n          //Compute height (this is slightly awkward)\n          for (h=1; j+h < dimsV; ++h) {\n            k = 0;\n            while (k < w && c === mask[n+k+h*dimsU]) k++\n            if (k < w) break;\n          }\n\n          // Add quad\n          // The du/dv arrays are reused/reset\n          // for each iteration.\n          du[d] = 0; dv[d] = 0;\n          x[u]  = i;  x[v] = j;\n\n          if (c > 0) {\n            dv[v] = h; dv[u] = 0;\n            du[u] = w; du[v] = 0;\n          } else {\n            c = -c;\n            du[v] = h; du[u] = 0;\n            dv[u] = w; dv[v] = 0;\n          }\n          var vertex_count = vertices.length;\n          vertices.push([x[0],             x[1],             x[2]            ]);\n          vertices.push([x[0]+du[0],       x[1]+du[1],       x[2]+du[2]      ]);\n          vertices.push([x[0]+du[0]+dv[0], x[1]+du[1]+dv[1], x[2]+du[2]+dv[2]]);\n          vertices.push([x[0]      +dv[0], x[1]      +dv[1], x[2]      +dv[2]]);\n          faces.push([vertex_count, vertex_count+1, vertex_count+2, vertex_count+3, c]);\n\n          //Zero-out mask\n          W = n + w;\n          for(l=0; l<h; ++l) {\n            for(k=n; k<W; ++k) {\n              mask[k+l*dimsU] = 0;\n            }\n          }\n\n          //Increment counters and continue\n          i += w; n += w;\n        }\n      }\n    }\n  }\n  return { vertices:vertices, faces:faces };\n}\n})();\n\nif(exports) {\n  exports.mesher = GreedyMesh;\n}\n\n//@ sourceURL=/node_modules/voxel/meshers/greedy.js"
      )
    ),
    n.define(
      "/node_modules/voxel/meshers/monotone.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        '"use strict";\n\nvar MonotoneMesh = (function(){\n\nfunction MonotonePolygon(c, v, ul, ur) {\n  this.color  = c;\n  this.left   = [[ul, v]];\n  this.right  = [[ur, v]];\n};\n\nMonotonePolygon.prototype.close_off = function(v) {\n  this.left.push([ this.left[this.left.length-1][0], v ]);\n  this.right.push([ this.right[this.right.length-1][0], v ]);\n};\n\nMonotonePolygon.prototype.merge_run = function(v, u_l, u_r) {\n  var l = this.left[this.left.length-1][0]\n    , r = this.right[this.right.length-1][0]; \n  if(l !== u_l) {\n    this.left.push([ l, v ]);\n    this.left.push([ u_l, v ]);\n  }\n  if(r !== u_r) {\n    this.right.push([ r, v ]);\n    this.right.push([ u_r, v ]);\n  }\n};\n\n\nreturn function(volume, dims) {\n  function f(i,j,k) {\n    return volume[i + dims[0] * (j + dims[1] * k)];\n  }\n  //Sweep over 3-axes\n  var vertices = [], faces = [];\n  for(var d=0; d<3; ++d) {\n    var i, j, k\n      , u = (d+1)%3   //u and v are orthogonal directions to d\n      , v = (d+2)%3\n      , x = new Int32Array(3)\n      , q = new Int32Array(3)\n      , runs = new Int32Array(2 * (dims[u]+1))\n      , frontier = new Int32Array(dims[u])  //Frontier is list of pointers to polygons\n      , next_frontier = new Int32Array(dims[u])\n      , left_index = new Int32Array(2 * dims[v])\n      , right_index = new Int32Array(2 * dims[v])\n      , stack = new Int32Array(24 * dims[v])\n      , delta = [[0,0], [0,0]];\n    //q points along d-direction\n    q[d] = 1;\n    //Initialize sentinel\n    for(x[d]=-1; x[d]<dims[d]; ) {\n      // --- Perform monotone polygon subdivision ---\n      var n = 0\n        , polygons = []\n        , nf = 0;\n      for(x[v]=0; x[v]<dims[v]; ++x[v]) {\n        //Make one pass over the u-scan line of the volume to run-length encode polygon\n        var nr = 0, p = 0, c = 0;\n        for(x[u]=0; x[u]<dims[u]; ++x[u], p = c) {\n          //Compute the type for this face\n          var a = (0    <= x[d]      ? f(x[0],      x[1],      x[2])      : 0)\n            , b = (x[d] <  dims[d]-1 ? f(x[0]+q[0], x[1]+q[1], x[2]+q[2]) : 0);\n          c = a;\n          if((!a) === (!b)) {\n            c = 0;\n          } else if(!a) {\n            c = -b;\n          }\n          //If cell type doesn\'t match, start a new run\n          if(p !== c) {\n            runs[nr++] = x[u];\n            runs[nr++] = c;\n          }\n        }\n        //Add sentinel run\n        runs[nr++] = dims[u];\n        runs[nr++] = 0;\n        //Update frontier by merging runs\n        var fp = 0;\n        for(var i=0, j=0; i<nf && j<nr-2; ) {\n          var p    = polygons[frontier[i]]\n            , p_l  = p.left[p.left.length-1][0]\n            , p_r  = p.right[p.right.length-1][0]\n            , p_c  = p.color\n            , r_l  = runs[j]    //Start of run\n            , r_r  = runs[j+2]  //End of run\n            , r_c  = runs[j+1]; //Color of run\n          //Check if we can merge run with polygon\n          if(r_r > p_l && p_r > r_l && r_c === p_c) {\n            //Merge run\n            p.merge_run(x[v], r_l, r_r);\n            //Insert polygon into frontier\n            next_frontier[fp++] = frontier[i];\n            ++i;\n            j += 2;\n          } else {\n            //Check if we need to advance the run pointer\n            if(r_r <= p_r) {\n              if(!!r_c) {\n                var n_poly = new MonotonePolygon(r_c, x[v], r_l, r_r);\n                next_frontier[fp++] = polygons.length;\n                polygons.push(n_poly);\n              }\n              j += 2;\n            }\n            //Check if we need to advance the frontier pointer\n            if(p_r <= r_r) {\n              p.close_off(x[v]);\n              ++i;\n            }\n          }\n        }\n        //Close off any residual polygons\n        for(; i<nf; ++i) {\n          polygons[frontier[i]].close_off(x[v]);\n        }\n        //Add any extra runs to frontier\n        for(; j<nr-2; j+=2) {\n          var r_l  = runs[j]\n            , r_r  = runs[j+2]\n            , r_c  = runs[j+1];\n          if(!!r_c) {\n            var n_poly = new MonotonePolygon(r_c, x[v], r_l, r_r);\n            next_frontier[fp++] = polygons.length;\n            polygons.push(n_poly);\n          }\n        }\n        //Swap frontiers\n        var tmp = next_frontier;\n        next_frontier = frontier;\n        frontier = tmp;\n        nf = fp;\n      }\n      //Close off frontier\n      for(var i=0; i<nf; ++i) {\n        var p = polygons[frontier[i]];\n        p.close_off(dims[v]);\n      }\n      // --- Monotone subdivision of polygon is complete at this point ---\n      \n      x[d]++;\n      \n      //Now we just need to triangulate each monotone polygon\n      for(var i=0; i<polygons.length; ++i) {\n        var p = polygons[i]\n          , c = p.color\n          , flipped = false;\n        if(c < 0) {\n          flipped = true;\n          c = -c;\n        }\n        for(var j=0; j<p.left.length; ++j) {\n          left_index[j] = vertices.length;\n          var y = [0.0,0.0,0.0]\n            , z = p.left[j];\n          y[d] = x[d];\n          y[u] = z[0];\n          y[v] = z[1];\n          vertices.push(y);\n        }\n        for(var j=0; j<p.right.length; ++j) {\n          right_index[j] = vertices.length;\n          var y = [0.0,0.0,0.0]\n            , z = p.right[j];\n          y[d] = x[d];\n          y[u] = z[0];\n          y[v] = z[1];\n          vertices.push(y);\n        }\n        //Triangulate the monotone polygon\n        var bottom = 0\n          , top = 0\n          , l_i = 1\n          , r_i = 1\n          , side = true;  //true = right, false = left\n        \n        stack[top++] = left_index[0];\n        stack[top++] = p.left[0][0];\n        stack[top++] = p.left[0][1];\n        \n        stack[top++] = right_index[0];\n        stack[top++] = p.right[0][0];\n        stack[top++] = p.right[0][1];\n        \n        while(l_i < p.left.length || r_i < p.right.length) {\n          //Compute next side\n          var n_side = false;\n          if(l_i === p.left.length) {\n            n_side = true;\n          } else if(r_i !== p.right.length) {\n            var l = p.left[l_i]\n              , r = p.right[r_i];\n            n_side = l[1] > r[1];\n          }\n          var idx = n_side ? right_index[r_i] : left_index[l_i]\n            , vert = n_side ? p.right[r_i] : p.left[l_i];\n          if(n_side !== side) {\n            //Opposite side\n            while(bottom+3 < top) {\n              if(flipped === n_side) {\n                faces.push([ stack[bottom], stack[bottom+3], idx, c]);\n              } else {\n                faces.push([ stack[bottom+3], stack[bottom], idx, c]);              \n              }\n              bottom += 3;\n            }\n          } else {\n            //Same side\n            while(bottom+3 < top) {\n              //Compute convexity\n              for(var j=0; j<2; ++j)\n              for(var k=0; k<2; ++k) {\n                delta[j][k] = stack[top-3*(j+1)+k+1] - vert[k];\n              }\n              var det = delta[0][0] * delta[1][1] - delta[1][0] * delta[0][1];\n              if(n_side === (det > 0)) {\n                break;\n              }\n              if(det !== 0) {\n                if(flipped === n_side) {\n                  faces.push([ stack[top-3], stack[top-6], idx, c ]);\n                } else {\n                  faces.push([ stack[top-6], stack[top-3], idx, c ]);\n                }\n              }\n              top -= 3;\n            }\n          }\n          //Push vertex\n          stack[top++] = idx;\n          stack[top++] = vert[0];\n          stack[top++] = vert[1];\n          //Update loop index\n          if(n_side) {\n            ++r_i;\n          } else {\n            ++l_i;\n          }\n          side = n_side;\n        }\n      }\n    }\n  }\n  return { vertices:vertices, faces:faces };\n}\n})();\n\nif(exports) {\n  exports.mesher = MonotoneMesh;\n}\n\n//@ sourceURL=/node_modules/voxel/meshers/monotone.js'
      )
    ),
    n.define(
      "/node_modules/voxel/meshers/stupid.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "//The stupidest possible way to generate a Minecraft mesh (I think)\nfunction StupidMesh(volume, dims) {\n  var vertices = [], faces = [], x = [0,0,0], n = 0;\n  for(x[2]=0; x[2]<dims[2]; ++x[2])\n  for(x[1]=0; x[1]<dims[1]; ++x[1])\n  for(x[0]=0; x[0]<dims[0]; ++x[0], ++n)\n  if(!!volume[n]) {\n    for(var d=0; d<3; ++d) {\n      var t = [x[0], x[1], x[2]]\n        , u = [0,0,0]\n        , v = [0,0,0];\n      u[(d+1)%3] = 1;\n      v[(d+2)%3] = 1;\n      for(var s=0; s<2; ++s) {\n        t[d] = x[d] + s;\n        var tmp = u;\n        u = v;\n        v = tmp;\n        var vertex_count = vertices.length;\n        vertices.push([t[0],           t[1],           t[2]          ]);\n        vertices.push([t[0]+u[0],      t[1]+u[1],      t[2]+u[2]     ]);\n        vertices.push([t[0]+u[0]+v[0], t[1]+u[1]+v[1], t[2]+u[2]+v[2]]);\n        vertices.push([t[0]     +v[0], t[1]     +v[1], t[2]     +v[2]]);\n        faces.push([vertex_count, vertex_count+1, vertex_count+2, vertex_count+3, volume[n]]);\n      }\n    }\n  }\n  return { vertices:vertices, faces:faces };\n}\n\n\nif(exports) {\n  exports.mesher = StupidMesh;\n}\n\n//@ sourceURL=/node_modules/voxel/meshers/stupid.js"
      )
    ),
    n.define(
      "/node_modules/voxel-mesh/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"index.js"}\n//@ sourceURL=/node_modules/voxel-mesh/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel-mesh/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "var THREE = require('three')\n\nmodule.exports = function(data, scaleFactor, mesher) {\n  return new Mesh(data, scaleFactor, mesher)\n}\n\nmodule.exports.Mesh = Mesh\n\nfunction Mesh(data, mesher, scaleFactor) {\n  this.data = data\n  var geometry = this.geometry = new THREE.Geometry()\n  this.scale = scaleFactor || new THREE.Vector3(10, 10, 10)\n  \n  var result = mesher( data.voxels, data.dims )\n  this.meshed = result\n\n  geometry.vertices.length = 0\n  geometry.faces.length = 0\n\n  for (var i = 0; i < result.vertices.length; ++i) {\n    var q = result.vertices[i]\n    geometry.vertices.push(new THREE.Vector3(q[0], q[1], q[2]))\n  } \n  \n  for (var i = 0; i < result.faces.length; ++i) {\n    geometry.faceVertexUvs[0].push(this.faceVertexUv(i))\n    \n    var q = result.faces[i]\n    if (q.length === 5) {\n      var f = new THREE.Face4(q[0], q[1], q[2], q[3])\n      f.color = new THREE.Color(q[4])\n      f.vertexColors = [f.color,f.color,f.color,f.color]\n      geometry.faces.push(f)\n    } else if (q.length == 4) {\n      var f = new THREE.Face3(q[0], q[1], q[2])\n      f.color = new THREE.Color(q[3])\n      f.vertexColors = [f.color,f.color,f.color]\n      geometry.faces.push(f)\n    }\n  }\n  \n  geometry.computeFaceNormals()\n\n  geometry.verticesNeedUpdate = true\n  geometry.elementsNeedUpdate = true\n  geometry.normalsNeedUpdate = true\n\n  geometry.computeBoundingBox()\n  geometry.computeBoundingSphere()\n\n}\n\nMesh.prototype.createWireMesh = function(hexColor) {    \n  var wireMaterial = new THREE.MeshBasicMaterial({\n    color : hexColor || 0xffffff,\n    wireframe : true\n  })\n  wireMesh = new THREE.Mesh(this.geometry, wireMaterial)\n  wireMesh.scale = this.scale\n  wireMesh.doubleSided = true\n  this.wireMesh = wireMesh\n  return wireMesh\n}\n\nMesh.prototype.createSurfaceMesh = function(material) {\n  material = material || new THREE.MeshNormalMaterial()\n  var surfaceMesh  = new THREE.Mesh( this.geometry, material )\n  surfaceMesh.scale = this.scale\n  surfaceMesh.doubleSided = false\n  this.surfaceMesh = surfaceMesh\n  return surfaceMesh\n}\n\nMesh.prototype.addToScene = function(scene) {\n  if (this.wireMesh) scene.add( this.wireMesh )\n  if (this.surfaceMesh) scene.add( this.surfaceMesh )\n}\n\nMesh.prototype.setPosition = function(x, y, z) {\n  if (this.wireMesh) this.wireMesh.position = new THREE.Vector3(x, y, z)\n  if (this.surfaceMesh) this.surfaceMesh.position = new THREE.Vector3(x, y, z)\n}\n\nMesh.prototype.faceVertexUv = function(i) {\n  var vs = [\n    this.meshed.vertices[i*4+0],\n    this.meshed.vertices[i*4+1],\n    this.meshed.vertices[i*4+2],\n    this.meshed.vertices[i*4+3]\n  ]\n  var spans = {\n    x0: vs[0][0] - vs[1][0],\n    x1: vs[1][0] - vs[2][0],\n    y0: vs[0][1] - vs[1][1],\n    y1: vs[1][1] - vs[2][1],\n    z0: vs[0][2] - vs[1][2],\n    z1: vs[1][2] - vs[2][2]\n  }\n  var size = {\n    x: Math.max(Math.abs(spans.x0), Math.abs(spans.x1)),\n    y: Math.max(Math.abs(spans.y0), Math.abs(spans.y1)),\n    z: Math.max(Math.abs(spans.z0), Math.abs(spans.z1))\n  }\n  if (size.x === 0) {\n    if (spans.y0 > spans.y1) {\n      var width = size.y\n      var height = size.z\n    }\n    else {\n      var width = size.z\n      var height = size.y\n    }\n  }\n  if (size.y === 0) {\n    if (spans.x0 > spans.x1) {\n      var width = size.x\n      var height = size.z\n    }\n    else {\n      var width = size.z\n      var height = size.x\n    }\n  }\n  if (size.z === 0) {\n    if (spans.x0 > spans.x1) {\n      var width = size.x\n      var height = size.y\n    }\n    else {\n      var width = size.y\n      var height = size.x\n    }\n  }\n  if ((size.z === 0 && spans.x0 < spans.x1) || (size.x === 0 && spans.y0 > spans.y1)) {\n    return [\n      new THREE.Vector2(height, 0),\n      new THREE.Vector2(0, 0),\n      new THREE.Vector2(0, width),\n      new THREE.Vector2(height, width)\n    ]\n  } else {\n    return [\n      new THREE.Vector2(0, 0),\n      new THREE.Vector2(0, height),\n      new THREE.Vector2(width, height),\n      new THREE.Vector2(width, 0)\n    ]\n  }\n}\n;\n\n//@ sourceURL=/node_modules/voxel-mesh/index.js"
      )
    ),
    n.define(
      "/node_modules/three/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"./three.js"}\n//@ sourceURL=/node_modules/three/package.json'
      )
    ),
    n.define(
      "/node_modules/three/three.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = THREE\n//@ sourceURL=/node_modules/three/three.js"
      )
    ),
    n.define(
      "/node_modules/voxel-chunks/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"index.js"}\n//@ sourceURL=/node_modules/voxel-chunks/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel-chunks/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "var voxel = require('voxel');\nvar ChunkMatrix = require('./lib/chunk_matrix');\nvar indexer = require('./lib/indexer');\n\nmodule.exports = Group;\n\nfunction Group (game) {\n    if (!(this instanceof Group)) return new Group(game);\n    this.meshes = [];\n    this.chunkMatricies = [];\n    this.game = game;\n    this.indexer = indexer(game);\n}\n\nGroup.prototype.create = function (generate) {\n    var self = this;\n    var cm = new ChunkMatrix(self.game, generate);\n    cm.on('add', function (mesh) {\n        self.chunkMatricies[mesh.id] = cm;\n        self.meshes.push(mesh);\n    });\n    cm.on('remove', function (id) {\n        delete self.chunkMatricies[id];\n    });\n    self.chunkMatricies.push(cm);\n    return cm;\n};\n \nGroup.prototype.createBlock = function (pos, val) {\n    var self = this;\n    var T = self.game.THREE;\n    var size = self.game.cubeSize;\n    \n    var cm = pos.chunkMatrix;\n    var d = pos.direction;\n    \n    var mr = new T.Matrix4().getInverse(cm.rotationObject.matrix);\n    var mt = new T.Matrix4().getInverse(cm.translationObject.matrix);\n    var m = new T.Matrix4().multiply(mr, mt);\n    \n    \n    return (function draw (offset) {\n        var pt = new T.Vector3();\n        pt.copy(pos);\n        \n        pt.x -= d.x * offset;\n        pt.y -= d.y * offset;\n        pt.z -= d.z * offset;\n        offset += size / 8;\n        \n        var tr = m.multiplyVector3(pt);\n        var ci = self.indexer.chunk(tr);\n        var vi = self.indexer.voxel(tr);\n        \n        var value = cm.getByIndex(ci, vi);\n        if (!value) {\n            cm.setByIndex(ci, vi, 3);\n            return true;\n        }\n        else draw(offset + 0.1)\n    })(0)\n};\n\nGroup.prototype.setBlock = function (pos, val) {\n    var ix = this.getIndex(pos);\n    var cm = pos.chunkMatrix;\n    return cm.setByIndex(ix.chunk, ix.voxel, val);\n};\n\nGroup.prototype.getBlock = function (pos) {\n    var ix = this.getIndex(pos);\n    var cm = pos.chunkMatrix;\n    return cm.getByIndex(ix.chunk, ix.voxel);\n};\n\nGroup.prototype.getIndex = function (pos) {\n    var T = this.game.THREE;\n    var cm = pos.chunkMatrix;\n    \n    var mr = new T.Matrix4().getInverse(cm.rotationObject.matrix);\n    var mt = new T.Matrix4().getInverse(cm.translationObject.matrix);\n    var m = new T.Matrix4().multiply(mt, mr);\n    \n    var tr = m.multiplyVector3(pos);\n    var ci = this.indexer.chunk(tr);\n    var vi = this.indexer.voxel(tr);\n    \n    return { chunk: ci, voxel: vi };\n};\n\n//@ sourceURL=/node_modules/voxel-chunks/index.js"
      )
    ),
    n.define(
      "/node_modules/voxel-chunks/lib/chunk_matrix.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "var voxelMesh = require('voxel-mesh');\nvar voxel = require('voxel');\n\nvar EventEmitter = require('events').EventEmitter;\nvar inherits = require('inherits');\n\nvar indexer = require('./indexer');\n\nmodule.exports = ChunkMatrix;\ninherits(ChunkMatrix, EventEmitter);\n\nfunction ChunkMatrix (game, generator) {\n    var T = game.THREE;\n    var size = game.cubeSize;\n    \n    var r = this.rotationObject = new T.Object3D;\n    var t = this.translationObject = new T.Object3D;\n    var inner = new T.Object3D;\n    \n    inner.add(r);\n    t.add(inner);\n    game.scene.add(t);\n    \n    inner.position.x = size / 2;\n    inner.position.z = size / 2;\n    \n    this.generator = generator || function (x,y,z) { return 0 };\n    this.rotation = r.rotation;\n    this.position = t.position;\n    this.chunks = {};\n    this.meshes = {};\n    this.game = game;\n    this.indexer = indexer(game);\n    \n    this._update('0|0|0');\n}\n\nChunkMatrix.prototype.generateChunk = function (ckey) {\n    if (Array.isArray(ckey)) ckey = ckey.join('|');\n    var xyz = ckey.split('|');\n    \n    var d = this.game.chunkSize;\n    var low = [ xyz[0]*d, xyz[1]*d, xyz[2]*d ];\n    var high = [ low[0]+d, low[1]+d, low[2]+d ];\n    \n    var chunk = voxel.generate(low, high, this.generator);\n    this.chunks[ckey] = chunk;\n    return chunk;\n};\n\nChunkMatrix.prototype.setBlock = function (pos, value) {\n    var ci = this.indexer.chunk(pos);\n    var vi = this.indexer.voxel(pos);\n    return this.setByIndex(ci, vi, value);\n};\n\nChunkMatrix.prototype.getBlock = function (pos) {\n    var ci = this.indexer.chunk(pos);\n    var vi = this.indexer.voxel(pos);\n    return this.getByIndex(ci, vi);\n};\n\nChunkMatrix.prototype.setByIndex = function (ci, vi, value) {\n    var ckey = typeof ci === 'object' ? ci.join('|') : ci\n    if (!this.chunks[ckey]) this.generateChunk(ckey);\n    this.chunks[ckey].voxels[vi] = value;\n    this._update(ckey);\n};\n\nChunkMatrix.prototype.getByIndex = function (ci, vi) {\n    var ckey = typeof ci === 'object' ? ci.join('|') : ci;\n    if (!this.chunks[ckey]) return undefined;\n    return this.chunks[ckey].voxels[vi];\n};\n    \nChunkMatrix.prototype._update = function (ci) {\n    var game = this.game;\n    var T = game.THREE;\n    var size = game.cubeSize;\n    var csize = size * game.chunkSize;\n    var scale = new T.Vector3(size, size, size);\n    \n    var ckey = typeof ci === 'object' ? ci.join('|') : ci;\n    var chunk = this.chunks[ckey];\n    if (!chunk) return;\n    \n    var mesh = voxelMesh(chunk, voxel.meshers.greedy, scale);\n    \n    if (this.meshes[ckey]) {\n        var s = this.meshes[ckey].surfaceMesh || this.meshes[ckey].wireMesh;\n        delete this.meshes[s.id];\n        this.emit('remove', s);\n        this.rotationObject.remove(s);\n    }\n    this.meshes[ckey] = mesh;\n    \n    if (game.meshType === 'wireMesh') {\n        mesh.createWireMesh();\n    }\n    else {\n        mesh.createSurfaceMesh(game.material);\n    }\n    \n    var surface = mesh.surfaceMesh || mesh.wireMesh;\n    surface.position.x = -size / 2;\n    surface.position.z = -size / 2;\n    \n    var xyz = ckey.split('|');\n    surface.position.x += xyz[0] * csize;\n    surface.position.y += xyz[1] * csize;\n    surface.position.z += xyz[2] * csize;\n    \n    this.rotationObject.add(surface);\n    \n    game.applyTextures(mesh.geometry);\n    \n    this.emit('add', surface, this);\n    this.emit('update', chunk, ckey);\n};\n\n//@ sourceURL=/node_modules/voxel-chunks/lib/chunk_matrix.js"
      )
    ),
    n.define(
      "/node_modules/voxel-chunks/node_modules/inherits/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"./inherits.js"}\n//@ sourceURL=/node_modules/voxel-chunks/node_modules/inherits/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel-chunks/node_modules/inherits/inherits.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = inherits\n\nfunction inherits (c, p, proto) {\n  proto = proto || {}\n  var e = {}\n  ;[c.prototype, proto].forEach(function (s) {\n    Object.getOwnPropertyNames(s).forEach(function (k) {\n      e[k] = Object.getOwnPropertyDescriptor(s, k)\n    })\n  })\n  c.prototype = Object.create(p.prototype, e)\n  c.super = p\n}\n\n//function Child () {\n//  Child.super.call(this)\n//  console.error([this\n//                ,this.constructor\n//                ,this.constructor === Child\n//                ,this.constructor.super === Parent\n//                ,Object.getPrototypeOf(this) === Child.prototype\n//                ,Object.getPrototypeOf(Object.getPrototypeOf(this))\n//                 === Parent.prototype\n//                ,this instanceof Child\n//                ,this instanceof Parent])\n//}\n//function Parent () {}\n//inherits(Child, Parent)\n//new Child\n\n//@ sourceURL=/node_modules/voxel-chunks/node_modules/inherits/inherits.js"
      )
    ),
    n.define(
      "/node_modules/voxel-chunks/lib/indexer.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = Indexer;\n\nfunction Indexer (opts) {\n    if (!(this instanceof Indexer)) return new Indexer(opts);\n    this.chunkSize = opts.chunkSize;\n    this.cubeSize = opts.cubeSize;\n}\n\nIndexer.prototype.chunk = function (pos) {\n    var chunkSize = this.chunkSize;\n    var cubeSize = this.cubeSize;\n    var cx = pos.x / cubeSize / chunkSize;\n    var cy = pos.y / cubeSize / chunkSize;\n    var cz = pos.z / cubeSize / chunkSize;\n    var ckey = [ Math.floor(cx), Math.floor(cy), Math.floor(cz) ];\n    return ckey.join('|');\n};\n\nIndexer.prototype.voxel = function (pos) {\n    var size = this.chunkSize;\n    var cubeSize = this.cubeSize;\n    var vx = (size + Math.floor(pos.x / cubeSize) % size) % size;\n    var vy = (size + Math.floor(pos.y / cubeSize) % size) % size;\n    var vz = (size + Math.floor(pos.z / cubeSize) % size) % size;\n    var x = Math.abs(vx);\n    var y = Math.abs(vy);\n    var z = Math.abs(vz);\n    return x + y*size + z*size*size;\n};\n\n//@ sourceURL=/node_modules/voxel-chunks/lib/indexer.js"
      )
    ),
    n.define(
      "/node_modules/voxel-engine/lib/stats.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
      )
    ),
    n.define(
      "/node_modules/voxel-engine/lib/detector.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/inherits/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"./inherits.js"}\n//@ sourceURL=/node_modules/voxel-engine/node_modules/inherits/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/inherits/inherits.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = inherits\n\nfunction inherits (c, p, proto) {\n  proto = proto || {}\n  var e = {}\n  ;[c.prototype, proto].forEach(function (s) {\n    Object.getOwnPropertyNames(s).forEach(function (k) {\n      e[k] = Object.getOwnPropertyDescriptor(s, k)\n    })\n  })\n  c.prototype = Object.create(p.prototype, e)\n  c.super = p\n}\n\n//function Child () {\n//  Child.super.call(this)\n//  console.error([this\n//                ,this.constructor\n//                ,this.constructor === Child\n//                ,this.constructor.super === Parent\n//                ,Object.getPrototypeOf(this) === Child.prototype\n//                ,Object.getPrototypeOf(Object.getPrototypeOf(this))\n//                 === Parent.prototype\n//                ,this instanceof Child\n//                ,this instanceof Parent])\n//}\n//function Parent () {}\n//inherits(Child, Parent)\n//new Child\n\n//@ sourceURL=/node_modules/voxel-engine/node_modules/inherits/inherits.js"
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/interact/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"index.js"}\n//@ sourceURL=/node_modules/voxel-engine/node_modules/interact/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/interact/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "var lock = require('pointer-lock')\n  , drag = require('drag-stream')\n  , full = require('fullscreen')\n\nvar EE = require('events').EventEmitter\n  , Stream = require('stream').Stream\n\nmodule.exports = interact\n\nfunction interact(el, skiplock) {\n  var ee = new EE\n    , internal\n\n  if(!lock.available() || skiplock) {\n    internal = usedrag(el)\n  } else {\n    internal = uselock(el, politelydeclined)\n  }\n\n  ee.release = function() { internal.release && internal.release() }\n  ee.request = function() { internal.request && internal.request() }\n  ee.destroy = function() { internal.destroy && internal.destroy() }\n  ee.pointerAvailable = function() { return lock.available() }\n  ee.fullscreenAvailable = function() { return full.available() }\n\n  forward()\n\n  return ee\n\n  function politelydeclined() {\n    ee.emit('opt-out')\n    internal.destroy()\n    internal = usedrag(el)\n    forward()\n  }\n\n  function forward() {\n    internal.on('attain', function(stream) {\n      ee.emit('attain', stream)\n    })\n\n    internal.on('release', function() {\n      ee.emit('release')\n    })\n  }\n}\n\nfunction uselock(el, declined) {\n  var pointer = lock(el)\n    , fs = full(el)\n\n  pointer.on('needs-fullscreen', function() {\n    fs.once('attain', function() {\n      pointer.request()\n    })\n    fs.request()\n  })\n\n  pointer.on('error', declined)\n\n  return pointer\n}\n\nfunction usedrag(el) {\n  var ee = new EE\n    , d = drag(el)\n    , stream\n\n  d.paused = true\n\n  d.on('resume', function() {\n    stream = new Stream\n    stream.readable = true\n    stream.initial = null\n  })\n\n  d.on('data', function(datum) {\n    if(!stream) {\n      stream = new Stream\n      stream.readable = true\n      stream.initial = null\n    }\n\n    if(!stream.initial) {\n      stream.initial = {\n        x: datum.dx\n      , y: datum.dy\n      , t: datum.dt\n      }\n      return ee.emit('attain', stream)\n    }\n\n    if(stream.paused) {\n      ee.emit('release')\n      stream.emit('end')\n      stream.readable = false\n      stream.emit('close')\n      stream = null\n    }\n\n    stream.emit('data', datum)\n  })\n\n  return ee\n}\n\n//@ sourceURL=/node_modules/voxel-engine/node_modules/interact/index.js"
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/interact/node_modules/pointer-lock/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"index.js"}\n//@ sourceURL=/node_modules/voxel-engine/node_modules/interact/node_modules/pointer-lock/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/interact/node_modules/pointer-lock/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = pointer\n\npointer.available = available\n\nvar EE = require('events').EventEmitter\n  , Stream = require('stream').Stream\n\nfunction available() {\n  return !!shim(document.body)\n}\n\nfunction pointer(el) {\n  var ael = el.addEventListener || el.attachEvent\n    , rel = el.removeEventListener || el.detachEvent\n    , doc = el.ownerDocument\n    , body = doc.body\n    , rpl = shim(el) \n    , out = {dx: 0, dy: 0, dt: 0}\n    , ee = new EE\n    , stream = null\n    , lastPageX, lastPageY\n    , needsFullscreen = false\n    , mouseDownMS\n\n  ael.call(el, 'mousedown', onmousedown, false)\n  ael.call(el, 'mouseup', onmouseup, false)\n  ael.call(body, 'mousemove', onmove, false)\n\n  var vendors = ['', 'webkit', 'moz', 'ms', 'o']\n\n  for(var i = 0, len = vendors.length; i < len; ++i) {\n    ael.call(doc, vendors[i]+'pointerlockchange', onpointerlockchange)\n    ael.call(doc, vendors[i]+'pointerlockerror', onpointerlockerror)\n  }\n\n  ee.release = release\n  ee.target = pointerlockelement\n  ee.request = onmousedown\n  ee.destroy = function() {\n    rel.call(el, 'mouseup', onmouseup, false)\n    rel.call(el, 'mousedown', onmousedown, false)\n    rel.call(el, 'mousemove', onmove, false)\n  }\n\n  if(!shim) {\n    setTimeout(function() {\n      ee.emit('error', new Error('pointer lock is not supported'))\n    }, 0)\n  }\n  return ee\n\n  function onmousedown(ev) {\n    if(pointerlockelement()) {\n      return\n    }\n    mouseDownMS = +new Date\n    rpl.call(el)\n  }\n\n  function onmouseup(ev) {\n    if(!needsFullscreen) {\n      return\n    }\n\n    ee.emit('needs-fullscreen')\n    needsFullscreen = false\n  }\n\n  function onpointerlockchange(ev) {\n    if(!pointerlockelement()) {\n      if(stream) release()\n      return\n    }\n\n    stream = new Stream\n    stream.readable = true\n    stream.initial = {x: lastPageX, y: lastPageY, t: Date.now()}\n\n    ee.emit('attain', stream)\n  }\n\n  function onpointerlockerror(ev) {\n    var dt = +(new Date) - mouseDownMS\n    if(dt < 100) {\n      // we errored immediately, we need to do fullscreen first.\n      needsFullscreen = true\n      return\n    }\n\n    if(stream) {\n      stream.emit('error', ev)\n      stream = null\n    }\n  }\n\n  function release() {\n    ee.emit('release')\n\n    if(stream) {\n      stream.emit('end')\n      stream.readable = false\n      stream.emit('close')\n      stream = null\n    }\n\n    var pel = pointerlockelement()\n    if(!pel) {\n      return\n    }\n\n    (doc.exitPointerLock ||\n    doc.mozExitPointerLock ||\n    doc.webkitExitPointerLock ||\n    doc.msExitPointerLock ||\n    doc.oExitPointerLock).call(doc)\n  }\n\n  function onmove(ev) {\n    lastPageX = ev.pageX\n    lastPageY = ev.pageY\n\n    if(!stream) return\n\n    // we're reusing a single object\n    // because I'd like to avoid piling up\n    // a ton of objects for the garbage\n    // collector.\n    out.dx =\n      ev.movementX || ev.webkitMovementX ||\n      ev.mozMovementX || ev.msMovementX ||\n      ev.oMovementX || 0\n\n    out.dy = \n      ev.movementY || ev.webkitMovementY ||\n      ev.mozMovementY || ev.msMovementY ||\n      ev.oMovementY || 0\n\n    out.dt = Date.now() - stream.initial.t\n\n    ee.emit('data', out)\n    stream.emit('data', out)\n  }\n\n  function pointerlockelement() {\n    return 0 ||\n      doc.pointerLockElement ||\n      doc.mozPointerLockElement ||\n      doc.webkitPointerLockElement ||\n      doc.msPointerLockElement ||\n      doc.oPointerLockElement ||\n      null\n  }\n}\n\nfunction shim(el) {\n  return el.requestPointerLock ||\n    el.webkitRequestPointerLock ||\n    el.mozRequestPointerLock ||\n    el.msRequestPointerLock ||\n    el.oRequestPointerLock ||\n    null\n}\n\n//@ sourceURL=/node_modules/voxel-engine/node_modules/interact/node_modules/pointer-lock/index.js"
      )
    ),
    n.define(
      "stream",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "var events = require('events');\nvar util = require('util');\n\nfunction Stream() {\n  events.EventEmitter.call(this);\n}\nutil.inherits(Stream, events.EventEmitter);\nmodule.exports = Stream;\n// Backwards-compat with node 0.4.x\nStream.Stream = Stream;\n\nStream.prototype.pipe = function(dest, options) {\n  var source = this;\n\n  function ondata(chunk) {\n    if (dest.writable) {\n      if (false === dest.write(chunk) && source.pause) {\n        source.pause();\n      }\n    }\n  }\n\n  source.on('data', ondata);\n\n  function ondrain() {\n    if (source.readable && source.resume) {\n      source.resume();\n    }\n  }\n\n  dest.on('drain', ondrain);\n\n  // If the 'end' option is not supplied, dest.end() will be called when\n  // source gets the 'end' or 'close' events.  Only dest.end() once, and\n  // only when all sources have ended.\n  if (!dest._isStdio && (!options || options.end !== false)) {\n    dest._pipeCount = dest._pipeCount || 0;\n    dest._pipeCount++;\n\n    source.on('end', onend);\n    source.on('close', onclose);\n  }\n\n  var didOnEnd = false;\n  function onend() {\n    if (didOnEnd) return;\n    didOnEnd = true;\n\n    dest._pipeCount--;\n\n    // remove the listeners\n    cleanup();\n\n    if (dest._pipeCount > 0) {\n      // waiting for other incoming streams to end.\n      return;\n    }\n\n    dest.end();\n  }\n\n\n  function onclose() {\n    if (didOnEnd) return;\n    didOnEnd = true;\n\n    dest._pipeCount--;\n\n    // remove the listeners\n    cleanup();\n\n    if (dest._pipeCount > 0) {\n      // waiting for other incoming streams to end.\n      return;\n    }\n\n    dest.destroy();\n  }\n\n  // don't leave dangling pipes when there are errors.\n  function onerror(er) {\n    cleanup();\n    if (this.listeners('error').length === 0) {\n      throw er; // Unhandled stream error in pipe.\n    }\n  }\n\n  source.on('error', onerror);\n  dest.on('error', onerror);\n\n  // remove all the event listeners that were added.\n  function cleanup() {\n    source.removeListener('data', ondata);\n    dest.removeListener('drain', ondrain);\n\n    source.removeListener('end', onend);\n    source.removeListener('close', onclose);\n\n    source.removeListener('error', onerror);\n    dest.removeListener('error', onerror);\n\n    source.removeListener('end', cleanup);\n    source.removeListener('close', cleanup);\n\n    dest.removeListener('end', cleanup);\n    dest.removeListener('close', cleanup);\n  }\n\n  source.on('end', cleanup);\n  source.on('close', cleanup);\n\n  dest.on('end', cleanup);\n  dest.on('close', cleanup);\n\n  dest.emit('pipe', source);\n\n  // Allow for unix-like usage: A.pipe(B).pipe(C)\n  return dest;\n};\n\n//@ sourceURL=stream"
      )
    ),
    n.define(
      "util",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "var events = require('events');\n\nexports.isArray = isArray;\nexports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};\nexports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};\n\n\nexports.print = function () {};\nexports.puts = function () {};\nexports.debug = function() {};\n\nexports.inspect = function(obj, showHidden, depth, colors) {\n  var seen = [];\n\n  var stylize = function(str, styleType) {\n    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics\n    var styles =\n        { 'bold' : [1, 22],\n          'italic' : [3, 23],\n          'underline' : [4, 24],\n          'inverse' : [7, 27],\n          'white' : [37, 39],\n          'grey' : [90, 39],\n          'black' : [30, 39],\n          'blue' : [34, 39],\n          'cyan' : [36, 39],\n          'green' : [32, 39],\n          'magenta' : [35, 39],\n          'red' : [31, 39],\n          'yellow' : [33, 39] };\n\n    var style =\n        { 'special': 'cyan',\n          'number': 'blue',\n          'boolean': 'yellow',\n          'undefined': 'grey',\n          'null': 'bold',\n          'string': 'green',\n          'date': 'magenta',\n          // \"name\": intentionally not styling\n          'regexp': 'red' }[styleType];\n\n    if (style) {\n      return '\\033[' + styles[style][0] + 'm' + str +\n             '\\033[' + styles[style][1] + 'm';\n    } else {\n      return str;\n    }\n  };\n  if (! colors) {\n    stylize = function(str, styleType) { return str; };\n  }\n\n  function format(value, recurseTimes) {\n    // Provide a hook for user-specified inspect functions.\n    // Check that value is an object with an inspect function on it\n    if (value && typeof value.inspect === 'function' &&\n        // Filter out the util module, it's inspect function is special\n        value !== exports &&\n        // Also filter out any prototype objects using the circular check.\n        !(value.constructor && value.constructor.prototype === value)) {\n      return value.inspect(recurseTimes);\n    }\n\n    // Primitive types cannot have properties\n    switch (typeof value) {\n      case 'undefined':\n        return stylize('undefined', 'undefined');\n\n      case 'string':\n        var simple = '\\'' + JSON.stringify(value).replace(/^\"|\"$/g, '')\n                                                 .replace(/'/g, \"\\\\'\")\n                                                 .replace(/\\\\\"/g, '\"') + '\\'';\n        return stylize(simple, 'string');\n\n      case 'number':\n        return stylize('' + value, 'number');\n\n      case 'boolean':\n        return stylize('' + value, 'boolean');\n    }\n    // For some reason typeof null is \"object\", so special case here.\n    if (value === null) {\n      return stylize('null', 'null');\n    }\n\n    // Look up the keys of the object.\n    var visible_keys = Object_keys(value);\n    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;\n\n    // Functions without properties can be shortcutted.\n    if (typeof value === 'function' && keys.length === 0) {\n      if (isRegExp(value)) {\n        return stylize('' + value, 'regexp');\n      } else {\n        var name = value.name ? ': ' + value.name : '';\n        return stylize('[Function' + name + ']', 'special');\n      }\n    }\n\n    // Dates without properties can be shortcutted\n    if (isDate(value) && keys.length === 0) {\n      return stylize(value.toUTCString(), 'date');\n    }\n\n    var base, type, braces;\n    // Determine the object type\n    if (isArray(value)) {\n      type = 'Array';\n      braces = ['[', ']'];\n    } else {\n      type = 'Object';\n      braces = ['{', '}'];\n    }\n\n    // Make functions say that they are functions\n    if (typeof value === 'function') {\n      var n = value.name ? ': ' + value.name : '';\n      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';\n    } else {\n      base = '';\n    }\n\n    // Make dates with properties first say the date\n    if (isDate(value)) {\n      base = ' ' + value.toUTCString();\n    }\n\n    if (keys.length === 0) {\n      return braces[0] + base + braces[1];\n    }\n\n    if (recurseTimes < 0) {\n      if (isRegExp(value)) {\n        return stylize('' + value, 'regexp');\n      } else {\n        return stylize('[Object]', 'special');\n      }\n    }\n\n    seen.push(value);\n\n    var output = keys.map(function(key) {\n      var name, str;\n      if (value.__lookupGetter__) {\n        if (value.__lookupGetter__(key)) {\n          if (value.__lookupSetter__(key)) {\n            str = stylize('[Getter/Setter]', 'special');\n          } else {\n            str = stylize('[Getter]', 'special');\n          }\n        } else {\n          if (value.__lookupSetter__(key)) {\n            str = stylize('[Setter]', 'special');\n          }\n        }\n      }\n      if (visible_keys.indexOf(key) < 0) {\n        name = '[' + key + ']';\n      }\n      if (!str) {\n        if (seen.indexOf(value[key]) < 0) {\n          if (recurseTimes === null) {\n            str = format(value[key]);\n          } else {\n            str = format(value[key], recurseTimes - 1);\n          }\n          if (str.indexOf('\\n') > -1) {\n            if (isArray(value)) {\n              str = str.split('\\n').map(function(line) {\n                return '  ' + line;\n              }).join('\\n').substr(2);\n            } else {\n              str = '\\n' + str.split('\\n').map(function(line) {\n                return '   ' + line;\n              }).join('\\n');\n            }\n          }\n        } else {\n          str = stylize('[Circular]', 'special');\n        }\n      }\n      if (typeof name === 'undefined') {\n        if (type === 'Array' && key.match(/^\\d+$/)) {\n          return str;\n        }\n        name = JSON.stringify('' + key);\n        if (name.match(/^\"([a-zA-Z_][a-zA-Z_0-9]*)\"$/)) {\n          name = name.substr(1, name.length - 2);\n          name = stylize(name, 'name');\n        } else {\n          name = name.replace(/'/g, \"\\\\'\")\n                     .replace(/\\\\\"/g, '\"')\n                     .replace(/(^\"|\"$)/g, \"'\");\n          name = stylize(name, 'string');\n        }\n      }\n\n      return name + ': ' + str;\n    });\n\n    seen.pop();\n\n    var numLinesEst = 0;\n    var length = output.reduce(function(prev, cur) {\n      numLinesEst++;\n      if (cur.indexOf('\\n') >= 0) numLinesEst++;\n      return prev + cur.length + 1;\n    }, 0);\n\n    if (length > 50) {\n      output = braces[0] +\n               (base === '' ? '' : base + '\\n ') +\n               ' ' +\n               output.join(',\\n  ') +\n               ' ' +\n               braces[1];\n\n    } else {\n      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];\n    }\n\n    return output;\n  }\n  return format(obj, (typeof depth === 'undefined' ? 2 : depth));\n};\n\n\nfunction isArray(ar) {\n  return ar instanceof Array ||\n         Array.isArray(ar) ||\n         (ar && ar !== Object.prototype && isArray(ar.__proto__));\n}\n\n\nfunction isRegExp(re) {\n  return re instanceof RegExp ||\n    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');\n}\n\n\nfunction isDate(d) {\n  if (d instanceof Date) return true;\n  if (typeof d !== 'object') return false;\n  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);\n  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);\n  return JSON.stringify(proto) === JSON.stringify(properties);\n}\n\nfunction pad(n) {\n  return n < 10 ? '0' + n.toString(10) : n.toString(10);\n}\n\nvar months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',\n              'Oct', 'Nov', 'Dec'];\n\n// 26 Feb 16:19:34\nfunction timestamp() {\n  var d = new Date();\n  var time = [pad(d.getHours()),\n              pad(d.getMinutes()),\n              pad(d.getSeconds())].join(':');\n  return [d.getDate(), months[d.getMonth()], time].join(' ');\n}\n\nexports.log = function (msg) {};\n\nexports.pump = null;\n\nvar Object_keys = Object.keys || function (obj) {\n    var res = [];\n    for (var key in obj) res.push(key);\n    return res;\n};\n\nvar Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {\n    var res = [];\n    for (var key in obj) {\n        if (Object.hasOwnProperty.call(obj, key)) res.push(key);\n    }\n    return res;\n};\n\nvar Object_create = Object.create || function (prototype, properties) {\n    // from es5-shim\n    var object;\n    if (prototype === null) {\n        object = { '__proto__' : null };\n    }\n    else {\n        if (typeof prototype !== 'object') {\n            throw new TypeError(\n                'typeof prototype[' + (typeof prototype) + '] != \\'object\\''\n            );\n        }\n        var Type = function () {};\n        Type.prototype = prototype;\n        object = new Type();\n        object.__proto__ = prototype;\n    }\n    if (typeof properties !== 'undefined' && Object.defineProperties) {\n        Object.defineProperties(object, properties);\n    }\n    return object;\n};\n\nexports.inherits = function(ctor, superCtor) {\n  ctor.super_ = superCtor;\n  ctor.prototype = Object_create(superCtor.prototype, {\n    constructor: {\n      value: ctor,\n      enumerable: false,\n      writable: true,\n      configurable: true\n    }\n  });\n};\n\nvar formatRegExp = /%[sdj%]/g;\nexports.format = function(f) {\n  if (typeof f !== 'string') {\n    var objects = [];\n    for (var i = 0; i < arguments.length; i++) {\n      objects.push(exports.inspect(arguments[i]));\n    }\n    return objects.join(' ');\n  }\n\n  var i = 1;\n  var args = arguments;\n  var len = args.length;\n  var str = String(f).replace(formatRegExp, function(x) {\n    if (x === '%%') return '%';\n    if (i >= len) return x;\n    switch (x) {\n      case '%s': return String(args[i++]);\n      case '%d': return Number(args[i++]);\n      case '%j': return JSON.stringify(args[i++]);\n      default:\n        return x;\n    }\n  });\n  for(var x = args[i]; i < len; x = args[++i]){\n    if (x === null || typeof x !== 'object') {\n      str += ' ' + x;\n    } else {\n      str += ' ' + exports.inspect(x);\n    }\n  }\n  return str;\n};\n\n//@ sourceURL=util"
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/interact/node_modules/drag-stream/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"index.js"}\n//@ sourceURL=/node_modules/voxel-engine/node_modules/interact/node_modules/drag-stream/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/interact/node_modules/drag-stream/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = dragstream\n\nvar Stream = require('stream')\n  , read = require('domnode-dom').createReadStream\n  , through = require('through')\n\nfunction dragstream(el) {\n  var body = el.ownerDocument.body\n    , down = read(el, 'mousedown')\n    , up = read(body, 'mouseup', false)\n    , move = read(body, 'mousemove', false)\n    , anchor = {x: 0, y: 0, t: 0}\n    , drag = through(on_move)\n\n  // default to \"paused\"\n  drag.pause()\n\n  down.on('data', on_down)\n  up.on('data', on_up)\n\n  return move.pipe(drag)\n\n  // listeners:\n\n  function on_move(ev) {\n    if(drag.paused) return\n\n    drag.emit('data', datum(\n        ev.screenX - anchor.x\n      , ev.screenY - anchor.y\n      , +new Date\n    ))\n\n    anchor.x = ev.screenX\n    anchor.y = ev.screenY\n  }\n\n  function on_down(ev) {\n    anchor.x = ev.screenX\n    anchor.y = ev.screenY\n    anchor.t = +new Date\n    drag.resume()\n    drag.emit('data', datum(\n        anchor.x\n      , anchor.y\n      , anchor.t\n    ))\n  }\n\n  function on_up(ev) {\n    drag.pause()\n    drag.emit('data', datum(\n        ev.screenX - anchor.x\n      , ev.screenY - anchor.y\n      , +new Date\n    ))\n  }\n\n  function datum(dx, dy, when) {\n    return {\n      dx: dx\n    , dy: dy\n    , dt: when - anchor.t\n    }\n  }\n}\n\n//@ sourceURL=/node_modules/voxel-engine/node_modules/interact/node_modules/drag-stream/index.js"
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/interact/node_modules/drag-stream/node_modules/domnode-dom/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"index.js"}\n//@ sourceURL=/node_modules/voxel-engine/node_modules/interact/node_modules/drag-stream/node_modules/domnode-dom/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/interact/node_modules/drag-stream/node_modules/domnode-dom/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = require('./lib/index')\n\n//@ sourceURL=/node_modules/voxel-engine/node_modules/interact/node_modules/drag-stream/node_modules/domnode-dom/index.js"
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/interact/node_modules/drag-stream/node_modules/domnode-dom/lib/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "var WriteStream = require('./writable')\n  , ReadStream = require('./readable')\n  , DOMStream = {}\n\nDOMStream.WriteStream = WriteStream\nDOMStream.ReadStream = ReadStream\n\nDOMStream.createAppendStream = function(el, mimetype) {\n  return new DOMStream.WriteStream(\n      el\n    , DOMStream.WriteStream.APPEND\n    , mimetype\n  )\n}\n\nDOMStream.createWriteStream = function(el, mimetype) {\n  return new DOMStream.WriteStream(\n      el\n    , DOMStream.WriteStream.WRITE\n    , mimetype\n  )\n}\n\nDOMStream.createReadStream =\nDOMStream.createEventStream = function(el, type, preventDefault) {\n  preventDefault = preventDefault === undefined ? true : preventDefault\n\n  return new DOMStream.ReadStream(\n      el\n    , type\n    , preventDefault\n  )\n}\n\nmodule.exports = DOMStream\n\n\n//@ sourceURL=/node_modules/voxel-engine/node_modules/interact/node_modules/drag-stream/node_modules/domnode-dom/lib/index.js"
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/interact/node_modules/drag-stream/node_modules/domnode-dom/lib/writable.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = DOMStream\n\nvar Stream = require('stream').Stream\n\nfunction DOMStream(el, mode, mimetype) {\n  this.el = el\n  this.mode = mode\n  this.mimetype = mimetype || 'text/html'\n\n  Stream.call(this)\n}\n\nvar cons = DOMStream\n  , proto = cons.prototype = new Stream\n\nproto.constructor = cons\n\ncons.APPEND = 0\ncons.WRITE = 1\n\nproto.writable = true\n\nproto.setMimetype = function(mime) {\n  this.mimetype = mime\n}\n\nproto.write = function(data) {\n  var result = (this.mode === cons.APPEND) ? this.append(data) : this.insert(data)\n  this.emit('data', this.el.childNodes)\n  return result\n}\n\nproto.insert = function(data) {\n  this.el.innerHTML = ''\n  return this.append(data)\n}\n\nproto.append = function(data) {\n  var result = this[this.resolveMimetypeHandler()](data)\n\n  for(var i = 0, len = result.length; i < len; ++i) {\n    this.el.appendChild(result[i])\n  }\n\n  return true\n}\n\nproto.resolveMimetypeHandler = function() {\n  var type = this.mimetype.replace(/(\\/\\w)/, function(x) {\n    return x.slice(1).toUpperCase()\n  })\n  type = type.charAt(0).toUpperCase() + type.slice(1)\n\n  return 'construct'+type\n}\n\nproto.constructTextHtml = function(data) {\n  var isTableFragment = /(tr|td|th)/.test(data) && !/table/.test(data)\n    , div\n\n  if(isTableFragment) {\n    // wuh-oh.\n    div = document.createElement('table')\n  }\n\n  div = div || document.createElement('div')\n  div.innerHTML = data \n\n  return [].slice.call(div.childNodes)\n}\n\nproto.constructTextPlain = function(data) {\n  var textNode = document.createTextNode(data)\n\n  return [textNode]\n}\n\n//@ sourceURL=/node_modules/voxel-engine/node_modules/interact/node_modules/drag-stream/node_modules/domnode-dom/lib/writable.js"
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/interact/node_modules/drag-stream/node_modules/domnode-dom/lib/readable.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = DOMStream\n\nvar Stream = require('stream').Stream\n\nvar listener = function(el, type, onmsg) {\n  return el.addEventListener(type, onmsg, false)\n}\n\nif(typeof $ !== 'undefined')\n  listener = function(el, type, onmsg) {\n    return el = $(el)[type](onmsg)\n  }\n\nif(typeof document !== 'undefined' && !document.createElement('div').addEventListener)\n  listener = function(el, type, onmsg) {\n    return el.attachEvent('on'+type, onmsg)\n  }\n\nfunction DOMStream(el, eventType, shouldPreventDefault) {\n  this.el = el\n  this.eventType = eventType\n  this.shouldPreventDefault = shouldPreventDefault\n\n  var self = this\n\n  if(el && this.eventType)\n    listener(\n        this.el\n      , this.eventType\n      , function() { return self.listen.apply(self, arguments) }\n    )\n\n  Stream.call(this)\n}\n\nvar cons = DOMStream\n  , proto = cons.prototype = new Stream\n\nproto.constructor = cons\n\nproto.listen = function(ev) { \n  if(this.shouldPreventDefault)\n    ev.preventDefault ? ev.preventDefault() : (ev.returnValue = false)\n\n  var collectData = \n    this.eventType === 'submit' ||\n    this.eventType === 'change' ||\n    this.eventType === 'keydown' ||\n    this.eventType === 'keyup' ||\n    this.eventType === 'input'\n\n  if(collectData) {\n    if(this.el.tagName.toUpperCase() === 'FORM')\n      return this.handleFormSubmit(ev)\n\n    return this.emit('data', valueFromElement(this.el))\n  }\n\n  this.emit('data', ev) \n}\n\nproto.handleFormSubmit = function(ev) {\n  var elements = []\n\n  if(this.el.querySelectorAll) {\n    elements = this.el.querySelectorAll('input,textarea,select')\n  } else {\n    var inputs = {'INPUT':true, 'TEXTAREA':true, 'SELECT':true}\n\n    var recurse = function(el) {\n      for(var i = 0, len = el.childNodes.length; i < len; ++i) {\n        if(el.childNodes[i].tagName) {\n          if(inputs[el.childNodes[i].tagName.toUpperCase()]) {\n            elements.push(el)\n          } else {\n            recurse(el.childNodes[i])\n          }\n        }\n      }\n    }\n\n    recurse(this.el)\n  }\n\n  var output = {}\n    , attr\n    , val\n\n  for(var i = 0, len = elements.length; i < len; ++i) {\n    attr = elements[i].getAttribute('name')\n    val = valueFromElement(elements[i])\n\n    output[attr] = val\n  }\n\n  return this.emit('data', output)\n}\n\nfunction valueFromElement(el) {\n  switch(el.getAttribute('type')) {\n    case 'radio':\n      return el.checked ? el.value : null\n    case 'checkbox':\n      return 'data', el.checked\n  }\n  return el.value\n}\n\n//@ sourceURL=/node_modules/voxel-engine/node_modules/interact/node_modules/drag-stream/node_modules/domnode-dom/lib/readable.js"
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/interact/node_modules/drag-stream/node_modules/through/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"index.js"}\n//@ sourceURL=/node_modules/voxel-engine/node_modules/interact/node_modules/drag-stream/node_modules/through/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/interact/node_modules/drag-stream/node_modules/through/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "var Stream = require('stream')\n\n// through\n//\n// a stream that does nothing but re-emit the input.\n// useful for aggregating a series of changing but not ending streams into one stream)\n\n\n\nexports = module.exports = through\nthrough.through = through\n\n//create a readable writable stream.\n\nfunction through (write, end) {\n  write = write || function (data) { this.emit('data', data) }\n  end = end || function () { this.emit('end') }\n\n  var ended = false, destroyed = false\n  var stream = new Stream(), buffer = []\n  stream.buffer = buffer\n  stream.readable = stream.writable = true\n  stream.paused = false\n  stream.write = function (data) {\n    write.call(this, data)\n    return !stream.paused\n  }\n\n  function drain() {\n    while(buffer.length && !stream.paused) {\n      var data = buffer.shift()\n      if(null === data)\n        return stream.emit('end')\n      else\n        stream.emit('data', data)\n    }\n  }\n\n  stream.queue = function (data) {\n    buffer.push(data)\n    drain()\n  }\n\n  //this will be registered as the first 'end' listener\n  //must call destroy next tick, to make sure we're after any\n  //stream piped from here.\n  //this is only a problem if end is not emitted synchronously.\n  //a nicer way to do this is to make sure this is the last listener for 'end'\n\n  stream.on('end', function () {\n    stream.readable = false\n    if(!stream.writable)\n      process.nextTick(function () {\n        stream.destroy()\n      })\n  })\n\n  function _end () {\n    stream.writable = false\n    end.call(stream)\n    if(!stream.readable)\n      stream.destroy()\n  }\n\n  stream.end = function (data) {\n    if(ended) return\n    ended = true\n    if(arguments.length) stream.write(data)\n    _end() // will emit or queue\n  }\n\n  stream.destroy = function () {\n    if(destroyed) return\n    destroyed = true\n    ended = true\n    buffer.length = 0\n    stream.writable = stream.readable = false\n    stream.emit('close')\n  }\n\n  stream.pause = function () {\n    if(stream.paused) return\n    stream.paused = true\n    stream.emit('pause')\n  }\n  stream.resume = function () {\n    if(stream.paused) {\n      stream.paused = false\n    }\n    drain()\n    //may have become paused again,\n    //as drain emits 'data'.\n    if(!stream.paused)\n      stream.emit('drain')\n  }\n  return stream\n}\n\n\n//@ sourceURL=/node_modules/voxel-engine/node_modules/interact/node_modules/drag-stream/node_modules/through/index.js"
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/interact/node_modules/fullscreen/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"index.js"}\n//@ sourceURL=/node_modules/voxel-engine/node_modules/interact/node_modules/fullscreen/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/interact/node_modules/fullscreen/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = fullscreen\nfullscreen.available = available\n\nvar EE = require('events').EventEmitter\n\nfunction available() {\n  return !!shim(document.body)\n}\n\nfunction fullscreen(el) {\n  var ael = el.addEventListener || el.attachEvent\n    , doc = el.ownerDocument\n    , body = doc.body\n    , rfs = shim(el)\n    , ee = new EE\n\n  var vendors = ['', 'webkit', 'moz', 'ms', 'o']\n\n  for(var i = 0, len = vendors.length; i < len; ++i) {\n    ael.call(doc, vendors[i]+'fullscreenchange', onfullscreenchange)\n    ael.call(doc, vendors[i]+'fullscreenerror', onfullscreenerror)\n  }\n\n  ee.release = release\n  ee.request = request\n  ee.target = fullscreenelement\n\n  if(!shim) {\n    setTimeout(function() {\n      ee.emit('error', new Error('fullscreen is not supported'))\n    }, 0)\n  }\n  return ee\n\n  function onfullscreenchange() {\n    if(!fullscreenelement()) {\n      return ee.emit('release')\n    }\n    ee.emit('attain')\n  }\n\n  function onfullscreenerror() {\n    ee.emit('error')\n  }\n\n  function request() {\n    return rfs.call(el)\n  }\n\n  function release() {\n    (el.exitFullscreen ||\n    el.exitFullscreen ||\n    el.webkitExitFullScreen ||\n    el.webkitExitFullscreen ||\n    el.mozExitFullScreen ||\n    el.mozExitFullscreen ||\n    el.msExitFullScreen ||\n    el.msExitFullscreen ||\n    el.oExitFullScreen ||\n    el.oExitFullscreen).call(el)\n  } \n\n  function fullscreenelement() {\n    return 0 ||\n      doc.fullScreenElement ||\n      doc.fullscreenElement ||\n      doc.webkitFullScreenElement ||\n      doc.webkitFullscreenElement ||\n      doc.mozFullScreenElement ||\n      doc.mozFullscreenElement ||\n      doc.msFullScreenElement ||\n      doc.msFullscreenElement ||\n      doc.oFullScreenElement ||\n      doc.oFullscreenElement ||\n      null\n  }\n}\n\nfunction shim(el) {\n  return (el.requestFullscreen ||\n    el.webkitRequestFullscreen ||\n    el.webkitRequestFullScreen ||\n    el.mozRequestFullscreen ||\n    el.mozRequestFullScreen ||\n    el.msRequestFullscreen ||\n    el.msRequestFullScreen ||\n    el.oRequestFullscreen ||\n    el.oRequestFullScreen)\n}\n\n//@ sourceURL=/node_modules/voxel-engine/node_modules/interact/node_modules/fullscreen/index.js"
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/player-physics/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = {}\n//@ sourceURL=/node_modules/voxel-engine/node_modules/player-physics/package.json"
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/player-physics/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "var THREE = require('three')\nvar inherits = require('inherits')\nvar stream = require('stream')\n\nvar PI_2 = Math.PI / 2\n\n/**\n * based on PointerLockControls by mrdoob / http://mrdoob.com/\n * converted to a module + stream by @maxogden and @substack\n */\n\nmodule.exports = function(camera, opts) {\n  return new PlayerPhysics(camera, opts)\n}\n\nmodule.exports.PlayerPhysics = PlayerPhysics\n\nfunction PlayerPhysics(camera, opts) {\n  if (!(this instanceof PlayerPhysics)) return new PlayerPhysics(camera, opts)\n  var self = this\n  if (!opts) opts = {}\n  \n  \n  this.readable = true\n  this.writable = true\n  this.enabled = false\n  \n  this.speed = {\n    jump: ( opts.jump === undefined ? 3.25 : opts.jump ),\n    move: ( opts.move === undefined ? 0.2 : opts.move ),\n    fall: ( opts.fall === undefined ? 0.3 : opts.fall ),\n  }\n  \n  this.jumpTime = 250\n  this.jumpRemaining = 0\n\n  this.pitchObject = opts.pitchObject || new THREE.Object3D()\n  if (camera) this.pitchObject.add( camera )\n\n  this.yawObject = opts.yawObject || new THREE.Object3D()\n  this.yawObject.position.y = 10\n  this.yawObject.add( this.pitchObject )\n\n  this.moveForward = false\n  this.moveBackward = false\n  this.moveLeft = false\n  this.moveRight = false\n\n  this.freedom = {\n    'x+': true,\n    'x-': true,\n    'y+': true,\n    'y-': true,\n    'z+': true,\n    'z-': true\n  }\n  \n  this.wantsJump = false\n  this.gravityEnabled = opts.gravityEnabled === undefined ? true : !!opts.gravityEnabled\n  \n  this.velocity = opts.velocityObject || new THREE.Vector3()\n\n  this.on('command', function(command, setting) {\n    self[command] = setting\n  })  \n}\n\ninherits(PlayerPhysics, stream.Stream)\n\nPlayerPhysics.prototype.playerIsMoving = function() { \n  var v = this.velocity\n  if (Math.abs(v.x) > 0.1 || Math.abs(v.y) > 0.1 || Math.abs(v.z) > 0.1) return true\n  return false\n}\n\nPlayerPhysics.prototype.write = function(data) {\n  if (this.enabled === false) return\n  this.applyRotationDeltas(data)\n}\n\nPlayerPhysics.prototype.end = function() {\n  this.emit('end')\n}\n\nPlayerPhysics.prototype.applyRotationDeltas = function(deltas) {\n  this.yawObject.rotation.y -= deltas.dx * 0.002\n  this.pitchObject.rotation.x -= deltas.dy * 0.002\n  this.pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, this.pitchObject.rotation.x))\n}\n\nPlayerPhysics.prototype.tick = function (delta, cb) {\n  if (this.enabled === false) return\n\n  delta *= 0.1\n\n  this.velocity.x += (-this.velocity.x) * 0.08 * delta\n  this.velocity.z += (-this.velocity.z) * 0.08 * delta\n\n  if (this.freedom['y-']) this.wantsJump = false\n  if (this.wantsJump && this.jumpRemaining <= 0) this.jumpRemaining = this.jumpTime\n  if (this.jumpRemaining > 0) this.jumpRemaining -= delta * 100\n  if (this.jumpRemaining > 0) {\n    if(this.gravityEnabled) this.velocity.y += this.speed.jump * delta\n  } else {\n    this.jumpRemaining = 0\n    if (this.gravityEnabled) this.velocity.y -= this.speed.fall * delta\n  }\n\n  if (this.moveForward) this.velocity.z -= this.speed.move * delta\n  if (this.moveBackward) this.velocity.z += this.speed.move * delta\n\n  if (this.moveLeft) this.velocity.x -= this.speed.move * delta\n  if (this.moveRight) this.velocity.x += this.speed.move * delta\n  \n  if (!this.freedom['x-']) this.velocity.x = Math.max(0, this.velocity.x)\n  if (!this.freedom['x+']) this.velocity.x = Math.min(0, this.velocity.x)\n  if (!this.freedom['y-']) this.velocity.y = Math.max(-0.0001, this.velocity.y)\n  if (!this.freedom['y+']) this.velocity.y = Math.min(0, this.velocity.y)\n  if (!this.freedom['z-']) this.velocity.z = Math.max(0, this.velocity.z)\n  if (!this.freedom['z+']) this.velocity.z = Math.min(0, this.velocity.z)\n  \n  if (cb) cb(this)\n}\n\n//@ sourceURL=/node_modules/voxel-engine/node_modules/player-physics/index.js"
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/raf/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"index.js"}\n//@ sourceURL=/node_modules/voxel-engine/node_modules/raf/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/raf/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = raf\n\nvar EE = require('events').EventEmitter\n  , global = typeof window === 'undefined' ? this : window\n\nvar _raf =\n  global.requestAnimationFrame ||\n  global.webkitRequestAnimationFrame ||\n  global.mozRequestAnimationFrame ||\n  global.msRequestAnimationFrame ||\n  global.oRequestAnimationFrame ||\n  (global.setImmediate ? function(fn, el) {\n    setImmediate(fn)\n  } :\n  function(fn, el) {\n    setTimeout(fn, 0)\n  })\n\nfunction raf(el) {\n  var now = raf.now()\n    , ee = new EE\n\n  ee.pause = function() { ee.paused = true }\n  ee.resume = function() { ee.paused = false }\n\n  _raf(iter, el)\n\n  return ee\n\n  function iter(timestamp) {\n    var _now = raf.now()\n      , dt = _now - now\n    \n    now = _now\n\n    ee.emit('data', dt)\n\n    if(!ee.paused) {\n      _raf(iter, el)\n    }\n  }\n}\n\nraf.polyfill = _raf\nraf.now = function() { return Date.now() }\n\n//@ sourceURL=/node_modules/voxel-engine/node_modules/raf/index.js"
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/collide-3d-tilemap/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"index.js"}\n//@ sourceURL=/node_modules/voxel-engine/node_modules/collide-3d-tilemap/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/collide-3d-tilemap/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = function(field, tilesize, dimensions, offset) {\n  dimensions = dimensions || [ \n    Math.sqrt(field.length) >> 0\n  , Math.sqrt(field.length) >> 0\n  , Math.sqrt(field.length) >> 0\n  ] \n\n  offset = offset || [\n    0\n  , 0\n  , 0\n  ]\n\n  field = typeof field === 'function' ? field : function(x, y, z) {\n    return this[x + y * dimensions[1] + (z * dimensions[1] * dimensions[2])]\n  }.bind(field) \n\n  var coords\n\n  coords = [0, 0, 0]\n\n  return collide\n\n  function collide(box, vec, oncollision) {\n    if(vec[0] === 0 && vec[1] === 0 && vec[2] === 0) return\n\n    // collide x, then y\n    collideaxis(0)\n    collideaxis(1)\n    collideaxis(2)\n\n    function collideaxis(i_axis) {\n      var j_axis = (i_axis + 1) % 3\n        , k_axis = (i_axis + 2) % 3 \n        , posi = vec[i_axis] > 0\n        , leading = box[posi ? 'max' : 'base'][i_axis] \n        , dir = posi ? 1 : -1\n        , i_start = Math.floor(leading / tilesize)\n        , i_end = (Math.floor((leading + vec[i_axis]) / tilesize)) + dir\n        , j_start = Math.floor(box.base[j_axis] / tilesize)\n        , j_end = Math.ceil(box.max[j_axis] / tilesize)\n        , k_start = Math.floor(box.base[k_axis] / tilesize) \n        , k_end = Math.ceil(box.max[k_axis] / tilesize)\n        , done = false\n        , edge_vector\n        , edge\n        , tile\n\n      // loop from the current tile coord to the dest tile coord\n      //    -> loop on the opposite axis to get the other candidates\n      //      -> if `oncollision` return `true` we've hit something and\n      //         should break out of the loops entirely.\n      //         NB: `oncollision` is where the client gets the chance\n      //         to modify the `vec` in-flight.\n      // once we're done translate the box to the vec results\n\n      var step = 0\n      for(var i = i_start; !done && i !== i_end; ++step, i += dir) {\n        if(i < offset[i_axis] || i >= dimensions[i_axis]) continue\n        for(var j = j_start; !done && j !== j_end; ++j) {\n          if(j < offset[j_axis] || j >= dimensions[j_axis]) continue\n          for(var k = k_start; k !== k_end; ++k) {\n            if(k < offset[k_axis] || k >= dimensions[k_axis]) continue\n            coords[i_axis] = i\n            coords[j_axis] = j\n            coords[k_axis] = k\n            tile = field.apply(field, coords)\n\n            if(tile === undefined) continue\n\n            edge = dir > 0 ? i * tilesize : (i + 1) * tilesize\n            edge_vector = edge - leading\n\n            if(oncollision(i_axis, tile, coords, dir, edge_vector)) {\n              done = true\n              break\n            }\n          } \n        }\n      }\n\n      coords[0] = coords[1] = coords[2] = 0\n      coords[i_axis] = vec[i_axis]\n      box.translate(coords)\n    }\n  }  \n}\n\n//@ sourceURL=/node_modules/voxel-engine/node_modules/collide-3d-tilemap/index.js"
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/aabb-3d/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"index.js"}\n//@ sourceURL=/node_modules/voxel-engine/node_modules/aabb-3d/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/aabb-3d/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = AABB\n\nvar vec3 = require('gl-matrix').vec3\n\nfunction AABB(pos, vec) {\n  if(!(this instanceof AABB)) {\n    return new AABB(pos, vec)\n  }\n\n  this.base = pos\n  this.vec = vec\n\n  this.mag = vec3.length(this.vec)\n\n  this.max = vec3.create()\n  vec3.add(this.max, this.base, this.vec)\n}\n\nvar cons = AABB\n  , proto = cons.prototype\n\nproto.width = function() {\n  return this.vec[0]\n}\n\nproto.height = function() {\n  return this.vec[1]\n}\n\nproto.depth = function() {\n  return this.vec[2]\n}\n\nproto.x0 = function() {\n  return this.base[0]\n}\n\nproto.y0 = function() {\n  return this.base[1]\n}\n\nproto.z0 = function() {\n  return this.base[2]\n}\n\nproto.x1 = function() {\n  return this.max[0]\n}\n\nproto.y1 = function() {\n  return this.max[1]\n}\n\nproto.z1 = function() {\n  return this.max[2]\n}\n\nproto.translate = function(by) {\n  vec3.add(this.max, this.max, by)\n  vec3.add(this.base, this.base, by)\n  return this\n}\n\nproto.expand = function(aabb) {\n  var max = vec3.create()\n    , min = vec3.create()\n\n  vec3.max(max, aabb.max, this.max)\n  vec3.min(min, aabb.base, this.base)\n  vec3.sub(max, max, min)\n\n  return new AABB(min, max)\n}\n\nproto.intersects = function(aabb) {\n  if(aabb.base[0] > this.max[0]) return false\n  if(aabb.base[1] > this.max[1]) return false\n  if(aabb.base[2] > this.max[2]) return false\n  if(aabb.max[0] < this.base[0]) return false\n  if(aabb.max[1] < this.base[1]) return false\n  if(aabb.max[2] < this.base[2]) return false\n\n  return true\n}\n\nproto.union = function(aabb) {\n  if(!this.intersects(aabb)) return null\n\n  var base_x = Math.max(aabb.base[0], this.base[0])\n    , base_y = Math.max(aabb.base[1], this.base[1])\n    , base_z = Math.max(aabb.base[2], this.base[2])\n    , max_x = Math.min(aabb.max[0], this.max[0])\n    , max_y = Math.min(aabb.max[1], this.max[1])\n    , max_z = Math.min(aabb.max[2], this.max[2])\n\n  return new AABB([base_x, base_y, base_z], [max_x - base_x, max_y - base_y, max_z - base_z])\n}\n\n//@ sourceURL=/node_modules/voxel-engine/node_modules/aabb-3d/index.js"
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/aabb-3d/node_modules/gl-matrix/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"dist/gl-matrix.js"}\n//@ sourceURL=/node_modules/voxel-engine/node_modules/aabb-3d/node_modules/gl-matrix/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/aabb-3d/node_modules/gl-matrix/dist/gl-matrix.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/spatial-events/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"index.js"}\n//@ sourceURL=/node_modules/voxel-engine/node_modules/spatial-events/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/spatial-events/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = SpatialEventEmitter\n\nvar slice = [].slice\n  , Tree = require('./tree')\n  , aabb = require('aabb-3d')\n\nfunction SpatialEventEmitter() {\n  this.root = null\n  this.infinites = {}\n}\n\nvar cons = SpatialEventEmitter\n  , proto = cons.prototype\n\nproto.size = 16\n\nproto.addListener = \nproto.addEventListener = \nproto.on = function(event, bbox, listener) {\n  if(!finite(bbox)) {\n    (this.infinites[event] = this.infinites[event] || []).push({\n      bbox: bbox\n    , func: listener\n    })\n    return this\n  }\n\n  (this.root = this.root || this.create_root(bbox))\n    .add(event, bbox, listener)\n\n  return this\n}\n\nproto.once = function(event, bbox, listener) {\n  var self = this\n\n  self.on(event, bbox, function once() {\n    listener.apply(null, arguments)\n    self.remove(event, once)\n  })\n\n  return self\n}\n\nproto.removeListener =\nproto.removeEventListener =\nproto.remove = function(event, listener) {\n  if(this.root) {\n    this.root.remove(event, listener)\n  }\n\n  if(!this.infinites[event]) {\n    return this\n  }\n\n  for(var i = 0, len = this.infinites[event].length; i < len; ++i) {\n    if(this.infinites[event][i].func === listener) {\n      break\n    }\n  }\n\n  if(i !== len) {\n    this.infinites[event].splice(i, 1)\n  }\n\n  return this\n}\n\nproto.emit = function(event, bbox/*, ...args */) {\n  var args = slice.call(arguments, 2)\n\n  // support point emitting\n  if('0' in bbox) {\n    bbox = aabb(bbox, [0, 0, 0]) \n  }\n\n  if(this.root) {\n    this.root.send(event, bbox, args)\n  }\n\n  if(!this.infinites[event]) {\n    return this\n  }\n\n  var list = this.infinites[event].slice()\n  for(var i = 0, len = list.length; i < len; ++i) {\n    if(list[i].bbox.intersects(bbox)) {\n      list[i].func.apply(null, args) \n    }\n  }\n\n  return this\n}\n\nproto.rootSize = function(size) {\n  proto.size = size\n}\n\nproto.create_root = function(bbox) {\n  var self = this\n    , size = self.size\n    , base = [\n        Math.floor(bbox.x0() / size) * size\n      , Math.floor(bbox.y0() / size) * size\n      , Math.floor(bbox.z0() / size) * size\n      ]\n    , tree_bbox = new bbox.constructor(base, [size, size, size])\n\n  function OurTree(size, bbox) {\n    Tree.call(this, size, bbox, null)\n  }\n\n  OurTree.prototype = Object.create(Tree.prototype)\n  OurTree.prototype.constructor = OurTree\n  OurTree.prototype.grow = function(new_root) {\n    self.root = new_root\n  }\n  OurTree.prototype.min_size = size\n\n  return new OurTree(size, tree_bbox) \n}\n\nfunction finite(bbox) {\n  return isFinite(bbox.x0()) &&\n         isFinite(bbox.x1()) &&\n         isFinite(bbox.y0()) &&\n         isFinite(bbox.y1()) &&\n         isFinite(bbox.z0()) &&\n         isFinite(bbox.z1())\n}\n\n//@ sourceURL=/node_modules/voxel-engine/node_modules/spatial-events/index.js"
      )
    ),
    n.define(
      "/node_modules/voxel-engine/node_modules/spatial-events/tree.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = Tree\n\nvar aabb = require('aabb-3d')\n\nfunction Tree(size, bbox, parent) {\n  this.listeners = {}\n  this.size = size\n  this.bbox = bbox\n  this.parent = parent\n  this.children = []\n}\n\nvar cons = Tree\n  , proto = cons.prototype\n\nproto.add = function(event, bbox, listener) {\n  if(!this.parent && !this.contains(bbox)) {\n    return this.expand(bbox).add(event, bbox, listener)\n  }\n\n  for(var i = 0, len = this.children.length; i < len; ++i) {\n    if(this.children[i].contains(bbox)) {\n      return this.children[i].add(event, bbox, listener)\n    }\n  }\n\n  var size = this.size / 2\n\n  if(size > this.min_size && bbox.vec[0] < size && bbox.vec[1] < size && bbox.vec[2] < size) {\n    // if it fits into a child node, make that childnode\n    if(Math.floor(bbox.x0() / size) === Math.floor(bbox.x1() / size) &&\n       Math.floor(bbox.y0() / size) === Math.floor(bbox.y1() / size) &&\n       Math.floor(bbox.z0() / size) === Math.floor(bbox.z1() / size)) {\n      var inst = new this.constructor(\n          size\n        , aabb([\n              Math.floor(bbox.x0() / size) * size\n            , Math.floor(bbox.y0() / size) * size\n            , Math.floor(bbox.z0() / size) * size\n            ]\n          , [size, size, size]\n          )\n        , this\n      )\n      this.children.push(inst)\n      return inst.add(event, bbox, listener)\n    }\n  }\n\n  (this.listeners[event] = this.listeners[event] || [])\n    .push({bbox: bbox, func: listener})\n}\n\nproto.contains = function(bbox) {\n  return bbox.x0() >= this.bbox.x0() &&\n         bbox.y0() >= this.bbox.y0() &&\n         bbox.z0() >= this.bbox.z0() &&\n         bbox.x1() <= this.bbox.x1() &&\n         bbox.y1() <= this.bbox.y1() &&\n         bbox.z1() <= this.bbox.z1()\n}\n\nproto.expand = function(bbox) {\n  var size = this.size\n    , new_size = size * 2\n    , expanded = this.bbox.expand(bbox)\n    , new_i = Math.floor(bbox.x0() / size)\n    , new_j = Math.floor(bbox.y0() / size)\n    , new_k = Math.floor(bbox.z0() / size)\n    , cur_i = Math.floor(this.bbox.x0() / size)\n    , cur_j = Math.floor(this.bbox.y0() / size)\n    , cur_k = Math.floor(this.bbox.z0() / size)\n    , new_base = [\n        new_i - cur_i >= 0 ? cur_i : cur_i - 1\n      , new_j - cur_j >= 0 ? cur_j : cur_j - 1\n      , new_k - cur_k >= 0 ? cur_k : cur_k - 1\n      ].map(function(ii) { return ii * size })\n    , new_bbox = aabb(new_base, [new_size, new_size, new_size])\n    , new_root = new this.constructor(new_size, new_bbox)\n    , self = this\n\n  this.parent = new_root\n  this.grow(this.parent)\n\n  new_root.children.push(self)\n\n  return new_root\n}\n\nproto.remove = function(event, listener) {\n  var list = this.listeners[event]\n  if(list) {\n    for(var i = 0, len = list.length; i < len; ++i) {\n      if(list[i].func === listener)\n        break\n    }\n\n    if(i !== len) {\n      list.splice(i, 1)\n    }\n  }\n  for(var i = 0, len = this.children.length; i < len; ++i) {\n    this.children[i].remove(event, listener)\n  }\n}\n\nproto.send = function(event, bbox, args) {\n  for(var i = 0, len = this.children.length; i < len; ++i) {\n    if(bbox.intersects(this.children[i].bbox)) {\n      this.children[i].send(event, bbox, args)\n    }\n  }\n\n  var list = this.listeners[event]\n  if(!list) {\n    return\n  }\n\n  for(var i = 0, len = list.length; i < len; ++i) {\n    if(list[i].bbox.intersects(bbox)) {\n      list[i].func.apply(null, args)\n    }\n  }\n}\n\n//@ sourceURL=/node_modules/voxel-engine/node_modules/spatial-events/tree.js"
      )
    ),
    n.define(
      "/node_modules/voxel-region-change/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = {}\n//@ sourceURL=/node_modules/voxel-region-change/package.json"
      )
    ),
    n.define(
      "/node_modules/voxel-region-change/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = coordinates\n \nvar aabb = require('aabb-3d')\nvar events = require('events')\n \nfunction coordinates(spatial, box, regionWidth) {\n  var emitter = new events.EventEmitter()\n  var lastRegion = [NaN, NaN, NaN]\n  var thisRegion\n\n  if (arguments.length === 2) {\n    regionWidth = box\n    box = aabb([-Infinity, -Infinity, -Infinity], [Infinity, Infinity, Infinity])\n  }\n\n  spatial.on('position', box, updateRegion)\n  \n  function updateRegion(pos) {\n    thisRegion = [Math.floor(pos.x / regionWidth), Math.floor(pos.y / regionWidth), Math.floor(pos.z / regionWidth)]\n    if (thisRegion[0] !== lastRegion[0] || thisRegion[1] !== lastRegion[1] || thisRegion[2] !== lastRegion[2]) {\n      emitter.emit('change', thisRegion)\n    }\n    lastRegion = thisRegion\n  }\n \n  return emitter\n}\n//@ sourceURL=/node_modules/voxel-region-change/index.js"
      )
    ),
    n.define(
      "/node_modules/voxel-region-change/node_modules/aabb-3d/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"index.js"}\n//@ sourceURL=/node_modules/voxel-region-change/node_modules/aabb-3d/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel-region-change/node_modules/aabb-3d/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = AABB\n\nvar vec3 = require('gl-matrix').vec3\n\nfunction AABB(pos, vec) {\n  if(!(this instanceof AABB)) {\n    return new AABB(pos, vec)\n  }\n\n  this.base = pos\n  this.vec = vec\n\n  this.mag = vec3.length(this.vec)\n\n  this.max = vec3.create()\n  vec3.add(this.max, this.base, this.vec)\n}\n\nvar cons = AABB\n  , proto = cons.prototype\n\nproto.width = function() {\n  return this.vec[0]\n}\n\nproto.height = function() {\n  return this.vec[1]\n}\n\nproto.depth = function() {\n  return this.vec[2]\n}\n\nproto.x0 = function() {\n  return this.base[0]\n}\n\nproto.y0 = function() {\n  return this.base[1]\n}\n\nproto.z0 = function() {\n  return this.base[2]\n}\n\nproto.x1 = function() {\n  return this.max[0]\n}\n\nproto.y1 = function() {\n  return this.max[1]\n}\n\nproto.z1 = function() {\n  return this.max[2]\n}\n\nproto.translate = function(by) {\n  vec3.add(this.max, this.max, by)\n  vec3.add(this.base, this.base, by)\n  return this\n}\n\nproto.expand = function(aabb) {\n  var max = vec3.create()\n    , min = vec3.create()\n\n  vec3.max(max, aabb.max, this.max)\n  vec3.min(min, aabb.base, this.base)\n  vec3.sub(max, max, min)\n\n  return new AABB(min, max)\n}\n\nproto.intersects = function(aabb) {\n  if(aabb.base[0] > this.max[0]) return false\n  if(aabb.base[1] > this.max[1]) return false\n  if(aabb.base[2] > this.max[2]) return false\n  if(aabb.max[0] < this.base[0]) return false\n  if(aabb.max[1] < this.base[1]) return false\n  if(aabb.max[2] < this.base[2]) return false\n\n  return true\n}\n\nproto.union = function(aabb) {\n  if(!this.intersects(aabb)) return null\n\n  var base_x = Math.max(aabb.base[0], this.base[0])\n    , base_y = Math.max(aabb.base[1], this.base[1])\n    , base_z = Math.max(aabb.base[2], this.base[2])\n    , max_x = Math.min(aabb.max[0], this.max[0])\n    , max_y = Math.min(aabb.max[1], this.max[1])\n    , max_z = Math.min(aabb.max[2], this.max[2])\n\n  return new AABB([base_x, base_y, base_z], [max_x - base_x, max_y - base_y, max_z - base_z])\n}\n\n//@ sourceURL=/node_modules/voxel-region-change/node_modules/aabb-3d/index.js"
      )
    ),
    n.define(
      "/node_modules/voxel-region-change/node_modules/aabb-3d/node_modules/gl-matrix/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"dist/gl-matrix.js"}\n//@ sourceURL=/node_modules/voxel-region-change/node_modules/aabb-3d/node_modules/gl-matrix/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel-region-change/node_modules/aabb-3d/node_modules/gl-matrix/dist/gl-matrix.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
      )
    ),
    n.define(
      "/node_modules/voxel-texture/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "module.exports = {}\n//@ sourceURL=/node_modules/voxel-texture/package.json"
      )
    ),
    n.define(
      "/node_modules/voxel-texture/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "var transparent = require('opaque').transparent;\n\nfunction Texture(opts) {\n  var self = this;\n  if (!(this instanceof Texture)) return new Texture(opts || {});\n  this.THREE              = opts.THREE          || require('three');\n  this.materials          = [];\n  this.texturePath        = opts.texturePath    || '/textures/';\n  this.materialParams     = opts.materialParams || {};\n  this.materialType       = opts.materialType   || this.THREE.MeshLambertMaterial;\n  this.materialIndex      = [];\n  this._animations        = [];\n  this._materialDefaults  = { ambient: 0xbbbbbb };\n  this.applyTextureParams = opts.applyTextureParams || function(map) {\n    map.magFilter = self.THREE.NearestFilter;\n    map.minFilter = self.THREE.LinearMipMapLinearFilter;\n    map.wrapT     = self.THREE.RepeatWrapping;\n    map.wrapS     = self.THREE.RepeatWrapping;\n  }\n}\nmodule.exports = Texture;\n\nTexture.prototype.load = function(names, opts) {\n  var self = this;\n  opts = self._options(opts);\n  if (!isArray(names)) names = [names];\n  if (!hasSubArray(names)) names = [names];\n  return [].concat.apply([], names.map(function(name) {\n    name = self._expandName(name);\n    self.materialIndex.push([self.materials.length, self.materials.length + name.length]);\n    return name.map(function(n) {\n      if (n instanceof self.THREE.Texture) {\n        var map = n;\n        n = n.name;\n      } else if (typeof n === 'string') {\n        var map = self.THREE.ImageUtils.loadTexture(self.texturePath + ext(n));\n      } else {\n        var map = new self.THREE.Texture(n);\n        n = map.name;\n      }\n      self.applyTextureParams.call(self, map);\n      var mat = new opts.materialType(opts.materialParams);\n      mat.map = map;\n      mat.name = n;\n      if (opts.transparent == null) self._isTransparent(mat);\n      self.materials.push(mat);\n      return mat;\n    });\n  }));\n};\n\nTexture.prototype.get = function(index) {\n  if (index == null) return this.materials;\n  if (typeof index === 'number') {\n    index = this.materialIndex[index];\n  } else {\n    var i = this.find(index);\n    if (i !== -1) index = i;\n    for (var i = 0; i < this.materialIndex.length; i++) {\n      var idx = this.materialIndex[i];\n      if (index >= idx[0] && index < idx[1]) {\n        index = idx;\n        break;\n      }\n    }\n  }\n  return this.materials.slice(index[0], index[1]);\n};\n\nTexture.prototype.find = function(name) {\n  for (var i = 0; i < this.materials.length; i++) {\n    if (name === this.materials[i].name) return i;\n  }\n  return -1;\n};\n\nTexture.prototype._expandName = function(name) {\n  if (name.top) return [name.back, name.front, name.top, name.bottom, name.left, name.right];\n  if (!isArray(name)) name = [name];\n  // load the 0 texture to all\n  if (name.length === 1) name = [name[0],name[0],name[0],name[0],name[0],name[0]];\n  // 0 is top/bottom, 1 is sides\n  if (name.length === 2) name = [name[1],name[1],name[0],name[0],name[1],name[1]];\n  // 0 is top, 1 is bottom, 2 is sides\n  if (name.length === 3) name = [name[2],name[2],name[0],name[1],name[2],name[2]];\n  // 0 is top, 1 is bottom, 2 is front/back, 3 is left/right\n  if (name.length === 4) name = [name[2],name[2],name[0],name[1],name[3],name[3]];\n  return name;\n};\n\nTexture.prototype._options = function(opts) {\n  opts = opts || {};\n  opts.materialType = opts.materialType || this.materialType;\n  opts.materialParams = defaults(opts.materialParams || {}, this._materialDefaults, this.materialParams);\n  opts.applyTextureParams = opts.applyTextureParams || this.applyTextureParams;\n  return opts;\n};\n\nTexture.prototype.paint = function(geom) {\n  var self = this;\n  geom.faces.forEach(function(face, i) {\n    var c = face.vertexColors[0];\n    var index = Math.floor(c.b*255 + c.g*255*255 + c.r*255*255*255);\n    index = self.materialIndex[Math.floor(Math.max(0, index - 1) % self.materialIndex.length)][0];\n\n    // BACK, FRONT, TOP, BOTTOM, LEFT, RIGHT\n    if      (face.normal.z === 1)  index += 1;\n    else if (face.normal.y === 1)  index += 2;\n    else if (face.normal.y === -1) index += 3;\n    else if (face.normal.x === -1) index += 4;\n    else if (face.normal.x === 1)  index += 5;\n\n    face.materialIndex = index;\n  });\n};\n\nTexture.prototype.sprite = function(name, w, h, cb) {\n  var self = this;\n  if (typeof w === 'function') { cb = w; w = null; }\n  if (typeof h === 'function') { cb = h; h = null; }\n  w = w || 16; h = h || w;\n  var img = new Image();\n  img.src = self.texturePath + ext(name);\n  img.onerror = cb;\n  img.onload = function() {\n    var textures = [];\n    for (var x = 0; x < img.width; x += w) {\n      for (var y = 0; y < img.height; y += h) {\n        var canvas = document.createElement('canvas');\n        canvas.width = w; canvas.height = h;\n        var ctx = canvas.getContext('2d');\n        ctx.drawImage(img, x, y, w, h, 0, 0, w, h);\n        var tex = new self.THREE.Texture(canvas);\n        tex.name = name + '_' + x + '_' + y;\n        tex.needsUpdate = true;\n        textures.push(tex);\n      }\n    }\n    cb(null, textures);\n  };\n  return self;\n};\n\nTexture.prototype.animate = function(names, delay) {\n  var self = this;\n  delay = delay || 1000;\n  names = names.map(function(name) {\n    return (typeof name === 'string') ? self.find(name) : name;\n  }).filter(function(name) {\n    return (name !== -1);\n  });\n  if (names.length < 2) return false;\n  if (self._clock == null) self._clock = new self.THREE.Clock();\n  var mat = self.materials[names[0]].clone();\n  self.materials.push(mat);\n  names = [self.materials.length - 1, delay, 0].concat(names);\n  self._animations.push(names);\n  return mat;\n};\n\nTexture.prototype.tick = function() {\n  var self = this;\n  if (self._animations.length < 1 || self._clock == null) return false;\n  var t = self._clock.getElapsedTime();\n  self._animations.forEach(function(anim) {\n    var mats = anim.slice(3);\n    var i = Math.round(t / (anim[1] / 1000)) % (mats.length);\n    if (anim[2] !== i) {\n      self.materials[anim[0]].map = self.materials[mats[i]].map;\n      self.materials[anim[0]].needsUpdate = true;\n      anim[2] = i;\n    }\n  });\n};\n\nTexture.prototype._isTransparent = function(material) {\n  if (!material.map) return;\n  if (!material.map.image) return;\n  if (material.map.image.nodeName.toLowerCase() === 'img') {\n    material.map.image.onload = function() {\n      if (transparent(this)) {\n        material.transparent = true;\n        material.needsUpdate = true;\n      }\n    };\n  } else {\n    if (transparent(material.map.image)) {\n      material.transparent = true;\n      material.needsUpdate = true;\n    }\n  }\n};\n\nfunction ext(name) {\n  return (String(name).indexOf('.') !== -1) ? name : name + '.png';\n}\n\n// copied from https://github.com/joyent/node/blob/master/lib/util.js#L433\nfunction isArray(ar) {\n  return Array.isArray(ar) || (typeof ar === 'object' && Object.prototype.toString.call(ar) === '[object Array]');\n}\n\nfunction hasSubArray(ar) {\n  var has = false;\n  ar.forEach(function(a) { if (isArray(a)) { has = true; return false; } });\n  return has;\n}\n\nfunction defaults(obj) {\n  [].slice.call(arguments, 1).forEach(function(from) {\n    if (from) for (var k in from) if (obj[k] == null) obj[k] = from[k];\n  });\n  return obj;\n}\n\n//@ sourceURL=/node_modules/voxel-texture/index.js"
      )
    ),
    n.define(
      "/node_modules/voxel-texture/node_modules/opaque/package.json",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        'module.exports = {"main":"index.js"}\n//@ sourceURL=/node_modules/voxel-texture/node_modules/opaque/package.json'
      )
    ),
    n.define(
      "/node_modules/voxel-texture/node_modules/opaque/index.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "function opaque(image) {\n  var canvas, ctx\n\n  if (image.nodeName.toLowerCase() === 'img') {\n    canvas = document.createElement('canvas')\n    canvas.width = image.width\n    canvas.height = image.height\n    ctx = canvas.getContext('2d')\n    ctx.drawImage(image, 0, 0)\n  } else {\n    canvas = image\n    ctx = canvas.getContext('2d')\n  }\n\n  var imageData = ctx.getImageData(0, 0, canvas.height, canvas.width)\n    , data = imageData.data\n\n  for (var i = 3, l = data.length; i < l; i += 4)\n    if (data[i] !== 255)\n      return false\n\n  return true\n};\n\nmodule.exports = opaque\nmodule.exports.opaque = opaque\nmodule.exports.transparent = function(image) {\n  return !opaque(image)\n};\n//@ sourceURL=/node_modules/voxel-texture/node_modules/opaque/index.js"
      )
    ),
    n.define(
      "/app.js",
      Function(
        [
          "require",
          "module",
          "exports",
          "__dirname",
          "__filename",
          "process",
          "global",
        ],
        "var createGame = require('voxel-engine')\n\nfunction sphereWorld(x, y, z) {\n  // return the index of the material you want to show up\n  // 0 is air\n	if (x*x + y*y + z*z > 15*15) return 0\n  return 3	\n}\n\nvar game = createGame({\n  generate: sphereWorld,\n  startingPosition: [0, 1000, 0], // x, y, z\n  materials: [['grass', 'dirt', 'grass_dirt'], 'brick', 'dirt', 'obsidian', 'bedrock']\n})\n\n// rotate camera to look straight down\ngame.controls.pitchObject.rotation.x = -1.5\n\nvar container = document.body\ngame.appendTo(container)\n// have the game take over your mouse pointer when you click on it\ngame.setupPointerLock(container)\n//@ sourceURL=/app.js"
      )
    ),
    n("/app.js");
})();
