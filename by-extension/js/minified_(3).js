require = (function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw ((f.code = "MODULE_NOT_FOUND"), f);
      }
      var l = (n[o] = { exports: {} });
      t[o][0].call(
        l.exports,
        function (e) {
          var n = t[o][1][e];
          return s(n ? n : e);
        },
        l,
        l.exports,
        e,
        t,
        n,
        r
      );
    }
    return n[o].exports;
  }
  var i = typeof require == "function" && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
})(
  {
    1: [
      function (require, module, exports) {
        var base64 = require("base64-js");
        var ieee754 = require("ieee754");
        var isArray = require("is-array");
        exports.Buffer = Buffer;
        exports.SlowBuffer = SlowBuffer;
        exports.INSPECT_MAX_BYTES = 50;
        Buffer.poolSize = 8192;
        var kMaxLength = 1073741823;
        var rootParent = {};
        Buffer.TYPED_ARRAY_SUPPORT = (function () {
          try {
            var buf = new ArrayBuffer(0);
            var arr = new Uint8Array(buf);
            arr.foo = function () {
              return 42;
            };
            return (
              42 === arr.foo() &&
              typeof arr.subarray === "function" &&
              new Uint8Array(1).subarray(1, 1).byteLength === 0
            );
          } catch (e) {
            return false;
          }
        })();
        function Buffer(subject, encoding, noZero) {
          if (!(this instanceof Buffer))
            return new Buffer(subject, encoding, noZero);
          var type = typeof subject;
          var length;
          if (type === "number") length = subject > 0 ? subject >>> 0 : 0;
          else if (type === "string") {
            length = Buffer.byteLength(subject, encoding);
          } else if (type === "object" && subject !== null) {
            if (subject.type === "Buffer" && isArray(subject.data))
              subject = subject.data;
            length = +subject.length > 0 ? Math.floor(+subject.length) : 0;
          } else
            throw new TypeError(
              "must start with number, buffer, array or string"
            );
          if (length > kMaxLength)
            throw new RangeError(
              "Attempt to allocate Buffer larger than maximum " +
                "size: 0x" +
                kMaxLength.toString(16) +
                " bytes"
            );
          var buf;
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            buf = Buffer._augment(new Uint8Array(length));
          } else {
            buf = this;
            buf.length = length;
            buf._isBuffer = true;
          }
          var i;
          if (
            Buffer.TYPED_ARRAY_SUPPORT &&
            typeof subject.byteLength === "number"
          ) {
            buf._set(subject);
          } else if (isArrayish(subject)) {
            if (Buffer.isBuffer(subject)) {
              for (i = 0; i < length; i++) buf[i] = subject.readUInt8(i);
            } else {
              for (i = 0; i < length; i++)
                buf[i] = ((subject[i] % 256) + 256) % 256;
            }
          } else if (type === "string") {
            buf.write(subject, 0, encoding);
          } else if (
            type === "number" &&
            !Buffer.TYPED_ARRAY_SUPPORT &&
            !noZero
          ) {
            for (i = 0; i < length; i++) {
              buf[i] = 0;
            }
          }
          if (length > 0 && length <= Buffer.poolSize) buf.parent = rootParent;
          return buf;
        }
        function SlowBuffer(subject, encoding, noZero) {
          if (!(this instanceof SlowBuffer))
            return new SlowBuffer(subject, encoding, noZero);
          var buf = new Buffer(subject, encoding, noZero);
          delete buf.parent;
          return buf;
        }
        Buffer.isBuffer = function (b) {
          return !!(b != null && b._isBuffer);
        };
        Buffer.compare = function (a, b) {
          if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
            throw new TypeError("Arguments must be Buffers");
          var x = a.length;
          var y = b.length;
          for (
            var i = 0, len = Math.min(x, y);
            i < len && a[i] === b[i];
            i++
          ) {}
          if (i !== len) {
            x = a[i];
            y = b[i];
          }
          if (x < y) return -1;
          if (y < x) return 1;
          return 0;
        };
        Buffer.isEncoding = function (encoding) {
          switch (String(encoding).toLowerCase()) {
            case "hex":
            case "utf8":
            case "utf-8":
            case "ascii":
            case "binary":
            case "base64":
            case "raw":
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return true;
            default:
              return false;
          }
        };
        Buffer.concat = function (list, totalLength) {
          if (!isArray(list))
            throw new TypeError("Usage: Buffer.concat(list[, length])");
          if (list.length === 0) {
            return new Buffer(0);
          } else if (list.length === 1) {
            return list[0];
          }
          var i;
          if (totalLength === undefined) {
            totalLength = 0;
            for (i = 0; i < list.length; i++) {
              totalLength += list[i].length;
            }
          }
          var buf = new Buffer(totalLength);
          var pos = 0;
          for (i = 0; i < list.length; i++) {
            var item = list[i];
            item.copy(buf, pos);
            pos += item.length;
          }
          return buf;
        };
        Buffer.byteLength = function (str, encoding) {
          var ret;
          str = str + "";
          switch (encoding || "utf8") {
            case "ascii":
            case "binary":
            case "raw":
              ret = str.length;
              break;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              ret = str.length * 2;
              break;
            case "hex":
              ret = str.length >>> 1;
              break;
            case "utf8":
            case "utf-8":
              ret = utf8ToBytes(str).length;
              break;
            case "base64":
              ret = base64ToBytes(str).length;
              break;
            default:
              ret = str.length;
          }
          return ret;
        };
        Buffer.prototype.length = undefined;
        Buffer.prototype.parent = undefined;
        Buffer.prototype.toString = function (encoding, start, end) {
          var loweredCase = false;
          start = start >>> 0;
          end = end === undefined || end === Infinity ? this.length : end >>> 0;
          if (!encoding) encoding = "utf8";
          if (start < 0) start = 0;
          if (end > this.length) end = this.length;
          if (end <= start) return "";
          while (true) {
            switch (encoding) {
              case "hex":
                return hexSlice(this, start, end);
              case "utf8":
              case "utf-8":
                return utf8Slice(this, start, end);
              case "ascii":
                return asciiSlice(this, start, end);
              case "binary":
                return binarySlice(this, start, end);
              case "base64":
                return base64Slice(this, start, end);
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
                return utf16leSlice(this, start, end);
              default:
                if (loweredCase)
                  throw new TypeError("Unknown encoding: " + encoding);
                encoding = (encoding + "").toLowerCase();
                loweredCase = true;
            }
          }
        };
        Buffer.prototype.equals = function (b) {
          if (!Buffer.isBuffer(b))
            throw new TypeError("Argument must be a Buffer");
          return Buffer.compare(this, b) === 0;
        };
        Buffer.prototype.inspect = function () {
          var str = "";
          var max = exports.INSPECT_MAX_BYTES;
          if (this.length > 0) {
            str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
            if (this.length > max) str += " ... ";
          }
          return "<Buffer " + str + ">";
        };
        Buffer.prototype.compare = function (b) {
          if (!Buffer.isBuffer(b))
            throw new TypeError("Argument must be a Buffer");
          return Buffer.compare(this, b);
        };
        Buffer.prototype.get = function (offset) {
          console.log(
            ".get() is deprecated. Access using array indexes instead."
          );
          return this.readUInt8(offset);
        };
        Buffer.prototype.set = function (v, offset) {
          console.log(
            ".set() is deprecated. Access using array indexes instead."
          );
          return this.writeUInt8(v, offset);
        };
        function hexWrite(buf, string, offset, length) {
          offset = Number(offset) || 0;
          var remaining = buf.length - offset;
          if (!length) {
            length = remaining;
          } else {
            length = Number(length);
            if (length > remaining) {
              length = remaining;
            }
          }
          var strLen = string.length;
          if (strLen % 2 !== 0) throw new Error("Invalid hex string");
          if (length > strLen / 2) {
            length = strLen / 2;
          }
          for (var i = 0; i < length; i++) {
            var byte = parseInt(string.substr(i * 2, 2), 16);
            if (isNaN(byte)) throw new Error("Invalid hex string");
            buf[offset + i] = byte;
          }
          return i;
        }
        function utf8Write(buf, string, offset, length) {
          var charsWritten = blitBuffer(
            utf8ToBytes(string, buf.length - offset),
            buf,
            offset,
            length
          );
          return charsWritten;
        }
        function asciiWrite(buf, string, offset, length) {
          var charsWritten = blitBuffer(
            asciiToBytes(string),
            buf,
            offset,
            length
          );
          return charsWritten;
        }
        function binaryWrite(buf, string, offset, length) {
          return asciiWrite(buf, string, offset, length);
        }
        function base64Write(buf, string, offset, length) {
          var charsWritten = blitBuffer(
            base64ToBytes(string),
            buf,
            offset,
            length
          );
          return charsWritten;
        }
        function utf16leWrite(buf, string, offset, length) {
          var charsWritten = blitBuffer(
            utf16leToBytes(string, buf.length - offset),
            buf,
            offset,
            length,
            2
          );
          return charsWritten;
        }
        Buffer.prototype.write = function (string, offset, length, encoding) {
          if (isFinite(offset)) {
            if (!isFinite(length)) {
              encoding = length;
              length = undefined;
            }
          } else {
            var swap = encoding;
            encoding = offset;
            offset = length;
            length = swap;
          }
          offset = Number(offset) || 0;
          if (length < 0 || offset < 0 || offset > this.length)
            throw new RangeError("attempt to write outside buffer bounds");
          var remaining = this.length - offset;
          if (!length) {
            length = remaining;
          } else {
            length = Number(length);
            if (length > remaining) {
              length = remaining;
            }
          }
          encoding = String(encoding || "utf8").toLowerCase();
          var ret;
          switch (encoding) {
            case "hex":
              ret = hexWrite(this, string, offset, length);
              break;
            case "utf8":
            case "utf-8":
              ret = utf8Write(this, string, offset, length);
              break;
            case "ascii":
              ret = asciiWrite(this, string, offset, length);
              break;
            case "binary":
              ret = binaryWrite(this, string, offset, length);
              break;
            case "base64":
              ret = base64Write(this, string, offset, length);
              break;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              ret = utf16leWrite(this, string, offset, length);
              break;
            default:
              throw new TypeError("Unknown encoding: " + encoding);
          }
          return ret;
        };
        Buffer.prototype.toJSON = function () {
          return {
            type: "Buffer",
            data: Array.prototype.slice.call(this._arr || this, 0),
          };
        };
        function base64Slice(buf, start, end) {
          if (start === 0 && end === buf.length) {
            return base64.fromByteArray(buf);
          } else {
            return base64.fromByteArray(buf.slice(start, end));
          }
        }
        function utf8Slice(buf, start, end) {
          var res = "";
          var tmp = "";
          end = Math.min(buf.length, end);
          for (var i = start; i < end; i++) {
            if (buf[i] <= 127) {
              res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i]);
              tmp = "";
            } else {
              tmp += "%" + buf[i].toString(16);
            }
          }
          return res + decodeUtf8Char(tmp);
        }
        function asciiSlice(buf, start, end) {
          var ret = "";
          end = Math.min(buf.length, end);
          for (var i = start; i < end; i++) {
            ret += String.fromCharCode(buf[i] & 127);
          }
          return ret;
        }
        function binarySlice(buf, start, end) {
          var ret = "";
          end = Math.min(buf.length, end);
          for (var i = start; i < end; i++) {
            ret += String.fromCharCode(buf[i]);
          }
          return ret;
        }
        function hexSlice(buf, start, end) {
          var len = buf.length;
          if (!start || start < 0) start = 0;
          if (!end || end < 0 || end > len) end = len;
          var out = "";
          for (var i = start; i < end; i++) {
            out += toHex(buf[i]);
          }
          return out;
        }
        function utf16leSlice(buf, start, end) {
          var bytes = buf.slice(start, end);
          var res = "";
          for (var i = 0; i < bytes.length; i += 2) {
            res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
          }
          return res;
        }
        Buffer.prototype.slice = function (start, end) {
          var len = this.length;
          start = ~~start;
          end = end === undefined ? len : ~~end;
          if (start < 0) {
            start += len;
            if (start < 0) start = 0;
          } else if (start > len) {
            start = len;
          }
          if (end < 0) {
            end += len;
            if (end < 0) end = 0;
          } else if (end > len) {
            end = len;
          }
          if (end < start) end = start;
          var newBuf;
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            newBuf = Buffer._augment(this.subarray(start, end));
          } else {
            var sliceLen = end - start;
            newBuf = new Buffer(sliceLen, undefined, true);
            for (var i = 0; i < sliceLen; i++) {
              newBuf[i] = this[i + start];
            }
          }
          if (newBuf.length) newBuf.parent = this.parent || this;
          return newBuf;
        };
        function checkOffset(offset, ext, length) {
          if (offset % 1 !== 0 || offset < 0)
            throw new RangeError("offset is not uint");
          if (offset + ext > length)
            throw new RangeError("Trying to access beyond buffer length");
        }
        Buffer.prototype.readUIntLE = function (offset, byteLength, noAssert) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);
          var val = this[offset];
          var mul = 1;
          var i = 0;
          while (++i < byteLength && (mul *= 256))
            val += this[offset + i] * mul;
          return val;
        };
        Buffer.prototype.readUIntBE = function (offset, byteLength, noAssert) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);
          var val = this[offset + --byteLength];
          var mul = 1;
          while (byteLength > 0 && (mul *= 256))
            val += this[offset + --byteLength] * mul;
          return val;
        };
        Buffer.prototype.readUInt8 = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 1, this.length);
          return this[offset];
        };
        Buffer.prototype.readUInt16LE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 2, this.length);
          return this[offset] | (this[offset + 1] << 8);
        };
        Buffer.prototype.readUInt16BE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 2, this.length);
          return (this[offset] << 8) | this[offset + 1];
        };
        Buffer.prototype.readUInt32LE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return (
            (this[offset] |
              (this[offset + 1] << 8) |
              (this[offset + 2] << 16)) +
            this[offset + 3] * 16777216
          );
        };
        Buffer.prototype.readUInt32BE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return (
            this[offset] * 16777216 +
            ((this[offset + 1] << 16) |
              (this[offset + 2] << 8) |
              this[offset + 3])
          );
        };
        Buffer.prototype.readIntLE = function (offset, byteLength, noAssert) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);
          var val = this[offset];
          var mul = 1;
          var i = 0;
          while (++i < byteLength && (mul *= 256))
            val += this[offset + i] * mul;
          mul *= 128;
          if (val >= mul) val -= Math.pow(2, 8 * byteLength);
          return val;
        };
        Buffer.prototype.readIntBE = function (offset, byteLength, noAssert) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);
          var i = byteLength;
          var mul = 1;
          var val = this[offset + --i];
          while (i > 0 && (mul *= 256)) val += this[offset + --i] * mul;
          mul *= 128;
          if (val >= mul) val -= Math.pow(2, 8 * byteLength);
          return val;
        };
        Buffer.prototype.readInt8 = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 1, this.length);
          if (!(this[offset] & 128)) return this[offset];
          return (255 - this[offset] + 1) * -1;
        };
        Buffer.prototype.readInt16LE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 2, this.length);
          var val = this[offset] | (this[offset + 1] << 8);
          return val & 32768 ? val | 4294901760 : val;
        };
        Buffer.prototype.readInt16BE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 2, this.length);
          var val = this[offset + 1] | (this[offset] << 8);
          return val & 32768 ? val | 4294901760 : val;
        };
        Buffer.prototype.readInt32LE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return (
            this[offset] |
            (this[offset + 1] << 8) |
            (this[offset + 2] << 16) |
            (this[offset + 3] << 24)
          );
        };
        Buffer.prototype.readInt32BE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return (
            (this[offset] << 24) |
            (this[offset + 1] << 16) |
            (this[offset + 2] << 8) |
            this[offset + 3]
          );
        };
        Buffer.prototype.readFloatLE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return ieee754.read(this, offset, true, 23, 4);
        };
        Buffer.prototype.readFloatBE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return ieee754.read(this, offset, false, 23, 4);
        };
        Buffer.prototype.readDoubleLE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 8, this.length);
          return ieee754.read(this, offset, true, 52, 8);
        };
        Buffer.prototype.readDoubleBE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 8, this.length);
          return ieee754.read(this, offset, false, 52, 8);
        };
        function checkInt(buf, value, offset, ext, max, min) {
          if (!Buffer.isBuffer(buf))
            throw new TypeError("buffer must be a Buffer instance");
          if (value > max || value < min)
            throw new RangeError("value is out of bounds");
          if (offset + ext > buf.length)
            throw new RangeError("index out of range");
        }
        Buffer.prototype.writeUIntLE = function (
          value,
          offset,
          byteLength,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert)
            checkInt(
              this,
              value,
              offset,
              byteLength,
              Math.pow(2, 8 * byteLength),
              0
            );
          var mul = 1;
          var i = 0;
          this[offset] = value & 255;
          while (++i < byteLength && (mul *= 256))
            this[offset + i] = ((value / mul) >>> 0) & 255;
          return offset + byteLength;
        };
        Buffer.prototype.writeUIntBE = function (
          value,
          offset,
          byteLength,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert)
            checkInt(
              this,
              value,
              offset,
              byteLength,
              Math.pow(2, 8 * byteLength),
              0
            );
          var i = byteLength - 1;
          var mul = 1;
          this[offset + i] = value & 255;
          while (--i >= 0 && (mul *= 256))
            this[offset + i] = ((value / mul) >>> 0) & 255;
          return offset + byteLength;
        };
        Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
          if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
          this[offset] = value;
          return offset + 1;
        };
        function objectWriteUInt16(buf, value, offset, littleEndian) {
          if (value < 0) value = 65535 + value + 1;
          for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
            buf[offset + i] =
              (value & (255 << (8 * (littleEndian ? i : 1 - i)))) >>>
              ((littleEndian ? i : 1 - i) * 8);
          }
        }
        Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value;
            this[offset + 1] = value >>> 8;
          } else objectWriteUInt16(this, value, offset, true);
          return offset + 2;
        };
        Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value >>> 8;
            this[offset + 1] = value;
          } else objectWriteUInt16(this, value, offset, false);
          return offset + 2;
        };
        function objectWriteUInt32(buf, value, offset, littleEndian) {
          if (value < 0) value = 4294967295 + value + 1;
          for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
            buf[offset + i] =
              (value >>> ((littleEndian ? i : 3 - i) * 8)) & 255;
          }
        }
        Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset + 3] = value >>> 24;
            this[offset + 2] = value >>> 16;
            this[offset + 1] = value >>> 8;
            this[offset] = value;
          } else objectWriteUInt32(this, value, offset, true);
          return offset + 4;
        };
        Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value >>> 24;
            this[offset + 1] = value >>> 16;
            this[offset + 2] = value >>> 8;
            this[offset + 3] = value;
          } else objectWriteUInt32(this, value, offset, false);
          return offset + 4;
        };
        Buffer.prototype.writeIntLE = function (
          value,
          offset,
          byteLength,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) {
            checkInt(
              this,
              value,
              offset,
              byteLength,
              Math.pow(2, 8 * byteLength - 1) - 1,
              -Math.pow(2, 8 * byteLength - 1)
            );
          }
          var i = 0;
          var mul = 1;
          var sub = value < 0 ? 1 : 0;
          this[offset] = value & 255;
          while (++i < byteLength && (mul *= 256))
            this[offset + i] = (((value / mul) >> 0) - sub) & 255;
          return offset + byteLength;
        };
        Buffer.prototype.writeIntBE = function (
          value,
          offset,
          byteLength,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) {
            checkInt(
              this,
              value,
              offset,
              byteLength,
              Math.pow(2, 8 * byteLength - 1) - 1,
              -Math.pow(2, 8 * byteLength - 1)
            );
          }
          var i = byteLength - 1;
          var mul = 1;
          var sub = value < 0 ? 1 : 0;
          this[offset + i] = value & 255;
          while (--i >= 0 && (mul *= 256))
            this[offset + i] = (((value / mul) >> 0) - sub) & 255;
          return offset + byteLength;
        };
        Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
          if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
          if (value < 0) value = 255 + value + 1;
          this[offset] = value;
          return offset + 1;
        };
        Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value;
            this[offset + 1] = value >>> 8;
          } else objectWriteUInt16(this, value, offset, true);
          return offset + 2;
        };
        Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value >>> 8;
            this[offset + 1] = value;
          } else objectWriteUInt16(this, value, offset, false);
          return offset + 2;
        };
        Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert)
            checkInt(this, value, offset, 4, 2147483647, -2147483648);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value;
            this[offset + 1] = value >>> 8;
            this[offset + 2] = value >>> 16;
            this[offset + 3] = value >>> 24;
          } else objectWriteUInt32(this, value, offset, true);
          return offset + 4;
        };
        Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert)
            checkInt(this, value, offset, 4, 2147483647, -2147483648);
          if (value < 0) value = 4294967295 + value + 1;
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value >>> 24;
            this[offset + 1] = value >>> 16;
            this[offset + 2] = value >>> 8;
            this[offset + 3] = value;
          } else objectWriteUInt32(this, value, offset, false);
          return offset + 4;
        };
        function checkIEEE754(buf, value, offset, ext, max, min) {
          if (value > max || value < min)
            throw new RangeError("value is out of bounds");
          if (offset + ext > buf.length)
            throw new RangeError("index out of range");
          if (offset < 0) throw new RangeError("index out of range");
        }
        function writeFloat(buf, value, offset, littleEndian, noAssert) {
          if (!noAssert)
            checkIEEE754(
              buf,
              value,
              offset,
              4,
              3.4028234663852886e38,
              -3.4028234663852886e38
            );
          ieee754.write(buf, value, offset, littleEndian, 23, 4);
          return offset + 4;
        }
        Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
          return writeFloat(this, value, offset, true, noAssert);
        };
        Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
          return writeFloat(this, value, offset, false, noAssert);
        };
        function writeDouble(buf, value, offset, littleEndian, noAssert) {
          if (!noAssert)
            checkIEEE754(
              buf,
              value,
              offset,
              8,
              1.7976931348623157e308,
              -1.7976931348623157e308
            );
          ieee754.write(buf, value, offset, littleEndian, 52, 8);
          return offset + 8;
        }
        Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
          return writeDouble(this, value, offset, true, noAssert);
        };
        Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
          return writeDouble(this, value, offset, false, noAssert);
        };
        Buffer.prototype.copy = function (target, target_start, start, end) {
          var source = this;
          if (!start) start = 0;
          if (!end && end !== 0) end = this.length;
          if (target_start >= target.length) target_start = target.length;
          if (!target_start) target_start = 0;
          if (end > 0 && end < start) end = start;
          if (end === start) return 0;
          if (target.length === 0 || source.length === 0) return 0;
          if (target_start < 0)
            throw new RangeError("targetStart out of bounds");
          if (start < 0 || start >= source.length)
            throw new RangeError("sourceStart out of bounds");
          if (end < 0) throw new RangeError("sourceEnd out of bounds");
          if (end > this.length) end = this.length;
          if (target.length - target_start < end - start)
            end = target.length - target_start + start;
          var len = end - start;
          if (len < 1e3 || !Buffer.TYPED_ARRAY_SUPPORT) {
            for (var i = 0; i < len; i++) {
              target[i + target_start] = this[i + start];
            }
          } else {
            target._set(this.subarray(start, start + len), target_start);
          }
          return len;
        };
        Buffer.prototype.fill = function (value, start, end) {
          if (!value) value = 0;
          if (!start) start = 0;
          if (!end) end = this.length;
          if (end < start) throw new RangeError("end < start");
          if (end === start) return;
          if (this.length === 0) return;
          if (start < 0 || start >= this.length)
            throw new RangeError("start out of bounds");
          if (end < 0 || end > this.length)
            throw new RangeError("end out of bounds");
          var i;
          if (typeof value === "number") {
            for (i = start; i < end; i++) {
              this[i] = value;
            }
          } else {
            var bytes = utf8ToBytes(value.toString());
            var len = bytes.length;
            for (i = start; i < end; i++) {
              this[i] = bytes[i % len];
            }
          }
          return this;
        };
        Buffer.prototype.toArrayBuffer = function () {
          if (typeof Uint8Array !== "undefined") {
            if (Buffer.TYPED_ARRAY_SUPPORT) {
              return new Buffer(this).buffer;
            } else {
              var buf = new Uint8Array(this.length);
              for (var i = 0, len = buf.length; i < len; i += 1) {
                buf[i] = this[i];
              }
              return buf.buffer;
            }
          } else {
            throw new TypeError(
              "Buffer.toArrayBuffer not supported in this browser"
            );
          }
        };
        var BP = Buffer.prototype;
        Buffer._augment = function (arr) {
          arr.constructor = Buffer;
          arr._isBuffer = true;
          arr._get = arr.get;
          arr._set = arr.set;
          arr.get = BP.get;
          arr.set = BP.set;
          arr.write = BP.write;
          arr.toString = BP.toString;
          arr.toLocaleString = BP.toString;
          arr.toJSON = BP.toJSON;
          arr.equals = BP.equals;
          arr.compare = BP.compare;
          arr.copy = BP.copy;
          arr.slice = BP.slice;
          arr.readUIntLE = BP.readUIntLE;
          arr.readUIntBE = BP.readUIntBE;
          arr.readUInt8 = BP.readUInt8;
          arr.readUInt16LE = BP.readUInt16LE;
          arr.readUInt16BE = BP.readUInt16BE;
          arr.readUInt32LE = BP.readUInt32LE;
          arr.readUInt32BE = BP.readUInt32BE;
          arr.readIntLE = BP.readIntLE;
          arr.readIntBE = BP.readIntBE;
          arr.readInt8 = BP.readInt8;
          arr.readInt16LE = BP.readInt16LE;
          arr.readInt16BE = BP.readInt16BE;
          arr.readInt32LE = BP.readInt32LE;
          arr.readInt32BE = BP.readInt32BE;
          arr.readFloatLE = BP.readFloatLE;
          arr.readFloatBE = BP.readFloatBE;
          arr.readDoubleLE = BP.readDoubleLE;
          arr.readDoubleBE = BP.readDoubleBE;
          arr.writeUInt8 = BP.writeUInt8;
          arr.writeUIntLE = BP.writeUIntLE;
          arr.writeUIntBE = BP.writeUIntBE;
          arr.writeUInt16LE = BP.writeUInt16LE;
          arr.writeUInt16BE = BP.writeUInt16BE;
          arr.writeUInt32LE = BP.writeUInt32LE;
          arr.writeUInt32BE = BP.writeUInt32BE;
          arr.writeIntLE = BP.writeIntLE;
          arr.writeIntBE = BP.writeIntBE;
          arr.writeInt8 = BP.writeInt8;
          arr.writeInt16LE = BP.writeInt16LE;
          arr.writeInt16BE = BP.writeInt16BE;
          arr.writeInt32LE = BP.writeInt32LE;
          arr.writeInt32BE = BP.writeInt32BE;
          arr.writeFloatLE = BP.writeFloatLE;
          arr.writeFloatBE = BP.writeFloatBE;
          arr.writeDoubleLE = BP.writeDoubleLE;
          arr.writeDoubleBE = BP.writeDoubleBE;
          arr.fill = BP.fill;
          arr.inspect = BP.inspect;
          arr.toArrayBuffer = BP.toArrayBuffer;
          return arr;
        };
        var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g;
        function base64clean(str) {
          str = stringtrim(str).replace(INVALID_BASE64_RE, "");
          if (str.length < 2) return "";
          while (str.length % 4 !== 0) {
            str = str + "=";
          }
          return str;
        }
        function stringtrim(str) {
          if (str.trim) return str.trim();
          return str.replace(/^\s+|\s+$/g, "");
        }
        function isArrayish(subject) {
          return (
            isArray(subject) ||
            Buffer.isBuffer(subject) ||
            (subject &&
              typeof subject === "object" &&
              typeof subject.length === "number")
          );
        }
        function toHex(n) {
          if (n < 16) return "0" + n.toString(16);
          return n.toString(16);
        }
        function utf8ToBytes(string, units) {
          var codePoint,
            length = string.length;
          var leadSurrogate = null;
          units = units || Infinity;
          var bytes = [];
          var i = 0;
          for (; i < length; i++) {
            codePoint = string.charCodeAt(i);
            if (codePoint > 55295 && codePoint < 57344) {
              if (leadSurrogate) {
                if (codePoint < 56320) {
                  if ((units -= 3) > -1) bytes.push(239, 191, 189);
                  leadSurrogate = codePoint;
                  continue;
                } else {
                  codePoint =
                    ((leadSurrogate - 55296) << 10) |
                    (codePoint - 56320) |
                    65536;
                  leadSurrogate = null;
                }
              } else {
                if (codePoint > 56319) {
                  if ((units -= 3) > -1) bytes.push(239, 191, 189);
                  continue;
                } else if (i + 1 === length) {
                  if ((units -= 3) > -1) bytes.push(239, 191, 189);
                  continue;
                } else {
                  leadSurrogate = codePoint;
                  continue;
                }
              }
            } else if (leadSurrogate) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              leadSurrogate = null;
            }
            if (codePoint < 128) {
              if ((units -= 1) < 0) break;
              bytes.push(codePoint);
            } else if (codePoint < 2048) {
              if ((units -= 2) < 0) break;
              bytes.push((codePoint >> 6) | 192, (codePoint & 63) | 128);
            } else if (codePoint < 65536) {
              if ((units -= 3) < 0) break;
              bytes.push(
                (codePoint >> 12) | 224,
                ((codePoint >> 6) & 63) | 128,
                (codePoint & 63) | 128
              );
            } else if (codePoint < 2097152) {
              if ((units -= 4) < 0) break;
              bytes.push(
                (codePoint >> 18) | 240,
                ((codePoint >> 12) & 63) | 128,
                ((codePoint >> 6) & 63) | 128,
                (codePoint & 63) | 128
              );
            } else {
              throw new Error("Invalid code point");
            }
          }
          return bytes;
        }
        function asciiToBytes(str) {
          var byteArray = [];
          for (var i = 0; i < str.length; i++) {
            byteArray.push(str.charCodeAt(i) & 255);
          }
          return byteArray;
        }
        function utf16leToBytes(str, units) {
          var c, hi, lo;
          var byteArray = [];
          for (var i = 0; i < str.length; i++) {
            if ((units -= 2) < 0) break;
            c = str.charCodeAt(i);
            hi = c >> 8;
            lo = c % 256;
            byteArray.push(lo);
            byteArray.push(hi);
          }
          return byteArray;
        }
        function base64ToBytes(str) {
          return base64.toByteArray(base64clean(str));
        }
        function blitBuffer(src, dst, offset, length, unitSize) {
          if (unitSize) length -= length % unitSize;
          for (var i = 0; i < length; i++) {
            if (i + offset >= dst.length || i >= src.length) break;
            dst[i + offset] = src[i];
          }
          return i;
        }
        function decodeUtf8Char(str) {
          try {
            return decodeURIComponent(str);
          } catch (err) {
            return String.fromCharCode(65533);
          }
        }
      },
      { "base64-js": 2, ieee754: 3, "is-array": 4 },
    ],
    2: [
      function (require, module, exports) {
        var lookup =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        (function (exports) {
          "use strict";
          var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
          var PLUS = "+".charCodeAt(0);
          var SLASH = "/".charCodeAt(0);
          var NUMBER = "0".charCodeAt(0);
          var LOWER = "a".charCodeAt(0);
          var UPPER = "A".charCodeAt(0);
          var PLUS_URL_SAFE = "-".charCodeAt(0);
          var SLASH_URL_SAFE = "_".charCodeAt(0);
          function decode(elt) {
            var code = elt.charCodeAt(0);
            if (code === PLUS || code === PLUS_URL_SAFE) return 62;
            if (code === SLASH || code === SLASH_URL_SAFE) return 63;
            if (code < NUMBER) return -1;
            if (code < NUMBER + 10) return code - NUMBER + 26 + 26;
            if (code < UPPER + 26) return code - UPPER;
            if (code < LOWER + 26) return code - LOWER + 26;
          }
          function b64ToByteArray(b64) {
            var i, j, l, tmp, placeHolders, arr;
            if (b64.length % 4 > 0) {
              throw new Error("Invalid string. Length must be a multiple of 4");
            }
            var len = b64.length;
            placeHolders =
              "=" === b64.charAt(len - 2)
                ? 2
                : "=" === b64.charAt(len - 1)
                ? 1
                : 0;
            arr = new Arr((b64.length * 3) / 4 - placeHolders);
            l = placeHolders > 0 ? b64.length - 4 : b64.length;
            var L = 0;
            function push(v) {
              arr[L++] = v;
            }
            for (i = 0, j = 0; i < l; i += 4, j += 3) {
              tmp =
                (decode(b64.charAt(i)) << 18) |
                (decode(b64.charAt(i + 1)) << 12) |
                (decode(b64.charAt(i + 2)) << 6) |
                decode(b64.charAt(i + 3));
              push((tmp & 16711680) >> 16);
              push((tmp & 65280) >> 8);
              push(tmp & 255);
            }
            if (placeHolders === 2) {
              tmp =
                (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4);
              push(tmp & 255);
            } else if (placeHolders === 1) {
              tmp =
                (decode(b64.charAt(i)) << 10) |
                (decode(b64.charAt(i + 1)) << 4) |
                (decode(b64.charAt(i + 2)) >> 2);
              push((tmp >> 8) & 255);
              push(tmp & 255);
            }
            return arr;
          }
          function uint8ToBase64(uint8) {
            var i,
              extraBytes = uint8.length % 3,
              output = "",
              temp,
              length;
            function encode(num) {
              return lookup.charAt(num);
            }
            function tripletToBase64(num) {
              return (
                encode((num >> 18) & 63) +
                encode((num >> 12) & 63) +
                encode((num >> 6) & 63) +
                encode(num & 63)
              );
            }
            for (
              i = 0, length = uint8.length - extraBytes;
              i < length;
              i += 3
            ) {
              temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
              output += tripletToBase64(temp);
            }
            switch (extraBytes) {
              case 1:
                temp = uint8[uint8.length - 1];
                output += encode(temp >> 2);
                output += encode((temp << 4) & 63);
                output += "==";
                break;
              case 2:
                temp = (uint8[uint8.length - 2] << 8) + uint8[uint8.length - 1];
                output += encode(temp >> 10);
                output += encode((temp >> 4) & 63);
                output += encode((temp << 2) & 63);
                output += "=";
                break;
            }
            return output;
          }
          exports.toByteArray = b64ToByteArray;
          exports.fromByteArray = uint8ToBase64;
        })(typeof exports === "undefined" ? (this.base64js = {}) : exports);
      },
      {},
    ],
    3: [
      function (require, module, exports) {
        exports.read = function (buffer, offset, isLE, mLen, nBytes) {
          var e,
            m,
            eLen = nBytes * 8 - mLen - 1,
            eMax = (1 << eLen) - 1,
            eBias = eMax >> 1,
            nBits = -7,
            i = isLE ? nBytes - 1 : 0,
            d = isLE ? -1 : 1,
            s = buffer[offset + i];
          i += d;
          e = s & ((1 << -nBits) - 1);
          s >>= -nBits;
          nBits += eLen;
          for (
            ;
            nBits > 0;
            e = e * 256 + buffer[offset + i], i += d, nBits -= 8
          );
          m = e & ((1 << -nBits) - 1);
          e >>= -nBits;
          nBits += mLen;
          for (
            ;
            nBits > 0;
            m = m * 256 + buffer[offset + i], i += d, nBits -= 8
          );
          if (e === 0) {
            e = 1 - eBias;
          } else if (e === eMax) {
            return m ? NaN : (s ? -1 : 1) * Infinity;
          } else {
            m = m + Math.pow(2, mLen);
            e = e - eBias;
          }
          return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
        };
        exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
          var e,
            m,
            c,
            eLen = nBytes * 8 - mLen - 1,
            eMax = (1 << eLen) - 1,
            eBias = eMax >> 1,
            rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
            i = isLE ? 0 : nBytes - 1,
            d = isLE ? 1 : -1,
            s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;
          value = Math.abs(value);
          if (isNaN(value) || value === Infinity) {
            m = isNaN(value) ? 1 : 0;
            e = eMax;
          } else {
            e = Math.floor(Math.log(value) / Math.LN2);
            if (value * (c = Math.pow(2, -e)) < 1) {
              e--;
              c *= 2;
            }
            if (e + eBias >= 1) {
              value += rt / c;
            } else {
              value += rt * Math.pow(2, 1 - eBias);
            }
            if (value * c >= 2) {
              e++;
              c /= 2;
            }
            if (e + eBias >= eMax) {
              m = 0;
              e = eMax;
            } else if (e + eBias >= 1) {
              m = (value * c - 1) * Math.pow(2, mLen);
              e = e + eBias;
            } else {
              m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
              e = 0;
            }
          }
          for (
            ;
            mLen >= 8;
            buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8
          );
          e = (e << mLen) | m;
          eLen += mLen;
          for (
            ;
            eLen > 0;
            buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8
          );
          buffer[offset + i - d] |= s * 128;
        };
      },
      {},
    ],
    4: [
      function (require, module, exports) {
        var isArray = Array.isArray;
        var str = Object.prototype.toString;
        module.exports =
          isArray ||
          function (val) {
            return !!val && "[object Array]" == str.call(val);
          };
      },
      {},
    ],
    5: [
      function (require, module, exports) {
        (function (Buffer) {
          var iota = require("iota-array");
          var hasTypedArrays = typeof Float64Array !== "undefined";
          var hasBuffer = typeof Buffer !== "undefined";
          function compare1st(a, b) {
            return a[0] - b[0];
          }
          function order() {
            var stride = this.stride;
            var terms = new Array(stride.length);
            var i;
            for (i = 0; i < terms.length; ++i) {
              terms[i] = [Math.abs(stride[i]), i];
            }
            terms.sort(compare1st);
            var result = new Array(terms.length);
            for (i = 0; i < result.length; ++i) {
              result[i] = terms[i][1];
            }
            return result;
          }
          function compileConstructor(dtype, dimension) {
            var className = ["View", dimension, "d", dtype].join("");
            if (dimension < 0) {
              className = "View_Nil" + dtype;
            }
            var useGetters = dtype === "generic";
            if (dimension === -1) {
              var code =
                "function " +
                className +
                "(a){this.data=a;};var proto=" +
                className +
                ".prototype;proto.dtype='" +
                dtype +
                "';proto.index=function(){return -1};proto.size=0;proto.dimension=-1;proto.shape=proto.stride=proto.order=[];proto.lo=proto.hi=proto.transpose=proto.step=function(){return new " +
                className +
                "(this.data);};proto.get=proto.set=function(){};proto.pick=function(){return null};return function construct_" +
                className +
                "(a){return new " +
                className +
                "(a);}";
              var procedure = new Function(code);
              return procedure();
            } else if (dimension === 0) {
              var code =
                "function " +
                className +
                "(a,d) {this.data = a;this.offset = d};var proto=" +
                className +
                ".prototype;proto.dtype='" +
                dtype +
                "';proto.index=function(){return this.offset};proto.dimension=0;proto.size=1;proto.shape=proto.stride=proto.order=[];proto.lo=proto.hi=proto.transpose=proto.step=function " +
                className +
                "_copy() {return new " +
                className +
                "(this.data,this.offset)};proto.pick=function " +
                className +
                "_pick(){return TrivialArray(this.data);};proto.valueOf=proto.get=function " +
                className +
                "_get(){return " +
                (useGetters
                  ? "this.data.get(this.offset)"
                  : "this.data[this.offset]") +
                "};proto.set=function " +
                className +
                "_set(v){return " +
                (useGetters
                  ? "this.data.set(this.offset,v)"
                  : "this.data[this.offset]=v") +
                "};return function construct_" +
                className +
                "(a,b,c,d){return new " +
                className +
                "(a,d)}";
              var procedure = new Function("TrivialArray", code);
              return procedure(CACHED_CONSTRUCTORS[dtype][0]);
            }
            var code = ["'use strict'"];
            var indices = iota(dimension);
            var args = indices.map(function (i) {
              return "i" + i;
            });
            var index_str =
              "this.offset+" +
              indices
                .map(function (i) {
                  return "this.stride[" + i + "]*i" + i;
                })
                .join("+");
            var shapeArg = indices
              .map(function (i) {
                return "b" + i;
              })
              .join(",");
            var strideArg = indices
              .map(function (i) {
                return "c" + i;
              })
              .join(",");
            code.push(
              "function " +
                className +
                "(a," +
                shapeArg +
                "," +
                strideArg +
                ",d){this.data=a",
              "this.shape=[" + shapeArg + "]",
              "this.stride=[" + strideArg + "]",
              "this.offset=d|0}",
              "var proto=" + className + ".prototype",
              "proto.dtype='" + dtype + "'",
              "proto.dimension=" + dimension
            );
            code.push(
              "Object.defineProperty(proto,'size',{get:function " +
                className +
                "_size(){return " +
                indices
                  .map(function (i) {
                    return "this.shape[" + i + "]";
                  })
                  .join("*"),
              "}})"
            );
            if (dimension === 1) {
              code.push("proto.order=[0]");
            } else {
              code.push("Object.defineProperty(proto,'order',{get:");
              if (dimension < 4) {
                code.push("function " + className + "_order(){");
                if (dimension === 2) {
                  code.push(
                    "return (Math.abs(this.stride[0])>Math.abs(this.stride[1]))?[1,0]:[0,1]}})"
                  );
                } else if (dimension === 3) {
                  code.push(
                    "var s0=Math.abs(this.stride[0]),s1=Math.abs(this.stride[1]),s2=Math.abs(this.stride[2]);if(s0>s1){if(s1>s2){return [2,1,0];}else if(s0>s2){return [1,2,0];}else{return [1,0,2];}}else if(s0>s2){return [2,0,1];}else if(s2>s1){return [0,1,2];}else{return [0,2,1];}}})"
                  );
                }
              } else {
                code.push("ORDER})");
              }
            }
            code.push(
              "proto.set=function " +
                className +
                "_set(" +
                args.join(",") +
                ",v){"
            );
            if (useGetters) {
              code.push("return this.data.set(" + index_str + ",v)}");
            } else {
              code.push("return this.data[" + index_str + "]=v}");
            }
            code.push(
              "proto.get=function " +
                className +
                "_get(" +
                args.join(",") +
                "){"
            );
            if (useGetters) {
              code.push("return this.data.get(" + index_str + ")}");
            } else {
              code.push("return this.data[" + index_str + "]}");
            }
            code.push(
              "proto.index=function " + className + "_index(",
              args.join(),
              "){return " + index_str + "}"
            );
            code.push(
              "proto.hi=function " +
                className +
                "_hi(" +
                args.join(",") +
                "){return new " +
                className +
                "(this.data," +
                indices
                  .map(function (i) {
                    return [
                      "(typeof i",
                      i,
                      "!=='number'||i",
                      i,
                      "<0)?this.shape[",
                      i,
                      "]:i",
                      i,
                      "|0",
                    ].join("");
                  })
                  .join(",") +
                "," +
                indices
                  .map(function (i) {
                    return "this.stride[" + i + "]";
                  })
                  .join(",") +
                ",this.offset)}"
            );
            var a_vars = indices.map(function (i) {
              return "a" + i + "=this.shape[" + i + "]";
            });
            var c_vars = indices.map(function (i) {
              return "c" + i + "=this.stride[" + i + "]";
            });
            code.push(
              "proto.lo=function " +
                className +
                "_lo(" +
                args.join(",") +
                "){var b=this.offset,d=0," +
                a_vars.join(",") +
                "," +
                c_vars.join(",")
            );
            for (var i = 0; i < dimension; ++i) {
              code.push(
                "if(typeof i" +
                  i +
                  "==='number'&&i" +
                  i +
                  ">=0){d=i" +
                  i +
                  "|0;b+=c" +
                  i +
                  "*d;a" +
                  i +
                  "-=d}"
              );
            }
            code.push(
              "return new " +
                className +
                "(this.data," +
                indices
                  .map(function (i) {
                    return "a" + i;
                  })
                  .join(",") +
                "," +
                indices
                  .map(function (i) {
                    return "c" + i;
                  })
                  .join(",") +
                ",b)}"
            );
            code.push(
              "proto.step=function " +
                className +
                "_step(" +
                args.join(",") +
                "){var " +
                indices
                  .map(function (i) {
                    return "a" + i + "=this.shape[" + i + "]";
                  })
                  .join(",") +
                "," +
                indices
                  .map(function (i) {
                    return "b" + i + "=this.stride[" + i + "]";
                  })
                  .join(",") +
                ",c=this.offset,d=0,ceil=Math.ceil"
            );
            for (var i = 0; i < dimension; ++i) {
              code.push(
                "if(typeof i" +
                  i +
                  "==='number'){d=i" +
                  i +
                  "|0;if(d<0){c+=b" +
                  i +
                  "*(a" +
                  i +
                  "-1);a" +
                  i +
                  "=ceil(-a" +
                  i +
                  "/d)}else{a" +
                  i +
                  "=ceil(a" +
                  i +
                  "/d)}b" +
                  i +
                  "*=d}"
              );
            }
            code.push(
              "return new " +
                className +
                "(this.data," +
                indices
                  .map(function (i) {
                    return "a" + i;
                  })
                  .join(",") +
                "," +
                indices
                  .map(function (i) {
                    return "b" + i;
                  })
                  .join(",") +
                ",c)}"
            );
            var tShape = new Array(dimension);
            var tStride = new Array(dimension);
            for (var i = 0; i < dimension; ++i) {
              tShape[i] = "a[i" + i + "]";
              tStride[i] = "b[i" + i + "]";
            }
            code.push(
              "proto.transpose=function " +
                className +
                "_transpose(" +
                args +
                "){" +
                args
                  .map(function (n, idx) {
                    return (
                      n + "=(" + n + "===undefined?" + idx + ":" + n + "|0)"
                    );
                  })
                  .join(";"),
              "var a=this.shape,b=this.stride;return new " +
                className +
                "(this.data," +
                tShape.join(",") +
                "," +
                tStride.join(",") +
                ",this.offset)}"
            );
            code.push(
              "proto.pick=function " +
                className +
                "_pick(" +
                args +
                "){var a=[],b=[],c=this.offset"
            );
            for (var i = 0; i < dimension; ++i) {
              code.push(
                "if(typeof i" +
                  i +
                  "==='number'&&i" +
                  i +
                  ">=0){c=(c+this.stride[" +
                  i +
                  "]*i" +
                  i +
                  ")|0}else{a.push(this.shape[" +
                  i +
                  "]);b.push(this.stride[" +
                  i +
                  "])}"
              );
            }
            code.push(
              "var ctor=CTOR_LIST[a.length+1];return ctor(this.data,a,b,c)}"
            );
            code.push(
              "return function construct_" +
                className +
                "(data,shape,stride,offset){return new " +
                className +
                "(data," +
                indices
                  .map(function (i) {
                    return "shape[" + i + "]";
                  })
                  .join(",") +
                "," +
                indices
                  .map(function (i) {
                    return "stride[" + i + "]";
                  })
                  .join(",") +
                ",offset)}"
            );
            var procedure = new Function("CTOR_LIST", "ORDER", code.join("\n"));
            return procedure(CACHED_CONSTRUCTORS[dtype], order);
          }
          function arrayDType(data) {
            if (hasBuffer) {
              if (Buffer.isBuffer(data)) {
                return "buffer";
              }
            }
            if (hasTypedArrays) {
              switch (Object.prototype.toString.call(data)) {
                case "[object Float64Array]":
                  return "float64";
                case "[object Float32Array]":
                  return "float32";
                case "[object Int8Array]":
                  return "int8";
                case "[object Int16Array]":
                  return "int16";
                case "[object Int32Array]":
                  return "int32";
                case "[object Uint8Array]":
                  return "uint8";
                case "[object Uint16Array]":
                  return "uint16";
                case "[object Uint32Array]":
                  return "uint32";
                case "[object Uint8ClampedArray]":
                  return "uint8_clamped";
              }
            }
            if (Array.isArray(data)) {
              return "array";
            }
            return "generic";
          }
          var CACHED_CONSTRUCTORS = {
            float32: [],
            float64: [],
            int8: [],
            int16: [],
            int32: [],
            uint8: [],
            uint16: [],
            uint32: [],
            array: [],
            uint8_clamped: [],
            buffer: [],
            generic: [],
          };
          (function () {
            for (var id in CACHED_CONSTRUCTORS) {
              CACHED_CONSTRUCTORS[id].push(compileConstructor(id, -1));
            }
          });
          function wrappedNDArrayCtor(data, shape, stride, offset) {
            if (data === undefined) {
              var ctor = CACHED_CONSTRUCTORS.array[0];
              return ctor([]);
            } else if (typeof data === "number") {
              data = [data];
            }
            if (shape === undefined) {
              shape = [data.length];
            }
            var d = shape.length;
            if (stride === undefined) {
              stride = new Array(d);
              for (var i = d - 1, sz = 1; i >= 0; --i) {
                stride[i] = sz;
                sz *= shape[i];
              }
            }
            if (offset === undefined) {
              offset = 0;
              for (var i = 0; i < d; ++i) {
                if (stride[i] < 0) {
                  offset -= (shape[i] - 1) * stride[i];
                }
              }
            }
            var dtype = arrayDType(data);
            var ctor_list = CACHED_CONSTRUCTORS[dtype];
            while (ctor_list.length <= d + 1) {
              ctor_list.push(compileConstructor(dtype, ctor_list.length - 1));
            }
            var ctor = ctor_list[d + 1];
            return ctor(data, shape, stride, offset);
          }
          module.exports = wrappedNDArrayCtor;
        }.call(this, require("buffer").Buffer));
      },
      { buffer: 1, "iota-array": 6 },
    ],
    6: [
      function (require, module, exports) {
        "use strict";
        function iota(n) {
          var result = new Array(n);
          for (var i = 0; i < n; ++i) {
            result[i] = i;
          }
          return result;
        }
        module.exports = iota;
      },
      {},
    ],
    7: [
      function (require, module, exports) {
        (function (Buffer) {
          "use strict";
          module.exports = parseData;
          var pako = require("pako"),
            HEADER = new Buffer("89504e470d0a1a0a", "hex");
          function ImageData(width, height, channels, data, trailer) {
            this.width = width;
            this.height = height;
            this.channels = channels;
            this.data = data;
            this.trailer = trailer;
          }
          function paeth(a, b, c) {
            var p = a + b - c,
              pa = Math.abs(p - a),
              pb = Math.abs(p - b),
              pc = Math.abs(p - c);
            if (pa <= pb && pa <= pc) return a;
            if (pb <= pc) return b;
            return c;
          }
          function parseData(dataBuffer) {
            var state = 0,
              off = 0,
              buf = new Buffer(13),
              b = -1,
              p = 0,
              pngPaletteEntries = 0,
              pngAlphaEntries = 0,
              chunkLength,
              pngWidth,
              pngHeight,
              pngBitDepth,
              pngDepthMult,
              pngColorType,
              pngPixels,
              pngSamplesPerPixel,
              pngBytesPerPixel,
              pngBytesPerScanline,
              pngSamples,
              currentScanline,
              priorScanline,
              scanlineFilter,
              pngTrailer,
              pngPalette,
              pngAlpha,
              idChannels;
            var inflateQueue = [];
            function inputData(data) {
              var len = data.length,
                i = 0,
                tmp,
                j;
              while (i !== len)
                switch (state) {
                  case 0:
                    if (data.readUInt8(i++) !== HEADER[off++]) return false;
                    if (off === HEADER.length) {
                      state = 1;
                      off = 0;
                    }
                    break;
                  case 1:
                    if (len - i < 8 - off) {
                      data.copy(buf, off, i);
                      off += len - i;
                      i = len;
                    } else {
                      data.copy(buf, off, i, i + 8 - off);
                      i += 8 - off;
                      off = 0;
                      chunkLength = buf.readUInt32BE(0);
                      switch (buf.toString("ascii", 4, 8)) {
                        case "IHDR":
                          state = 2;
                          break;
                        case "PLTE":
                          if (pngColorType !== 3) state = 7;
                          else {
                            if (chunkLength % 3 !== 0) return false;
                            pngPaletteEntries = chunkLength / 3;
                            pngPalette = new Buffer(chunkLength);
                            state = 3;
                          }
                          break;
                        case "tRNS":
                          if (pngColorType !== 3) return false;
                          idChannels++;
                          pngAlphaEntries = chunkLength;
                          pngAlpha = new Buffer(chunkLength);
                          state = 4;
                          break;
                        case "IDAT":
                          if (!pngPixels)
                            pngPixels = new Uint8Array(
                              pngWidth * pngHeight * idChannels
                            );
                          state = 5;
                          break;
                        case "IEND":
                          state = 6;
                          break;
                        default:
                          state = 7;
                          break;
                      }
                    }
                    break;
                  case 2:
                    if (chunkLength !== 13) return false;
                    else if (len - i < chunkLength - off) {
                      data.copy(buf, off, i);
                      off += len - i;
                      i = len;
                    } else {
                      data.copy(buf, off, i, i + chunkLength - off);
                      if (buf.readUInt8(10) !== 0) return false;
                      if (buf.readUInt8(11) !== 0) return false;
                      if (buf.readUInt8(12) !== 0) return false;
                      i += chunkLength - off;
                      state = 8;
                      off = 0;
                      pngWidth = buf.readUInt32BE(0);
                      pngHeight = buf.readUInt32BE(4);
                      pngBitDepth = buf.readUInt8(8);
                      pngDepthMult = 255 / ((1 << pngBitDepth) - 1);
                      pngColorType = buf.readUInt8(9);
                      switch (pngColorType) {
                        case 0:
                          pngSamplesPerPixel = 1;
                          pngBytesPerPixel = Math.ceil(pngBitDepth * 0.125);
                          idChannels = 1;
                          break;
                        case 2:
                          pngSamplesPerPixel = 3;
                          pngBytesPerPixel = Math.ceil(pngBitDepth * 0.375);
                          idChannels = 3;
                          break;
                        case 3:
                          pngSamplesPerPixel = 1;
                          pngBytesPerPixel = 1;
                          idChannels = 3;
                          break;
                        case 4:
                          pngSamplesPerPixel = 2;
                          pngBytesPerPixel = Math.ceil(pngBitDepth * 0.25);
                          idChannels = 2;
                          break;
                        case 6:
                          pngSamplesPerPixel = 4;
                          pngBytesPerPixel = Math.ceil(pngBitDepth * 0.5);
                          idChannels = 4;
                          break;
                        default:
                          return false;
                      }
                      pngBytesPerScanline = Math.ceil(
                        (pngWidth * pngBitDepth * pngSamplesPerPixel) / 8
                      );
                      pngSamples = new Buffer(pngSamplesPerPixel);
                      currentScanline = new Buffer(pngBytesPerScanline);
                      priorScanline = new Buffer(pngBytesPerScanline);
                      currentScanline.fill(0);
                    }
                    break;
                  case 3:
                    if (len - i < chunkLength - off) {
                      data.copy(pngPalette, off, i);
                      off += len - i;
                      i = len;
                    } else {
                      data.copy(pngPalette, off, i, i + chunkLength - off);
                      i += chunkLength - off;
                      state = 8;
                      off = 0;
                      idChannels = 1;
                      for (j = pngPaletteEntries; j--; )
                        if (
                          pngPalette[j * 3 + 0] !== pngPalette[j * 3 + 1] ||
                          pngPalette[j * 3 + 0] !== pngPalette[j * 3 + 2]
                        ) {
                          idChannels = 3;
                          break;
                        }
                    }
                    break;
                  case 4:
                    if (len - i < chunkLength - off) {
                      data.copy(pngAlpha, off, i);
                      off += len - i;
                      i = len;
                    } else {
                      data.copy(pngAlpha, off, i, i + chunkLength - off);
                      i += chunkLength - off;
                      state = 8;
                      off = 0;
                    }
                    break;
                  case 5:
                    if (len - i < chunkLength - off) {
                      inflateQueue.push(data.slice(i));
                      off += len - i;
                      i = len;
                    } else {
                      inflateQueue.push(data.slice(i, i + chunkLength - off));
                      i += chunkLength - off;
                      state = 8;
                      off = 0;
                    }
                    break;
                  case 6:
                    if (chunkLength !== 0) return false;
                    else if (len - i < 4 - off) {
                      off += len - i;
                      i = len;
                    } else {
                      pngTrailer = new Buffer(0);
                      i += 4 - off;
                      state = 9;
                      off = 0;
                    }
                    break;
                  case 7:
                    if (len - i < chunkLength - off) {
                      off += len - i;
                      i = len;
                    } else {
                      i += chunkLength - off;
                      state = 8;
                      off = 0;
                    }
                    break;
                  case 8:
                    if (len - i < 4 - off) {
                      off += len - i;
                      i = len;
                    } else {
                      i += 4 - off;
                      state = 1;
                      off = 0;
                    }
                    break;
                  case 9:
                    tmp = new Buffer(off + len - i);
                    pngTrailer.copy(tmp);
                    data.copy(tmp, off, i, len);
                    pngTrailer = tmp;
                    off += len - i;
                    i = len;
                    break;
                }
              return true;
            }
            if (!inputData(dataBuffer)) {
              return null;
            }
            if (state !== 9) {
              return null;
            }
            var inflateBuffer = Buffer.concat(inflateQueue);
            var inflateData = pako.inflate(new Uint8Array(inflateBuffer));
            function unpackPixels(data) {
              var len = data.length,
                i,
                tmp,
                x,
                j,
                k;
              for (i = 0; i !== len; ++i) {
                if (b === -1) {
                  scanlineFilter = data[i];
                  tmp = currentScanline;
                  currentScanline = priorScanline;
                  priorScanline = tmp;
                } else
                  switch (scanlineFilter) {
                    case 0:
                      currentScanline[b] = data[i];
                      break;
                    case 1:
                      currentScanline[b] =
                        b < pngBytesPerPixel
                          ? data[i]
                          : (data[i] + currentScanline[b - pngBytesPerPixel]) &
                            255;
                      break;
                    case 2:
                      currentScanline[b] = (data[i] + priorScanline[b]) & 255;
                      break;
                    case 3:
                      currentScanline[b] =
                        (data[i] +
                          ((b < pngBytesPerPixel
                            ? priorScanline[b]
                            : currentScanline[b - pngBytesPerPixel] +
                              priorScanline[b]) >>>
                            1)) &
                        255;
                      break;
                    case 4:
                      currentScanline[b] =
                        (data[i] +
                          (b < pngBytesPerPixel
                            ? priorScanline[b]
                            : paeth(
                                currentScanline[b - pngBytesPerPixel],
                                priorScanline[b],
                                priorScanline[b - pngBytesPerPixel]
                              ))) &
                        255;
                      break;
                    default:
                      return null;
                  }
                if (++b === pngBytesPerScanline) {
                  if (p === pngPixels.length) return null;
                  for (j = 0, x = 0; x !== pngWidth; ++x) {
                    for (k = 0; k !== pngSamplesPerPixel; ++j, ++k)
                      switch (pngBitDepth) {
                        case 1:
                          pngSamples[k] =
                            (currentScanline[j >>> 3] >> (7 - (j & 7))) & 1;
                          break;
                        case 2:
                          pngSamples[k] =
                            (currentScanline[j >>> 2] >> ((3 - (j & 3)) << 1)) &
                            3;
                          break;
                        case 4:
                          pngSamples[k] =
                            (currentScanline[j >>> 1] >> ((1 - (j & 1)) << 2)) &
                            15;
                          break;
                        case 8:
                          pngSamples[k] = currentScanline[j];
                          break;
                        default:
                          return null;
                      }
                    switch (pngColorType) {
                      case 0:
                        pngPixels[p++] = pngSamples[0] * pngDepthMult;
                        break;
                      case 2:
                        pngPixels[p++] = pngSamples[0] * pngDepthMult;
                        pngPixels[p++] = pngSamples[1] * pngDepthMult;
                        pngPixels[p++] = pngSamples[2] * pngDepthMult;
                        break;
                      case 3:
                        if (pngSamples[0] >= pngPaletteEntries) return null;
                        switch (idChannels) {
                          case 1:
                            pngPixels[p++] = pngPalette[pngSamples[0] * 3];
                            break;
                          case 2:
                            pngPixels[p++] = pngPalette[pngSamples[0] * 3];
                            pngPixels[p++] =
                              pngSamples[0] < pngAlphaEntries
                                ? pngAlpha[pngSamples[0]]
                                : 255;
                            break;
                          case 3:
                            pngPixels[p++] = pngPalette[pngSamples[0] * 3 + 0];
                            pngPixels[p++] = pngPalette[pngSamples[0] * 3 + 1];
                            pngPixels[p++] = pngPalette[pngSamples[0] * 3 + 2];
                            break;
                          case 4:
                            pngPixels[p++] = pngPalette[pngSamples[0] * 3 + 0];
                            pngPixels[p++] = pngPalette[pngSamples[0] * 3 + 1];
                            pngPixels[p++] = pngPalette[pngSamples[0] * 3 + 2];
                            pngPixels[p++] =
                              pngSamples[0] < pngAlphaEntries
                                ? pngAlpha[pngSamples[0]]
                                : 255;
                            break;
                        }
                        break;
                      case 4:
                        pngPixels[p++] = pngSamples[0] * pngDepthMult;
                        pngPixels[p++] = pngSamples[1] * pngDepthMult;
                        break;
                      case 6:
                        pngPixels[p++] = pngSamples[0] * pngDepthMult;
                        pngPixels[p++] = pngSamples[1] * pngDepthMult;
                        pngPixels[p++] = pngSamples[2] * pngDepthMult;
                        pngPixels[p++] = pngSamples[3] * pngDepthMult;
                        break;
                    }
                  }
                  b = -1;
                }
              }
              return true;
            }
            if (!unpackPixels(inflateData)) {
              return null;
            }
            if (p !== pngPixels.length) {
              return null;
            }
            return new ImageData(
              pngWidth,
              pngHeight,
              idChannels,
              pngPixels,
              pngTrailer
            );
          }
        }.call(this, require("buffer").Buffer));
      },
      { buffer: 1, pako: 8 },
    ],
    8: [
      function (require, module, exports) {
        "use strict";
        var assign = require("./lib/utils/common").assign;
        var deflate = require("./lib/deflate");
        var inflate = require("./lib/inflate");
        var constants = require("./lib/zlib/constants");
        var pako = {};
        assign(pako, deflate, inflate, constants);
        module.exports = pako;
      },
      {
        "./lib/deflate": 9,
        "./lib/inflate": 10,
        "./lib/utils/common": 11,
        "./lib/zlib/constants": 14,
      },
    ],
    9: [
      function (require, module, exports) {
        "use strict";
        var zlib_deflate = require("./zlib/deflate.js");
        var utils = require("./utils/common");
        var strings = require("./utils/strings");
        var msg = require("./zlib/messages");
        var zstream = require("./zlib/zstream");
        var toString = Object.prototype.toString;
        var Z_NO_FLUSH = 0;
        var Z_FINISH = 4;
        var Z_OK = 0;
        var Z_STREAM_END = 1;
        var Z_DEFAULT_COMPRESSION = -1;
        var Z_DEFAULT_STRATEGY = 0;
        var Z_DEFLATED = 8;
        var Deflate = function (options) {
          this.options = utils.assign(
            {
              level: Z_DEFAULT_COMPRESSION,
              method: Z_DEFLATED,
              chunkSize: 16384,
              windowBits: 15,
              memLevel: 8,
              strategy: Z_DEFAULT_STRATEGY,
              to: "",
            },
            options || {}
          );
          var opt = this.options;
          if (opt.raw && opt.windowBits > 0) {
            opt.windowBits = -opt.windowBits;
          } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
            opt.windowBits += 16;
          }
          this.err = 0;
          this.msg = "";
          this.ended = false;
          this.chunks = [];
          this.strm = new zstream();
          this.strm.avail_out = 0;
          var status = zlib_deflate.deflateInit2(
            this.strm,
            opt.level,
            opt.method,
            opt.windowBits,
            opt.memLevel,
            opt.strategy
          );
          if (status !== Z_OK) {
            throw new Error(msg[status]);
          }
          if (opt.header) {
            zlib_deflate.deflateSetHeader(this.strm, opt.header);
          }
        };
        Deflate.prototype.push = function (data, mode) {
          var strm = this.strm;
          var chunkSize = this.options.chunkSize;
          var status, _mode;
          if (this.ended) {
            return false;
          }
          _mode =
            mode === ~~mode ? mode : mode === true ? Z_FINISH : Z_NO_FLUSH;
          if (typeof data === "string") {
            strm.input = strings.string2buf(data);
          } else if (toString.call(data) === "[object ArrayBuffer]") {
            strm.input = new Uint8Array(data);
          } else {
            strm.input = data;
          }
          strm.next_in = 0;
          strm.avail_in = strm.input.length;
          do {
            if (strm.avail_out === 0) {
              strm.output = new utils.Buf8(chunkSize);
              strm.next_out = 0;
              strm.avail_out = chunkSize;
            }
            status = zlib_deflate.deflate(strm, _mode);
            if (status !== Z_STREAM_END && status !== Z_OK) {
              this.onEnd(status);
              this.ended = true;
              return false;
            }
            if (
              strm.avail_out === 0 ||
              (strm.avail_in === 0 && _mode === Z_FINISH)
            ) {
              if (this.options.to === "string") {
                this.onData(
                  strings.buf2binstring(
                    utils.shrinkBuf(strm.output, strm.next_out)
                  )
                );
              } else {
                this.onData(utils.shrinkBuf(strm.output, strm.next_out));
              }
            }
          } while (
            (strm.avail_in > 0 || strm.avail_out === 0) &&
            status !== Z_STREAM_END
          );
          if (_mode === Z_FINISH) {
            status = zlib_deflate.deflateEnd(this.strm);
            this.onEnd(status);
            this.ended = true;
            return status === Z_OK;
          }
          return true;
        };
        Deflate.prototype.onData = function (chunk) {
          this.chunks.push(chunk);
        };
        Deflate.prototype.onEnd = function (status) {
          if (status === Z_OK) {
            if (this.options.to === "string") {
              this.result = this.chunks.join("");
            } else {
              this.result = utils.flattenChunks(this.chunks);
            }
          }
          this.chunks = [];
          this.err = status;
          this.msg = this.strm.msg;
        };
        function deflate(input, options) {
          var deflator = new Deflate(options);
          deflator.push(input, true);
          if (deflator.err) {
            throw deflator.msg;
          }
          return deflator.result;
        }
        function deflateRaw(input, options) {
          options = options || {};
          options.raw = true;
          return deflate(input, options);
        }
        function gzip(input, options) {
          options = options || {};
          options.gzip = true;
          return deflate(input, options);
        }
        exports.Deflate = Deflate;
        exports.deflate = deflate;
        exports.deflateRaw = deflateRaw;
        exports.gzip = gzip;
      },
      {
        "./utils/common": 11,
        "./utils/strings": 12,
        "./zlib/deflate.js": 16,
        "./zlib/messages": 21,
        "./zlib/zstream": 23,
      },
    ],
    10: [
      function (require, module, exports) {
        "use strict";
        var zlib_inflate = require("./zlib/inflate.js");
        var utils = require("./utils/common");
        var strings = require("./utils/strings");
        var c = require("./zlib/constants");
        var msg = require("./zlib/messages");
        var zstream = require("./zlib/zstream");
        var gzheader = require("./zlib/gzheader");
        var toString = Object.prototype.toString;
        var Inflate = function (options) {
          this.options = utils.assign(
            { chunkSize: 16384, windowBits: 0, to: "" },
            options || {}
          );
          var opt = this.options;
          if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
            opt.windowBits = -opt.windowBits;
            if (opt.windowBits === 0) {
              opt.windowBits = -15;
            }
          }
          if (
            opt.windowBits >= 0 &&
            opt.windowBits < 16 &&
            !(options && options.windowBits)
          ) {
            opt.windowBits += 32;
          }
          if (opt.windowBits > 15 && opt.windowBits < 48) {
            if ((opt.windowBits & 15) === 0) {
              opt.windowBits |= 15;
            }
          }
          this.err = 0;
          this.msg = "";
          this.ended = false;
          this.chunks = [];
          this.strm = new zstream();
          this.strm.avail_out = 0;
          var status = zlib_inflate.inflateInit2(this.strm, opt.windowBits);
          if (status !== c.Z_OK) {
            throw new Error(msg[status]);
          }
          this.header = new gzheader();
          zlib_inflate.inflateGetHeader(this.strm, this.header);
        };
        Inflate.prototype.push = function (data, mode) {
          var strm = this.strm;
          var chunkSize = this.options.chunkSize;
          var status, _mode;
          var next_out_utf8, tail, utf8str;
          if (this.ended) {
            return false;
          }
          _mode =
            mode === ~~mode ? mode : mode === true ? c.Z_FINISH : c.Z_NO_FLUSH;
          if (typeof data === "string") {
            strm.input = strings.binstring2buf(data);
          } else if (toString.call(data) === "[object ArrayBuffer]") {
            strm.input = new Uint8Array(data);
          } else {
            strm.input = data;
          }
          strm.next_in = 0;
          strm.avail_in = strm.input.length;
          do {
            if (strm.avail_out === 0) {
              strm.output = new utils.Buf8(chunkSize);
              strm.next_out = 0;
              strm.avail_out = chunkSize;
            }
            status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);
            if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
              this.onEnd(status);
              this.ended = true;
              return false;
            }
            if (strm.next_out) {
              if (
                strm.avail_out === 0 ||
                status === c.Z_STREAM_END ||
                (strm.avail_in === 0 && _mode === c.Z_FINISH)
              ) {
                if (this.options.to === "string") {
                  next_out_utf8 = strings.utf8border(
                    strm.output,
                    strm.next_out
                  );
                  tail = strm.next_out - next_out_utf8;
                  utf8str = strings.buf2string(strm.output, next_out_utf8);
                  strm.next_out = tail;
                  strm.avail_out = chunkSize - tail;
                  if (tail) {
                    utils.arraySet(
                      strm.output,
                      strm.output,
                      next_out_utf8,
                      tail,
                      0
                    );
                  }
                  this.onData(utf8str);
                } else {
                  this.onData(utils.shrinkBuf(strm.output, strm.next_out));
                }
              }
            }
          } while (strm.avail_in > 0 && status !== c.Z_STREAM_END);
          if (status === c.Z_STREAM_END) {
            _mode = c.Z_FINISH;
          }
          if (_mode === c.Z_FINISH) {
            status = zlib_inflate.inflateEnd(this.strm);
            this.onEnd(status);
            this.ended = true;
            return status === c.Z_OK;
          }
          return true;
        };
        Inflate.prototype.onData = function (chunk) {
          this.chunks.push(chunk);
        };
        Inflate.prototype.onEnd = function (status) {
          if (status === c.Z_OK) {
            if (this.options.to === "string") {
              this.result = this.chunks.join("");
            } else {
              this.result = utils.flattenChunks(this.chunks);
            }
          }
          this.chunks = [];
          this.err = status;
          this.msg = this.strm.msg;
        };
        function inflate(input, options) {
          var inflator = new Inflate(options);
          inflator.push(input, true);
          if (inflator.err) {
            throw inflator.msg;
          }
          return inflator.result;
        }
        function inflateRaw(input, options) {
          options = options || {};
          options.raw = true;
          return inflate(input, options);
        }
        exports.Inflate = Inflate;
        exports.inflate = inflate;
        exports.inflateRaw = inflateRaw;
        exports.ungzip = inflate;
      },
      {
        "./utils/common": 11,
        "./utils/strings": 12,
        "./zlib/constants": 14,
        "./zlib/gzheader": 17,
        "./zlib/inflate.js": 19,
        "./zlib/messages": 21,
        "./zlib/zstream": 23,
      },
    ],
    11: [
      function (require, module, exports) {
        "use strict";
        var TYPED_OK =
          typeof Uint8Array !== "undefined" &&
          typeof Uint16Array !== "undefined" &&
          typeof Int32Array !== "undefined";
        exports.assign = function (obj) {
          var sources = Array.prototype.slice.call(arguments, 1);
          while (sources.length) {
            var source = sources.shift();
            if (!source) {
              continue;
            }
            if (typeof source !== "object") {
              throw new TypeError(source + "must be non-object");
            }
            for (var p in source) {
              if (source.hasOwnProperty(p)) {
                obj[p] = source[p];
              }
            }
          }
          return obj;
        };
        exports.shrinkBuf = function (buf, size) {
          if (buf.length === size) {
            return buf;
          }
          if (buf.subarray) {
            return buf.subarray(0, size);
          }
          buf.length = size;
          return buf;
        };
        var fnTyped = {
          arraySet: function (dest, src, src_offs, len, dest_offs) {
            if (src.subarray && dest.subarray) {
              dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
              return;
            }
            for (var i = 0; i < len; i++) {
              dest[dest_offs + i] = src[src_offs + i];
            }
          },
          flattenChunks: function (chunks) {
            var i, l, len, pos, chunk, result;
            len = 0;
            for (i = 0, l = chunks.length; i < l; i++) {
              len += chunks[i].length;
            }
            result = new Uint8Array(len);
            pos = 0;
            for (i = 0, l = chunks.length; i < l; i++) {
              chunk = chunks[i];
              result.set(chunk, pos);
              pos += chunk.length;
            }
            return result;
          },
        };
        var fnUntyped = {
          arraySet: function (dest, src, src_offs, len, dest_offs) {
            for (var i = 0; i < len; i++) {
              dest[dest_offs + i] = src[src_offs + i];
            }
          },
          flattenChunks: function (chunks) {
            return [].concat.apply([], chunks);
          },
        };
        exports.setTyped = function (on) {
          if (on) {
            exports.Buf8 = Uint8Array;
            exports.Buf16 = Uint16Array;
            exports.Buf32 = Int32Array;
            exports.assign(exports, fnTyped);
          } else {
            exports.Buf8 = Array;
            exports.Buf16 = Array;
            exports.Buf32 = Array;
            exports.assign(exports, fnUntyped);
          }
        };
        exports.setTyped(TYPED_OK);
      },
      {},
    ],
    12: [
      function (require, module, exports) {
        "use strict";
        var utils = require("./common");
        var STR_APPLY_OK = true;
        var STR_APPLY_UIA_OK = true;
        try {
          String.fromCharCode.apply(null, [0]);
        } catch (__) {
          STR_APPLY_OK = false;
        }
        try {
          String.fromCharCode.apply(null, new Uint8Array(1));
        } catch (__) {
          STR_APPLY_UIA_OK = false;
        }
        var _utf8len = new utils.Buf8(256);
        for (var i = 0; i < 256; i++) {
          _utf8len[i] =
            i >= 252
              ? 6
              : i >= 248
              ? 5
              : i >= 240
              ? 4
              : i >= 224
              ? 3
              : i >= 192
              ? 2
              : 1;
        }
        _utf8len[254] = _utf8len[254] = 1;
        exports.string2buf = function (str) {
          var buf,
            c,
            c2,
            m_pos,
            i,
            str_len = str.length,
            buf_len = 0;
          for (m_pos = 0; m_pos < str_len; m_pos++) {
            c = str.charCodeAt(m_pos);
            if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
              c2 = str.charCodeAt(m_pos + 1);
              if ((c2 & 64512) === 56320) {
                c = 65536 + ((c - 55296) << 10) + (c2 - 56320);
                m_pos++;
              }
            }
            buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
          }
          buf = new utils.Buf8(buf_len);
          for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
            c = str.charCodeAt(m_pos);
            if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
              c2 = str.charCodeAt(m_pos + 1);
              if ((c2 & 64512) === 56320) {
                c = 65536 + ((c - 55296) << 10) + (c2 - 56320);
                m_pos++;
              }
            }
            if (c < 128) {
              buf[i++] = c;
            } else if (c < 2048) {
              buf[i++] = 192 | (c >>> 6);
              buf[i++] = 128 | (c & 63);
            } else if (c < 65536) {
              buf[i++] = 224 | (c >>> 12);
              buf[i++] = 128 | ((c >>> 6) & 63);
              buf[i++] = 128 | (c & 63);
            } else {
              buf[i++] = 240 | (c >>> 18);
              buf[i++] = 128 | ((c >>> 12) & 63);
              buf[i++] = 128 | ((c >>> 6) & 63);
              buf[i++] = 128 | (c & 63);
            }
          }
          return buf;
        };
        function buf2binstring(buf, len) {
          if (len < 65537) {
            if (
              (buf.subarray && STR_APPLY_UIA_OK) ||
              (!buf.subarray && STR_APPLY_OK)
            ) {
              return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
            }
          }
          var result = "";
          for (var i = 0; i < len; i++) {
            result += String.fromCharCode(buf[i]);
          }
          return result;
        }
        exports.buf2binstring = function (buf) {
          return buf2binstring(buf, buf.length);
        };
        exports.binstring2buf = function (str) {
          var buf = new utils.Buf8(str.length);
          for (var i = 0, len = buf.length; i < len; i++) {
            buf[i] = str.charCodeAt(i);
          }
          return buf;
        };
        exports.buf2string = function (buf, max) {
          var i, out, c, c_len;
          var len = max || buf.length;
          var utf16buf = new Array(len * 2);
          for (out = 0, i = 0; i < len; ) {
            c = buf[i++];
            if (c < 128) {
              utf16buf[out++] = c;
              continue;
            }
            c_len = _utf8len[c];
            if (c_len > 4) {
              utf16buf[out++] = 65533;
              i += c_len - 1;
              continue;
            }
            c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
            while (c_len > 1 && i < len) {
              c = (c << 6) | (buf[i++] & 63);
              c_len--;
            }
            if (c_len > 1) {
              utf16buf[out++] = 65533;
              continue;
            }
            if (c < 65536) {
              utf16buf[out++] = c;
            } else {
              c -= 65536;
              utf16buf[out++] = 55296 | ((c >> 10) & 1023);
              utf16buf[out++] = 56320 | (c & 1023);
            }
          }
          return buf2binstring(utf16buf, out);
        };
        exports.utf8border = function (buf, max) {
          var pos;
          max = max || buf.length;
          if (max > buf.length) {
            max = buf.length;
          }
          pos = max - 1;
          while (pos >= 0 && (buf[pos] & 192) === 128) {
            pos--;
          }
          if (pos < 0) {
            return max;
          }
          if (pos === 0) {
            return max;
          }
          return pos + _utf8len[buf[pos]] > max ? pos : max;
        };
      },
      { "./common": 11 },
    ],
    13: [
      function (require, module, exports) {
        "use strict";
        function adler32(adler, buf, len, pos) {
          var s1 = (adler & 65535) | 0,
            s2 = ((adler >>> 16) & 65535) | 0,
            n = 0;
          while (len !== 0) {
            n = len > 2e3 ? 2e3 : len;
            len -= n;
            do {
              s1 = (s1 + buf[pos++]) | 0;
              s2 = (s2 + s1) | 0;
            } while (--n);
            s1 %= 65521;
            s2 %= 65521;
          }
          return s1 | (s2 << 16) | 0;
        }
        module.exports = adler32;
      },
      {},
    ],
    14: [
      function (require, module, exports) {
        module.exports = {
          Z_NO_FLUSH: 0,
          Z_PARTIAL_FLUSH: 1,
          Z_SYNC_FLUSH: 2,
          Z_FULL_FLUSH: 3,
          Z_FINISH: 4,
          Z_BLOCK: 5,
          Z_TREES: 6,
          Z_OK: 0,
          Z_STREAM_END: 1,
          Z_NEED_DICT: 2,
          Z_ERRNO: -1,
          Z_STREAM_ERROR: -2,
          Z_DATA_ERROR: -3,
          Z_BUF_ERROR: -5,
          Z_NO_COMPRESSION: 0,
          Z_BEST_SPEED: 1,
          Z_BEST_COMPRESSION: 9,
          Z_DEFAULT_COMPRESSION: -1,
          Z_FILTERED: 1,
          Z_HUFFMAN_ONLY: 2,
          Z_RLE: 3,
          Z_FIXED: 4,
          Z_DEFAULT_STRATEGY: 0,
          Z_BINARY: 0,
          Z_TEXT: 1,
          Z_UNKNOWN: 2,
          Z_DEFLATED: 8,
        };
      },
      {},
    ],
    15: [
      function (require, module, exports) {
        "use strict";
        function makeTable() {
          var c,
            table = [];
          for (var n = 0; n < 256; n++) {
            c = n;
            for (var k = 0; k < 8; k++) {
              c = c & 1 ? 3988292384 ^ (c >>> 1) : c >>> 1;
            }
            table[n] = c;
          }
          return table;
        }
        var crcTable = makeTable();
        function crc32(crc, buf, len, pos) {
          var t = crcTable,
            end = pos + len;
          crc = crc ^ -1;
          for (var i = pos; i < end; i++) {
            crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 255];
          }
          return crc ^ -1;
        }
        module.exports = crc32;
      },
      {},
    ],
    16: [
      function (require, module, exports) {
        "use strict";
        var utils = require("../utils/common");
        var trees = require("./trees");
        var adler32 = require("./adler32");
        var crc32 = require("./crc32");
        var msg = require("./messages");
        var Z_NO_FLUSH = 0;
        var Z_PARTIAL_FLUSH = 1;
        var Z_FULL_FLUSH = 3;
        var Z_FINISH = 4;
        var Z_BLOCK = 5;
        var Z_OK = 0;
        var Z_STREAM_END = 1;
        var Z_STREAM_ERROR = -2;
        var Z_DATA_ERROR = -3;
        var Z_BUF_ERROR = -5;
        var Z_DEFAULT_COMPRESSION = -1;
        var Z_FILTERED = 1;
        var Z_HUFFMAN_ONLY = 2;
        var Z_RLE = 3;
        var Z_FIXED = 4;
        var Z_DEFAULT_STRATEGY = 0;
        var Z_UNKNOWN = 2;
        var Z_DEFLATED = 8;
        var MAX_MEM_LEVEL = 9;
        var MAX_WBITS = 15;
        var DEF_MEM_LEVEL = 8;
        var LENGTH_CODES = 29;
        var LITERALS = 256;
        var L_CODES = LITERALS + 1 + LENGTH_CODES;
        var D_CODES = 30;
        var BL_CODES = 19;
        var HEAP_SIZE = 2 * L_CODES + 1;
        var MAX_BITS = 15;
        var MIN_MATCH = 3;
        var MAX_MATCH = 258;
        var MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;
        var PRESET_DICT = 32;
        var INIT_STATE = 42;
        var EXTRA_STATE = 69;
        var NAME_STATE = 73;
        var COMMENT_STATE = 91;
        var HCRC_STATE = 103;
        var BUSY_STATE = 113;
        var FINISH_STATE = 666;
        var BS_NEED_MORE = 1;
        var BS_BLOCK_DONE = 2;
        var BS_FINISH_STARTED = 3;
        var BS_FINISH_DONE = 4;
        var OS_CODE = 3;
        function err(strm, errorCode) {
          strm.msg = msg[errorCode];
          return errorCode;
        }
        function rank(f) {
          return (f << 1) - (f > 4 ? 9 : 0);
        }
        function zero(buf) {
          var len = buf.length;
          while (--len >= 0) {
            buf[len] = 0;
          }
        }
        function flush_pending(strm) {
          var s = strm.state;
          var len = s.pending;
          if (len > strm.avail_out) {
            len = strm.avail_out;
          }
          if (len === 0) {
            return;
          }
          utils.arraySet(
            strm.output,
            s.pending_buf,
            s.pending_out,
            len,
            strm.next_out
          );
          strm.next_out += len;
          s.pending_out += len;
          strm.total_out += len;
          strm.avail_out -= len;
          s.pending -= len;
          if (s.pending === 0) {
            s.pending_out = 0;
          }
        }
        function flush_block_only(s, last) {
          trees._tr_flush_block(
            s,
            s.block_start >= 0 ? s.block_start : -1,
            s.strstart - s.block_start,
            last
          );
          s.block_start = s.strstart;
          flush_pending(s.strm);
        }
        function put_byte(s, b) {
          s.pending_buf[s.pending++] = b;
        }
        function putShortMSB(s, b) {
          s.pending_buf[s.pending++] = (b >>> 8) & 255;
          s.pending_buf[s.pending++] = b & 255;
        }
        function read_buf(strm, buf, start, size) {
          var len = strm.avail_in;
          if (len > size) {
            len = size;
          }
          if (len === 0) {
            return 0;
          }
          strm.avail_in -= len;
          utils.arraySet(buf, strm.input, strm.next_in, len, start);
          if (strm.state.wrap === 1) {
            strm.adler = adler32(strm.adler, buf, len, start);
          } else if (strm.state.wrap === 2) {
            strm.adler = crc32(strm.adler, buf, len, start);
          }
          strm.next_in += len;
          strm.total_in += len;
          return len;
        }
        function longest_match(s, cur_match) {
          var chain_length = s.max_chain_length;
          var scan = s.strstart;
          var match;
          var len;
          var best_len = s.prev_length;
          var nice_match = s.nice_match;
          var limit =
            s.strstart > s.w_size - MIN_LOOKAHEAD
              ? s.strstart - (s.w_size - MIN_LOOKAHEAD)
              : 0;
          var _win = s.window;
          var wmask = s.w_mask;
          var prev = s.prev;
          var strend = s.strstart + MAX_MATCH;
          var scan_end1 = _win[scan + best_len - 1];
          var scan_end = _win[scan + best_len];
          if (s.prev_length >= s.good_match) {
            chain_length >>= 2;
          }
          if (nice_match > s.lookahead) {
            nice_match = s.lookahead;
          }
          do {
            match = cur_match;
            if (
              _win[match + best_len] !== scan_end ||
              _win[match + best_len - 1] !== scan_end1 ||
              _win[match] !== _win[scan] ||
              _win[++match] !== _win[scan + 1]
            ) {
              continue;
            }
            scan += 2;
            match++;
            do {} while (
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              scan < strend
            );
            len = MAX_MATCH - (strend - scan);
            scan = strend - MAX_MATCH;
            if (len > best_len) {
              s.match_start = cur_match;
              best_len = len;
              if (len >= nice_match) {
                break;
              }
              scan_end1 = _win[scan + best_len - 1];
              scan_end = _win[scan + best_len];
            }
          } while (
            (cur_match = prev[cur_match & wmask]) > limit &&
            --chain_length !== 0
          );
          if (best_len <= s.lookahead) {
            return best_len;
          }
          return s.lookahead;
        }
        function fill_window(s) {
          var _w_size = s.w_size;
          var p, n, m, more, str;
          do {
            more = s.window_size - s.lookahead - s.strstart;
            if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
              utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
              s.match_start -= _w_size;
              s.strstart -= _w_size;
              s.block_start -= _w_size;
              n = s.hash_size;
              p = n;
              do {
                m = s.head[--p];
                s.head[p] = m >= _w_size ? m - _w_size : 0;
              } while (--n);
              n = _w_size;
              p = n;
              do {
                m = s.prev[--p];
                s.prev[p] = m >= _w_size ? m - _w_size : 0;
              } while (--n);
              more += _w_size;
            }
            if (s.strm.avail_in === 0) {
              break;
            }
            n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
            s.lookahead += n;
            if (s.lookahead + s.insert >= MIN_MATCH) {
              str = s.strstart - s.insert;
              s.ins_h = s.window[str];
              s.ins_h =
                ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
              while (s.insert) {
                s.ins_h =
                  ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) &
                  s.hash_mask;
                s.prev[str & s.w_mask] = s.head[s.ins_h];
                s.head[s.ins_h] = str;
                str++;
                s.insert--;
                if (s.lookahead + s.insert < MIN_MATCH) {
                  break;
                }
              }
            }
          } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
        }
        function deflate_stored(s, flush) {
          var max_block_size = 65535;
          if (max_block_size > s.pending_buf_size - 5) {
            max_block_size = s.pending_buf_size - 5;
          }
          for (;;) {
            if (s.lookahead <= 1) {
              fill_window(s);
              if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              if (s.lookahead === 0) {
                break;
              }
            }
            s.strstart += s.lookahead;
            s.lookahead = 0;
            var max_start = s.block_start + max_block_size;
            if (s.strstart === 0 || s.strstart >= max_start) {
              s.lookahead = s.strstart - max_start;
              s.strstart = max_start;
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
            if (s.strstart - s.block_start >= s.w_size - MIN_LOOKAHEAD) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          }
          s.insert = 0;
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.strstart > s.block_start) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_NEED_MORE;
        }
        function deflate_fast(s, flush) {
          var hash_head;
          var bflush;
          for (;;) {
            if (s.lookahead < MIN_LOOKAHEAD) {
              fill_window(s);
              if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              if (s.lookahead === 0) {
                break;
              }
            }
            hash_head = 0;
            if (s.lookahead >= MIN_MATCH) {
              s.ins_h =
                ((s.ins_h << s.hash_shift) ^
                  s.window[s.strstart + MIN_MATCH - 1]) &
                s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            }
            if (
              hash_head !== 0 &&
              s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD
            ) {
              s.match_length = longest_match(s, hash_head);
            }
            if (s.match_length >= MIN_MATCH) {
              bflush = trees._tr_tally(
                s,
                s.strstart - s.match_start,
                s.match_length - MIN_MATCH
              );
              s.lookahead -= s.match_length;
              if (
                s.match_length <= s.max_lazy_match &&
                s.lookahead >= MIN_MATCH
              ) {
                s.match_length--;
                do {
                  s.strstart++;
                  s.ins_h =
                    ((s.ins_h << s.hash_shift) ^
                      s.window[s.strstart + MIN_MATCH - 1]) &
                    s.hash_mask;
                  hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                  s.head[s.ins_h] = s.strstart;
                } while (--s.match_length !== 0);
                s.strstart++;
              } else {
                s.strstart += s.match_length;
                s.match_length = 0;
                s.ins_h = s.window[s.strstart];
                s.ins_h =
                  ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) &
                  s.hash_mask;
              }
            } else {
              bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
              s.lookahead--;
              s.strstart++;
            }
            if (bflush) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          }
          s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_BLOCK_DONE;
        }
        function deflate_slow(s, flush) {
          var hash_head;
          var bflush;
          var max_insert;
          for (;;) {
            if (s.lookahead < MIN_LOOKAHEAD) {
              fill_window(s);
              if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              if (s.lookahead === 0) {
                break;
              }
            }
            hash_head = 0;
            if (s.lookahead >= MIN_MATCH) {
              s.ins_h =
                ((s.ins_h << s.hash_shift) ^
                  s.window[s.strstart + MIN_MATCH - 1]) &
                s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            }
            s.prev_length = s.match_length;
            s.prev_match = s.match_start;
            s.match_length = MIN_MATCH - 1;
            if (
              hash_head !== 0 &&
              s.prev_length < s.max_lazy_match &&
              s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD
            ) {
              s.match_length = longest_match(s, hash_head);
              if (
                s.match_length <= 5 &&
                (s.strategy === Z_FILTERED ||
                  (s.match_length === MIN_MATCH &&
                    s.strstart - s.match_start > 4096))
              ) {
                s.match_length = MIN_MATCH - 1;
              }
            }
            if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
              max_insert = s.strstart + s.lookahead - MIN_MATCH;
              bflush = trees._tr_tally(
                s,
                s.strstart - 1 - s.prev_match,
                s.prev_length - MIN_MATCH
              );
              s.lookahead -= s.prev_length - 1;
              s.prev_length -= 2;
              do {
                if (++s.strstart <= max_insert) {
                  s.ins_h =
                    ((s.ins_h << s.hash_shift) ^
                      s.window[s.strstart + MIN_MATCH - 1]) &
                    s.hash_mask;
                  hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                  s.head[s.ins_h] = s.strstart;
                }
              } while (--s.prev_length !== 0);
              s.match_available = 0;
              s.match_length = MIN_MATCH - 1;
              s.strstart++;
              if (bflush) {
                flush_block_only(s, false);
                if (s.strm.avail_out === 0) {
                  return BS_NEED_MORE;
                }
              }
            } else if (s.match_available) {
              bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
              if (bflush) {
                flush_block_only(s, false);
              }
              s.strstart++;
              s.lookahead--;
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            } else {
              s.match_available = 1;
              s.strstart++;
              s.lookahead--;
            }
          }
          if (s.match_available) {
            bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
            s.match_available = 0;
          }
          s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            flush_block_only(s, false);

            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_BLOCK_DONE;
        }
        function deflate_rle(s, flush) {
          var bflush;
          var prev;
          var scan, strend;
          var _win = s.window;
          for (;;) {
            if (s.lookahead <= MAX_MATCH) {
              fill_window(s);
              if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              if (s.lookahead === 0) {
                break;
              }
            }
            s.match_length = 0;
            if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
              scan = s.strstart - 1;
              prev = _win[scan];
              if (
                prev === _win[++scan] &&
                prev === _win[++scan] &&
                prev === _win[++scan]
              ) {
                strend = s.strstart + MAX_MATCH;
                do {} while (
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  scan < strend
                );
                s.match_length = MAX_MATCH - (strend - scan);
                if (s.match_length > s.lookahead) {
                  s.match_length = s.lookahead;
                }
              }
            }
            if (s.match_length >= MIN_MATCH) {
              bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);
              s.lookahead -= s.match_length;
              s.strstart += s.match_length;
              s.match_length = 0;
            } else {
              bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
              s.lookahead--;
              s.strstart++;
            }
            if (bflush) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          }
          s.insert = 0;
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_BLOCK_DONE;
        }
        function deflate_huff(s, flush) {
          var bflush;
          for (;;) {
            if (s.lookahead === 0) {
              fill_window(s);
              if (s.lookahead === 0) {
                if (flush === Z_NO_FLUSH) {
                  return BS_NEED_MORE;
                }
                break;
              }
            }
            s.match_length = 0;
            bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
            s.lookahead--;
            s.strstart++;
            if (bflush) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          }
          s.insert = 0;
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_BLOCK_DONE;
        }
        var Config = function (
          good_length,
          max_lazy,
          nice_length,
          max_chain,
          func
        ) {
          this.good_length = good_length;
          this.max_lazy = max_lazy;
          this.nice_length = nice_length;
          this.max_chain = max_chain;
          this.func = func;
        };
        var configuration_table;
        configuration_table = [
          new Config(0, 0, 0, 0, deflate_stored),
          new Config(4, 4, 8, 4, deflate_fast),
          new Config(4, 5, 16, 8, deflate_fast),
          new Config(4, 6, 32, 32, deflate_fast),
          new Config(4, 4, 16, 16, deflate_slow),
          new Config(8, 16, 32, 32, deflate_slow),
          new Config(8, 16, 128, 128, deflate_slow),
          new Config(8, 32, 128, 256, deflate_slow),
          new Config(32, 128, 258, 1024, deflate_slow),
          new Config(32, 258, 258, 4096, deflate_slow),
        ];
        function lm_init(s) {
          s.window_size = 2 * s.w_size;
          zero(s.head);
          s.max_lazy_match = configuration_table[s.level].max_lazy;
          s.good_match = configuration_table[s.level].good_length;
          s.nice_match = configuration_table[s.level].nice_length;
          s.max_chain_length = configuration_table[s.level].max_chain;
          s.strstart = 0;
          s.block_start = 0;
          s.lookahead = 0;
          s.insert = 0;
          s.match_length = s.prev_length = MIN_MATCH - 1;
          s.match_available = 0;
          s.ins_h = 0;
        }
        function DeflateState() {
          this.strm = null;
          this.status = 0;
          this.pending_buf = null;
          this.pending_buf_size = 0;
          this.pending_out = 0;
          this.pending = 0;
          this.wrap = 0;
          this.gzhead = null;
          this.gzindex = 0;
          this.method = Z_DEFLATED;
          this.last_flush = -1;
          this.w_size = 0;
          this.w_bits = 0;
          this.w_mask = 0;
          this.window = null;
          this.window_size = 0;
          this.prev = null;
          this.head = null;
          this.ins_h = 0;
          this.hash_size = 0;
          this.hash_bits = 0;
          this.hash_mask = 0;
          this.hash_shift = 0;
          this.block_start = 0;
          this.match_length = 0;
          this.prev_match = 0;
          this.match_available = 0;
          this.strstart = 0;
          this.match_start = 0;
          this.lookahead = 0;
          this.prev_length = 0;
          this.max_chain_length = 0;
          this.max_lazy_match = 0;
          this.level = 0;
          this.strategy = 0;
          this.good_match = 0;
          this.nice_match = 0;
          this.dyn_ltree = new utils.Buf16(HEAP_SIZE * 2);
          this.dyn_dtree = new utils.Buf16((2 * D_CODES + 1) * 2);
          this.bl_tree = new utils.Buf16((2 * BL_CODES + 1) * 2);
          zero(this.dyn_ltree);
          zero(this.dyn_dtree);
          zero(this.bl_tree);
          this.l_desc = null;
          this.d_desc = null;
          this.bl_desc = null;
          this.bl_count = new utils.Buf16(MAX_BITS + 1);
          this.heap = new utils.Buf16(2 * L_CODES + 1);
          zero(this.heap);
          this.heap_len = 0;
          this.heap_max = 0;
          this.depth = new utils.Buf16(2 * L_CODES + 1);
          zero(this.depth);
          this.l_buf = 0;
          this.lit_bufsize = 0;
          this.last_lit = 0;
          this.d_buf = 0;
          this.opt_len = 0;
          this.static_len = 0;
          this.matches = 0;
          this.insert = 0;
          this.bi_buf = 0;
          this.bi_valid = 0;
        }
        function deflateResetKeep(strm) {
          var s;
          if (!strm || !strm.state) {
            return err(strm, Z_STREAM_ERROR);
          }
          strm.total_in = strm.total_out = 0;
          strm.data_type = Z_UNKNOWN;
          s = strm.state;
          s.pending = 0;
          s.pending_out = 0;
          if (s.wrap < 0) {
            s.wrap = -s.wrap;
          }
          s.status = s.wrap ? INIT_STATE : BUSY_STATE;
          strm.adler = s.wrap === 2 ? 0 : 1;
          s.last_flush = Z_NO_FLUSH;
          trees._tr_init(s);
          return Z_OK;
        }
        function deflateReset(strm) {
          var ret = deflateResetKeep(strm);
          if (ret === Z_OK) {
            lm_init(strm.state);
          }
          return ret;
        }
        function deflateSetHeader(strm, head) {
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          if (strm.state.wrap !== 2) {
            return Z_STREAM_ERROR;
          }
          strm.state.gzhead = head;
          return Z_OK;
        }
        function deflateInit2(
          strm,
          level,
          method,
          windowBits,
          memLevel,
          strategy
        ) {
          if (!strm) {
            return Z_STREAM_ERROR;
          }
          var wrap = 1;
          if (level === Z_DEFAULT_COMPRESSION) {
            level = 6;
          }
          if (windowBits < 0) {
            wrap = 0;
            windowBits = -windowBits;
          } else if (windowBits > 15) {
            wrap = 2;
            windowBits -= 16;
          }
          if (
            memLevel < 1 ||
            memLevel > MAX_MEM_LEVEL ||
            method !== Z_DEFLATED ||
            windowBits < 8 ||
            windowBits > 15 ||
            level < 0 ||
            level > 9 ||
            strategy < 0 ||
            strategy > Z_FIXED
          ) {
            return err(strm, Z_STREAM_ERROR);
          }
          if (windowBits === 8) {
            windowBits = 9;
          }
          var s = new DeflateState();
          strm.state = s;
          s.strm = strm;
          s.wrap = wrap;
          s.gzhead = null;
          s.w_bits = windowBits;
          s.w_size = 1 << s.w_bits;
          s.w_mask = s.w_size - 1;
          s.hash_bits = memLevel + 7;
          s.hash_size = 1 << s.hash_bits;
          s.hash_mask = s.hash_size - 1;
          s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
          s.window = new utils.Buf8(s.w_size * 2);
          s.head = new utils.Buf16(s.hash_size);
          s.prev = new utils.Buf16(s.w_size);
          s.lit_bufsize = 1 << (memLevel + 6);
          s.pending_buf_size = s.lit_bufsize * 4;
          s.pending_buf = new utils.Buf8(s.pending_buf_size);
          s.d_buf = s.lit_bufsize >> 1;
          s.l_buf = (1 + 2) * s.lit_bufsize;
          s.level = level;
          s.strategy = strategy;
          s.method = method;
          return deflateReset(strm);
        }
        function deflateInit(strm, level) {
          return deflateInit2(
            strm,
            level,
            Z_DEFLATED,
            MAX_WBITS,
            DEF_MEM_LEVEL,
            Z_DEFAULT_STRATEGY
          );
        }
        function deflate(strm, flush) {
          var old_flush, s;
          var beg, val;
          if (!strm || !strm.state || flush > Z_BLOCK || flush < 0) {
            return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
          }
          s = strm.state;
          if (
            !strm.output ||
            (!strm.input && strm.avail_in !== 0) ||
            (s.status === FINISH_STATE && flush !== Z_FINISH)
          ) {
            return err(
              strm,
              strm.avail_out === 0 ? Z_BUF_ERROR : Z_STREAM_ERROR
            );
          }
          s.strm = strm;
          old_flush = s.last_flush;
          s.last_flush = flush;
          if (s.status === INIT_STATE) {
            if (s.wrap === 2) {
              strm.adler = 0;
              put_byte(s, 31);
              put_byte(s, 139);
              put_byte(s, 8);
              if (!s.gzhead) {
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(
                  s,
                  s.level === 9
                    ? 2
                    : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2
                    ? 4
                    : 0
                );
                put_byte(s, OS_CODE);
                s.status = BUSY_STATE;
              } else {
                put_byte(
                  s,
                  (s.gzhead.text ? 1 : 0) +
                    (s.gzhead.hcrc ? 2 : 0) +
                    (!s.gzhead.extra ? 0 : 4) +
                    (!s.gzhead.name ? 0 : 8) +
                    (!s.gzhead.comment ? 0 : 16)
                );
                put_byte(s, s.gzhead.time & 255);
                put_byte(s, (s.gzhead.time >> 8) & 255);
                put_byte(s, (s.gzhead.time >> 16) & 255);
                put_byte(s, (s.gzhead.time >> 24) & 255);
                put_byte(
                  s,
                  s.level === 9
                    ? 2
                    : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2
                    ? 4
                    : 0
                );
                put_byte(s, s.gzhead.os & 255);
                if (s.gzhead.extra && s.gzhead.extra.length) {
                  put_byte(s, s.gzhead.extra.length & 255);
                  put_byte(s, (s.gzhead.extra.length >> 8) & 255);
                }
                if (s.gzhead.hcrc) {
                  strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
                }
                s.gzindex = 0;
                s.status = EXTRA_STATE;
              }
            } else {
              var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
              var level_flags = -1;
              if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
                level_flags = 0;
              } else if (s.level < 6) {
                level_flags = 1;
              } else if (s.level === 6) {
                level_flags = 2;
              } else {
                level_flags = 3;
              }
              header |= level_flags << 6;
              if (s.strstart !== 0) {
                header |= PRESET_DICT;
              }
              header += 31 - (header % 31);
              s.status = BUSY_STATE;
              putShortMSB(s, header);
              if (s.strstart !== 0) {
                putShortMSB(s, strm.adler >>> 16);
                putShortMSB(s, strm.adler & 65535);
              }
              strm.adler = 1;
            }
          }
          if (s.status === EXTRA_STATE) {
            if (s.gzhead.extra) {
              beg = s.pending;
              while (s.gzindex < (s.gzhead.extra.length & 65535)) {
                if (s.pending === s.pending_buf_size) {
                  if (s.gzhead.hcrc && s.pending > beg) {
                    strm.adler = crc32(
                      strm.adler,
                      s.pending_buf,
                      s.pending - beg,
                      beg
                    );
                  }
                  flush_pending(strm);
                  beg = s.pending;
                  if (s.pending === s.pending_buf_size) {
                    break;
                  }
                }
                put_byte(s, s.gzhead.extra[s.gzindex] & 255);
                s.gzindex++;
              }
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(
                  strm.adler,
                  s.pending_buf,
                  s.pending - beg,
                  beg
                );
              }
              if (s.gzindex === s.gzhead.extra.length) {
                s.gzindex = 0;
                s.status = NAME_STATE;
              }
            } else {
              s.status = NAME_STATE;
            }
          }
          if (s.status === NAME_STATE) {
            if (s.gzhead.name) {
              beg = s.pending;
              do {
                if (s.pending === s.pending_buf_size) {
                  if (s.gzhead.hcrc && s.pending > beg) {
                    strm.adler = crc32(
                      strm.adler,
                      s.pending_buf,
                      s.pending - beg,
                      beg
                    );
                  }
                  flush_pending(strm);
                  beg = s.pending;
                  if (s.pending === s.pending_buf_size) {
                    val = 1;
                    break;
                  }
                }
                if (s.gzindex < s.gzhead.name.length) {
                  val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
                } else {
                  val = 0;
                }
                put_byte(s, val);
              } while (val !== 0);
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(
                  strm.adler,
                  s.pending_buf,
                  s.pending - beg,
                  beg
                );
              }
              if (val === 0) {
                s.gzindex = 0;
                s.status = COMMENT_STATE;
              }
            } else {
              s.status = COMMENT_STATE;
            }
          }
          if (s.status === COMMENT_STATE) {
            if (s.gzhead.comment) {
              beg = s.pending;
              do {
                if (s.pending === s.pending_buf_size) {
                  if (s.gzhead.hcrc && s.pending > beg) {
                    strm.adler = crc32(
                      strm.adler,
                      s.pending_buf,
                      s.pending - beg,
                      beg
                    );
                  }
                  flush_pending(strm);
                  beg = s.pending;
                  if (s.pending === s.pending_buf_size) {
                    val = 1;
                    break;
                  }
                }
                if (s.gzindex < s.gzhead.comment.length) {
                  val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
                } else {
                  val = 0;
                }
                put_byte(s, val);
              } while (val !== 0);
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(
                  strm.adler,
                  s.pending_buf,
                  s.pending - beg,
                  beg
                );
              }
              if (val === 0) {
                s.status = HCRC_STATE;
              }
            } else {
              s.status = HCRC_STATE;
            }
          }
          if (s.status === HCRC_STATE) {
            if (s.gzhead.hcrc) {
              if (s.pending + 2 > s.pending_buf_size) {
                flush_pending(strm);
              }
              if (s.pending + 2 <= s.pending_buf_size) {
                put_byte(s, strm.adler & 255);
                put_byte(s, (strm.adler >> 8) & 255);
                strm.adler = 0;
                s.status = BUSY_STATE;
              }
            } else {
              s.status = BUSY_STATE;
            }
          }
          if (s.pending !== 0) {
            flush_pending(strm);
            if (strm.avail_out === 0) {
              s.last_flush = -1;
              return Z_OK;
            }
          } else if (
            strm.avail_in === 0 &&
            rank(flush) <= rank(old_flush) &&
            flush !== Z_FINISH
          ) {
            return err(strm, Z_BUF_ERROR);
          }
          if (s.status === FINISH_STATE && strm.avail_in !== 0) {
            return err(strm, Z_BUF_ERROR);
          }
          if (
            strm.avail_in !== 0 ||
            s.lookahead !== 0 ||
            (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)
          ) {
            var bstate =
              s.strategy === Z_HUFFMAN_ONLY
                ? deflate_huff(s, flush)
                : s.strategy === Z_RLE
                ? deflate_rle(s, flush)
                : configuration_table[s.level].func(s, flush);
            if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
              s.status = FINISH_STATE;
            }
            if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
              if (strm.avail_out === 0) {
                s.last_flush = -1;
              }
              return Z_OK;
            }
            if (bstate === BS_BLOCK_DONE) {
              if (flush === Z_PARTIAL_FLUSH) {
                trees._tr_align(s);
              } else if (flush !== Z_BLOCK) {
                trees._tr_stored_block(s, 0, 0, false);
                if (flush === Z_FULL_FLUSH) {
                  zero(s.head);
                  if (s.lookahead === 0) {
                    s.strstart = 0;
                    s.block_start = 0;
                    s.insert = 0;
                  }
                }
              }
              flush_pending(strm);
              if (strm.avail_out === 0) {
                s.last_flush = -1;
                return Z_OK;
              }
            }
          }
          if (flush !== Z_FINISH) {
            return Z_OK;
          }
          if (s.wrap <= 0) {
            return Z_STREAM_END;
          }
          if (s.wrap === 2) {
            put_byte(s, strm.adler & 255);
            put_byte(s, (strm.adler >> 8) & 255);
            put_byte(s, (strm.adler >> 16) & 255);
            put_byte(s, (strm.adler >> 24) & 255);
            put_byte(s, strm.total_in & 255);
            put_byte(s, (strm.total_in >> 8) & 255);
            put_byte(s, (strm.total_in >> 16) & 255);
            put_byte(s, (strm.total_in >> 24) & 255);
          } else {
            putShortMSB(s, strm.adler >>> 16);
            putShortMSB(s, strm.adler & 65535);
          }
          flush_pending(strm);
          if (s.wrap > 0) {
            s.wrap = -s.wrap;
          }
          return s.pending !== 0 ? Z_OK : Z_STREAM_END;
        }
        function deflateEnd(strm) {
          var status;
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          status = strm.state.status;
          if (
            status !== INIT_STATE &&
            status !== EXTRA_STATE &&
            status !== NAME_STATE &&
            status !== COMMENT_STATE &&
            status !== HCRC_STATE &&
            status !== BUSY_STATE &&
            status !== FINISH_STATE
          ) {
            return err(strm, Z_STREAM_ERROR);
          }
          strm.state = null;
          return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
        }
        exports.deflateInit = deflateInit;
        exports.deflateInit2 = deflateInit2;
        exports.deflateReset = deflateReset;
        exports.deflateResetKeep = deflateResetKeep;
        exports.deflateSetHeader = deflateSetHeader;
        exports.deflate = deflate;
        exports.deflateEnd = deflateEnd;
        exports.deflateInfo = "pako deflate (from Nodeca project)";
      },
      {
        "../utils/common": 11,
        "./adler32": 13,
        "./crc32": 15,
        "./messages": 21,
        "./trees": 22,
      },
    ],
    17: [
      function (require, module, exports) {
        "use strict";
        function GZheader() {
          this.text = 0;
          this.time = 0;
          this.xflags = 0;
          this.os = 0;
          this.extra = null;
          this.extra_len = 0;
          this.name = "";
          this.comment = "";
          this.hcrc = 0;
          this.done = false;
        }
        module.exports = GZheader;
      },
      {},
    ],
    18: [
      function (require, module, exports) {
        "use strict";
        var BAD = 30;
        var TYPE = 12;
        module.exports = function inflate_fast(strm, start) {
          var state;
          var _in;
          var last;
          var _out;
          var beg;
          var end;
          var dmax;
          var wsize;
          var whave;
          var wnext;
          var window;
          var hold;
          var bits;
          var lcode;
          var dcode;
          var lmask;
          var dmask;
          var here;
          var op;
          var len;
          var dist;
          var from;
          var from_source;
          var input, output;
          state = strm.state;
          _in = strm.next_in;
          input = strm.input;
          last = _in + (strm.avail_in - 5);
          _out = strm.next_out;
          output = strm.output;
          beg = _out - (start - strm.avail_out);
          end = _out + (strm.avail_out - 257);
          dmax = state.dmax;
          wsize = state.wsize;
          whave = state.whave;
          wnext = state.wnext;
          window = state.window;
          hold = state.hold;
          bits = state.bits;
          lcode = state.lencode;
          dcode = state.distcode;
          lmask = (1 << state.lenbits) - 1;
          dmask = (1 << state.distbits) - 1;
          top: do {
            if (bits < 15) {
              hold += input[_in++] << bits;
              bits += 8;
              hold += input[_in++] << bits;
              bits += 8;
            }
            here = lcode[hold & lmask];
            dolen: for (;;) {
              op = here >>> 24;
              hold >>>= op;
              bits -= op;
              op = (here >>> 16) & 255;
              if (op === 0) {
                output[_out++] = here & 65535;
              } else if (op & 16) {
                len = here & 65535;
                op &= 15;
                if (op) {
                  if (bits < op) {
                    hold += input[_in++] << bits;
                    bits += 8;
                  }
                  len += hold & ((1 << op) - 1);
                  hold >>>= op;
                  bits -= op;
                }
                if (bits < 15) {
                  hold += input[_in++] << bits;
                  bits += 8;
                  hold += input[_in++] << bits;
                  bits += 8;
                }
                here = dcode[hold & dmask];
                dodist: for (;;) {
                  op = here >>> 24;
                  hold >>>= op;
                  bits -= op;
                  op = (here >>> 16) & 255;
                  if (op & 16) {
                    dist = here & 65535;
                    op &= 15;
                    if (bits < op) {
                      hold += input[_in++] << bits;
                      bits += 8;
                      if (bits < op) {
                        hold += input[_in++] << bits;
                        bits += 8;
                      }
                    }
                    dist += hold & ((1 << op) - 1);
                    if (dist > dmax) {
                      strm.msg = "invalid distance too far back";
                      state.mode = BAD;
                      break top;
                    }
                    hold >>>= op;
                    bits -= op;
                    op = _out - beg;
                    if (dist > op) {
                      op = dist - op;
                      if (op > whave) {
                        if (state.sane) {
                          strm.msg = "invalid distance too far back";
                          state.mode = BAD;
                          break top;
                        }
                      }
                      from = 0;
                      from_source = window;
                      if (wnext === 0) {
                        from += wsize - op;
                        if (op < len) {
                          len -= op;
                          do {
                            output[_out++] = window[from++];
                          } while (--op);
                          from = _out - dist;
                          from_source = output;
                        }
                      } else if (wnext < op) {
                        from += wsize + wnext - op;
                        op -= wnext;
                        if (op < len) {
                          len -= op;
                          do {
                            output[_out++] = window[from++];
                          } while (--op);
                          from = 0;
                          if (wnext < len) {
                            op = wnext;
                            len -= op;
                            do {
                              output[_out++] = window[from++];
                            } while (--op);
                            from = _out - dist;
                            from_source = output;
                          }
                        }
                      } else {
                        from += wnext - op;
                        if (op < len) {
                          len -= op;
                          do {
                            output[_out++] = window[from++];
                          } while (--op);
                          from = _out - dist;
                          from_source = output;
                        }
                      }
                      while (len > 2) {
                        output[_out++] = from_source[from++];
                        output[_out++] = from_source[from++];
                        output[_out++] = from_source[from++];
                        len -= 3;
                      }
                      if (len) {
                        output[_out++] = from_source[from++];
                        if (len > 1) {
                          output[_out++] = from_source[from++];
                        }
                      }
                    } else {
                      from = _out - dist;
                      do {
                        output[_out++] = output[from++];
                        output[_out++] = output[from++];
                        output[_out++] = output[from++];
                        len -= 3;
                      } while (len > 2);
                      if (len) {
                        output[_out++] = output[from++];
                        if (len > 1) {
                          output[_out++] = output[from++];
                        }
                      }
                    }
                  } else if ((op & 64) === 0) {
                    here = dcode[(here & 65535) + (hold & ((1 << op) - 1))];
                    continue dodist;
                  } else {
                    strm.msg = "invalid distance code";
                    state.mode = BAD;
                    break top;
                  }
                  break;
                }
              } else if ((op & 64) === 0) {
                here = lcode[(here & 65535) + (hold & ((1 << op) - 1))];
                continue dolen;
              } else if (op & 32) {
                state.mode = TYPE;
                break top;
              } else {
                strm.msg = "invalid literal/length code";
                state.mode = BAD;
                break top;
              }
              break;
            }
          } while (_in < last && _out < end);
          len = bits >> 3;
          _in -= len;
          bits -= len << 3;
          hold &= (1 << bits) - 1;
          strm.next_in = _in;
          strm.next_out = _out;
          strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
          strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
          state.hold = hold;
          state.bits = bits;
          return;
        };
      },
      {},
    ],
    19: [
      function (require, module, exports) {
        "use strict";
        var utils = require("../utils/common");
        var adler32 = require("./adler32");
        var crc32 = require("./crc32");
        var inflate_fast = require("./inffast");
        var inflate_table = require("./inftrees");
        var CODES = 0;
        var LENS = 1;
        var DISTS = 2;
        var Z_FINISH = 4;
        var Z_BLOCK = 5;
        var Z_TREES = 6;
        var Z_OK = 0;
        var Z_STREAM_END = 1;
        var Z_NEED_DICT = 2;
        var Z_STREAM_ERROR = -2;
        var Z_DATA_ERROR = -3;
        var Z_MEM_ERROR = -4;
        var Z_BUF_ERROR = -5;
        var Z_DEFLATED = 8;
        var HEAD = 1;
        var FLAGS = 2;
        var TIME = 3;
        var OS = 4;
        var EXLEN = 5;
        var EXTRA = 6;
        var NAME = 7;
        var COMMENT = 8;
        var HCRC = 9;
        var DICTID = 10;
        var DICT = 11;
        var TYPE = 12;
        var TYPEDO = 13;
        var STORED = 14;
        var COPY_ = 15;
        var COPY = 16;
        var TABLE = 17;
        var LENLENS = 18;
        var CODELENS = 19;
        var LEN_ = 20;
        var LEN = 21;
        var LENEXT = 22;
        var DIST = 23;
        var DISTEXT = 24;
        var MATCH = 25;
        var LIT = 26;
        var CHECK = 27;
        var LENGTH = 28;
        var DONE = 29;
        var BAD = 30;
        var MEM = 31;
        var SYNC = 32;
        var ENOUGH_LENS = 852;
        var ENOUGH_DISTS = 592;
        var MAX_WBITS = 15;
        var DEF_WBITS = MAX_WBITS;
        function ZSWAP32(q) {
          return (
            ((q >>> 24) & 255) +
            ((q >>> 8) & 65280) +
            ((q & 65280) << 8) +
            ((q & 255) << 24)
          );
        }
        function InflateState() {
          this.mode = 0;
          this.last = false;
          this.wrap = 0;
          this.havedict = false;
          this.flags = 0;
          this.dmax = 0;
          this.check = 0;
          this.total = 0;
          this.head = null;
          this.wbits = 0;
          this.wsize = 0;
          this.whave = 0;
          this.wnext = 0;
          this.window = null;
          this.hold = 0;
          this.bits = 0;
          this.length = 0;
          this.offset = 0;
          this.extra = 0;
          this.lencode = null;
          this.distcode = null;
          this.lenbits = 0;
          this.distbits = 0;
          this.ncode = 0;
          this.nlen = 0;
          this.ndist = 0;
          this.have = 0;
          this.next = null;
          this.lens = new utils.Buf16(320);
          this.work = new utils.Buf16(288);
          this.lendyn = null;
          this.distdyn = null;
          this.sane = 0;
          this.back = 0;
          this.was = 0;
        }
        function inflateResetKeep(strm) {
          var state;
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          state = strm.state;
          strm.total_in = strm.total_out = state.total = 0;
          strm.msg = "";
          if (state.wrap) {
            strm.adler = state.wrap & 1;
          }
          state.mode = HEAD;
          state.last = 0;
          state.havedict = 0;
          state.dmax = 32768;
          state.head = null;
          state.hold = 0;
          state.bits = 0;
          state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
          state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);
          state.sane = 1;
          state.back = -1;
          return Z_OK;
        }
        function inflateReset(strm) {
          var state;
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          state = strm.state;
          state.wsize = 0;
          state.whave = 0;
          state.wnext = 0;
          return inflateResetKeep(strm);
        }
        function inflateReset2(strm, windowBits) {
          var wrap;
          var state;
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          state = strm.state;
          if (windowBits < 0) {
            wrap = 0;
            windowBits = -windowBits;
          } else {
            wrap = (windowBits >> 4) + 1;
            if (windowBits < 48) {
              windowBits &= 15;
            }
          }
          if (windowBits && (windowBits < 8 || windowBits > 15)) {
            return Z_STREAM_ERROR;
          }
          if (state.window !== null && state.wbits !== windowBits) {
            state.window = null;
          }
          state.wrap = wrap;
          state.wbits = windowBits;
          return inflateReset(strm);
        }
        function inflateInit2(strm, windowBits) {
          var ret;
          var state;
          if (!strm) {
            return Z_STREAM_ERROR;
          }
          state = new InflateState();
          strm.state = state;
          state.window = null;
          ret = inflateReset2(strm, windowBits);
          if (ret !== Z_OK) {
            strm.state = null;
          }
          return ret;
        }
        function inflateInit(strm) {
          return inflateInit2(strm, DEF_WBITS);
        }
        var virgin = true;
        var lenfix, distfix;
        function fixedtables(state) {
          if (virgin) {
            var sym;
            lenfix = new utils.Buf32(512);
            distfix = new utils.Buf32(32);
            sym = 0;
            while (sym < 144) {
              state.lens[sym++] = 8;
            }
            while (sym < 256) {
              state.lens[sym++] = 9;
            }
            while (sym < 280) {
              state.lens[sym++] = 7;
            }
            while (sym < 288) {
              state.lens[sym++] = 8;
            }
            inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, {
              bits: 9,
            });
            sym = 0;
            while (sym < 32) {
              state.lens[sym++] = 5;
            }
            inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, {
              bits: 5,
            });
            virgin = false;
          }
          state.lencode = lenfix;
          state.lenbits = 9;
          state.distcode = distfix;
          state.distbits = 5;
        }
        function updatewindow(strm, src, end, copy) {
          var dist;
          var state = strm.state;
          if (state.window === null) {
            state.wsize = 1 << state.wbits;
            state.wnext = 0;
            state.whave = 0;
            state.window = new utils.Buf8(state.wsize);
          }
          if (copy >= state.wsize) {
            utils.arraySet(
              state.window,
              src,
              end - state.wsize,
              state.wsize,
              0
            );
            state.wnext = 0;
            state.whave = state.wsize;
          } else {
            dist = state.wsize - state.wnext;
            if (dist > copy) {
              dist = copy;
            }
            utils.arraySet(state.window, src, end - copy, dist, state.wnext);
            copy -= dist;
            if (copy) {
              utils.arraySet(state.window, src, end - copy, copy, 0);
              state.wnext = copy;
              state.whave = state.wsize;
            } else {
              state.wnext += dist;
              if (state.wnext === state.wsize) {
                state.wnext = 0;
              }
              if (state.whave < state.wsize) {
                state.whave += dist;
              }
            }
          }
          return 0;
        }
        function inflate(strm, flush) {
          var state;
          var input, output;
          var next;
          var put;
          var have, left;
          var hold;
          var bits;
          var _in, _out;
          var copy;
          var from;
          var from_source;
          var here = 0;
          var here_bits, here_op, here_val;
          var last_bits, last_op, last_val;
          var len;
          var ret;
          var hbuf = new utils.Buf8(4);
          var opts;
          var n;
          var order = [
            16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
          ];
          if (
            !strm ||
            !strm.state ||
            !strm.output ||
            (!strm.input && strm.avail_in !== 0)
          ) {
            return Z_STREAM_ERROR;
          }
          state = strm.state;
          if (state.mode === TYPE) {
            state.mode = TYPEDO;
          }
          put = strm.next_out;
          output = strm.output;
          left = strm.avail_out;
          next = strm.next_in;
          input = strm.input;
          have = strm.avail_in;
          hold = state.hold;
          bits = state.bits;
          _in = have;
          _out = left;
          ret = Z_OK;
          inf_leave: for (;;) {
            switch (state.mode) {
              case HEAD:
                if (state.wrap === 0) {
                  state.mode = TYPEDO;
                  break;
                }
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.wrap & 2 && hold === 35615) {
                  state.check = 0;
                  hbuf[0] = hold & 255;
                  hbuf[1] = (hold >>> 8) & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                  hold = 0;
                  bits = 0;
                  state.mode = FLAGS;
                  break;
                }
                state.flags = 0;
                if (state.head) {
                  state.head.done = false;
                }
                if (
                  !(state.wrap & 1) ||
                  (((hold & 255) << 8) + (hold >> 8)) % 31
                ) {
                  strm.msg = "incorrect header check";
                  state.mode = BAD;
                  break;
                }
                if ((hold & 15) !== Z_DEFLATED) {
                  strm.msg = "unknown compression method";
                  state.mode = BAD;
                  break;
                }
                hold >>>= 4;
                bits -= 4;
                len = (hold & 15) + 8;
                if (state.wbits === 0) {
                  state.wbits = len;
                } else if (len > state.wbits) {
                  strm.msg = "invalid window size";
                  state.mode = BAD;
                  break;
                }
                state.dmax = 1 << len;
                strm.adler = state.check = 1;
                state.mode = hold & 512 ? DICTID : TYPE;
                hold = 0;
                bits = 0;
                break;
              case FLAGS:
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.flags = hold;
                if ((state.flags & 255) !== Z_DEFLATED) {
                  strm.msg = "unknown compression method";
                  state.mode = BAD;
                  break;
                }
                if (state.flags & 57344) {
                  strm.msg = "unknown header flags set";
                  state.mode = BAD;
                  break;
                }
                if (state.head) {
                  state.head.text = (hold >> 8) & 1;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = (hold >>> 8) & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = TIME;
              case TIME:
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.head) {
                  state.head.time = hold;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = (hold >>> 8) & 255;
                  hbuf[2] = (hold >>> 16) & 255;
                  hbuf[3] = (hold >>> 24) & 255;
                  state.check = crc32(state.check, hbuf, 4, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = OS;
              case OS:
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.head) {
                  state.head.xflags = hold & 255;
                  state.head.os = hold >> 8;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = (hold >>> 8) & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = EXLEN;
              case EXLEN:
                if (state.flags & 1024) {
                  while (bits < 16) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.length = hold;
                  if (state.head) {
                    state.head.extra_len = hold;
                  }
                  if (state.flags & 512) {
                    hbuf[0] = hold & 255;
                    hbuf[1] = (hold >>> 8) & 255;
                    state.check = crc32(state.check, hbuf, 2, 0);
                  }
                  hold = 0;
                  bits = 0;
                } else if (state.head) {
                  state.head.extra = null;
                }
                state.mode = EXTRA;
              case EXTRA:
                if (state.flags & 1024) {
                  copy = state.length;
                  if (copy > have) {
                    copy = have;
                  }
                  if (copy) {
                    if (state.head) {
                      len = state.head.extra_len - state.length;
                      if (!state.head.extra) {
                        state.head.extra = new Array(state.head.extra_len);
                      }
                      utils.arraySet(state.head.extra, input, next, copy, len);
                    }
                    if (state.flags & 512) {
                      state.check = crc32(state.check, input, copy, next);
                    }
                    have -= copy;
                    next += copy;
                    state.length -= copy;
                  }
                  if (state.length) {
                    break inf_leave;
                  }
                }
                state.length = 0;
                state.mode = NAME;
              case NAME:
                if (state.flags & 2048) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  copy = 0;
                  do {
                    len = input[next + copy++];
                    if (state.head && len && state.length < 65536) {
                      state.head.name += String.fromCharCode(len);
                    }
                  } while (len && copy < have);
                  if (state.flags & 512) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  if (len) {
                    break inf_leave;
                  }
                } else if (state.head) {
                  state.head.name = null;
                }
                state.length = 0;
                state.mode = COMMENT;
              case COMMENT:
                if (state.flags & 4096) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  copy = 0;
                  do {
                    len = input[next + copy++];
                    if (state.head && len && state.length < 65536) {
                      state.head.comment += String.fromCharCode(len);
                    }
                  } while (len && copy < have);
                  if (state.flags & 512) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  if (len) {
                    break inf_leave;
                  }
                } else if (state.head) {
                  state.head.comment = null;
                }
                state.mode = HCRC;
              case HCRC:
                if (state.flags & 512) {
                  while (bits < 16) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (hold !== (state.check & 65535)) {
                    strm.msg = "header crc mismatch";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                if (state.head) {
                  state.head.hcrc = (state.flags >> 9) & 1;
                  state.head.done = true;
                }
                strm.adler = state.check = 0;
                state.mode = TYPE;
                break;
              case DICTID:
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                strm.adler = state.check = ZSWAP32(hold);
                hold = 0;
                bits = 0;
                state.mode = DICT;
              case DICT:
                if (state.havedict === 0) {
                  strm.next_out = put;
                  strm.avail_out = left;
                  strm.next_in = next;
                  strm.avail_in = have;
                  state.hold = hold;
                  state.bits = bits;
                  return Z_NEED_DICT;
                }
                strm.adler = state.check = 1;
                state.mode = TYPE;
              case TYPE:
                if (flush === Z_BLOCK || flush === Z_TREES) {
                  break inf_leave;
                }
              case TYPEDO:
                if (state.last) {
                  hold >>>= bits & 7;
                  bits -= bits & 7;
                  state.mode = CHECK;
                  break;
                }
                while (bits < 3) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.last = hold & 1;
                hold >>>= 1;
                bits -= 1;
                switch (hold & 3) {
                  case 0:
                    state.mode = STORED;
                    break;
                  case 1:
                    fixedtables(state);
                    state.mode = LEN_;
                    if (flush === Z_TREES) {
                      hold >>>= 2;
                      bits -= 2;
                      break inf_leave;
                    }
                    break;
                  case 2:
                    state.mode = TABLE;
                    break;
                  case 3:
                    strm.msg = "invalid block type";
                    state.mode = BAD;
                }
                hold >>>= 2;
                bits -= 2;
                break;
              case STORED:
                hold >>>= bits & 7;
                bits -= bits & 7;
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if ((hold & 65535) !== ((hold >>> 16) ^ 65535)) {
                  strm.msg = "invalid stored block lengths";
                  state.mode = BAD;
                  break;
                }
                state.length = hold & 65535;
                hold = 0;
                bits = 0;
                state.mode = COPY_;
                if (flush === Z_TREES) {
                  break inf_leave;
                }
              case COPY_:
                state.mode = COPY;
              case COPY:
                copy = state.length;
                if (copy) {
                  if (copy > have) {
                    copy = have;
                  }
                  if (copy > left) {
                    copy = left;
                  }
                  if (copy === 0) {
                    break inf_leave;
                  }
                  utils.arraySet(output, input, next, copy, put);
                  have -= copy;
                  next += copy;
                  left -= copy;
                  put += copy;
                  state.length -= copy;
                  break;
                }
                state.mode = TYPE;
                break;
              case TABLE:
                while (bits < 14) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.nlen = (hold & 31) + 257;
                hold >>>= 5;
                bits -= 5;
                state.ndist = (hold & 31) + 1;
                hold >>>= 5;
                bits -= 5;
                state.ncode = (hold & 15) + 4;
                hold >>>= 4;
                bits -= 4;
                if (state.nlen > 286 || state.ndist > 30) {
                  strm.msg = "too many length or distance symbols";
                  state.mode = BAD;
                  break;
                }
                state.have = 0;
                state.mode = LENLENS;
              case LENLENS:
                while (state.have < state.ncode) {
                  while (bits < 3) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.lens[order[state.have++]] = hold & 7;
                  hold >>>= 3;
                  bits -= 3;
                }
                while (state.have < 19) {
                  state.lens[order[state.have++]] = 0;
                }
                state.lencode = state.lendyn;
                state.lenbits = 7;
                opts = { bits: state.lenbits };
                ret = inflate_table(
                  CODES,
                  state.lens,
                  0,
                  19,
                  state.lencode,
                  0,
                  state.work,
                  opts
                );
                state.lenbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid code lengths set";
                  state.mode = BAD;
                  break;
                }
                state.have = 0;
                state.mode = CODELENS;
              case CODELENS:
                while (state.have < state.nlen + state.ndist) {
                  for (;;) {
                    here = state.lencode[hold & ((1 << state.lenbits) - 1)];
                    here_bits = here >>> 24;
                    here_op = (here >>> 16) & 255;
                    here_val = here & 65535;
                    if (here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (here_val < 16) {
                    hold >>>= here_bits;
                    bits -= here_bits;
                    state.lens[state.have++] = here_val;
                  } else {
                    if (here_val === 16) {
                      n = here_bits + 2;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      if (state.have === 0) {
                        strm.msg = "invalid bit length repeat";
                        state.mode = BAD;
                        break;
                      }
                      len = state.lens[state.have - 1];
                      copy = 3 + (hold & 3);
                      hold >>>= 2;
                      bits -= 2;
                    } else if (here_val === 17) {
                      n = here_bits + 3;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      len = 0;
                      copy = 3 + (hold & 7);
                      hold >>>= 3;
                      bits -= 3;
                    } else {
                      n = here_bits + 7;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      len = 0;
                      copy = 11 + (hold & 127);
                      hold >>>= 7;
                      bits -= 7;
                    }
                    if (state.have + copy > state.nlen + state.ndist) {
                      strm.msg = "invalid bit length repeat";
                      state.mode = BAD;
                      break;
                    }
                    while (copy--) {
                      state.lens[state.have++] = len;
                    }
                  }
                }
                if (state.mode === BAD) {
                  break;
                }
                if (state.lens[256] === 0) {
                  strm.msg = "invalid code -- missing end-of-block";
                  state.mode = BAD;
                  break;
                }
                state.lenbits = 9;
                opts = { bits: state.lenbits };
                ret = inflate_table(
                  LENS,
                  state.lens,
                  0,
                  state.nlen,
                  state.lencode,
                  0,
                  state.work,
                  opts
                );
                state.lenbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid literal/lengths set";
                  state.mode = BAD;
                  break;
                }
                state.distbits = 6;
                state.distcode = state.distdyn;
                opts = { bits: state.distbits };
                ret = inflate_table(
                  DISTS,
                  state.lens,
                  state.nlen,
                  state.ndist,
                  state.distcode,
                  0,
                  state.work,
                  opts
                );
                state.distbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid distances set";
                  state.mode = BAD;
                  break;
                }
                state.mode = LEN_;
                if (flush === Z_TREES) {
                  break inf_leave;
                }
              case LEN_:
                state.mode = LEN;
              case LEN:
                if (have >= 6 && left >= 258) {
                  strm.next_out = put;
                  strm.avail_out = left;
                  strm.next_in = next;
                  strm.avail_in = have;
                  state.hold = hold;
                  state.bits = bits;
                  inflate_fast(strm, _out);
                  put = strm.next_out;
                  output = strm.output;
                  left = strm.avail_out;
                  next = strm.next_in;
                  input = strm.input;
                  have = strm.avail_in;
                  hold = state.hold;
                  bits = state.bits;
                  if (state.mode === TYPE) {
                    state.back = -1;
                  }
                  break;
                }
                state.back = 0;
                for (;;) {
                  here = state.lencode[hold & ((1 << state.lenbits) - 1)];
                  here_bits = here >>> 24;
                  here_op = (here >>> 16) & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (here_op && (here_op & 240) === 0) {
                  last_bits = here_bits;
                  last_op = here_op;
                  last_val = here_val;
                  for (;;) {
                    here =
                      state.lencode[
                        last_val +
                          ((hold & ((1 << (last_bits + last_op)) - 1)) >>
                            last_bits)
                      ];
                    here_bits = here >>> 24;
                    here_op = (here >>> 16) & 255;
                    here_val = here & 65535;
                    if (last_bits + here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= last_bits;
                  bits -= last_bits;
                  state.back += last_bits;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                state.back += here_bits;
                state.length = here_val;
                if (here_op === 0) {
                  state.mode = LIT;
                  break;
                }
                if (here_op & 32) {
                  state.back = -1;
                  state.mode = TYPE;
                  break;
                }
                if (here_op & 64) {
                  strm.msg = "invalid literal/length code";
                  state.mode = BAD;
                  break;
                }
                state.extra = here_op & 15;
                state.mode = LENEXT;
              case LENEXT:
                if (state.extra) {
                  n = state.extra;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.length += hold & ((1 << state.extra) - 1);
                  hold >>>= state.extra;
                  bits -= state.extra;
                  state.back += state.extra;
                }
                state.was = state.length;
                state.mode = DIST;
              case DIST:
                for (;;) {
                  here = state.distcode[hold & ((1 << state.distbits) - 1)];
                  here_bits = here >>> 24;
                  here_op = (here >>> 16) & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if ((here_op & 240) === 0) {
                  last_bits = here_bits;
                  last_op = here_op;
                  last_val = here_val;
                  for (;;) {
                    here =
                      state.distcode[
                        last_val +
                          ((hold & ((1 << (last_bits + last_op)) - 1)) >>
                            last_bits)
                      ];
                    here_bits = here >>> 24;
                    here_op = (here >>> 16) & 255;
                    here_val = here & 65535;
                    if (last_bits + here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= last_bits;
                  bits -= last_bits;
                  state.back += last_bits;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                state.back += here_bits;
                if (here_op & 64) {
                  strm.msg = "invalid distance code";
                  state.mode = BAD;
                  break;
                }
                state.offset = here_val;
                state.extra = here_op & 15;
                state.mode = DISTEXT;
              case DISTEXT:
                if (state.extra) {
                  n = state.extra;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.offset += hold & ((1 << state.extra) - 1);
                  hold >>>= state.extra;
                  bits -= state.extra;
                  state.back += state.extra;
                }
                if (state.offset > state.dmax) {
                  strm.msg = "invalid distance too far back";
                  state.mode = BAD;
                  break;
                }
                state.mode = MATCH;
              case MATCH:
                if (left === 0) {
                  break inf_leave;
                }
                copy = _out - left;
                if (state.offset > copy) {
                  copy = state.offset - copy;
                  if (copy > state.whave) {
                    if (state.sane) {
                      strm.msg = "invalid distance too far back";
                      state.mode = BAD;
                      break;
                    }
                  }
                  if (copy > state.wnext) {
                    copy -= state.wnext;
                    from = state.wsize - copy;
                  } else {
                    from = state.wnext - copy;
                  }
                  if (copy > state.length) {
                    copy = state.length;
                  }
                  from_source = state.window;
                } else {
                  from_source = output;
                  from = put - state.offset;
                  copy = state.length;
                }
                if (copy > left) {
                  copy = left;
                }
                left -= copy;
                state.length -= copy;
                do {
                  output[put++] = from_source[from++];
                } while (--copy);
                if (state.length === 0) {
                  state.mode = LEN;
                }
                break;
              case LIT:
                if (left === 0) {
                  break inf_leave;
                }
                output[put++] = state.length;
                left--;
                state.mode = LEN;
                break;
              case CHECK:
                if (state.wrap) {
                  while (bits < 32) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold |= input[next++] << bits;
                    bits += 8;
                  }
                  _out -= left;
                  strm.total_out += _out;
                  state.total += _out;
                  if (_out) {
                    strm.adler = state.check = state.flags
                      ? crc32(state.check, output, _out, put - _out)
                      : adler32(state.check, output, _out, put - _out);
                  }
                  _out = left;
                  if ((state.flags ? hold : ZSWAP32(hold)) !== state.check) {
                    strm.msg = "incorrect data check";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                state.mode = LENGTH;
              case LENGTH:
                if (state.wrap && state.flags) {
                  while (bits < 32) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (hold !== (state.total & 4294967295)) {
                    strm.msg = "incorrect length check";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                state.mode = DONE;
              case DONE:
                ret = Z_STREAM_END;
                break inf_leave;
              case BAD:
                ret = Z_DATA_ERROR;
                break inf_leave;
              case MEM:
                return Z_MEM_ERROR;
              case SYNC:
              default:
                return Z_STREAM_ERROR;
            }
          }
          strm.next_out = put;

          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          if (
            state.wsize ||
            (_out !== strm.avail_out &&
              state.mode < BAD &&
              (state.mode < CHECK || flush !== Z_FINISH))
          ) {
            if (
              updatewindow(
                strm,
                strm.output,
                strm.next_out,
                _out - strm.avail_out
              )
            ) {
              state.mode = MEM;
              return Z_MEM_ERROR;
            }
          }
          _in -= strm.avail_in;
          _out -= strm.avail_out;
          strm.total_in += _in;
          strm.total_out += _out;
          state.total += _out;
          if (state.wrap && _out) {
            strm.adler = state.check = state.flags
              ? crc32(state.check, output, _out, strm.next_out - _out)
              : adler32(state.check, output, _out, strm.next_out - _out);
          }
          strm.data_type =
            state.bits +
            (state.last ? 64 : 0) +
            (state.mode === TYPE ? 128 : 0) +
            (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
          if (
            ((_in === 0 && _out === 0) || flush === Z_FINISH) &&
            ret === Z_OK
          ) {
            ret = Z_BUF_ERROR;
          }
          return ret;
        }
        function inflateEnd(strm) {
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          var state = strm.state;
          if (state.window) {
            state.window = null;
          }
          strm.state = null;
          return Z_OK;
        }
        function inflateGetHeader(strm, head) {
          var state;
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          state = strm.state;
          if ((state.wrap & 2) === 0) {
            return Z_STREAM_ERROR;
          }
          state.head = head;
          head.done = false;
          return Z_OK;
        }
        exports.inflateReset = inflateReset;
        exports.inflateReset2 = inflateReset2;
        exports.inflateResetKeep = inflateResetKeep;
        exports.inflateInit = inflateInit;
        exports.inflateInit2 = inflateInit2;
        exports.inflate = inflate;
        exports.inflateEnd = inflateEnd;
        exports.inflateGetHeader = inflateGetHeader;
        exports.inflateInfo = "pako inflate (from Nodeca project)";
      },
      {
        "../utils/common": 11,
        "./adler32": 13,
        "./crc32": 15,
        "./inffast": 18,
        "./inftrees": 20,
      },
    ],
    20: [
      function (require, module, exports) {
        "use strict";
        var utils = require("../utils/common");
        var MAXBITS = 15;
        var ENOUGH_LENS = 852;
        var ENOUGH_DISTS = 592;
        var CODES = 0;
        var LENS = 1;
        var DISTS = 2;
        var lbase = [
          3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51,
          59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0,
        ];
        var lext = [
          16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19,
          19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78,
        ];
        var dbase = [
          1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385,
          513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385,
          24577, 0, 0,
        ];
        var dext = [
          16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23,
          23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64,
        ];
        module.exports = function inflate_table(
          type,
          lens,
          lens_index,
          codes,
          table,
          table_index,
          work,
          opts
        ) {
          var bits = opts.bits;
          var len = 0;
          var sym = 0;
          var min = 0,
            max = 0;
          var root = 0;
          var curr = 0;
          var drop = 0;
          var left = 0;
          var used = 0;
          var huff = 0;
          var incr;
          var fill;
          var low;
          var mask;
          var next;
          var base = null;
          var base_index = 0;
          var end;
          var count = new utils.Buf16(MAXBITS + 1);
          var offs = new utils.Buf16(MAXBITS + 1);
          var extra = null;
          var extra_index = 0;
          var here_bits, here_op, here_val;
          for (len = 0; len <= MAXBITS; len++) {
            count[len] = 0;
          }
          for (sym = 0; sym < codes; sym++) {
            count[lens[lens_index + sym]]++;
          }
          root = bits;
          for (max = MAXBITS; max >= 1; max--) {
            if (count[max] !== 0) {
              break;
            }
          }
          if (root > max) {
            root = max;
          }
          if (max === 0) {
            table[table_index++] = (1 << 24) | (64 << 16) | 0;
            table[table_index++] = (1 << 24) | (64 << 16) | 0;
            opts.bits = 1;
            return 0;
          }
          for (min = 1; min < max; min++) {
            if (count[min] !== 0) {
              break;
            }
          }
          if (root < min) {
            root = min;
          }
          left = 1;
          for (len = 1; len <= MAXBITS; len++) {
            left <<= 1;
            left -= count[len];
            if (left < 0) {
              return -1;
            }
          }
          if (left > 0 && (type === CODES || max !== 1)) {
            return -1;
          }
          offs[1] = 0;
          for (len = 1; len < MAXBITS; len++) {
            offs[len + 1] = offs[len] + count[len];
          }
          for (sym = 0; sym < codes; sym++) {
            if (lens[lens_index + sym] !== 0) {
              work[offs[lens[lens_index + sym]]++] = sym;
            }
          }
          if (type === CODES) {
            base = extra = work;
            end = 19;
          } else if (type === LENS) {
            base = lbase;
            base_index -= 257;
            extra = lext;
            extra_index -= 257;
            end = 256;
          } else {
            base = dbase;
            extra = dext;
            end = -1;
          }
          huff = 0;
          sym = 0;
          len = min;
          next = table_index;
          curr = root;
          drop = 0;
          low = -1;
          used = 1 << root;
          mask = used - 1;
          if (
            (type === LENS && used > ENOUGH_LENS) ||
            (type === DISTS && used > ENOUGH_DISTS)
          ) {
            return 1;
          }
          var i = 0;
          for (;;) {
            i++;
            here_bits = len - drop;
            if (work[sym] < end) {
              here_op = 0;
              here_val = work[sym];
            } else if (work[sym] > end) {
              here_op = extra[extra_index + work[sym]];
              here_val = base[base_index + work[sym]];
            } else {
              here_op = 32 + 64;
              here_val = 0;
            }
            incr = 1 << (len - drop);
            fill = 1 << curr;
            min = fill;
            do {
              fill -= incr;
              table[next + (huff >> drop) + fill] =
                (here_bits << 24) | (here_op << 16) | here_val | 0;
            } while (fill !== 0);
            incr = 1 << (len - 1);
            while (huff & incr) {
              incr >>= 1;
            }
            if (incr !== 0) {
              huff &= incr - 1;
              huff += incr;
            } else {
              huff = 0;
            }
            sym++;
            if (--count[len] === 0) {
              if (len === max) {
                break;
              }
              len = lens[lens_index + work[sym]];
            }
            if (len > root && (huff & mask) !== low) {
              if (drop === 0) {
                drop = root;
              }
              next += min;
              curr = len - drop;
              left = 1 << curr;
              while (curr + drop < max) {
                left -= count[curr + drop];
                if (left <= 0) {
                  break;
                }
                curr++;
                left <<= 1;
              }
              used += 1 << curr;
              if (
                (type === LENS && used > ENOUGH_LENS) ||
                (type === DISTS && used > ENOUGH_DISTS)
              ) {
                return 1;
              }
              low = huff & mask;
              table[low] =
                (root << 24) | (curr << 16) | (next - table_index) | 0;
            }
          }
          if (huff !== 0) {
            table[next + huff] = ((len - drop) << 24) | (64 << 16) | 0;
          }
          opts.bits = root;
          return 0;
        };
      },
      { "../utils/common": 11 },
    ],
    21: [
      function (require, module, exports) {
        "use strict";
        module.exports = {
          2: "need dictionary",
          1: "stream end",
          0: "",
          "-1": "file error",
          "-2": "stream error",
          "-3": "data error",
          "-4": "insufficient memory",
          "-5": "buffer error",
          "-6": "incompatible version",
        };
      },
      {},
    ],
    22: [
      function (require, module, exports) {
        "use strict";
        var utils = require("../utils/common");
        var Z_FIXED = 4;
        var Z_BINARY = 0;
        var Z_TEXT = 1;
        var Z_UNKNOWN = 2;
        function zero(buf) {
          var len = buf.length;
          while (--len >= 0) {
            buf[len] = 0;
          }
        }
        var STORED_BLOCK = 0;
        var STATIC_TREES = 1;
        var DYN_TREES = 2;
        var MIN_MATCH = 3;
        var MAX_MATCH = 258;
        var LENGTH_CODES = 29;
        var LITERALS = 256;
        var L_CODES = LITERALS + 1 + LENGTH_CODES;
        var D_CODES = 30;
        var BL_CODES = 19;
        var HEAP_SIZE = 2 * L_CODES + 1;
        var MAX_BITS = 15;
        var Buf_size = 16;
        var MAX_BL_BITS = 7;
        var END_BLOCK = 256;
        var REP_3_6 = 16;
        var REPZ_3_10 = 17;
        var REPZ_11_138 = 18;
        var extra_lbits = [
          0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4,
          4, 5, 5, 5, 5, 0,
        ];
        var extra_dbits = [
          0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10,
          10, 11, 11, 12, 12, 13, 13,
        ];
        var extra_blbits = [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7,
        ];
        var bl_order = [
          16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
        ];
        var DIST_CODE_LEN = 512;
        var static_ltree = new Array((L_CODES + 2) * 2);
        zero(static_ltree);
        var static_dtree = new Array(D_CODES * 2);
        zero(static_dtree);
        var _dist_code = new Array(DIST_CODE_LEN);
        zero(_dist_code);
        var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
        zero(_length_code);
        var base_length = new Array(LENGTH_CODES);
        zero(base_length);
        var base_dist = new Array(D_CODES);
        zero(base_dist);
        var StaticTreeDesc = function (
          static_tree,
          extra_bits,
          extra_base,
          elems,
          max_length
        ) {
          this.static_tree = static_tree;
          this.extra_bits = extra_bits;
          this.extra_base = extra_base;
          this.elems = elems;
          this.max_length = max_length;
          this.has_stree = static_tree && static_tree.length;
        };
        var static_l_desc;
        var static_d_desc;
        var static_bl_desc;
        var TreeDesc = function (dyn_tree, stat_desc) {
          this.dyn_tree = dyn_tree;
          this.max_code = 0;
          this.stat_desc = stat_desc;
        };
        function d_code(dist) {
          return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
        }
        function put_short(s, w) {
          s.pending_buf[s.pending++] = w & 255;
          s.pending_buf[s.pending++] = (w >>> 8) & 255;
        }
        function send_bits(s, value, length) {
          if (s.bi_valid > Buf_size - length) {
            s.bi_buf |= (value << s.bi_valid) & 65535;
            put_short(s, s.bi_buf);
            s.bi_buf = value >> (Buf_size - s.bi_valid);
            s.bi_valid += length - Buf_size;
          } else {
            s.bi_buf |= (value << s.bi_valid) & 65535;
            s.bi_valid += length;
          }
        }
        function send_code(s, c, tree) {
          send_bits(s, tree[c * 2], tree[c * 2 + 1]);
        }
        function bi_reverse(code, len) {
          var res = 0;
          do {
            res |= code & 1;
            code >>>= 1;
            res <<= 1;
          } while (--len > 0);
          return res >>> 1;
        }
        function bi_flush(s) {
          if (s.bi_valid === 16) {
            put_short(s, s.bi_buf);
            s.bi_buf = 0;
            s.bi_valid = 0;
          } else if (s.bi_valid >= 8) {
            s.pending_buf[s.pending++] = s.bi_buf & 255;
            s.bi_buf >>= 8;
            s.bi_valid -= 8;
          }
        }
        function gen_bitlen(s, desc) {
          var tree = desc.dyn_tree;
          var max_code = desc.max_code;
          var stree = desc.stat_desc.static_tree;
          var has_stree = desc.stat_desc.has_stree;
          var extra = desc.stat_desc.extra_bits;
          var base = desc.stat_desc.extra_base;
          var max_length = desc.stat_desc.max_length;
          var h;
          var n, m;
          var bits;
          var xbits;
          var f;
          var overflow = 0;
          for (bits = 0; bits <= MAX_BITS; bits++) {
            s.bl_count[bits] = 0;
          }
          tree[s.heap[s.heap_max] * 2 + 1] = 0;
          for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
            n = s.heap[h];
            bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
            if (bits > max_length) {
              bits = max_length;
              overflow++;
            }
            tree[n * 2 + 1] = bits;
            if (n > max_code) {
              continue;
            }
            s.bl_count[bits]++;
            xbits = 0;
            if (n >= base) {
              xbits = extra[n - base];
            }
            f = tree[n * 2];
            s.opt_len += f * (bits + xbits);
            if (has_stree) {
              s.static_len += f * (stree[n * 2 + 1] + xbits);
            }
          }
          if (overflow === 0) {
            return;
          }
          do {
            bits = max_length - 1;
            while (s.bl_count[bits] === 0) {
              bits--;
            }
            s.bl_count[bits]--;
            s.bl_count[bits + 1] += 2;
            s.bl_count[max_length]--;
            overflow -= 2;
          } while (overflow > 0);
          for (bits = max_length; bits !== 0; bits--) {
            n = s.bl_count[bits];
            while (n !== 0) {
              m = s.heap[--h];
              if (m > max_code) {
                continue;
              }
              if (tree[m * 2 + 1] !== bits) {
                s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
                tree[m * 2 + 1] = bits;
              }
              n--;
            }
          }
        }
        function gen_codes(tree, max_code, bl_count) {
          var next_code = new Array(MAX_BITS + 1);
          var code = 0;
          var bits;
          var n;
          for (bits = 1; bits <= MAX_BITS; bits++) {
            next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
          }
          for (n = 0; n <= max_code; n++) {
            var len = tree[n * 2 + 1];
            if (len === 0) {
              continue;
            }
            tree[n * 2] = bi_reverse(next_code[len]++, len);
          }
        }
        function tr_static_init() {
          var n;
          var bits;
          var length;
          var code;
          var dist;
          var bl_count = new Array(MAX_BITS + 1);
          length = 0;
          for (code = 0; code < LENGTH_CODES - 1; code++) {
            base_length[code] = length;
            for (n = 0; n < 1 << extra_lbits[code]; n++) {
              _length_code[length++] = code;
            }
          }
          _length_code[length - 1] = code;
          dist = 0;
          for (code = 0; code < 16; code++) {
            base_dist[code] = dist;
            for (n = 0; n < 1 << extra_dbits[code]; n++) {
              _dist_code[dist++] = code;
            }
          }
          dist >>= 7;
          for (; code < D_CODES; code++) {
            base_dist[code] = dist << 7;
            for (n = 0; n < 1 << (extra_dbits[code] - 7); n++) {
              _dist_code[256 + dist++] = code;
            }
          }
          for (bits = 0; bits <= MAX_BITS; bits++) {
            bl_count[bits] = 0;
          }
          n = 0;
          while (n <= 143) {
            static_ltree[n * 2 + 1] = 8;
            n++;
            bl_count[8]++;
          }
          while (n <= 255) {
            static_ltree[n * 2 + 1] = 9;
            n++;
            bl_count[9]++;
          }
          while (n <= 279) {
            static_ltree[n * 2 + 1] = 7;
            n++;
            bl_count[7]++;
          }
          while (n <= 287) {
            static_ltree[n * 2 + 1] = 8;
            n++;
            bl_count[8]++;
          }
          gen_codes(static_ltree, L_CODES + 1, bl_count);
          for (n = 0; n < D_CODES; n++) {
            static_dtree[n * 2 + 1] = 5;
            static_dtree[n * 2] = bi_reverse(n, 5);
          }
          static_l_desc = new StaticTreeDesc(
            static_ltree,
            extra_lbits,
            LITERALS + 1,
            L_CODES,
            MAX_BITS
          );
          static_d_desc = new StaticTreeDesc(
            static_dtree,
            extra_dbits,
            0,
            D_CODES,
            MAX_BITS
          );
          static_bl_desc = new StaticTreeDesc(
            new Array(0),
            extra_blbits,
            0,
            BL_CODES,
            MAX_BL_BITS
          );
        }
        function init_block(s) {
          var n;
          for (n = 0; n < L_CODES; n++) {
            s.dyn_ltree[n * 2] = 0;
          }
          for (n = 0; n < D_CODES; n++) {
            s.dyn_dtree[n * 2] = 0;
          }
          for (n = 0; n < BL_CODES; n++) {
            s.bl_tree[n * 2] = 0;
          }
          s.dyn_ltree[END_BLOCK * 2] = 1;
          s.opt_len = s.static_len = 0;
          s.last_lit = s.matches = 0;
        }
        function bi_windup(s) {
          if (s.bi_valid > 8) {
            put_short(s, s.bi_buf);
          } else if (s.bi_valid > 0) {
            s.pending_buf[s.pending++] = s.bi_buf;
          }
          s.bi_buf = 0;
          s.bi_valid = 0;
        }
        function copy_block(s, buf, len, header) {
          bi_windup(s);
          if (header) {
            put_short(s, len);
            put_short(s, ~len);
          }
          utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
          s.pending += len;
        }
        function smaller(tree, n, m, depth) {
          var _n2 = n * 2;
          var _m2 = m * 2;
          return (
            tree[_n2] < tree[_m2] ||
            (tree[_n2] === tree[_m2] && depth[n] <= depth[m])
          );
        }
        function pqdownheap(s, tree, k) {
          var v = s.heap[k];
          var j = k << 1;
          while (j <= s.heap_len) {
            if (
              j < s.heap_len &&
              smaller(tree, s.heap[j + 1], s.heap[j], s.depth)
            ) {
              j++;
            }
            if (smaller(tree, v, s.heap[j], s.depth)) {
              break;
            }
            s.heap[k] = s.heap[j];
            k = j;
            j <<= 1;
          }
          s.heap[k] = v;
        }
        function compress_block(s, ltree, dtree) {
          var dist;
          var lc;
          var lx = 0;
          var code;
          var extra;
          if (s.last_lit !== 0) {
            do {
              dist =
                (s.pending_buf[s.d_buf + lx * 2] << 8) |
                s.pending_buf[s.d_buf + lx * 2 + 1];
              lc = s.pending_buf[s.l_buf + lx];
              lx++;
              if (dist === 0) {
                send_code(s, lc, ltree);
              } else {
                code = _length_code[lc];
                send_code(s, code + LITERALS + 1, ltree);
                extra = extra_lbits[code];
                if (extra !== 0) {
                  lc -= base_length[code];
                  send_bits(s, lc, extra);
                }
                dist--;
                code = d_code(dist);
                send_code(s, code, dtree);
                extra = extra_dbits[code];
                if (extra !== 0) {
                  dist -= base_dist[code];
                  send_bits(s, dist, extra);
                }
              }
            } while (lx < s.last_lit);
          }
          send_code(s, END_BLOCK, ltree);
        }
        function build_tree(s, desc) {
          var tree = desc.dyn_tree;
          var stree = desc.stat_desc.static_tree;
          var has_stree = desc.stat_desc.has_stree;
          var elems = desc.stat_desc.elems;
          var n, m;
          var max_code = -1;
          var node;
          s.heap_len = 0;
          s.heap_max = HEAP_SIZE;
          for (n = 0; n < elems; n++) {
            if (tree[n * 2] !== 0) {
              s.heap[++s.heap_len] = max_code = n;
              s.depth[n] = 0;
            } else {
              tree[n * 2 + 1] = 0;
            }
          }
          while (s.heap_len < 2) {
            node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
            tree[node * 2] = 1;
            s.depth[node] = 0;
            s.opt_len--;
            if (has_stree) {
              s.static_len -= stree[node * 2 + 1];
            }
          }
          desc.max_code = max_code;
          for (n = s.heap_len >> 1; n >= 1; n--) {
            pqdownheap(s, tree, n);
          }
          node = elems;
          do {
            n = s.heap[1];
            s.heap[1] = s.heap[s.heap_len--];
            pqdownheap(s, tree, 1);
            m = s.heap[1];
            s.heap[--s.heap_max] = n;
            s.heap[--s.heap_max] = m;
            tree[node * 2] = tree[n * 2] + tree[m * 2];
            s.depth[node] =
              (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
            tree[n * 2 + 1] = tree[m * 2 + 1] = node;
            s.heap[1] = node++;
            pqdownheap(s, tree, 1);
          } while (s.heap_len >= 2);
          s.heap[--s.heap_max] = s.heap[1];
          gen_bitlen(s, desc);
          gen_codes(tree, max_code, s.bl_count);
        }
        function scan_tree(s, tree, max_code) {
          var n;
          var prevlen = -1;
          var curlen;
          var nextlen = tree[0 * 2 + 1];
          var count = 0;
          var max_count = 7;
          var min_count = 4;
          if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
          }
          tree[(max_code + 1) * 2 + 1] = 65535;
          for (n = 0; n <= max_code; n++) {
            curlen = nextlen;
            nextlen = tree[(n + 1) * 2 + 1];
            if (++count < max_count && curlen === nextlen) {
              continue;
            } else if (count < min_count) {
              s.bl_tree[curlen * 2] += count;
            } else if (curlen !== 0) {
              if (curlen !== prevlen) {
                s.bl_tree[curlen * 2]++;
              }
              s.bl_tree[REP_3_6 * 2]++;
            } else if (count <= 10) {
              s.bl_tree[REPZ_3_10 * 2]++;
            } else {
              s.bl_tree[REPZ_11_138 * 2]++;
            }
            count = 0;
            prevlen = curlen;
            if (nextlen === 0) {
              max_count = 138;
              min_count = 3;
            } else if (curlen === nextlen) {
              max_count = 6;
              min_count = 3;
            } else {
              max_count = 7;
              min_count = 4;
            }
          }
        }
        function send_tree(s, tree, max_code) {
          var n;
          var prevlen = -1;
          var curlen;
          var nextlen = tree[0 * 2 + 1];
          var count = 0;
          var max_count = 7;
          var min_count = 4;
          if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
          }
          for (n = 0; n <= max_code; n++) {
            curlen = nextlen;
            nextlen = tree[(n + 1) * 2 + 1];
            if (++count < max_count && curlen === nextlen) {
              continue;
            } else if (count < min_count) {
              do {
                send_code(s, curlen, s.bl_tree);
              } while (--count !== 0);
            } else if (curlen !== 0) {
              if (curlen !== prevlen) {
                send_code(s, curlen, s.bl_tree);
                count--;
              }
              send_code(s, REP_3_6, s.bl_tree);
              send_bits(s, count - 3, 2);
            } else if (count <= 10) {
              send_code(s, REPZ_3_10, s.bl_tree);
              send_bits(s, count - 3, 3);
            } else {
              send_code(s, REPZ_11_138, s.bl_tree);
              send_bits(s, count - 11, 7);
            }
            count = 0;
            prevlen = curlen;
            if (nextlen === 0) {
              max_count = 138;
              min_count = 3;
            } else if (curlen === nextlen) {
              max_count = 6;
              min_count = 3;
            } else {
              max_count = 7;
              min_count = 4;
            }
          }
        }
        function build_bl_tree(s) {
          var max_blindex;
          scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
          scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
          build_tree(s, s.bl_desc);
          for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
            if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
              break;
            }
          }
          s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
          return max_blindex;
        }
        function send_all_trees(s, lcodes, dcodes, blcodes) {
          var rank;
          send_bits(s, lcodes - 257, 5);
          send_bits(s, dcodes - 1, 5);
          send_bits(s, blcodes - 4, 4);
          for (rank = 0; rank < blcodes; rank++) {
            send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1], 3);
          }
          send_tree(s, s.dyn_ltree, lcodes - 1);
          send_tree(s, s.dyn_dtree, dcodes - 1);
        }
        function detect_data_type(s) {
          var black_mask = 4093624447;
          var n;
          for (n = 0; n <= 31; n++, black_mask >>>= 1) {
            if (black_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
              return Z_BINARY;
            }
          }
          if (
            s.dyn_ltree[9 * 2] !== 0 ||
            s.dyn_ltree[10 * 2] !== 0 ||
            s.dyn_ltree[13 * 2] !== 0
          ) {
            return Z_TEXT;
          }
          for (n = 32; n < LITERALS; n++) {
            if (s.dyn_ltree[n * 2] !== 0) {
              return Z_TEXT;
            }
          }
          return Z_BINARY;
        }
        var static_init_done = false;
        function _tr_init(s) {
          if (!static_init_done) {
            tr_static_init();
            static_init_done = true;
          }
          s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
          s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
          s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
          s.bi_buf = 0;
          s.bi_valid = 0;
          init_block(s);
        }
        function _tr_stored_block(s, buf, stored_len, last) {
          send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
          copy_block(s, buf, stored_len, true);
        }
        function _tr_align(s) {
          send_bits(s, STATIC_TREES << 1, 3);
          send_code(s, END_BLOCK, static_ltree);
          bi_flush(s);
        }
        function _tr_flush_block(s, buf, stored_len, last) {
          var opt_lenb, static_lenb;
          var max_blindex = 0;
          if (s.level > 0) {
            if (s.strm.data_type === Z_UNKNOWN) {
              s.strm.data_type = detect_data_type(s);
            }
            build_tree(s, s.l_desc);
            build_tree(s, s.d_desc);
            max_blindex = build_bl_tree(s);
            opt_lenb = (s.opt_len + 3 + 7) >>> 3;
            static_lenb = (s.static_len + 3 + 7) >>> 3;
            if (static_lenb <= opt_lenb) {
              opt_lenb = static_lenb;
            }
          } else {
            opt_lenb = static_lenb = stored_len + 5;
          }
          if (stored_len + 4 <= opt_lenb && buf !== -1) {
            _tr_stored_block(s, buf, stored_len, last);
          } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {
            send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
            compress_block(s, static_ltree, static_dtree);
          } else {
            send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
            send_all_trees(
              s,
              s.l_desc.max_code + 1,
              s.d_desc.max_code + 1,
              max_blindex + 1
            );
            compress_block(s, s.dyn_ltree, s.dyn_dtree);
          }
          init_block(s);
          if (last) {
            bi_windup(s);
          }
        }
        function _tr_tally(s, dist, lc) {
          s.pending_buf[s.d_buf + s.last_lit * 2] = (dist >>> 8) & 255;
          s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 255;
          s.pending_buf[s.l_buf + s.last_lit] = lc & 255;
          s.last_lit++;
          if (dist === 0) {
            s.dyn_ltree[lc * 2]++;
          } else {
            s.matches++;
            dist--;
            s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++;
            s.dyn_dtree[d_code(dist) * 2]++;
          }
          return s.last_lit === s.lit_bufsize - 1;
        }
        exports._tr_init = _tr_init;
        exports._tr_stored_block = _tr_stored_block;
        exports._tr_flush_block = _tr_flush_block;
        exports._tr_tally = _tr_tally;
        exports._tr_align = _tr_align;
      },
      { "../utils/common": 11 },
    ],
    23: [
      function (require, module, exports) {
        "use strict";
        function ZStream() {
          this.input = null;
          this.next_in = 0;
          this.avail_in = 0;
          this.total_in = 0;
          this.output = null;
          this.next_out = 0;
          this.avail_out = 0;
          this.total_out = 0;
          this.msg = "";
          this.state = null;
          this.data_type = 2;
          this.adler = 0;
        }
        module.exports = ZStream;
      },
      {},
    ],
    24: [
      function (require, module, exports) {
        (function (Buffer) {
          "use strict";
          module.exports = unpackPNG;
          var ndarray = require("ndarray");
          var parse = require("pngparse-sync");
          function decodeB64(str) {
            return new Buffer(str, "base64");
          }
          function unpackPNG(w, h, c, str) {
            var pixels = parse(decodeB64(str));
            return ndarray(
              pixels.data,
              [h, w, pixels.channels],
              [pixels.channels * w, pixels.channels, 1],
              0
            );
          }
        }.call(this, require("buffer").Buffer));
      },
      { buffer: 1, ndarray: 5, "pngparse-sync": 7 },
    ],
    "baboon-image": [
      function (require, module, exports) {
        module.exports = require("ndpack-image")(
          512,
          512,
          4,
        );
      },
      { "ndpack-image": 24 },
    ],
  },
  {},
  []
);
require = (function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw ((f.code = "MODULE_NOT_FOUND"), f);
      }
      var l = (n[o] = { exports: {} });
      t[o][0].call(
        l.exports,
        function (e) {
          var n = t[o][1][e];
          return s(n ? n : e);
        },
        l,
        l.exports,
        e,
        t,
        n,
        r
      );
    }
    return n[o].exports;
  }
  var i = typeof require == "function" && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
})(
  {
    1: [
      function (require, module, exports) {
        var base64 = require("base64-js");
        var ieee754 = require("ieee754");
        var isArray = require("is-array");
        exports.Buffer = Buffer;
        exports.SlowBuffer = SlowBuffer;
        exports.INSPECT_MAX_BYTES = 50;
        Buffer.poolSize = 8192;
        var kMaxLength = 1073741823;
        var rootParent = {};
        Buffer.TYPED_ARRAY_SUPPORT = (function () {
          try {
            var buf = new ArrayBuffer(0);
            var arr = new Uint8Array(buf);
            arr.foo = function () {
              return 42;
            };
            return (
              42 === arr.foo() &&
              typeof arr.subarray === "function" &&
              new Uint8Array(1).subarray(1, 1).byteLength === 0
            );
          } catch (e) {
            return false;
          }
        })();
        function Buffer(subject, encoding, noZero) {
          if (!(this instanceof Buffer))
            return new Buffer(subject, encoding, noZero);
          var type = typeof subject;
          var length;
          if (type === "number") length = subject > 0 ? subject >>> 0 : 0;
          else if (type === "string") {
            length = Buffer.byteLength(subject, encoding);
          } else if (type === "object" && subject !== null) {
            if (subject.type === "Buffer" && isArray(subject.data))
              subject = subject.data;
            length = +subject.length > 0 ? Math.floor(+subject.length) : 0;
          } else
            throw new TypeError(
              "must start with number, buffer, array or string"
            );
          if (length > kMaxLength)
            throw new RangeError(
              "Attempt to allocate Buffer larger than maximum " +
                "size: 0x" +
                kMaxLength.toString(16) +
                " bytes"
            );
          var buf;
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            buf = Buffer._augment(new Uint8Array(length));
          } else {
            buf = this;
            buf.length = length;
            buf._isBuffer = true;
          }
          var i;
          if (
            Buffer.TYPED_ARRAY_SUPPORT &&
            typeof subject.byteLength === "number"
          ) {
            buf._set(subject);
          } else if (isArrayish(subject)) {
            if (Buffer.isBuffer(subject)) {
              for (i = 0; i < length; i++) buf[i] = subject.readUInt8(i);
            } else {
              for (i = 0; i < length; i++)
                buf[i] = ((subject[i] % 256) + 256) % 256;
            }
          } else if (type === "string") {
            buf.write(subject, 0, encoding);
          } else if (
            type === "number" &&
            !Buffer.TYPED_ARRAY_SUPPORT &&
            !noZero
          ) {
            for (i = 0; i < length; i++) {
              buf[i] = 0;
            }
          }
          if (length > 0 && length <= Buffer.poolSize) buf.parent = rootParent;
          return buf;
        }
        function SlowBuffer(subject, encoding, noZero) {
          if (!(this instanceof SlowBuffer))
            return new SlowBuffer(subject, encoding, noZero);
          var buf = new Buffer(subject, encoding, noZero);
          delete buf.parent;
          return buf;
        }
        Buffer.isBuffer = function (b) {
          return !!(b != null && b._isBuffer);
        };
        Buffer.compare = function (a, b) {
          if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
            throw new TypeError("Arguments must be Buffers");
          var x = a.length;
          var y = b.length;
          for (
            var i = 0, len = Math.min(x, y);
            i < len && a[i] === b[i];
            i++
          ) {}
          if (i !== len) {
            x = a[i];
            y = b[i];
          }
          if (x < y) return -1;
          if (y < x) return 1;
          return 0;
        };
        Buffer.isEncoding = function (encoding) {
          switch (String(encoding).toLowerCase()) {
            case "hex":
            case "utf8":
            case "utf-8":
            case "ascii":
            case "binary":
            case "base64":
            case "raw":
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return true;
            default:
              return false;
          }
        };
        Buffer.concat = function (list, totalLength) {
          if (!isArray(list))
            throw new TypeError("Usage: Buffer.concat(list[, length])");
          if (list.length === 0) {
            return new Buffer(0);
          } else if (list.length === 1) {
            return list[0];
          }
          var i;
          if (totalLength === undefined) {
            totalLength = 0;
            for (i = 0; i < list.length; i++) {
              totalLength += list[i].length;
            }
          }
          var buf = new Buffer(totalLength);
          var pos = 0;
          for (i = 0; i < list.length; i++) {
            var item = list[i];
            item.copy(buf, pos);
            pos += item.length;
          }
          return buf;
        };
        Buffer.byteLength = function (str, encoding) {
          var ret;
          str = str + "";
          switch (encoding || "utf8") {
            case "ascii":
            case "binary":
            case "raw":
              ret = str.length;
              break;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              ret = str.length * 2;
              break;
            case "hex":
              ret = str.length >>> 1;
              break;
            case "utf8":
            case "utf-8":
              ret = utf8ToBytes(str).length;
              break;
            case "base64":
              ret = base64ToBytes(str).length;
              break;
            default:
              ret = str.length;
          }
          return ret;
        };
        Buffer.prototype.length = undefined;
        Buffer.prototype.parent = undefined;
        Buffer.prototype.toString = function (encoding, start, end) {
          var loweredCase = false;
          start = start >>> 0;
          end = end === undefined || end === Infinity ? this.length : end >>> 0;
          if (!encoding) encoding = "utf8";
          if (start < 0) start = 0;
          if (end > this.length) end = this.length;
          if (end <= start) return "";
          while (true) {
            switch (encoding) {
              case "hex":
                return hexSlice(this, start, end);
              case "utf8":
              case "utf-8":
                return utf8Slice(this, start, end);
              case "ascii":
                return asciiSlice(this, start, end);
              case "binary":
                return binarySlice(this, start, end);
              case "base64":
                return base64Slice(this, start, end);
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
                return utf16leSlice(this, start, end);
              default:
                if (loweredCase)
                  throw new TypeError("Unknown encoding: " + encoding);
                encoding = (encoding + "").toLowerCase();
                loweredCase = true;
            }
          }
        };
        Buffer.prototype.equals = function (b) {
          if (!Buffer.isBuffer(b))
            throw new TypeError("Argument must be a Buffer");
          return Buffer.compare(this, b) === 0;
        };
        Buffer.prototype.inspect = function () {
          var str = "";
          var max = exports.INSPECT_MAX_BYTES;
          if (this.length > 0) {
            str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
            if (this.length > max) str += " ... ";
          }
          return "<Buffer " + str + ">";
        };
        Buffer.prototype.compare = function (b) {
          if (!Buffer.isBuffer(b))
            throw new TypeError("Argument must be a Buffer");
          return Buffer.compare(this, b);
        };
        Buffer.prototype.get = function (offset) {
          console.log(
            ".get() is deprecated. Access using array indexes instead."
          );
          return this.readUInt8(offset);
        };
        Buffer.prototype.set = function (v, offset) {
          console.log(
            ".set() is deprecated. Access using array indexes instead."
          );
          return this.writeUInt8(v, offset);
        };
        function hexWrite(buf, string, offset, length) {
          offset = Number(offset) || 0;
          var remaining = buf.length - offset;
          if (!length) {
            length = remaining;
          } else {
            length = Number(length);
            if (length > remaining) {
              length = remaining;
            }
          }
          var strLen = string.length;
          if (strLen % 2 !== 0) throw new Error("Invalid hex string");
          if (length > strLen / 2) {
            length = strLen / 2;
          }
          for (var i = 0; i < length; i++) {
            var byte = parseInt(string.substr(i * 2, 2), 16);
            if (isNaN(byte)) throw new Error("Invalid hex string");
            buf[offset + i] = byte;
          }
          return i;
        }
        function utf8Write(buf, string, offset, length) {
          var charsWritten = blitBuffer(
            utf8ToBytes(string, buf.length - offset),
            buf,
            offset,
            length
          );
          return charsWritten;
        }
        function asciiWrite(buf, string, offset, length) {
          var charsWritten = blitBuffer(
            asciiToBytes(string),
            buf,
            offset,
            length
          );
          return charsWritten;
        }
        function binaryWrite(buf, string, offset, length) {
          return asciiWrite(buf, string, offset, length);
        }
        function base64Write(buf, string, offset, length) {
          var charsWritten = blitBuffer(
            base64ToBytes(string),
            buf,
            offset,
            length
          );
          return charsWritten;
        }
        function utf16leWrite(buf, string, offset, length) {
          var charsWritten = blitBuffer(
            utf16leToBytes(string, buf.length - offset),
            buf,
            offset,
            length,
            2
          );
          return charsWritten;
        }
        Buffer.prototype.write = function (string, offset, length, encoding) {
          if (isFinite(offset)) {
            if (!isFinite(length)) {
              encoding = length;
              length = undefined;
            }
          } else {
            var swap = encoding;
            encoding = offset;
            offset = length;
            length = swap;
          }
          offset = Number(offset) || 0;
          if (length < 0 || offset < 0 || offset > this.length)
            throw new RangeError("attempt to write outside buffer bounds");
          var remaining = this.length - offset;
          if (!length) {
            length = remaining;
          } else {
            length = Number(length);
            if (length > remaining) {
              length = remaining;
            }
          }
          encoding = String(encoding || "utf8").toLowerCase();
          var ret;
          switch (encoding) {
            case "hex":
              ret = hexWrite(this, string, offset, length);
              break;
            case "utf8":
            case "utf-8":
              ret = utf8Write(this, string, offset, length);
              break;
            case "ascii":
              ret = asciiWrite(this, string, offset, length);
              break;
            case "binary":
              ret = binaryWrite(this, string, offset, length);
              break;
            case "base64":
              ret = base64Write(this, string, offset, length);
              break;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              ret = utf16leWrite(this, string, offset, length);
              break;
            default:
              throw new TypeError("Unknown encoding: " + encoding);
          }
          return ret;
        };
        Buffer.prototype.toJSON = function () {
          return {
            type: "Buffer",
            data: Array.prototype.slice.call(this._arr || this, 0),
          };
        };
        function base64Slice(buf, start, end) {
          if (start === 0 && end === buf.length) {
            return base64.fromByteArray(buf);
          } else {
            return base64.fromByteArray(buf.slice(start, end));
          }
        }
        function utf8Slice(buf, start, end) {
          var res = "";
          var tmp = "";
          end = Math.min(buf.length, end);
          for (var i = start; i < end; i++) {
            if (buf[i] <= 127) {
              res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i]);
              tmp = "";
            } else {
              tmp += "%" + buf[i].toString(16);
            }
          }
          return res + decodeUtf8Char(tmp);
        }
        function asciiSlice(buf, start, end) {
          var ret = "";
          end = Math.min(buf.length, end);
          for (var i = start; i < end; i++) {
            ret += String.fromCharCode(buf[i] & 127);
          }
          return ret;
        }
        function binarySlice(buf, start, end) {
          var ret = "";
          end = Math.min(buf.length, end);
          for (var i = start; i < end; i++) {
            ret += String.fromCharCode(buf[i]);
          }
          return ret;
        }
        function hexSlice(buf, start, end) {
          var len = buf.length;
          if (!start || start < 0) start = 0;
          if (!end || end < 0 || end > len) end = len;
          var out = "";
          for (var i = start; i < end; i++) {
            out += toHex(buf[i]);
          }
          return out;
        }
        function utf16leSlice(buf, start, end) {
          var bytes = buf.slice(start, end);
          var res = "";
          for (var i = 0; i < bytes.length; i += 2) {
            res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
          }
          return res;
        }
        Buffer.prototype.slice = function (start, end) {
          var len = this.length;
          start = ~~start;
          end = end === undefined ? len : ~~end;
          if (start < 0) {
            start += len;
            if (start < 0) start = 0;
          } else if (start > len) {
            start = len;
          }
          if (end < 0) {
            end += len;
            if (end < 0) end = 0;
          } else if (end > len) {
            end = len;
          }
          if (end < start) end = start;
          var newBuf;
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            newBuf = Buffer._augment(this.subarray(start, end));
          } else {
            var sliceLen = end - start;
            newBuf = new Buffer(sliceLen, undefined, true);
            for (var i = 0; i < sliceLen; i++) {
              newBuf[i] = this[i + start];
            }
          }
          if (newBuf.length) newBuf.parent = this.parent || this;
          return newBuf;
        };
        function checkOffset(offset, ext, length) {
          if (offset % 1 !== 0 || offset < 0)
            throw new RangeError("offset is not uint");
          if (offset + ext > length)
            throw new RangeError("Trying to access beyond buffer length");
        }
        Buffer.prototype.readUIntLE = function (offset, byteLength, noAssert) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);
          var val = this[offset];
          var mul = 1;
          var i = 0;
          while (++i < byteLength && (mul *= 256))
            val += this[offset + i] * mul;
          return val;
        };
        Buffer.prototype.readUIntBE = function (offset, byteLength, noAssert) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);
          var val = this[offset + --byteLength];
          var mul = 1;
          while (byteLength > 0 && (mul *= 256))
            val += this[offset + --byteLength] * mul;
          return val;
        };
        Buffer.prototype.readUInt8 = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 1, this.length);
          return this[offset];
        };
        Buffer.prototype.readUInt16LE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 2, this.length);
          return this[offset] | (this[offset + 1] << 8);
        };
        Buffer.prototype.readUInt16BE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 2, this.length);
          return (this[offset] << 8) | this[offset + 1];
        };
        Buffer.prototype.readUInt32LE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return (
            (this[offset] |
              (this[offset + 1] << 8) |
              (this[offset + 2] << 16)) +
            this[offset + 3] * 16777216
          );
        };
        Buffer.prototype.readUInt32BE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return (
            this[offset] * 16777216 +
            ((this[offset + 1] << 16) |
              (this[offset + 2] << 8) |
              this[offset + 3])
          );
        };
        Buffer.prototype.readIntLE = function (offset, byteLength, noAssert) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);
          var val = this[offset];
          var mul = 1;
          var i = 0;
          while (++i < byteLength && (mul *= 256))
            val += this[offset + i] * mul;
          mul *= 128;
          if (val >= mul) val -= Math.pow(2, 8 * byteLength);
          return val;
        };
        Buffer.prototype.readIntBE = function (offset, byteLength, noAssert) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);
          var i = byteLength;
          var mul = 1;
          var val = this[offset + --i];
          while (i > 0 && (mul *= 256)) val += this[offset + --i] * mul;
          mul *= 128;
          if (val >= mul) val -= Math.pow(2, 8 * byteLength);
          return val;
        };
        Buffer.prototype.readInt8 = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 1, this.length);
          if (!(this[offset] & 128)) return this[offset];
          return (255 - this[offset] + 1) * -1;
        };
        Buffer.prototype.readInt16LE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 2, this.length);
          var val = this[offset] | (this[offset + 1] << 8);
          return val & 32768 ? val | 4294901760 : val;
        };
        Buffer.prototype.readInt16BE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 2, this.length);
          var val = this[offset + 1] | (this[offset] << 8);
          return val & 32768 ? val | 4294901760 : val;
        };
        Buffer.prototype.readInt32LE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return (
            this[offset] |
            (this[offset + 1] << 8) |
            (this[offset + 2] << 16) |
            (this[offset + 3] << 24)
          );
        };
        Buffer.prototype.readInt32BE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return (
            (this[offset] << 24) |
            (this[offset + 1] << 16) |
            (this[offset + 2] << 8) |
            this[offset + 3]
          );
        };
        Buffer.prototype.readFloatLE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return ieee754.read(this, offset, true, 23, 4);
        };
        Buffer.prototype.readFloatBE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return ieee754.read(this, offset, false, 23, 4);
        };
        Buffer.prototype.readDoubleLE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 8, this.length);
          return ieee754.read(this, offset, true, 52, 8);
        };
        Buffer.prototype.readDoubleBE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 8, this.length);
          return ieee754.read(this, offset, false, 52, 8);
        };
        function checkInt(buf, value, offset, ext, max, min) {
          if (!Buffer.isBuffer(buf))
            throw new TypeError("buffer must be a Buffer instance");
          if (value > max || value < min)
            throw new RangeError("value is out of bounds");
          if (offset + ext > buf.length)
            throw new RangeError("index out of range");
        }
        Buffer.prototype.writeUIntLE = function (
          value,
          offset,
          byteLength,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert)
            checkInt(
              this,
              value,
              offset,
              byteLength,
              Math.pow(2, 8 * byteLength),
              0
            );
          var mul = 1;
          var i = 0;
          this[offset] = value & 255;
          while (++i < byteLength && (mul *= 256))
            this[offset + i] = ((value / mul) >>> 0) & 255;
          return offset + byteLength;
        };
        Buffer.prototype.writeUIntBE = function (
          value,
          offset,
          byteLength,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert)
            checkInt(
              this,
              value,
              offset,
              byteLength,
              Math.pow(2, 8 * byteLength),
              0
            );
          var i = byteLength - 1;
          var mul = 1;
          this[offset + i] = value & 255;
          while (--i >= 0 && (mul *= 256))
            this[offset + i] = ((value / mul) >>> 0) & 255;
          return offset + byteLength;
        };
        Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
          if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
          this[offset] = value;
          return offset + 1;
        };
        function objectWriteUInt16(buf, value, offset, littleEndian) {
          if (value < 0) value = 65535 + value + 1;
          for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
            buf[offset + i] =
              (value & (255 << (8 * (littleEndian ? i : 1 - i)))) >>>
              ((littleEndian ? i : 1 - i) * 8);
          }
        }
        Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value;
            this[offset + 1] = value >>> 8;
          } else objectWriteUInt16(this, value, offset, true);
          return offset + 2;
        };
        Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value >>> 8;
            this[offset + 1] = value;
          } else objectWriteUInt16(this, value, offset, false);
          return offset + 2;
        };
        function objectWriteUInt32(buf, value, offset, littleEndian) {
          if (value < 0) value = 4294967295 + value + 1;
          for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
            buf[offset + i] =
              (value >>> ((littleEndian ? i : 3 - i) * 8)) & 255;
          }
        }
        Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset + 3] = value >>> 24;
            this[offset + 2] = value >>> 16;
            this[offset + 1] = value >>> 8;
            this[offset] = value;
          } else objectWriteUInt32(this, value, offset, true);
          return offset + 4;
        };
        Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value >>> 24;
            this[offset + 1] = value >>> 16;
            this[offset + 2] = value >>> 8;
            this[offset + 3] = value;
          } else objectWriteUInt32(this, value, offset, false);
          return offset + 4;
        };
        Buffer.prototype.writeIntLE = function (
          value,
          offset,
          byteLength,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) {
            checkInt(
              this,
              value,
              offset,
              byteLength,
              Math.pow(2, 8 * byteLength - 1) - 1,
              -Math.pow(2, 8 * byteLength - 1)
            );
          }
          var i = 0;
          var mul = 1;
          var sub = value < 0 ? 1 : 0;
          this[offset] = value & 255;
          while (++i < byteLength && (mul *= 256))
            this[offset + i] = (((value / mul) >> 0) - sub) & 255;
          return offset + byteLength;
        };
        Buffer.prototype.writeIntBE = function (
          value,
          offset,
          byteLength,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) {
            checkInt(
              this,
              value,
              offset,
              byteLength,
              Math.pow(2, 8 * byteLength - 1) - 1,
              -Math.pow(2, 8 * byteLength - 1)
            );
          }
          var i = byteLength - 1;
          var mul = 1;
          var sub = value < 0 ? 1 : 0;
          this[offset + i] = value & 255;
          while (--i >= 0 && (mul *= 256))
            this[offset + i] = (((value / mul) >> 0) - sub) & 255;
          return offset + byteLength;
        };
        Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
          if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
          if (value < 0) value = 255 + value + 1;
          this[offset] = value;
          return offset + 1;
        };
        Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value;
            this[offset + 1] = value >>> 8;
          } else objectWriteUInt16(this, value, offset, true);
          return offset + 2;
        };
        Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value >>> 8;
            this[offset + 1] = value;
          } else objectWriteUInt16(this, value, offset, false);
          return offset + 2;
        };
        Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert)
            checkInt(this, value, offset, 4, 2147483647, -2147483648);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value;
            this[offset + 1] = value >>> 8;
            this[offset + 2] = value >>> 16;
            this[offset + 3] = value >>> 24;
          } else objectWriteUInt32(this, value, offset, true);
          return offset + 4;
        };
        Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert)
            checkInt(this, value, offset, 4, 2147483647, -2147483648);
          if (value < 0) value = 4294967295 + value + 1;
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value >>> 24;
            this[offset + 1] = value >>> 16;
            this[offset + 2] = value >>> 8;
            this[offset + 3] = value;
          } else objectWriteUInt32(this, value, offset, false);
          return offset + 4;
        };
        function checkIEEE754(buf, value, offset, ext, max, min) {
          if (value > max || value < min)
            throw new RangeError("value is out of bounds");
          if (offset + ext > buf.length)
            throw new RangeError("index out of range");
          if (offset < 0) throw new RangeError("index out of range");
        }
        function writeFloat(buf, value, offset, littleEndian, noAssert) {
          if (!noAssert)
            checkIEEE754(
              buf,
              value,
              offset,
              4,
              3.4028234663852886e38,
              -3.4028234663852886e38
            );
          ieee754.write(buf, value, offset, littleEndian, 23, 4);
          return offset + 4;
        }
        Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
          return writeFloat(this, value, offset, true, noAssert);
        };
        Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
          return writeFloat(this, value, offset, false, noAssert);
        };
        function writeDouble(buf, value, offset, littleEndian, noAssert) {
          if (!noAssert)
            checkIEEE754(
              buf,
              value,
              offset,
              8,
              1.7976931348623157e308,
              -1.7976931348623157e308
            );
          ieee754.write(buf, value, offset, littleEndian, 52, 8);
          return offset + 8;
        }
        Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
          return writeDouble(this, value, offset, true, noAssert);
        };
        Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
          return writeDouble(this, value, offset, false, noAssert);
        };
        Buffer.prototype.copy = function (target, target_start, start, end) {
          var source = this;
          if (!start) start = 0;
          if (!end && end !== 0) end = this.length;
          if (target_start >= target.length) target_start = target.length;
          if (!target_start) target_start = 0;
          if (end > 0 && end < start) end = start;
          if (end === start) return 0;
          if (target.length === 0 || source.length === 0) return 0;
          if (target_start < 0)
            throw new RangeError("targetStart out of bounds");
          if (start < 0 || start >= source.length)
            throw new RangeError("sourceStart out of bounds");
          if (end < 0) throw new RangeError("sourceEnd out of bounds");
          if (end > this.length) end = this.length;
          if (target.length - target_start < end - start)
            end = target.length - target_start + start;
          var len = end - start;
          if (len < 1e3 || !Buffer.TYPED_ARRAY_SUPPORT) {
            for (var i = 0; i < len; i++) {
              target[i + target_start] = this[i + start];
            }
          } else {
            target._set(this.subarray(start, start + len), target_start);
          }
          return len;
        };
        Buffer.prototype.fill = function (value, start, end) {
          if (!value) value = 0;
          if (!start) start = 0;
          if (!end) end = this.length;
          if (end < start) throw new RangeError("end < start");
          if (end === start) return;
          if (this.length === 0) return;
          if (start < 0 || start >= this.length)
            throw new RangeError("start out of bounds");
          if (end < 0 || end > this.length)
            throw new RangeError("end out of bounds");
          var i;
          if (typeof value === "number") {
            for (i = start; i < end; i++) {
              this[i] = value;
            }
          } else {
            var bytes = utf8ToBytes(value.toString());
            var len = bytes.length;
            for (i = start; i < end; i++) {
              this[i] = bytes[i % len];
            }
          }
          return this;
        };
        Buffer.prototype.toArrayBuffer = function () {
          if (typeof Uint8Array !== "undefined") {
            if (Buffer.TYPED_ARRAY_SUPPORT) {
              return new Buffer(this).buffer;
            } else {
              var buf = new Uint8Array(this.length);
              for (var i = 0, len = buf.length; i < len; i += 1) {
                buf[i] = this[i];
              }
              return buf.buffer;
            }
          } else {
            throw new TypeError(
              "Buffer.toArrayBuffer not supported in this browser"
            );
          }
        };
        var BP = Buffer.prototype;
        Buffer._augment = function (arr) {
          arr.constructor = Buffer;
          arr._isBuffer = true;
          arr._get = arr.get;
          arr._set = arr.set;
          arr.get = BP.get;
          arr.set = BP.set;
          arr.write = BP.write;
          arr.toString = BP.toString;
          arr.toLocaleString = BP.toString;
          arr.toJSON = BP.toJSON;
          arr.equals = BP.equals;
          arr.compare = BP.compare;
          arr.copy = BP.copy;
          arr.slice = BP.slice;
          arr.readUIntLE = BP.readUIntLE;
          arr.readUIntBE = BP.readUIntBE;
          arr.readUInt8 = BP.readUInt8;
          arr.readUInt16LE = BP.readUInt16LE;
          arr.readUInt16BE = BP.readUInt16BE;
          arr.readUInt32LE = BP.readUInt32LE;
          arr.readUInt32BE = BP.readUInt32BE;
          arr.readIntLE = BP.readIntLE;
          arr.readIntBE = BP.readIntBE;
          arr.readInt8 = BP.readInt8;
          arr.readInt16LE = BP.readInt16LE;
          arr.readInt16BE = BP.readInt16BE;
          arr.readInt32LE = BP.readInt32LE;
          arr.readInt32BE = BP.readInt32BE;
          arr.readFloatLE = BP.readFloatLE;
          arr.readFloatBE = BP.readFloatBE;
          arr.readDoubleLE = BP.readDoubleLE;
          arr.readDoubleBE = BP.readDoubleBE;
          arr.writeUInt8 = BP.writeUInt8;
          arr.writeUIntLE = BP.writeUIntLE;
          arr.writeUIntBE = BP.writeUIntBE;
          arr.writeUInt16LE = BP.writeUInt16LE;
          arr.writeUInt16BE = BP.writeUInt16BE;
          arr.writeUInt32LE = BP.writeUInt32LE;
          arr.writeUInt32BE = BP.writeUInt32BE;
          arr.writeIntLE = BP.writeIntLE;
          arr.writeIntBE = BP.writeIntBE;
          arr.writeInt8 = BP.writeInt8;
          arr.writeInt16LE = BP.writeInt16LE;
          arr.writeInt16BE = BP.writeInt16BE;
          arr.writeInt32LE = BP.writeInt32LE;
          arr.writeInt32BE = BP.writeInt32BE;
          arr.writeFloatLE = BP.writeFloatLE;
          arr.writeFloatBE = BP.writeFloatBE;
          arr.writeDoubleLE = BP.writeDoubleLE;
          arr.writeDoubleBE = BP.writeDoubleBE;
          arr.fill = BP.fill;
          arr.inspect = BP.inspect;
          arr.toArrayBuffer = BP.toArrayBuffer;
          return arr;
        };
        var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g;
        function base64clean(str) {
          str = stringtrim(str).replace(INVALID_BASE64_RE, "");
          if (str.length < 2) return "";
          while (str.length % 4 !== 0) {
            str = str + "=";
          }
          return str;
        }
        function stringtrim(str) {
          if (str.trim) return str.trim();
          return str.replace(/^\s+|\s+$/g, "");
        }
        function isArrayish(subject) {
          return (
            isArray(subject) ||
            Buffer.isBuffer(subject) ||
            (subject &&
              typeof subject === "object" &&
              typeof subject.length === "number")
          );
        }
        function toHex(n) {
          if (n < 16) return "0" + n.toString(16);
          return n.toString(16);
        }
        function utf8ToBytes(string, units) {
          var codePoint,
            length = string.length;
          var leadSurrogate = null;
          units = units || Infinity;
          var bytes = [];
          var i = 0;
          for (; i < length; i++) {
            codePoint = string.charCodeAt(i);
            if (codePoint > 55295 && codePoint < 57344) {
              if (leadSurrogate) {
                if (codePoint < 56320) {
                  if ((units -= 3) > -1) bytes.push(239, 191, 189);
                  leadSurrogate = codePoint;
                  continue;
                } else {
                  codePoint =
                    ((leadSurrogate - 55296) << 10) |
                    (codePoint - 56320) |
                    65536;
                  leadSurrogate = null;
                }
              } else {
                if (codePoint > 56319) {
                  if ((units -= 3) > -1) bytes.push(239, 191, 189);
                  continue;
                } else if (i + 1 === length) {
                  if ((units -= 3) > -1) bytes.push(239, 191, 189);
                  continue;
                } else {
                  leadSurrogate = codePoint;
                  continue;
                }
              }
            } else if (leadSurrogate) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              leadSurrogate = null;
            }
            if (codePoint < 128) {
              if ((units -= 1) < 0) break;
              bytes.push(codePoint);
            } else if (codePoint < 2048) {
              if ((units -= 2) < 0) break;
              bytes.push((codePoint >> 6) | 192, (codePoint & 63) | 128);
            } else if (codePoint < 65536) {
              if ((units -= 3) < 0) break;
              bytes.push(
                (codePoint >> 12) | 224,
                ((codePoint >> 6) & 63) | 128,
                (codePoint & 63) | 128
              );
            } else if (codePoint < 2097152) {
              if ((units -= 4) < 0) break;
              bytes.push(
                (codePoint >> 18) | 240,
                ((codePoint >> 12) & 63) | 128,
                ((codePoint >> 6) & 63) | 128,
                (codePoint & 63) | 128
              );
            } else {
              throw new Error("Invalid code point");
            }
          }
          return bytes;
        }
        function asciiToBytes(str) {
          var byteArray = [];
          for (var i = 0; i < str.length; i++) {
            byteArray.push(str.charCodeAt(i) & 255);
          }
          return byteArray;
        }
        function utf16leToBytes(str, units) {
          var c, hi, lo;
          var byteArray = [];
          for (var i = 0; i < str.length; i++) {
            if ((units -= 2) < 0) break;
            c = str.charCodeAt(i);
            hi = c >> 8;
            lo = c % 256;
            byteArray.push(lo);
            byteArray.push(hi);
          }
          return byteArray;
        }
        function base64ToBytes(str) {
          return base64.toByteArray(base64clean(str));
        }
        function blitBuffer(src, dst, offset, length, unitSize) {
          if (unitSize) length -= length % unitSize;
          for (var i = 0; i < length; i++) {
            if (i + offset >= dst.length || i >= src.length) break;
            dst[i + offset] = src[i];
          }
          return i;
        }
        function decodeUtf8Char(str) {
          try {
            return decodeURIComponent(str);
          } catch (err) {
            return String.fromCharCode(65533);
          }
        }
      },
      { "base64-js": 2, ieee754: 3, "is-array": 4 },
    ],
    2: [
      function (require, module, exports) {
        var lookup =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        (function (exports) {
          "use strict";
          var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
          var PLUS = "+".charCodeAt(0);
          var SLASH = "/".charCodeAt(0);
          var NUMBER = "0".charCodeAt(0);
          var LOWER = "a".charCodeAt(0);
          var UPPER = "A".charCodeAt(0);
          var PLUS_URL_SAFE = "-".charCodeAt(0);
          var SLASH_URL_SAFE = "_".charCodeAt(0);
          function decode(elt) {
            var code = elt.charCodeAt(0);
            if (code === PLUS || code === PLUS_URL_SAFE) return 62;
            if (code === SLASH || code === SLASH_URL_SAFE) return 63;
            if (code < NUMBER) return -1;
            if (code < NUMBER + 10) return code - NUMBER + 26 + 26;
            if (code < UPPER + 26) return code - UPPER;
            if (code < LOWER + 26) return code - LOWER + 26;
          }
          function b64ToByteArray(b64) {
            var i, j, l, tmp, placeHolders, arr;
            if (b64.length % 4 > 0) {
              throw new Error("Invalid string. Length must be a multiple of 4");
            }
            var len = b64.length;
            placeHolders =
              "=" === b64.charAt(len - 2)
                ? 2
                : "=" === b64.charAt(len - 1)
                ? 1
                : 0;
            arr = new Arr((b64.length * 3) / 4 - placeHolders);
            l = placeHolders > 0 ? b64.length - 4 : b64.length;
            var L = 0;
            function push(v) {
              arr[L++] = v;
            }
            for (i = 0, j = 0; i < l; i += 4, j += 3) {
              tmp =
                (decode(b64.charAt(i)) << 18) |
                (decode(b64.charAt(i + 1)) << 12) |
                (decode(b64.charAt(i + 2)) << 6) |
                decode(b64.charAt(i + 3));
              push((tmp & 16711680) >> 16);
              push((tmp & 65280) >> 8);
              push(tmp & 255);
            }
            if (placeHolders === 2) {
              tmp =
                (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4);
              push(tmp & 255);
            } else if (placeHolders === 1) {
              tmp =
                (decode(b64.charAt(i)) << 10) |
                (decode(b64.charAt(i + 1)) << 4) |
                (decode(b64.charAt(i + 2)) >> 2);
              push((tmp >> 8) & 255);
              push(tmp & 255);
            }
            return arr;
          }
          function uint8ToBase64(uint8) {
            var i,
              extraBytes = uint8.length % 3,
              output = "",
              temp,
              length;
            function encode(num) {
              return lookup.charAt(num);
            }
            function tripletToBase64(num) {
              return (
                encode((num >> 18) & 63) +
                encode((num >> 12) & 63) +
                encode((num >> 6) & 63) +
                encode(num & 63)
              );
            }
            for (
              i = 0, length = uint8.length - extraBytes;
              i < length;
              i += 3
            ) {
              temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
              output += tripletToBase64(temp);
            }
            switch (extraBytes) {
              case 1:
                temp = uint8[uint8.length - 1];
                output += encode(temp >> 2);
                output += encode((temp << 4) & 63);
                output += "==";
                break;
              case 2:
                temp = (uint8[uint8.length - 2] << 8) + uint8[uint8.length - 1];
                output += encode(temp >> 10);
                output += encode((temp >> 4) & 63);
                output += encode((temp << 2) & 63);
                output += "=";
                break;
            }
            return output;
          }
          exports.toByteArray = b64ToByteArray;
          exports.fromByteArray = uint8ToBase64;
        })(typeof exports === "undefined" ? (this.base64js = {}) : exports);
      },
      {},
    ],
    3: [
      function (require, module, exports) {
        exports.read = function (buffer, offset, isLE, mLen, nBytes) {
          var e,
            m,
            eLen = nBytes * 8 - mLen - 1,
            eMax = (1 << eLen) - 1,
            eBias = eMax >> 1,
            nBits = -7,
            i = isLE ? nBytes - 1 : 0,
            d = isLE ? -1 : 1,
            s = buffer[offset + i];
          i += d;
          e = s & ((1 << -nBits) - 1);
          s >>= -nBits;
          nBits += eLen;
          for (
            ;
            nBits > 0;
            e = e * 256 + buffer[offset + i], i += d, nBits -= 8
          );
          m = e & ((1 << -nBits) - 1);
          e >>= -nBits;
          nBits += mLen;
          for (
            ;
            nBits > 0;
            m = m * 256 + buffer[offset + i], i += d, nBits -= 8
          );
          if (e === 0) {
            e = 1 - eBias;
          } else if (e === eMax) {
            return m ? NaN : (s ? -1 : 1) * Infinity;
          } else {
            m = m + Math.pow(2, mLen);
            e = e - eBias;
          }
          return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
        };
        exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
          var e,
            m,
            c,
            eLen = nBytes * 8 - mLen - 1,
            eMax = (1 << eLen) - 1,
            eBias = eMax >> 1,
            rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
            i = isLE ? 0 : nBytes - 1,
            d = isLE ? 1 : -1,
            s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;
          value = Math.abs(value);
          if (isNaN(value) || value === Infinity) {
            m = isNaN(value) ? 1 : 0;
            e = eMax;
          } else {
            e = Math.floor(Math.log(value) / Math.LN2);
            if (value * (c = Math.pow(2, -e)) < 1) {
              e--;
              c *= 2;
            }
            if (e + eBias >= 1) {
              value += rt / c;
            } else {
              value += rt * Math.pow(2, 1 - eBias);
            }
            if (value * c >= 2) {
              e++;
              c /= 2;
            }
            if (e + eBias >= eMax) {
              m = 0;
              e = eMax;
            } else if (e + eBias >= 1) {
              m = (value * c - 1) * Math.pow(2, mLen);
              e = e + eBias;
            } else {
              m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
              e = 0;
            }
          }
          for (
            ;
            mLen >= 8;
            buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8
          );
          e = (e << mLen) | m;
          eLen += mLen;
          for (
            ;
            eLen > 0;
            buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8
          );
          buffer[offset + i - d] |= s * 128;
        };
      },
      {},
    ],
    4: [
      function (require, module, exports) {
        var isArray = Array.isArray;
        var str = Object.prototype.toString;
        module.exports =
          isArray ||
          function (val) {
            return !!val && "[object Array]" == str.call(val);
          };
      },
      {},
    ],
    5: [
      function (require, module, exports) {
        (function (exports) {
          "use strict";
          var lookup =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
          function b64ToByteArray(b64) {
            var i, j, l, tmp, placeHolders, arr;
            if (b64.length % 4 > 0) {
              throw "Invalid string. Length must be a multiple of 4";
            }
            placeHolders = b64.indexOf("=");
            placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;
            arr = [];
            l = placeHolders > 0 ? b64.length - 4 : b64.length;
            for (i = 0, j = 0; i < l; i += 4, j += 3) {
              tmp =
                (lookup.indexOf(b64[i]) << 18) |
                (lookup.indexOf(b64[i + 1]) << 12) |
                (lookup.indexOf(b64[i + 2]) << 6) |
                lookup.indexOf(b64[i + 3]);
              arr.push((tmp & 16711680) >> 16);
              arr.push((tmp & 65280) >> 8);
              arr.push(tmp & 255);
            }
            if (placeHolders === 2) {
              tmp =
                (lookup.indexOf(b64[i]) << 2) |
                (lookup.indexOf(b64[i + 1]) >> 4);
              arr.push(tmp & 255);
            } else if (placeHolders === 1) {
              tmp =
                (lookup.indexOf(b64[i]) << 10) |
                (lookup.indexOf(b64[i + 1]) << 4) |
                (lookup.indexOf(b64[i + 2]) >> 2);
              arr.push((tmp >> 8) & 255);
              arr.push(tmp & 255);
            }
            return arr;
          }
          function uint8ToBase64(uint8) {
            var i,
              extraBytes = uint8.length % 3,
              output = "",
              temp,
              length;
            function tripletToBase64(num) {
              return (
                lookup[(num >> 18) & 63] +
                lookup[(num >> 12) & 63] +
                lookup[(num >> 6) & 63] +
                lookup[num & 63]
              );
            }
            for (
              i = 0, length = uint8.length - extraBytes;
              i < length;
              i += 3
            ) {
              temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
              output += tripletToBase64(temp);
            }
            switch (extraBytes) {
              case 1:
                temp = uint8[uint8.length - 1];
                output += lookup[temp >> 2];
                output += lookup[(temp << 4) & 63];
                output += "==";
                break;
              case 2:
                temp = (uint8[uint8.length - 2] << 8) + uint8[uint8.length - 1];
                output += lookup[temp >> 10];
                output += lookup[(temp >> 4) & 63];
                output += lookup[(temp << 2) & 63];
                output += "=";
                break;
            }
            return output;
          }
          module.exports.toByteArray = b64ToByteArray;
          module.exports.fromByteArray = uint8ToBase64;
        })();
      },
      {},
    ],
    6: [
      function (require, module, exports) {
        (function (Buffer) {
          var iota = require("iota-array");
          var hasTypedArrays = typeof Float64Array !== "undefined";
          var hasBuffer = typeof Buffer !== "undefined";
          function compare1st(a, b) {
            return a[0] - b[0];
          }
          function order() {
            var stride = this.stride;
            var terms = new Array(stride.length);
            var i;
            for (i = 0; i < terms.length; ++i) {
              terms[i] = [Math.abs(stride[i]), i];
            }
            terms.sort(compare1st);
            var result = new Array(terms.length);
            for (i = 0; i < result.length; ++i) {
              result[i] = terms[i][1];
            }
            return result;
          }
          function compileConstructor(dtype, dimension) {
            var className = ["View", dimension, "d", dtype].join("");
            if (dimension < 0) {
              className = "View_Nil" + dtype;
            }
            var useGetters = dtype === "generic";
            if (dimension === -1) {
              var code =
                "function " +
                className +
                "(a){this.data=a;};var proto=" +
                className +
                ".prototype;proto.dtype='" +
                dtype +
                "';proto.index=function(){return -1};proto.size=0;proto.dimension=-1;proto.shape=proto.stride=proto.order=[];proto.lo=proto.hi=proto.transpose=proto.step=function(){return new " +
                className +
                "(this.data);};proto.get=proto.set=function(){};proto.pick=function(){return null};return function construct_" +
                className +
                "(a){return new " +
                className +
                "(a);}";
              var procedure = new Function(code);
              return procedure();
            } else if (dimension === 0) {
              var code =
                "function " +
                className +
                "(a,d) {this.data = a;this.offset = d};var proto=" +
                className +
                ".prototype;proto.dtype='" +
                dtype +
                "';proto.index=function(){return this.offset};proto.dimension=0;proto.size=1;proto.shape=proto.stride=proto.order=[];proto.lo=proto.hi=proto.transpose=proto.step=function " +
                className +
                "_copy() {return new " +
                className +
                "(this.data,this.offset)};proto.pick=function " +
                className +
                "_pick(){return TrivialArray(this.data);};proto.valueOf=proto.get=function " +
                className +
                "_get(){return " +
                (useGetters
                  ? "this.data.get(this.offset)"
                  : "this.data[this.offset]") +
                "};proto.set=function " +
                className +
                "_set(v){return " +
                (useGetters
                  ? "this.data.set(this.offset,v)"
                  : "this.data[this.offset]=v") +
                "};return function construct_" +
                className +
                "(a,b,c,d){return new " +
                className +
                "(a,d)}";

              var procedure = new Function("TrivialArray", code);
              return procedure(CACHED_CONSTRUCTORS[dtype][0]);
            }
            var code = ["'use strict'"];
            var indices = iota(dimension);
            var args = indices.map(function (i) {
              return "i" + i;
            });
            var index_str =
              "this.offset+" +
              indices
                .map(function (i) {
                  return "this.stride[" + i + "]*i" + i;
                })
                .join("+");
            var shapeArg = indices
              .map(function (i) {
                return "b" + i;
              })
              .join(",");
            var strideArg = indices
              .map(function (i) {
                return "c" + i;
              })
              .join(",");
            code.push(
              "function " +
                className +
                "(a," +
                shapeArg +
                "," +
                strideArg +
                ",d){this.data=a",
              "this.shape=[" + shapeArg + "]",
              "this.stride=[" + strideArg + "]",
              "this.offset=d|0}",
              "var proto=" + className + ".prototype",
              "proto.dtype='" + dtype + "'",
              "proto.dimension=" + dimension
            );
            code.push(
              "Object.defineProperty(proto,'size',{get:function " +
                className +
                "_size(){return " +
                indices
                  .map(function (i) {
                    return "this.shape[" + i + "]";
                  })
                  .join("*"),
              "}})"
            );
            if (dimension === 1) {
              code.push("proto.order=[0]");
            } else {
              code.push("Object.defineProperty(proto,'order',{get:");
              if (dimension < 4) {
                code.push("function " + className + "_order(){");
                if (dimension === 2) {
                  code.push(
                    "return (Math.abs(this.stride[0])>Math.abs(this.stride[1]))?[1,0]:[0,1]}})"
                  );
                } else if (dimension === 3) {
                  code.push(
                    "var s0=Math.abs(this.stride[0]),s1=Math.abs(this.stride[1]),s2=Math.abs(this.stride[2]);if(s0>s1){if(s1>s2){return [2,1,0];}else if(s0>s2){return [1,2,0];}else{return [1,0,2];}}else if(s0>s2){return [2,0,1];}else if(s2>s1){return [0,1,2];}else{return [0,2,1];}}})"
                  );
                }
              } else {
                code.push("ORDER})");
              }
            }
            code.push(
              "proto.set=function " +
                className +
                "_set(" +
                args.join(",") +
                ",v){"
            );
            if (useGetters) {
              code.push("return this.data.set(" + index_str + ",v)}");
            } else {
              code.push("return this.data[" + index_str + "]=v}");
            }
            code.push(
              "proto.get=function " +
                className +
                "_get(" +
                args.join(",") +
                "){"
            );
            if (useGetters) {
              code.push("return this.data.get(" + index_str + ")}");
            } else {
              code.push("return this.data[" + index_str + "]}");
            }
            code.push(
              "proto.index=function " + className + "_index(",
              args.join(),
              "){return " + index_str + "}"
            );
            code.push(
              "proto.hi=function " +
                className +
                "_hi(" +
                args.join(",") +
                "){return new " +
                className +
                "(this.data," +
                indices
                  .map(function (i) {
                    return [
                      "(typeof i",
                      i,
                      "!=='number'||i",
                      i,
                      "<0)?this.shape[",
                      i,
                      "]:i",
                      i,
                      "|0",
                    ].join("");
                  })
                  .join(",") +
                "," +
                indices
                  .map(function (i) {
                    return "this.stride[" + i + "]";
                  })
                  .join(",") +
                ",this.offset)}"
            );
            var a_vars = indices.map(function (i) {
              return "a" + i + "=this.shape[" + i + "]";
            });
            var c_vars = indices.map(function (i) {
              return "c" + i + "=this.stride[" + i + "]";
            });
            code.push(
              "proto.lo=function " +
                className +
                "_lo(" +
                args.join(",") +
                "){var b=this.offset,d=0," +
                a_vars.join(",") +
                "," +
                c_vars.join(",")
            );
            for (var i = 0; i < dimension; ++i) {
              code.push(
                "if(typeof i" +
                  i +
                  "==='number'&&i" +
                  i +
                  ">=0){d=i" +
                  i +
                  "|0;b+=c" +
                  i +
                  "*d;a" +
                  i +
                  "-=d}"
              );
            }
            code.push(
              "return new " +
                className +
                "(this.data," +
                indices
                  .map(function (i) {
                    return "a" + i;
                  })
                  .join(",") +
                "," +
                indices
                  .map(function (i) {
                    return "c" + i;
                  })
                  .join(",") +
                ",b)}"
            );
            code.push(
              "proto.step=function " +
                className +
                "_step(" +
                args.join(",") +
                "){var " +
                indices
                  .map(function (i) {
                    return "a" + i + "=this.shape[" + i + "]";
                  })
                  .join(",") +
                "," +
                indices
                  .map(function (i) {
                    return "b" + i + "=this.stride[" + i + "]";
                  })
                  .join(",") +
                ",c=this.offset,d=0,ceil=Math.ceil"
            );
            for (var i = 0; i < dimension; ++i) {
              code.push(
                "if(typeof i" +
                  i +
                  "==='number'){d=i" +
                  i +
                  "|0;if(d<0){c+=b" +
                  i +
                  "*(a" +
                  i +
                  "-1);a" +
                  i +
                  "=ceil(-a" +
                  i +
                  "/d)}else{a" +
                  i +
                  "=ceil(a" +
                  i +
                  "/d)}b" +
                  i +
                  "*=d}"
              );
            }
            code.push(
              "return new " +
                className +
                "(this.data," +
                indices
                  .map(function (i) {
                    return "a" + i;
                  })
                  .join(",") +
                "," +
                indices
                  .map(function (i) {
                    return "b" + i;
                  })
                  .join(",") +
                ",c)}"
            );
            var tShape = new Array(dimension);
            var tStride = new Array(dimension);
            for (var i = 0; i < dimension; ++i) {
              tShape[i] = "a[i" + i + "]";
              tStride[i] = "b[i" + i + "]";
            }
            code.push(
              "proto.transpose=function " +
                className +
                "_transpose(" +
                args +
                "){" +
                args
                  .map(function (n, idx) {
                    return (
                      n + "=(" + n + "===undefined?" + idx + ":" + n + "|0)"
                    );
                  })
                  .join(";"),
              "var a=this.shape,b=this.stride;return new " +
                className +
                "(this.data," +
                tShape.join(",") +
                "," +
                tStride.join(",") +
                ",this.offset)}"
            );
            code.push(
              "proto.pick=function " +
                className +
                "_pick(" +
                args +
                "){var a=[],b=[],c=this.offset"
            );
            for (var i = 0; i < dimension; ++i) {
              code.push(
                "if(typeof i" +
                  i +
                  "==='number'&&i" +
                  i +
                  ">=0){c=(c+this.stride[" +
                  i +
                  "]*i" +
                  i +
                  ")|0}else{a.push(this.shape[" +
                  i +
                  "]);b.push(this.stride[" +
                  i +
                  "])}"
              );
            }
            code.push(
              "var ctor=CTOR_LIST[a.length+1];return ctor(this.data,a,b,c)}"
            );
            code.push(
              "return function construct_" +
                className +
                "(data,shape,stride,offset){return new " +
                className +
                "(data," +
                indices
                  .map(function (i) {
                    return "shape[" + i + "]";
                  })
                  .join(",") +
                "," +
                indices
                  .map(function (i) {
                    return "stride[" + i + "]";
                  })
                  .join(",") +
                ",offset)}"
            );
            var procedure = new Function("CTOR_LIST", "ORDER", code.join("\n"));
            return procedure(CACHED_CONSTRUCTORS[dtype], order);
          }
          function arrayDType(data) {
            if (hasBuffer) {
              if (Buffer.isBuffer(data)) {
                return "buffer";
              }
            }
            if (hasTypedArrays) {
              switch (Object.prototype.toString.call(data)) {
                case "[object Float64Array]":
                  return "float64";
                case "[object Float32Array]":
                  return "float32";
                case "[object Int8Array]":
                  return "int8";
                case "[object Int16Array]":
                  return "int16";
                case "[object Int32Array]":
                  return "int32";
                case "[object Uint8Array]":
                  return "uint8";
                case "[object Uint16Array]":
                  return "uint16";
                case "[object Uint32Array]":
                  return "uint32";
                case "[object Uint8ClampedArray]":
                  return "uint8_clamped";
              }
            }
            if (Array.isArray(data)) {
              return "array";
            }
            return "generic";
          }
          var CACHED_CONSTRUCTORS = {
            float32: [],
            float64: [],
            int8: [],
            int16: [],
            int32: [],
            uint8: [],
            uint16: [],
            uint32: [],
            array: [],
            uint8_clamped: [],
            buffer: [],
            generic: [],
          };
          (function () {
            for (var id in CACHED_CONSTRUCTORS) {
              CACHED_CONSTRUCTORS[id].push(compileConstructor(id, -1));
            }
          });
          function wrappedNDArrayCtor(data, shape, stride, offset) {
            if (data === undefined) {
              var ctor = CACHED_CONSTRUCTORS.array[0];
              return ctor([]);
            } else if (typeof data === "number") {
              data = [data];
            }
            if (shape === undefined) {
              shape = [data.length];
            }
            var d = shape.length;
            if (stride === undefined) {
              stride = new Array(d);
              for (var i = d - 1, sz = 1; i >= 0; --i) {
                stride[i] = sz;
                sz *= shape[i];
              }
            }
            if (offset === undefined) {
              offset = 0;
              for (var i = 0; i < d; ++i) {
                if (stride[i] < 0) {
                  offset -= (shape[i] - 1) * stride[i];
                }
              }
            }
            var dtype = arrayDType(data);
            var ctor_list = CACHED_CONSTRUCTORS[dtype];
            while (ctor_list.length <= d + 1) {
              ctor_list.push(compileConstructor(dtype, ctor_list.length - 1));
            }
            var ctor = ctor_list[d + 1];
            return ctor(data, shape, stride, offset);
          }
          module.exports = wrappedNDArrayCtor;
        }.call(this, require("buffer").Buffer));
      },
      { buffer: 1, "iota-array": 7 },
    ],
    7: [
      function (require, module, exports) {
        "use strict";
        function iota(n) {
          var result = new Array(n);
          for (var i = 0; i < n; ++i) {
            result[i] = i;
          }
          return result;
        }
        module.exports = iota;
      },
      {},
    ],
    lena: [
      function (require, module, exports) {
        (function (Buffer) {
          var b642uint8 = require("base64-js").toByteArray;
          function base64decode(str) {
            if (typeof window === "undefined") {
              return new Uint8Array(new Buffer(str, "base64"));
            } else {
              return new Uint8Array(b642uint8(str));
            }
          }
          module.exports = require("ndarray")(
            base64decode(
            ),
            [512, 512, 3],
            [3, 1536, 1],
            0
          );
        }.call(this, require("buffer").Buffer));
      },
      { "base64-js": 5, buffer: 1, ndarray: 6 },
    ],
  },
  {},
  []
);
require = (function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw ((f.code = "MODULE_NOT_FOUND"), f);
      }
      var l = (n[o] = { exports: {} });
      t[o][0].call(
        l.exports,
        function (e) {
          var n = t[o][1][e];
          return s(n ? n : e);
        },
        l,
        l.exports,
        e,
        t,
        n,
        r
      );
    }
    return n[o].exports;
  }
  var i = typeof require == "function" && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
})(
  {
    1: [
      function (require, module, exports) {
        var util = require("util/");
        var pSlice = Array.prototype.slice;
        var hasOwn = Object.prototype.hasOwnProperty;
        var assert = (module.exports = ok);
        assert.AssertionError = function AssertionError(options) {
          this.name = "AssertionError";
          this.actual = options.actual;
          this.expected = options.expected;
          this.operator = options.operator;
          if (options.message) {
            this.message = options.message;
            this.generatedMessage = false;
          } else {
            this.message = getMessage(this);
            this.generatedMessage = true;
          }
          var stackStartFunction = options.stackStartFunction || fail;
          if (Error.captureStackTrace) {
            Error.captureStackTrace(this, stackStartFunction);
          } else {
            var err = new Error();
            if (err.stack) {
              var out = err.stack;
              var fn_name = stackStartFunction.name;
              var idx = out.indexOf("\n" + fn_name);
              if (idx >= 0) {
                var next_line = out.indexOf("\n", idx + 1);
                out = out.substring(next_line + 1);
              }
              this.stack = out;
            }
          }
        };
        util.inherits(assert.AssertionError, Error);
        function replacer(key, value) {
          if (util.isUndefined(value)) {
            return "" + value;
          }
          if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
            return value.toString();
          }
          if (util.isFunction(value) || util.isRegExp(value)) {
            return value.toString();
          }
          return value;
        }
        function truncate(s, n) {
          if (util.isString(s)) {
            return s.length < n ? s : s.slice(0, n);
          } else {
            return s;
          }
        }
        function getMessage(self) {
          return (
            truncate(JSON.stringify(self.actual, replacer), 128) +
            " " +
            self.operator +
            " " +
            truncate(JSON.stringify(self.expected, replacer), 128)
          );
        }
        function fail(actual, expected, message, operator, stackStartFunction) {
          throw new assert.AssertionError({
            message: message,
            actual: actual,
            expected: expected,
            operator: operator,
            stackStartFunction: stackStartFunction,
          });
        }
        assert.fail = fail;
        function ok(value, message) {
          if (!value) fail(value, true, message, "==", assert.ok);
        }
        assert.ok = ok;
        assert.equal = function equal(actual, expected, message) {
          if (actual != expected)
            fail(actual, expected, message, "==", assert.equal);
        };
        assert.notEqual = function notEqual(actual, expected, message) {
          if (actual == expected) {
            fail(actual, expected, message, "!=", assert.notEqual);
          }
        };
        assert.deepEqual = function deepEqual(actual, expected, message) {
          if (!_deepEqual(actual, expected)) {
            fail(actual, expected, message, "deepEqual", assert.deepEqual);
          }
        };
        function _deepEqual(actual, expected) {
          if (actual === expected) {
            return true;
          } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
            if (actual.length != expected.length) return false;
            for (var i = 0; i < actual.length; i++) {
              if (actual[i] !== expected[i]) return false;
            }
            return true;
          } else if (util.isDate(actual) && util.isDate(expected)) {
            return actual.getTime() === expected.getTime();
          } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
            return (
              actual.source === expected.source &&
              actual.global === expected.global &&
              actual.multiline === expected.multiline &&
              actual.lastIndex === expected.lastIndex &&
              actual.ignoreCase === expected.ignoreCase
            );
          } else if (!util.isObject(actual) && !util.isObject(expected)) {
            return actual == expected;
          } else {
            return objEquiv(actual, expected);
          }
        }
        function isArguments(object) {
          return Object.prototype.toString.call(object) == "[object Arguments]";
        }
        function objEquiv(a, b) {
          if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
            return false;
          if (a.prototype !== b.prototype) return false;
          if (isArguments(a)) {
            if (!isArguments(b)) {
              return false;
            }
            a = pSlice.call(a);
            b = pSlice.call(b);
            return _deepEqual(a, b);
          }
          try {
            var ka = objectKeys(a),
              kb = objectKeys(b),
              key,
              i;
          } catch (e) {
            return false;
          }
          if (ka.length != kb.length) return false;
          ka.sort();
          kb.sort();
          for (i = ka.length - 1; i >= 0; i--) {
            if (ka[i] != kb[i]) return false;
          }
          for (i = ka.length - 1; i >= 0; i--) {
            key = ka[i];
            if (!_deepEqual(a[key], b[key])) return false;
          }
          return true;
        }
        assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
          if (_deepEqual(actual, expected)) {
            fail(
              actual,
              expected,
              message,
              "notDeepEqual",
              assert.notDeepEqual
            );
          }
        };
        assert.strictEqual = function strictEqual(actual, expected, message) {
          if (actual !== expected) {
            fail(actual, expected, message, "===", assert.strictEqual);
          }
        };
        assert.notStrictEqual = function notStrictEqual(
          actual,
          expected,
          message
        ) {
          if (actual === expected) {
            fail(actual, expected, message, "!==", assert.notStrictEqual);
          }
        };
        function expectedException(actual, expected) {
          if (!actual || !expected) {
            return false;
          }
          if (Object.prototype.toString.call(expected) == "[object RegExp]") {
            return expected.test(actual);
          } else if (actual instanceof expected) {
            return true;
          } else if (expected.call({}, actual) === true) {
            return true;
          }
          return false;
        }
        function _throws(shouldThrow, block, expected, message) {
          var actual;
          if (util.isString(expected)) {
            message = expected;
            expected = null;
          }
          try {
            block();
          } catch (e) {
            actual = e;
          }
          message =
            (expected && expected.name ? " (" + expected.name + ")." : ".") +
            (message ? " " + message : ".");
          if (shouldThrow && !actual) {
            fail(actual, expected, "Missing expected exception" + message);
          }
          if (!shouldThrow && expectedException(actual, expected)) {
            fail(actual, expected, "Got unwanted exception" + message);
          }
          if (
            (shouldThrow &&
              actual &&
              expected &&
              !expectedException(actual, expected)) ||
            (!shouldThrow && actual)
          ) {
            throw actual;
          }
        }
        assert.throws = function (block, error, message) {
          _throws.apply(this, [true].concat(pSlice.call(arguments)));
        };
        assert.doesNotThrow = function (block, message) {
          _throws.apply(this, [false].concat(pSlice.call(arguments)));
        };
        assert.ifError = function (err) {
          if (err) {
            throw err;
          }
        };
        var objectKeys =
          Object.keys ||
          function (obj) {
            var keys = [];
            for (var key in obj) {
              if (hasOwn.call(obj, key)) keys.push(key);
            }
            return keys;
          };
      },
      { "util/": 38 },
    ],
    2: [function (require, module, exports) {}, {}],
    3: [
      function (require, module, exports) {
        "use strict";
        var TYPED_OK =
          typeof Uint8Array !== "undefined" &&
          typeof Uint16Array !== "undefined" &&
          typeof Int32Array !== "undefined";
        exports.assign = function (obj) {
          var sources = Array.prototype.slice.call(arguments, 1);
          while (sources.length) {
            var source = sources.shift();
            if (!source) {
              continue;
            }
            if (typeof source !== "object") {
              throw new TypeError(source + "must be non-object");
            }
            for (var p in source) {
              if (source.hasOwnProperty(p)) {
                obj[p] = source[p];
              }
            }
          }
          return obj;
        };
        exports.shrinkBuf = function (buf, size) {
          if (buf.length === size) {
            return buf;
          }
          if (buf.subarray) {
            return buf.subarray(0, size);
          }
          buf.length = size;
          return buf;
        };
        var fnTyped = {
          arraySet: function (dest, src, src_offs, len, dest_offs) {
            if (src.subarray && dest.subarray) {
              dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
              return;
            }
            for (var i = 0; i < len; i++) {
              dest[dest_offs + i] = src[src_offs + i];
            }
          },
          flattenChunks: function (chunks) {
            var i, l, len, pos, chunk, result;
            len = 0;
            for (i = 0, l = chunks.length; i < l; i++) {
              len += chunks[i].length;
            }
            result = new Uint8Array(len);
            pos = 0;
            for (i = 0, l = chunks.length; i < l; i++) {
              chunk = chunks[i];
              result.set(chunk, pos);
              pos += chunk.length;
            }
            return result;
          },
        };
        var fnUntyped = {
          arraySet: function (dest, src, src_offs, len, dest_offs) {
            for (var i = 0; i < len; i++) {
              dest[dest_offs + i] = src[src_offs + i];
            }
          },
          flattenChunks: function (chunks) {
            return [].concat.apply([], chunks);
          },
        };
        exports.setTyped = function (on) {
          if (on) {
            exports.Buf8 = Uint8Array;
            exports.Buf16 = Uint16Array;
            exports.Buf32 = Int32Array;
            exports.assign(exports, fnTyped);
          } else {
            exports.Buf8 = Array;
            exports.Buf16 = Array;
            exports.Buf32 = Array;
            exports.assign(exports, fnUntyped);
          }
        };
        exports.setTyped(TYPED_OK);
      },
      {},
    ],
    4: [
      function (require, module, exports) {
        "use strict";
        function adler32(adler, buf, len, pos) {
          var s1 = (adler & 65535) | 0,
            s2 = ((adler >>> 16) & 65535) | 0,
            n = 0;
          while (len !== 0) {
            n = len > 2e3 ? 2e3 : len;
            len -= n;
            do {
              s1 = (s1 + buf[pos++]) | 0;
              s2 = (s2 + s1) | 0;
            } while (--n);
            s1 %= 65521;
            s2 %= 65521;
          }
          return s1 | (s2 << 16) | 0;
        }
        module.exports = adler32;
      },
      {},
    ],
    5: [
      function (require, module, exports) {
        module.exports = {
          Z_NO_FLUSH: 0,
          Z_PARTIAL_FLUSH: 1,
          Z_SYNC_FLUSH: 2,
          Z_FULL_FLUSH: 3,
          Z_FINISH: 4,
          Z_BLOCK: 5,
          Z_TREES: 6,
          Z_OK: 0,
          Z_STREAM_END: 1,
          Z_NEED_DICT: 2,
          Z_ERRNO: -1,
          Z_STREAM_ERROR: -2,
          Z_DATA_ERROR: -3,
          Z_BUF_ERROR: -5,
          Z_NO_COMPRESSION: 0,
          Z_BEST_SPEED: 1,
          Z_BEST_COMPRESSION: 9,
          Z_DEFAULT_COMPRESSION: -1,
          Z_FILTERED: 1,
          Z_HUFFMAN_ONLY: 2,
          Z_RLE: 3,
          Z_FIXED: 4,
          Z_DEFAULT_STRATEGY: 0,
          Z_BINARY: 0,
          Z_TEXT: 1,
          Z_UNKNOWN: 2,
          Z_DEFLATED: 8,
        };
      },
      {},
    ],
    6: [
      function (require, module, exports) {
        "use strict";
        function makeTable() {
          var c,
            table = [];
          for (var n = 0; n < 256; n++) {
            c = n;
            for (var k = 0; k < 8; k++) {
              c = c & 1 ? 3988292384 ^ (c >>> 1) : c >>> 1;
            }
            table[n] = c;
          }
          return table;
        }
        var crcTable = makeTable();
        function crc32(crc, buf, len, pos) {
          var t = crcTable,
            end = pos + len;
          crc = crc ^ -1;
          for (var i = pos; i < end; i++) {
            crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 255];
          }
          return crc ^ -1;
        }
        module.exports = crc32;
      },
      {},
    ],
    7: [
      function (require, module, exports) {
        "use strict";
        var utils = require("../utils/common");
        var trees = require("./trees");
        var adler32 = require("./adler32");
        var crc32 = require("./crc32");
        var msg = require("./messages");
        var Z_NO_FLUSH = 0;
        var Z_PARTIAL_FLUSH = 1;
        var Z_FULL_FLUSH = 3;
        var Z_FINISH = 4;
        var Z_BLOCK = 5;
        var Z_OK = 0;
        var Z_STREAM_END = 1;
        var Z_STREAM_ERROR = -2;
        var Z_DATA_ERROR = -3;
        var Z_BUF_ERROR = -5;
        var Z_DEFAULT_COMPRESSION = -1;
        var Z_FILTERED = 1;
        var Z_HUFFMAN_ONLY = 2;
        var Z_RLE = 3;
        var Z_FIXED = 4;
        var Z_DEFAULT_STRATEGY = 0;
        var Z_UNKNOWN = 2;
        var Z_DEFLATED = 8;
        var MAX_MEM_LEVEL = 9;
        var MAX_WBITS = 15;
        var DEF_MEM_LEVEL = 8;
        var LENGTH_CODES = 29;
        var LITERALS = 256;
        var L_CODES = LITERALS + 1 + LENGTH_CODES;
        var D_CODES = 30;
        var BL_CODES = 19;
        var HEAP_SIZE = 2 * L_CODES + 1;
        var MAX_BITS = 15;
        var MIN_MATCH = 3;
        var MAX_MATCH = 258;
        var MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;
        var PRESET_DICT = 32;
        var INIT_STATE = 42;
        var EXTRA_STATE = 69;
        var NAME_STATE = 73;
        var COMMENT_STATE = 91;
        var HCRC_STATE = 103;
        var BUSY_STATE = 113;
        var FINISH_STATE = 666;
        var BS_NEED_MORE = 1;
        var BS_BLOCK_DONE = 2;
        var BS_FINISH_STARTED = 3;
        var BS_FINISH_DONE = 4;
        var OS_CODE = 3;
        function err(strm, errorCode) {
          strm.msg = msg[errorCode];
          return errorCode;
        }
        function rank(f) {
          return (f << 1) - (f > 4 ? 9 : 0);
        }
        function zero(buf) {
          var len = buf.length;
          while (--len >= 0) {
            buf[len] = 0;
          }
        }
        function flush_pending(strm) {
          var s = strm.state;
          var len = s.pending;
          if (len > strm.avail_out) {
            len = strm.avail_out;
          }
          if (len === 0) {
            return;
          }
          utils.arraySet(
            strm.output,
            s.pending_buf,
            s.pending_out,
            len,
            strm.next_out
          );
          strm.next_out += len;
          s.pending_out += len;
          strm.total_out += len;
          strm.avail_out -= len;
          s.pending -= len;
          if (s.pending === 0) {
            s.pending_out = 0;
          }
        }
        function flush_block_only(s, last) {
          trees._tr_flush_block(
            s,
            s.block_start >= 0 ? s.block_start : -1,
            s.strstart - s.block_start,
            last
          );
          s.block_start = s.strstart;
          flush_pending(s.strm);
        }
        function put_byte(s, b) {
          s.pending_buf[s.pending++] = b;
        }
        function putShortMSB(s, b) {
          s.pending_buf[s.pending++] = (b >>> 8) & 255;
          s.pending_buf[s.pending++] = b & 255;
        }
        function read_buf(strm, buf, start, size) {
          var len = strm.avail_in;
          if (len > size) {
            len = size;
          }
          if (len === 0) {
            return 0;
          }
          strm.avail_in -= len;
          utils.arraySet(buf, strm.input, strm.next_in, len, start);
          if (strm.state.wrap === 1) {
            strm.adler = adler32(strm.adler, buf, len, start);
          } else if (strm.state.wrap === 2) {
            strm.adler = crc32(strm.adler, buf, len, start);
          }
          strm.next_in += len;
          strm.total_in += len;
          return len;
        }
        function longest_match(s, cur_match) {
          var chain_length = s.max_chain_length;
          var scan = s.strstart;
          var match;
          var len;
          var best_len = s.prev_length;
          var nice_match = s.nice_match;
          var limit =
            s.strstart > s.w_size - MIN_LOOKAHEAD
              ? s.strstart - (s.w_size - MIN_LOOKAHEAD)
              : 0;
          var _win = s.window;
          var wmask = s.w_mask;
          var prev = s.prev;
          var strend = s.strstart + MAX_MATCH;
          var scan_end1 = _win[scan + best_len - 1];
          var scan_end = _win[scan + best_len];
          if (s.prev_length >= s.good_match) {
            chain_length >>= 2;
          }
          if (nice_match > s.lookahead) {
            nice_match = s.lookahead;
          }
          do {
            match = cur_match;
            if (
              _win[match + best_len] !== scan_end ||
              _win[match + best_len - 1] !== scan_end1 ||
              _win[match] !== _win[scan] ||
              _win[++match] !== _win[scan + 1]
            ) {
              continue;
            }
            scan += 2;
            match++;
            do {} while (
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              _win[++scan] === _win[++match] &&
              scan < strend
            );
            len = MAX_MATCH - (strend - scan);
            scan = strend - MAX_MATCH;
            if (len > best_len) {
              s.match_start = cur_match;
              best_len = len;
              if (len >= nice_match) {
                break;
              }
              scan_end1 = _win[scan + best_len - 1];
              scan_end = _win[scan + best_len];
            }
          } while (
            (cur_match = prev[cur_match & wmask]) > limit &&
            --chain_length !== 0
          );
          if (best_len <= s.lookahead) {
            return best_len;
          }
          return s.lookahead;
        }
        function fill_window(s) {
          var _w_size = s.w_size;
          var p, n, m, more, str;
          do {
            more = s.window_size - s.lookahead - s.strstart;
            if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
              utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
              s.match_start -= _w_size;
              s.strstart -= _w_size;
              s.block_start -= _w_size;
              n = s.hash_size;
              p = n;
              do {
                m = s.head[--p];
                s.head[p] = m >= _w_size ? m - _w_size : 0;
              } while (--n);
              n = _w_size;
              p = n;
              do {
                m = s.prev[--p];
                s.prev[p] = m >= _w_size ? m - _w_size : 0;
              } while (--n);
              more += _w_size;
            }
            if (s.strm.avail_in === 0) {
              break;
            }
            n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
            s.lookahead += n;
            if (s.lookahead + s.insert >= MIN_MATCH) {
              str = s.strstart - s.insert;
              s.ins_h = s.window[str];
              s.ins_h =
                ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
              while (s.insert) {
                s.ins_h =
                  ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) &
                  s.hash_mask;
                s.prev[str & s.w_mask] = s.head[s.ins_h];
                s.head[s.ins_h] = str;
                str++;
                s.insert--;
                if (s.lookahead + s.insert < MIN_MATCH) {
                  break;
                }
              }
            }
          } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
        }
        function deflate_stored(s, flush) {
          var max_block_size = 65535;
          if (max_block_size > s.pending_buf_size - 5) {
            max_block_size = s.pending_buf_size - 5;
          }
          for (;;) {
            if (s.lookahead <= 1) {
              fill_window(s);
              if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              if (s.lookahead === 0) {
                break;
              }
            }
            s.strstart += s.lookahead;
            s.lookahead = 0;
            var max_start = s.block_start + max_block_size;
            if (s.strstart === 0 || s.strstart >= max_start) {
              s.lookahead = s.strstart - max_start;
              s.strstart = max_start;
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
            if (s.strstart - s.block_start >= s.w_size - MIN_LOOKAHEAD) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          }
          s.insert = 0;
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.strstart > s.block_start) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_NEED_MORE;
        }
        function deflate_fast(s, flush) {
          var hash_head;
          var bflush;
          for (;;) {
            if (s.lookahead < MIN_LOOKAHEAD) {
              fill_window(s);
              if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              if (s.lookahead === 0) {
                break;
              }
            }
            hash_head = 0;
            if (s.lookahead >= MIN_MATCH) {
              s.ins_h =
                ((s.ins_h << s.hash_shift) ^
                  s.window[s.strstart + MIN_MATCH - 1]) &
                s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            }
            if (
              hash_head !== 0 &&
              s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD
            ) {
              s.match_length = longest_match(s, hash_head);
            }
            if (s.match_length >= MIN_MATCH) {
              bflush = trees._tr_tally(
                s,
                s.strstart - s.match_start,
                s.match_length - MIN_MATCH
              );
              s.lookahead -= s.match_length;
              if (
                s.match_length <= s.max_lazy_match &&
                s.lookahead >= MIN_MATCH
              ) {
                s.match_length--;
                do {
                  s.strstart++;
                  s.ins_h =
                    ((s.ins_h << s.hash_shift) ^
                      s.window[s.strstart + MIN_MATCH - 1]) &
                    s.hash_mask;
                  hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                  s.head[s.ins_h] = s.strstart;
                } while (--s.match_length !== 0);
                s.strstart++;
              } else {
                s.strstart += s.match_length;
                s.match_length = 0;
                s.ins_h = s.window[s.strstart];
                s.ins_h =
                  ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) &
                  s.hash_mask;
              }
            } else {
              bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
              s.lookahead--;
              s.strstart++;
            }
            if (bflush) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          }
          s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_BLOCK_DONE;
        }
        function deflate_slow(s, flush) {
          var hash_head;
          var bflush;
          var max_insert;
          for (;;) {
            if (s.lookahead < MIN_LOOKAHEAD) {
              fill_window(s);
              if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              if (s.lookahead === 0) {
                break;
              }
            }
            hash_head = 0;
            if (s.lookahead >= MIN_MATCH) {
              s.ins_h =
                ((s.ins_h << s.hash_shift) ^
                  s.window[s.strstart + MIN_MATCH - 1]) &
                s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            }
            s.prev_length = s.match_length;
            s.prev_match = s.match_start;
            s.match_length = MIN_MATCH - 1;
            if (
              hash_head !== 0 &&
              s.prev_length < s.max_lazy_match &&
              s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD
            ) {
              s.match_length = longest_match(s, hash_head);
              if (
                s.match_length <= 5 &&
                (s.strategy === Z_FILTERED ||
                  (s.match_length === MIN_MATCH &&
                    s.strstart - s.match_start > 4096))
              ) {
                s.match_length = MIN_MATCH - 1;
              }
            }
            if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
              max_insert = s.strstart + s.lookahead - MIN_MATCH;
              bflush = trees._tr_tally(
                s,
                s.strstart - 1 - s.prev_match,
                s.prev_length - MIN_MATCH
              );
              s.lookahead -= s.prev_length - 1;
              s.prev_length -= 2;
              do {
                if (++s.strstart <= max_insert) {
                  s.ins_h =
                    ((s.ins_h << s.hash_shift) ^
                      s.window[s.strstart + MIN_MATCH - 1]) &
                    s.hash_mask;
                  hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                  s.head[s.ins_h] = s.strstart;
                }
              } while (--s.prev_length !== 0);
              s.match_available = 0;
              s.match_length = MIN_MATCH - 1;
              s.strstart++;
              if (bflush) {
                flush_block_only(s, false);
                if (s.strm.avail_out === 0) {
                  return BS_NEED_MORE;
                }
              }
            } else if (s.match_available) {
              bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
              if (bflush) {
                flush_block_only(s, false);
              }
              s.strstart++;
              s.lookahead--;
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            } else {
              s.match_available = 1;
              s.strstart++;
              s.lookahead--;
            }
          }
          if (s.match_available) {
            bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
            s.match_available = 0;
          }
          s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_BLOCK_DONE;
        }
        function deflate_rle(s, flush) {
          var bflush;
          var prev;
          var scan, strend;
          var _win = s.window;
          for (;;) {
            if (s.lookahead <= MAX_MATCH) {
              fill_window(s);
              if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              if (s.lookahead === 0) {
                break;
              }
            }
            s.match_length = 0;
            if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
              scan = s.strstart - 1;
              prev = _win[scan];
              if (
                prev === _win[++scan] &&
                prev === _win[++scan] &&
                prev === _win[++scan]
              ) {
                strend = s.strstart + MAX_MATCH;
                do {} while (
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  prev === _win[++scan] &&
                  scan < strend
                );
                s.match_length = MAX_MATCH - (strend - scan);
                if (s.match_length > s.lookahead) {
                  s.match_length = s.lookahead;
                }
              }
            }
            if (s.match_length >= MIN_MATCH) {
              bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);
              s.lookahead -= s.match_length;
              s.strstart += s.match_length;
              s.match_length = 0;
            } else {
              bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
              s.lookahead--;
              s.strstart++;
            }
            if (bflush) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          }
          s.insert = 0;
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_BLOCK_DONE;
        }
        function deflate_huff(s, flush) {
          var bflush;
          for (;;) {
            if (s.lookahead === 0) {
              fill_window(s);
              if (s.lookahead === 0) {
                if (flush === Z_NO_FLUSH) {
                  return BS_NEED_MORE;
                }
                break;
              }
            }
            s.match_length = 0;
            bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
            s.lookahead--;
            s.strstart++;
            if (bflush) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          }
          s.insert = 0;
          if (flush === Z_FINISH) {
            flush_block_only(s, true);
            if (s.strm.avail_out === 0) {
              return BS_FINISH_STARTED;
            }
            return BS_FINISH_DONE;
          }
          if (s.last_lit) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          return BS_BLOCK_DONE;
        }
        var Config = function (
          good_length,
          max_lazy,
          nice_length,
          max_chain,
          func
        ) {
          this.good_length = good_length;
          this.max_lazy = max_lazy;
          this.nice_length = nice_length;
          this.max_chain = max_chain;
          this.func = func;
        };
        var configuration_table;
        configuration_table = [
          new Config(0, 0, 0, 0, deflate_stored),
          new Config(4, 4, 8, 4, deflate_fast),
          new Config(4, 5, 16, 8, deflate_fast),
          new Config(4, 6, 32, 32, deflate_fast),
          new Config(4, 4, 16, 16, deflate_slow),
          new Config(8, 16, 32, 32, deflate_slow),
          new Config(8, 16, 128, 128, deflate_slow),
          new Config(8, 32, 128, 256, deflate_slow),
          new Config(32, 128, 258, 1024, deflate_slow),
          new Config(32, 258, 258, 4096, deflate_slow),
        ];
        function lm_init(s) {
          s.window_size = 2 * s.w_size;
          zero(s.head);
          s.max_lazy_match = configuration_table[s.level].max_lazy;
          s.good_match = configuration_table[s.level].good_length;
          s.nice_match = configuration_table[s.level].nice_length;
          s.max_chain_length = configuration_table[s.level].max_chain;
          s.strstart = 0;
          s.block_start = 0;
          s.lookahead = 0;
          s.insert = 0;
          s.match_length = s.prev_length = MIN_MATCH - 1;
          s.match_available = 0;
          s.ins_h = 0;
        }
        function DeflateState() {
          this.strm = null;
          this.status = 0;
          this.pending_buf = null;
          this.pending_buf_size = 0;
          this.pending_out = 0;
          this.pending = 0;
          this.wrap = 0;
          this.gzhead = null;
          this.gzindex = 0;
          this.method = Z_DEFLATED;
          this.last_flush = -1;
          this.w_size = 0;
          this.w_bits = 0;
          this.w_mask = 0;
          this.window = null;
          this.window_size = 0;
          this.prev = null;
          this.head = null;
          this.ins_h = 0;
          this.hash_size = 0;
          this.hash_bits = 0;
          this.hash_mask = 0;
          this.hash_shift = 0;
          this.block_start = 0;
          this.match_length = 0;
          this.prev_match = 0;
          this.match_available = 0;
          this.strstart = 0;
          this.match_start = 0;
          this.lookahead = 0;
          this.prev_length = 0;
          this.max_chain_length = 0;
          this.max_lazy_match = 0;
          this.level = 0;
          this.strategy = 0;
          this.good_match = 0;
          this.nice_match = 0;
          this.dyn_ltree = new utils.Buf16(HEAP_SIZE * 2);
          this.dyn_dtree = new utils.Buf16((2 * D_CODES + 1) * 2);
          this.bl_tree = new utils.Buf16((2 * BL_CODES + 1) * 2);
          zero(this.dyn_ltree);
          zero(this.dyn_dtree);
          zero(this.bl_tree);
          this.l_desc = null;
          this.d_desc = null;
          this.bl_desc = null;
          this.bl_count = new utils.Buf16(MAX_BITS + 1);
          this.heap = new utils.Buf16(2 * L_CODES + 1);
          zero(this.heap);
          this.heap_len = 0;
          this.heap_max = 0;
          this.depth = new utils.Buf16(2 * L_CODES + 1);
          zero(this.depth);
          this.l_buf = 0;
          this.lit_bufsize = 0;
          this.last_lit = 0;
          this.d_buf = 0;
          this.opt_len = 0;
          this.static_len = 0;
          this.matches = 0;
          this.insert = 0;
          this.bi_buf = 0;
          this.bi_valid = 0;
        }
        function deflateResetKeep(strm) {
          var s;
          if (!strm || !strm.state) {
            return err(strm, Z_STREAM_ERROR);
          }
          strm.total_in = strm.total_out = 0;
          strm.data_type = Z_UNKNOWN;
          s = strm.state;
          s.pending = 0;
          s.pending_out = 0;
          if (s.wrap < 0) {
            s.wrap = -s.wrap;
          }
          s.status = s.wrap ? INIT_STATE : BUSY_STATE;
          strm.adler = s.wrap === 2 ? 0 : 1;
          s.last_flush = Z_NO_FLUSH;
          trees._tr_init(s);
          return Z_OK;
        }
        function deflateReset(strm) {
          var ret = deflateResetKeep(strm);
          if (ret === Z_OK) {
            lm_init(strm.state);
          }
          return ret;
        }
        function deflateSetHeader(strm, head) {
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          if (strm.state.wrap !== 2) {
            return Z_STREAM_ERROR;
          }
          strm.state.gzhead = head;
          return Z_OK;
        }
        function deflateInit2(
          strm,
          level,
          method,
          windowBits,
          memLevel,
          strategy
        ) {
          if (!strm) {
            return Z_STREAM_ERROR;
          }
          var wrap = 1;
          if (level === Z_DEFAULT_COMPRESSION) {
            level = 6;
          }
          if (windowBits < 0) {
            wrap = 0;
            windowBits = -windowBits;
          } else if (windowBits > 15) {
            wrap = 2;
            windowBits -= 16;
          }
          if (
            memLevel < 1 ||
            memLevel > MAX_MEM_LEVEL ||
            method !== Z_DEFLATED ||
            windowBits < 8 ||
            windowBits > 15 ||
            level < 0 ||
            level > 9 ||
            strategy < 0 ||
            strategy > Z_FIXED
          ) {
            return err(strm, Z_STREAM_ERROR);
          }
          if (windowBits === 8) {
            windowBits = 9;
          }
          var s = new DeflateState();
          strm.state = s;
          s.strm = strm;
          s.wrap = wrap;
          s.gzhead = null;
          s.w_bits = windowBits;
          s.w_size = 1 << s.w_bits;
          s.w_mask = s.w_size - 1;
          s.hash_bits = memLevel + 7;
          s.hash_size = 1 << s.hash_bits;
          s.hash_mask = s.hash_size - 1;
          s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
          s.window = new utils.Buf8(s.w_size * 2);
          s.head = new utils.Buf16(s.hash_size);
          s.prev = new utils.Buf16(s.w_size);
          s.lit_bufsize = 1 << (memLevel + 6);
          s.pending_buf_size = s.lit_bufsize * 4;
          s.pending_buf = new utils.Buf8(s.pending_buf_size);
          s.d_buf = s.lit_bufsize >> 1;
          s.l_buf = (1 + 2) * s.lit_bufsize;
          s.level = level;
          s.strategy = strategy;
          s.method = method;
          return deflateReset(strm);
        }
        function deflateInit(strm, level) {
          return deflateInit2(
            strm,
            level,
            Z_DEFLATED,
            MAX_WBITS,
            DEF_MEM_LEVEL,
            Z_DEFAULT_STRATEGY
          );
        }
        function deflate(strm, flush) {
          var old_flush, s;
          var beg, val;
          if (!strm || !strm.state || flush > Z_BLOCK || flush < 0) {
            return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
          }
          s = strm.state;
          if (
            !strm.output ||
            (!strm.input && strm.avail_in !== 0) ||
            (s.status === FINISH_STATE && flush !== Z_FINISH)
          ) {
            return err(
              strm,
              strm.avail_out === 0 ? Z_BUF_ERROR : Z_STREAM_ERROR
            );
          }
          s.strm = strm;
          old_flush = s.last_flush;
          s.last_flush = flush;
          if (s.status === INIT_STATE) {
            if (s.wrap === 2) {
              strm.adler = 0;
              put_byte(s, 31);
              put_byte(s, 139);
              put_byte(s, 8);
              if (!s.gzhead) {
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(s, 0);
                put_byte(
                  s,
                  s.level === 9
                    ? 2
                    : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2
                    ? 4
                    : 0
                );
                put_byte(s, OS_CODE);
                s.status = BUSY_STATE;
              } else {
                put_byte(
                  s,
                  (s.gzhead.text ? 1 : 0) +
                    (s.gzhead.hcrc ? 2 : 0) +
                    (!s.gzhead.extra ? 0 : 4) +
                    (!s.gzhead.name ? 0 : 8) +
                    (!s.gzhead.comment ? 0 : 16)
                );
                put_byte(s, s.gzhead.time & 255);
                put_byte(s, (s.gzhead.time >> 8) & 255);
                put_byte(s, (s.gzhead.time >> 16) & 255);
                put_byte(s, (s.gzhead.time >> 24) & 255);
                put_byte(
                  s,
                  s.level === 9
                    ? 2
                    : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2
                    ? 4
                    : 0
                );
                put_byte(s, s.gzhead.os & 255);
                if (s.gzhead.extra && s.gzhead.extra.length) {
                  put_byte(s, s.gzhead.extra.length & 255);
                  put_byte(s, (s.gzhead.extra.length >> 8) & 255);
                }
                if (s.gzhead.hcrc) {
                  strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
                }
                s.gzindex = 0;
                s.status = EXTRA_STATE;
              }
            } else {
              var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
              var level_flags = -1;
              if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
                level_flags = 0;
              } else if (s.level < 6) {
                level_flags = 1;
              } else if (s.level === 6) {
                level_flags = 2;
              } else {
                level_flags = 3;
              }
              header |= level_flags << 6;
              if (s.strstart !== 0) {
                header |= PRESET_DICT;
              }
              header += 31 - (header % 31);
              s.status = BUSY_STATE;
              putShortMSB(s, header);
              if (s.strstart !== 0) {
                putShortMSB(s, strm.adler >>> 16);
                putShortMSB(s, strm.adler & 65535);
              }
              strm.adler = 1;
            }
          }
          if (s.status === EXTRA_STATE) {
            if (s.gzhead.extra) {
              beg = s.pending;
              while (s.gzindex < (s.gzhead.extra.length & 65535)) {
                if (s.pending === s.pending_buf_size) {
                  if (s.gzhead.hcrc && s.pending > beg) {
                    strm.adler = crc32(
                      strm.adler,
                      s.pending_buf,
                      s.pending - beg,
                      beg
                    );
                  }
                  flush_pending(strm);
                  beg = s.pending;
                  if (s.pending === s.pending_buf_size) {
                    break;
                  }
                }
                put_byte(s, s.gzhead.extra[s.gzindex] & 255);
                s.gzindex++;
              }
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(
                  strm.adler,
                  s.pending_buf,
                  s.pending - beg,
                  beg
                );
              }
              if (s.gzindex === s.gzhead.extra.length) {
                s.gzindex = 0;
                s.status = NAME_STATE;
              }
            } else {
              s.status = NAME_STATE;
            }
          }
          if (s.status === NAME_STATE) {
            if (s.gzhead.name) {
              beg = s.pending;
              do {
                if (s.pending === s.pending_buf_size) {
                  if (s.gzhead.hcrc && s.pending > beg) {
                    strm.adler = crc32(
                      strm.adler,
                      s.pending_buf,
                      s.pending - beg,
                      beg
                    );
                  }
                  flush_pending(strm);
                  beg = s.pending;
                  if (s.pending === s.pending_buf_size) {
                    val = 1;
                    break;
                  }
                }
                if (s.gzindex < s.gzhead.name.length) {
                  val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
                } else {
                  val = 0;
                }
                put_byte(s, val);
              } while (val !== 0);
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(
                  strm.adler,
                  s.pending_buf,
                  s.pending - beg,
                  beg
                );
              }
              if (val === 0) {
                s.gzindex = 0;
                s.status = COMMENT_STATE;
              }
            } else {
              s.status = COMMENT_STATE;
            }
          }
          if (s.status === COMMENT_STATE) {
            if (s.gzhead.comment) {
              beg = s.pending;
              do {
                if (s.pending === s.pending_buf_size) {
                  if (s.gzhead.hcrc && s.pending > beg) {
                    strm.adler = crc32(
                      strm.adler,
                      s.pending_buf,
                      s.pending - beg,
                      beg
                    );
                  }
                  flush_pending(strm);
                  beg = s.pending;
                  if (s.pending === s.pending_buf_size) {
                    val = 1;
                    break;
                  }
                }
                if (s.gzindex < s.gzhead.comment.length) {
                  val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
                } else {
                  val = 0;
                }
                put_byte(s, val);
              } while (val !== 0);
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(
                  strm.adler,
                  s.pending_buf,
                  s.pending - beg,
                  beg
                );
              }
              if (val === 0) {
                s.status = HCRC_STATE;
              }
            } else {
              s.status = HCRC_STATE;
            }
          }
          if (s.status === HCRC_STATE) {
            if (s.gzhead.hcrc) {
              if (s.pending + 2 > s.pending_buf_size) {
                flush_pending(strm);
              }
              if (s.pending + 2 <= s.pending_buf_size) {
                put_byte(s, strm.adler & 255);
                put_byte(s, (strm.adler >> 8) & 255);
                strm.adler = 0;
                s.status = BUSY_STATE;
              }
            } else {
              s.status = BUSY_STATE;
            }
          }
          if (s.pending !== 0) {
            flush_pending(strm);
            if (strm.avail_out === 0) {
              s.last_flush = -1;
              return Z_OK;
            }
          } else if (
            strm.avail_in === 0 &&
            rank(flush) <= rank(old_flush) &&
            flush !== Z_FINISH
          ) {
            return err(strm, Z_BUF_ERROR);
          }
          if (s.status === FINISH_STATE && strm.avail_in !== 0) {
            return err(strm, Z_BUF_ERROR);
          }
          if (
            strm.avail_in !== 0 ||
            s.lookahead !== 0 ||
            (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)
          ) {
            var bstate =
              s.strategy === Z_HUFFMAN_ONLY
                ? deflate_huff(s, flush)
                : s.strategy === Z_RLE
                ? deflate_rle(s, flush)
                : configuration_table[s.level].func(s, flush);
            if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
              s.status = FINISH_STATE;
            }
            if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
              if (strm.avail_out === 0) {
                s.last_flush = -1;
              }
              return Z_OK;
            }
            if (bstate === BS_BLOCK_DONE) {
              if (flush === Z_PARTIAL_FLUSH) {
                trees._tr_align(s);
              } else if (flush !== Z_BLOCK) {
                trees._tr_stored_block(s, 0, 0, false);
                if (flush === Z_FULL_FLUSH) {
                  zero(s.head);
                  if (s.lookahead === 0) {
                    s.strstart = 0;
                    s.block_start = 0;
                    s.insert = 0;
                  }
                }
              }
              flush_pending(strm);
              if (strm.avail_out === 0) {
                s.last_flush = -1;
                return Z_OK;
              }
            }
          }
          if (flush !== Z_FINISH) {
            return Z_OK;
          }
          if (s.wrap <= 0) {
            return Z_STREAM_END;
          }
          if (s.wrap === 2) {
            put_byte(s, strm.adler & 255);
            put_byte(s, (strm.adler >> 8) & 255);
            put_byte(s, (strm.adler >> 16) & 255);
            put_byte(s, (strm.adler >> 24) & 255);
            put_byte(s, strm.total_in & 255);
            put_byte(s, (strm.total_in >> 8) & 255);
            put_byte(s, (strm.total_in >> 16) & 255);
            put_byte(s, (strm.total_in >> 24) & 255);
          } else {
            putShortMSB(s, strm.adler >>> 16);
            putShortMSB(s, strm.adler & 65535);
          }
          flush_pending(strm);
          if (s.wrap > 0) {
            s.wrap = -s.wrap;
          }
          return s.pending !== 0 ? Z_OK : Z_STREAM_END;
        }
        function deflateEnd(strm) {
          var status;
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          status = strm.state.status;
          if (
            status !== INIT_STATE &&
            status !== EXTRA_STATE &&
            status !== NAME_STATE &&
            status !== COMMENT_STATE &&
            status !== HCRC_STATE &&
            status !== BUSY_STATE &&
            status !== FINISH_STATE
          ) {
            return err(strm, Z_STREAM_ERROR);
          }
          strm.state = null;
          return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
        }
        exports.deflateInit = deflateInit;
        exports.deflateInit2 = deflateInit2;
        exports.deflateReset = deflateReset;
        exports.deflateResetKeep = deflateResetKeep;
        exports.deflateSetHeader = deflateSetHeader;
        exports.deflate = deflate;
        exports.deflateEnd = deflateEnd;
        exports.deflateInfo = "pako deflate (from Nodeca project)";
      },
      {
        "../utils/common": 3,
        "./adler32": 4,
        "./crc32": 6,
        "./messages": 11,
        "./trees": 12,
      },
    ],
    8: [
      function (require, module, exports) {
        "use strict";
        var BAD = 30;
        var TYPE = 12;
        module.exports = function inflate_fast(strm, start) {
          var state;
          var _in;
          var last;
          var _out;
          var beg;
          var end;
          var dmax;
          var wsize;
          var whave;
          var wnext;
          var window;
          var hold;
          var bits;
          var lcode;
          var dcode;
          var lmask;
          var dmask;
          var here;
          var op;
          var len;
          var dist;
          var from;
          var from_source;
          var input, output;
          state = strm.state;
          _in = strm.next_in;
          input = strm.input;
          last = _in + (strm.avail_in - 5);
          _out = strm.next_out;
          output = strm.output;
          beg = _out - (start - strm.avail_out);
          end = _out + (strm.avail_out - 257);
          dmax = state.dmax;
          wsize = state.wsize;
          whave = state.whave;
          wnext = state.wnext;
          window = state.window;
          hold = state.hold;
          bits = state.bits;
          lcode = state.lencode;
          dcode = state.distcode;
          lmask = (1 << state.lenbits) - 1;
          dmask = (1 << state.distbits) - 1;
          top: do {
            if (bits < 15) {
              hold += input[_in++] << bits;
              bits += 8;
              hold += input[_in++] << bits;
              bits += 8;
            }
            here = lcode[hold & lmask];
            dolen: for (;;) {
              op = here >>> 24;
              hold >>>= op;
              bits -= op;
              op = (here >>> 16) & 255;
              if (op === 0) {
                output[_out++] = here & 65535;
              } else if (op & 16) {
                len = here & 65535;
                op &= 15;
                if (op) {
                  if (bits < op) {
                    hold += input[_in++] << bits;
                    bits += 8;
                  }
                  len += hold & ((1 << op) - 1);
                  hold >>>= op;
                  bits -= op;
                }
                if (bits < 15) {
                  hold += input[_in++] << bits;
                  bits += 8;
                  hold += input[_in++] << bits;
                  bits += 8;
                }
                here = dcode[hold & dmask];
                dodist: for (;;) {
                  op = here >>> 24;
                  hold >>>= op;
                  bits -= op;
                  op = (here >>> 16) & 255;
                  if (op & 16) {
                    dist = here & 65535;
                    op &= 15;
                    if (bits < op) {
                      hold += input[_in++] << bits;
                      bits += 8;
                      if (bits < op) {
                        hold += input[_in++] << bits;
                        bits += 8;
                      }
                    }
                    dist += hold & ((1 << op) - 1);
                    if (dist > dmax) {
                      strm.msg = "invalid distance too far back";
                      state.mode = BAD;
                      break top;
                    }
                    hold >>>= op;
                    bits -= op;
                    op = _out - beg;
                    if (dist > op) {
                      op = dist - op;
                      if (op > whave) {
                        if (state.sane) {
                          strm.msg = "invalid distance too far back";
                          state.mode = BAD;
                          break top;
                        }
                      }
                      from = 0;
                      from_source = window;
                      if (wnext === 0) {
                        from += wsize - op;
                        if (op < len) {
                          len -= op;
                          do {
                            output[_out++] = window[from++];
                          } while (--op);
                          from = _out - dist;
                          from_source = output;
                        }
                      } else if (wnext < op) {
                        from += wsize + wnext - op;
                        op -= wnext;
                        if (op < len) {
                          len -= op;
                          do {
                            output[_out++] = window[from++];
                          } while (--op);
                          from = 0;
                          if (wnext < len) {
                            op = wnext;
                            len -= op;
                            do {
                              output[_out++] = window[from++];
                            } while (--op);
                            from = _out - dist;
                            from_source = output;
                          }
                        }
                      } else {
                        from += wnext - op;
                        if (op < len) {
                          len -= op;
                          do {
                            output[_out++] = window[from++];
                          } while (--op);
                          from = _out - dist;
                          from_source = output;
                        }
                      }
                      while (len > 2) {
                        output[_out++] = from_source[from++];
                        output[_out++] = from_source[from++];
                        output[_out++] = from_source[from++];
                        len -= 3;
                      }
                      if (len) {
                        output[_out++] = from_source[from++];
                        if (len > 1) {
                          output[_out++] = from_source[from++];
                        }
                      }
                    } else {
                      from = _out - dist;
                      do {
                        output[_out++] = output[from++];
                        output[_out++] = output[from++];
                        output[_out++] = output[from++];
                        len -= 3;
                      } while (len > 2);
                      if (len) {
                        output[_out++] = output[from++];
                        if (len > 1) {
                          output[_out++] = output[from++];
                        }
                      }
                    }
                  } else if ((op & 64) === 0) {
                    here = dcode[(here & 65535) + (hold & ((1 << op) - 1))];
                    continue dodist;
                  } else {
                    strm.msg = "invalid distance code";
                    state.mode = BAD;
                    break top;
                  }
                  break;
                }
              } else if ((op & 64) === 0) {
                here = lcode[(here & 65535) + (hold & ((1 << op) - 1))];
                continue dolen;
              } else if (op & 32) {
                state.mode = TYPE;
                break top;
              } else {
                strm.msg = "invalid literal/length code";
                state.mode = BAD;
                break top;
              }
              break;
            }
          } while (_in < last && _out < end);
          len = bits >> 3;
          _in -= len;
          bits -= len << 3;
          hold &= (1 << bits) - 1;
          strm.next_in = _in;
          strm.next_out = _out;
          strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
          strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);

          state.hold = hold;
          state.bits = bits;
          return;
        };
      },
      {},
    ],
    9: [
      function (require, module, exports) {
        "use strict";
        var utils = require("../utils/common");
        var adler32 = require("./adler32");
        var crc32 = require("./crc32");
        var inflate_fast = require("./inffast");
        var inflate_table = require("./inftrees");
        var CODES = 0;
        var LENS = 1;
        var DISTS = 2;
        var Z_FINISH = 4;
        var Z_BLOCK = 5;
        var Z_TREES = 6;
        var Z_OK = 0;
        var Z_STREAM_END = 1;
        var Z_NEED_DICT = 2;
        var Z_STREAM_ERROR = -2;
        var Z_DATA_ERROR = -3;
        var Z_MEM_ERROR = -4;
        var Z_BUF_ERROR = -5;
        var Z_DEFLATED = 8;
        var HEAD = 1;
        var FLAGS = 2;
        var TIME = 3;
        var OS = 4;
        var EXLEN = 5;
        var EXTRA = 6;
        var NAME = 7;
        var COMMENT = 8;
        var HCRC = 9;
        var DICTID = 10;
        var DICT = 11;
        var TYPE = 12;
        var TYPEDO = 13;
        var STORED = 14;
        var COPY_ = 15;
        var COPY = 16;
        var TABLE = 17;
        var LENLENS = 18;
        var CODELENS = 19;
        var LEN_ = 20;
        var LEN = 21;
        var LENEXT = 22;
        var DIST = 23;
        var DISTEXT = 24;
        var MATCH = 25;
        var LIT = 26;
        var CHECK = 27;
        var LENGTH = 28;
        var DONE = 29;
        var BAD = 30;
        var MEM = 31;
        var SYNC = 32;
        var ENOUGH_LENS = 852;
        var ENOUGH_DISTS = 592;
        var MAX_WBITS = 15;
        var DEF_WBITS = MAX_WBITS;
        function ZSWAP32(q) {
          return (
            ((q >>> 24) & 255) +
            ((q >>> 8) & 65280) +
            ((q & 65280) << 8) +
            ((q & 255) << 24)
          );
        }
        function InflateState() {
          this.mode = 0;
          this.last = false;
          this.wrap = 0;
          this.havedict = false;
          this.flags = 0;
          this.dmax = 0;
          this.check = 0;
          this.total = 0;
          this.head = null;
          this.wbits = 0;
          this.wsize = 0;
          this.whave = 0;
          this.wnext = 0;
          this.window = null;
          this.hold = 0;
          this.bits = 0;
          this.length = 0;
          this.offset = 0;
          this.extra = 0;
          this.lencode = null;
          this.distcode = null;
          this.lenbits = 0;
          this.distbits = 0;
          this.ncode = 0;
          this.nlen = 0;
          this.ndist = 0;
          this.have = 0;
          this.next = null;
          this.lens = new utils.Buf16(320);
          this.work = new utils.Buf16(288);
          this.lendyn = null;
          this.distdyn = null;
          this.sane = 0;
          this.back = 0;
          this.was = 0;
        }
        function inflateResetKeep(strm) {
          var state;
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          state = strm.state;
          strm.total_in = strm.total_out = state.total = 0;
          strm.msg = "";
          if (state.wrap) {
            strm.adler = state.wrap & 1;
          }
          state.mode = HEAD;
          state.last = 0;
          state.havedict = 0;
          state.dmax = 32768;
          state.head = null;
          state.hold = 0;
          state.bits = 0;
          state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
          state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);
          state.sane = 1;
          state.back = -1;
          return Z_OK;
        }
        function inflateReset(strm) {
          var state;
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          state = strm.state;
          state.wsize = 0;
          state.whave = 0;
          state.wnext = 0;
          return inflateResetKeep(strm);
        }
        function inflateReset2(strm, windowBits) {
          var wrap;
          var state;
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          state = strm.state;
          if (windowBits < 0) {
            wrap = 0;
            windowBits = -windowBits;
          } else {
            wrap = (windowBits >> 4) + 1;
            if (windowBits < 48) {
              windowBits &= 15;
            }
          }
          if (windowBits && (windowBits < 8 || windowBits > 15)) {
            return Z_STREAM_ERROR;
          }
          if (state.window !== null && state.wbits !== windowBits) {
            state.window = null;
          }
          state.wrap = wrap;
          state.wbits = windowBits;
          return inflateReset(strm);
        }
        function inflateInit2(strm, windowBits) {
          var ret;
          var state;
          if (!strm) {
            return Z_STREAM_ERROR;
          }
          state = new InflateState();
          strm.state = state;
          state.window = null;
          ret = inflateReset2(strm, windowBits);
          if (ret !== Z_OK) {
            strm.state = null;
          }
          return ret;
        }
        function inflateInit(strm) {
          return inflateInit2(strm, DEF_WBITS);
        }
        var virgin = true;
        var lenfix, distfix;
        function fixedtables(state) {
          if (virgin) {
            var sym;
            lenfix = new utils.Buf32(512);
            distfix = new utils.Buf32(32);
            sym = 0;
            while (sym < 144) {
              state.lens[sym++] = 8;
            }
            while (sym < 256) {
              state.lens[sym++] = 9;
            }
            while (sym < 280) {
              state.lens[sym++] = 7;
            }
            while (sym < 288) {
              state.lens[sym++] = 8;
            }
            inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, {
              bits: 9,
            });
            sym = 0;
            while (sym < 32) {
              state.lens[sym++] = 5;
            }
            inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, {
              bits: 5,
            });
            virgin = false;
          }
          state.lencode = lenfix;
          state.lenbits = 9;
          state.distcode = distfix;
          state.distbits = 5;
        }
        function updatewindow(strm, src, end, copy) {
          var dist;
          var state = strm.state;
          if (state.window === null) {
            state.wsize = 1 << state.wbits;
            state.wnext = 0;
            state.whave = 0;
            state.window = new utils.Buf8(state.wsize);
          }
          if (copy >= state.wsize) {
            utils.arraySet(
              state.window,
              src,
              end - state.wsize,
              state.wsize,
              0
            );
            state.wnext = 0;
            state.whave = state.wsize;
          } else {
            dist = state.wsize - state.wnext;
            if (dist > copy) {
              dist = copy;
            }
            utils.arraySet(state.window, src, end - copy, dist, state.wnext);
            copy -= dist;
            if (copy) {
              utils.arraySet(state.window, src, end - copy, copy, 0);
              state.wnext = copy;
              state.whave = state.wsize;
            } else {
              state.wnext += dist;
              if (state.wnext === state.wsize) {
                state.wnext = 0;
              }
              if (state.whave < state.wsize) {
                state.whave += dist;
              }
            }
          }
          return 0;
        }
        function inflate(strm, flush) {
          var state;
          var input, output;
          var next;
          var put;
          var have, left;
          var hold;
          var bits;
          var _in, _out;
          var copy;
          var from;
          var from_source;
          var here = 0;
          var here_bits, here_op, here_val;
          var last_bits, last_op, last_val;
          var len;
          var ret;
          var hbuf = new utils.Buf8(4);
          var opts;
          var n;
          var order = [
            16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
          ];
          if (
            !strm ||
            !strm.state ||
            !strm.output ||
            (!strm.input && strm.avail_in !== 0)
          ) {
            return Z_STREAM_ERROR;
          }
          state = strm.state;
          if (state.mode === TYPE) {
            state.mode = TYPEDO;
          }
          put = strm.next_out;
          output = strm.output;
          left = strm.avail_out;
          next = strm.next_in;
          input = strm.input;
          have = strm.avail_in;
          hold = state.hold;
          bits = state.bits;
          _in = have;
          _out = left;
          ret = Z_OK;
          inf_leave: for (;;) {
            switch (state.mode) {
              case HEAD:
                if (state.wrap === 0) {
                  state.mode = TYPEDO;
                  break;
                }
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.wrap & 2 && hold === 35615) {
                  state.check = 0;
                  hbuf[0] = hold & 255;
                  hbuf[1] = (hold >>> 8) & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                  hold = 0;
                  bits = 0;
                  state.mode = FLAGS;
                  break;
                }
                state.flags = 0;
                if (state.head) {
                  state.head.done = false;
                }
                if (
                  !(state.wrap & 1) ||
                  (((hold & 255) << 8) + (hold >> 8)) % 31
                ) {
                  strm.msg = "incorrect header check";
                  state.mode = BAD;
                  break;
                }
                if ((hold & 15) !== Z_DEFLATED) {
                  strm.msg = "unknown compression method";
                  state.mode = BAD;
                  break;
                }
                hold >>>= 4;
                bits -= 4;
                len = (hold & 15) + 8;
                if (state.wbits === 0) {
                  state.wbits = len;
                } else if (len > state.wbits) {
                  strm.msg = "invalid window size";
                  state.mode = BAD;
                  break;
                }
                state.dmax = 1 << len;
                strm.adler = state.check = 1;
                state.mode = hold & 512 ? DICTID : TYPE;
                hold = 0;
                bits = 0;
                break;
              case FLAGS:
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.flags = hold;
                if ((state.flags & 255) !== Z_DEFLATED) {
                  strm.msg = "unknown compression method";
                  state.mode = BAD;
                  break;
                }
                if (state.flags & 57344) {
                  strm.msg = "unknown header flags set";
                  state.mode = BAD;
                  break;
                }
                if (state.head) {
                  state.head.text = (hold >> 8) & 1;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = (hold >>> 8) & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = TIME;
              case TIME:
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.head) {
                  state.head.time = hold;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = (hold >>> 8) & 255;
                  hbuf[2] = (hold >>> 16) & 255;
                  hbuf[3] = (hold >>> 24) & 255;
                  state.check = crc32(state.check, hbuf, 4, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = OS;
              case OS:
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.head) {
                  state.head.xflags = hold & 255;
                  state.head.os = hold >> 8;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = (hold >>> 8) & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = EXLEN;
              case EXLEN:
                if (state.flags & 1024) {
                  while (bits < 16) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.length = hold;
                  if (state.head) {
                    state.head.extra_len = hold;
                  }
                  if (state.flags & 512) {
                    hbuf[0] = hold & 255;
                    hbuf[1] = (hold >>> 8) & 255;
                    state.check = crc32(state.check, hbuf, 2, 0);
                  }
                  hold = 0;
                  bits = 0;
                } else if (state.head) {
                  state.head.extra = null;
                }
                state.mode = EXTRA;
              case EXTRA:
                if (state.flags & 1024) {
                  copy = state.length;
                  if (copy > have) {
                    copy = have;
                  }
                  if (copy) {
                    if (state.head) {
                      len = state.head.extra_len - state.length;
                      if (!state.head.extra) {
                        state.head.extra = new Array(state.head.extra_len);
                      }
                      utils.arraySet(state.head.extra, input, next, copy, len);
                    }
                    if (state.flags & 512) {
                      state.check = crc32(state.check, input, copy, next);
                    }
                    have -= copy;
                    next += copy;
                    state.length -= copy;
                  }
                  if (state.length) {
                    break inf_leave;
                  }
                }
                state.length = 0;
                state.mode = NAME;
              case NAME:
                if (state.flags & 2048) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  copy = 0;
                  do {
                    len = input[next + copy++];
                    if (state.head && len && state.length < 65536) {
                      state.head.name += String.fromCharCode(len);
                    }
                  } while (len && copy < have);
                  if (state.flags & 512) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  if (len) {
                    break inf_leave;
                  }
                } else if (state.head) {
                  state.head.name = null;
                }
                state.length = 0;
                state.mode = COMMENT;
              case COMMENT:
                if (state.flags & 4096) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  copy = 0;
                  do {
                    len = input[next + copy++];
                    if (state.head && len && state.length < 65536) {
                      state.head.comment += String.fromCharCode(len);
                    }
                  } while (len && copy < have);
                  if (state.flags & 512) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  if (len) {
                    break inf_leave;
                  }
                } else if (state.head) {
                  state.head.comment = null;
                }
                state.mode = HCRC;
              case HCRC:
                if (state.flags & 512) {
                  while (bits < 16) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (hold !== (state.check & 65535)) {
                    strm.msg = "header crc mismatch";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                if (state.head) {
                  state.head.hcrc = (state.flags >> 9) & 1;
                  state.head.done = true;
                }
                strm.adler = state.check = 0;
                state.mode = TYPE;
                break;
              case DICTID:
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                strm.adler = state.check = ZSWAP32(hold);
                hold = 0;
                bits = 0;
                state.mode = DICT;
              case DICT:
                if (state.havedict === 0) {
                  strm.next_out = put;
                  strm.avail_out = left;
                  strm.next_in = next;
                  strm.avail_in = have;
                  state.hold = hold;
                  state.bits = bits;
                  return Z_NEED_DICT;
                }
                strm.adler = state.check = 1;
                state.mode = TYPE;
              case TYPE:
                if (flush === Z_BLOCK || flush === Z_TREES) {
                  break inf_leave;
                }
              case TYPEDO:
                if (state.last) {
                  hold >>>= bits & 7;
                  bits -= bits & 7;
                  state.mode = CHECK;
                  break;
                }
                while (bits < 3) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.last = hold & 1;
                hold >>>= 1;
                bits -= 1;
                switch (hold & 3) {
                  case 0:
                    state.mode = STORED;
                    break;
                  case 1:
                    fixedtables(state);
                    state.mode = LEN_;
                    if (flush === Z_TREES) {
                      hold >>>= 2;
                      bits -= 2;
                      break inf_leave;
                    }
                    break;
                  case 2:
                    state.mode = TABLE;
                    break;
                  case 3:
                    strm.msg = "invalid block type";
                    state.mode = BAD;
                }
                hold >>>= 2;
                bits -= 2;
                break;
              case STORED:
                hold >>>= bits & 7;
                bits -= bits & 7;
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if ((hold & 65535) !== ((hold >>> 16) ^ 65535)) {
                  strm.msg = "invalid stored block lengths";
                  state.mode = BAD;
                  break;
                }
                state.length = hold & 65535;
                hold = 0;
                bits = 0;
                state.mode = COPY_;
                if (flush === Z_TREES) {
                  break inf_leave;
                }
              case COPY_:
                state.mode = COPY;
              case COPY:
                copy = state.length;
                if (copy) {
                  if (copy > have) {
                    copy = have;
                  }
                  if (copy > left) {
                    copy = left;
                  }
                  if (copy === 0) {
                    break inf_leave;
                  }
                  utils.arraySet(output, input, next, copy, put);
                  have -= copy;
                  next += copy;
                  left -= copy;
                  put += copy;
                  state.length -= copy;
                  break;
                }
                state.mode = TYPE;
                break;
              case TABLE:
                while (bits < 14) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.nlen = (hold & 31) + 257;
                hold >>>= 5;
                bits -= 5;
                state.ndist = (hold & 31) + 1;
                hold >>>= 5;
                bits -= 5;
                state.ncode = (hold & 15) + 4;
                hold >>>= 4;
                bits -= 4;
                if (state.nlen > 286 || state.ndist > 30) {
                  strm.msg = "too many length or distance symbols";
                  state.mode = BAD;
                  break;
                }
                state.have = 0;
                state.mode = LENLENS;
              case LENLENS:
                while (state.have < state.ncode) {
                  while (bits < 3) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.lens[order[state.have++]] = hold & 7;
                  hold >>>= 3;
                  bits -= 3;
                }
                while (state.have < 19) {
                  state.lens[order[state.have++]] = 0;
                }
                state.lencode = state.lendyn;
                state.lenbits = 7;
                opts = { bits: state.lenbits };
                ret = inflate_table(
                  CODES,
                  state.lens,
                  0,
                  19,
                  state.lencode,
                  0,
                  state.work,
                  opts
                );
                state.lenbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid code lengths set";
                  state.mode = BAD;
                  break;
                }
                state.have = 0;
                state.mode = CODELENS;
              case CODELENS:
                while (state.have < state.nlen + state.ndist) {
                  for (;;) {
                    here = state.lencode[hold & ((1 << state.lenbits) - 1)];
                    here_bits = here >>> 24;
                    here_op = (here >>> 16) & 255;
                    here_val = here & 65535;
                    if (here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (here_val < 16) {
                    hold >>>= here_bits;
                    bits -= here_bits;
                    state.lens[state.have++] = here_val;
                  } else {
                    if (here_val === 16) {
                      n = here_bits + 2;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      if (state.have === 0) {
                        strm.msg = "invalid bit length repeat";
                        state.mode = BAD;
                        break;
                      }
                      len = state.lens[state.have - 1];
                      copy = 3 + (hold & 3);
                      hold >>>= 2;
                      bits -= 2;
                    } else if (here_val === 17) {
                      n = here_bits + 3;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      len = 0;
                      copy = 3 + (hold & 7);
                      hold >>>= 3;
                      bits -= 3;
                    } else {
                      n = here_bits + 7;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      len = 0;
                      copy = 11 + (hold & 127);
                      hold >>>= 7;
                      bits -= 7;
                    }
                    if (state.have + copy > state.nlen + state.ndist) {
                      strm.msg = "invalid bit length repeat";
                      state.mode = BAD;
                      break;
                    }
                    while (copy--) {
                      state.lens[state.have++] = len;
                    }
                  }
                }
                if (state.mode === BAD) {
                  break;
                }
                if (state.lens[256] === 0) {
                  strm.msg = "invalid code -- missing end-of-block";
                  state.mode = BAD;
                  break;
                }
                state.lenbits = 9;
                opts = { bits: state.lenbits };
                ret = inflate_table(
                  LENS,
                  state.lens,
                  0,
                  state.nlen,
                  state.lencode,
                  0,
                  state.work,
                  opts
                );
                state.lenbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid literal/lengths set";
                  state.mode = BAD;
                  break;
                }
                state.distbits = 6;
                state.distcode = state.distdyn;
                opts = { bits: state.distbits };
                ret = inflate_table(
                  DISTS,
                  state.lens,
                  state.nlen,
                  state.ndist,
                  state.distcode,
                  0,
                  state.work,
                  opts
                );
                state.distbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid distances set";
                  state.mode = BAD;
                  break;
                }
                state.mode = LEN_;
                if (flush === Z_TREES) {
                  break inf_leave;
                }
              case LEN_:
                state.mode = LEN;
              case LEN:
                if (have >= 6 && left >= 258) {
                  strm.next_out = put;
                  strm.avail_out = left;
                  strm.next_in = next;
                  strm.avail_in = have;
                  state.hold = hold;
                  state.bits = bits;
                  inflate_fast(strm, _out);
                  put = strm.next_out;
                  output = strm.output;
                  left = strm.avail_out;
                  next = strm.next_in;
                  input = strm.input;
                  have = strm.avail_in;
                  hold = state.hold;
                  bits = state.bits;
                  if (state.mode === TYPE) {
                    state.back = -1;
                  }
                  break;
                }
                state.back = 0;
                for (;;) {
                  here = state.lencode[hold & ((1 << state.lenbits) - 1)];
                  here_bits = here >>> 24;
                  here_op = (here >>> 16) & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (here_op && (here_op & 240) === 0) {
                  last_bits = here_bits;
                  last_op = here_op;
                  last_val = here_val;
                  for (;;) {
                    here =
                      state.lencode[
                        last_val +
                          ((hold & ((1 << (last_bits + last_op)) - 1)) >>
                            last_bits)
                      ];
                    here_bits = here >>> 24;
                    here_op = (here >>> 16) & 255;
                    here_val = here & 65535;
                    if (last_bits + here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= last_bits;
                  bits -= last_bits;
                  state.back += last_bits;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                state.back += here_bits;
                state.length = here_val;
                if (here_op === 0) {
                  state.mode = LIT;
                  break;
                }
                if (here_op & 32) {
                  state.back = -1;
                  state.mode = TYPE;
                  break;
                }
                if (here_op & 64) {
                  strm.msg = "invalid literal/length code";
                  state.mode = BAD;
                  break;
                }
                state.extra = here_op & 15;
                state.mode = LENEXT;
              case LENEXT:
                if (state.extra) {
                  n = state.extra;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.length += hold & ((1 << state.extra) - 1);
                  hold >>>= state.extra;
                  bits -= state.extra;
                  state.back += state.extra;
                }
                state.was = state.length;
                state.mode = DIST;
              case DIST:
                for (;;) {
                  here = state.distcode[hold & ((1 << state.distbits) - 1)];
                  here_bits = here >>> 24;
                  here_op = (here >>> 16) & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if ((here_op & 240) === 0) {
                  last_bits = here_bits;
                  last_op = here_op;
                  last_val = here_val;
                  for (;;) {
                    here =
                      state.distcode[
                        last_val +
                          ((hold & ((1 << (last_bits + last_op)) - 1)) >>
                            last_bits)
                      ];
                    here_bits = here >>> 24;
                    here_op = (here >>> 16) & 255;
                    here_val = here & 65535;
                    if (last_bits + here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= last_bits;
                  bits -= last_bits;
                  state.back += last_bits;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                state.back += here_bits;
                if (here_op & 64) {
                  strm.msg = "invalid distance code";
                  state.mode = BAD;
                  break;
                }
                state.offset = here_val;
                state.extra = here_op & 15;
                state.mode = DISTEXT;
              case DISTEXT:
                if (state.extra) {
                  n = state.extra;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.offset += hold & ((1 << state.extra) - 1);
                  hold >>>= state.extra;
                  bits -= state.extra;
                  state.back += state.extra;
                }
                if (state.offset > state.dmax) {
                  strm.msg = "invalid distance too far back";
                  state.mode = BAD;
                  break;
                }
                state.mode = MATCH;
              case MATCH:
                if (left === 0) {
                  break inf_leave;
                }
                copy = _out - left;
                if (state.offset > copy) {
                  copy = state.offset - copy;
                  if (copy > state.whave) {
                    if (state.sane) {
                      strm.msg = "invalid distance too far back";
                      state.mode = BAD;
                      break;
                    }
                  }
                  if (copy > state.wnext) {
                    copy -= state.wnext;
                    from = state.wsize - copy;
                  } else {
                    from = state.wnext - copy;
                  }
                  if (copy > state.length) {
                    copy = state.length;
                  }
                  from_source = state.window;
                } else {
                  from_source = output;
                  from = put - state.offset;
                  copy = state.length;
                }
                if (copy > left) {
                  copy = left;
                }
                left -= copy;
                state.length -= copy;
                do {
                  output[put++] = from_source[from++];
                } while (--copy);
                if (state.length === 0) {
                  state.mode = LEN;
                }
                break;
              case LIT:
                if (left === 0) {
                  break inf_leave;
                }
                output[put++] = state.length;
                left--;
                state.mode = LEN;
                break;
              case CHECK:
                if (state.wrap) {
                  while (bits < 32) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold |= input[next++] << bits;
                    bits += 8;
                  }
                  _out -= left;
                  strm.total_out += _out;
                  state.total += _out;
                  if (_out) {
                    strm.adler = state.check = state.flags
                      ? crc32(state.check, output, _out, put - _out)
                      : adler32(state.check, output, _out, put - _out);
                  }
                  _out = left;
                  if ((state.flags ? hold : ZSWAP32(hold)) !== state.check) {
                    strm.msg = "incorrect data check";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                state.mode = LENGTH;
              case LENGTH:
                if (state.wrap && state.flags) {
                  while (bits < 32) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (hold !== (state.total & 4294967295)) {
                    strm.msg = "incorrect length check";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                state.mode = DONE;
              case DONE:
                ret = Z_STREAM_END;
                break inf_leave;
              case BAD:
                ret = Z_DATA_ERROR;
                break inf_leave;
              case MEM:
                return Z_MEM_ERROR;
              case SYNC:
              default:
                return Z_STREAM_ERROR;
            }
          }
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          if (
            state.wsize ||
            (_out !== strm.avail_out &&
              state.mode < BAD &&
              (state.mode < CHECK || flush !== Z_FINISH))
          ) {
            if (
              updatewindow(
                strm,
                strm.output,
                strm.next_out,
                _out - strm.avail_out
              )
            ) {
              state.mode = MEM;
              return Z_MEM_ERROR;
            }
          }
          _in -= strm.avail_in;
          _out -= strm.avail_out;
          strm.total_in += _in;
          strm.total_out += _out;
          state.total += _out;
          if (state.wrap && _out) {
            strm.adler = state.check = state.flags
              ? crc32(state.check, output, _out, strm.next_out - _out)
              : adler32(state.check, output, _out, strm.next_out - _out);
          }
          strm.data_type =
            state.bits +
            (state.last ? 64 : 0) +
            (state.mode === TYPE ? 128 : 0) +
            (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
          if (
            ((_in === 0 && _out === 0) || flush === Z_FINISH) &&
            ret === Z_OK
          ) {
            ret = Z_BUF_ERROR;
          }
          return ret;
        }
        function inflateEnd(strm) {
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          var state = strm.state;
          if (state.window) {
            state.window = null;
          }
          strm.state = null;
          return Z_OK;
        }
        function inflateGetHeader(strm, head) {
          var state;
          if (!strm || !strm.state) {
            return Z_STREAM_ERROR;
          }
          state = strm.state;
          if ((state.wrap & 2) === 0) {
            return Z_STREAM_ERROR;
          }
          state.head = head;
          head.done = false;
          return Z_OK;
        }
        exports.inflateReset = inflateReset;
        exports.inflateReset2 = inflateReset2;
        exports.inflateResetKeep = inflateResetKeep;
        exports.inflateInit = inflateInit;
        exports.inflateInit2 = inflateInit2;
        exports.inflate = inflate;
        exports.inflateEnd = inflateEnd;
        exports.inflateGetHeader = inflateGetHeader;
        exports.inflateInfo = "pako inflate (from Nodeca project)";
      },
      {
        "../utils/common": 3,
        "./adler32": 4,
        "./crc32": 6,
        "./inffast": 8,
        "./inftrees": 10,
      },
    ],
    10: [
      function (require, module, exports) {
        "use strict";
        var utils = require("../utils/common");
        var MAXBITS = 15;
        var ENOUGH_LENS = 852;
        var ENOUGH_DISTS = 592;
        var CODES = 0;
        var LENS = 1;
        var DISTS = 2;
        var lbase = [
          3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51,
          59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0,
        ];
        var lext = [
          16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19,
          19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78,
        ];
        var dbase = [
          1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385,
          513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385,
          24577, 0, 0,
        ];
        var dext = [
          16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23,
          23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64,
        ];
        module.exports = function inflate_table(
          type,
          lens,
          lens_index,
          codes,
          table,
          table_index,
          work,
          opts
        ) {
          var bits = opts.bits;
          var len = 0;
          var sym = 0;
          var min = 0,
            max = 0;
          var root = 0;
          var curr = 0;
          var drop = 0;
          var left = 0;
          var used = 0;
          var huff = 0;
          var incr;
          var fill;
          var low;
          var mask;
          var next;
          var base = null;
          var base_index = 0;
          var end;
          var count = new utils.Buf16(MAXBITS + 1);
          var offs = new utils.Buf16(MAXBITS + 1);
          var extra = null;
          var extra_index = 0;
          var here_bits, here_op, here_val;
          for (len = 0; len <= MAXBITS; len++) {
            count[len] = 0;
          }
          for (sym = 0; sym < codes; sym++) {
            count[lens[lens_index + sym]]++;
          }
          root = bits;
          for (max = MAXBITS; max >= 1; max--) {
            if (count[max] !== 0) {
              break;
            }
          }
          if (root > max) {
            root = max;
          }
          if (max === 0) {
            table[table_index++] = (1 << 24) | (64 << 16) | 0;
            table[table_index++] = (1 << 24) | (64 << 16) | 0;
            opts.bits = 1;
            return 0;
          }
          for (min = 1; min < max; min++) {
            if (count[min] !== 0) {
              break;
            }
          }
          if (root < min) {
            root = min;
          }
          left = 1;
          for (len = 1; len <= MAXBITS; len++) {
            left <<= 1;
            left -= count[len];
            if (left < 0) {
              return -1;
            }
          }
          if (left > 0 && (type === CODES || max !== 1)) {
            return -1;
          }
          offs[1] = 0;
          for (len = 1; len < MAXBITS; len++) {
            offs[len + 1] = offs[len] + count[len];
          }
          for (sym = 0; sym < codes; sym++) {
            if (lens[lens_index + sym] !== 0) {
              work[offs[lens[lens_index + sym]]++] = sym;
            }
          }
          if (type === CODES) {
            base = extra = work;
            end = 19;
          } else if (type === LENS) {
            base = lbase;
            base_index -= 257;
            extra = lext;
            extra_index -= 257;
            end = 256;
          } else {
            base = dbase;
            extra = dext;
            end = -1;
          }
          huff = 0;
          sym = 0;
          len = min;
          next = table_index;
          curr = root;
          drop = 0;
          low = -1;
          used = 1 << root;
          mask = used - 1;
          if (
            (type === LENS && used > ENOUGH_LENS) ||
            (type === DISTS && used > ENOUGH_DISTS)
          ) {
            return 1;
          }
          var i = 0;
          for (;;) {
            i++;
            here_bits = len - drop;
            if (work[sym] < end) {
              here_op = 0;
              here_val = work[sym];
            } else if (work[sym] > end) {
              here_op = extra[extra_index + work[sym]];
              here_val = base[base_index + work[sym]];
            } else {
              here_op = 32 + 64;
              here_val = 0;
            }
            incr = 1 << (len - drop);
            fill = 1 << curr;
            min = fill;
            do {
              fill -= incr;
              table[next + (huff >> drop) + fill] =
                (here_bits << 24) | (here_op << 16) | here_val | 0;
            } while (fill !== 0);
            incr = 1 << (len - 1);
            while (huff & incr) {
              incr >>= 1;
            }
            if (incr !== 0) {
              huff &= incr - 1;
              huff += incr;
            } else {
              huff = 0;
            }
            sym++;
            if (--count[len] === 0) {
              if (len === max) {
                break;
              }
              len = lens[lens_index + work[sym]];
            }
            if (len > root && (huff & mask) !== low) {
              if (drop === 0) {
                drop = root;
              }
              next += min;
              curr = len - drop;
              left = 1 << curr;
              while (curr + drop < max) {
                left -= count[curr + drop];
                if (left <= 0) {
                  break;
                }
                curr++;
                left <<= 1;
              }
              used += 1 << curr;
              if (
                (type === LENS && used > ENOUGH_LENS) ||
                (type === DISTS && used > ENOUGH_DISTS)
              ) {
                return 1;
              }
              low = huff & mask;
              table[low] =
                (root << 24) | (curr << 16) | (next - table_index) | 0;
            }
          }
          if (huff !== 0) {
            table[next + huff] = ((len - drop) << 24) | (64 << 16) | 0;
          }
          opts.bits = root;
          return 0;
        };
      },
      { "../utils/common": 3 },
    ],
    11: [
      function (require, module, exports) {
        "use strict";
        module.exports = {
          2: "need dictionary",
          1: "stream end",
          0: "",
          "-1": "file error",
          "-2": "stream error",
          "-3": "data error",
          "-4": "insufficient memory",
          "-5": "buffer error",
          "-6": "incompatible version",
        };
      },
      {},
    ],
    12: [
      function (require, module, exports) {
        "use strict";
        var utils = require("../utils/common");
        var Z_FIXED = 4;
        var Z_BINARY = 0;
        var Z_TEXT = 1;
        var Z_UNKNOWN = 2;
        function zero(buf) {
          var len = buf.length;
          while (--len >= 0) {
            buf[len] = 0;
          }
        }
        var STORED_BLOCK = 0;
        var STATIC_TREES = 1;
        var DYN_TREES = 2;
        var MIN_MATCH = 3;
        var MAX_MATCH = 258;
        var LENGTH_CODES = 29;
        var LITERALS = 256;
        var L_CODES = LITERALS + 1 + LENGTH_CODES;
        var D_CODES = 30;
        var BL_CODES = 19;
        var HEAP_SIZE = 2 * L_CODES + 1;
        var MAX_BITS = 15;
        var Buf_size = 16;
        var MAX_BL_BITS = 7;
        var END_BLOCK = 256;
        var REP_3_6 = 16;
        var REPZ_3_10 = 17;
        var REPZ_11_138 = 18;
        var extra_lbits = [
          0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4,
          4, 5, 5, 5, 5, 0,
        ];
        var extra_dbits = [
          0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10,
          10, 11, 11, 12, 12, 13, 13,
        ];
        var extra_blbits = [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7,
        ];
        var bl_order = [
          16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
        ];
        var DIST_CODE_LEN = 512;
        var static_ltree = new Array((L_CODES + 2) * 2);
        zero(static_ltree);
        var static_dtree = new Array(D_CODES * 2);
        zero(static_dtree);
        var _dist_code = new Array(DIST_CODE_LEN);
        zero(_dist_code);
        var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
        zero(_length_code);
        var base_length = new Array(LENGTH_CODES);
        zero(base_length);
        var base_dist = new Array(D_CODES);
        zero(base_dist);
        var StaticTreeDesc = function (
          static_tree,
          extra_bits,
          extra_base,
          elems,
          max_length
        ) {
          this.static_tree = static_tree;
          this.extra_bits = extra_bits;
          this.extra_base = extra_base;
          this.elems = elems;
          this.max_length = max_length;
          this.has_stree = static_tree && static_tree.length;
        };
        var static_l_desc;
        var static_d_desc;
        var static_bl_desc;
        var TreeDesc = function (dyn_tree, stat_desc) {
          this.dyn_tree = dyn_tree;
          this.max_code = 0;
          this.stat_desc = stat_desc;
        };
        function d_code(dist) {
          return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
        }
        function put_short(s, w) {
          s.pending_buf[s.pending++] = w & 255;
          s.pending_buf[s.pending++] = (w >>> 8) & 255;
        }
        function send_bits(s, value, length) {
          if (s.bi_valid > Buf_size - length) {
            s.bi_buf |= (value << s.bi_valid) & 65535;
            put_short(s, s.bi_buf);
            s.bi_buf = value >> (Buf_size - s.bi_valid);
            s.bi_valid += length - Buf_size;
          } else {
            s.bi_buf |= (value << s.bi_valid) & 65535;
            s.bi_valid += length;
          }
        }
        function send_code(s, c, tree) {
          send_bits(s, tree[c * 2], tree[c * 2 + 1]);
        }
        function bi_reverse(code, len) {
          var res = 0;
          do {
            res |= code & 1;
            code >>>= 1;
            res <<= 1;
          } while (--len > 0);
          return res >>> 1;
        }
        function bi_flush(s) {
          if (s.bi_valid === 16) {
            put_short(s, s.bi_buf);
            s.bi_buf = 0;
            s.bi_valid = 0;
          } else if (s.bi_valid >= 8) {
            s.pending_buf[s.pending++] = s.bi_buf & 255;
            s.bi_buf >>= 8;
            s.bi_valid -= 8;
          }
        }
        function gen_bitlen(s, desc) {
          var tree = desc.dyn_tree;
          var max_code = desc.max_code;
          var stree = desc.stat_desc.static_tree;
          var has_stree = desc.stat_desc.has_stree;
          var extra = desc.stat_desc.extra_bits;
          var base = desc.stat_desc.extra_base;
          var max_length = desc.stat_desc.max_length;
          var h;
          var n, m;
          var bits;
          var xbits;
          var f;
          var overflow = 0;
          for (bits = 0; bits <= MAX_BITS; bits++) {
            s.bl_count[bits] = 0;
          }
          tree[s.heap[s.heap_max] * 2 + 1] = 0;
          for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
            n = s.heap[h];
            bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
            if (bits > max_length) {
              bits = max_length;
              overflow++;
            }
            tree[n * 2 + 1] = bits;
            if (n > max_code) {
              continue;
            }
            s.bl_count[bits]++;
            xbits = 0;
            if (n >= base) {
              xbits = extra[n - base];
            }
            f = tree[n * 2];
            s.opt_len += f * (bits + xbits);
            if (has_stree) {
              s.static_len += f * (stree[n * 2 + 1] + xbits);
            }
          }
          if (overflow === 0) {
            return;
          }
          do {
            bits = max_length - 1;
            while (s.bl_count[bits] === 0) {
              bits--;
            }
            s.bl_count[bits]--;
            s.bl_count[bits + 1] += 2;
            s.bl_count[max_length]--;
            overflow -= 2;
          } while (overflow > 0);
          for (bits = max_length; bits !== 0; bits--) {
            n = s.bl_count[bits];
            while (n !== 0) {
              m = s.heap[--h];
              if (m > max_code) {
                continue;
              }
              if (tree[m * 2 + 1] !== bits) {
                s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
                tree[m * 2 + 1] = bits;
              }
              n--;
            }
          }
        }
        function gen_codes(tree, max_code, bl_count) {
          var next_code = new Array(MAX_BITS + 1);
          var code = 0;
          var bits;
          var n;
          for (bits = 1; bits <= MAX_BITS; bits++) {
            next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
          }
          for (n = 0; n <= max_code; n++) {
            var len = tree[n * 2 + 1];
            if (len === 0) {
              continue;
            }
            tree[n * 2] = bi_reverse(next_code[len]++, len);
          }
        }
        function tr_static_init() {
          var n;
          var bits;
          var length;
          var code;
          var dist;
          var bl_count = new Array(MAX_BITS + 1);
          length = 0;
          for (code = 0; code < LENGTH_CODES - 1; code++) {
            base_length[code] = length;
            for (n = 0; n < 1 << extra_lbits[code]; n++) {
              _length_code[length++] = code;
            }
          }
          _length_code[length - 1] = code;
          dist = 0;
          for (code = 0; code < 16; code++) {
            base_dist[code] = dist;
            for (n = 0; n < 1 << extra_dbits[code]; n++) {
              _dist_code[dist++] = code;
            }
          }
          dist >>= 7;
          for (; code < D_CODES; code++) {
            base_dist[code] = dist << 7;
            for (n = 0; n < 1 << (extra_dbits[code] - 7); n++) {
              _dist_code[256 + dist++] = code;
            }
          }
          for (bits = 0; bits <= MAX_BITS; bits++) {
            bl_count[bits] = 0;
          }
          n = 0;
          while (n <= 143) {
            static_ltree[n * 2 + 1] = 8;
            n++;
            bl_count[8]++;
          }
          while (n <= 255) {
            static_ltree[n * 2 + 1] = 9;
            n++;
            bl_count[9]++;
          }
          while (n <= 279) {
            static_ltree[n * 2 + 1] = 7;
            n++;
            bl_count[7]++;
          }
          while (n <= 287) {
            static_ltree[n * 2 + 1] = 8;
            n++;
            bl_count[8]++;
          }
          gen_codes(static_ltree, L_CODES + 1, bl_count);
          for (n = 0; n < D_CODES; n++) {
            static_dtree[n * 2 + 1] = 5;
            static_dtree[n * 2] = bi_reverse(n, 5);
          }
          static_l_desc = new StaticTreeDesc(
            static_ltree,
            extra_lbits,
            LITERALS + 1,
            L_CODES,
            MAX_BITS
          );
          static_d_desc = new StaticTreeDesc(
            static_dtree,
            extra_dbits,
            0,
            D_CODES,
            MAX_BITS
          );
          static_bl_desc = new StaticTreeDesc(
            new Array(0),
            extra_blbits,
            0,
            BL_CODES,
            MAX_BL_BITS
          );
        }
        function init_block(s) {
          var n;
          for (n = 0; n < L_CODES; n++) {
            s.dyn_ltree[n * 2] = 0;
          }
          for (n = 0; n < D_CODES; n++) {
            s.dyn_dtree[n * 2] = 0;
          }
          for (n = 0; n < BL_CODES; n++) {
            s.bl_tree[n * 2] = 0;
          }
          s.dyn_ltree[END_BLOCK * 2] = 1;
          s.opt_len = s.static_len = 0;
          s.last_lit = s.matches = 0;
        }
        function bi_windup(s) {
          if (s.bi_valid > 8) {
            put_short(s, s.bi_buf);
          } else if (s.bi_valid > 0) {
            s.pending_buf[s.pending++] = s.bi_buf;
          }
          s.bi_buf = 0;
          s.bi_valid = 0;
        }
        function copy_block(s, buf, len, header) {
          bi_windup(s);
          if (header) {
            put_short(s, len);
            put_short(s, ~len);
          }
          utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
          s.pending += len;
        }
        function smaller(tree, n, m, depth) {
          var _n2 = n * 2;
          var _m2 = m * 2;
          return (
            tree[_n2] < tree[_m2] ||
            (tree[_n2] === tree[_m2] && depth[n] <= depth[m])
          );
        }
        function pqdownheap(s, tree, k) {
          var v = s.heap[k];
          var j = k << 1;
          while (j <= s.heap_len) {
            if (
              j < s.heap_len &&
              smaller(tree, s.heap[j + 1], s.heap[j], s.depth)
            ) {
              j++;
            }
            if (smaller(tree, v, s.heap[j], s.depth)) {
              break;
            }
            s.heap[k] = s.heap[j];
            k = j;
            j <<= 1;
          }
          s.heap[k] = v;
        }
        function compress_block(s, ltree, dtree) {
          var dist;
          var lc;
          var lx = 0;
          var code;
          var extra;
          if (s.last_lit !== 0) {
            do {
              dist =
                (s.pending_buf[s.d_buf + lx * 2] << 8) |
                s.pending_buf[s.d_buf + lx * 2 + 1];
              lc = s.pending_buf[s.l_buf + lx];
              lx++;
              if (dist === 0) {
                send_code(s, lc, ltree);
              } else {
                code = _length_code[lc];
                send_code(s, code + LITERALS + 1, ltree);
                extra = extra_lbits[code];
                if (extra !== 0) {
                  lc -= base_length[code];
                  send_bits(s, lc, extra);
                }
                dist--;
                code = d_code(dist);
                send_code(s, code, dtree);
                extra = extra_dbits[code];
                if (extra !== 0) {
                  dist -= base_dist[code];
                  send_bits(s, dist, extra);
                }
              }
            } while (lx < s.last_lit);
          }
          send_code(s, END_BLOCK, ltree);
        }
        function build_tree(s, desc) {
          var tree = desc.dyn_tree;
          var stree = desc.stat_desc.static_tree;
          var has_stree = desc.stat_desc.has_stree;
          var elems = desc.stat_desc.elems;
          var n, m;
          var max_code = -1;
          var node;
          s.heap_len = 0;
          s.heap_max = HEAP_SIZE;
          for (n = 0; n < elems; n++) {
            if (tree[n * 2] !== 0) {
              s.heap[++s.heap_len] = max_code = n;
              s.depth[n] = 0;
            } else {
              tree[n * 2 + 1] = 0;
            }
          }
          while (s.heap_len < 2) {
            node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
            tree[node * 2] = 1;
            s.depth[node] = 0;
            s.opt_len--;
            if (has_stree) {
              s.static_len -= stree[node * 2 + 1];
            }
          }
          desc.max_code = max_code;
          for (n = s.heap_len >> 1; n >= 1; n--) {
            pqdownheap(s, tree, n);
          }
          node = elems;
          do {
            n = s.heap[1];
            s.heap[1] = s.heap[s.heap_len--];
            pqdownheap(s, tree, 1);
            m = s.heap[1];
            s.heap[--s.heap_max] = n;
            s.heap[--s.heap_max] = m;
            tree[node * 2] = tree[n * 2] + tree[m * 2];
            s.depth[node] =
              (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
            tree[n * 2 + 1] = tree[m * 2 + 1] = node;
            s.heap[1] = node++;
            pqdownheap(s, tree, 1);
          } while (s.heap_len >= 2);
          s.heap[--s.heap_max] = s.heap[1];
          gen_bitlen(s, desc);
          gen_codes(tree, max_code, s.bl_count);
        }
        function scan_tree(s, tree, max_code) {
          var n;
          var prevlen = -1;
          var curlen;
          var nextlen = tree[0 * 2 + 1];
          var count = 0;
          var max_count = 7;
          var min_count = 4;
          if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
          }
          tree[(max_code + 1) * 2 + 1] = 65535;
          for (n = 0; n <= max_code; n++) {
            curlen = nextlen;
            nextlen = tree[(n + 1) * 2 + 1];
            if (++count < max_count && curlen === nextlen) {
              continue;
            } else if (count < min_count) {
              s.bl_tree[curlen * 2] += count;
            } else if (curlen !== 0) {
              if (curlen !== prevlen) {
                s.bl_tree[curlen * 2]++;
              }
              s.bl_tree[REP_3_6 * 2]++;
            } else if (count <= 10) {
              s.bl_tree[REPZ_3_10 * 2]++;
            } else {
              s.bl_tree[REPZ_11_138 * 2]++;
            }
            count = 0;
            prevlen = curlen;
            if (nextlen === 0) {
              max_count = 138;
              min_count = 3;
            } else if (curlen === nextlen) {
              max_count = 6;
              min_count = 3;
            } else {
              max_count = 7;
              min_count = 4;
            }
          }
        }
        function send_tree(s, tree, max_code) {
          var n;
          var prevlen = -1;
          var curlen;
          var nextlen = tree[0 * 2 + 1];
          var count = 0;
          var max_count = 7;
          var min_count = 4;
          if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
          }
          for (n = 0; n <= max_code; n++) {
            curlen = nextlen;
            nextlen = tree[(n + 1) * 2 + 1];
            if (++count < max_count && curlen === nextlen) {
              continue;
            } else if (count < min_count) {
              do {
                send_code(s, curlen, s.bl_tree);
              } while (--count !== 0);
            } else if (curlen !== 0) {
              if (curlen !== prevlen) {
                send_code(s, curlen, s.bl_tree);
                count--;
              }
              send_code(s, REP_3_6, s.bl_tree);
              send_bits(s, count - 3, 2);
            } else if (count <= 10) {
              send_code(s, REPZ_3_10, s.bl_tree);
              send_bits(s, count - 3, 3);
            } else {
              send_code(s, REPZ_11_138, s.bl_tree);
              send_bits(s, count - 11, 7);
            }
            count = 0;
            prevlen = curlen;
            if (nextlen === 0) {
              max_count = 138;
              min_count = 3;
            } else if (curlen === nextlen) {
              max_count = 6;
              min_count = 3;
            } else {
              max_count = 7;
              min_count = 4;
            }
          }
        }
        function build_bl_tree(s) {
          var max_blindex;
          scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
          scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
          build_tree(s, s.bl_desc);
          for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
            if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
              break;
            }
          }
          s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
          return max_blindex;
        }
        function send_all_trees(s, lcodes, dcodes, blcodes) {
          var rank;
          send_bits(s, lcodes - 257, 5);
          send_bits(s, dcodes - 1, 5);
          send_bits(s, blcodes - 4, 4);
          for (rank = 0; rank < blcodes; rank++) {
            send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1], 3);
          }
          send_tree(s, s.dyn_ltree, lcodes - 1);
          send_tree(s, s.dyn_dtree, dcodes - 1);
        }
        function detect_data_type(s) {
          var black_mask = 4093624447;
          var n;
          for (n = 0; n <= 31; n++, black_mask >>>= 1) {
            if (black_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
              return Z_BINARY;
            }
          }
          if (
            s.dyn_ltree[9 * 2] !== 0 ||
            s.dyn_ltree[10 * 2] !== 0 ||
            s.dyn_ltree[13 * 2] !== 0
          ) {
            return Z_TEXT;
          }
          for (n = 32; n < LITERALS; n++) {
            if (s.dyn_ltree[n * 2] !== 0) {
              return Z_TEXT;
            }
          }
          return Z_BINARY;
        }
        var static_init_done = false;
        function _tr_init(s) {
          if (!static_init_done) {
            tr_static_init();
            static_init_done = true;
          }
          s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
          s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
          s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
          s.bi_buf = 0;
          s.bi_valid = 0;
          init_block(s);
        }
        function _tr_stored_block(s, buf, stored_len, last) {
          send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
          copy_block(s, buf, stored_len, true);
        }
        function _tr_align(s) {
          send_bits(s, STATIC_TREES << 1, 3);
          send_code(s, END_BLOCK, static_ltree);
          bi_flush(s);
        }
        function _tr_flush_block(s, buf, stored_len, last) {
          var opt_lenb, static_lenb;
          var max_blindex = 0;
          if (s.level > 0) {
            if (s.strm.data_type === Z_UNKNOWN) {
              s.strm.data_type = detect_data_type(s);
            }
            build_tree(s, s.l_desc);
            build_tree(s, s.d_desc);
            max_blindex = build_bl_tree(s);
            opt_lenb = (s.opt_len + 3 + 7) >>> 3;
            static_lenb = (s.static_len + 3 + 7) >>> 3;
            if (static_lenb <= opt_lenb) {
              opt_lenb = static_lenb;
            }
          } else {
            opt_lenb = static_lenb = stored_len + 5;
          }
          if (stored_len + 4 <= opt_lenb && buf !== -1) {
            _tr_stored_block(s, buf, stored_len, last);
          } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {
            send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
            compress_block(s, static_ltree, static_dtree);
          } else {
            send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
            send_all_trees(
              s,
              s.l_desc.max_code + 1,
              s.d_desc.max_code + 1,
              max_blindex + 1
            );
            compress_block(s, s.dyn_ltree, s.dyn_dtree);
          }
          init_block(s);
          if (last) {
            bi_windup(s);
          }
        }
        function _tr_tally(s, dist, lc) {
          s.pending_buf[s.d_buf + s.last_lit * 2] = (dist >>> 8) & 255;
          s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 255;
          s.pending_buf[s.l_buf + s.last_lit] = lc & 255;
          s.last_lit++;
          if (dist === 0) {
            s.dyn_ltree[lc * 2]++;
          } else {
            s.matches++;
            dist--;
            s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++;
            s.dyn_dtree[d_code(dist) * 2]++;
          }
          return s.last_lit === s.lit_bufsize - 1;
        }
        exports._tr_init = _tr_init;
        exports._tr_stored_block = _tr_stored_block;
        exports._tr_flush_block = _tr_flush_block;
        exports._tr_tally = _tr_tally;
        exports._tr_align = _tr_align;
      },
      { "../utils/common": 3 },
    ],
    13: [
      function (require, module, exports) {
        "use strict";
        function ZStream() {
          this.input = null;
          this.next_in = 0;
          this.avail_in = 0;
          this.total_in = 0;
          this.output = null;
          this.next_out = 0;
          this.avail_out = 0;
          this.total_out = 0;
          this.msg = "";
          this.state = null;
          this.data_type = 2;
          this.adler = 0;
        }
        module.exports = ZStream;
      },
      {},
    ],
    14: [
      function (require, module, exports) {
        (function (process, Buffer) {
          var msg = require("pako/lib/zlib/messages");
          var zstream = require("pako/lib/zlib/zstream");
          var zlib_deflate = require("pako/lib/zlib/deflate.js");
          var zlib_inflate = require("pako/lib/zlib/inflate.js");
          var constants = require("pako/lib/zlib/constants");
          for (var key in constants) {
            exports[key] = constants[key];
          }
          exports.NONE = 0;
          exports.DEFLATE = 1;
          exports.INFLATE = 2;
          exports.GZIP = 3;
          exports.GUNZIP = 4;
          exports.DEFLATERAW = 5;
          exports.INFLATERAW = 6;
          exports.UNZIP = 7;
          function Zlib(mode) {
            if (mode < exports.DEFLATE || mode > exports.UNZIP)
              throw new TypeError("Bad argument");
            this.mode = mode;
            this.init_done = false;
            this.write_in_progress = false;
            this.pending_close = false;
            this.windowBits = 0;
            this.level = 0;
            this.memLevel = 0;
            this.strategy = 0;
            this.dictionary = null;
          }
          Zlib.prototype.init = function (
            windowBits,
            level,
            memLevel,
            strategy,
            dictionary
          ) {
            this.windowBits = windowBits;
            this.level = level;
            this.memLevel = memLevel;
            this.strategy = strategy;
            if (this.mode === exports.GZIP || this.mode === exports.GUNZIP)
              this.windowBits += 16;
            if (this.mode === exports.UNZIP) this.windowBits += 32;
            if (
              this.mode === exports.DEFLATERAW ||
              this.mode === exports.INFLATERAW
            )
              this.windowBits = -this.windowBits;
            this.strm = new zstream();
            switch (this.mode) {
              case exports.DEFLATE:
              case exports.GZIP:
              case exports.DEFLATERAW:
                var status = zlib_deflate.deflateInit2(
                  this.strm,
                  this.level,
                  exports.Z_DEFLATED,
                  this.windowBits,
                  this.memLevel,
                  this.strategy
                );
                break;
              case exports.INFLATE:
              case exports.GUNZIP:
              case exports.INFLATERAW:
              case exports.UNZIP:
                var status = zlib_inflate.inflateInit2(
                  this.strm,
                  this.windowBits
                );
                break;
              default:
                throw new Error("Unknown mode " + this.mode);
            }
            if (status !== exports.Z_OK) {
              this._error(status);
              return;
            }
            this.write_in_progress = false;
            this.init_done = true;
          };
          Zlib.prototype.params = function () {
            throw new Error("deflateParams Not supported");
          };
          Zlib.prototype._writeCheck = function () {
            if (!this.init_done) throw new Error("write before init");
            if (this.mode === exports.NONE)
              throw new Error("already finalized");
            if (this.write_in_progress)
              throw new Error("write already in progress");
            if (this.pending_close) throw new Error("close is pending");
          };
          Zlib.prototype.write = function (
            flush,
            input,
            in_off,
            in_len,
            out,
            out_off,
            out_len
          ) {
            this._writeCheck();
            this.write_in_progress = true;
            var self = this;
            process.nextTick(function () {
              self.write_in_progress = false;
              var res = self._write(
                flush,
                input,
                in_off,
                in_len,
                out,
                out_off,
                out_len
              );
              self.callback(res[0], res[1]);
              if (self.pending_close) self.close();
            });
            return this;
          };
          function bufferSet(data, offset) {
            for (var i = 0; i < data.length; i++) {
              this[offset + i] = data[i];
            }
          }
          Zlib.prototype.writeSync = function (
            flush,
            input,
            in_off,
            in_len,
            out,
            out_off,
            out_len
          ) {
            this._writeCheck();
            return this._write(
              flush,
              input,
              in_off,
              in_len,
              out,
              out_off,
              out_len
            );
          };
          Zlib.prototype._write = function (
            flush,
            input,
            in_off,
            in_len,
            out,
            out_off,
            out_len
          ) {
            this.write_in_progress = true;
            if (
              flush !== exports.Z_NO_FLUSH &&
              flush !== exports.Z_PARTIAL_FLUSH &&
              flush !== exports.Z_SYNC_FLUSH &&
              flush !== exports.Z_FULL_FLUSH &&
              flush !== exports.Z_FINISH &&
              flush !== exports.Z_BLOCK
            ) {
              throw new Error("Invalid flush value");
            }
            if (input == null) {
              input = new Buffer(0);
              in_len = 0;
              in_off = 0;
            }
            if (out._set) out.set = out._set;
            else out.set = bufferSet;
            var strm = this.strm;
            strm.avail_in = in_len;
            strm.input = input;
            strm.next_in = in_off;
            strm.avail_out = out_len;
            strm.output = out;
            strm.next_out = out_off;
            switch (this.mode) {
              case exports.DEFLATE:
              case exports.GZIP:
              case exports.DEFLATERAW:
                var status = zlib_deflate.deflate(strm, flush);
                break;
              case exports.UNZIP:
              case exports.INFLATE:
              case exports.GUNZIP:
              case exports.INFLATERAW:
                var status = zlib_inflate.inflate(strm, flush);
                break;
              default:
                throw new Error("Unknown mode " + this.mode);
            }
            if (status !== exports.Z_STREAM_END && status !== exports.Z_OK) {
              this._error(status);
            }
            this.write_in_progress = false;
            return [strm.avail_in, strm.avail_out];
          };
          Zlib.prototype.close = function () {
            if (this.write_in_progress) {
              this.pending_close = true;
              return;
            }
            this.pending_close = false;
            if (
              this.mode === exports.DEFLATE ||
              this.mode === exports.GZIP ||
              this.mode === exports.DEFLATERAW
            ) {
              zlib_deflate.deflateEnd(this.strm);
            } else {
              zlib_inflate.inflateEnd(this.strm);
            }
            this.mode = exports.NONE;
          };
          Zlib.prototype.reset = function () {
            switch (this.mode) {
              case exports.DEFLATE:
              case exports.DEFLATERAW:
                var status = zlib_deflate.deflateReset(this.strm);
                break;
              case exports.INFLATE:
              case exports.INFLATERAW:
                var status = zlib_inflate.inflateReset(this.strm);
                break;
            }
            if (status !== exports.Z_OK) {
              this._error(status);
            }
          };
          Zlib.prototype._error = function (status) {
            this.onerror(msg[status] + ": " + this.strm.msg, status);
            this.write_in_progress = false;
            if (this.pending_close) this.close();
          };
          exports.Zlib = Zlib;
        }.call(this, require("_process"), require("buffer").Buffer));
      },
      {
        _process: 23,
        buffer: 16,
        "pako/lib/zlib/constants": 5,
        "pako/lib/zlib/deflate.js": 7,
        "pako/lib/zlib/inflate.js": 9,
        "pako/lib/zlib/messages": 11,
        "pako/lib/zlib/zstream": 13,
      },
    ],
    15: [
      function (require, module, exports) {
        (function (process, Buffer) {
          var Transform = require("_stream_transform");
          var binding = require("./binding");
          var util = require("util");
          var assert = require("assert").ok;
          binding.Z_MIN_WINDOWBITS = 8;
          binding.Z_MAX_WINDOWBITS = 15;
          binding.Z_DEFAULT_WINDOWBITS = 15;
          binding.Z_MIN_CHUNK = 64;
          binding.Z_MAX_CHUNK = Infinity;
          binding.Z_DEFAULT_CHUNK = 16 * 1024;
          binding.Z_MIN_MEMLEVEL = 1;
          binding.Z_MAX_MEMLEVEL = 9;
          binding.Z_DEFAULT_MEMLEVEL = 8;
          binding.Z_MIN_LEVEL = -1;
          binding.Z_MAX_LEVEL = 9;
          binding.Z_DEFAULT_LEVEL = binding.Z_DEFAULT_COMPRESSION;
          Object.keys(binding).forEach(function (k) {
            if (k.match(/^Z/)) exports[k] = binding[k];
          });
          exports.codes = {
            Z_OK: binding.Z_OK,
            Z_STREAM_END: binding.Z_STREAM_END,
            Z_NEED_DICT: binding.Z_NEED_DICT,
            Z_ERRNO: binding.Z_ERRNO,
            Z_STREAM_ERROR: binding.Z_STREAM_ERROR,
            Z_DATA_ERROR: binding.Z_DATA_ERROR,
            Z_MEM_ERROR: binding.Z_MEM_ERROR,
            Z_BUF_ERROR: binding.Z_BUF_ERROR,
            Z_VERSION_ERROR: binding.Z_VERSION_ERROR,
          };
          Object.keys(exports.codes).forEach(function (k) {
            exports.codes[exports.codes[k]] = k;
          });
          exports.Deflate = Deflate;
          exports.Inflate = Inflate;
          exports.Gzip = Gzip;
          exports.Gunzip = Gunzip;
          exports.DeflateRaw = DeflateRaw;
          exports.InflateRaw = InflateRaw;
          exports.Unzip = Unzip;
          exports.createDeflate = function (o) {
            return new Deflate(o);
          };
          exports.createInflate = function (o) {
            return new Inflate(o);
          };
          exports.createDeflateRaw = function (o) {
            return new DeflateRaw(o);
          };
          exports.createInflateRaw = function (o) {
            return new InflateRaw(o);
          };
          exports.createGzip = function (o) {
            return new Gzip(o);
          };
          exports.createGunzip = function (o) {
            return new Gunzip(o);
          };
          exports.createUnzip = function (o) {
            return new Unzip(o);
          };
          exports.deflate = function (buffer, opts, callback) {
            if (typeof opts === "function") {
              callback = opts;
              opts = {};
            }
            return zlibBuffer(new Deflate(opts), buffer, callback);
          };
          exports.deflateSync = function (buffer, opts) {
            return zlibBufferSync(new Deflate(opts), buffer);
          };
          exports.gzip = function (buffer, opts, callback) {
            if (typeof opts === "function") {
              callback = opts;
              opts = {};
            }
            return zlibBuffer(new Gzip(opts), buffer, callback);
          };
          exports.gzipSync = function (buffer, opts) {
            return zlibBufferSync(new Gzip(opts), buffer);
          };
          exports.deflateRaw = function (buffer, opts, callback) {
            if (typeof opts === "function") {
              callback = opts;
              opts = {};
            }
            return zlibBuffer(new DeflateRaw(opts), buffer, callback);
          };
          exports.deflateRawSync = function (buffer, opts) {
            return zlibBufferSync(new DeflateRaw(opts), buffer);
          };
          exports.unzip = function (buffer, opts, callback) {
            if (typeof opts === "function") {
              callback = opts;
              opts = {};
            }
            return zlibBuffer(new Unzip(opts), buffer, callback);
          };
          exports.unzipSync = function (buffer, opts) {
            return zlibBufferSync(new Unzip(opts), buffer);
          };
          exports.inflate = function (buffer, opts, callback) {
            if (typeof opts === "function") {
              callback = opts;
              opts = {};
            }
            return zlibBuffer(new Inflate(opts), buffer, callback);
          };
          exports.inflateSync = function (buffer, opts) {
            return zlibBufferSync(new Inflate(opts), buffer);
          };
          exports.gunzip = function (buffer, opts, callback) {
            if (typeof opts === "function") {
              callback = opts;
              opts = {};
            }
            return zlibBuffer(new Gunzip(opts), buffer, callback);
          };
          exports.gunzipSync = function (buffer, opts) {
            return zlibBufferSync(new Gunzip(opts), buffer);
          };
          exports.inflateRaw = function (buffer, opts, callback) {
            if (typeof opts === "function") {
              callback = opts;
              opts = {};
            }
            return zlibBuffer(new InflateRaw(opts), buffer, callback);
          };
          exports.inflateRawSync = function (buffer, opts) {
            return zlibBufferSync(new InflateRaw(opts), buffer);
          };
          function zlibBuffer(engine, buffer, callback) {
            var buffers = [];
            var nread = 0;
            engine.on("error", onError);
            engine.on("end", onEnd);
            engine.end(buffer);
            flow();
            function flow() {
              var chunk;
              while (null !== (chunk = engine.read())) {
                buffers.push(chunk);
                nread += chunk.length;
              }
              engine.once("readable", flow);
            }
            function onError(err) {
              engine.removeListener("end", onEnd);
              engine.removeListener("readable", flow);
              callback(err);
            }
            function onEnd() {
              var buf = Buffer.concat(buffers, nread);
              buffers = [];
              callback(null, buf);
              engine.close();
            }
          }
          function zlibBufferSync(engine, buffer) {
            if (typeof buffer === "string") buffer = new Buffer(buffer);
            if (!Buffer.isBuffer(buffer))
              throw new TypeError("Not a string or buffer");
            var flushFlag = binding.Z_FINISH;
            return engine._processChunk(buffer, flushFlag);
          }
          function Deflate(opts) {
            if (!(this instanceof Deflate)) return new Deflate(opts);
            Zlib.call(this, opts, binding.DEFLATE);
          }
          function Inflate(opts) {
            if (!(this instanceof Inflate)) return new Inflate(opts);
            Zlib.call(this, opts, binding.INFLATE);
          }
          function Gzip(opts) {
            if (!(this instanceof Gzip)) return new Gzip(opts);
            Zlib.call(this, opts, binding.GZIP);
          }
          function Gunzip(opts) {
            if (!(this instanceof Gunzip)) return new Gunzip(opts);
            Zlib.call(this, opts, binding.GUNZIP);
          }
          function DeflateRaw(opts) {
            if (!(this instanceof DeflateRaw)) return new DeflateRaw(opts);
            Zlib.call(this, opts, binding.DEFLATERAW);
          }
          function InflateRaw(opts) {
            if (!(this instanceof InflateRaw)) return new InflateRaw(opts);
            Zlib.call(this, opts, binding.INFLATERAW);
          }
          function Unzip(opts) {
            if (!(this instanceof Unzip)) return new Unzip(opts);
            Zlib.call(this, opts, binding.UNZIP);
          }
          function Zlib(opts, mode) {
            this._opts = opts = opts || {};
            this._chunkSize = opts.chunkSize || exports.Z_DEFAULT_CHUNK;
            Transform.call(this, opts);
            if (opts.flush) {
              if (
                opts.flush !== binding.Z_NO_FLUSH &&
                opts.flush !== binding.Z_PARTIAL_FLUSH &&
                opts.flush !== binding.Z_SYNC_FLUSH &&
                opts.flush !== binding.Z_FULL_FLUSH &&
                opts.flush !== binding.Z_FINISH &&
                opts.flush !== binding.Z_BLOCK
              ) {
                throw new Error("Invalid flush flag: " + opts.flush);
              }
            }
            this._flushFlag = opts.flush || binding.Z_NO_FLUSH;
            if (opts.chunkSize) {
              if (
                opts.chunkSize < exports.Z_MIN_CHUNK ||
                opts.chunkSize > exports.Z_MAX_CHUNK
              ) {
                throw new Error("Invalid chunk size: " + opts.chunkSize);
              }
            }
            if (opts.windowBits) {
              if (
                opts.windowBits < exports.Z_MIN_WINDOWBITS ||
                opts.windowBits > exports.Z_MAX_WINDOWBITS
              ) {
                throw new Error("Invalid windowBits: " + opts.windowBits);
              }
            }
            if (opts.level) {
              if (
                opts.level < exports.Z_MIN_LEVEL ||
                opts.level > exports.Z_MAX_LEVEL
              ) {
                throw new Error("Invalid compression level: " + opts.level);
              }
            }
            if (opts.memLevel) {
              if (
                opts.memLevel < exports.Z_MIN_MEMLEVEL ||
                opts.memLevel > exports.Z_MAX_MEMLEVEL
              ) {
                throw new Error("Invalid memLevel: " + opts.memLevel);
              }
            }
            if (opts.strategy) {
              if (
                opts.strategy != exports.Z_FILTERED &&
                opts.strategy != exports.Z_HUFFMAN_ONLY &&
                opts.strategy != exports.Z_RLE &&
                opts.strategy != exports.Z_FIXED &&
                opts.strategy != exports.Z_DEFAULT_STRATEGY
              ) {
                throw new Error("Invalid strategy: " + opts.strategy);
              }
            }
            if (opts.dictionary) {
              if (!Buffer.isBuffer(opts.dictionary)) {
                throw new Error(
                  "Invalid dictionary: it should be a Buffer instance"
                );
              }
            }
            this._binding = new binding.Zlib(mode);
            var self = this;
            this._hadError = false;
            this._binding.onerror = function (message, errno) {
              self._binding = null;
              self._hadError = true;
              var error = new Error(message);
              error.errno = errno;
              error.code = exports.codes[errno];
              self.emit("error", error);
            };
            var level = exports.Z_DEFAULT_COMPRESSION;
            if (typeof opts.level === "number") level = opts.level;
            var strategy = exports.Z_DEFAULT_STRATEGY;
            if (typeof opts.strategy === "number") strategy = opts.strategy;
            this._binding.init(
              opts.windowBits || exports.Z_DEFAULT_WINDOWBITS,
              level,
              opts.memLevel || exports.Z_DEFAULT_MEMLEVEL,
              strategy,
              opts.dictionary
            );
            this._buffer = new Buffer(this._chunkSize);
            this._offset = 0;
            this._closed = false;
            this._level = level;
            this._strategy = strategy;
            this.once("end", this.close);
          }
          util.inherits(Zlib, Transform);
          Zlib.prototype.params = function (level, strategy, callback) {
            if (level < exports.Z_MIN_LEVEL || level > exports.Z_MAX_LEVEL) {
              throw new RangeError("Invalid compression level: " + level);
            }
            if (
              strategy != exports.Z_FILTERED &&
              strategy != exports.Z_HUFFMAN_ONLY &&
              strategy != exports.Z_RLE &&
              strategy != exports.Z_FIXED &&
              strategy != exports.Z_DEFAULT_STRATEGY
            ) {
              throw new TypeError("Invalid strategy: " + strategy);
            }
            if (this._level !== level || this._strategy !== strategy) {
              var self = this;
              this.flush(binding.Z_SYNC_FLUSH, function () {
                self._binding.params(level, strategy);
                if (!self._hadError) {
                  self._level = level;
                  self._strategy = strategy;
                  if (callback) callback();
                }
              });
            } else {
              process.nextTick(callback);
            }
          };
          Zlib.prototype.reset = function () {
            return this._binding.reset();
          };
          Zlib.prototype._flush = function (callback) {
            this._transform(new Buffer(0), "", callback);
          };
          Zlib.prototype.flush = function (kind, callback) {
            var ws = this._writableState;
            if (typeof kind === "function" || (kind === void 0 && !callback)) {
              callback = kind;
              kind = binding.Z_FULL_FLUSH;
            }
            if (ws.ended) {
              if (callback) process.nextTick(callback);
            } else if (ws.ending) {
              if (callback) this.once("end", callback);
            } else if (ws.needDrain) {
              var self = this;
              this.once("drain", function () {
                self.flush(callback);
              });
            } else {
              this._flushFlag = kind;
              this.write(new Buffer(0), "", callback);
            }
          };
          Zlib.prototype.close = function (callback) {
            if (callback) process.nextTick(callback);
            if (this._closed) return;
            this._closed = true;
            this._binding.close();
            var self = this;
            process.nextTick(function () {
              self.emit("close");
            });
          };
          Zlib.prototype._transform = function (chunk, encoding, cb) {
            var flushFlag;
            var ws = this._writableState;
            var ending = ws.ending || ws.ended;
            var last = ending && (!chunk || ws.length === chunk.length);
            if (!chunk === null && !Buffer.isBuffer(chunk))
              return cb(new Error("invalid input"));
            if (last) flushFlag = binding.Z_FINISH;
            else {
              flushFlag = this._flushFlag;
              if (chunk.length >= ws.length) {
                this._flushFlag = this._opts.flush || binding.Z_NO_FLUSH;
              }
            }
            var self = this;
            this._processChunk(chunk, flushFlag, cb);
          };
          Zlib.prototype._processChunk = function (chunk, flushFlag, cb) {
            var availInBefore = chunk && chunk.length;
            var availOutBefore = this._chunkSize - this._offset;
            var inOff = 0;
            var self = this;
            var async = typeof cb === "function";
            if (!async) {
              var buffers = [];
              var nread = 0;
              var error;
              this.on("error", function (er) {
                error = er;
              });
              do {
                var res = this._binding.writeSync(
                  flushFlag,
                  chunk,
                  inOff,
                  availInBefore,
                  this._buffer,
                  this._offset,
                  availOutBefore
                );
              } while (!this._hadError && callback(res[0], res[1]));
              if (this._hadError) {
                throw error;
              }
              var buf = Buffer.concat(buffers, nread);
              this.close();
              return buf;
            }
            var req = this._binding.write(
              flushFlag,
              chunk,
              inOff,
              availInBefore,
              this._buffer,
              this._offset,
              availOutBefore
            );
            req.buffer = chunk;
            req.callback = callback;
            function callback(availInAfter, availOutAfter) {
              if (self._hadError) return;
              var have = availOutBefore - availOutAfter;
              assert(have >= 0, "have should not go down");
              if (have > 0) {
                var out = self._buffer.slice(self._offset, self._offset + have);
                self._offset += have;
                if (async) {
                  self.push(out);
                } else {
                  buffers.push(out);
                  nread += out.length;
                }
              }
              if (availOutAfter === 0 || self._offset >= self._chunkSize) {
                availOutBefore = self._chunkSize;
                self._offset = 0;
                self._buffer = new Buffer(self._chunkSize);
              }
              if (availOutAfter === 0) {
                inOff += availInBefore - availInAfter;
                availInBefore = availInAfter;
                if (!async) return true;
                var newReq = self._binding.write(
                  flushFlag,
                  chunk,
                  inOff,
                  availInBefore,
                  self._buffer,
                  self._offset,
                  self._chunkSize
                );
                newReq.callback = callback;
                newReq.buffer = chunk;
                return;
              }
              if (!async) return false;
              cb();
            }
          };
          util.inherits(Deflate, Zlib);
          util.inherits(Inflate, Zlib);
          util.inherits(Gzip, Zlib);
          util.inherits(Gunzip, Zlib);
          util.inherits(DeflateRaw, Zlib);
          util.inherits(InflateRaw, Zlib);
          util.inherits(Unzip, Zlib);
        }.call(this, require("_process"), require("buffer").Buffer));
      },
      {
        "./binding": 14,
        _process: 23,
        _stream_transform: 33,
        assert: 1,
        buffer: 16,
        util: 38,
      },
    ],
    16: [
      function (require, module, exports) {
        var base64 = require("base64-js");
        var ieee754 = require("ieee754");
        var isArray = require("is-array");
        exports.Buffer = Buffer;
        exports.SlowBuffer = SlowBuffer;
        exports.INSPECT_MAX_BYTES = 50;
        Buffer.poolSize = 8192;
        var kMaxLength = 1073741823;
        var rootParent = {};
        Buffer.TYPED_ARRAY_SUPPORT = (function () {
          try {
            var buf = new ArrayBuffer(0);
            var arr = new Uint8Array(buf);
            arr.foo = function () {
              return 42;
            };
            return (
              42 === arr.foo() &&
              typeof arr.subarray === "function" &&
              new Uint8Array(1).subarray(1, 1).byteLength === 0
            );
          } catch (e) {
            return false;
          }
        })();
        function Buffer(subject, encoding, noZero) {
          if (!(this instanceof Buffer))
            return new Buffer(subject, encoding, noZero);
          var type = typeof subject;
          var length;
          if (type === "number") length = subject > 0 ? subject >>> 0 : 0;
          else if (type === "string") {
            length = Buffer.byteLength(subject, encoding);
          } else if (type === "object" && subject !== null) {
            if (subject.type === "Buffer" && isArray(subject.data))
              subject = subject.data;
            length = +subject.length > 0 ? Math.floor(+subject.length) : 0;
          } else
            throw new TypeError(
              "must start with number, buffer, array or string"
            );
          if (length > kMaxLength)
            throw new RangeError(
              "Attempt to allocate Buffer larger than maximum " +
                "size: 0x" +
                kMaxLength.toString(16) +
                " bytes"
            );
          var buf;
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            buf = Buffer._augment(new Uint8Array(length));
          } else {
            buf = this;
            buf.length = length;
            buf._isBuffer = true;
          }
          var i;
          if (
            Buffer.TYPED_ARRAY_SUPPORT &&
            typeof subject.byteLength === "number"
          ) {
            buf._set(subject);
          } else if (isArrayish(subject)) {
            if (Buffer.isBuffer(subject)) {
              for (i = 0; i < length; i++) buf[i] = subject.readUInt8(i);
            } else {
              for (i = 0; i < length; i++)
                buf[i] = ((subject[i] % 256) + 256) % 256;
            }
          } else if (type === "string") {
            buf.write(subject, 0, encoding);
          } else if (
            type === "number" &&
            !Buffer.TYPED_ARRAY_SUPPORT &&
            !noZero
          ) {
            for (i = 0; i < length; i++) {
              buf[i] = 0;
            }
          }
          if (length > 0 && length <= Buffer.poolSize) buf.parent = rootParent;
          return buf;
        }
        function SlowBuffer(subject, encoding, noZero) {
          if (!(this instanceof SlowBuffer))
            return new SlowBuffer(subject, encoding, noZero);
          var buf = new Buffer(subject, encoding, noZero);
          delete buf.parent;
          return buf;
        }
        Buffer.isBuffer = function (b) {
          return !!(b != null && b._isBuffer);
        };
        Buffer.compare = function (a, b) {
          if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
            throw new TypeError("Arguments must be Buffers");
          var x = a.length;
          var y = b.length;
          for (
            var i = 0, len = Math.min(x, y);
            i < len && a[i] === b[i];
            i++
          ) {}
          if (i !== len) {
            x = a[i];
            y = b[i];
          }
          if (x < y) return -1;
          if (y < x) return 1;
          return 0;
        };
        Buffer.isEncoding = function (encoding) {
          switch (String(encoding).toLowerCase()) {
            case "hex":
            case "utf8":
            case "utf-8":
            case "ascii":
            case "binary":
            case "base64":
            case "raw":
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return true;
            default:
              return false;
          }
        };
        Buffer.concat = function (list, totalLength) {
          if (!isArray(list))
            throw new TypeError("Usage: Buffer.concat(list[, length])");
          if (list.length === 0) {
            return new Buffer(0);
          } else if (list.length === 1) {
            return list[0];
          }
          var i;
          if (totalLength === undefined) {
            totalLength = 0;
            for (i = 0; i < list.length; i++) {
              totalLength += list[i].length;
            }
          }
          var buf = new Buffer(totalLength);
          var pos = 0;
          for (i = 0; i < list.length; i++) {
            var item = list[i];
            item.copy(buf, pos);
            pos += item.length;
          }
          return buf;
        };
        Buffer.byteLength = function (str, encoding) {
          var ret;
          str = str + "";
          switch (encoding || "utf8") {
            case "ascii":
            case "binary":
            case "raw":
              ret = str.length;
              break;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              ret = str.length * 2;
              break;
            case "hex":
              ret = str.length >>> 1;
              break;
            case "utf8":
            case "utf-8":
              ret = utf8ToBytes(str).length;
              break;
            case "base64":
              ret = base64ToBytes(str).length;
              break;
            default:
              ret = str.length;
          }
          return ret;
        };
        Buffer.prototype.length = undefined;
        Buffer.prototype.parent = undefined;
        Buffer.prototype.toString = function (encoding, start, end) {
          var loweredCase = false;
          start = start >>> 0;
          end = end === undefined || end === Infinity ? this.length : end >>> 0;
          if (!encoding) encoding = "utf8";
          if (start < 0) start = 0;
          if (end > this.length) end = this.length;
          if (end <= start) return "";
          while (true) {
            switch (encoding) {
              case "hex":
                return hexSlice(this, start, end);
              case "utf8":
              case "utf-8":
                return utf8Slice(this, start, end);
              case "ascii":
                return asciiSlice(this, start, end);
              case "binary":
                return binarySlice(this, start, end);
              case "base64":
                return base64Slice(this, start, end);
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
                return utf16leSlice(this, start, end);
              default:
                if (loweredCase)
                  throw new TypeError("Unknown encoding: " + encoding);
                encoding = (encoding + "").toLowerCase();
                loweredCase = true;
            }
          }
        };
        Buffer.prototype.equals = function (b) {
          if (!Buffer.isBuffer(b))
            throw new TypeError("Argument must be a Buffer");
          return Buffer.compare(this, b) === 0;
        };
        Buffer.prototype.inspect = function () {
          var str = "";
          var max = exports.INSPECT_MAX_BYTES;
          if (this.length > 0) {
            str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
            if (this.length > max) str += " ... ";
          }
          return "<Buffer " + str + ">";
        };
        Buffer.prototype.compare = function (b) {
          if (!Buffer.isBuffer(b))
            throw new TypeError("Argument must be a Buffer");
          return Buffer.compare(this, b);
        };
        Buffer.prototype.get = function (offset) {
          console.log(
            ".get() is deprecated. Access using array indexes instead."
          );
          return this.readUInt8(offset);
        };
        Buffer.prototype.set = function (v, offset) {
          console.log(
            ".set() is deprecated. Access using array indexes instead."
          );
          return this.writeUInt8(v, offset);
        };
        function hexWrite(buf, string, offset, length) {
          offset = Number(offset) || 0;
          var remaining = buf.length - offset;
          if (!length) {
            length = remaining;
          } else {
            length = Number(length);
            if (length > remaining) {
              length = remaining;
            }
          }
          var strLen = string.length;
          if (strLen % 2 !== 0) throw new Error("Invalid hex string");
          if (length > strLen / 2) {
            length = strLen / 2;
          }
          for (var i = 0; i < length; i++) {
            var byte = parseInt(string.substr(i * 2, 2), 16);
            if (isNaN(byte)) throw new Error("Invalid hex string");
            buf[offset + i] = byte;
          }
          return i;
        }
        function utf8Write(buf, string, offset, length) {
          var charsWritten = blitBuffer(
            utf8ToBytes(string, buf.length - offset),
            buf,
            offset,
            length
          );
          return charsWritten;
        }
        function asciiWrite(buf, string, offset, length) {
          var charsWritten = blitBuffer(
            asciiToBytes(string),
            buf,
            offset,
            length
          );
          return charsWritten;
        }
        function binaryWrite(buf, string, offset, length) {
          return asciiWrite(buf, string, offset, length);
        }
        function base64Write(buf, string, offset, length) {
          var charsWritten = blitBuffer(
            base64ToBytes(string),
            buf,
            offset,
            length
          );
          return charsWritten;
        }
        function utf16leWrite(buf, string, offset, length) {
          var charsWritten = blitBuffer(
            utf16leToBytes(string, buf.length - offset),
            buf,
            offset,
            length,
            2
          );
          return charsWritten;
        }
        Buffer.prototype.write = function (string, offset, length, encoding) {
          if (isFinite(offset)) {
            if (!isFinite(length)) {
              encoding = length;
              length = undefined;
            }
          } else {
            var swap = encoding;
            encoding = offset;
            offset = length;
            length = swap;
          }
          offset = Number(offset) || 0;
          if (length < 0 || offset < 0 || offset > this.length)
            throw new RangeError("attempt to write outside buffer bounds");
          var remaining = this.length - offset;
          if (!length) {
            length = remaining;
          } else {
            length = Number(length);
            if (length > remaining) {
              length = remaining;
            }
          }
          encoding = String(encoding || "utf8").toLowerCase();
          var ret;
          switch (encoding) {
            case "hex":
              ret = hexWrite(this, string, offset, length);
              break;
            case "utf8":
            case "utf-8":
              ret = utf8Write(this, string, offset, length);
              break;
            case "ascii":
              ret = asciiWrite(this, string, offset, length);
              break;
            case "binary":
              ret = binaryWrite(this, string, offset, length);
              break;
            case "base64":
              ret = base64Write(this, string, offset, length);
              break;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              ret = utf16leWrite(this, string, offset, length);
              break;
            default:
              throw new TypeError("Unknown encoding: " + encoding);
          }
          return ret;
        };
        Buffer.prototype.toJSON = function () {
          return {
            type: "Buffer",
            data: Array.prototype.slice.call(this._arr || this, 0),
          };
        };
        function base64Slice(buf, start, end) {
          if (start === 0 && end === buf.length) {
            return base64.fromByteArray(buf);
          } else {
            return base64.fromByteArray(buf.slice(start, end));
          }
        }
        function utf8Slice(buf, start, end) {
          var res = "";
          var tmp = "";
          end = Math.min(buf.length, end);
          for (var i = start; i < end; i++) {
            if (buf[i] <= 127) {
              res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i]);
              tmp = "";
            } else {
              tmp += "%" + buf[i].toString(16);
            }
          }
          return res + decodeUtf8Char(tmp);
        }
        function asciiSlice(buf, start, end) {
          var ret = "";
          end = Math.min(buf.length, end);
          for (var i = start; i < end; i++) {
            ret += String.fromCharCode(buf[i] & 127);
          }
          return ret;
        }
        function binarySlice(buf, start, end) {
          var ret = "";
          end = Math.min(buf.length, end);
          for (var i = start; i < end; i++) {
            ret += String.fromCharCode(buf[i]);
          }
          return ret;
        }
        function hexSlice(buf, start, end) {
          var len = buf.length;
          if (!start || start < 0) start = 0;
          if (!end || end < 0 || end > len) end = len;
          var out = "";
          for (var i = start; i < end; i++) {
            out += toHex(buf[i]);
          }
          return out;
        }
        function utf16leSlice(buf, start, end) {
          var bytes = buf.slice(start, end);
          var res = "";
          for (var i = 0; i < bytes.length; i += 2) {
            res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
          }
          return res;
        }
        Buffer.prototype.slice = function (start, end) {
          var len = this.length;
          start = ~~start;
          end = end === undefined ? len : ~~end;
          if (start < 0) {
            start += len;
            if (start < 0) start = 0;
          } else if (start > len) {
            start = len;
          }
          if (end < 0) {
            end += len;
            if (end < 0) end = 0;
          } else if (end > len) {
            end = len;
          }
          if (end < start) end = start;
          var newBuf;
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            newBuf = Buffer._augment(this.subarray(start, end));
          } else {
            var sliceLen = end - start;
            newBuf = new Buffer(sliceLen, undefined, true);
            for (var i = 0; i < sliceLen; i++) {
              newBuf[i] = this[i + start];
            }
          }
          if (newBuf.length) newBuf.parent = this.parent || this;
          return newBuf;
        };
        function checkOffset(offset, ext, length) {
          if (offset % 1 !== 0 || offset < 0)
            throw new RangeError("offset is not uint");
          if (offset + ext > length)
            throw new RangeError("Trying to access beyond buffer length");
        }
        Buffer.prototype.readUIntLE = function (offset, byteLength, noAssert) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);
          var val = this[offset];
          var mul = 1;
          var i = 0;
          while (++i < byteLength && (mul *= 256))
            val += this[offset + i] * mul;
          return val;
        };
        Buffer.prototype.readUIntBE = function (offset, byteLength, noAssert) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);
          var val = this[offset + --byteLength];
          var mul = 1;
          while (byteLength > 0 && (mul *= 256))
            val += this[offset + --byteLength] * mul;
          return val;
        };
        Buffer.prototype.readUInt8 = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 1, this.length);
          return this[offset];
        };
        Buffer.prototype.readUInt16LE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 2, this.length);
          return this[offset] | (this[offset + 1] << 8);
        };
        Buffer.prototype.readUInt16BE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 2, this.length);
          return (this[offset] << 8) | this[offset + 1];
        };
        Buffer.prototype.readUInt32LE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return (
            (this[offset] |
              (this[offset + 1] << 8) |
              (this[offset + 2] << 16)) +
            this[offset + 3] * 16777216
          );
        };
        Buffer.prototype.readUInt32BE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return (
            this[offset] * 16777216 +
            ((this[offset + 1] << 16) |
              (this[offset + 2] << 8) |
              this[offset + 3])
          );
        };
        Buffer.prototype.readIntLE = function (offset, byteLength, noAssert) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);
          var val = this[offset];
          var mul = 1;
          var i = 0;
          while (++i < byteLength && (mul *= 256))
            val += this[offset + i] * mul;
          mul *= 128;
          if (val >= mul) val -= Math.pow(2, 8 * byteLength);
          return val;
        };
        Buffer.prototype.readIntBE = function (offset, byteLength, noAssert) {
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert) checkOffset(offset, byteLength, this.length);
          var i = byteLength;
          var mul = 1;
          var val = this[offset + --i];
          while (i > 0 && (mul *= 256)) val += this[offset + --i] * mul;
          mul *= 128;
          if (val >= mul) val -= Math.pow(2, 8 * byteLength);
          return val;
        };
        Buffer.prototype.readInt8 = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 1, this.length);
          if (!(this[offset] & 128)) return this[offset];
          return (255 - this[offset] + 1) * -1;
        };
        Buffer.prototype.readInt16LE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 2, this.length);
          var val = this[offset] | (this[offset + 1] << 8);
          return val & 32768 ? val | 4294901760 : val;
        };
        Buffer.prototype.readInt16BE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 2, this.length);
          var val = this[offset + 1] | (this[offset] << 8);
          return val & 32768 ? val | 4294901760 : val;
        };
        Buffer.prototype.readInt32LE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return (
            this[offset] |
            (this[offset + 1] << 8) |
            (this[offset + 2] << 16) |
            (this[offset + 3] << 24)
          );
        };
        Buffer.prototype.readInt32BE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return (
            (this[offset] << 24) |
            (this[offset + 1] << 16) |
            (this[offset + 2] << 8) |
            this[offset + 3]
          );
        };
        Buffer.prototype.readFloatLE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return ieee754.read(this, offset, true, 23, 4);
        };
        Buffer.prototype.readFloatBE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 4, this.length);
          return ieee754.read(this, offset, false, 23, 4);
        };
        Buffer.prototype.readDoubleLE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 8, this.length);
          return ieee754.read(this, offset, true, 52, 8);
        };
        Buffer.prototype.readDoubleBE = function (offset, noAssert) {
          if (!noAssert) checkOffset(offset, 8, this.length);
          return ieee754.read(this, offset, false, 52, 8);
        };
        function checkInt(buf, value, offset, ext, max, min) {
          if (!Buffer.isBuffer(buf))
            throw new TypeError("buffer must be a Buffer instance");
          if (value > max || value < min)
            throw new RangeError("value is out of bounds");
          if (offset + ext > buf.length)
            throw new RangeError("index out of range");
        }
        Buffer.prototype.writeUIntLE = function (
          value,
          offset,
          byteLength,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert)
            checkInt(
              this,
              value,
              offset,
              byteLength,
              Math.pow(2, 8 * byteLength),
              0
            );
          var mul = 1;
          var i = 0;
          this[offset] = value & 255;
          while (++i < byteLength && (mul *= 256))
            this[offset + i] = ((value / mul) >>> 0) & 255;
          return offset + byteLength;
        };
        Buffer.prototype.writeUIntBE = function (
          value,
          offset,
          byteLength,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          byteLength = byteLength >>> 0;
          if (!noAssert)
            checkInt(
              this,
              value,
              offset,
              byteLength,
              Math.pow(2, 8 * byteLength),
              0
            );
          var i = byteLength - 1;
          var mul = 1;
          this[offset + i] = value & 255;
          while (--i >= 0 && (mul *= 256))
            this[offset + i] = ((value / mul) >>> 0) & 255;
          return offset + byteLength;
        };
        Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
          if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
          this[offset] = value;
          return offset + 1;
        };
        function objectWriteUInt16(buf, value, offset, littleEndian) {
          if (value < 0) value = 65535 + value + 1;
          for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
            buf[offset + i] =
              (value & (255 << (8 * (littleEndian ? i : 1 - i)))) >>>
              ((littleEndian ? i : 1 - i) * 8);
          }
        }
        Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value;
            this[offset + 1] = value >>> 8;
          } else objectWriteUInt16(this, value, offset, true);
          return offset + 2;
        };
        Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value >>> 8;
            this[offset + 1] = value;
          } else objectWriteUInt16(this, value, offset, false);
          return offset + 2;
        };
        function objectWriteUInt32(buf, value, offset, littleEndian) {
          if (value < 0) value = 4294967295 + value + 1;
          for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
            buf[offset + i] =
              (value >>> ((littleEndian ? i : 3 - i) * 8)) & 255;
          }
        }
        Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset + 3] = value >>> 24;
            this[offset + 2] = value >>> 16;
            this[offset + 1] = value >>> 8;
            this[offset] = value;
          } else objectWriteUInt32(this, value, offset, true);
          return offset + 4;
        };
        Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value >>> 24;
            this[offset + 1] = value >>> 16;
            this[offset + 2] = value >>> 8;
            this[offset + 3] = value;
          } else objectWriteUInt32(this, value, offset, false);
          return offset + 4;
        };
        Buffer.prototype.writeIntLE = function (
          value,
          offset,
          byteLength,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) {
            checkInt(
              this,
              value,
              offset,
              byteLength,
              Math.pow(2, 8 * byteLength - 1) - 1,
              -Math.pow(2, 8 * byteLength - 1)
            );
          }
          var i = 0;
          var mul = 1;
          var sub = value < 0 ? 1 : 0;
          this[offset] = value & 255;
          while (++i < byteLength && (mul *= 256))
            this[offset + i] = (((value / mul) >> 0) - sub) & 255;
          return offset + byteLength;
        };
        Buffer.prototype.writeIntBE = function (
          value,
          offset,
          byteLength,
          noAssert
        ) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) {
            checkInt(
              this,
              value,
              offset,
              byteLength,
              Math.pow(2, 8 * byteLength - 1) - 1,
              -Math.pow(2, 8 * byteLength - 1)
            );
          }
          var i = byteLength - 1;
          var mul = 1;
          var sub = value < 0 ? 1 : 0;
          this[offset + i] = value & 255;
          while (--i >= 0 && (mul *= 256))
            this[offset + i] = (((value / mul) >> 0) - sub) & 255;
          return offset + byteLength;
        };
        Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
          if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
          if (value < 0) value = 255 + value + 1;
          this[offset] = value;
          return offset + 1;
        };
        Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value;
            this[offset + 1] = value >>> 8;
          } else objectWriteUInt16(this, value, offset, true);
          return offset + 2;
        };
        Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value >>> 8;
            this[offset + 1] = value;
          } else objectWriteUInt16(this, value, offset, false);
          return offset + 2;
        };
        Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert)
            checkInt(this, value, offset, 4, 2147483647, -2147483648);
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value;
            this[offset + 1] = value >>> 8;
            this[offset + 2] = value >>> 16;
            this[offset + 3] = value >>> 24;
          } else objectWriteUInt32(this, value, offset, true);
          return offset + 4;
        };
        Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
          value = +value;
          offset = offset >>> 0;
          if (!noAssert)
            checkInt(this, value, offset, 4, 2147483647, -2147483648);
          if (value < 0) value = 4294967295 + value + 1;
          if (Buffer.TYPED_ARRAY_SUPPORT) {
            this[offset] = value >>> 24;
            this[offset + 1] = value >>> 16;
            this[offset + 2] = value >>> 8;
            this[offset + 3] = value;
          } else objectWriteUInt32(this, value, offset, false);
          return offset + 4;
        };
        function checkIEEE754(buf, value, offset, ext, max, min) {
          if (value > max || value < min)
            throw new RangeError("value is out of bounds");
          if (offset + ext > buf.length)
            throw new RangeError("index out of range");
          if (offset < 0) throw new RangeError("index out of range");
        }
        function writeFloat(buf, value, offset, littleEndian, noAssert) {
          if (!noAssert)
            checkIEEE754(
              buf,
              value,
              offset,
              4,
              3.4028234663852886e38,
              -3.4028234663852886e38
            );
          ieee754.write(buf, value, offset, littleEndian, 23, 4);
          return offset + 4;
        }
        Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
          return writeFloat(this, value, offset, true, noAssert);
        };
        Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
          return writeFloat(this, value, offset, false, noAssert);
        };
        function writeDouble(buf, value, offset, littleEndian, noAssert) {
          if (!noAssert)
            checkIEEE754(
              buf,
              value,
              offset,
              8,
              1.7976931348623157e308,
              -1.7976931348623157e308
            );
          ieee754.write(buf, value, offset, littleEndian, 52, 8);
          return offset + 8;
        }
        Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
          return writeDouble(this, value, offset, true, noAssert);
        };
        Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
          return writeDouble(this, value, offset, false, noAssert);
        };
        Buffer.prototype.copy = function (target, target_start, start, end) {
          var source = this;
          if (!start) start = 0;
          if (!end && end !== 0) end = this.length;
          if (target_start >= target.length) target_start = target.length;
          if (!target_start) target_start = 0;
          if (end > 0 && end < start) end = start;
          if (end === start) return 0;
          if (target.length === 0 || source.length === 0) return 0;
          if (target_start < 0)
            throw new RangeError("targetStart out of bounds");
          if (start < 0 || start >= source.length)
            throw new RangeError("sourceStart out of bounds");
          if (end < 0) throw new RangeError("sourceEnd out of bounds");
          if (end > this.length) end = this.length;
          if (target.length - target_start < end - start)
            end = target.length - target_start + start;
          var len = end - start;
          if (len < 1e3 || !Buffer.TYPED_ARRAY_SUPPORT) {
            for (var i = 0; i < len; i++) {
              target[i + target_start] = this[i + start];
            }
          } else {
            target._set(this.subarray(start, start + len), target_start);
          }
          return len;
        };
        Buffer.prototype.fill = function (value, start, end) {
          if (!value) value = 0;
          if (!start) start = 0;
          if (!end) end = this.length;
          if (end < start) throw new RangeError("end < start");
          if (end === start) return;
          if (this.length === 0) return;
          if (start < 0 || start >= this.length)
            throw new RangeError("start out of bounds");
          if (end < 0 || end > this.length)
            throw new RangeError("end out of bounds");
          var i;
          if (typeof value === "number") {
            for (i = start; i < end; i++) {
              this[i] = value;
            }
          } else {
            var bytes = utf8ToBytes(value.toString());
            var len = bytes.length;
            for (i = start; i < end; i++) {
              this[i] = bytes[i % len];
            }
          }
          return this;
        };
        Buffer.prototype.toArrayBuffer = function () {
          if (typeof Uint8Array !== "undefined") {
            if (Buffer.TYPED_ARRAY_SUPPORT) {
              return new Buffer(this).buffer;
            } else {
              var buf = new Uint8Array(this.length);
              for (var i = 0, len = buf.length; i < len; i += 1) {
                buf[i] = this[i];
              }
              return buf.buffer;
            }
          } else {
            throw new TypeError(
              "Buffer.toArrayBuffer not supported in this browser"
            );
          }
        };
        var BP = Buffer.prototype;
        Buffer._augment = function (arr) {
          arr.constructor = Buffer;
          arr._isBuffer = true;
          arr._get = arr.get;
          arr._set = arr.set;
          arr.get = BP.get;
          arr.set = BP.set;
          arr.write = BP.write;
          arr.toString = BP.toString;
          arr.toLocaleString = BP.toString;
          arr.toJSON = BP.toJSON;
          arr.equals = BP.equals;
          arr.compare = BP.compare;
          arr.copy = BP.copy;
          arr.slice = BP.slice;
          arr.readUIntLE = BP.readUIntLE;
          arr.readUIntBE = BP.readUIntBE;
          arr.readUInt8 = BP.readUInt8;
          arr.readUInt16LE = BP.readUInt16LE;
          arr.readUInt16BE = BP.readUInt16BE;
          arr.readUInt32LE = BP.readUInt32LE;
          arr.readUInt32BE = BP.readUInt32BE;
          arr.readIntLE = BP.readIntLE;
          arr.readIntBE = BP.readIntBE;
          arr.readInt8 = BP.readInt8;
          arr.readInt16LE = BP.readInt16LE;
          arr.readInt16BE = BP.readInt16BE;
          arr.readInt32LE = BP.readInt32LE;
          arr.readInt32BE = BP.readInt32BE;
          arr.readFloatLE = BP.readFloatLE;
          arr.readFloatBE = BP.readFloatBE;
          arr.readDoubleLE = BP.readDoubleLE;
          arr.readDoubleBE = BP.readDoubleBE;
          arr.writeUInt8 = BP.writeUInt8;
          arr.writeUIntLE = BP.writeUIntLE;
          arr.writeUIntBE = BP.writeUIntBE;
          arr.writeUInt16LE = BP.writeUInt16LE;
          arr.writeUInt16BE = BP.writeUInt16BE;
          arr.writeUInt32LE = BP.writeUInt32LE;
          arr.writeUInt32BE = BP.writeUInt32BE;
          arr.writeIntLE = BP.writeIntLE;
          arr.writeIntBE = BP.writeIntBE;
          arr.writeInt8 = BP.writeInt8;
          arr.writeInt16LE = BP.writeInt16LE;
          arr.writeInt16BE = BP.writeInt16BE;
          arr.writeInt32LE = BP.writeInt32LE;
          arr.writeInt32BE = BP.writeInt32BE;
          arr.writeFloatLE = BP.writeFloatLE;
          arr.writeFloatBE = BP.writeFloatBE;
          arr.writeDoubleLE = BP.writeDoubleLE;
          arr.writeDoubleBE = BP.writeDoubleBE;
          arr.fill = BP.fill;
          arr.inspect = BP.inspect;
          arr.toArrayBuffer = BP.toArrayBuffer;
          return arr;
        };
        var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g;
        function base64clean(str) {
          str = stringtrim(str).replace(INVALID_BASE64_RE, "");
          if (str.length < 2) return "";
          while (str.length % 4 !== 0) {
            str = str + "=";
          }
          return str;
        }
        function stringtrim(str) {
          if (str.trim) return str.trim();
          return str.replace(/^\s+|\s+$/g, "");
        }
        function isArrayish(subject) {
          return (
            isArray(subject) ||
            Buffer.isBuffer(subject) ||
            (subject &&
              typeof subject === "object" &&
              typeof subject.length === "number")
          );
        }
        function toHex(n) {
          if (n < 16) return "0" + n.toString(16);
          return n.toString(16);
        }
        function utf8ToBytes(string, units) {
          var codePoint,
            length = string.length;
          var leadSurrogate = null;
          units = units || Infinity;
          var bytes = [];
          var i = 0;
          for (; i < length; i++) {
            codePoint = string.charCodeAt(i);
            if (codePoint > 55295 && codePoint < 57344) {
              if (leadSurrogate) {
                if (codePoint < 56320) {
                  if ((units -= 3) > -1) bytes.push(239, 191, 189);
                  leadSurrogate = codePoint;
                  continue;
                } else {
                  codePoint =
                    ((leadSurrogate - 55296) << 10) |
                    (codePoint - 56320) |
                    65536;
                  leadSurrogate = null;
                }
              } else {
                if (codePoint > 56319) {
                  if ((units -= 3) > -1) bytes.push(239, 191, 189);
                  continue;
                } else if (i + 1 === length) {
                  if ((units -= 3) > -1) bytes.push(239, 191, 189);
                  continue;
                } else {
                  leadSurrogate = codePoint;
                  continue;
                }
              }
            } else if (leadSurrogate) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              leadSurrogate = null;
            }
            if (codePoint < 128) {
              if ((units -= 1) < 0) break;
              bytes.push(codePoint);
            } else if (codePoint < 2048) {
              if ((units -= 2) < 0) break;
              bytes.push((codePoint >> 6) | 192, (codePoint & 63) | 128);
            } else if (codePoint < 65536) {
              if ((units -= 3) < 0) break;
              bytes.push(
                (codePoint >> 12) | 224,
                ((codePoint >> 6) & 63) | 128,
                (codePoint & 63) | 128
              );
            } else if (codePoint < 2097152) {
              if ((units -= 4) < 0) break;
              bytes.push(
                (codePoint >> 18) | 240,
                ((codePoint >> 12) & 63) | 128,
                ((codePoint >> 6) & 63) | 128,
                (codePoint & 63) | 128
              );
            } else {
              throw new Error("Invalid code point");
            }
          }
          return bytes;
        }
        function asciiToBytes(str) {
          var byteArray = [];
          for (var i = 0; i < str.length; i++) {
            byteArray.push(str.charCodeAt(i) & 255);
          }
          return byteArray;
        }
        function utf16leToBytes(str, units) {
          var c, hi, lo;
          var byteArray = [];
          for (var i = 0; i < str.length; i++) {
            if ((units -= 2) < 0) break;
            c = str.charCodeAt(i);
            hi = c >> 8;
            lo = c % 256;
            byteArray.push(lo);
            byteArray.push(hi);
          }
          return byteArray;
        }
        function base64ToBytes(str) {
          return base64.toByteArray(base64clean(str));
        }
        function blitBuffer(src, dst, offset, length, unitSize) {
          if (unitSize) length -= length % unitSize;
          for (var i = 0; i < length; i++) {
            if (i + offset >= dst.length || i >= src.length) break;
            dst[i + offset] = src[i];
          }
          return i;
        }
        function decodeUtf8Char(str) {
          try {
            return decodeURIComponent(str);
          } catch (err) {
            return String.fromCharCode(65533);
          }
        }
      },
      { "base64-js": 17, ieee754: 18, "is-array": 19 },
    ],
    17: [
      function (require, module, exports) {
        var lookup =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        (function (exports) {
          "use strict";
          var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
          var PLUS = "+".charCodeAt(0);
          var SLASH = "/".charCodeAt(0);
          var NUMBER = "0".charCodeAt(0);
          var LOWER = "a".charCodeAt(0);
          var UPPER = "A".charCodeAt(0);
          var PLUS_URL_SAFE = "-".charCodeAt(0);
          var SLASH_URL_SAFE = "_".charCodeAt(0);
          function decode(elt) {
            var code = elt.charCodeAt(0);
            if (code === PLUS || code === PLUS_URL_SAFE) return 62;
            if (code === SLASH || code === SLASH_URL_SAFE) return 63;
            if (code < NUMBER) return -1;
            if (code < NUMBER + 10) return code - NUMBER + 26 + 26;
            if (code < UPPER + 26) return code - UPPER;
            if (code < LOWER + 26) return code - LOWER + 26;
          }
          function b64ToByteArray(b64) {
            var i, j, l, tmp, placeHolders, arr;
            if (b64.length % 4 > 0) {
              throw new Error("Invalid string. Length must be a multiple of 4");
            }
            var len = b64.length;
            placeHolders =
              "=" === b64.charAt(len - 2)
                ? 2
                : "=" === b64.charAt(len - 1)
                ? 1
                : 0;
            arr = new Arr((b64.length * 3) / 4 - placeHolders);
            l = placeHolders > 0 ? b64.length - 4 : b64.length;
            var L = 0;
            function push(v) {
              arr[L++] = v;
            }
            for (i = 0, j = 0; i < l; i += 4, j += 3) {
              tmp =
                (decode(b64.charAt(i)) << 18) |
                (decode(b64.charAt(i + 1)) << 12) |
                (decode(b64.charAt(i + 2)) << 6) |
                decode(b64.charAt(i + 3));
              push((tmp & 16711680) >> 16);
              push((tmp & 65280) >> 8);
              push(tmp & 255);
            }
            if (placeHolders === 2) {
              tmp =
                (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4);
              push(tmp & 255);
            } else if (placeHolders === 1) {
              tmp =
                (decode(b64.charAt(i)) << 10) |
                (decode(b64.charAt(i + 1)) << 4) |
                (decode(b64.charAt(i + 2)) >> 2);
              push((tmp >> 8) & 255);
              push(tmp & 255);
            }
            return arr;
          }
          function uint8ToBase64(uint8) {
            var i,
              extraBytes = uint8.length % 3,
              output = "",
              temp,
              length;
            function encode(num) {
              return lookup.charAt(num);
            }
            function tripletToBase64(num) {
              return (
                encode((num >> 18) & 63) +
                encode((num >> 12) & 63) +
                encode((num >> 6) & 63) +
                encode(num & 63)
              );
            }
            for (
              i = 0, length = uint8.length - extraBytes;
              i < length;
              i += 3
            ) {
              temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
              output += tripletToBase64(temp);
            }
            switch (extraBytes) {
              case 1:
                temp = uint8[uint8.length - 1];
                output += encode(temp >> 2);
                output += encode((temp << 4) & 63);
                output += "==";
                break;
              case 2:
                temp = (uint8[uint8.length - 2] << 8) + uint8[uint8.length - 1];
                output += encode(temp >> 10);
                output += encode((temp >> 4) & 63);
                output += encode((temp << 2) & 63);
                output += "=";
                break;
            }
            return output;
          }
          exports.toByteArray = b64ToByteArray;
          exports.fromByteArray = uint8ToBase64;
        })(typeof exports === "undefined" ? (this.base64js = {}) : exports);
      },
      {},
    ],
    18: [
      function (require, module, exports) {
        exports.read = function (buffer, offset, isLE, mLen, nBytes) {
          var e,
            m,
            eLen = nBytes * 8 - mLen - 1,
            eMax = (1 << eLen) - 1,
            eBias = eMax >> 1,
            nBits = -7,
            i = isLE ? nBytes - 1 : 0,
            d = isLE ? -1 : 1,
            s = buffer[offset + i];
          i += d;
          e = s & ((1 << -nBits) - 1);
          s >>= -nBits;
          nBits += eLen;
          for (
            ;
            nBits > 0;
            e = e * 256 + buffer[offset + i], i += d, nBits -= 8
          );
          m = e & ((1 << -nBits) - 1);
          e >>= -nBits;
          nBits += mLen;
          for (
            ;
            nBits > 0;
            m = m * 256 + buffer[offset + i], i += d, nBits -= 8
          );
          if (e === 0) {
            e = 1 - eBias;
          } else if (e === eMax) {
            return m ? NaN : (s ? -1 : 1) * Infinity;
          } else {
            m = m + Math.pow(2, mLen);
            e = e - eBias;
          }
          return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
        };
        exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
          var e,
            m,
            c,
            eLen = nBytes * 8 - mLen - 1,
            eMax = (1 << eLen) - 1,
            eBias = eMax >> 1,
            rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
            i = isLE ? 0 : nBytes - 1,
            d = isLE ? 1 : -1,
            s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;
          value = Math.abs(value);
          if (isNaN(value) || value === Infinity) {
            m = isNaN(value) ? 1 : 0;
            e = eMax;
          } else {
            e = Math.floor(Math.log(value) / Math.LN2);
            if (value * (c = Math.pow(2, -e)) < 1) {
              e--;
              c *= 2;
            }
            if (e + eBias >= 1) {
              value += rt / c;
            } else {
              value += rt * Math.pow(2, 1 - eBias);
            }
            if (value * c >= 2) {
              e++;
              c /= 2;
            }
            if (e + eBias >= eMax) {
              m = 0;
              e = eMax;
            } else if (e + eBias >= 1) {
              m = (value * c - 1) * Math.pow(2, mLen);
              e = e + eBias;
            } else {
              m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
              e = 0;
            }
          }
          for (
            ;
            mLen >= 8;
            buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8
          );
          e = (e << mLen) | m;
          eLen += mLen;
          for (
            ;
            eLen > 0;
            buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8
          );
          buffer[offset + i - d] |= s * 128;
        };
      },
      {},
    ],
    19: [
      function (require, module, exports) {
        var isArray = Array.isArray;
        var str = Object.prototype.toString;
        module.exports =
          isArray ||
          function (val) {
            return !!val && "[object Array]" == str.call(val);
          };
      },
      {},
    ],
    20: [
      function (require, module, exports) {
        function EventEmitter() {
          this._events = this._events || {};
          this._maxListeners = this._maxListeners || undefined;
        }
        module.exports = EventEmitter;
        EventEmitter.EventEmitter = EventEmitter;
        EventEmitter.prototype._events = undefined;
        EventEmitter.prototype._maxListeners = undefined;
        EventEmitter.defaultMaxListeners = 10;
        EventEmitter.prototype.setMaxListeners = function (n) {
          if (!isNumber(n) || n < 0 || isNaN(n))
            throw TypeError("n must be a positive number");
          this._maxListeners = n;
          return this;
        };
        EventEmitter.prototype.emit = function (type) {
          var er, handler, len, args, i, listeners;
          if (!this._events) this._events = {};
          if (type === "error") {
            if (
              !this._events.error ||
              (isObject(this._events.error) && !this._events.error.length)
            ) {
              er = arguments[1];
              if (er instanceof Error) {
                throw er;
              }
              throw TypeError('Uncaught, unspecified "error" event.');
            }
          }
          handler = this._events[type];
          if (isUndefined(handler)) return false;
          if (isFunction(handler)) {
            switch (arguments.length) {
              case 1:
                handler.call(this);
                break;
              case 2:
                handler.call(this, arguments[1]);
                break;
              case 3:
                handler.call(this, arguments[1], arguments[2]);
                break;
              default:
                len = arguments.length;
                args = new Array(len - 1);
                for (i = 1; i < len; i++) args[i - 1] = arguments[i];
                handler.apply(this, args);
            }
          } else if (isObject(handler)) {
            len = arguments.length;
            args = new Array(len - 1);
            for (i = 1; i < len; i++) args[i - 1] = arguments[i];
            listeners = handler.slice();
            len = listeners.length;
            for (i = 0; i < len; i++) listeners[i].apply(this, args);
          }
          return true;
        };
        EventEmitter.prototype.addListener = function (type, listener) {
          var m;
          if (!isFunction(listener))
            throw TypeError("listener must be a function");
          if (!this._events) this._events = {};
          if (this._events.newListener)
            this.emit(
              "newListener",
              type,
              isFunction(listener.listener) ? listener.listener : listener
            );
          if (!this._events[type]) this._events[type] = listener;
          else if (isObject(this._events[type]))
            this._events[type].push(listener);
          else this._events[type] = [this._events[type], listener];
          if (isObject(this._events[type]) && !this._events[type].warned) {
            var m;
            if (!isUndefined(this._maxListeners)) {
              m = this._maxListeners;
            } else {
              m = EventEmitter.defaultMaxListeners;
            }
            if (m && m > 0 && this._events[type].length > m) {
              this._events[type].warned = true;
              console.error(
                "(node) warning: possible EventEmitter memory " +
                  "leak detected. %d listeners added. " +
                  "Use emitter.setMaxListeners() to increase limit.",
                this._events[type].length
              );
              if (typeof console.trace === "function") {
                console.trace();
              }
            }
          }
          return this;
        };
        EventEmitter.prototype.on = EventEmitter.prototype.addListener;
        EventEmitter.prototype.once = function (type, listener) {
          if (!isFunction(listener))
            throw TypeError("listener must be a function");
          var fired = false;
          function g() {
            this.removeListener(type, g);
            if (!fired) {
              fired = true;
              listener.apply(this, arguments);
            }
          }
          g.listener = listener;
          this.on(type, g);
          return this;
        };
        EventEmitter.prototype.removeListener = function (type, listener) {
          var list, position, length, i;
          if (!isFunction(listener))
            throw TypeError("listener must be a function");
          if (!this._events || !this._events[type]) return this;
          list = this._events[type];
          length = list.length;
          position = -1;
          if (
            list === listener ||
            (isFunction(list.listener) && list.listener === listener)
          ) {
            delete this._events[type];
            if (this._events.removeListener)
              this.emit("removeListener", type, listener);
          } else if (isObject(list)) {
            for (i = length; i-- > 0; ) {
              if (
                list[i] === listener ||
                (list[i].listener && list[i].listener === listener)
              ) {
                position = i;
                break;
              }
            }
            if (position < 0) return this;
            if (list.length === 1) {
              list.length = 0;
              delete this._events[type];
            } else {
              list.splice(position, 1);
            }
            if (this._events.removeListener)
              this.emit("removeListener", type, listener);
          }
          return this;
        };
        EventEmitter.prototype.removeAllListeners = function (type) {
          var key, listeners;
          if (!this._events) return this;
          if (!this._events.removeListener) {
            if (arguments.length === 0) this._events = {};
            else if (this._events[type]) delete this._events[type];
            return this;
          }
          if (arguments.length === 0) {
            for (key in this._events) {
              if (key === "removeListener") continue;
              this.removeAllListeners(key);
            }
            this.removeAllListeners("removeListener");
            this._events = {};
            return this;
          }
          listeners = this._events[type];
          if (isFunction(listeners)) {
            this.removeListener(type, listeners);
          } else {
            while (listeners.length)
              this.removeListener(type, listeners[listeners.length - 1]);
          }
          delete this._events[type];
          return this;
        };
        EventEmitter.prototype.listeners = function (type) {
          var ret;
          if (!this._events || !this._events[type]) ret = [];
          else if (isFunction(this._events[type])) ret = [this._events[type]];
          else ret = this._events[type].slice();
          return ret;
        };
        EventEmitter.listenerCount = function (emitter, type) {
          var ret;
          if (!emitter._events || !emitter._events[type]) ret = 0;
          else if (isFunction(emitter._events[type])) ret = 1;
          else ret = emitter._events[type].length;
          return ret;
        };
        function isFunction(arg) {
          return typeof arg === "function";
        }
        function isNumber(arg) {
          return typeof arg === "number";
        }
        function isObject(arg) {
          return typeof arg === "object" && arg !== null;
        }
        function isUndefined(arg) {
          return arg === void 0;
        }
      },
      {},
    ],
    21: [
      function (require, module, exports) {
        if (typeof Object.create === "function") {
          module.exports = function inherits(ctor, superCtor) {
            ctor.super_ = superCtor;
            ctor.prototype = Object.create(superCtor.prototype, {
              constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true,
              },
            });
          };
        } else {
          module.exports = function inherits(ctor, superCtor) {
            ctor.super_ = superCtor;
            var TempCtor = function () {};
            TempCtor.prototype = superCtor.prototype;
            ctor.prototype = new TempCtor();
            ctor.prototype.constructor = ctor;
          };
        }
      },
      {},
    ],
    22: [
      function (require, module, exports) {
        module.exports =
          Array.isArray ||
          function (arr) {
            return Object.prototype.toString.call(arr) == "[object Array]";
          };
      },
      {},
    ],
    23: [
      function (require, module, exports) {
        var process = (module.exports = {});
        process.nextTick = (function () {
          var canSetImmediate =
            typeof window !== "undefined" && window.setImmediate;
          var canMutationObserver =
            typeof window !== "undefined" && window.MutationObserver;
          var canPost =
            typeof window !== "undefined" &&
            window.postMessage &&
            window.addEventListener;
          if (canSetImmediate) {
            return function (f) {
              return window.setImmediate(f);
            };
          }
          var queue = [];
          if (canMutationObserver) {
            var hiddenDiv = document.createElement("div");
            var observer = new MutationObserver(function () {
              var queueList = queue.slice();
              queue.length = 0;
              queueList.forEach(function (fn) {
                fn();
              });
            });
            observer.observe(hiddenDiv, { attributes: true });
            return function nextTick(fn) {
              if (!queue.length) {
                hiddenDiv.setAttribute("yes", "no");
              }
              queue.push(fn);
            };
          }
          if (canPost) {
            window.addEventListener(
              "message",
              function (ev) {
                var source = ev.source;
                if (
                  (source === window || source === null) &&
                  ev.data === "process-tick"
                ) {
                  ev.stopPropagation();
                  if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                  }
                }
              },
              true
            );
            return function nextTick(fn) {
              queue.push(fn);
              window.postMessage("process-tick", "*");
            };
          }
          return function nextTick(fn) {
            setTimeout(fn, 0);
          };
        })();
        process.title = "browser";
        process.browser = true;
        process.env = {};
        process.argv = [];
        function noop() {}
        process.on = noop;
        process.addListener = noop;
        process.once = noop;
        process.off = noop;
        process.removeListener = noop;
        process.removeAllListeners = noop;
        process.emit = noop;
        process.binding = function (name) {
          throw new Error("process.binding is not supported");
        };
        process.cwd = function () {
          return "/";
        };
        process.chdir = function (dir) {
          throw new Error("process.chdir is not supported");
        };
      },
      {},
    ],
    24: [
      function (require, module, exports) {
        module.exports = require("./lib/_stream_duplex.js");
      },
      { "./lib/_stream_duplex.js": 25 },
    ],
    25: [
      function (require, module, exports) {
        (function (process) {
          module.exports = Duplex;
          var objectKeys =
            Object.keys ||
            function (obj) {
              var keys = [];
              for (var key in obj) keys.push(key);
              return keys;
            };
          var util = require("core-util-is");
          util.inherits = require("inherits");
          var Readable = require("./_stream_readable");
          var Writable = require("./_stream_writable");
          util.inherits(Duplex, Readable);
          forEach(objectKeys(Writable.prototype), function (method) {
            if (!Duplex.prototype[method])
              Duplex.prototype[method] = Writable.prototype[method];
          });
          function Duplex(options) {
            if (!(this instanceof Duplex)) return new Duplex(options);
            Readable.call(this, options);
            Writable.call(this, options);
            if (options && options.readable === false) this.readable = false;
            if (options && options.writable === false) this.writable = false;
            this.allowHalfOpen = true;
            if (options && options.allowHalfOpen === false)
              this.allowHalfOpen = false;
            this.once("end", onend);
          }
          function onend() {
            if (this.allowHalfOpen || this._writableState.ended) return;
            process.nextTick(this.end.bind(this));
          }
          function forEach(xs, f) {
            for (var i = 0, l = xs.length; i < l; i++) {
              f(xs[i], i);
            }
          }
        }.call(this, require("_process")));
      },
      {
        "./_stream_readable": 27,
        "./_stream_writable": 29,
        _process: 23,
        "core-util-is": 30,
        inherits: 21,
      },
    ],
    26: [
      function (require, module, exports) {
        module.exports = PassThrough;
        var Transform = require("./_stream_transform");
        var util = require("core-util-is");
        util.inherits = require("inherits");
        util.inherits(PassThrough, Transform);
        function PassThrough(options) {
          if (!(this instanceof PassThrough)) return new PassThrough(options);
          Transform.call(this, options);
        }
        PassThrough.prototype._transform = function (chunk, encoding, cb) {
          cb(null, chunk);
        };
      },
      { "./_stream_transform": 28, "core-util-is": 30, inherits: 21 },
    ],
    27: [
      function (require, module, exports) {
        (function (process) {
          module.exports = Readable;
          var isArray = require("isarray");
          var Buffer = require("buffer").Buffer;
          Readable.ReadableState = ReadableState;
          var EE = require("events").EventEmitter;
          if (!EE.listenerCount)
            EE.listenerCount = function (emitter, type) {
              return emitter.listeners(type).length;
            };
          var Stream = require("stream");
          var util = require("core-util-is");
          util.inherits = require("inherits");
          var StringDecoder;
          util.inherits(Readable, Stream);
          function ReadableState(options, stream) {
            options = options || {};
            var hwm = options.highWaterMark;
            this.highWaterMark = hwm || hwm === 0 ? hwm : 16 * 1024;
            this.highWaterMark = ~~this.highWaterMark;
            this.buffer = [];
            this.length = 0;
            this.pipes = null;
            this.pipesCount = 0;
            this.flowing = false;
            this.ended = false;
            this.endEmitted = false;
            this.reading = false;
            this.calledRead = false;
            this.sync = true;
            this.needReadable = false;
            this.emittedReadable = false;
            this.readableListening = false;
            this.objectMode = !!options.objectMode;
            this.defaultEncoding = options.defaultEncoding || "utf8";
            this.ranOut = false;
            this.awaitDrain = 0;
            this.readingMore = false;
            this.decoder = null;
            this.encoding = null;
            if (options.encoding) {
              if (!StringDecoder)
                StringDecoder = require("string_decoder/").StringDecoder;
              this.decoder = new StringDecoder(options.encoding);
              this.encoding = options.encoding;
            }
          }
          function Readable(options) {
            if (!(this instanceof Readable)) return new Readable(options);
            this._readableState = new ReadableState(options, this);
            this.readable = true;
            Stream.call(this);
          }
          Readable.prototype.push = function (chunk, encoding) {
            var state = this._readableState;
            if (typeof chunk === "string" && !state.objectMode) {
              encoding = encoding || state.defaultEncoding;
              if (encoding !== state.encoding) {
                chunk = new Buffer(chunk, encoding);
                encoding = "";
              }
            }
            return readableAddChunk(this, state, chunk, encoding, false);
          };
          Readable.prototype.unshift = function (chunk) {
            var state = this._readableState;
            return readableAddChunk(this, state, chunk, "", true);
          };
          function readableAddChunk(
            stream,
            state,
            chunk,
            encoding,
            addToFront
          ) {
            var er = chunkInvalid(state, chunk);
            if (er) {
              stream.emit("error", er);
            } else if (chunk === null || chunk === undefined) {
              state.reading = false;
              if (!state.ended) onEofChunk(stream, state);
            } else if (state.objectMode || (chunk && chunk.length > 0)) {
              if (state.ended && !addToFront) {
                var e = new Error("stream.push() after EOF");
                stream.emit("error", e);
              } else if (state.endEmitted && addToFront) {
                var e = new Error("stream.unshift() after end event");
                stream.emit("error", e);
              } else {
                if (state.decoder && !addToFront && !encoding)
                  chunk = state.decoder.write(chunk);
                state.length += state.objectMode ? 1 : chunk.length;
                if (addToFront) {
                  state.buffer.unshift(chunk);
                } else {
                  state.reading = false;
                  state.buffer.push(chunk);
                }
                if (state.needReadable) emitReadable(stream);
                maybeReadMore(stream, state);
              }
            } else if (!addToFront) {
              state.reading = false;
            }
            return needMoreData(state);
          }
          function needMoreData(state) {
            return (
              !state.ended &&
              (state.needReadable ||
                state.length < state.highWaterMark ||
                state.length === 0)
            );
          }
          Readable.prototype.setEncoding = function (enc) {
            if (!StringDecoder)
              StringDecoder = require("string_decoder/").StringDecoder;
            this._readableState.decoder = new StringDecoder(enc);
            this._readableState.encoding = enc;
          };
          var MAX_HWM = 8388608;
          function roundUpToNextPowerOf2(n) {
            if (n >= MAX_HWM) {
              n = MAX_HWM;
            } else {
              n--;
              for (var p = 1; p < 32; p <<= 1) n |= n >> p;
              n++;
            }
            return n;
          }
          function howMuchToRead(n, state) {
            if (state.length === 0 && state.ended) return 0;
            if (state.objectMode) return n === 0 ? 0 : 1;
            if (n === null || isNaN(n)) {
              if (state.flowing && state.buffer.length)
                return state.buffer[0].length;
              else return state.length;
            }
            if (n <= 0) return 0;
            if (n > state.highWaterMark)
              state.highWaterMark = roundUpToNextPowerOf2(n);
            if (n > state.length) {
              if (!state.ended) {
                state.needReadable = true;
                return 0;
              } else return state.length;
            }
            return n;
          }
          Readable.prototype.read = function (n) {
            var state = this._readableState;
            state.calledRead = true;
            var nOrig = n;
            var ret;
            if (typeof n !== "number" || n > 0) state.emittedReadable = false;
            if (
              n === 0 &&
              state.needReadable &&
              (state.length >= state.highWaterMark || state.ended)
            ) {
              emitReadable(this);
              return null;
            }
            n = howMuchToRead(n, state);
            if (n === 0 && state.ended) {
              ret = null;
              if (state.length > 0 && state.decoder) {
                ret = fromList(n, state);
                state.length -= ret.length;
              }
              if (state.length === 0) endReadable(this);
              return ret;
            }
            var doRead = state.needReadable;
            if (state.length - n <= state.highWaterMark) doRead = true;
            if (state.ended || state.reading) doRead = false;
            if (doRead) {
              state.reading = true;
              state.sync = true;
              if (state.length === 0) state.needReadable = true;
              this._read(state.highWaterMark);
              state.sync = false;
            }
            if (doRead && !state.reading) n = howMuchToRead(nOrig, state);
            if (n > 0) ret = fromList(n, state);
            else ret = null;
            if (ret === null) {
              state.needReadable = true;
              n = 0;
            }
            state.length -= n;
            if (state.length === 0 && !state.ended) state.needReadable = true;
            if (state.ended && !state.endEmitted && state.length === 0)
              endReadable(this);
            return ret;
          };
          function chunkInvalid(state, chunk) {
            var er = null;
            if (
              !Buffer.isBuffer(chunk) &&
              "string" !== typeof chunk &&
              chunk !== null &&
              chunk !== undefined &&
              !state.objectMode
            ) {
              er = new TypeError("Invalid non-string/buffer chunk");
            }
            return er;
          }
          function onEofChunk(stream, state) {
            if (state.decoder && !state.ended) {
              var chunk = state.decoder.end();
              if (chunk && chunk.length) {
                state.buffer.push(chunk);
                state.length += state.objectMode ? 1 : chunk.length;
              }
            }
            state.ended = true;
            if (state.length > 0) emitReadable(stream);
            else endReadable(stream);
          }
          function emitReadable(stream) {
            var state = stream._readableState;
            state.needReadable = false;
            if (state.emittedReadable) return;
            state.emittedReadable = true;
            if (state.sync)
              process.nextTick(function () {
                emitReadable_(stream);
              });
            else emitReadable_(stream);
          }
          function emitReadable_(stream) {
            stream.emit("readable");
          }
          function maybeReadMore(stream, state) {
            if (!state.readingMore) {
              state.readingMore = true;
              process.nextTick(function () {
                maybeReadMore_(stream, state);
              });
            }
          }
          function maybeReadMore_(stream, state) {
            var len = state.length;
            while (
              !state.reading &&
              !state.flowing &&
              !state.ended &&
              state.length < state.highWaterMark
            ) {
              stream.read(0);
              if (len === state.length) break;
              else len = state.length;
            }
            state.readingMore = false;
          }
          Readable.prototype._read = function (n) {
            this.emit("error", new Error("not implemented"));
          };
          Readable.prototype.pipe = function (dest, pipeOpts) {
            var src = this;
            var state = this._readableState;
            switch (state.pipesCount) {
              case 0:
                state.pipes = dest;
                break;
              case 1:
                state.pipes = [state.pipes, dest];
                break;
              default:
                state.pipes.push(dest);
                break;
            }
            state.pipesCount += 1;
            var doEnd =
              (!pipeOpts || pipeOpts.end !== false) &&
              dest !== process.stdout &&
              dest !== process.stderr;
            var endFn = doEnd ? onend : cleanup;
            if (state.endEmitted) process.nextTick(endFn);
            else src.once("end", endFn);
            dest.on("unpipe", onunpipe);
            function onunpipe(readable) {
              if (readable !== src) return;
              cleanup();
            }
            function onend() {
              dest.end();
            }
            var ondrain = pipeOnDrain(src);
            dest.on("drain", ondrain);
            function cleanup() {
              dest.removeListener("close", onclose);
              dest.removeListener("finish", onfinish);
              dest.removeListener("drain", ondrain);
              dest.removeListener("error", onerror);
              dest.removeListener("unpipe", onunpipe);
              src.removeListener("end", onend);
              src.removeListener("end", cleanup);
              if (!dest._writableState || dest._writableState.needDrain)
                ondrain();
            }
            function onerror(er) {
              unpipe();
              dest.removeListener("error", onerror);
              if (EE.listenerCount(dest, "error") === 0) dest.emit("error", er);
            }
            if (!dest._events || !dest._events.error) dest.on("error", onerror);
            else if (isArray(dest._events.error))
              dest._events.error.unshift(onerror);
            else dest._events.error = [onerror, dest._events.error];
            function onclose() {
              dest.removeListener("finish", onfinish);
              unpipe();
            }
            dest.once("close", onclose);
            function onfinish() {
              dest.removeListener("close", onclose);
              unpipe();
            }
            dest.once("finish", onfinish);
            function unpipe() {
              src.unpipe(dest);
            }
            dest.emit("pipe", src);
            if (!state.flowing) {
              this.on("readable", pipeOnReadable);
              state.flowing = true;
              process.nextTick(function () {
                flow(src);
              });
            }
            return dest;
          };
          function pipeOnDrain(src) {
            return function () {
              var dest = this;
              var state = src._readableState;
              state.awaitDrain--;
              if (state.awaitDrain === 0) flow(src);
            };
          }
          function flow(src) {
            var state = src._readableState;
            var chunk;
            state.awaitDrain = 0;
            function write(dest, i, list) {
              var written = dest.write(chunk);
              if (false === written) {
                state.awaitDrain++;
              }
            }
            while (state.pipesCount && null !== (chunk = src.read())) {
              if (state.pipesCount === 1) write(state.pipes, 0, null);
              else forEach(state.pipes, write);
              src.emit("data", chunk);
              if (state.awaitDrain > 0) return;
            }
            if (state.pipesCount === 0) {
              state.flowing = false;
              if (EE.listenerCount(src, "data") > 0) emitDataEvents(src);
              return;
            }
            state.ranOut = true;
          }
          function pipeOnReadable() {
            if (this._readableState.ranOut) {
              this._readableState.ranOut = false;
              flow(this);
            }
          }
          Readable.prototype.unpipe = function (dest) {
            var state = this._readableState;
            if (state.pipesCount === 0) return this;
            if (state.pipesCount === 1) {
              if (dest && dest !== state.pipes) return this;
              if (!dest) dest = state.pipes;
              state.pipes = null;
              state.pipesCount = 0;
              this.removeListener("readable", pipeOnReadable);
              state.flowing = false;
              if (dest) dest.emit("unpipe", this);
              return this;
            }
            if (!dest) {
              var dests = state.pipes;
              var len = state.pipesCount;
              state.pipes = null;
              state.pipesCount = 0;
              this.removeListener("readable", pipeOnReadable);
              state.flowing = false;
              for (var i = 0; i < len; i++) dests[i].emit("unpipe", this);
              return this;
            }
            var i = indexOf(state.pipes, dest);
            if (i === -1) return this;
            state.pipes.splice(i, 1);
            state.pipesCount -= 1;
            if (state.pipesCount === 1) state.pipes = state.pipes[0];
            dest.emit("unpipe", this);
            return this;
          };
          Readable.prototype.on = function (ev, fn) {
            var res = Stream.prototype.on.call(this, ev, fn);
            if (ev === "data" && !this._readableState.flowing)
              emitDataEvents(this);
            if (ev === "readable" && this.readable) {
              var state = this._readableState;
              if (!state.readableListening) {
                state.readableListening = true;
                state.emittedReadable = false;
                state.needReadable = true;
                if (!state.reading) {
                  this.read(0);
                } else if (state.length) {
                  emitReadable(this, state);
                }
              }
            }
            return res;
          };
          Readable.prototype.addListener = Readable.prototype.on;
          Readable.prototype.resume = function () {
            emitDataEvents(this);
            this.read(0);
            this.emit("resume");
          };
          Readable.prototype.pause = function () {
            emitDataEvents(this, true);
            this.emit("pause");
          };
          function emitDataEvents(stream, startPaused) {
            var state = stream._readableState;
            if (state.flowing) {
              throw new Error("Cannot switch to old mode now.");
            }
            var paused = startPaused || false;
            var readable = false;
            stream.readable = true;
            stream.pipe = Stream.prototype.pipe;
            stream.on = stream.addListener = Stream.prototype.on;
            stream.on("readable", function () {
              readable = true;
              var c;
              while (!paused && null !== (c = stream.read()))
                stream.emit("data", c);
              if (c === null) {
                readable = false;
                stream._readableState.needReadable = true;
              }
            });
            stream.pause = function () {
              paused = true;
              this.emit("pause");
            };
            stream.resume = function () {
              paused = false;
              if (readable)
                process.nextTick(function () {
                  stream.emit("readable");
                });
              else this.read(0);
              this.emit("resume");
            };
            stream.emit("readable");
          }
          Readable.prototype.wrap = function (stream) {
            var state = this._readableState;
            var paused = false;
            var self = this;
            stream.on("end", function () {
              if (state.decoder && !state.ended) {
                var chunk = state.decoder.end();
                if (chunk && chunk.length) self.push(chunk);
              }
              self.push(null);
            });
            stream.on("data", function (chunk) {
              if (state.decoder) chunk = state.decoder.write(chunk);
              if (state.objectMode && (chunk === null || chunk === undefined))
                return;
              else if (!state.objectMode && (!chunk || !chunk.length)) return;
              var ret = self.push(chunk);
              if (!ret) {
                paused = true;
                stream.pause();
              }
            });
            for (var i in stream) {
              if (
                typeof stream[i] === "function" &&
                typeof this[i] === "undefined"
              ) {
                this[i] = (function (method) {
                  return function () {
                    return stream[method].apply(stream, arguments);
                  };
                })(i);
              }
            }
            var events = ["error", "close", "destroy", "pause", "resume"];
            forEach(events, function (ev) {
              stream.on(ev, self.emit.bind(self, ev));
            });
            self._read = function (n) {
              if (paused) {
                paused = false;
                stream.resume();
              }
            };
            return self;
          };
          Readable._fromList = fromList;
          function fromList(n, state) {
            var list = state.buffer;
            var length = state.length;
            var stringMode = !!state.decoder;
            var objectMode = !!state.objectMode;
            var ret;
            if (list.length === 0) return null;
            if (length === 0) ret = null;
            else if (objectMode) ret = list.shift();
            else if (!n || n >= length) {
              if (stringMode) ret = list.join("");
              else ret = Buffer.concat(list, length);
              list.length = 0;
            } else {
              if (n < list[0].length) {
                var buf = list[0];
                ret = buf.slice(0, n);
                list[0] = buf.slice(n);
              } else if (n === list[0].length) {
                ret = list.shift();
              } else {
                if (stringMode) ret = "";
                else ret = new Buffer(n);
                var c = 0;
                for (var i = 0, l = list.length; i < l && c < n; i++) {
                  var buf = list[0];
                  var cpy = Math.min(n - c, buf.length);
                  if (stringMode) ret += buf.slice(0, cpy);
                  else buf.copy(ret, c, 0, cpy);
                  if (cpy < buf.length) list[0] = buf.slice(cpy);
                  else list.shift();
                  c += cpy;
                }
              }
            }
            return ret;
          }
          function endReadable(stream) {
            var state = stream._readableState;
            if (state.length > 0)
              throw new Error("endReadable called on non-empty stream");
            if (!state.endEmitted && state.calledRead) {
              state.ended = true;
              process.nextTick(function () {
                if (!state.endEmitted && state.length === 0) {
                  state.endEmitted = true;
                  stream.readable = false;
                  stream.emit("end");
                }
              });
            }
          }
          function forEach(xs, f) {
            for (var i = 0, l = xs.length; i < l; i++) {
              f(xs[i], i);
            }
          }
          function indexOf(xs, x) {
            for (var i = 0, l = xs.length; i < l; i++) {
              if (xs[i] === x) return i;
            }
            return -1;
          }
        }.call(this, require("_process")));
      },
      {
        _process: 23,
        buffer: 16,
        "core-util-is": 30,
        events: 20,
        inherits: 21,
        isarray: 22,
        stream: 35,
        "string_decoder/": 36,
      },
    ],
    28: [
      function (require, module, exports) {
        module.exports = Transform;
        var Duplex = require("./_stream_duplex");
        var util = require("core-util-is");
        util.inherits = require("inherits");
        util.inherits(Transform, Duplex);
        function TransformState(options, stream) {
          this.afterTransform = function (er, data) {
            return afterTransform(stream, er, data);
          };
          this.needTransform = false;
          this.transforming = false;
          this.writecb = null;
          this.writechunk = null;
        }
        function afterTransform(stream, er, data) {
          var ts = stream._transformState;
          ts.transforming = false;
          var cb = ts.writecb;
          if (!cb)
            return stream.emit(
              "error",
              new Error("no writecb in Transform class")
            );
          ts.writechunk = null;
          ts.writecb = null;
          if (data !== null && data !== undefined) stream.push(data);
          if (cb) cb(er);
          var rs = stream._readableState;
          rs.reading = false;
          if (rs.needReadable || rs.length < rs.highWaterMark) {
            stream._read(rs.highWaterMark);
          }
        }
        function Transform(options) {
          if (!(this instanceof Transform)) return new Transform(options);
          Duplex.call(this, options);
          var ts = (this._transformState = new TransformState(options, this));
          var stream = this;
          this._readableState.needReadable = true;
          this._readableState.sync = false;
          this.once("finish", function () {
            if ("function" === typeof this._flush)
              this._flush(function (er) {
                done(stream, er);
              });
            else done(stream);
          });
        }
        Transform.prototype.push = function (chunk, encoding) {
          this._transformState.needTransform = false;
          return Duplex.prototype.push.call(this, chunk, encoding);
        };
        Transform.prototype._transform = function (chunk, encoding, cb) {
          throw new Error("not implemented");
        };
        Transform.prototype._write = function (chunk, encoding, cb) {
          var ts = this._transformState;
          ts.writecb = cb;
          ts.writechunk = chunk;
          ts.writeencoding = encoding;
          if (!ts.transforming) {
            var rs = this._readableState;
            if (
              ts.needTransform ||
              rs.needReadable ||
              rs.length < rs.highWaterMark
            )
              this._read(rs.highWaterMark);
          }
        };
        Transform.prototype._read = function (n) {
          var ts = this._transformState;
          if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
            ts.transforming = true;
            this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
          } else {
            ts.needTransform = true;
          }
        };
        function done(stream, er) {
          if (er) return stream.emit("error", er);
          var ws = stream._writableState;
          var rs = stream._readableState;
          var ts = stream._transformState;
          if (ws.length)
            throw new Error("calling transform done when ws.length != 0");
          if (ts.transforming)
            throw new Error("calling transform done when still transforming");
          return stream.push(null);
        }
      },
      { "./_stream_duplex": 25, "core-util-is": 30, inherits: 21 },
    ],
    29: [
      function (require, module, exports) {
        (function (process) {
          module.exports = Writable;
          var Buffer = require("buffer").Buffer;
          Writable.WritableState = WritableState;
          var util = require("core-util-is");
          util.inherits = require("inherits");
          var Stream = require("stream");
          util.inherits(Writable, Stream);
          function WriteReq(chunk, encoding, cb) {
            this.chunk = chunk;
            this.encoding = encoding;
            this.callback = cb;
          }
          function WritableState(options, stream) {
            options = options || {};
            var hwm = options.highWaterMark;
            this.highWaterMark = hwm || hwm === 0 ? hwm : 16 * 1024;
            this.objectMode = !!options.objectMode;
            this.highWaterMark = ~~this.highWaterMark;
            this.needDrain = false;
            this.ending = false;
            this.ended = false;
            this.finished = false;
            var noDecode = options.decodeStrings === false;
            this.decodeStrings = !noDecode;
            this.defaultEncoding = options.defaultEncoding || "utf8";
            this.length = 0;
            this.writing = false;
            this.sync = true;
            this.bufferProcessing = false;
            this.onwrite = function (er) {
              onwrite(stream, er);
            };
            this.writecb = null;
            this.writelen = 0;
            this.buffer = [];
            this.errorEmitted = false;
          }
          function Writable(options) {
            var Duplex = require("./_stream_duplex");
            if (!(this instanceof Writable) && !(this instanceof Duplex))
              return new Writable(options);
            this._writableState = new WritableState(options, this);
            this.writable = true;
            Stream.call(this);
          }
          Writable.prototype.pipe = function () {
            this.emit("error", new Error("Cannot pipe. Not readable."));
          };
          function writeAfterEnd(stream, state, cb) {
            var er = new Error("write after end");
            stream.emit("error", er);
            process.nextTick(function () {
              cb(er);
            });
          }
          function validChunk(stream, state, chunk, cb) {
            var valid = true;
            if (
              !Buffer.isBuffer(chunk) &&
              "string" !== typeof chunk &&
              chunk !== null &&
              chunk !== undefined &&
              !state.objectMode
            ) {
              var er = new TypeError("Invalid non-string/buffer chunk");
              stream.emit("error", er);
              process.nextTick(function () {
                cb(er);
              });
              valid = false;
            }
            return valid;
          }
          Writable.prototype.write = function (chunk, encoding, cb) {
            var state = this._writableState;
            var ret = false;
            if (typeof encoding === "function") {
              cb = encoding;
              encoding = null;
            }
            if (Buffer.isBuffer(chunk)) encoding = "buffer";
            else if (!encoding) encoding = state.defaultEncoding;
            if (typeof cb !== "function") cb = function () {};
            if (state.ended) writeAfterEnd(this, state, cb);
            else if (validChunk(this, state, chunk, cb))
              ret = writeOrBuffer(this, state, chunk, encoding, cb);
            return ret;
          };
          function decodeChunk(state, chunk, encoding) {
            if (
              !state.objectMode &&
              state.decodeStrings !== false &&
              typeof chunk === "string"
            ) {
              chunk = new Buffer(chunk, encoding);
            }
            return chunk;
          }
          function writeOrBuffer(stream, state, chunk, encoding, cb) {
            chunk = decodeChunk(state, chunk, encoding);
            if (Buffer.isBuffer(chunk)) encoding = "buffer";
            var len = state.objectMode ? 1 : chunk.length;
            state.length += len;
            var ret = state.length < state.highWaterMark;
            if (!ret) state.needDrain = true;
            if (state.writing)
              state.buffer.push(new WriteReq(chunk, encoding, cb));
            else doWrite(stream, state, len, chunk, encoding, cb);
            return ret;
          }
          function doWrite(stream, state, len, chunk, encoding, cb) {
            state.writelen = len;
            state.writecb = cb;
            state.writing = true;
            state.sync = true;
            stream._write(chunk, encoding, state.onwrite);
            state.sync = false;
          }
          function onwriteError(stream, state, sync, er, cb) {
            if (sync)
              process.nextTick(function () {
                cb(er);
              });
            else cb(er);
            stream._writableState.errorEmitted = true;
            stream.emit("error", er);
          }
          function onwriteStateUpdate(state) {
            state.writing = false;
            state.writecb = null;
            state.length -= state.writelen;
            state.writelen = 0;
          }
          function onwrite(stream, er) {
            var state = stream._writableState;
            var sync = state.sync;
            var cb = state.writecb;
            onwriteStateUpdate(state);
            if (er) onwriteError(stream, state, sync, er, cb);
            else {
              var finished = needFinish(stream, state);
              if (!finished && !state.bufferProcessing && state.buffer.length)
                clearBuffer(stream, state);
              if (sync) {
                process.nextTick(function () {
                  afterWrite(stream, state, finished, cb);
                });
              } else {
                afterWrite(stream, state, finished, cb);
              }
            }
          }
          function afterWrite(stream, state, finished, cb) {
            if (!finished) onwriteDrain(stream, state);
            cb();
            if (finished) finishMaybe(stream, state);
          }
          function onwriteDrain(stream, state) {
            if (state.length === 0 && state.needDrain) {
              state.needDrain = false;
              stream.emit("drain");
            }
          }
          function clearBuffer(stream, state) {
            state.bufferProcessing = true;
            for (var c = 0; c < state.buffer.length; c++) {
              var entry = state.buffer[c];
              var chunk = entry.chunk;
              var encoding = entry.encoding;
              var cb = entry.callback;
              var len = state.objectMode ? 1 : chunk.length;
              doWrite(stream, state, len, chunk, encoding, cb);
              if (state.writing) {
                c++;
                break;
              }
            }
            state.bufferProcessing = false;
            if (c < state.buffer.length) state.buffer = state.buffer.slice(c);
            else state.buffer.length = 0;
          }
          Writable.prototype._write = function (chunk, encoding, cb) {
            cb(new Error("not implemented"));
          };
          Writable.prototype.end = function (chunk, encoding, cb) {
            var state = this._writableState;
            if (typeof chunk === "function") {
              cb = chunk;
              chunk = null;
              encoding = null;
            } else if (typeof encoding === "function") {
              cb = encoding;
              encoding = null;
            }
            if (typeof chunk !== "undefined" && chunk !== null)
              this.write(chunk, encoding);
            if (!state.ending && !state.finished) endWritable(this, state, cb);
          };
          function needFinish(stream, state) {
            return (
              state.ending &&
              state.length === 0 &&
              !state.finished &&
              !state.writing
            );
          }
          function finishMaybe(stream, state) {
            var need = needFinish(stream, state);
            if (need) {
              state.finished = true;
              stream.emit("finish");
            }
            return need;
          }
          function endWritable(stream, state, cb) {
            state.ending = true;
            finishMaybe(stream, state);
            if (cb) {
              if (state.finished) process.nextTick(cb);
              else stream.once("finish", cb);
            }
            state.ended = true;
          }
        }.call(this, require("_process")));
      },
      {
        "./_stream_duplex": 25,
        _process: 23,
        buffer: 16,
        "core-util-is": 30,
        inherits: 21,
        stream: 35,
      },
    ],
    30: [
      function (require, module, exports) {
        (function (Buffer) {
          function isArray(ar) {
            return Array.isArray(ar);
          }
          exports.isArray = isArray;
          function isBoolean(arg) {
            return typeof arg === "boolean";
          }
          exports.isBoolean = isBoolean;
          function isNull(arg) {
            return arg === null;
          }
          exports.isNull = isNull;
          function isNullOrUndefined(arg) {
            return arg == null;
          }
          exports.isNullOrUndefined = isNullOrUndefined;
          function isNumber(arg) {
            return typeof arg === "number";
          }
          exports.isNumber = isNumber;
          function isString(arg) {
            return typeof arg === "string";
          }
          exports.isString = isString;
          function isSymbol(arg) {
            return typeof arg === "symbol";
          }
          exports.isSymbol = isSymbol;
          function isUndefined(arg) {
            return arg === void 0;
          }
          exports.isUndefined = isUndefined;
          function isRegExp(re) {
            return isObject(re) && objectToString(re) === "[object RegExp]";
          }
          exports.isRegExp = isRegExp;
          function isObject(arg) {
            return typeof arg === "object" && arg !== null;
          }
          exports.isObject = isObject;
          function isDate(d) {
            return isObject(d) && objectToString(d) === "[object Date]";
          }
          exports.isDate = isDate;
          function isError(e) {
            return (
              isObject(e) &&
              (objectToString(e) === "[object Error]" || e instanceof Error)
            );
          }
          exports.isError = isError;
          function isFunction(arg) {
            return typeof arg === "function";
          }
          exports.isFunction = isFunction;
          function isPrimitive(arg) {
            return (
              arg === null ||
              typeof arg === "boolean" ||
              typeof arg === "number" ||
              typeof arg === "string" ||
              typeof arg === "symbol" ||
              typeof arg === "undefined"
            );
          }
          exports.isPrimitive = isPrimitive;
          function isBuffer(arg) {
            return Buffer.isBuffer(arg);
          }
          exports.isBuffer = isBuffer;
          function objectToString(o) {
            return Object.prototype.toString.call(o);
          }
        }.call(this, require("buffer").Buffer));
      },
      { buffer: 16 },
    ],
    31: [
      function (require, module, exports) {
        module.exports = require("./lib/_stream_passthrough.js");
      },
      { "./lib/_stream_passthrough.js": 26 },
    ],
    32: [
      function (require, module, exports) {
        var Stream = require("stream");
        exports = module.exports = require("./lib/_stream_readable.js");
        exports.Stream = Stream;
        exports.Readable = exports;
        exports.Writable = require("./lib/_stream_writable.js");
        exports.Duplex = require("./lib/_stream_duplex.js");
        exports.Transform = require("./lib/_stream_transform.js");
        exports.PassThrough = require("./lib/_stream_passthrough.js");
      },
      {
        "./lib/_stream_duplex.js": 25,
        "./lib/_stream_passthrough.js": 26,
        "./lib/_stream_readable.js": 27,
        "./lib/_stream_transform.js": 28,
        "./lib/_stream_writable.js": 29,
        stream: 35,
      },
    ],
    33: [
      function (require, module, exports) {
        module.exports = require("./lib/_stream_transform.js");
      },
      { "./lib/_stream_transform.js": 28 },
    ],
    34: [
      function (require, module, exports) {
        module.exports = require("./lib/_stream_writable.js");
      },
      { "./lib/_stream_writable.js": 29 },
    ],
    35: [
      function (require, module, exports) {
        module.exports = Stream;
        var EE = require("events").EventEmitter;
        var inherits = require("inherits");
        inherits(Stream, EE);
        Stream.Readable = require("readable-stream/readable.js");
        Stream.Writable = require("readable-stream/writable.js");
        Stream.Duplex = require("readable-stream/duplex.js");
        Stream.Transform = require("readable-stream/transform.js");
        Stream.PassThrough = require("readable-stream/passthrough.js");
        Stream.Stream = Stream;
        function Stream() {
          EE.call(this);
        }
        Stream.prototype.pipe = function (dest, options) {
          var source = this;
          function ondata(chunk) {
            if (dest.writable) {
              if (false === dest.write(chunk) && source.pause) {
                source.pause();
              }
            }
          }
          source.on("data", ondata);
          function ondrain() {
            if (source.readable && source.resume) {
              source.resume();
            }
          }
          dest.on("drain", ondrain);
          if (!dest._isStdio && (!options || options.end !== false)) {
            source.on("end", onend);
            source.on("close", onclose);
          }
          var didOnEnd = false;
          function onend() {
            if (didOnEnd) return;
            didOnEnd = true;
            dest.end();
          }
          function onclose() {
            if (didOnEnd) return;
            didOnEnd = true;
            if (typeof dest.destroy === "function") dest.destroy();
          }
          function onerror(er) {
            cleanup();
            if (EE.listenerCount(this, "error") === 0) {
              throw er;
            }
          }
          source.on("error", onerror);
          dest.on("error", onerror);
          function cleanup() {
            source.removeListener("data", ondata);
            dest.removeListener("drain", ondrain);
            source.removeListener("end", onend);
            source.removeListener("close", onclose);
            source.removeListener("error", onerror);
            dest.removeListener("error", onerror);
            source.removeListener("end", cleanup);
            source.removeListener("close", cleanup);
            dest.removeListener("close", cleanup);
          }
          source.on("end", cleanup);
          source.on("close", cleanup);
          dest.on("close", cleanup);
          dest.emit("pipe", source);
          return dest;
        };
      },
      {
        events: 20,
        inherits: 21,
        "readable-stream/duplex.js": 24,
        "readable-stream/passthrough.js": 31,
        "readable-stream/readable.js": 32,
        "readable-stream/transform.js": 33,
        "readable-stream/writable.js": 34,
      },
    ],
    36: [
      function (require, module, exports) {
        var Buffer = require("buffer").Buffer;
        var isBufferEncoding =
          Buffer.isEncoding ||
          function (encoding) {
            switch (encoding && encoding.toLowerCase()) {
              case "hex":
              case "utf8":
              case "utf-8":
              case "ascii":
              case "binary":
              case "base64":
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
              case "raw":
                return true;
              default:
                return false;
            }
          };
        function assertEncoding(encoding) {
          if (encoding && !isBufferEncoding(encoding)) {
            throw new Error("Unknown encoding: " + encoding);
          }
        }
        var StringDecoder = (exports.StringDecoder = function (encoding) {
          this.encoding = (encoding || "utf8")
            .toLowerCase()
            .replace(/[-_]/, "");
          assertEncoding(encoding);
          switch (this.encoding) {
            case "utf8":
              this.surrogateSize = 3;
              break;
            case "ucs2":
            case "utf16le":
              this.surrogateSize = 2;
              this.detectIncompleteChar = utf16DetectIncompleteChar;
              break;
            case "base64":
              this.surrogateSize = 3;
              this.detectIncompleteChar = base64DetectIncompleteChar;
              break;
            default:
              this.write = passThroughWrite;
              return;
          }
          this.charBuffer = new Buffer(6);
          this.charReceived = 0;
          this.charLength = 0;
        });
        StringDecoder.prototype.write = function (buffer) {
          var charStr = "";
          while (this.charLength) {
            var available =
              buffer.length >= this.charLength - this.charReceived
                ? this.charLength - this.charReceived
                : buffer.length;
            buffer.copy(this.charBuffer, this.charReceived, 0, available);
            this.charReceived += available;
            if (this.charReceived < this.charLength) {
              return "";
            }
            buffer = buffer.slice(available, buffer.length);
            charStr = this.charBuffer
              .slice(0, this.charLength)
              .toString(this.encoding);
            var charCode = charStr.charCodeAt(charStr.length - 1);
            if (charCode >= 55296 && charCode <= 56319) {
              this.charLength += this.surrogateSize;
              charStr = "";
              continue;
            }
            this.charReceived = this.charLength = 0;
            if (buffer.length === 0) {
              return charStr;
            }
            break;
          }
          this.detectIncompleteChar(buffer);
          var end = buffer.length;
          if (this.charLength) {
            buffer.copy(
              this.charBuffer,
              0,
              buffer.length - this.charReceived,
              end
            );
            end -= this.charReceived;
          }
          charStr += buffer.toString(this.encoding, 0, end);
          var end = charStr.length - 1;
          var charCode = charStr.charCodeAt(end);
          if (charCode >= 55296 && charCode <= 56319) {
            var size = this.surrogateSize;
            this.charLength += size;
            this.charReceived += size;
            this.charBuffer.copy(this.charBuffer, size, 0, size);
            buffer.copy(this.charBuffer, 0, 0, size);
            return charStr.substring(0, end);
          }
          return charStr;
        };
        StringDecoder.prototype.detectIncompleteChar = function (buffer) {
          var i = buffer.length >= 3 ? 3 : buffer.length;
          for (; i > 0; i--) {
            var c = buffer[buffer.length - i];
            if (i == 1 && c >> 5 == 6) {
              this.charLength = 2;
              break;
            }
            if (i <= 2 && c >> 4 == 14) {
              this.charLength = 3;
              break;
            }
            if (i <= 3 && c >> 3 == 30) {
              this.charLength = 4;
              break;
            }
          }
          this.charReceived = i;
        };
        StringDecoder.prototype.end = function (buffer) {
          var res = "";
          if (buffer && buffer.length) res = this.write(buffer);
          if (this.charReceived) {
            var cr = this.charReceived;
            var buf = this.charBuffer;
            var enc = this.encoding;
            res += buf.slice(0, cr).toString(enc);
          }
          return res;
        };
        function passThroughWrite(buffer) {
          return buffer.toString(this.encoding);
        }
        function utf16DetectIncompleteChar(buffer) {
          this.charReceived = buffer.length % 2;
          this.charLength = this.charReceived ? 2 : 0;
        }
        function base64DetectIncompleteChar(buffer) {
          this.charReceived = buffer.length % 3;
          this.charLength = this.charReceived ? 3 : 0;
        }
      },
      { buffer: 16 },
    ],
    37: [
      function (require, module, exports) {
        module.exports = function isBuffer(arg) {
          return (
            arg &&
            typeof arg === "object" &&
            typeof arg.copy === "function" &&
            typeof arg.fill === "function" &&
            typeof arg.readUInt8 === "function"
          );
        };
      },
      {},
    ],
    38: [
      function (require, module, exports) {
        (function (process, global) {
          var formatRegExp = /%[sdj%]/g;
          exports.format = function (f) {
            if (!isString(f)) {
              var objects = [];
              for (var i = 0; i < arguments.length; i++) {
                objects.push(inspect(arguments[i]));
              }
              return objects.join(" ");
            }
            var i = 1;
            var args = arguments;
            var len = args.length;
            var str = String(f).replace(formatRegExp, function (x) {
              if (x === "%%") return "%";
              if (i >= len) return x;
              switch (x) {
                case "%s":
                  return String(args[i++]);
                case "%d":
                  return Number(args[i++]);
                case "%j":
                  try {
                    return JSON.stringify(args[i++]);
                  } catch (_) {
                    return "[Circular]";
                  }
                default:
                  return x;
              }
            });
            for (var x = args[i]; i < len; x = args[++i]) {
              if (isNull(x) || !isObject(x)) {
                str += " " + x;
              } else {
                str += " " + inspect(x);
              }
            }
            return str;
          };
          exports.deprecate = function (fn, msg) {
            if (isUndefined(global.process)) {
              return function () {
                return exports.deprecate(fn, msg).apply(this, arguments);
              };
            }
            if (process.noDeprecation === true) {
              return fn;
            }
            var warned = false;
            function deprecated() {
              if (!warned) {
                if (process.throwDeprecation) {
                  throw new Error(msg);
                } else if (process.traceDeprecation) {
                  console.trace(msg);
                } else {
                  console.error(msg);
                }
                warned = true;
              }
              return fn.apply(this, arguments);
            }
            return deprecated;
          };
          var debugs = {};
          var debugEnviron;
          exports.debuglog = function (set) {
            if (isUndefined(debugEnviron))
              debugEnviron = process.env.NODE_DEBUG || "";
            set = set.toUpperCase();
            if (!debugs[set]) {
              if (new RegExp("\\b" + set + "\\b", "i").test(debugEnviron)) {
                var pid = process.pid;
                debugs[set] = function () {
                  var msg = exports.format.apply(exports, arguments);
                  console.error("%s %d: %s", set, pid, msg);
                };
              } else {
                debugs[set] = function () {};
              }
            }
            return debugs[set];
          };
          function inspect(obj, opts) {
            var ctx = { seen: [], stylize: stylizeNoColor };
            if (arguments.length >= 3) ctx.depth = arguments[2];
            if (arguments.length >= 4) ctx.colors = arguments[3];
            if (isBoolean(opts)) {
              ctx.showHidden = opts;
            } else if (opts) {
              exports._extend(ctx, opts);
            }
            if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
            if (isUndefined(ctx.depth)) ctx.depth = 2;
            if (isUndefined(ctx.colors)) ctx.colors = false;
            if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
            if (ctx.colors) ctx.stylize = stylizeWithColor;
            return formatValue(ctx, obj, ctx.depth);
          }
          exports.inspect = inspect;
          inspect.colors = {
            bold: [1, 22],
            italic: [3, 23],
            underline: [4, 24],
            inverse: [7, 27],
            white: [37, 39],
            grey: [90, 39],
            black: [30, 39],
            blue: [34, 39],
            cyan: [36, 39],
            green: [32, 39],
            magenta: [35, 39],
            red: [31, 39],
            yellow: [33, 39],
          };
          inspect.styles = {
            special: "cyan",
            number: "yellow",
            boolean: "yellow",
            undefined: "grey",
            null: "bold",
            string: "green",
            date: "magenta",
            regexp: "red",
          };
          function stylizeWithColor(str, styleType) {
            var style = inspect.styles[styleType];
            if (style) {
              return (
                "[" +
                inspect.colors[style][0] +
                "m" +
                str +
                "[" +
                inspect.colors[style][1] +
                "m"
              );
            } else {
              return str;
            }
          }
          function stylizeNoColor(str, styleType) {
            return str;
          }
          function arrayToHash(array) {
            var hash = {};
            array.forEach(function (val, idx) {
              hash[val] = true;
            });
            return hash;
          }
          function formatValue(ctx, value, recurseTimes) {
            if (
              ctx.customInspect &&
              value &&
              isFunction(value.inspect) &&
              value.inspect !== exports.inspect &&
              !(value.constructor && value.constructor.prototype === value)
            ) {
              var ret = value.inspect(recurseTimes, ctx);
              if (!isString(ret)) {
                ret = formatValue(ctx, ret, recurseTimes);
              }
              return ret;
            }
            var primitive = formatPrimitive(ctx, value);
            if (primitive) {
              return primitive;
            }
            var keys = Object.keys(value);
            var visibleKeys = arrayToHash(keys);
            if (ctx.showHidden) {
              keys = Object.getOwnPropertyNames(value);
            }
            if (
              isError(value) &&
              (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)
            ) {
              return formatError(value);
            }
            if (keys.length === 0) {
              if (isFunction(value)) {
                var name = value.name ? ": " + value.name : "";
                return ctx.stylize("[Function" + name + "]", "special");
              }
              if (isRegExp(value)) {
                return ctx.stylize(
                  RegExp.prototype.toString.call(value),
                  "regexp"
                );
              }
              if (isDate(value)) {
                return ctx.stylize(Date.prototype.toString.call(value), "date");
              }
              if (isError(value)) {
                return formatError(value);
              }
            }
            var base = "",
              array = false,
              braces = ["{", "}"];
            if (isArray(value)) {
              array = true;
              braces = ["[", "]"];
            }
            if (isFunction(value)) {
              var n = value.name ? ": " + value.name : "";
              base = " [Function" + n + "]";
            }
            if (isRegExp(value)) {
              base = " " + RegExp.prototype.toString.call(value);
            }
            if (isDate(value)) {
              base = " " + Date.prototype.toUTCString.call(value);
            }
            if (isError(value)) {
              base = " " + formatError(value);
            }
            if (keys.length === 0 && (!array || value.length == 0)) {
              return braces[0] + base + braces[1];
            }
            if (recurseTimes < 0) {
              if (isRegExp(value)) {
                return ctx.stylize(
                  RegExp.prototype.toString.call(value),
                  "regexp"
                );
              } else {
                return ctx.stylize("[Object]", "special");
              }
            }
            ctx.seen.push(value);
            var output;
            if (array) {
              output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
            } else {
              output = keys.map(function (key) {
                return formatProperty(
                  ctx,
                  value,
                  recurseTimes,
                  visibleKeys,
                  key,
                  array
                );
              });
            }
            ctx.seen.pop();
            return reduceToSingleString(output, base, braces);
          }
          function formatPrimitive(ctx, value) {
            if (isUndefined(value))
              return ctx.stylize("undefined", "undefined");
            if (isString(value)) {
              var simple =
                "'" +
                JSON.stringify(value)
                  .replace(/^"|"$/g, "")
                  .replace(/'/g, "\\'")
                  .replace(/\\"/g, '"') +
                "'";
              return ctx.stylize(simple, "string");
            }
            if (isNumber(value)) return ctx.stylize("" + value, "number");
            if (isBoolean(value)) return ctx.stylize("" + value, "boolean");
            if (isNull(value)) return ctx.stylize("null", "null");
          }
          function formatError(value) {
            return "[" + Error.prototype.toString.call(value) + "]";
          }
          function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
            var output = [];
            for (var i = 0, l = value.length; i < l; ++i) {
              if (hasOwnProperty(value, String(i))) {
                output.push(
                  formatProperty(
                    ctx,
                    value,
                    recurseTimes,
                    visibleKeys,
                    String(i),
                    true
                  )
                );
              } else {
                output.push("");
              }
            }
            keys.forEach(function (key) {
              if (!key.match(/^\d+$/)) {
                output.push(
                  formatProperty(
                    ctx,
                    value,
                    recurseTimes,
                    visibleKeys,
                    key,
                    true
                  )
                );
              }
            });
            return output;
          }
          function formatProperty(
            ctx,
            value,
            recurseTimes,
            visibleKeys,
            key,
            array
          ) {
            var name, str, desc;
            desc = Object.getOwnPropertyDescriptor(value, key) || {
              value: value[key],
            };
            if (desc.get) {
              if (desc.set) {
                str = ctx.stylize("[Getter/Setter]", "special");
              } else {
                str = ctx.stylize("[Getter]", "special");
              }
            } else {
              if (desc.set) {
                str = ctx.stylize("[Setter]", "special");
              }
            }
            if (!hasOwnProperty(visibleKeys, key)) {
              name = "[" + key + "]";
            }
            if (!str) {
              if (ctx.seen.indexOf(desc.value) < 0) {
                if (isNull(recurseTimes)) {
                  str = formatValue(ctx, desc.value, null);
                } else {
                  str = formatValue(ctx, desc.value, recurseTimes - 1);
                }
                if (str.indexOf("\n") > -1) {
                  if (array) {
                    str = str
                      .split("\n")
                      .map(function (line) {
                        return "  " + line;
                      })
                      .join("\n")
                      .substr(2);
                  } else {
                    str =
                      "\n" +
                      str
                        .split("\n")
                        .map(function (line) {
                          return "   " + line;
                        })
                        .join("\n");
                  }
                }
              } else {
                str = ctx.stylize("[Circular]", "special");
              }
            }
            if (isUndefined(name)) {
              if (array && key.match(/^\d+$/)) {
                return str;
              }
              name = JSON.stringify("" + key);
              if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                name = name.substr(1, name.length - 2);
                name = ctx.stylize(name, "name");
              } else {
                name = name
                  .replace(/'/g, "\\'")
                  .replace(/\\"/g, '"')
                  .replace(/(^"|"$)/g, "'");
                name = ctx.stylize(name, "string");
              }
            }
            return name + ": " + str;
          }
          function reduceToSingleString(output, base, braces) {
            var numLinesEst = 0;
            var length = output.reduce(function (prev, cur) {
              numLinesEst++;
              if (cur.indexOf("\n") >= 0) numLinesEst++;
              return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
            }, 0);
            if (length > 60) {
              return (
                braces[0] +
                (base === "" ? "" : base + "\n ") +
                " " +
                output.join(",\n  ") +
                " " +
                braces[1]
              );
            }
            return braces[0] + base + " " + output.join(", ") + " " + braces[1];
          }
          function isArray(ar) {
            return Array.isArray(ar);
          }
          exports.isArray = isArray;
          function isBoolean(arg) {
            return typeof arg === "boolean";
          }
          exports.isBoolean = isBoolean;
          function isNull(arg) {
            return arg === null;
          }
          exports.isNull = isNull;
          function isNullOrUndefined(arg) {
            return arg == null;
          }
          exports.isNullOrUndefined = isNullOrUndefined;
          function isNumber(arg) {
            return typeof arg === "number";
          }
          exports.isNumber = isNumber;
          function isString(arg) {
            return typeof arg === "string";
          }
          exports.isString = isString;
          function isSymbol(arg) {
            return typeof arg === "symbol";
          }
          exports.isSymbol = isSymbol;
          function isUndefined(arg) {
            return arg === void 0;
          }
          exports.isUndefined = isUndefined;
          function isRegExp(re) {
            return isObject(re) && objectToString(re) === "[object RegExp]";
          }
          exports.isRegExp = isRegExp;
          function isObject(arg) {
            return typeof arg === "object" && arg !== null;
          }
          exports.isObject = isObject;
          function isDate(d) {
            return isObject(d) && objectToString(d) === "[object Date]";
          }
          exports.isDate = isDate;
          function isError(e) {
            return (
              isObject(e) &&
              (objectToString(e) === "[object Error]" || e instanceof Error)
            );
          }
          exports.isError = isError;
          function isFunction(arg) {
            return typeof arg === "function";
          }
          exports.isFunction = isFunction;
          function isPrimitive(arg) {
            return (
              arg === null ||
              typeof arg === "boolean" ||
              typeof arg === "number" ||
              typeof arg === "string" ||
              typeof arg === "symbol" ||
              typeof arg === "undefined"
            );
          }
          exports.isPrimitive = isPrimitive;
          exports.isBuffer = require("./support/isBuffer");
          function objectToString(o) {
            return Object.prototype.toString.call(o);
          }
          function pad(n) {
            return n < 10 ? "0" + n.toString(10) : n.toString(10);
          }
          var months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          function timestamp() {
            var d = new Date();
            var time = [
              pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds()),
            ].join(":");
            return [d.getDate(), months[d.getMonth()], time].join(" ");
          }
          exports.log = function () {
            console.log(
              "%s - %s",
              timestamp(),
              exports.format.apply(exports, arguments)
            );
          };
          exports.inherits = require("inherits");
          exports._extend = function (origin, add) {
            if (!add || !isObject(add)) return origin;
            var keys = Object.keys(add);
            var i = keys.length;
            while (i--) {
              origin[keys[i]] = add[keys[i]];
            }
            return origin;
          };
          function hasOwnProperty(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
          }
        }.call(
          this,
          require("_process"),
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : typeof window !== "undefined"
            ? window
            : {}
        ));
      },
      { "./support/isBuffer": 37, _process: 23, inherits: 21 },
    ],
    39: [
      function (require, module, exports) {
        (function (Buffer) {
          "use strict";
          var Readable = require("readable-stream").Readable;
          var util = require("util");
          module.exports = ContentStream;
          function ContentStream(obj, options) {
            if (!(this instanceof ContentStream)) {
              return new ContentStream(obj, options);
            }
            Readable.call(this, options);
            if (obj === null || obj === undefined) {
              obj = String(obj);
            }
            this._obj = obj;
          }
          util.inherits(ContentStream, Readable);
          ContentStream.prototype._read = function (n) {
            var obj = this._obj;
            if (typeof obj === "string") {
              this.push(new Buffer(obj));
            } else if (Buffer.isBuffer(obj)) {
              this.push(obj);
            } else {
              this.push(new Buffer(JSON.stringify(obj)));
            }
            this.push(null);
          };
        }.call(this, require("buffer").Buffer));
      },
      { buffer: 16, "readable-stream": 49, util: 38 },
    ],
    40: [
      function (require, module, exports) {
        (function (process) {
          module.exports = Duplex;
          var objectKeys =
            Object.keys ||
            function (obj) {
              var keys = [];
              for (var key in obj) keys.push(key);
              return keys;
            };
          var util = require("core-util-is");
          util.inherits = require("inherits");
          var Readable = require("./_stream_readable");
          var Writable = require("./_stream_writable");
          util.inherits(Duplex, Readable);
          forEach(objectKeys(Writable.prototype), function (method) {
            if (!Duplex.prototype[method])
              Duplex.prototype[method] = Writable.prototype[method];
          });
          function Duplex(options) {
            if (!(this instanceof Duplex)) return new Duplex(options);
            Readable.call(this, options);
            Writable.call(this, options);
            if (options && options.readable === false) this.readable = false;
            if (options && options.writable === false) this.writable = false;
            this.allowHalfOpen = true;
            if (options && options.allowHalfOpen === false)
              this.allowHalfOpen = false;
            this.once("end", onend);
          }
          function onend() {
            if (this.allowHalfOpen || this._writableState.ended) return;
            process.nextTick(this.end.bind(this));
          }
          function forEach(xs, f) {
            for (var i = 0, l = xs.length; i < l; i++) {
              f(xs[i], i);
            }
          }
        }.call(this, require("_process")));
      },
      {
        "./_stream_readable": 42,
        "./_stream_writable": 44,
        _process: 23,
        "core-util-is": 45,
        inherits: 46,
      },
    ],
    41: [
      function (require, module, exports) {
        arguments[4][26][0].apply(exports, arguments);
      },
      { "./_stream_transform": 43, "core-util-is": 45, dup: 26, inherits: 46 },
    ],
    42: [
      function (require, module, exports) {
        (function (process) {
          module.exports = Readable;
          var isArray = require("isarray");
          var Buffer = require("buffer").Buffer;
          Readable.ReadableState = ReadableState;
          var EE = require("events").EventEmitter;
          if (!EE.listenerCount)
            EE.listenerCount = function (emitter, type) {
              return emitter.listeners(type).length;
            };
          var Stream = require("stream");
          var util = require("core-util-is");
          util.inherits = require("inherits");
          var StringDecoder;
          util.inherits(Readable, Stream);
          function ReadableState(options, stream) {
            options = options || {};
            var hwm = options.highWaterMark;
            this.highWaterMark = hwm || hwm === 0 ? hwm : 16 * 1024;
            this.highWaterMark = ~~this.highWaterMark;
            this.buffer = [];
            this.length = 0;
            this.pipes = null;
            this.pipesCount = 0;
            this.flowing = false;
            this.ended = false;
            this.endEmitted = false;
            this.reading = false;
            this.calledRead = false;
            this.sync = true;
            this.needReadable = false;
            this.emittedReadable = false;
            this.readableListening = false;
            this.objectMode = !!options.objectMode;
            this.defaultEncoding = options.defaultEncoding || "utf8";
            this.ranOut = false;
            this.awaitDrain = 0;
            this.readingMore = false;
            this.decoder = null;
            this.encoding = null;
            if (options.encoding) {
              if (!StringDecoder)
                StringDecoder = require("string_decoder/").StringDecoder;
              this.decoder = new StringDecoder(options.encoding);
              this.encoding = options.encoding;
            }
          }
          function Readable(options) {
            if (!(this instanceof Readable)) return new Readable(options);
            this._readableState = new ReadableState(options, this);
            this.readable = true;
            Stream.call(this);
          }
          Readable.prototype.push = function (chunk, encoding) {
            var state = this._readableState;
            if (typeof chunk === "string" && !state.objectMode) {
              encoding = encoding || state.defaultEncoding;
              if (encoding !== state.encoding) {
                chunk = new Buffer(chunk, encoding);
                encoding = "";
              }
            }
            return readableAddChunk(this, state, chunk, encoding, false);
          };
          Readable.prototype.unshift = function (chunk) {
            var state = this._readableState;
            return readableAddChunk(this, state, chunk, "", true);
          };
          function readableAddChunk(
            stream,
            state,
            chunk,
            encoding,
            addToFront
          ) {
            var er = chunkInvalid(state, chunk);
            if (er) {
              stream.emit("error", er);
            } else if (chunk === null || chunk === undefined) {
              state.reading = false;
              if (!state.ended) onEofChunk(stream, state);
            } else if (state.objectMode || (chunk && chunk.length > 0)) {
              if (state.ended && !addToFront) {
                var e = new Error("stream.push() after EOF");
                stream.emit("error", e);
              } else if (state.endEmitted && addToFront) {
                var e = new Error("stream.unshift() after end event");
                stream.emit("error", e);
              } else {
                if (state.decoder && !addToFront && !encoding)
                  chunk = state.decoder.write(chunk);
                state.length += state.objectMode ? 1 : chunk.length;
                if (addToFront) {
                  state.buffer.unshift(chunk);
                } else {
                  state.reading = false;
                  state.buffer.push(chunk);
                }
                if (state.needReadable) emitReadable(stream);
                maybeReadMore(stream, state);
              }
            } else if (!addToFront) {
              state.reading = false;
            }
            return needMoreData(state);
          }
          function needMoreData(state) {
            return (
              !state.ended &&
              (state.needReadable ||
                state.length < state.highWaterMark ||
                state.length === 0)
            );
          }
          Readable.prototype.setEncoding = function (enc) {
            if (!StringDecoder)
              StringDecoder = require("string_decoder/").StringDecoder;
            this._readableState.decoder = new StringDecoder(enc);
            this._readableState.encoding = enc;
          };
          var MAX_HWM = 8388608;
          function roundUpToNextPowerOf2(n) {
            if (n >= MAX_HWM) {
              n = MAX_HWM;
            } else {
              n--;
              for (var p = 1; p < 32; p <<= 1) n |= n >> p;
              n++;
            }
            return n;
          }
          function howMuchToRead(n, state) {
            if (state.length === 0 && state.ended) return 0;
            if (state.objectMode) return n === 0 ? 0 : 1;
            if (n === null || isNaN(n)) {
              if (state.flowing && state.buffer.length)
                return state.buffer[0].length;
              else return state.length;
            }
            if (n <= 0) return 0;
            if (n > state.highWaterMark)
              state.highWaterMark = roundUpToNextPowerOf2(n);
            if (n > state.length) {
              if (!state.ended) {
                state.needReadable = true;
                return 0;
              } else return state.length;
            }
            return n;
          }
          Readable.prototype.read = function (n) {
            var state = this._readableState;
            state.calledRead = true;
            var nOrig = n;
            var ret;
            if (typeof n !== "number" || n > 0) state.emittedReadable = false;
            if (
              n === 0 &&
              state.needReadable &&
              (state.length >= state.highWaterMark || state.ended)
            ) {
              emitReadable(this);
              return null;
            }
            n = howMuchToRead(n, state);
            if (n === 0 && state.ended) {
              ret = null;
              if (state.length > 0 && state.decoder) {
                ret = fromList(n, state);
                state.length -= ret.length;
              }
              if (state.length === 0) endReadable(this);
              return ret;
            }
            var doRead = state.needReadable;
            if (state.length - n <= state.highWaterMark) doRead = true;
            if (state.ended || state.reading) doRead = false;
            if (doRead) {
              state.reading = true;
              state.sync = true;
              if (state.length === 0) state.needReadable = true;
              this._read(state.highWaterMark);
              state.sync = false;
            }
            if (doRead && !state.reading) n = howMuchToRead(nOrig, state);
            if (n > 0) ret = fromList(n, state);
            else ret = null;
            if (ret === null) {
              state.needReadable = true;
              n = 0;
            }
            state.length -= n;
            if (state.length === 0 && !state.ended) state.needReadable = true;
            if (state.ended && !state.endEmitted && state.length === 0)
              endReadable(this);
            return ret;
          };
          function chunkInvalid(state, chunk) {
            var er = null;
            if (
              !Buffer.isBuffer(chunk) &&
              "string" !== typeof chunk &&
              chunk !== null &&
              chunk !== undefined &&
              !state.objectMode
            ) {
              er = new TypeError("Invalid non-string/buffer chunk");
            }
            return er;
          }
          function onEofChunk(stream, state) {
            if (state.decoder && !state.ended) {
              var chunk = state.decoder.end();
              if (chunk && chunk.length) {
                state.buffer.push(chunk);
                state.length += state.objectMode ? 1 : chunk.length;
              }
            }
            state.ended = true;
            if (state.length > 0) emitReadable(stream);
            else endReadable(stream);
          }
          function emitReadable(stream) {
            var state = stream._readableState;
            state.needReadable = false;
            if (state.emittedReadable) return;
            state.emittedReadable = true;
            if (state.sync)
              process.nextTick(function () {
                emitReadable_(stream);
              });
            else emitReadable_(stream);
          }
          function emitReadable_(stream) {
            stream.emit("readable");
          }
          function maybeReadMore(stream, state) {
            if (!state.readingMore) {
              state.readingMore = true;
              process.nextTick(function () {
                maybeReadMore_(stream, state);
              });
            }
          }
          function maybeReadMore_(stream, state) {
            var len = state.length;
            while (
              !state.reading &&
              !state.flowing &&
              !state.ended &&
              state.length < state.highWaterMark
            ) {
              stream.read(0);
              if (len === state.length) break;
              else len = state.length;
            }
            state.readingMore = false;
          }
          Readable.prototype._read = function (n) {
            this.emit("error", new Error("not implemented"));
          };
          Readable.prototype.pipe = function (dest, pipeOpts) {
            var src = this;
            var state = this._readableState;
            switch (state.pipesCount) {
              case 0:
                state.pipes = dest;
                break;
              case 1:
                state.pipes = [state.pipes, dest];
                break;
              default:
                state.pipes.push(dest);
                break;
            }
            state.pipesCount += 1;
            var doEnd =
              (!pipeOpts || pipeOpts.end !== false) &&
              dest !== process.stdout &&
              dest !== process.stderr;
            var endFn = doEnd ? onend : cleanup;
            if (state.endEmitted) process.nextTick(endFn);
            else src.once("end", endFn);
            dest.on("unpipe", onunpipe);
            function onunpipe(readable) {
              if (readable !== src) return;
              cleanup();
            }
            function onend() {
              dest.end();
            }
            var ondrain = pipeOnDrain(src);
            dest.on("drain", ondrain);
            function cleanup() {
              dest.removeListener("close", onclose);
              dest.removeListener("finish", onfinish);
              dest.removeListener("drain", ondrain);
              dest.removeListener("error", onerror);
              dest.removeListener("unpipe", onunpipe);
              src.removeListener("end", onend);
              src.removeListener("end", cleanup);
              if (!dest._writableState || dest._writableState.needDrain)
                ondrain();
            }
            function onerror(er) {
              unpipe();
              dest.removeListener("error", onerror);
              if (EE.listenerCount(dest, "error") === 0) dest.emit("error", er);
            }
            if (!dest._events || !dest._events.error) dest.on("error", onerror);
            else if (isArray(dest._events.error))
              dest._events.error.unshift(onerror);
            else dest._events.error = [onerror, dest._events.error];
            function onclose() {
              dest.removeListener("finish", onfinish);
              unpipe();
            }
            dest.once("close", onclose);
            function onfinish() {
              dest.removeListener("close", onclose);
              unpipe();
            }
            dest.once("finish", onfinish);
            function unpipe() {
              src.unpipe(dest);
            }
            dest.emit("pipe", src);
            if (!state.flowing) {
              this.on("readable", pipeOnReadable);
              state.flowing = true;
              process.nextTick(function () {
                flow(src);
              });
            }
            return dest;
          };
          function pipeOnDrain(src) {
            return function () {
              var dest = this;
              var state = src._readableState;
              state.awaitDrain--;
              if (state.awaitDrain === 0) flow(src);
            };
          }
          function flow(src) {
            var state = src._readableState;
            var chunk;
            state.awaitDrain = 0;
            function write(dest, i, list) {
              var written = dest.write(chunk);
              if (false === written) {
                state.awaitDrain++;
              }
            }
            while (state.pipesCount && null !== (chunk = src.read())) {
              if (state.pipesCount === 1) write(state.pipes, 0, null);
              else forEach(state.pipes, write);
              src.emit("data", chunk);
              if (state.awaitDrain > 0) return;
            }
            if (state.pipesCount === 0) {
              state.flowing = false;
              if (EE.listenerCount(src, "data") > 0) emitDataEvents(src);
              return;
            }
            state.ranOut = true;
          }
          function pipeOnReadable() {
            if (this._readableState.ranOut) {
              this._readableState.ranOut = false;
              flow(this);
            }
          }
          Readable.prototype.unpipe = function (dest) {
            var state = this._readableState;
            if (state.pipesCount === 0) return this;
            if (state.pipesCount === 1) {
              if (dest && dest !== state.pipes) return this;
              if (!dest) dest = state.pipes;
              state.pipes = null;
              state.pipesCount = 0;
              this.removeListener("readable", pipeOnReadable);
              state.flowing = false;
              if (dest) dest.emit("unpipe", this);
              return this;
            }
            if (!dest) {
              var dests = state.pipes;
              var len = state.pipesCount;
              state.pipes = null;
              state.pipesCount = 0;
              this.removeListener("readable", pipeOnReadable);
              state.flowing = false;
              for (var i = 0; i < len; i++) dests[i].emit("unpipe", this);
              return this;
            }
            var i = indexOf(state.pipes, dest);
            if (i === -1) return this;
            state.pipes.splice(i, 1);
            state.pipesCount -= 1;
            if (state.pipesCount === 1) state.pipes = state.pipes[0];
            dest.emit("unpipe", this);
            return this;
          };
          Readable.prototype.on = function (ev, fn) {
            var res = Stream.prototype.on.call(this, ev, fn);
            if (ev === "data" && !this._readableState.flowing)
              emitDataEvents(this);
            if (ev === "readable" && this.readable) {
              var state = this._readableState;
              if (!state.readableListening) {
                state.readableListening = true;
                state.emittedReadable = false;
                state.needReadable = true;
                if (!state.reading) {
                  this.read(0);
                } else if (state.length) {
                  emitReadable(this, state);
                }
              }
            }
            return res;
          };
          Readable.prototype.addListener = Readable.prototype.on;
          Readable.prototype.resume = function () {
            emitDataEvents(this);
            this.read(0);
            this.emit("resume");
          };
          Readable.prototype.pause = function () {
            emitDataEvents(this, true);
            this.emit("pause");
          };
          function emitDataEvents(stream, startPaused) {
            var state = stream._readableState;
            if (state.flowing) {
              throw new Error("Cannot switch to old mode now.");
            }
            var paused = startPaused || false;
            var readable = false;
            stream.readable = true;
            stream.pipe = Stream.prototype.pipe;
            stream.on = stream.addListener = Stream.prototype.on;
            stream.on("readable", function () {
              readable = true;
              var c;
              while (!paused && null !== (c = stream.read()))
                stream.emit("data", c);
              if (c === null) {
                readable = false;
                stream._readableState.needReadable = true;
              }
            });
            stream.pause = function () {
              paused = true;
              this.emit("pause");
            };
            stream.resume = function () {
              paused = false;
              if (readable)
                process.nextTick(function () {
                  stream.emit("readable");
                });
              else this.read(0);
              this.emit("resume");
            };
            stream.emit("readable");
          }
          Readable.prototype.wrap = function (stream) {
            var state = this._readableState;
            var paused = false;
            var self = this;
            stream.on("end", function () {
              if (state.decoder && !state.ended) {
                var chunk = state.decoder.end();
                if (chunk && chunk.length) self.push(chunk);
              }
              self.push(null);
            });
            stream.on("data", function (chunk) {
              if (state.decoder) chunk = state.decoder.write(chunk);
              if (state.objectMode && (chunk === null || chunk === undefined))
                return;
              else if (!state.objectMode && (!chunk || !chunk.length)) return;
              var ret = self.push(chunk);
              if (!ret) {
                paused = true;
                stream.pause();
              }
            });
            for (var i in stream) {
              if (
                typeof stream[i] === "function" &&
                typeof this[i] === "undefined"
              ) {
                this[i] = (function (method) {
                  return function () {
                    return stream[method].apply(stream, arguments);
                  };
                })(i);
              }
            }
            var events = ["error", "close", "destroy", "pause", "resume"];
            forEach(events, function (ev) {
              stream.on(ev, self.emit.bind(self, ev));
            });
            self._read = function (n) {
              if (paused) {
                paused = false;
                stream.resume();
              }
            };
            return self;
          };
          Readable._fromList = fromList;
          function fromList(n, state) {
            var list = state.buffer;
            var length = state.length;
            var stringMode = !!state.decoder;
            var objectMode = !!state.objectMode;
            var ret;
            if (list.length === 0) return null;
            if (length === 0) ret = null;
            else if (objectMode) ret = list.shift();
            else if (!n || n >= length) {
              if (stringMode) ret = list.join("");
              else ret = Buffer.concat(list, length);
              list.length = 0;
            } else {
              if (n < list[0].length) {
                var buf = list[0];
                ret = buf.slice(0, n);
                list[0] = buf.slice(n);
              } else if (n === list[0].length) {
                ret = list.shift();
              } else {
                if (stringMode) ret = "";
                else ret = new Buffer(n);
                var c = 0;
                for (var i = 0, l = list.length; i < l && c < n; i++) {
                  var buf = list[0];
                  var cpy = Math.min(n - c, buf.length);
                  if (stringMode) ret += buf.slice(0, cpy);
                  else buf.copy(ret, c, 0, cpy);
                  if (cpy < buf.length) list[0] = buf.slice(cpy);
                  else list.shift();
                  c += cpy;
                }
              }
            }
            return ret;
          }
          function endReadable(stream) {
            var state = stream._readableState;
            if (state.length > 0)
              throw new Error("endReadable called on non-empty stream");
            if (!state.endEmitted && state.calledRead) {
              state.ended = true;
              process.nextTick(function () {
                if (!state.endEmitted && state.length === 0) {
                  state.endEmitted = true;
                  stream.readable = false;
                  stream.emit("end");
                }
              });
            }
          }
          function forEach(xs, f) {
            for (var i = 0, l = xs.length; i < l; i++) {
              f(xs[i], i);
            }
          }
          function indexOf(xs, x) {
            for (var i = 0, l = xs.length; i < l; i++) {
              if (xs[i] === x) return i;
            }
            return -1;
          }
        }.call(this, require("_process")));
      },
      {
        _process: 23,
        buffer: 16,
        "core-util-is": 45,
        events: 20,
        inherits: 46,
        isarray: 47,
        stream: 35,
        "string_decoder/": 48,
      },
    ],
    43: [
      function (require, module, exports) {
        arguments[4][28][0].apply(exports, arguments);
      },
      { "./_stream_duplex": 40, "core-util-is": 45, dup: 28, inherits: 46 },
    ],
    44: [
      function (require, module, exports) {
        (function (process) {
          module.exports = Writable;
          var Buffer = require("buffer").Buffer;
          Writable.WritableState = WritableState;
          var util = require("core-util-is");
          util.inherits = require("inherits");
          var Stream = require("stream");
          util.inherits(Writable, Stream);
          function WriteReq(chunk, encoding, cb) {
            this.chunk = chunk;
            this.encoding = encoding;
            this.callback = cb;
          }
          function WritableState(options, stream) {
            options = options || {};
            var hwm = options.highWaterMark;
            this.highWaterMark = hwm || hwm === 0 ? hwm : 16 * 1024;
            this.objectMode = !!options.objectMode;
            this.highWaterMark = ~~this.highWaterMark;
            this.needDrain = false;
            this.ending = false;
            this.ended = false;
            this.finished = false;
            var noDecode = options.decodeStrings === false;
            this.decodeStrings = !noDecode;
            this.defaultEncoding = options.defaultEncoding || "utf8";
            this.length = 0;
            this.writing = false;
            this.sync = true;
            this.bufferProcessing = false;
            this.onwrite = function (er) {
              onwrite(stream, er);
            };
            this.writecb = null;
            this.writelen = 0;
            this.buffer = [];
            this.errorEmitted = false;
          }
          function Writable(options) {
            var Duplex = require("./_stream_duplex");
            if (!(this instanceof Writable) && !(this instanceof Duplex))
              return new Writable(options);
            this._writableState = new WritableState(options, this);
            this.writable = true;
            Stream.call(this);
          }
          Writable.prototype.pipe = function () {
            this.emit("error", new Error("Cannot pipe. Not readable."));
          };
          function writeAfterEnd(stream, state, cb) {
            var er = new Error("write after end");
            stream.emit("error", er);
            process.nextTick(function () {
              cb(er);
            });
          }
          function validChunk(stream, state, chunk, cb) {
            var valid = true;
            if (
              !Buffer.isBuffer(chunk) &&
              "string" !== typeof chunk &&
              chunk !== null &&
              chunk !== undefined &&
              !state.objectMode
            ) {
              var er = new TypeError("Invalid non-string/buffer chunk");
              stream.emit("error", er);
              process.nextTick(function () {
                cb(er);
              });
              valid = false;
            }
            return valid;
          }
          Writable.prototype.write = function (chunk, encoding, cb) {
            var state = this._writableState;
            var ret = false;
            if (typeof encoding === "function") {
              cb = encoding;
              encoding = null;
            }
            if (Buffer.isBuffer(chunk)) encoding = "buffer";
            else if (!encoding) encoding = state.defaultEncoding;
            if (typeof cb !== "function") cb = function () {};
            if (state.ended) writeAfterEnd(this, state, cb);
            else if (validChunk(this, state, chunk, cb))
              ret = writeOrBuffer(this, state, chunk, encoding, cb);
            return ret;
          };
          function decodeChunk(state, chunk, encoding) {
            if (
              !state.objectMode &&
              state.decodeStrings !== false &&
              typeof chunk === "string"
            ) {
              chunk = new Buffer(chunk, encoding);
            }
            return chunk;
          }
          function writeOrBuffer(stream, state, chunk, encoding, cb) {
            chunk = decodeChunk(state, chunk, encoding);
            if (Buffer.isBuffer(chunk)) encoding = "buffer";
            var len = state.objectMode ? 1 : chunk.length;
            state.length += len;
            var ret = state.length < state.highWaterMark;
            if (!ret) state.needDrain = true;
            if (state.writing)
              state.buffer.push(new WriteReq(chunk, encoding, cb));
            else doWrite(stream, state, len, chunk, encoding, cb);
            return ret;
          }
          function doWrite(stream, state, len, chunk, encoding, cb) {
            state.writelen = len;
            state.writecb = cb;
            state.writing = true;
            state.sync = true;
            stream._write(chunk, encoding, state.onwrite);
            state.sync = false;
          }
          function onwriteError(stream, state, sync, er, cb) {
            if (sync)
              process.nextTick(function () {
                cb(er);
              });
            else cb(er);
            stream._writableState.errorEmitted = true;
            stream.emit("error", er);
          }
          function onwriteStateUpdate(state) {
            state.writing = false;
            state.writecb = null;
            state.length -= state.writelen;
            state.writelen = 0;
          }
          function onwrite(stream, er) {
            var state = stream._writableState;
            var sync = state.sync;
            var cb = state.writecb;
            onwriteStateUpdate(state);
            if (er) onwriteError(stream, state, sync, er, cb);
            else {
              var finished = needFinish(stream, state);
              if (!finished && !state.bufferProcessing && state.buffer.length)
                clearBuffer(stream, state);
              if (sync) {
                process.nextTick(function () {
                  afterWrite(stream, state, finished, cb);
                });
              } else {
                afterWrite(stream, state, finished, cb);
              }
            }
          }
          function afterWrite(stream, state, finished, cb) {
            if (!finished) onwriteDrain(stream, state);
            cb();
            if (finished) finishMaybe(stream, state);
          }
          function onwriteDrain(stream, state) {
            if (state.length === 0 && state.needDrain) {
              state.needDrain = false;
              stream.emit("drain");
            }
          }
          function clearBuffer(stream, state) {
            state.bufferProcessing = true;
            for (var c = 0; c < state.buffer.length; c++) {
              var entry = state.buffer[c];
              var chunk = entry.chunk;
              var encoding = entry.encoding;
              var cb = entry.callback;
              var len = state.objectMode ? 1 : chunk.length;
              doWrite(stream, state, len, chunk, encoding, cb);
              if (state.writing) {
                c++;
                break;
              }
            }
            state.bufferProcessing = false;
            if (c < state.buffer.length) state.buffer = state.buffer.slice(c);
            else state.buffer.length = 0;
          }
          Writable.prototype._write = function (chunk, encoding, cb) {
            cb(new Error("not implemented"));
          };
          Writable.prototype.end = function (chunk, encoding, cb) {
            var state = this._writableState;
            if (typeof chunk === "function") {
              cb = chunk;
              chunk = null;
              encoding = null;
            } else if (typeof encoding === "function") {
              cb = encoding;
              encoding = null;
            }
            if (typeof chunk !== "undefined" && chunk !== null)
              this.write(chunk, encoding);
            if (!state.ending && !state.finished) endWritable(this, state, cb);
          };
          function needFinish(stream, state) {
            return (
              state.ending &&
              state.length === 0 &&
              !state.finished &&
              !state.writing
            );
          }
          function finishMaybe(stream, state) {
            var need = needFinish(stream, state);
            if (need) {
              state.finished = true;
              stream.emit("finish");
            }
            return need;
          }
          function endWritable(stream, state, cb) {
            state.ending = true;
            finishMaybe(stream, state);
            if (cb) {
              if (state.finished) process.nextTick(cb);
              else stream.once("finish", cb);
            }
            state.ended = true;
          }
        }.call(this, require("_process")));
      },
      {
        "./_stream_duplex": 40,
        _process: 23,
        buffer: 16,
        "core-util-is": 45,
        inherits: 46,
        stream: 35,
      },
    ],
    45: [
      function (require, module, exports) {
        (function (Buffer) {
          function isArray(ar) {
            return Array.isArray(ar);
          }
          exports.isArray = isArray;
          function isBoolean(arg) {
            return typeof arg === "boolean";
          }
          exports.isBoolean = isBoolean;
          function isNull(arg) {
            return arg === null;
          }
          exports.isNull = isNull;
          function isNullOrUndefined(arg) {
            return arg == null;
          }
          exports.isNullOrUndefined = isNullOrUndefined;
          function isNumber(arg) {
            return typeof arg === "number";
          }
          exports.isNumber = isNumber;
          function isString(arg) {
            return typeof arg === "string";
          }
          exports.isString = isString;
          function isSymbol(arg) {
            return typeof arg === "symbol";
          }
          exports.isSymbol = isSymbol;
          function isUndefined(arg) {
            return arg === void 0;
          }
          exports.isUndefined = isUndefined;
          function isRegExp(re) {
            return isObject(re) && objectToString(re) === "[object RegExp]";
          }
          exports.isRegExp = isRegExp;
          function isObject(arg) {
            return typeof arg === "object" && arg !== null;
          }
          exports.isObject = isObject;
          function isDate(d) {
            return isObject(d) && objectToString(d) === "[object Date]";
          }
          exports.isDate = isDate;
          function isError(e) {
            return (
              isObject(e) &&
              (objectToString(e) === "[object Error]" || e instanceof Error)
            );
          }
          exports.isError = isError;
          function isFunction(arg) {
            return typeof arg === "function";
          }
          exports.isFunction = isFunction;
          function isPrimitive(arg) {
            return (
              arg === null ||
              typeof arg === "boolean" ||
              typeof arg === "number" ||
              typeof arg === "string" ||
              typeof arg === "symbol" ||
              typeof arg === "undefined"
            );
          }
          exports.isPrimitive = isPrimitive;
          function isBuffer(arg) {
            return Buffer.isBuffer(arg);
          }
          exports.isBuffer = isBuffer;
          function objectToString(o) {
            return Object.prototype.toString.call(o);
          }
        }.call(this, require("buffer").Buffer));
      },
      { buffer: 16 },
    ],
    46: [
      function (require, module, exports) {
        arguments[4][21][0].apply(exports, arguments);
      },
      { dup: 21 },
    ],
    47: [
      function (require, module, exports) {
        arguments[4][22][0].apply(exports, arguments);
      },
      { dup: 22 },
    ],
    48: [
      function (require, module, exports) {
        arguments[4][36][0].apply(exports, arguments);
      },
      { buffer: 16, dup: 36 },
    ],
    49: [
      function (require, module, exports) {
        arguments[4][32][0].apply(exports, arguments);
      },
      {
        "./lib/_stream_duplex.js": 40,
        "./lib/_stream_passthrough.js": 41,
        "./lib/_stream_readable.js": 42,
        "./lib/_stream_transform.js": 43,
        "./lib/_stream_writable.js": 44,
        dup: 32,
        stream: 35,
      },
    ],
    50: [
      function (require, module, exports) {
        (function (Buffer) {
          var assert = require("assert");
          var EventEmitter = require("events").EventEmitter;
          var ReadableStream = require("readable-stream");
          var util = require("util");
          var NeuQuant = require("./TypedNeuQuant.js");
          var LZWEncoder = require("./LZWEncoder.js");
          function ByteCapacitor(options) {
            ReadableStream.call(this, options);
            this.okayToPush = true;
            this.resetData();
          }
          util.inherits(ByteCapacitor, ReadableStream);
          ByteCapacitor.prototype._read = function () {
            this.okayToPush = true;
          };
          ByteCapacitor.prototype.resetData = function () {
            this.data = [];
          };
          ByteCapacitor.prototype.flushData = function () {
            if (!this.okayToPush) {
              var err = new Error(
                "GIF memory limit exceeded. Please `read` from GIF before writing additional frames/information."
              );
              return this.emit("error", err);
            }
            var buff = new Buffer(this.data);
            this.resetData();
            this.okayToPush = this.push(buff);
          };
          ByteCapacitor.prototype.writeByte = function (val) {
            this.data.push(val);
          };
          ByteCapacitor.prototype.writeUTFBytes = function (string) {
            for (var l = string.length, i = 0; i < l; i++) {
              this.writeByte(string.charCodeAt(i));
            }
          };
          ByteCapacitor.prototype.writeBytes = function (
            array,
            offset,
            length
          ) {
            for (var l = length || array.length, i = offset || 0; i < l; i++) {
              this.writeByte(array[i]);
            }
          };
          function GIFEncoder(width, height, options) {
            options = options || {};
            var hwm = options.highWaterMark;
            ByteCapacitor.call(this, {
              highWaterMark: hwm || hwm === 0 ? hwm : 64 * 1024,
            });
            this.width = ~~width;
            this.height = ~~height;
            this.transparent = null;
            this.transIndex = 0;
            this.repeat = -1;
            this.delay = 0;
            this.pixels = null;
            this.indexedPixels = null;
            this.colorDepth = null;
            this.colorTab = null;
            this.usedEntry = [];
            this.palSize = 7;
            this.dispose = -1;
            this.firstFrame = true;
            this.sample = 10;
            var that = this;
            function flushData() {
              that.flushData();
            }
            this.on("writeHeader#stop", flushData);
            this.on("frame#stop", flushData);
            this.on("finish#stop", function finishGif() {
              flushData();
              that.push(null);
            });
          }
          util.inherits(GIFEncoder, ByteCapacitor);
          GIFEncoder.prototype.setDelay = function (milliseconds) {
            this.delay = Math.round(milliseconds / 10);
          };
          GIFEncoder.prototype.setFrameRate = function (fps) {
            this.delay = Math.round(100 / fps);
          };
          GIFEncoder.prototype.setDispose = function (disposalCode) {
            if (disposalCode >= 0) this.dispose = disposalCode;
          };
          GIFEncoder.prototype.setRepeat = function (repeat) {
            this.repeat = repeat;
          };
          GIFEncoder.prototype.setTransparent = function (color) {
            this.transparent = color;
          };
          GIFEncoder.prototype.analyzeImage = function (imageData) {
            this.setImagePixels(this.removeAlphaChannel(imageData));
            this.analyzePixels();
          };
          GIFEncoder.prototype.writeImageInfo = function () {
            if (this.firstFrame) {
              this.writeLSD();
              this.writePalette();
              if (this.repeat >= 0) {
                this.writeNetscapeExt();
              }
            }
            this.writeGraphicCtrlExt();
            this.writeImageDesc();
            if (!this.firstFrame) this.writePalette();
            this.firstFrame = false;
          };
          GIFEncoder.prototype.outputImage = function () {
            this.writePixels();
          };
          GIFEncoder.prototype.addFrame = function (imageData) {
            this.emit("frame#start");
            this.analyzeImage(imageData);
            this.writeImageInfo();
            this.outputImage();
            this.emit("frame#stop");
          };
          GIFEncoder.prototype.finish = function () {
            this.emit("finish#start");
            this.writeByte(59);
            this.emit("finish#stop");
          };
          GIFEncoder.prototype.setQuality = function (quality) {
            if (quality < 1) quality = 1;
            this.sample = quality;
          };
          GIFEncoder.prototype.writeHeader = function () {
            this.emit("writeHeader#start");
            this.writeUTFBytes("GIF89a");
            this.emit("writeHeader#stop");
          };
          GIFEncoder.prototype.analyzePixels = function () {
            var len = this.pixels.length;
            var nPix = len / 3;
            this.indexedPixels = new Uint8Array(nPix);
            var imgq = new NeuQuant(this.pixels, this.sample);
            imgq.buildColormap();
            this.colorTab = imgq.getColormap();
            var k = 0;
            for (var j = 0; j < nPix; j++) {
              var index = imgq.lookupRGB(
                this.pixels[k++] & 255,
                this.pixels[k++] & 255,
                this.pixels[k++] & 255
              );
              this.usedEntry[index] = true;
              this.indexedPixels[j] = index;
            }
            this.pixels = null;
            this.colorDepth = 8;
            this.palSize = 7;
            if (this.transparent !== null) {
              this.transIndex = this.findClosest(this.transparent);
            }
          };
          GIFEncoder.prototype.findClosest = function (c) {
            if (this.colorTab === null) return -1;
            var r = (c & 16711680) >> 16;
            var g = (c & 65280) >> 8;
            var b = c & 255;
            var minpos = 0;
            var dmin = 256 * 256 * 256;
            var len = this.colorTab.length;
            for (var i = 0; i < len; ) {
              var dr = r - (this.colorTab[i++] & 255);
              var dg = g - (this.colorTab[i++] & 255);
              var db = b - (this.colorTab[i] & 255);
              var d = dr * dr + dg * dg + db * db;
              var index = i / 3;
              if (this.usedEntry[index] && d < dmin) {
                dmin = d;
                minpos = index;
              }
              i++;
            }
            return minpos;
          };
          GIFEncoder.prototype.removeAlphaChannel = function (data) {
            var w = this.width;
            var h = this.height;
            var pixels = new Uint8Array(w * h * 3);
            var count = 0;
            for (var i = 0; i < h; i++) {
              for (var j = 0; j < w; j++) {
                var b = i * w * 4 + j * 4;
                pixels[count++] = data[b];
                pixels[count++] = data[b + 1];
                pixels[count++] = data[b + 2];
              }
            }
            return pixels;
          };
          GIFEncoder.prototype.setImagePixels = function (pixels) {
            this.pixels = pixels;
          };
          GIFEncoder.prototype.writeGraphicCtrlExt = function () {
            this.writeByte(33);
            this.writeByte(249);
            this.writeByte(4);
            var transp, disp;
            if (this.transparent === null) {
              transp = 0;
              disp = 0;
            } else {
              transp = 1;
              disp = 2;
            }
            if (this.dispose >= 0) {
              disp = dispose & 7;
            }
            disp <<= 2;
            this.writeByte(0 | disp | 0 | transp);
            this.writeShort(this.delay);
            this.writeByte(this.transIndex);
            this.writeByte(0);
          };
          GIFEncoder.prototype.writeImageDesc = function () {
            this.writeByte(44);
            this.writeShort(0);
            this.writeShort(0);
            this.writeShort(this.width);
            this.writeShort(this.height);
            if (this.firstFrame) {
              this.writeByte(0);
            } else {
              this.writeByte(128 | 0 | 0 | 0 | this.palSize);
            }
          };
          GIFEncoder.prototype.writeLSD = function () {
            this.writeShort(this.width);
            this.writeShort(this.height);
            this.writeByte(128 | 112 | 0 | this.palSize);
            this.writeByte(0);
            this.writeByte(0);
          };
          GIFEncoder.prototype.writeNetscapeExt = function () {
            this.writeByte(33);
            this.writeByte(255);
            this.writeByte(11);
            this.writeUTFBytes("NETSCAPE2.0");
            this.writeByte(3);
            this.writeByte(1);
            this.writeShort(this.repeat);
            this.writeByte(0);
          };
          GIFEncoder.prototype.writePalette = function () {
            this.writeBytes(this.colorTab);
            var n = 3 * 256 - this.colorTab.length;
            for (var i = 0; i < n; i++) this.writeByte(0);
          };
          GIFEncoder.prototype.writeShort = function (pValue) {
            this.writeByte(pValue & 255);
            this.writeByte((pValue >> 8) & 255);
          };
          GIFEncoder.prototype.writePixels = function () {
            var enc = new LZWEncoder(
              this.width,
              this.height,
              this.indexedPixels,
              this.colorDepth
            );
            enc.encode(this);
          };
          GIFEncoder.prototype.stream = function () {
            return this;
          };
          GIFEncoder.ByteCapacitor = ByteCapacitor;
          module.exports = GIFEncoder;
        }.call(this, require("buffer").Buffer));
      },
      {
        "./LZWEncoder.js": 51,
        "./TypedNeuQuant.js": 52,
        assert: 1,
        buffer: 16,
        events: 20,
        "readable-stream": 62,
        util: 38,
      },
    ],
    51: [
      function (require, module, exports) {
        var EOF = -1;
        var BITS = 12;
        var HSIZE = 5003;
        var masks = [
          0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383,
          32767, 65535,
        ];
        function LZWEncoder(width, height, pixels, colorDepth) {
          var initCodeSize = Math.max(2, colorDepth);
          var accum = new Uint8Array(256);
          var htab = new Int32Array(HSIZE);
          var codetab = new Int32Array(HSIZE);
          var cur_accum,
            cur_bits = 0;
          var a_count;
          var free_ent = 0;
          var maxcode;
          var clear_flg = false;
          var g_init_bits, ClearCode, EOFCode;
          function char_out(c, outs) {
            accum[a_count++] = c;
            if (a_count >= 254) flush_char(outs);
          }
          function cl_block(outs) {
            cl_hash(HSIZE);
            free_ent = ClearCode + 2;
            clear_flg = true;
            output(ClearCode, outs);
          }
          function cl_hash(hsize) {
            for (var i = 0; i < hsize; ++i) htab[i] = -1;
          }
          function compress(init_bits, outs) {
            var fcode, c, i, ent, disp, hsize_reg, hshift;
            g_init_bits = init_bits;
            clear_flg = false;
            n_bits = g_init_bits;
            maxcode = MAXCODE(n_bits);
            ClearCode = 1 << (init_bits - 1);
            EOFCode = ClearCode + 1;
            free_ent = ClearCode + 2;
            a_count = 0;
            ent = nextPixel();
            hshift = 0;
            for (fcode = HSIZE; fcode < 65536; fcode *= 2) ++hshift;
            hshift = 8 - hshift;
            hsize_reg = HSIZE;
            cl_hash(hsize_reg);
            output(ClearCode, outs);
            outer_loop: while ((c = nextPixel()) != EOF) {
              fcode = (c << BITS) + ent;
              i = (c << hshift) ^ ent;
              if (htab[i] === fcode) {
                ent = codetab[i];
                continue;
              } else if (htab[i] >= 0) {
                disp = hsize_reg - i;
                if (i === 0) disp = 1;
                do {
                  if ((i -= disp) < 0) i += hsize_reg;
                  if (htab[i] === fcode) {
                    ent = codetab[i];
                    continue outer_loop;
                  }
                } while (htab[i] >= 0);
              }
              output(ent, outs);
              ent = c;
              if (free_ent < 1 << BITS) {
                codetab[i] = free_ent++;
                htab[i] = fcode;
              } else {
                cl_block(outs);
              }
            }
            output(ent, outs);
            output(EOFCode, outs);
          }
          function encode(outs) {
            outs.writeByte(initCodeSize);
            remaining = width * height;
            curPixel = 0;
            compress(initCodeSize + 1, outs);
            outs.writeByte(0);
          }
          function flush_char(outs) {
            if (a_count > 0) {
              outs.writeByte(a_count);
              outs.writeBytes(accum, 0, a_count);
              a_count = 0;
            }
          }
          function MAXCODE(n_bits) {
            return (1 << n_bits) - 1;
          }
          function nextPixel() {
            if (remaining === 0) return EOF;
            --remaining;
            var pix = pixels[curPixel++];
            return pix & 255;
          }
          function output(code, outs) {
            cur_accum &= masks[cur_bits];
            if (cur_bits > 0) cur_accum |= code << cur_bits;
            else cur_accum = code;
            cur_bits += n_bits;
            while (cur_bits >= 8) {
              char_out(cur_accum & 255, outs);
              cur_accum >>= 8;
              cur_bits -= 8;
            }
            if (free_ent > maxcode || clear_flg) {
              if (clear_flg) {
                maxcode = MAXCODE((n_bits = g_init_bits));
                clear_flg = false;
              } else {
                ++n_bits;
                if (n_bits == BITS) maxcode = 1 << BITS;
                else maxcode = MAXCODE(n_bits);
              }
            }
            if (code == EOFCode) {
              while (cur_bits > 0) {
                char_out(cur_accum & 255, outs);
                cur_accum >>= 8;
                cur_bits -= 8;
              }
              flush_char(outs);
            }
          }
          this.encode = encode;
        }
        module.exports = LZWEncoder;
      },
      {},
    ],
    52: [
      function (require, module, exports) {
        var ncycles = 100;
        var netsize = 256;
        var maxnetpos = netsize - 1;
        var netbiasshift = 4;
        var intbiasshift = 16;
        var intbias = 1 << intbiasshift;
        var gammashift = 10;
        var gamma = 1 << gammashift;
        var betashift = 10;
        var beta = intbias >> betashift;
        var betagamma = intbias << (gammashift - betashift);
        var initrad = netsize >> 3;
        var radiusbiasshift = 6;
        var radiusbias = 1 << radiusbiasshift;
        var initradius = initrad * radiusbias;
        var radiusdec = 30;
        var alphabiasshift = 10;
        var initalpha = 1 << alphabiasshift;
        var alphadec;
        var radbiasshift = 8;
        var radbias = 1 << radbiasshift;
        var alpharadbshift = alphabiasshift + radbiasshift;
        var alpharadbias = 1 << alpharadbshift;
        var prime1 = 499;
        var prime2 = 491;
        var prime3 = 487;
        var prime4 = 503;
        var minpicturebytes = 3 * prime4;
        function NeuQuant(pixels, samplefac) {
          var network;
          var netindex;
          var bias;
          var freq;
          var radpower;
          function init() {
            network = [];
            netindex = new Int32Array(256);
            bias = new Int32Array(netsize);
            freq = new Int32Array(netsize);
            radpower = new Int32Array(netsize >> 3);
            var i, v;
            for (i = 0; i < netsize; i++) {
              v = (i << (netbiasshift + 8)) / netsize;
              network[i] = new Float64Array([v, v, v, 0]);
              freq[i] = intbias / netsize;
              bias[i] = 0;
            }
          }
          function unbiasnet() {
            for (var i = 0; i < netsize; i++) {
              network[i][0] >>= netbiasshift;
              network[i][1] >>= netbiasshift;
              network[i][2] >>= netbiasshift;
              network[i][3] = i;
            }
          }
          function altersingle(alpha, i, b, g, r) {
            network[i][0] -= (alpha * (network[i][0] - b)) / initalpha;
            network[i][1] -= (alpha * (network[i][1] - g)) / initalpha;
            network[i][2] -= (alpha * (network[i][2] - r)) / initalpha;
          }
          function alterneigh(radius, i, b, g, r) {
            var lo = Math.abs(i - radius);
            var hi = Math.min(i + radius, netsize);
            var j = i + 1;
            var k = i - 1;
            var m = 1;
            var p, a;
            while (j < hi || k > lo) {
              a = radpower[m++];
              if (j < hi) {
                p = network[j++];
                p[0] -= (a * (p[0] - b)) / alpharadbias;
                p[1] -= (a * (p[1] - g)) / alpharadbias;
                p[2] -= (a * (p[2] - r)) / alpharadbias;
              }
              if (k > lo) {
                p = network[k--];
                p[0] -= (a * (p[0] - b)) / alpharadbias;
                p[1] -= (a * (p[1] - g)) / alpharadbias;
                p[2] -= (a * (p[2] - r)) / alpharadbias;
              }
            }
          }
          function contest(b, g, r) {
            var bestd = ~(1 << 31);
            var bestbiasd = bestd;
            var bestpos = -1;
            var bestbiaspos = bestpos;
            var i, n, dist, biasdist, betafreq;
            for (i = 0; i < netsize; i++) {
              n = network[i];
              dist =
                Math.abs(n[0] - b) + Math.abs(n[1] - g) + Math.abs(n[2] - r);
              if (dist < bestd) {
                bestd = dist;
                bestpos = i;
              }
              biasdist = dist - (bias[i] >> (intbiasshift - netbiasshift));
              if (biasdist < bestbiasd) {
                bestbiasd = biasdist;
                bestbiaspos = i;
              }
              betafreq = freq[i] >> betashift;
              freq[i] -= betafreq;
              bias[i] += betafreq << gammashift;
            }
            freq[bestpos] += beta;
            bias[bestpos] -= betagamma;
            return bestbiaspos;
          }
          function inxbuild() {
            var i,
              j,
              p,
              q,
              smallpos,
              smallval,
              previouscol = 0,
              startpos = 0;
            for (i = 0; i < netsize; i++) {
              p = network[i];
              smallpos = i;
              smallval = p[1];
              for (j = i + 1; j < netsize; j++) {
                q = network[j];
                if (q[1] < smallval) {
                  smallpos = j;
                  smallval = q[1];
                }
              }
              q = network[smallpos];
              if (i != smallpos) {
                j = q[0];
                q[0] = p[0];
                p[0] = j;
                j = q[1];
                q[1] = p[1];
                p[1] = j;
                j = q[2];
                q[2] = p[2];
                p[2] = j;
                j = q[3];
                q[3] = p[3];
                p[3] = j;
              }
              if (smallval != previouscol) {
                netindex[previouscol] = (startpos + i) >> 1;
                for (j = previouscol + 1; j < smallval; j++) netindex[j] = i;
                previouscol = smallval;
                startpos = i;
              }
            }
            netindex[previouscol] = (startpos + maxnetpos) >> 1;
            for (j = previouscol + 1; j < 256; j++) netindex[j] = maxnetpos;
          }
          function inxsearch(b, g, r) {
            var a, p, dist;
            var bestd = 1e3;
            var best = -1;
            var i = netindex[g];
            var j = i - 1;
            while (i < netsize || j >= 0) {
              if (i < netsize) {
                p = network[i];
                dist = p[1] - g;
                if (dist >= bestd) i = netsize;
                else {
                  i++;
                  if (dist < 0) dist = -dist;
                  a = p[0] - b;
                  if (a < 0) a = -a;
                  dist += a;
                  if (dist < bestd) {
                    a = p[2] - r;
                    if (a < 0) a = -a;
                    dist += a;
                    if (dist < bestd) {
                      bestd = dist;
                      best = p[3];
                    }
                  }
                }
              }
              if (j >= 0) {
                p = network[j];
                dist = g - p[1];
                if (dist >= bestd) j = -1;
                else {
                  j--;
                  if (dist < 0) dist = -dist;
                  a = p[0] - b;
                  if (a < 0) a = -a;
                  dist += a;
                  if (dist < bestd) {
                    a = p[2] - r;
                    if (a < 0) a = -a;
                    dist += a;
                    if (dist < bestd) {
                      bestd = dist;
                      best = p[3];
                    }
                  }
                }
              }
            }
            return best;
          }
          function learn() {
            var i;
            var lengthcount = pixels.length;
            var alphadec = 30 + (samplefac - 1) / 3;
            var samplepixels = lengthcount / (3 * samplefac);
            var delta = ~~(samplepixels / ncycles);
            var alpha = initalpha;
            var radius = initradius;
            var rad = radius >> radiusbiasshift;
            if (rad <= 1) rad = 0;
            for (i = 0; i < rad; i++)
              radpower[i] =
                alpha * (((rad * rad - i * i) * radbias) / (rad * rad));
            var step;
            if (lengthcount < minpicturebytes) {
              samplefac = 1;
              step = 3;
            } else if (lengthcount % prime1 !== 0) {
              step = 3 * prime1;
            } else if (lengthcount % prime2 !== 0) {
              step = 3 * prime2;
            } else if (lengthcount % prime3 !== 0) {
              step = 3 * prime3;
            } else {
              step = 3 * prime4;
            }
            var b, g, r, j;
            var pix = 0;
            i = 0;
            while (i < samplepixels) {
              b = (pixels[pix] & 255) << netbiasshift;
              g = (pixels[pix + 1] & 255) << netbiasshift;
              r = (pixels[pix + 2] & 255) << netbiasshift;
              j = contest(b, g, r);
              altersingle(alpha, j, b, g, r);
              if (rad !== 0) alterneigh(rad, j, b, g, r);
              pix += step;
              if (pix >= lengthcount) pix -= lengthcount;
              i++;
              if (delta === 0) delta = 1;
              if (i % delta === 0) {
                alpha -= alpha / alphadec;
                radius -= radius / radiusdec;
                rad = radius >> radiusbiasshift;
                if (rad <= 1) rad = 0;
                for (j = 0; j < rad; j++)
                  radpower[j] =
                    alpha * (((rad * rad - j * j) * radbias) / (rad * rad));
              }
            }
          }
          function buildColormap() {
            init();
            learn();
            unbiasnet();
            inxbuild();
          }
          this.buildColormap = buildColormap;
          function getColormap() {
            var map = [];
            var index = [];
            for (var i = 0; i < netsize; i++) index[network[i][3]] = i;
            var k = 0;
            for (var l = 0; l < netsize; l++) {
              var j = index[l];
              map[k++] = network[j][0];
              map[k++] = network[j][1];
              map[k++] = network[j][2];
            }
            return map;
          }
          this.getColormap = getColormap;
          this.lookupRGB = inxsearch;
        }
        module.exports = NeuQuant;
      },
      {},
    ],
    53: [
      function (require, module, exports) {
        (function (process) {
          module.exports = Duplex;
          var objectKeys =
            Object.keys ||
            function (obj) {
              var keys = [];
              for (var key in obj) keys.push(key);
              return keys;
            };
          var util = require("core-util-is");
          util.inherits = require("inherits");
          var Readable = require("./_stream_readable");
          var Writable = require("./_stream_writable");
          util.inherits(Duplex, Readable);
          forEach(objectKeys(Writable.prototype), function (method) {
            if (!Duplex.prototype[method])
              Duplex.prototype[method] = Writable.prototype[method];
          });
          function Duplex(options) {
            if (!(this instanceof Duplex)) return new Duplex(options);
            Readable.call(this, options);
            Writable.call(this, options);
            if (options && options.readable === false) this.readable = false;
            if (options && options.writable === false) this.writable = false;
            this.allowHalfOpen = true;
            if (options && options.allowHalfOpen === false)
              this.allowHalfOpen = false;
            this.once("end", onend);
          }
          function onend() {
            if (this.allowHalfOpen || this._writableState.ended) return;
            process.nextTick(this.end.bind(this));
          }
          function forEach(xs, f) {
            for (var i = 0, l = xs.length; i < l; i++) {
              f(xs[i], i);
            }
          }
        }.call(this, require("_process")));
      },
      {
        "./_stream_readable": 55,
        "./_stream_writable": 57,
        _process: 23,
        "core-util-is": 58,
        inherits: 59,
      },
    ],
    54: [
      function (require, module, exports) {
        arguments[4][26][0].apply(exports, arguments);
      },
      { "./_stream_transform": 56, "core-util-is": 58, dup: 26, inherits: 59 },
    ],
    55: [
      function (require, module, exports) {
        (function (process) {
          module.exports = Readable;
          var isArray = require("isarray");

          var Buffer = require("buffer").Buffer;
          Readable.ReadableState = ReadableState;
          var EE = require("events").EventEmitter;
          if (!EE.listenerCount)
            EE.listenerCount = function (emitter, type) {
              return emitter.listeners(type).length;
            };
          var Stream = require("stream");
          var util = require("core-util-is");
          util.inherits = require("inherits");
          var StringDecoder;
          var debug = require("util");
          if (debug && debug.debuglog) {
            debug = debug.debuglog("stream");
          } else {
            debug = function () {};
          }
          util.inherits(Readable, Stream);
          function ReadableState(options, stream) {
            var Duplex = require("./_stream_duplex");
            options = options || {};
            var hwm = options.highWaterMark;
            var defaultHwm = options.objectMode ? 16 : 16 * 1024;
            this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;
            this.highWaterMark = ~~this.highWaterMark;
            this.buffer = [];
            this.length = 0;
            this.pipes = null;
            this.pipesCount = 0;
            this.flowing = null;
            this.ended = false;
            this.endEmitted = false;
            this.reading = false;
            this.sync = true;
            this.needReadable = false;
            this.emittedReadable = false;
            this.readableListening = false;
            this.objectMode = !!options.objectMode;
            if (stream instanceof Duplex)
              this.objectMode = this.objectMode || !!options.readableObjectMode;
            this.defaultEncoding = options.defaultEncoding || "utf8";
            this.ranOut = false;
            this.awaitDrain = 0;
            this.readingMore = false;
            this.decoder = null;
            this.encoding = null;
            if (options.encoding) {
              if (!StringDecoder)
                StringDecoder = require("string_decoder/").StringDecoder;
              this.decoder = new StringDecoder(options.encoding);
              this.encoding = options.encoding;
            }
          }
          function Readable(options) {
            var Duplex = require("./_stream_duplex");
            if (!(this instanceof Readable)) return new Readable(options);
            this._readableState = new ReadableState(options, this);
            this.readable = true;
            Stream.call(this);
          }
          Readable.prototype.push = function (chunk, encoding) {
            var state = this._readableState;
            if (util.isString(chunk) && !state.objectMode) {
              encoding = encoding || state.defaultEncoding;
              if (encoding !== state.encoding) {
                chunk = new Buffer(chunk, encoding);
                encoding = "";
              }
            }
            return readableAddChunk(this, state, chunk, encoding, false);
          };
          Readable.prototype.unshift = function (chunk) {
            var state = this._readableState;
            return readableAddChunk(this, state, chunk, "", true);
          };
          function readableAddChunk(
            stream,
            state,
            chunk,
            encoding,
            addToFront
          ) {
            var er = chunkInvalid(state, chunk);
            if (er) {
              stream.emit("error", er);
            } else if (util.isNullOrUndefined(chunk)) {
              state.reading = false;
              if (!state.ended) onEofChunk(stream, state);
            } else if (state.objectMode || (chunk && chunk.length > 0)) {
              if (state.ended && !addToFront) {
                var e = new Error("stream.push() after EOF");
                stream.emit("error", e);
              } else if (state.endEmitted && addToFront) {
                var e = new Error("stream.unshift() after end event");
                stream.emit("error", e);
              } else {
                if (state.decoder && !addToFront && !encoding)
                  chunk = state.decoder.write(chunk);
                if (!addToFront) state.reading = false;
                if (state.flowing && state.length === 0 && !state.sync) {
                  stream.emit("data", chunk);
                  stream.read(0);
                } else {
                  state.length += state.objectMode ? 1 : chunk.length;
                  if (addToFront) state.buffer.unshift(chunk);
                  else state.buffer.push(chunk);
                  if (state.needReadable) emitReadable(stream);
                }
                maybeReadMore(stream, state);
              }
            } else if (!addToFront) {
              state.reading = false;
            }
            return needMoreData(state);
          }
          function needMoreData(state) {
            return (
              !state.ended &&
              (state.needReadable ||
                state.length < state.highWaterMark ||
                state.length === 0)
            );
          }
          Readable.prototype.setEncoding = function (enc) {
            if (!StringDecoder)
              StringDecoder = require("string_decoder/").StringDecoder;
            this._readableState.decoder = new StringDecoder(enc);
            this._readableState.encoding = enc;
            return this;
          };
          var MAX_HWM = 8388608;
          function roundUpToNextPowerOf2(n) {
            if (n >= MAX_HWM) {
              n = MAX_HWM;
            } else {
              n--;
              for (var p = 1; p < 32; p <<= 1) n |= n >> p;
              n++;
            }
            return n;
          }
          function howMuchToRead(n, state) {
            if (state.length === 0 && state.ended) return 0;
            if (state.objectMode) return n === 0 ? 0 : 1;
            if (isNaN(n) || util.isNull(n)) {
              if (state.flowing && state.buffer.length)
                return state.buffer[0].length;
              else return state.length;
            }
            if (n <= 0) return 0;
            if (n > state.highWaterMark)
              state.highWaterMark = roundUpToNextPowerOf2(n);
            if (n > state.length) {
              if (!state.ended) {
                state.needReadable = true;
                return 0;
              } else return state.length;
            }
            return n;
          }
          Readable.prototype.read = function (n) {
            debug("read", n);
            var state = this._readableState;
            var nOrig = n;
            if (!util.isNumber(n) || n > 0) state.emittedReadable = false;
            if (
              n === 0 &&
              state.needReadable &&
              (state.length >= state.highWaterMark || state.ended)
            ) {
              debug("read: emitReadable", state.length, state.ended);
              if (state.length === 0 && state.ended) endReadable(this);
              else emitReadable(this);
              return null;
            }
            n = howMuchToRead(n, state);
            if (n === 0 && state.ended) {
              if (state.length === 0) endReadable(this);
              return null;
            }
            var doRead = state.needReadable;
            debug("need readable", doRead);
            if (state.length === 0 || state.length - n < state.highWaterMark) {
              doRead = true;
              debug("length less than watermark", doRead);
            }
            if (state.ended || state.reading) {
              doRead = false;
              debug("reading or ended", doRead);
            }
            if (doRead) {
              debug("do read");
              state.reading = true;
              state.sync = true;
              if (state.length === 0) state.needReadable = true;
              this._read(state.highWaterMark);
              state.sync = false;
            }
            if (doRead && !state.reading) n = howMuchToRead(nOrig, state);
            var ret;
            if (n > 0) ret = fromList(n, state);
            else ret = null;
            if (util.isNull(ret)) {
              state.needReadable = true;
              n = 0;
            }
            state.length -= n;
            if (state.length === 0 && !state.ended) state.needReadable = true;
            if (nOrig !== n && state.ended && state.length === 0)
              endReadable(this);
            if (!util.isNull(ret)) this.emit("data", ret);
            return ret;
          };
          function chunkInvalid(state, chunk) {
            var er = null;
            if (
              !util.isBuffer(chunk) &&
              !util.isString(chunk) &&
              !util.isNullOrUndefined(chunk) &&
              !state.objectMode
            ) {
              er = new TypeError("Invalid non-string/buffer chunk");
            }
            return er;
          }
          function onEofChunk(stream, state) {
            if (state.decoder && !state.ended) {
              var chunk = state.decoder.end();
              if (chunk && chunk.length) {
                state.buffer.push(chunk);
                state.length += state.objectMode ? 1 : chunk.length;
              }
            }
            state.ended = true;
            emitReadable(stream);
          }
          function emitReadable(stream) {
            var state = stream._readableState;
            state.needReadable = false;
            if (!state.emittedReadable) {
              debug("emitReadable", state.flowing);
              state.emittedReadable = true;
              if (state.sync)
                process.nextTick(function () {
                  emitReadable_(stream);
                });
              else emitReadable_(stream);
            }
          }
          function emitReadable_(stream) {
            debug("emit readable");
            stream.emit("readable");
            flow(stream);
          }
          function maybeReadMore(stream, state) {
            if (!state.readingMore) {
              state.readingMore = true;
              process.nextTick(function () {
                maybeReadMore_(stream, state);
              });
            }
          }
          function maybeReadMore_(stream, state) {
            var len = state.length;
            while (
              !state.reading &&
              !state.flowing &&
              !state.ended &&
              state.length < state.highWaterMark
            ) {
              debug("maybeReadMore read 0");
              stream.read(0);
              if (len === state.length) break;
              else len = state.length;
            }
            state.readingMore = false;
          }
          Readable.prototype._read = function (n) {
            this.emit("error", new Error("not implemented"));
          };
          Readable.prototype.pipe = function (dest, pipeOpts) {
            var src = this;
            var state = this._readableState;
            switch (state.pipesCount) {
              case 0:
                state.pipes = dest;
                break;
              case 1:
                state.pipes = [state.pipes, dest];
                break;
              default:
                state.pipes.push(dest);
                break;
            }
            state.pipesCount += 1;
            debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
            var doEnd =
              (!pipeOpts || pipeOpts.end !== false) &&
              dest !== process.stdout &&
              dest !== process.stderr;
            var endFn = doEnd ? onend : cleanup;
            if (state.endEmitted) process.nextTick(endFn);
            else src.once("end", endFn);
            dest.on("unpipe", onunpipe);
            function onunpipe(readable) {
              debug("onunpipe");
              if (readable === src) {
                cleanup();
              }
            }
            function onend() {
              debug("onend");
              dest.end();
            }
            var ondrain = pipeOnDrain(src);
            dest.on("drain", ondrain);
            function cleanup() {
              debug("cleanup");
              dest.removeListener("close", onclose);
              dest.removeListener("finish", onfinish);
              dest.removeListener("drain", ondrain);
              dest.removeListener("error", onerror);
              dest.removeListener("unpipe", onunpipe);
              src.removeListener("end", onend);
              src.removeListener("end", cleanup);
              src.removeListener("data", ondata);
              if (
                state.awaitDrain &&
                (!dest._writableState || dest._writableState.needDrain)
              )
                ondrain();
            }
            src.on("data", ondata);
            function ondata(chunk) {
              debug("ondata");
              var ret = dest.write(chunk);
              if (false === ret) {
                debug(
                  "false write response, pause",
                  src._readableState.awaitDrain
                );
                src._readableState.awaitDrain++;
                src.pause();
              }
            }
            function onerror(er) {
              debug("onerror", er);
              unpipe();
              dest.removeListener("error", onerror);
              if (EE.listenerCount(dest, "error") === 0) dest.emit("error", er);
            }
            if (!dest._events || !dest._events.error) dest.on("error", onerror);
            else if (isArray(dest._events.error))
              dest._events.error.unshift(onerror);
            else dest._events.error = [onerror, dest._events.error];
            function onclose() {
              dest.removeListener("finish", onfinish);
              unpipe();
            }
            dest.once("close", onclose);
            function onfinish() {
              debug("onfinish");
              dest.removeListener("close", onclose);
              unpipe();
            }
            dest.once("finish", onfinish);
            function unpipe() {
              debug("unpipe");
              src.unpipe(dest);
            }
            dest.emit("pipe", src);
            if (!state.flowing) {
              debug("pipe resume");
              src.resume();
            }
            return dest;
          };
          function pipeOnDrain(src) {
            return function () {
              var state = src._readableState;
              debug("pipeOnDrain", state.awaitDrain);
              if (state.awaitDrain) state.awaitDrain--;
              if (state.awaitDrain === 0 && EE.listenerCount(src, "data")) {
                state.flowing = true;
                flow(src);
              }
            };
          }
          Readable.prototype.unpipe = function (dest) {
            var state = this._readableState;
            if (state.pipesCount === 0) return this;
            if (state.pipesCount === 1) {
              if (dest && dest !== state.pipes) return this;
              if (!dest) dest = state.pipes;
              state.pipes = null;
              state.pipesCount = 0;
              state.flowing = false;
              if (dest) dest.emit("unpipe", this);
              return this;
            }
            if (!dest) {
              var dests = state.pipes;
              var len = state.pipesCount;
              state.pipes = null;
              state.pipesCount = 0;
              state.flowing = false;
              for (var i = 0; i < len; i++) dests[i].emit("unpipe", this);
              return this;
            }
            var i = indexOf(state.pipes, dest);
            if (i === -1) return this;
            state.pipes.splice(i, 1);
            state.pipesCount -= 1;
            if (state.pipesCount === 1) state.pipes = state.pipes[0];
            dest.emit("unpipe", this);
            return this;
          };
          Readable.prototype.on = function (ev, fn) {
            var res = Stream.prototype.on.call(this, ev, fn);
            if (ev === "data" && false !== this._readableState.flowing) {
              this.resume();
            }
            if (ev === "readable" && this.readable) {
              var state = this._readableState;
              if (!state.readableListening) {
                state.readableListening = true;
                state.emittedReadable = false;
                state.needReadable = true;
                if (!state.reading) {
                  var self = this;
                  process.nextTick(function () {
                    debug("readable nexttick read 0");
                    self.read(0);
                  });
                } else if (state.length) {
                  emitReadable(this, state);
                }
              }
            }
            return res;
          };
          Readable.prototype.addListener = Readable.prototype.on;
          Readable.prototype.resume = function () {
            var state = this._readableState;
            if (!state.flowing) {
              debug("resume");
              state.flowing = true;
              if (!state.reading) {
                debug("resume read 0");
                this.read(0);
              }
              resume(this, state);
            }
            return this;
          };
          function resume(stream, state) {
            if (!state.resumeScheduled) {
              state.resumeScheduled = true;
              process.nextTick(function () {
                resume_(stream, state);
              });
            }
          }
          function resume_(stream, state) {
            state.resumeScheduled = false;
            stream.emit("resume");
            flow(stream);
            if (state.flowing && !state.reading) stream.read(0);
          }
          Readable.prototype.pause = function () {
            debug("call pause flowing=%j", this._readableState.flowing);
            if (false !== this._readableState.flowing) {
              debug("pause");
              this._readableState.flowing = false;
              this.emit("pause");
            }
            return this;
          };
          function flow(stream) {
            var state = stream._readableState;
            debug("flow", state.flowing);
            if (state.flowing) {
              do {
                var chunk = stream.read();
              } while (null !== chunk && state.flowing);
            }
          }
          Readable.prototype.wrap = function (stream) {
            var state = this._readableState;
            var paused = false;
            var self = this;
            stream.on("end", function () {
              debug("wrapped end");
              if (state.decoder && !state.ended) {
                var chunk = state.decoder.end();
                if (chunk && chunk.length) self.push(chunk);
              }
              self.push(null);
            });
            stream.on("data", function (chunk) {
              debug("wrapped data");
              if (state.decoder) chunk = state.decoder.write(chunk);
              if (!chunk || (!state.objectMode && !chunk.length)) return;
              var ret = self.push(chunk);
              if (!ret) {
                paused = true;
                stream.pause();
              }
            });
            for (var i in stream) {
              if (util.isFunction(stream[i]) && util.isUndefined(this[i])) {
                this[i] = (function (method) {
                  return function () {
                    return stream[method].apply(stream, arguments);
                  };
                })(i);
              }
            }
            var events = ["error", "close", "destroy", "pause", "resume"];
            forEach(events, function (ev) {
              stream.on(ev, self.emit.bind(self, ev));
            });
            self._read = function (n) {
              debug("wrapped _read", n);
              if (paused) {
                paused = false;
                stream.resume();
              }
            };
            return self;
          };
          Readable._fromList = fromList;
          function fromList(n, state) {
            var list = state.buffer;
            var length = state.length;
            var stringMode = !!state.decoder;
            var objectMode = !!state.objectMode;
            var ret;
            if (list.length === 0) return null;
            if (length === 0) ret = null;
            else if (objectMode) ret = list.shift();
            else if (!n || n >= length) {
              if (stringMode) ret = list.join("");
              else ret = Buffer.concat(list, length);
              list.length = 0;
            } else {
              if (n < list[0].length) {
                var buf = list[0];
                ret = buf.slice(0, n);
                list[0] = buf.slice(n);
              } else if (n === list[0].length) {
                ret = list.shift();
              } else {
                if (stringMode) ret = "";
                else ret = new Buffer(n);
                var c = 0;
                for (var i = 0, l = list.length; i < l && c < n; i++) {
                  var buf = list[0];
                  var cpy = Math.min(n - c, buf.length);
                  if (stringMode) ret += buf.slice(0, cpy);
                  else buf.copy(ret, c, 0, cpy);
                  if (cpy < buf.length) list[0] = buf.slice(cpy);
                  else list.shift();
                  c += cpy;
                }
              }
            }
            return ret;
          }
          function endReadable(stream) {
            var state = stream._readableState;
            if (state.length > 0)
              throw new Error("endReadable called on non-empty stream");
            if (!state.endEmitted) {
              state.ended = true;
              process.nextTick(function () {
                if (!state.endEmitted && state.length === 0) {
                  state.endEmitted = true;
                  stream.readable = false;
                  stream.emit("end");
                }
              });
            }
          }
          function forEach(xs, f) {
            for (var i = 0, l = xs.length; i < l; i++) {
              f(xs[i], i);
            }
          }
          function indexOf(xs, x) {
            for (var i = 0, l = xs.length; i < l; i++) {
              if (xs[i] === x) return i;
            }
            return -1;
          }
        }.call(this, require("_process")));
      },
      {
        "./_stream_duplex": 53,
        _process: 23,
        buffer: 16,
        "core-util-is": 58,
        events: 20,
        inherits: 59,
        isarray: 60,
        stream: 35,
        "string_decoder/": 61,
        util: 2,
      },
    ],
    56: [
      function (require, module, exports) {
        module.exports = Transform;
        var Duplex = require("./_stream_duplex");
        var util = require("core-util-is");
        util.inherits = require("inherits");
        util.inherits(Transform, Duplex);
        function TransformState(options, stream) {
          this.afterTransform = function (er, data) {
            return afterTransform(stream, er, data);
          };
          this.needTransform = false;
          this.transforming = false;
          this.writecb = null;
          this.writechunk = null;
        }
        function afterTransform(stream, er, data) {
          var ts = stream._transformState;
          ts.transforming = false;
          var cb = ts.writecb;
          if (!cb)
            return stream.emit(
              "error",
              new Error("no writecb in Transform class")
            );
          ts.writechunk = null;
          ts.writecb = null;
          if (!util.isNullOrUndefined(data)) stream.push(data);
          if (cb) cb(er);
          var rs = stream._readableState;
          rs.reading = false;
          if (rs.needReadable || rs.length < rs.highWaterMark) {
            stream._read(rs.highWaterMark);
          }
        }
        function Transform(options) {
          if (!(this instanceof Transform)) return new Transform(options);
          Duplex.call(this, options);
          this._transformState = new TransformState(options, this);
          var stream = this;
          this._readableState.needReadable = true;
          this._readableState.sync = false;
          this.once("prefinish", function () {
            if (util.isFunction(this._flush))
              this._flush(function (er) {
                done(stream, er);
              });
            else done(stream);
          });
        }
        Transform.prototype.push = function (chunk, encoding) {
          this._transformState.needTransform = false;
          return Duplex.prototype.push.call(this, chunk, encoding);
        };
        Transform.prototype._transform = function (chunk, encoding, cb) {
          throw new Error("not implemented");
        };
        Transform.prototype._write = function (chunk, encoding, cb) {
          var ts = this._transformState;
          ts.writecb = cb;
          ts.writechunk = chunk;
          ts.writeencoding = encoding;
          if (!ts.transforming) {
            var rs = this._readableState;
            if (
              ts.needTransform ||
              rs.needReadable ||
              rs.length < rs.highWaterMark
            )
              this._read(rs.highWaterMark);
          }
        };
        Transform.prototype._read = function (n) {
          var ts = this._transformState;
          if (!util.isNull(ts.writechunk) && ts.writecb && !ts.transforming) {
            ts.transforming = true;
            this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
          } else {
            ts.needTransform = true;
          }
        };
        function done(stream, er) {
          if (er) return stream.emit("error", er);
          var ws = stream._writableState;
          var ts = stream._transformState;
          if (ws.length)
            throw new Error("calling transform done when ws.length != 0");
          if (ts.transforming)
            throw new Error("calling transform done when still transforming");
          return stream.push(null);
        }
      },
      { "./_stream_duplex": 53, "core-util-is": 58, inherits: 59 },
    ],
    57: [
      function (require, module, exports) {
        (function (process) {
          module.exports = Writable;
          var Buffer = require("buffer").Buffer;
          Writable.WritableState = WritableState;
          var util = require("core-util-is");
          util.inherits = require("inherits");
          var Stream = require("stream");
          util.inherits(Writable, Stream);
          function WriteReq(chunk, encoding, cb) {
            this.chunk = chunk;
            this.encoding = encoding;
            this.callback = cb;
          }
          function WritableState(options, stream) {
            var Duplex = require("./_stream_duplex");
            options = options || {};
            var hwm = options.highWaterMark;
            var defaultHwm = options.objectMode ? 16 : 16 * 1024;
            this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;
            this.objectMode = !!options.objectMode;
            if (stream instanceof Duplex)
              this.objectMode = this.objectMode || !!options.writableObjectMode;
            this.highWaterMark = ~~this.highWaterMark;
            this.needDrain = false;
            this.ending = false;
            this.ended = false;
            this.finished = false;
            var noDecode = options.decodeStrings === false;
            this.decodeStrings = !noDecode;
            this.defaultEncoding = options.defaultEncoding || "utf8";
            this.length = 0;
            this.writing = false;
            this.corked = 0;
            this.sync = true;
            this.bufferProcessing = false;
            this.onwrite = function (er) {
              onwrite(stream, er);
            };
            this.writecb = null;
            this.writelen = 0;
            this.buffer = [];
            this.pendingcb = 0;
            this.prefinished = false;
            this.errorEmitted = false;
          }
          function Writable(options) {
            var Duplex = require("./_stream_duplex");
            if (!(this instanceof Writable) && !(this instanceof Duplex))
              return new Writable(options);
            this._writableState = new WritableState(options, this);
            this.writable = true;
            Stream.call(this);
          }
          Writable.prototype.pipe = function () {
            this.emit("error", new Error("Cannot pipe. Not readable."));
          };
          function writeAfterEnd(stream, state, cb) {
            var er = new Error("write after end");
            stream.emit("error", er);
            process.nextTick(function () {
              cb(er);
            });
          }
          function validChunk(stream, state, chunk, cb) {
            var valid = true;
            if (
              !util.isBuffer(chunk) &&
              !util.isString(chunk) &&
              !util.isNullOrUndefined(chunk) &&
              !state.objectMode
            ) {
              var er = new TypeError("Invalid non-string/buffer chunk");
              stream.emit("error", er);
              process.nextTick(function () {
                cb(er);
              });
              valid = false;
            }
            return valid;
          }
          Writable.prototype.write = function (chunk, encoding, cb) {
            var state = this._writableState;
            var ret = false;
            if (util.isFunction(encoding)) {
              cb = encoding;
              encoding = null;
            }
            if (util.isBuffer(chunk)) encoding = "buffer";
            else if (!encoding) encoding = state.defaultEncoding;
            if (!util.isFunction(cb)) cb = function () {};
            if (state.ended) writeAfterEnd(this, state, cb);
            else if (validChunk(this, state, chunk, cb)) {
              state.pendingcb++;
              ret = writeOrBuffer(this, state, chunk, encoding, cb);
            }
            return ret;
          };
          Writable.prototype.cork = function () {
            var state = this._writableState;
            state.corked++;
          };
          Writable.prototype.uncork = function () {
            var state = this._writableState;
            if (state.corked) {
              state.corked--;
              if (
                !state.writing &&
                !state.corked &&
                !state.finished &&
                !state.bufferProcessing &&
                state.buffer.length
              )
                clearBuffer(this, state);
            }
          };
          function decodeChunk(state, chunk, encoding) {
            if (
              !state.objectMode &&
              state.decodeStrings !== false &&
              util.isString(chunk)
            ) {
              chunk = new Buffer(chunk, encoding);
            }
            return chunk;
          }
          function writeOrBuffer(stream, state, chunk, encoding, cb) {
            chunk = decodeChunk(state, chunk, encoding);
            if (util.isBuffer(chunk)) encoding = "buffer";
            var len = state.objectMode ? 1 : chunk.length;
            state.length += len;
            var ret = state.length < state.highWaterMark;
            if (!ret) state.needDrain = true;
            if (state.writing || state.corked)
              state.buffer.push(new WriteReq(chunk, encoding, cb));
            else doWrite(stream, state, false, len, chunk, encoding, cb);
            return ret;
          }
          function doWrite(stream, state, writev, len, chunk, encoding, cb) {
            state.writelen = len;
            state.writecb = cb;
            state.writing = true;
            state.sync = true;
            if (writev) stream._writev(chunk, state.onwrite);
            else stream._write(chunk, encoding, state.onwrite);
            state.sync = false;
          }
          function onwriteError(stream, state, sync, er, cb) {
            if (sync)
              process.nextTick(function () {
                state.pendingcb--;
                cb(er);
              });
            else {
              state.pendingcb--;
              cb(er);
            }
            stream._writableState.errorEmitted = true;
            stream.emit("error", er);
          }
          function onwriteStateUpdate(state) {
            state.writing = false;
            state.writecb = null;
            state.length -= state.writelen;
            state.writelen = 0;
          }
          function onwrite(stream, er) {
            var state = stream._writableState;
            var sync = state.sync;
            var cb = state.writecb;
            onwriteStateUpdate(state);
            if (er) onwriteError(stream, state, sync, er, cb);
            else {
              var finished = needFinish(stream, state);
              if (
                !finished &&
                !state.corked &&
                !state.bufferProcessing &&
                state.buffer.length
              ) {
                clearBuffer(stream, state);
              }
              if (sync) {
                process.nextTick(function () {
                  afterWrite(stream, state, finished, cb);
                });
              } else {
                afterWrite(stream, state, finished, cb);
              }
            }
          }
          function afterWrite(stream, state, finished, cb) {
            if (!finished) onwriteDrain(stream, state);
            state.pendingcb--;
            cb();
            finishMaybe(stream, state);
          }
          function onwriteDrain(stream, state) {
            if (state.length === 0 && state.needDrain) {
              state.needDrain = false;
              stream.emit("drain");
            }
          }
          function clearBuffer(stream, state) {
            state.bufferProcessing = true;
            if (stream._writev && state.buffer.length > 1) {
              var cbs = [];
              for (var c = 0; c < state.buffer.length; c++)
                cbs.push(state.buffer[c].callback);
              state.pendingcb++;
              doWrite(
                stream,
                state,
                true,
                state.length,
                state.buffer,
                "",
                function (err) {
                  for (var i = 0; i < cbs.length; i++) {
                    state.pendingcb--;
                    cbs[i](err);
                  }
                }
              );
              state.buffer = [];
            } else {
              for (var c = 0; c < state.buffer.length; c++) {
                var entry = state.buffer[c];
                var chunk = entry.chunk;
                var encoding = entry.encoding;
                var cb = entry.callback;
                var len = state.objectMode ? 1 : chunk.length;
                doWrite(stream, state, false, len, chunk, encoding, cb);
                if (state.writing) {
                  c++;
                  break;
                }
              }
              if (c < state.buffer.length) state.buffer = state.buffer.slice(c);
              else state.buffer.length = 0;
            }
            state.bufferProcessing = false;
          }
          Writable.prototype._write = function (chunk, encoding, cb) {
            cb(new Error("not implemented"));
          };
          Writable.prototype._writev = null;
          Writable.prototype.end = function (chunk, encoding, cb) {
            var state = this._writableState;
            if (util.isFunction(chunk)) {
              cb = chunk;
              chunk = null;
              encoding = null;
            } else if (util.isFunction(encoding)) {
              cb = encoding;
              encoding = null;
            }
            if (!util.isNullOrUndefined(chunk)) this.write(chunk, encoding);
            if (state.corked) {
              state.corked = 1;
              this.uncork();
            }
            if (!state.ending && !state.finished) endWritable(this, state, cb);
          };
          function needFinish(stream, state) {
            return (
              state.ending &&
              state.length === 0 &&
              !state.finished &&
              !state.writing
            );
          }
          function prefinish(stream, state) {
            if (!state.prefinished) {
              state.prefinished = true;
              stream.emit("prefinish");
            }
          }
          function finishMaybe(stream, state) {
            var need = needFinish(stream, state);
            if (need) {
              if (state.pendingcb === 0) {
                prefinish(stream, state);
                state.finished = true;
                stream.emit("finish");
              } else prefinish(stream, state);
            }
            return need;
          }
          function endWritable(stream, state, cb) {
            state.ending = true;
            finishMaybe(stream, state);
            if (cb) {
              if (state.finished) process.nextTick(cb);
              else stream.once("finish", cb);
            }
            state.ended = true;
          }
        }.call(this, require("_process")));
      },
      {
        "./_stream_duplex": 53,
        _process: 23,
        buffer: 16,
        "core-util-is": 58,
        inherits: 59,
        stream: 35,
      },
    ],
    58: [
      function (require, module, exports) {
        (function (Buffer) {
          function isArray(ar) {
            return Array.isArray(ar);
          }
          exports.isArray = isArray;
          function isBoolean(arg) {
            return typeof arg === "boolean";
          }
          exports.isBoolean = isBoolean;
          function isNull(arg) {
            return arg === null;
          }
          exports.isNull = isNull;
          function isNullOrUndefined(arg) {
            return arg == null;
          }
          exports.isNullOrUndefined = isNullOrUndefined;
          function isNumber(arg) {
            return typeof arg === "number";
          }
          exports.isNumber = isNumber;
          function isString(arg) {
            return typeof arg === "string";
          }
          exports.isString = isString;
          function isSymbol(arg) {
            return typeof arg === "symbol";
          }
          exports.isSymbol = isSymbol;
          function isUndefined(arg) {
            return arg === void 0;
          }
          exports.isUndefined = isUndefined;
          function isRegExp(re) {
            return isObject(re) && objectToString(re) === "[object RegExp]";
          }
          exports.isRegExp = isRegExp;
          function isObject(arg) {
            return typeof arg === "object" && arg !== null;
          }
          exports.isObject = isObject;
          function isDate(d) {
            return isObject(d) && objectToString(d) === "[object Date]";
          }
          exports.isDate = isDate;
          function isError(e) {
            return (
              isObject(e) &&
              (objectToString(e) === "[object Error]" || e instanceof Error)
            );
          }
          exports.isError = isError;
          function isFunction(arg) {
            return typeof arg === "function";
          }
          exports.isFunction = isFunction;
          function isPrimitive(arg) {
            return (
              arg === null ||
              typeof arg === "boolean" ||
              typeof arg === "number" ||
              typeof arg === "string" ||
              typeof arg === "symbol" ||
              typeof arg === "undefined"
            );
          }
          exports.isPrimitive = isPrimitive;
          function isBuffer(arg) {
            return Buffer.isBuffer(arg);
          }
          exports.isBuffer = isBuffer;
          function objectToString(o) {
            return Object.prototype.toString.call(o);
          }
        }.call(this, require("buffer").Buffer));
      },
      { buffer: 16 },
    ],
    59: [
      function (require, module, exports) {
        arguments[4][21][0].apply(exports, arguments);
      },
      { dup: 21 },
    ],
    60: [
      function (require, module, exports) {
        arguments[4][22][0].apply(exports, arguments);
      },
      { dup: 22 },
    ],
    61: [
      function (require, module, exports) {
        arguments[4][36][0].apply(exports, arguments);
      },
      { buffer: 16, dup: 36 },
    ],
    62: [
      function (require, module, exports) {
        arguments[4][32][0].apply(exports, arguments);
      },
      {
        "./lib/_stream_duplex.js": 53,
        "./lib/_stream_passthrough.js": 54,
        "./lib/_stream_readable.js": 55,
        "./lib/_stream_transform.js": 56,
        "./lib/_stream_writable.js": 57,
        dup: 32,
        stream: 35,
      },
    ],
    63: [
      function (require, module, exports) {
        var encode = require("./lib/encoder"),
          decode = require("./lib/decoder");
        module.exports = { encode: encode, decode: decode };
      },
      { "./lib/decoder": 64, "./lib/encoder": 65 },
    ],
    64: [
      function (require, module, exports) {
        (function (Buffer) {
          var JpegImage = (function jpegImage() {
            "use strict";
            var dctZigZag = new Int32Array([
              0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19,
              26, 33, 40, 48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28, 35, 42, 49,
              56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51, 58, 59, 52,
              45, 38, 31, 39, 46, 53, 60, 61, 54, 47, 55, 62, 63,
            ]);
            var dctCos1 = 4017;
            var dctSin1 = 799;
            var dctCos3 = 3406;
            var dctSin3 = 2276;
            var dctCos6 = 1567;
            var dctSin6 = 3784;
            var dctSqrt2 = 5793;
            var dctSqrt1d2 = 2896;
            function constructor() {}
            function buildHuffmanTable(codeLengths, values) {
              var k = 0,
                code = [],
                i,
                j,
                length = 16;
              while (length > 0 && !codeLengths[length - 1]) length--;
              code.push({ children: [], index: 0 });
              var p = code[0],
                q;
              for (i = 0; i < length; i++) {
                for (j = 0; j < codeLengths[i]; j++) {
                  p = code.pop();
                  p.children[p.index] = values[k];
                  while (p.index > 0) {
                    p = code.pop();
                  }
                  p.index++;
                  code.push(p);
                  while (code.length <= i) {
                    code.push((q = { children: [], index: 0 }));
                    p.children[p.index] = q.children;
                    p = q;
                  }
                  k++;
                }
                if (i + 1 < length) {
                  code.push((q = { children: [], index: 0 }));
                  p.children[p.index] = q.children;
                  p = q;
                }
              }
              return code[0].children;
            }
            function decodeScan(
              data,
              offset,
              frame,
              components,
              resetInterval,
              spectralStart,
              spectralEnd,
              successivePrev,
              successive
            ) {
              var precision = frame.precision;
              var samplesPerLine = frame.samplesPerLine;
              var scanLines = frame.scanLines;
              var mcusPerLine = frame.mcusPerLine;
              var progressive = frame.progressive;
              var maxH = frame.maxH,
                maxV = frame.maxV;
              var startOffset = offset,
                bitsData = 0,
                bitsCount = 0;
              function readBit() {
                if (bitsCount > 0) {
                  bitsCount--;
                  return (bitsData >> bitsCount) & 1;
                }
                bitsData = data[offset++];
                if (bitsData == 255) {
                  var nextByte = data[offset++];
                  if (nextByte) {
                    throw (
                      "unexpected marker: " +
                      ((bitsData << 8) | nextByte).toString(16)
                    );
                  }
                }
                bitsCount = 7;
                return bitsData >>> 7;
              }
              function decodeHuffman(tree) {
                var node = tree,
                  bit;
                while ((bit = readBit()) !== null) {
                  node = node[bit];
                  if (typeof node === "number") return node;
                  if (typeof node !== "object")
                    throw "invalid huffman sequence";
                }
                return null;
              }
              function receive(length) {
                var n = 0;
                while (length > 0) {
                  var bit = readBit();
                  if (bit === null) return;
                  n = (n << 1) | bit;
                  length--;
                }
                return n;
              }
              function receiveAndExtend(length) {
                var n = receive(length);
                if (n >= 1 << (length - 1)) return n;
                return n + (-1 << length) + 1;
              }
              function decodeBaseline(component, zz) {
                var t = decodeHuffman(component.huffmanTableDC);
                var diff = t === 0 ? 0 : receiveAndExtend(t);
                zz[0] = component.pred += diff;
                var k = 1;
                while (k < 64) {
                  var rs = decodeHuffman(component.huffmanTableAC);
                  var s = rs & 15,
                    r = rs >> 4;
                  if (s === 0) {
                    if (r < 15) break;
                    k += 16;
                    continue;
                  }
                  k += r;
                  var z = dctZigZag[k];
                  zz[z] = receiveAndExtend(s);
                  k++;
                }
              }
              function decodeDCFirst(component, zz) {
                var t = decodeHuffman(component.huffmanTableDC);
                var diff = t === 0 ? 0 : receiveAndExtend(t) << successive;
                zz[0] = component.pred += diff;
              }
              function decodeDCSuccessive(component, zz) {
                zz[0] |= readBit() << successive;
              }
              var eobrun = 0;
              function decodeACFirst(component, zz) {
                if (eobrun > 0) {
                  eobrun--;
                  return;
                }
                var k = spectralStart,
                  e = spectralEnd;
                while (k <= e) {
                  var rs = decodeHuffman(component.huffmanTableAC);
                  var s = rs & 15,
                    r = rs >> 4;
                  if (s === 0) {
                    if (r < 15) {
                      eobrun = receive(r) + (1 << r) - 1;
                      break;
                    }
                    k += 16;
                    continue;
                  }
                  k += r;
                  var z = dctZigZag[k];
                  zz[z] = receiveAndExtend(s) * (1 << successive);
                  k++;
                }
              }
              var successiveACState = 0,
                successiveACNextValue;
              function decodeACSuccessive(component, zz) {
                var k = spectralStart,
                  e = spectralEnd,
                  r = 0;
                while (k <= e) {
                  var z = dctZigZag[k];
                  switch (successiveACState) {
                    case 0:
                      var rs = decodeHuffman(component.huffmanTableAC);
                      var s = rs & 15,
                        r = rs >> 4;
                      if (s === 0) {
                        if (r < 15) {
                          eobrun = receive(r) + (1 << r);
                          successiveACState = 4;
                        } else {
                          r = 16;
                          successiveACState = 1;
                        }
                      } else {
                        if (s !== 1) throw "invalid ACn encoding";
                        successiveACNextValue = receiveAndExtend(s);
                        successiveACState = r ? 2 : 3;
                      }
                      continue;
                    case 1:
                    case 2:
                      if (zz[z]) zz[z] += readBit() << successive;
                      else {
                        r--;
                        if (r === 0)
                          successiveACState = successiveACState == 2 ? 3 : 0;
                      }
                      break;
                    case 3:
                      if (zz[z]) zz[z] += readBit() << successive;
                      else {
                        zz[z] = successiveACNextValue << successive;
                        successiveACState = 0;
                      }
                      break;
                    case 4:
                      if (zz[z]) zz[z] += readBit() << successive;
                      break;
                  }
                  k++;
                }
                if (successiveACState === 4) {
                  eobrun--;
                  if (eobrun === 0) successiveACState = 0;
                }
              }
              function decodeMcu(component, decode, mcu, row, col) {
                var mcuRow = (mcu / mcusPerLine) | 0;
                var mcuCol = mcu % mcusPerLine;
                var blockRow = mcuRow * component.v + row;
                var blockCol = mcuCol * component.h + col;
                decode(component, component.blocks[blockRow][blockCol]);
              }
              function decodeBlock(component, decode, mcu) {
                var blockRow = (mcu / component.blocksPerLine) | 0;
                var blockCol = mcu % component.blocksPerLine;
                decode(component, component.blocks[blockRow][blockCol]);
              }
              var componentsLength = components.length;
              var component, i, j, k, n;
              var decodeFn;
              if (progressive) {
                if (spectralStart === 0)
                  decodeFn =
                    successivePrev === 0 ? decodeDCFirst : decodeDCSuccessive;
                else
                  decodeFn =
                    successivePrev === 0 ? decodeACFirst : decodeACSuccessive;
              } else {
                decodeFn = decodeBaseline;
              }
              var mcu = 0,
                marker;
              var mcuExpected;
              if (componentsLength == 1) {
                mcuExpected =
                  components[0].blocksPerLine * components[0].blocksPerColumn;
              } else {
                mcuExpected = mcusPerLine * frame.mcusPerColumn;
              }
              if (!resetInterval) resetInterval = mcuExpected;
              var h, v;
              while (mcu < mcuExpected) {
                for (i = 0; i < componentsLength; i++) components[i].pred = 0;
                eobrun = 0;
                if (componentsLength == 1) {
                  component = components[0];
                  for (n = 0; n < resetInterval; n++) {
                    decodeBlock(component, decodeFn, mcu);
                    mcu++;
                  }
                } else {
                  for (n = 0; n < resetInterval; n++) {
                    for (i = 0; i < componentsLength; i++) {
                      component = components[i];
                      h = component.h;
                      v = component.v;
                      for (j = 0; j < v; j++) {
                        for (k = 0; k < h; k++) {
                          decodeMcu(component, decodeFn, mcu, j, k);
                        }
                      }
                    }
                    mcu++;
                    if (mcu === mcuExpected) break;
                  }
                }
                bitsCount = 0;
                marker = (data[offset] << 8) | data[offset + 1];
                if (marker < 65280) {
                  throw "marker was not found";
                }
                if (marker >= 65488 && marker <= 65495) {
                  offset += 2;
                } else break;
              }
              return offset - startOffset;
            }
            function buildComponentData(frame, component) {
              var lines = [];
              var blocksPerLine = component.blocksPerLine;
              var blocksPerColumn = component.blocksPerColumn;
              var samplesPerLine = blocksPerLine << 3;
              var R = new Int32Array(64),
                r = new Uint8Array(64);
              function quantizeAndInverse(zz, dataOut, dataIn) {
                var qt = component.quantizationTable;
                var v0, v1, v2, v3, v4, v5, v6, v7, t;
                var p = dataIn;
                var i;
                for (i = 0; i < 64; i++) p[i] = zz[i] * qt[i];
                for (i = 0; i < 8; ++i) {
                  var row = 8 * i;
                  if (
                    p[1 + row] == 0 &&
                    p[2 + row] == 0 &&
                    p[3 + row] == 0 &&
                    p[4 + row] == 0 &&
                    p[5 + row] == 0 &&
                    p[6 + row] == 0 &&
                    p[7 + row] == 0
                  ) {
                    t = (dctSqrt2 * p[0 + row] + 512) >> 10;
                    p[0 + row] = t;
                    p[1 + row] = t;
                    p[2 + row] = t;
                    p[3 + row] = t;
                    p[4 + row] = t;
                    p[5 + row] = t;
                    p[6 + row] = t;
                    p[7 + row] = t;
                    continue;
                  }
                  v0 = (dctSqrt2 * p[0 + row] + 128) >> 8;
                  v1 = (dctSqrt2 * p[4 + row] + 128) >> 8;
                  v2 = p[2 + row];
                  v3 = p[6 + row];
                  v4 = (dctSqrt1d2 * (p[1 + row] - p[7 + row]) + 128) >> 8;
                  v7 = (dctSqrt1d2 * (p[1 + row] + p[7 + row]) + 128) >> 8;
                  v5 = p[3 + row] << 4;
                  v6 = p[5 + row] << 4;
                  t = (v0 - v1 + 1) >> 1;
                  v0 = (v0 + v1 + 1) >> 1;
                  v1 = t;
                  t = (v2 * dctSin6 + v3 * dctCos6 + 128) >> 8;
                  v2 = (v2 * dctCos6 - v3 * dctSin6 + 128) >> 8;
                  v3 = t;
                  t = (v4 - v6 + 1) >> 1;
                  v4 = (v4 + v6 + 1) >> 1;
                  v6 = t;
                  t = (v7 + v5 + 1) >> 1;
                  v5 = (v7 - v5 + 1) >> 1;
                  v7 = t;
                  t = (v0 - v3 + 1) >> 1;
                  v0 = (v0 + v3 + 1) >> 1;
                  v3 = t;
                  t = (v1 - v2 + 1) >> 1;
                  v1 = (v1 + v2 + 1) >> 1;
                  v2 = t;
                  t = (v4 * dctSin3 + v7 * dctCos3 + 2048) >> 12;
                  v4 = (v4 * dctCos3 - v7 * dctSin3 + 2048) >> 12;
                  v7 = t;
                  t = (v5 * dctSin1 + v6 * dctCos1 + 2048) >> 12;
                  v5 = (v5 * dctCos1 - v6 * dctSin1 + 2048) >> 12;
                  v6 = t;
                  p[0 + row] = v0 + v7;
                  p[7 + row] = v0 - v7;
                  p[1 + row] = v1 + v6;
                  p[6 + row] = v1 - v6;
                  p[2 + row] = v2 + v5;
                  p[5 + row] = v2 - v5;
                  p[3 + row] = v3 + v4;
                  p[4 + row] = v3 - v4;
                }
                for (i = 0; i < 8; ++i) {
                  var col = i;
                  if (
                    p[1 * 8 + col] == 0 &&
                    p[2 * 8 + col] == 0 &&
                    p[3 * 8 + col] == 0 &&
                    p[4 * 8 + col] == 0 &&
                    p[5 * 8 + col] == 0 &&
                    p[6 * 8 + col] == 0 &&
                    p[7 * 8 + col] == 0
                  ) {
                    t = (dctSqrt2 * dataIn[i + 0] + 8192) >> 14;
                    p[0 * 8 + col] = t;
                    p[1 * 8 + col] = t;
                    p[2 * 8 + col] = t;
                    p[3 * 8 + col] = t;
                    p[4 * 8 + col] = t;
                    p[5 * 8 + col] = t;
                    p[6 * 8 + col] = t;
                    p[7 * 8 + col] = t;
                    continue;
                  }
                  v0 = (dctSqrt2 * p[0 * 8 + col] + 2048) >> 12;
                  v1 = (dctSqrt2 * p[4 * 8 + col] + 2048) >> 12;
                  v2 = p[2 * 8 + col];
                  v3 = p[6 * 8 + col];
                  v4 =
                    (dctSqrt1d2 * (p[1 * 8 + col] - p[7 * 8 + col]) + 2048) >>
                    12;
                  v7 =
                    (dctSqrt1d2 * (p[1 * 8 + col] + p[7 * 8 + col]) + 2048) >>
                    12;
                  v5 = p[3 * 8 + col];
                  v6 = p[5 * 8 + col];
                  t = (v0 - v1 + 1) >> 1;
                  v0 = (v0 + v1 + 1) >> 1;
                  v1 = t;
                  t = (v2 * dctSin6 + v3 * dctCos6 + 2048) >> 12;
                  v2 = (v2 * dctCos6 - v3 * dctSin6 + 2048) >> 12;
                  v3 = t;
                  t = (v4 - v6 + 1) >> 1;
                  v4 = (v4 + v6 + 1) >> 1;
                  v6 = t;
                  t = (v7 + v5 + 1) >> 1;
                  v5 = (v7 - v5 + 1) >> 1;
                  v7 = t;
                  t = (v0 - v3 + 1) >> 1;
                  v0 = (v0 + v3 + 1) >> 1;
                  v3 = t;
                  t = (v1 - v2 + 1) >> 1;
                  v1 = (v1 + v2 + 1) >> 1;
                  v2 = t;
                  t = (v4 * dctSin3 + v7 * dctCos3 + 2048) >> 12;
                  v4 = (v4 * dctCos3 - v7 * dctSin3 + 2048) >> 12;
                  v7 = t;
                  t = (v5 * dctSin1 + v6 * dctCos1 + 2048) >> 12;
                  v5 = (v5 * dctCos1 - v6 * dctSin1 + 2048) >> 12;
                  v6 = t;
                  p[0 * 8 + col] = v0 + v7;
                  p[7 * 8 + col] = v0 - v7;
                  p[1 * 8 + col] = v1 + v6;
                  p[6 * 8 + col] = v1 - v6;
                  p[2 * 8 + col] = v2 + v5;
                  p[5 * 8 + col] = v2 - v5;
                  p[3 * 8 + col] = v3 + v4;
                  p[4 * 8 + col] = v3 - v4;
                }
                for (i = 0; i < 64; ++i) {
                  var sample = 128 + ((p[i] + 8) >> 4);
                  dataOut[i] = sample < 0 ? 0 : sample > 255 ? 255 : sample;
                }
              }
              var i, j;
              for (var blockRow = 0; blockRow < blocksPerColumn; blockRow++) {
                var scanLine = blockRow << 3;
                for (i = 0; i < 8; i++)
                  lines.push(new Uint8Array(samplesPerLine));

                for (var blockCol = 0; blockCol < blocksPerLine; blockCol++) {
                  quantizeAndInverse(
                    component.blocks[blockRow][blockCol],
                    r,
                    R
                  );
                  var offset = 0,
                    sample = blockCol << 3;
                  for (j = 0; j < 8; j++) {
                    var line = lines[scanLine + j];
                    for (i = 0; i < 8; i++) line[sample + i] = r[offset++];
                  }
                }
              }
              return lines;
            }
            function clampTo8bit(a) {
              return a < 0 ? 0 : a > 255 ? 255 : a;
            }
            constructor.prototype = {
              load: function load(path) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", path, true);
                xhr.responseType = "arraybuffer";
                xhr.onload = function () {
                  var data = new Uint8Array(
                    xhr.response || xhr.mozResponseArrayBuffer
                  );
                  this.parse(data);
                  if (this.onload) this.onload();
                }.bind(this);
                xhr.send(null);
              },
              parse: function parse(data) {
                var offset = 0,
                  length = data.length;
                function readUint16() {
                  var value = (data[offset] << 8) | data[offset + 1];
                  offset += 2;
                  return value;
                }
                function readDataBlock() {
                  var length = readUint16();
                  var array = data.subarray(offset, offset + length - 2);
                  offset += array.length;
                  return array;
                }
                function prepareComponents(frame) {
                  var maxH = 0,
                    maxV = 0;
                  var component, componentId;
                  for (componentId in frame.components) {
                    if (frame.components.hasOwnProperty(componentId)) {
                      component = frame.components[componentId];
                      if (maxH < component.h) maxH = component.h;
                      if (maxV < component.v) maxV = component.v;
                    }
                  }
                  var mcusPerLine = Math.ceil(frame.samplesPerLine / 8 / maxH);
                  var mcusPerColumn = Math.ceil(frame.scanLines / 8 / maxV);
                  for (componentId in frame.components) {
                    if (frame.components.hasOwnProperty(componentId)) {
                      component = frame.components[componentId];
                      var blocksPerLine = Math.ceil(
                        (Math.ceil(frame.samplesPerLine / 8) * component.h) /
                          maxH
                      );
                      var blocksPerColumn = Math.ceil(
                        (Math.ceil(frame.scanLines / 8) * component.v) / maxV
                      );
                      var blocksPerLineForMcu = mcusPerLine * component.h;
                      var blocksPerColumnForMcu = mcusPerColumn * component.v;
                      var blocks = [];
                      for (var i = 0; i < blocksPerColumnForMcu; i++) {
                        var row = [];
                        for (var j = 0; j < blocksPerLineForMcu; j++)
                          row.push(new Int32Array(64));
                        blocks.push(row);
                      }
                      component.blocksPerLine = blocksPerLine;
                      component.blocksPerColumn = blocksPerColumn;
                      component.blocks = blocks;
                    }
                  }
                  frame.maxH = maxH;
                  frame.maxV = maxV;
                  frame.mcusPerLine = mcusPerLine;
                  frame.mcusPerColumn = mcusPerColumn;
                }
                var jfif = null;
                var adobe = null;
                var pixels = null;
                var frame, resetInterval;
                var quantizationTables = [],
                  frames = [];
                var huffmanTablesAC = [],
                  huffmanTablesDC = [];
                var fileMarker = readUint16();
                if (fileMarker != 65496) {
                  throw "SOI not found";
                }
                fileMarker = readUint16();
                while (fileMarker != 65497) {
                  var i, j, l;
                  switch (fileMarker) {
                    case 65280:
                      break;
                    case 65504:
                    case 65505:
                    case 65506:
                    case 65507:
                    case 65508:
                    case 65509:
                    case 65510:
                    case 65511:
                    case 65512:
                    case 65513:
                    case 65514:
                    case 65515:
                    case 65516:
                    case 65517:
                    case 65518:
                    case 65519:
                    case 65534:
                      var appData = readDataBlock();
                      if (fileMarker === 65504) {
                        if (
                          appData[0] === 74 &&
                          appData[1] === 70 &&
                          appData[2] === 73 &&
                          appData[3] === 70 &&
                          appData[4] === 0
                        ) {
                          jfif = {
                            version: { major: appData[5], minor: appData[6] },
                            densityUnits: appData[7],
                            xDensity: (appData[8] << 8) | appData[9],
                            yDensity: (appData[10] << 8) | appData[11],
                            thumbWidth: appData[12],
                            thumbHeight: appData[13],
                            thumbData: appData.subarray(
                              14,
                              14 + 3 * appData[12] * appData[13]
                            ),
                          };
                        }
                      }
                      if (fileMarker === 65518) {
                        if (
                          appData[0] === 65 &&
                          appData[1] === 100 &&
                          appData[2] === 111 &&
                          appData[3] === 98 &&
                          appData[4] === 101 &&
                          appData[5] === 0
                        ) {
                          adobe = {
                            version: appData[6],
                            flags0: (appData[7] << 8) | appData[8],
                            flags1: (appData[9] << 8) | appData[10],
                            transformCode: appData[11],
                          };
                        }
                      }
                      break;
                    case 65499:
                      var quantizationTablesLength = readUint16();
                      var quantizationTablesEnd =
                        quantizationTablesLength + offset - 2;
                      while (offset < quantizationTablesEnd) {
                        var quantizationTableSpec = data[offset++];
                        var tableData = new Int32Array(64);
                        if (quantizationTableSpec >> 4 === 0) {
                          for (j = 0; j < 64; j++) {
                            var z = dctZigZag[j];
                            tableData[z] = data[offset++];
                          }
                        } else if (quantizationTableSpec >> 4 === 1) {
                          for (j = 0; j < 64; j++) {
                            var z = dctZigZag[j];
                            tableData[z] = readUint16();
                          }
                        } else throw "DQT: invalid table spec";
                        quantizationTables[quantizationTableSpec & 15] =
                          tableData;
                      }
                      break;
                    case 65472:
                    case 65473:
                    case 65474:
                      readUint16();
                      frame = {};
                      frame.extended = fileMarker === 65473;
                      frame.progressive = fileMarker === 65474;
                      frame.precision = data[offset++];
                      frame.scanLines = readUint16();
                      frame.samplesPerLine = readUint16();
                      frame.components = {};
                      frame.componentsOrder = [];
                      var componentsCount = data[offset++],
                        componentId;
                      var maxH = 0,
                        maxV = 0;
                      for (i = 0; i < componentsCount; i++) {
                        componentId = data[offset];
                        var h = data[offset + 1] >> 4;
                        var v = data[offset + 1] & 15;
                        var qId = data[offset + 2];
                        frame.componentsOrder.push(componentId);
                        frame.components[componentId] = {
                          h: h,
                          v: v,
                          quantizationTable: quantizationTables[qId],
                        };
                        offset += 3;
                      }
                      prepareComponents(frame);
                      frames.push(frame);
                      break;
                    case 65476:
                      var huffmanLength = readUint16();
                      for (i = 2; i < huffmanLength; ) {
                        var huffmanTableSpec = data[offset++];
                        var codeLengths = new Uint8Array(16);
                        var codeLengthSum = 0;
                        for (j = 0; j < 16; j++, offset++)
                          codeLengthSum += codeLengths[j] = data[offset];
                        var huffmanValues = new Uint8Array(codeLengthSum);
                        for (j = 0; j < codeLengthSum; j++, offset++)
                          huffmanValues[j] = data[offset];
                        i += 17 + codeLengthSum;
                        (huffmanTableSpec >> 4 === 0
                          ? huffmanTablesDC
                          : huffmanTablesAC)[huffmanTableSpec & 15] =
                          buildHuffmanTable(codeLengths, huffmanValues);
                      }
                      break;
                    case 65501:
                      readUint16();
                      resetInterval = readUint16();
                      break;
                    case 65498:
                      var scanLength = readUint16();
                      var selectorsCount = data[offset++];
                      var components = [],
                        component;
                      for (i = 0; i < selectorsCount; i++) {
                        component = frame.components[data[offset++]];
                        var tableSpec = data[offset++];
                        component.huffmanTableDC =
                          huffmanTablesDC[tableSpec >> 4];
                        component.huffmanTableAC =
                          huffmanTablesAC[tableSpec & 15];
                        components.push(component);
                      }
                      var spectralStart = data[offset++];
                      var spectralEnd = data[offset++];
                      var successiveApproximation = data[offset++];
                      var processed = decodeScan(
                        data,
                        offset,
                        frame,
                        components,
                        resetInterval,
                        spectralStart,
                        spectralEnd,
                        successiveApproximation >> 4,
                        successiveApproximation & 15
                      );
                      offset += processed;
                      break;
                    default:
                      if (
                        data[offset - 3] == 255 &&
                        data[offset - 2] >= 192 &&
                        data[offset - 2] <= 254
                      ) {
                        offset -= 3;
                        break;
                      }
                      throw "unknown JPEG marker " + fileMarker.toString(16);
                  }
                  fileMarker = readUint16();
                }
                if (frames.length != 1)
                  throw "only single frame JPEGs supported";
                this.width = frame.samplesPerLine;
                this.height = frame.scanLines;
                this.jfif = jfif;
                this.adobe = adobe;
                this.components = [];
                for (var i = 0; i < frame.componentsOrder.length; i++) {
                  var component = frame.components[frame.componentsOrder[i]];
                  this.components.push({
                    lines: buildComponentData(frame, component),
                    scaleX: component.h / frame.maxH,
                    scaleY: component.v / frame.maxV,
                  });
                }
              },
              getData: function getData(width, height) {
                var scaleX = this.width / width,
                  scaleY = this.height / height;
                var component1, component2, component3, component4;
                var component1Line,
                  component2Line,
                  component3Line,
                  component4Line;
                var x, y;
                var offset = 0;
                var Y, Cb, Cr, K, C, M, Ye, R, G, B;
                var colorTransform;
                var dataLength = width * height * this.components.length;
                var data = new Uint8Array(dataLength);
                switch (this.components.length) {
                  case 1:
                    component1 = this.components[0];
                    for (y = 0; y < height; y++) {
                      component1Line =
                        component1.lines[0 | (y * component1.scaleY * scaleY)];
                      for (x = 0; x < width; x++) {
                        Y =
                          component1Line[0 | (x * component1.scaleX * scaleX)];
                        data[offset++] = Y;
                      }
                    }
                    break;
                  case 2:
                    component1 = this.components[0];
                    component2 = this.components[1];
                    for (y = 0; y < height; y++) {
                      component1Line =
                        component1.lines[0 | (y * component1.scaleY * scaleY)];
                      component2Line =
                        component2.lines[0 | (y * component2.scaleY * scaleY)];
                      for (x = 0; x < width; x++) {
                        Y =
                          component1Line[0 | (x * component1.scaleX * scaleX)];
                        data[offset++] = Y;
                        Y =
                          component2Line[0 | (x * component2.scaleX * scaleX)];
                        data[offset++] = Y;
                      }
                    }
                    break;
                  case 3:
                    colorTransform = true;
                    if (this.adobe && this.adobe.transformCode)
                      colorTransform = true;
                    else if (typeof this.colorTransform !== "undefined")
                      colorTransform = !!this.colorTransform;
                    component1 = this.components[0];
                    component2 = this.components[1];
                    component3 = this.components[2];
                    for (y = 0; y < height; y++) {
                      component1Line =
                        component1.lines[0 | (y * component1.scaleY * scaleY)];
                      component2Line =
                        component2.lines[0 | (y * component2.scaleY * scaleY)];
                      component3Line =
                        component3.lines[0 | (y * component3.scaleY * scaleY)];
                      for (x = 0; x < width; x++) {
                        if (!colorTransform) {
                          R =
                            component1Line[
                              0 | (x * component1.scaleX * scaleX)
                            ];
                          G =
                            component2Line[
                              0 | (x * component2.scaleX * scaleX)
                            ];
                          B =
                            component3Line[
                              0 | (x * component3.scaleX * scaleX)
                            ];
                        } else {
                          Y =
                            component1Line[
                              0 | (x * component1.scaleX * scaleX)
                            ];
                          Cb =
                            component2Line[
                              0 | (x * component2.scaleX * scaleX)
                            ];
                          Cr =
                            component3Line[
                              0 | (x * component3.scaleX * scaleX)
                            ];
                          R = clampTo8bit(Y + 1.402 * (Cr - 128));
                          G = clampTo8bit(
                            Y - 0.3441363 * (Cb - 128) - 0.71413636 * (Cr - 128)
                          );
                          B = clampTo8bit(Y + 1.772 * (Cb - 128));
                        }
                        data[offset++] = R;
                        data[offset++] = G;
                        data[offset++] = B;
                      }
                    }
                    break;
                  case 4:
                    if (!this.adobe)
                      throw "Unsupported color mode (4 components)";
                    colorTransform = false;
                    if (this.adobe && this.adobe.transformCode)
                      colorTransform = true;
                    else if (typeof this.colorTransform !== "undefined")
                      colorTransform = !!this.colorTransform;
                    component1 = this.components[0];
                    component2 = this.components[1];
                    component3 = this.components[2];
                    component4 = this.components[3];
                    for (y = 0; y < height; y++) {
                      component1Line =
                        component1.lines[0 | (y * component1.scaleY * scaleY)];
                      component2Line =
                        component2.lines[0 | (y * component2.scaleY * scaleY)];
                      component3Line =
                        component3.lines[0 | (y * component3.scaleY * scaleY)];
                      component4Line =
                        component4.lines[0 | (y * component4.scaleY * scaleY)];
                      for (x = 0; x < width; x++) {
                        if (!colorTransform) {
                          C =
                            component1Line[
                              0 | (x * component1.scaleX * scaleX)
                            ];
                          M =
                            component2Line[
                              0 | (x * component2.scaleX * scaleX)
                            ];
                          Ye =
                            component3Line[
                              0 | (x * component3.scaleX * scaleX)
                            ];
                          K =
                            component4Line[
                              0 | (x * component4.scaleX * scaleX)
                            ];
                        } else {
                          Y =
                            component1Line[
                              0 | (x * component1.scaleX * scaleX)
                            ];
                          Cb =
                            component2Line[
                              0 | (x * component2.scaleX * scaleX)
                            ];
                          Cr =
                            component3Line[
                              0 | (x * component3.scaleX * scaleX)
                            ];
                          K =
                            component4Line[
                              0 | (x * component4.scaleX * scaleX)
                            ];
                          C = 255 - clampTo8bit(Y + 1.402 * (Cr - 128));
                          M =
                            255 -
                            clampTo8bit(
                              Y -
                                0.3441363 * (Cb - 128) -
                                0.71413636 * (Cr - 128)
                            );
                          Ye = 255 - clampTo8bit(Y + 1.772 * (Cb - 128));
                        }
                        data[offset++] = C;
                        data[offset++] = M;
                        data[offset++] = Ye;
                        data[offset++] = K;
                      }
                    }
                    break;
                  default:
                    throw "Unsupported color mode";
                }
                return data;
              },
              copyToImageData: function copyToImageData(imageData) {
                var width = imageData.width,
                  height = imageData.height;
                var imageDataArray = imageData.data;
                var data = this.getData(width, height);
                var i = 0,
                  j = 0,
                  x,
                  y;
                var Y, K, C, M, R, G, B;
                switch (this.components.length) {
                  case 1:
                    for (y = 0; y < height; y++) {
                      for (x = 0; x < width; x++) {
                        Y = data[i++];
                        imageDataArray[j++] = Y;
                        imageDataArray[j++] = Y;
                        imageDataArray[j++] = Y;
                        imageDataArray[j++] = 255;
                      }
                    }
                    break;
                  case 3:
                    for (y = 0; y < height; y++) {
                      for (x = 0; x < width; x++) {
                        R = data[i++];
                        G = data[i++];
                        B = data[i++];
                        imageDataArray[j++] = R;
                        imageDataArray[j++] = G;
                        imageDataArray[j++] = B;
                        imageDataArray[j++] = 255;
                      }
                    }
                    break;
                  case 4:
                    for (y = 0; y < height; y++) {
                      for (x = 0; x < width; x++) {
                        C = data[i++];
                        M = data[i++];
                        Y = data[i++];
                        K = data[i++];
                        R = 255 - clampTo8bit(C * (1 - K / 255) + K);
                        G = 255 - clampTo8bit(M * (1 - K / 255) + K);
                        B = 255 - clampTo8bit(Y * (1 - K / 255) + K);
                        imageDataArray[j++] = R;
                        imageDataArray[j++] = G;
                        imageDataArray[j++] = B;
                        imageDataArray[j++] = 255;
                      }
                    }
                    break;
                  default:
                    throw "Unsupported color mode";
                }
              },
            };
            return constructor;
          })();
          module.exports = decode;
          function decode(jpegData) {
            var arr = new Uint8Array(jpegData);
            var decoder = new JpegImage();
            decoder.parse(arr);
            var data = decoder.getData(decoder.width, decoder.height);
            var buf = new Buffer(decoder.width * decoder.height * 4);
            var n = 0;
            for (var i = 0; i < buf.length; i++) {
              buf[i + ((i / 3) | 0)] = data[n++];
              if (i % 4 == 3) buf[i] = 255;
            }
            return { data: buf, width: decoder.width, height: decoder.height };
          }
        }.call(this, require("buffer").Buffer));
      },
      { buffer: 16 },
    ],
    65: [
      function (require, module, exports) {
        (function (Buffer) {
          var btoa =
            btoa ||
            function (buf) {
              return new Buffer(buf).toString("base64");
            };
          function JPEGEncoder(quality) {
            var self = this;
            var fround = Math.round;
            var ffloor = Math.floor;
            var YTable = new Array(64);
            var UVTable = new Array(64);
            var fdtbl_Y = new Array(64);
            var fdtbl_UV = new Array(64);
            var YDC_HT;
            var UVDC_HT;
            var YAC_HT;
            var UVAC_HT;
            var bitcode = new Array(65535);
            var category = new Array(65535);
            var outputfDCTQuant = new Array(64);
            var DU = new Array(64);
            var byteout = [];
            var bytenew = 0;
            var bytepos = 7;
            var YDU = new Array(64);
            var UDU = new Array(64);
            var VDU = new Array(64);
            var clt = new Array(256);
            var RGB_YUV_TABLE = new Array(2048);
            var currentQuality;
            var ZigZag = [
              0, 1, 5, 6, 14, 15, 27, 28, 2, 4, 7, 13, 16, 26, 29, 42, 3, 8, 12,
              17, 25, 30, 41, 43, 9, 11, 18, 24, 31, 40, 44, 53, 10, 19, 23, 32,
              39, 45, 52, 54, 20, 22, 33, 38, 46, 51, 55, 60, 21, 34, 37, 47,
              50, 56, 59, 61, 35, 36, 48, 49, 57, 58, 62, 63,
            ];
            var std_dc_luminance_nrcodes = [
              0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
            ];
            var std_dc_luminance_values = [
              0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
            ];
            var std_ac_luminance_nrcodes = [
              0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 125,
            ];
            var std_ac_luminance_values = [
              1, 2, 3, 0, 4, 17, 5, 18, 33, 49, 65, 6, 19, 81, 97, 7, 34, 113,
              20, 50, 129, 145, 161, 8, 35, 66, 177, 193, 21, 82, 209, 240, 36,
              51, 98, 114, 130, 9, 10, 22, 23, 24, 25, 26, 37, 38, 39, 40, 41,
              42, 52, 53, 54, 55, 56, 57, 58, 67, 68, 69, 70, 71, 72, 73, 74,
              83, 84, 85, 86, 87, 88, 89, 90, 99, 100, 101, 102, 103, 104, 105,
              106, 115, 116, 117, 118, 119, 120, 121, 122, 131, 132, 133, 134,
              135, 136, 137, 138, 146, 147, 148, 149, 150, 151, 152, 153, 154,
              162, 163, 164, 165, 166, 167, 168, 169, 170, 178, 179, 180, 181,
              182, 183, 184, 185, 186, 194, 195, 196, 197, 198, 199, 200, 201,
              202, 210, 211, 212, 213, 214, 215, 216, 217, 218, 225, 226, 227,
              228, 229, 230, 231, 232, 233, 234, 241, 242, 243, 244, 245, 246,
              247, 248, 249, 250,
            ];
            var std_dc_chrominance_nrcodes = [
              0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0,
            ];
            var std_dc_chrominance_values = [
              0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
            ];
            var std_ac_chrominance_nrcodes = [
              0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 119,
            ];
            var std_ac_chrominance_values = [
              0, 1, 2, 3, 17, 4, 5, 33, 49, 6, 18, 65, 81, 7, 97, 113, 19, 34,
              50, 129, 8, 20, 66, 145, 161, 177, 193, 9, 35, 51, 82, 240, 21,
              98, 114, 209, 10, 22, 36, 52, 225, 37, 241, 23, 24, 25, 26, 38,
              39, 40, 41, 42, 53, 54, 55, 56, 57, 58, 67, 68, 69, 70, 71, 72,
              73, 74, 83, 84, 85, 86, 87, 88, 89, 90, 99, 100, 101, 102, 103,
              104, 105, 106, 115, 116, 117, 118, 119, 120, 121, 122, 130, 131,
              132, 133, 134, 135, 136, 137, 138, 146, 147, 148, 149, 150, 151,
              152, 153, 154, 162, 163, 164, 165, 166, 167, 168, 169, 170, 178,
              179, 180, 181, 182, 183, 184, 185, 186, 194, 195, 196, 197, 198,
              199, 200, 201, 202, 210, 211, 212, 213, 214, 215, 216, 217, 218,
              226, 227, 228, 229, 230, 231, 232, 233, 234, 242, 243, 244, 245,
              246, 247, 248, 249, 250,
            ];
            function initQuantTables(sf) {
              var YQT = [
                16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55,
                14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62,
                18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113,
                92, 49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112,
                100, 103, 99,
              ];
              for (var i = 0; i < 64; i++) {
                var t = ffloor((YQT[i] * sf + 50) / 100);
                if (t < 1) {
                  t = 1;
                } else if (t > 255) {
                  t = 255;
                }
                YTable[ZigZag[i]] = t;
              }
              var UVQT = [
                17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99,
                24, 26, 56, 99, 99, 99, 99, 99, 47, 66, 99, 99, 99, 99, 99, 99,
                99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
                99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
              ];
              for (var j = 0; j < 64; j++) {
                var u = ffloor((UVQT[j] * sf + 50) / 100);
                if (u < 1) {
                  u = 1;
                } else if (u > 255) {
                  u = 255;
                }
                UVTable[ZigZag[j]] = u;
              }
              var aasf = [
                1, 1.387039845, 1.306562965, 1.175875602, 1, 0.785694958,
                0.5411961, 0.275899379,
              ];
              var k = 0;
              for (var row = 0; row < 8; row++) {
                for (var col = 0; col < 8; col++) {
                  fdtbl_Y[k] =
                    1 / (YTable[ZigZag[k]] * aasf[row] * aasf[col] * 8);
                  fdtbl_UV[k] =
                    1 / (UVTable[ZigZag[k]] * aasf[row] * aasf[col] * 8);
                  k++;
                }
              }
            }
            function computeHuffmanTbl(nrcodes, std_table) {
              var codevalue = 0;
              var pos_in_table = 0;
              var HT = new Array();
              for (var k = 1; k <= 16; k++) {
                for (var j = 1; j <= nrcodes[k]; j++) {
                  HT[std_table[pos_in_table]] = [];
                  HT[std_table[pos_in_table]][0] = codevalue;
                  HT[std_table[pos_in_table]][1] = k;
                  pos_in_table++;
                  codevalue++;
                }
                codevalue *= 2;
              }
              return HT;
            }
            function initHuffmanTbl() {
              YDC_HT = computeHuffmanTbl(
                std_dc_luminance_nrcodes,
                std_dc_luminance_values
              );
              UVDC_HT = computeHuffmanTbl(
                std_dc_chrominance_nrcodes,
                std_dc_chrominance_values
              );
              YAC_HT = computeHuffmanTbl(
                std_ac_luminance_nrcodes,
                std_ac_luminance_values
              );
              UVAC_HT = computeHuffmanTbl(
                std_ac_chrominance_nrcodes,
                std_ac_chrominance_values
              );
            }
            function initCategoryNumber() {
              var nrlower = 1;
              var nrupper = 2;
              for (var cat = 1; cat <= 15; cat++) {
                for (var nr = nrlower; nr < nrupper; nr++) {
                  category[32767 + nr] = cat;
                  bitcode[32767 + nr] = [];
                  bitcode[32767 + nr][1] = cat;
                  bitcode[32767 + nr][0] = nr;
                }
                for (var nrneg = -(nrupper - 1); nrneg <= -nrlower; nrneg++) {
                  category[32767 + nrneg] = cat;
                  bitcode[32767 + nrneg] = [];
                  bitcode[32767 + nrneg][1] = cat;
                  bitcode[32767 + nrneg][0] = nrupper - 1 + nrneg;
                }
                nrlower <<= 1;
                nrupper <<= 1;
              }
            }
            function initRGBYUVTable() {
              for (var i = 0; i < 256; i++) {
                RGB_YUV_TABLE[i] = 19595 * i;
                RGB_YUV_TABLE[(i + 256) >> 0] = 38470 * i;
                RGB_YUV_TABLE[(i + 512) >> 0] = 7471 * i + 32768;
                RGB_YUV_TABLE[(i + 768) >> 0] = -11059 * i;
                RGB_YUV_TABLE[(i + 1024) >> 0] = -21709 * i;
                RGB_YUV_TABLE[(i + 1280) >> 0] = 32768 * i + 8421375;
                RGB_YUV_TABLE[(i + 1536) >> 0] = -27439 * i;
                RGB_YUV_TABLE[(i + 1792) >> 0] = -5329 * i;
              }
            }
            function writeBits(bs) {
              var value = bs[0];
              var posval = bs[1] - 1;
              while (posval >= 0) {
                if (value & (1 << posval)) {
                  bytenew |= 1 << bytepos;
                }
                posval--;
                bytepos--;
                if (bytepos < 0) {
                  if (bytenew == 255) {
                    writeByte(255);
                    writeByte(0);
                  } else {
                    writeByte(bytenew);
                  }
                  bytepos = 7;
                  bytenew = 0;
                }
              }
            }
            function writeByte(value) {
              byteout.push(value);
            }
            function writeWord(value) {
              writeByte((value >> 8) & 255);
              writeByte(value & 255);
            }
            function fDCTQuant(data, fdtbl) {
              var d0, d1, d2, d3, d4, d5, d6, d7;
              var dataOff = 0;
              var i;
              const I8 = 8;
              const I64 = 64;
              for (i = 0; i < I8; ++i) {
                d0 = data[dataOff];
                d1 = data[dataOff + 1];
                d2 = data[dataOff + 2];
                d3 = data[dataOff + 3];
                d4 = data[dataOff + 4];
                d5 = data[dataOff + 5];
                d6 = data[dataOff + 6];
                d7 = data[dataOff + 7];
                var tmp0 = d0 + d7;
                var tmp7 = d0 - d7;
                var tmp1 = d1 + d6;
                var tmp6 = d1 - d6;
                var tmp2 = d2 + d5;
                var tmp5 = d2 - d5;
                var tmp3 = d3 + d4;
                var tmp4 = d3 - d4;
                var tmp10 = tmp0 + tmp3;
                var tmp13 = tmp0 - tmp3;
                var tmp11 = tmp1 + tmp2;
                var tmp12 = tmp1 - tmp2;
                data[dataOff] = tmp10 + tmp11;
                data[dataOff + 4] = tmp10 - tmp11;
                var z1 = (tmp12 + tmp13) * 0.707106781;
                data[dataOff + 2] = tmp13 + z1;
                data[dataOff + 6] = tmp13 - z1;
                tmp10 = tmp4 + tmp5;
                tmp11 = tmp5 + tmp6;
                tmp12 = tmp6 + tmp7;
                var z5 = (tmp10 - tmp12) * 0.382683433;
                var z2 = 0.5411961 * tmp10 + z5;
                var z4 = 1.306562965 * tmp12 + z5;
                var z3 = tmp11 * 0.707106781;
                var z11 = tmp7 + z3;
                var z13 = tmp7 - z3;
                data[dataOff + 5] = z13 + z2;
                data[dataOff + 3] = z13 - z2;
                data[dataOff + 1] = z11 + z4;
                data[dataOff + 7] = z11 - z4;
                dataOff += 8;
              }
              dataOff = 0;
              for (i = 0; i < I8; ++i) {
                d0 = data[dataOff];
                d1 = data[dataOff + 8];
                d2 = data[dataOff + 16];
                d3 = data[dataOff + 24];
                d4 = data[dataOff + 32];
                d5 = data[dataOff + 40];
                d6 = data[dataOff + 48];
                d7 = data[dataOff + 56];
                var tmp0p2 = d0 + d7;
                var tmp7p2 = d0 - d7;
                var tmp1p2 = d1 + d6;
                var tmp6p2 = d1 - d6;
                var tmp2p2 = d2 + d5;
                var tmp5p2 = d2 - d5;
                var tmp3p2 = d3 + d4;
                var tmp4p2 = d3 - d4;
                var tmp10p2 = tmp0p2 + tmp3p2;
                var tmp13p2 = tmp0p2 - tmp3p2;
                var tmp11p2 = tmp1p2 + tmp2p2;
                var tmp12p2 = tmp1p2 - tmp2p2;
                data[dataOff] = tmp10p2 + tmp11p2;
                data[dataOff + 32] = tmp10p2 - tmp11p2;
                var z1p2 = (tmp12p2 + tmp13p2) * 0.707106781;
                data[dataOff + 16] = tmp13p2 + z1p2;
                data[dataOff + 48] = tmp13p2 - z1p2;
                tmp10p2 = tmp4p2 + tmp5p2;
                tmp11p2 = tmp5p2 + tmp6p2;
                tmp12p2 = tmp6p2 + tmp7p2;
                var z5p2 = (tmp10p2 - tmp12p2) * 0.382683433;
                var z2p2 = 0.5411961 * tmp10p2 + z5p2;
                var z4p2 = 1.306562965 * tmp12p2 + z5p2;
                var z3p2 = tmp11p2 * 0.707106781;
                var z11p2 = tmp7p2 + z3p2;
                var z13p2 = tmp7p2 - z3p2;
                data[dataOff + 40] = z13p2 + z2p2;
                data[dataOff + 24] = z13p2 - z2p2;
                data[dataOff + 8] = z11p2 + z4p2;
                data[dataOff + 56] = z11p2 - z4p2;
                dataOff++;
              }
              var fDCTQuant;
              for (i = 0; i < I64; ++i) {
                fDCTQuant = data[i] * fdtbl[i];
                outputfDCTQuant[i] =
                  fDCTQuant > 0 ? (fDCTQuant + 0.5) | 0 : (fDCTQuant - 0.5) | 0;
              }
              return outputfDCTQuant;
            }
            function writeAPP0() {
              writeWord(65504);
              writeWord(16);
              writeByte(74);
              writeByte(70);
              writeByte(73);
              writeByte(70);
              writeByte(0);
              writeByte(1);
              writeByte(1);
              writeByte(0);
              writeWord(1);
              writeWord(1);
              writeByte(0);
              writeByte(0);
            }
            function writeSOF0(width, height) {
              writeWord(65472);
              writeWord(17);
              writeByte(8);
              writeWord(height);
              writeWord(width);
              writeByte(3);
              writeByte(1);
              writeByte(17);
              writeByte(0);
              writeByte(2);
              writeByte(17);
              writeByte(1);
              writeByte(3);
              writeByte(17);
              writeByte(1);
            }
            function writeDQT() {
              writeWord(65499);
              writeWord(132);
              writeByte(0);
              for (var i = 0; i < 64; i++) {
                writeByte(YTable[i]);
              }
              writeByte(1);
              for (var j = 0; j < 64; j++) {
                writeByte(UVTable[j]);
              }
            }
            function writeDHT() {
              writeWord(65476);
              writeWord(418);
              writeByte(0);
              for (var i = 0; i < 16; i++) {
                writeByte(std_dc_luminance_nrcodes[i + 1]);
              }
              for (var j = 0; j <= 11; j++) {
                writeByte(std_dc_luminance_values[j]);
              }
              writeByte(16);
              for (var k = 0; k < 16; k++) {
                writeByte(std_ac_luminance_nrcodes[k + 1]);
              }
              for (var l = 0; l <= 161; l++) {
                writeByte(std_ac_luminance_values[l]);
              }
              writeByte(1);
              for (var m = 0; m < 16; m++) {
                writeByte(std_dc_chrominance_nrcodes[m + 1]);
              }
              for (var n = 0; n <= 11; n++) {
                writeByte(std_dc_chrominance_values[n]);
              }
              writeByte(17);
              for (var o = 0; o < 16; o++) {
                writeByte(std_ac_chrominance_nrcodes[o + 1]);
              }
              for (var p = 0; p <= 161; p++) {
                writeByte(std_ac_chrominance_values[p]);
              }
            }
            function writeSOS() {
              writeWord(65498);
              writeWord(12);
              writeByte(3);
              writeByte(1);
              writeByte(0);
              writeByte(2);
              writeByte(17);
              writeByte(3);
              writeByte(17);
              writeByte(0);
              writeByte(63);
              writeByte(0);
            }
            function processDU(CDU, fdtbl, DC, HTDC, HTAC) {
              var EOB = HTAC[0];
              var M16zeroes = HTAC[240];
              var pos;
              const I16 = 16;
              const I63 = 63;
              const I64 = 64;
              var DU_DCT = fDCTQuant(CDU, fdtbl);
              for (var j = 0; j < I64; ++j) {
                DU[ZigZag[j]] = DU_DCT[j];
              }
              var Diff = DU[0] - DC;
              DC = DU[0];
              if (Diff == 0) {
                writeBits(HTDC[0]);
              } else {
                pos = 32767 + Diff;
                writeBits(HTDC[category[pos]]);
                writeBits(bitcode[pos]);
              }
              var end0pos = 63;
              for (; end0pos > 0 && DU[end0pos] == 0; end0pos--) {}
              if (end0pos == 0) {
                writeBits(EOB);
                return DC;
              }
              var i = 1;
              var lng;
              while (i <= end0pos) {
                var startpos = i;
                for (; DU[i] == 0 && i <= end0pos; ++i) {}
                var nrzeroes = i - startpos;
                if (nrzeroes >= I16) {
                  lng = nrzeroes >> 4;
                  for (var nrmarker = 1; nrmarker <= lng; ++nrmarker)
                    writeBits(M16zeroes);
                  nrzeroes = nrzeroes & 15;
                }
                pos = 32767 + DU[i];
                writeBits(HTAC[(nrzeroes << 4) + category[pos]]);
                writeBits(bitcode[pos]);
                i++;
              }
              if (end0pos != I63) {
                writeBits(EOB);
              }
              return DC;
            }
            function initCharLookupTable() {
              var sfcc = String.fromCharCode;
              for (var i = 0; i < 256; i++) {
                clt[i] = sfcc(i);
              }
            }
            this.encode = function (image, quality) {
              var time_start = new Date().getTime();
              if (quality) setQuality(quality);
              byteout = new Array();
              bytenew = 0;
              bytepos = 7;
              writeWord(65496);
              writeAPP0();
              writeDQT();
              writeSOF0(image.width, image.height);
              writeDHT();
              writeSOS();
              var DCY = 0;
              var DCU = 0;
              var DCV = 0;
              bytenew = 0;
              bytepos = 7;
              this.encode.displayName = "_encode_";
              var imageData = image.data;
              var width = image.width;
              var height = image.height;
              var quadWidth = width * 4;
              var tripleWidth = width * 3;
              var x,
                y = 0;
              var r, g, b;
              var start, p, col, row, pos;
              while (y < height) {
                x = 0;
                while (x < quadWidth) {
                  start = quadWidth * y + x;
                  p = start;
                  col = -1;
                  row = 0;
                  for (pos = 0; pos < 64; pos++) {
                    row = pos >> 3;
                    col = (pos & 7) * 4;
                    p = start + row * quadWidth + col;
                    if (y + row >= height) {
                      p -= quadWidth * (y + 1 + row - height);
                    }
                    if (x + col >= quadWidth) {
                      p -= x + col - quadWidth + 4;
                    }
                    r = imageData[p++];
                    g = imageData[p++];
                    b = imageData[p++];
                    YDU[pos] =
                      ((RGB_YUV_TABLE[r] +
                        RGB_YUV_TABLE[(g + 256) >> 0] +
                        RGB_YUV_TABLE[(b + 512) >> 0]) >>
                        16) -
                      128;
                    UDU[pos] =
                      ((RGB_YUV_TABLE[(r + 768) >> 0] +
                        RGB_YUV_TABLE[(g + 1024) >> 0] +
                        RGB_YUV_TABLE[(b + 1280) >> 0]) >>
                        16) -
                      128;
                    VDU[pos] =
                      ((RGB_YUV_TABLE[(r + 1280) >> 0] +
                        RGB_YUV_TABLE[(g + 1536) >> 0] +
                        RGB_YUV_TABLE[(b + 1792) >> 0]) >>
                        16) -
                      128;
                  }
                  DCY = processDU(YDU, fdtbl_Y, DCY, YDC_HT, YAC_HT);
                  DCU = processDU(UDU, fdtbl_UV, DCU, UVDC_HT, UVAC_HT);
                  DCV = processDU(VDU, fdtbl_UV, DCV, UVDC_HT, UVAC_HT);
                  x += 32;
                }
                y += 8;
              }
              if (bytepos >= 0) {
                var fillbits = [];
                fillbits[1] = bytepos + 1;
                fillbits[0] = (1 << (bytepos + 1)) - 1;
                writeBits(fillbits);
              }
              writeWord(65497);
              return new Buffer(byteout);
              var jpegDataUri =
                "data:image/jpeg;base64," + btoa(byteout.join(""));
              byteout = [];
              var duration = new Date().getTime() - time_start;
              return jpegDataUri;
            };
            function setQuality(quality) {
              if (quality <= 0) {
                quality = 1;
              }
              if (quality > 100) {
                quality = 100;
              }
              if (currentQuality == quality) return;
              var sf = 0;
              if (quality < 50) {
                sf = Math.floor(5e3 / quality);
              } else {
                sf = Math.floor(200 - quality * 2);
              }
              initQuantTables(sf);
              currentQuality = quality;
            }
            function init() {
              var time_start = new Date().getTime();
              if (!quality) quality = 50;
              initCharLookupTable();
              initHuffmanTbl();
              initCategoryNumber();
              initRGBYUVTable();
              setQuality(quality);
              var duration = new Date().getTime() - time_start;
            }
            init();
          }
          module.exports = encode;
          function encode(imgData, qu) {
            if (typeof qu === "undefined") qu = 50;
            var encoder = new JPEGEncoder(qu);
            var data = encoder.encode(imgData, qu);
            return { data: data, width: imgData.width, height: imgData.height };
          }
          function getImageDataFromImage(idOrElement) {
            var theImg =
              typeof idOrElement == "string"
                ? document.getElementById(idOrElement)
                : idOrElement;
            var cvs = document.createElement("canvas");
            cvs.width = theImg.width;
            cvs.height = theImg.height;
            var ctx = cvs.getContext("2d");
            ctx.drawImage(theImg, 0, 0);
            return ctx.getImageData(0, 0, cvs.width, cvs.height);
          }
        }.call(this, require("buffer").Buffer));
      },
      { buffer: 16 },
    ],
    66: [
      function (require, module, exports) {
        (function (Buffer) {
          "use strict";
          var util = require("util"),
            Stream = require("stream");
          var ChunkStream = (module.exports = function () {
            Stream.call(this);
            this._buffers = [];
            this._buffered = 0;
            this._reads = [];
            this._paused = false;
            this._encoding = "utf8";
            this.writable = true;
          });
          util.inherits(ChunkStream, Stream);
          ChunkStream.prototype.read = function (length, callback) {
            this._reads.push({
              length: Math.abs(length),
              allowLess: length < 0,
              func: callback,
            });
            this._process();
            if (this._paused && this._reads.length > 0) {
              this._paused = false;
              this.emit("drain");
            }
          };
          ChunkStream.prototype.write = function (data, encoding) {
            if (!this.writable) {
              this.emit("error", new Error("Stream not writable"));
              return false;
            }
            if (!Buffer.isBuffer(data))
              data = new Buffer(data, encoding || this._encoding);
            this._buffers.push(data);
            this._buffered += data.length;
            this._process();
            if (this._reads && this._reads.length == 0) this._paused = true;
            return this.writable && !this._paused;
          };
          ChunkStream.prototype.end = function (data, encoding) {
            if (data) this.write(data, encoding);
            this.writable = false;
            if (!this._buffers) return;
            if (this._buffers.length == 0) {
              this._end();
            } else {
              this._buffers.push(null);
              this._process();
            }
          };
          ChunkStream.prototype.destroySoon = ChunkStream.prototype.end;
          ChunkStream.prototype._end = function () {
            if (this._reads.length > 0) {
              this.emit(
                "error",
                new Error(
                  "There are some read requests waitng on finished stream"
                )
              );
            }
            this.destroy();
          };
          ChunkStream.prototype.destroy = function () {
            if (!this._buffers) return;
            this.writable = false;
            this._reads = null;
            this._buffers = null;
            this.emit("close");
          };
          ChunkStream.prototype._process = function () {
            while (
              this._buffered > 0 &&
              this._reads &&
              this._reads.length > 0
            ) {
              var read = this._reads[0];
              if (read.allowLess) {
                this._reads.shift();
                var buf = this._buffers[0];
                if (buf.length > read.length) {
                  this._buffered -= read.length;
                  this._buffers[0] = buf.slice(read.length);
                  read.func.call(this, buf.slice(0, read.length));
                } else {
                  this._buffered -= buf.length;
                  this._buffers.shift();
                  read.func.call(this, buf);
                }
              } else if (this._buffered >= read.length) {
                this._reads.shift();
                var pos = 0,
                  count = 0,
                  data = new Buffer(read.length);
                while (pos < read.length) {
                  var buf = this._buffers[count++],
                    len = Math.min(buf.length, read.length - pos);
                  buf.copy(data, pos, 0, len);
                  pos += len;
                  if (len != buf.length)
                    this._buffers[--count] = buf.slice(len);
                }
                if (count > 0) this._buffers.splice(0, count);
                this._buffered -= read.length;
                read.func.call(this, data);
              } else {
                break;
              }
            }
            if (
              this._buffers &&
              this._buffers.length > 0 &&
              this._buffers[0] == null
            ) {
              this._end();
            }
          };
        }.call(this, require("buffer").Buffer));
      },
      { buffer: 16, stream: 35, util: 38 },
    ],
    67: [
      function (require, module, exports) {
        "use strict";
        module.exports = {
          PNG_SIGNATURE: [137, 80, 78, 71, 13, 10, 26, 10],
          TYPE_IHDR: 1229472850,
          TYPE_IEND: 1229278788,
          TYPE_IDAT: 1229209940,
          TYPE_PLTE: 1347179589,
          TYPE_tRNS: 1951551059,
          TYPE_gAMA: 1732332865,
          COLOR_PALETTE: 1,
          COLOR_COLOR: 2,
          COLOR_ALPHA: 4,
        };
      },
      {},
    ],
    68: [
      function (require, module, exports) {
        "use strict";
        var util = require("util"),
          Stream = require("stream");
        var CrcStream = (module.exports = function () {
          Stream.call(this);
          this._crc = -1;
          this.writable = true;
        });
        util.inherits(CrcStream, Stream);
        CrcStream.prototype.write = function (data) {
          for (var i = 0; i < data.length; i++) {
            this._crc =
              crcTable[(this._crc ^ data[i]) & 255] ^ (this._crc >>> 8);
          }
          return true;
        };
        CrcStream.prototype.end = function (data) {
          if (data) this.write(data);
          this.emit("crc", this.crc32());
        };
        CrcStream.prototype.crc32 = function () {
          return this._crc ^ -1;
        };
        CrcStream.crc32 = function (buf) {
          var crc = -1;
          for (var i = 0; i < buf.length; i++) {
            crc = crcTable[(crc ^ buf[i]) & 255] ^ (crc >>> 8);
          }
          return crc ^ -1;
        };
        var crcTable = [];
        for (var i = 0; i < 256; i++) {
          var c = i;
          for (var j = 0; j < 8; j++) {
            if (c & 1) {
              c = 3988292384 ^ (c >>> 1);
            } else {
              c = c >>> 1;
            }
          }
          crcTable[i] = c;
        }
      },
      { stream: 35, util: 38 },
    ],
    69: [
      function (require, module, exports) {
        (function (Buffer) {
          "use strict";
          var util = require("util"),
            zlib = require("zlib"),
            ChunkStream = require("./chunkstream");
          var Filter = (module.exports = function (
            width,
            height,
            Bpp,
            data,
            options
          ) {
            ChunkStream.call(this);
            this._width = width;
            this._height = height;
            this._Bpp = Bpp;
            this._data = data;
            this._options = options;
            this._line = 0;
            if (!("filterType" in options) || options.filterType == -1) {
              options.filterType = [0, 1, 2, 3, 4];
            } else if (typeof options.filterType == "number") {
              options.filterType = [options.filterType];
            }
            this._filters = {
              0: this._filterNone.bind(this),
              1: this._filterSub.bind(this),
              2: this._filterUp.bind(this),
              3: this._filterAvg.bind(this),
              4: this._filterPaeth.bind(this),
            };
            this.read(
              this._width * Bpp + 1,
              this._reverseFilterLine.bind(this)
            );
          });
          util.inherits(Filter, ChunkStream);
          var pixelBppMap = {
            1: { 0: 0, 1: 0, 2: 0, 3: 255 },
            2: { 0: 0, 1: 0, 2: 0, 3: 1 },
            3: { 0: 0, 1: 1, 2: 2, 3: 255 },
            4: { 0: 0, 1: 1, 2: 2, 3: 3 },
          };
          Filter.prototype._reverseFilterLine = function (rawData) {
            var pxData = this._data,
              pxLineLength = this._width << 2,
              pxRowPos = this._line * pxLineLength,
              filter = rawData[0];
            if (filter == 0) {
              for (var x = 0; x < this._width; x++) {
                var pxPos = pxRowPos + (x << 2),
                  rawPos = 1 + x * this._Bpp;
                for (var i = 0; i < 4; i++) {
                  var idx = pixelBppMap[this._Bpp][i];
                  pxData[pxPos + i] = idx != 255 ? rawData[rawPos + idx] : 255;
                }
              }
            } else if (filter == 1) {
              for (var x = 0; x < this._width; x++) {
                var pxPos = pxRowPos + (x << 2),
                  rawPos = 1 + x * this._Bpp;
                for (var i = 0; i < 4; i++) {
                  var idx = pixelBppMap[this._Bpp][i],
                    left = x > 0 ? pxData[pxPos + i - 4] : 0;
                  pxData[pxPos + i] =
                    idx != 255 ? rawData[rawPos + idx] + left : 255;
                }
              }
            } else if (filter == 2) {
              for (var x = 0; x < this._width; x++) {
                var pxPos = pxRowPos + (x << 2),
                  rawPos = 1 + x * this._Bpp;
                for (var i = 0; i < 4; i++) {
                  var idx = pixelBppMap[this._Bpp][i],
                    up = this._line > 0 ? pxData[pxPos - pxLineLength + i] : 0;
                  pxData[pxPos + i] =
                    idx != 255 ? rawData[rawPos + idx] + up : 255;
                }
              }
            } else if (filter == 3) {
              for (var x = 0; x < this._width; x++) {
                var pxPos = pxRowPos + (x << 2),
                  rawPos = 1 + x * this._Bpp;
                for (var i = 0; i < 4; i++) {
                  var idx = pixelBppMap[this._Bpp][i],
                    left = x > 0 ? pxData[pxPos + i - 4] : 0,
                    up = this._line > 0 ? pxData[pxPos - pxLineLength + i] : 0,
                    add = Math.floor((left + up) / 2);
                  pxData[pxPos + i] =
                    idx != 255 ? rawData[rawPos + idx] + add : 255;
                }
              }
            } else if (filter == 4) {
              for (var x = 0; x < this._width; x++) {
                var pxPos = pxRowPos + (x << 2),
                  rawPos = 1 + x * this._Bpp;
                for (var i = 0; i < 4; i++) {
                  var idx = pixelBppMap[this._Bpp][i],
                    left = x > 0 ? pxData[pxPos + i - 4] : 0,
                    up = this._line > 0 ? pxData[pxPos - pxLineLength + i] : 0,
                    upLeft =
                      x > 0 && this._line > 0
                        ? pxData[pxPos - pxLineLength + i - 4]
                        : 0,
                    add = PaethPredictor(left, up, upLeft);
                  pxData[pxPos + i] =
                    idx != 255 ? rawData[rawPos + idx] + add : 255;
                }
              }
            }
            this._line++;
            if (this._line < this._height)
              this.read(
                this._width * this._Bpp + 1,
                this._reverseFilterLine.bind(this)
              );
            else this.emit("complete", this._data, this._width, this._height);
          };
          Filter.prototype.filter = function () {
            var pxData = this._data,
              rawData = new Buffer(((this._width << 2) + 1) * this._height);
            for (var y = 0; y < this._height; y++) {
              var filterTypes = this._options.filterType,
                min = Infinity,
                sel = 0;
              for (var i = 0; i < filterTypes.length; i++) {
                var sum = this._filters[filterTypes[i]](pxData, y, null);
                if (sum < min) {
                  sel = filterTypes[i];
                  min = sum;
                }
              }
              this._filters[sel](pxData, y, rawData);
            }
            return rawData;
          };
          Filter.prototype._filterNone = function (pxData, y, rawData) {
            var pxRowLength = this._width << 2,
              rawRowLength = pxRowLength + 1,
              sum = 0;
            if (!rawData) {
              for (var x = 0; x < pxRowLength; x++)
                sum += Math.abs(pxData[y * pxRowLength + x]);
            } else {
              rawData[y * rawRowLength] = 0;
              pxData.copy(
                rawData,
                rawRowLength * y + 1,
                pxRowLength * y,
                pxRowLength * (y + 1)
              );
            }
            return sum;
          };
          Filter.prototype._filterSub = function (pxData, y, rawData) {
            var pxRowLength = this._width << 2,
              rawRowLength = pxRowLength + 1,
              sum = 0;
            if (rawData) rawData[y * rawRowLength] = 1;
            for (var x = 0; x < pxRowLength; x++) {
              var left = x >= 4 ? pxData[y * pxRowLength + x - 4] : 0,
                val = pxData[y * pxRowLength + x] - left;
              if (!rawData) sum += Math.abs(val);
              else rawData[y * rawRowLength + 1 + x] = val;
            }
            return sum;
          };
          Filter.prototype._filterUp = function (pxData, y, rawData) {
            var pxRowLength = this._width << 2,
              rawRowLength = pxRowLength + 1,
              sum = 0;
            if (rawData) rawData[y * rawRowLength] = 2;
            for (var x = 0; x < pxRowLength; x++) {
              var up = y > 0 ? pxData[(y - 1) * pxRowLength + x] : 0,
                val = pxData[y * pxRowLength + x] - up;
              if (!rawData) sum += Math.abs(val);
              else rawData[y * rawRowLength + 1 + x] = val;
            }
            return sum;
          };
          Filter.prototype._filterAvg = function (pxData, y, rawData) {
            var pxRowLength = this._width << 2,
              rawRowLength = pxRowLength + 1,
              sum = 0;
            if (rawData) rawData[y * rawRowLength] = 3;
            for (var x = 0; x < pxRowLength; x++) {
              var left = x >= 4 ? pxData[y * pxRowLength + x - 4] : 0,
                up = y > 0 ? pxData[(y - 1) * pxRowLength + x] : 0,
                val = pxData[y * pxRowLength + x] - ((left + up) >> 1);
              if (!rawData) sum += Math.abs(val);
              else rawData[y * rawRowLength + 1 + x] = val;
            }
            return sum;
          };
          Filter.prototype._filterPaeth = function (pxData, y, rawData) {
            var pxRowLength = this._width << 2,
              rawRowLength = pxRowLength + 1,
              sum = 0;
            if (rawData) rawData[y * rawRowLength] = 4;
            for (var x = 0; x < pxRowLength; x++) {
              var left = x >= 4 ? pxData[y * pxRowLength + x - 4] : 0,
                up = y > 0 ? pxData[(y - 1) * pxRowLength + x] : 0,
                upLeft =
                  x >= 4 && y > 0 ? pxData[(y - 1) * pxRowLength + x - 4] : 0,
                val =
                  pxData[y * pxRowLength + x] -
                  PaethPredictor(left, up, upLeft);
              if (!rawData) sum += Math.abs(val);
              else rawData[y * rawRowLength + 1 + x] = val;
            }
            return sum;
          };
          var PaethPredictor = function (left, above, upLeft) {
            var p = left + above - upLeft,
              pLeft = Math.abs(p - left),
              pAbove = Math.abs(p - above),
              pUpLeft = Math.abs(p - upLeft);
            if (pLeft <= pAbove && pLeft <= pUpLeft) return left;
            else if (pAbove <= pUpLeft) return above;
            else return upLeft;
          };
        }.call(this, require("buffer").Buffer));
      },
      { "./chunkstream": 66, buffer: 16, util: 38, zlib: 15 },
    ],
    70: [
      function (require, module, exports) {
        (function (Buffer) {
          "use strict";
          var util = require("util"),
            Stream = require("stream"),
            zlib = require("zlib"),
            Filter = require("./filter"),
            CrcStream = require("./crc"),
            constants = require("./constants");
          var Packer = (module.exports = function (options) {
            Stream.call(this);
            this._options = options;
            options.deflateChunkSize = options.deflateChunkSize || 32 * 1024;
            options.deflateLevel = options.deflateLevel || 9;
            options.deflateStrategy = options.deflateStrategy || 3;
            this.readable = true;
          });
          util.inherits(Packer, Stream);
          Packer.prototype.pack = function (data, width, height) {
            this.emit("data", new Buffer(constants.PNG_SIGNATURE));
            this.emit("data", this._packIHDR(width, height));
            var filter = new Filter(width, height, 4, data, this._options);

            var data = filter.filter();
            var deflate = zlib.createDeflate({
              chunkSize: this._options.deflateChunkSize,
              level: this._options.deflateLevel,
              strategy: this._options.deflateStrategy,
            });
            deflate.on("error", this.emit.bind(this, "error"));
            deflate.on(
              "data",
              function (data) {
                this.emit("data", this._packIDAT(data));
              }.bind(this)
            );
            deflate.on(
              "end",
              function () {
                this.emit("data", this._packIEND());
                this.emit("end");
              }.bind(this)
            );
            deflate.end(data);
          };
          Packer.prototype._packChunk = function (type, data) {
            var len = data ? data.length : 0,
              buf = new Buffer(len + 12);
            buf.writeUInt32BE(len, 0);
            buf.writeUInt32BE(type, 4);
            if (data) data.copy(buf, 8);
            buf.writeInt32BE(
              CrcStream.crc32(buf.slice(4, buf.length - 4)),
              buf.length - 4
            );
            return buf;
          };
          Packer.prototype._packIHDR = function (width, height) {
            var buf = new Buffer(13);
            buf.writeUInt32BE(width, 0);
            buf.writeUInt32BE(height, 4);
            buf[8] = 8;
            buf[9] = 6;
            buf[10] = 0;
            buf[11] = 0;
            buf[12] = 0;
            return this._packChunk(constants.TYPE_IHDR, buf);
          };
          Packer.prototype._packIDAT = function (data) {
            return this._packChunk(constants.TYPE_IDAT, data);
          };
          Packer.prototype._packIEND = function () {
            return this._packChunk(constants.TYPE_IEND, null);
          };
        }.call(this, require("buffer").Buffer));
      },
      {
        "./constants": 67,
        "./crc": 68,
        "./filter": 69,
        buffer: 16,
        stream: 35,
        util: 38,
        zlib: 15,
      },
    ],
    71: [
      function (require, module, exports) {
        (function (Buffer) {
          "use strict";
          var util = require("util"),
            zlib = require("zlib"),
            CrcStream = require("./crc"),
            ChunkStream = require("./chunkstream"),
            constants = require("./constants"),
            Filter = require("./filter");
          var Parser = (module.exports = function (options) {
            ChunkStream.call(this);
            this._options = options;
            options.checkCRC = options.checkCRC !== false;
            this._hasIHDR = false;
            this._hasIEND = false;
            this._inflate = null;
            this._filter = null;
            this._crc = null;
            this._palette = [];
            this._colorType = 0;
            this._chunks = {};
            this._chunks[constants.TYPE_IHDR] = this._handleIHDR.bind(this);
            this._chunks[constants.TYPE_IEND] = this._handleIEND.bind(this);
            this._chunks[constants.TYPE_IDAT] = this._handleIDAT.bind(this);
            this._chunks[constants.TYPE_PLTE] = this._handlePLTE.bind(this);
            this._chunks[constants.TYPE_tRNS] = this._handleTRNS.bind(this);
            this._chunks[constants.TYPE_gAMA] = this._handleGAMA.bind(this);
            this.writable = true;
            this.on("error", this._handleError.bind(this));
            this._handleSignature();
          });
          util.inherits(Parser, ChunkStream);
          Parser.prototype._handleError = function () {
            this.writable = false;
            this.destroy();
            if (this._inflate) this._inflate.destroy();
          };
          Parser.prototype._handleSignature = function () {
            this.read(
              constants.PNG_SIGNATURE.length,
              this._parseSignature.bind(this)
            );
          };
          Parser.prototype._parseSignature = function (data) {
            var signature = constants.PNG_SIGNATURE;
            for (var i = 0; i < signature.length; i++) {
              if (data[i] != signature[i]) {
                this.emit("error", new Error("Invalid file signature"));
                return;
              }
            }
            this.read(8, this._parseChunkBegin.bind(this));
          };
          Parser.prototype._parseChunkBegin = function (data) {
            var length = data.readUInt32BE(0);
            var type = data.readUInt32BE(4),
              name = "";
            for (var i = 4; i < 8; i++) name += String.fromCharCode(data[i]);
            var ancillary = !!(data[4] & 32),
              priv = !!(data[5] & 32),
              safeToCopy = !!(data[7] & 32);
            if (!this._hasIHDR && type != constants.TYPE_IHDR) {
              this.emit("error", new Error("Expected IHDR on beggining"));
              return;
            }
            this._crc = new CrcStream();
            this._crc.write(new Buffer(name));
            if (this._chunks[type]) {
              return this._chunks[type](length);
            } else if (!ancillary) {
              this.emit(
                "error",
                new Error("Unsupported critical chunk type " + name)
              );
              return;
            } else {
              this.read(length + 4, this._skipChunk.bind(this));
            }
          };
          Parser.prototype._skipChunk = function (data) {
            this.read(8, this._parseChunkBegin.bind(this));
          };
          Parser.prototype._handleChunkEnd = function () {
            this.read(4, this._parseChunkEnd.bind(this));
          };
          Parser.prototype._parseChunkEnd = function (data) {
            var fileCrc = data.readInt32BE(0),
              calcCrc = this._crc.crc32();
            if (this._options.checkCRC && calcCrc != fileCrc) {
              this.emit("error", new Error("Crc error"));
              return;
            }
            if (this._hasIEND) {
              this.destroySoon();
            } else {
              this.read(8, this._parseChunkBegin.bind(this));
            }
          };
          Parser.prototype._handleIHDR = function (length) {
            this.read(length, this._parseIHDR.bind(this));
          };
          Parser.prototype._parseIHDR = function (data) {
            this._crc.write(data);
            var width = data.readUInt32BE(0),
              height = data.readUInt32BE(4),
              depth = data[8],
              colorType = data[9],
              compr = data[10],
              filter = data[11],
              interlace = data[12];
            if (depth != 8) {
              this.emit("error", new Error("Unsupported bit depth " + depth));
              return;
            }
            if (!(colorType in colorTypeToBppMap)) {
              this.emit("error", new Error("Unsupported color type"));
              return;
            }
            if (compr != 0) {
              this.emit("error", new Error("Unsupported compression method"));
              return;
            }
            if (filter != 0) {
              this.emit("error", new Error("Unsupported filter method"));
              return;
            }
            if (interlace != 0) {
              this.emit("error", new Error("Unsupported interlace method"));
              return;
            }
            this._colorType = colorType;
            this._data = new Buffer(width * height * 4);
            this._filter = new Filter(
              width,
              height,
              colorTypeToBppMap[this._colorType],
              this._data,
              this._options
            );
            this._hasIHDR = true;
            this.emit("metadata", {
              width: width,
              height: height,
              palette: !!(colorType & constants.COLOR_PALETTE),
              color: !!(colorType & constants.COLOR_COLOR),
              alpha: !!(colorType & constants.COLOR_ALPHA),
              data: this._data,
            });
            this._handleChunkEnd();
          };
          Parser.prototype._handlePLTE = function (length) {
            this.read(length, this._parsePLTE.bind(this));
          };
          Parser.prototype._parsePLTE = function (data) {
            this._crc.write(data);
            var entries = Math.floor(data.length / 3);
            for (var i = 0; i < entries; i++) {
              this._palette.push([
                data.readUInt8(i * 3),
                data.readUInt8(i * 3 + 1),
                data.readUInt8(i * 3 + 2),
                255,
              ]);
            }
            this._handleChunkEnd();
          };
          Parser.prototype._handleTRNS = function (length) {
            this.read(length, this._parseTRNS.bind(this));
          };
          Parser.prototype._parseTRNS = function (data) {
            this._crc.write(data);
            if (this._colorType == 3) {
              if (this._palette.length == 0) {
                this.emit(
                  "error",
                  new Error("Transparency chunk must be after palette")
                );
                return;
              }
              if (data.length > this._palette.length) {
                this.emit(
                  "error",
                  new Error("More transparent colors than palette size")
                );
                return;
              }
              for (var i = 0; i < this._palette.length; i++) {
                this._palette[i][3] = i < data.length ? data.readUInt8(i) : 255;
              }
            }
            this._handleChunkEnd();
          };
          Parser.prototype._handleGAMA = function (length) {
            this.read(length, this._parseGAMA.bind(this));
          };
          Parser.prototype._parseGAMA = function (data) {
            this._crc.write(data);
            this.emit("gamma", data.readUInt32BE(0) / 1e5);
            this._handleChunkEnd();
          };
          Parser.prototype._handleIDAT = function (length) {
            this.read(-length, this._parseIDAT.bind(this, length));
          };
          Parser.prototype._parseIDAT = function (length, data) {
            this._crc.write(data);
            if (this._colorType == 3 && this._palette.length == 0)
              throw new Error("Expected palette not found");
            if (!this._inflate) {
              this._inflate = zlib.createInflate();
              this._inflate.on("error", this.emit.bind(this, "error"));
              this._filter.on("complete", this._reverseFiltered.bind(this));
              this._inflate.pipe(this._filter);
            }
            this._inflate.write(data);
            length -= data.length;
            if (length > 0) this._handleIDAT(length);
            else this._handleChunkEnd();
          };
          Parser.prototype._handleIEND = function (length) {
            this.read(length, this._parseIEND.bind(this));
          };
          Parser.prototype._parseIEND = function (data) {
            this._crc.write(data);
            this._inflate.end();
            this._hasIEND = true;
            this._handleChunkEnd();
          };
          var colorTypeToBppMap = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
          Parser.prototype._reverseFiltered = function (data, width, height) {
            if (this._colorType == 3) {
              var pxLineLength = width << 2;
              for (var y = 0; y < height; y++) {
                var pxRowPos = y * pxLineLength;
                for (var x = 0; x < width; x++) {
                  var pxPos = pxRowPos + (x << 2),
                    color = this._palette[data[pxPos]];
                  for (var i = 0; i < 4; i++) data[pxPos + i] = color[i];
                }
              }
            }
            this.emit("parsed", data);
          };
        }.call(this, require("buffer").Buffer));
      },
      {
        "./chunkstream": 66,
        "./constants": 67,
        "./crc": 68,
        "./filter": 69,
        buffer: 16,
        util: 38,
        zlib: 15,
      },
    ],
    72: [
      function (require, module, exports) {
        (function (process, Buffer) {
          "use strict";
          var util = require("util"),
            Stream = require("stream"),
            Parser = require("./parser"),
            Packer = require("./packer");
          var PNG = (exports.PNG = function (options) {
            Stream.call(this);
            options = options || {};
            this.width = options.width || 0;
            this.height = options.height || 0;
            this.data =
              this.width > 0 && this.height > 0
                ? new Buffer(4 * this.width * this.height)
                : null;
            this.gamma = 0;
            this.readable = this.writable = true;
            this._parser = new Parser(options || {});
            this._parser.on("error", this.emit.bind(this, "error"));
            this._parser.on("close", this._handleClose.bind(this));
            this._parser.on("metadata", this._metadata.bind(this));
            this._parser.on("gamma", this._gamma.bind(this));
            this._parser.on(
              "parsed",
              function (data) {
                this.data = data;
                this.emit("parsed", data);
              }.bind(this)
            );
            this._packer = new Packer(options);
            this._packer.on("data", this.emit.bind(this, "data"));
            this._packer.on("end", this.emit.bind(this, "end"));
            this._parser.on("close", this._handleClose.bind(this));
            this._packer.on("error", this.emit.bind(this, "error"));
          });
          util.inherits(PNG, Stream);
          PNG.prototype.pack = function () {
            process.nextTick(
              function () {
                this._packer.pack(this.data, this.width, this.height);
              }.bind(this)
            );
            return this;
          };
          PNG.prototype.parse = function (data, callback) {
            if (callback) {
              var onParsed = null,
                onError = null;
              this.once(
                "parsed",
                (onParsed = function (data) {
                  this.removeListener("error", onError);
                  this.data = data;
                  callback(null, this);
                }.bind(this))
              );
              this.once(
                "error",
                (onError = function (err) {
                  this.removeListener("parsed", onParsed);
                  callback(err, null);
                }.bind(this))
              );
            }
            this.end(data);
            return this;
          };
          PNG.prototype.write = function (data) {
            this._parser.write(data);
            return true;
          };
          PNG.prototype.end = function (data) {
            this._parser.end(data);
          };
          PNG.prototype._metadata = function (metadata) {
            this.width = metadata.width;
            this.height = metadata.height;
            this.data = metadata.data;
            delete metadata.data;
            this.emit("metadata", metadata);
          };
          PNG.prototype._gamma = function (gamma) {
            this.gamma = gamma;
          };
          PNG.prototype._handleClose = function () {
            if (!this._parser.writable && !this._packer.readable)
              this.emit("close");
          };
          PNG.prototype.bitblt = function (dst, sx, sy, w, h, dx, dy) {
            var src = this;
            if (
              sx > src.width ||
              sy > src.height ||
              sx + w > src.width ||
              sy + h > src.height
            )
              throw new Error("bitblt reading outside image");
            if (
              dx > dst.width ||
              dy > dst.height ||
              dx + w > dst.width ||
              dy + h > dst.height
            )
              throw new Error("bitblt writing outside image");
            for (var y = 0; y < h; y++) {
              src.data.copy(
                dst.data,
                ((dy + y) * dst.width + dx) << 2,
                ((sy + y) * src.width + sx) << 2,
                ((sy + y) * src.width + sx + w) << 2
              );
            }
            return this;
          };
        }.call(this, require("_process"), require("buffer").Buffer));
      },
      {
        "./packer": 70,
        "./parser": 71,
        _process: 23,
        buffer: 16,
        stream: 35,
        util: 38,
      },
    ],
    73: [
      function (require, module, exports) {
        (function (process) {
          var Stream = require("stream");
          exports = module.exports = through;
          through.through = through;
          function through(write, end, opts) {
            write =
              write ||
              function (data) {
                this.queue(data);
              };
            end =
              end ||
              function () {
                this.queue(null);
              };
            var ended = false,
              destroyed = false,
              buffer = [],
              _ended = false;
            var stream = new Stream();
            stream.readable = stream.writable = true;
            stream.paused = false;
            stream.autoDestroy = !(opts && opts.autoDestroy === false);
            stream.write = function (data) {
              write.call(this, data);
              return !stream.paused;
            };
            function drain() {
              while (buffer.length && !stream.paused) {
                var data = buffer.shift();
                if (null === data) return stream.emit("end");
                else stream.emit("data", data);
              }
            }
            stream.queue = stream.push = function (data) {
              if (_ended) return stream;
              if (data === null) _ended = true;
              buffer.push(data);
              drain();
              return stream;
            };
            stream.on("end", function () {
              stream.readable = false;
              if (!stream.writable && stream.autoDestroy)
                process.nextTick(function () {
                  stream.destroy();
                });
            });
            function _end() {
              stream.writable = false;
              end.call(stream);
              if (!stream.readable && stream.autoDestroy) stream.destroy();
            }
            stream.end = function (data) {
              if (ended) return;
              ended = true;
              if (arguments.length) stream.write(data);
              _end();
              return stream;
            };
            stream.destroy = function () {
              if (destroyed) return;
              destroyed = true;
              ended = true;
              buffer.length = 0;
              stream.writable = stream.readable = false;
              stream.emit("close");
              return stream;
            };
            stream.pause = function () {
              if (stream.paused) return;
              stream.paused = true;
              return stream;
            };
            stream.resume = function () {
              if (stream.paused) {
                stream.paused = false;
                stream.emit("resume");
              }
              drain();
              if (!stream.paused) stream.emit("drain");
              return stream;
            };
            return stream;
          }
        }.call(this, require("_process")));
      },
      { _process: 23, stream: 35 },
    ],
    "save-pixels": [
      function (require, module, exports) {
        (function (Buffer) {
          "use strict";
          var ContentStream = require("contentstream");
          var GifEncoder = require("gif-encoder");
          var jpegJs = require("jpeg-js");
          var PNG = require("pngjs").PNG;
          var through = require("through");
          function handleData(array, data, frame) {
            var i,
              j,
              ptr = 0,
              c;
            if (array.shape.length === 4) {
              for (j = 0; j < array.shape[2]; ++j) {
                for (i = 0; i < array.shape[1]; ++i) {
                  data[ptr++] = array.get(frame, i, j, 0) >>> 0;
                  data[ptr++] = array.get(frame, i, j, 1) >>> 0;
                  data[ptr++] = array.get(frame, i, j, 2) >>> 0;
                  data[ptr++] = array.get(frame, i, j, 3) >>> 0;
                }
              }
            } else if (array.shape.length === 3) {
              if (array.shape[2] === 3) {
                for (j = 0; j < array.shape[1]; ++j) {
                  for (i = 0; i < array.shape[0]; ++i) {
                    data[ptr++] = array.get(i, j, 0) >>> 0;
                    data[ptr++] = array.get(i, j, 1) >>> 0;
                    data[ptr++] = array.get(i, j, 2) >>> 0;
                    data[ptr++] = 255;
                  }
                }
              } else if (array.shape[2] === 4) {
                for (j = 0; j < array.shape[1]; ++j) {
                  for (i = 0; i < array.shape[0]; ++i) {
                    data[ptr++] = array.get(i, j, 0) >>> 0;
                    data[ptr++] = array.get(i, j, 1) >>> 0;
                    data[ptr++] = array.get(i, j, 2) >>> 0;
                    data[ptr++] = array.get(i, j, 3) >>> 0;
                  }
                }
              } else if (array.shape[3] === 1) {
                for (j = 0; j < array.shape[1]; ++j) {
                  for (i = 0; i < array.shape[0]; ++i) {
                    var c = array.get(i, j, 0) >>> 0;
                    data[ptr++] = c;
                    data[ptr++] = c;
                    data[ptr++] = c;
                    data[ptr++] = 255;
                  }
                }
              } else {
                return new Error("Incompatible array shape");
              }
            } else if (array.shape.length === 2) {
              for (j = 0; j < array.shape[1]; ++j) {
                for (i = 0; i < array.shape[0]; ++i) {
                  var c = array.get(i, j, 0) >>> 0;
                  data[ptr++] = c;
                  data[ptr++] = c;
                  data[ptr++] = c;
                  data[ptr++] = 255;
                }
              }
            } else {
              return new Error("Incompatible array shape");
            }
            return data;
          }
          function haderror(err) {
            var result = through();
            result.emit("error", err);
            return result;
          }
          module.exports = function savePixels(array, type) {
            switch (type.toUpperCase()) {
              case "JPG":
              case ".JPG":
              case "JPEG":
              case ".JPEG":
              case "JPE":
              case ".JPE":
                var width = array.shape[0];
                var height = array.shape[1];
                var data = new Buffer(width * height * 4);
                data = handleData(array, data);
                var rawImageData = { data: data, width: width, height: height };
                var jpegImageData = jpegJs.encode(rawImageData);
                return new ContentStream(jpegImageData.data);
              case "GIF":
              case ".GIF":
                var frames = array.shape.length === 4 ? array.shape[0] : 1;
                var width =
                  array.shape.length === 4 ? array.shape[1] : array.shape[0];
                var height =
                  array.shape.length === 4 ? array.shape[2] : array.shape[1];
                var data = new Buffer(width * height * 4);
                var gif = new GifEncoder(width, height);
                gif.writeHeader();
                for (var i = 0; i < frames; i++) {
                  data = handleData(array, data, i);
                  gif.addFrame(data);
                }
                gif.finish();
                return gif;
              case "PNG":
              case ".PNG":
                var png = new PNG({
                  width: array.shape[0],
                  height: array.shape[1],
                });
                var data = handleData(array, png.data);
                if (typeof data === "Error") return haderror(data);
                png.data = data;
                return png.pack();
              case "CANVAS":
                var canvas = document.createElement("canvas");
                var context = canvas.getContext("2d");
                canvas.width = array.shape[0];
                canvas.height = array.shape[1];
                var imageData = context.getImageData(
                  0,
                  0,
                  canvas.width,
                  canvas.height
                );
                var data = imageData.data;
                data = handleData(array, data);
                if (typeof data === "Error") return haderror(data);
                context.putImageData(imageData, 0, 0);
                return canvas;
              default:
                return haderror(new Error("Unsupported file type: " + type));
            }
          };
        }.call(this, require("buffer").Buffer));
      },
      {
        buffer: 16,
        contentstream: 39,
        "gif-encoder": 50,
        "jpeg-js": 63,
        pngjs: 72,
        through: 73,
      },
    ],
  },
  {},
  []
);
require = (function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw ((f.code = "MODULE_NOT_FOUND"), f);
      }
      var l = (n[o] = { exports: {} });
      t[o][0].call(
        l.exports,
        function (e) {
          var n = t[o][1][e];
          return s(n ? n : e);
        },
        l,
        l.exports,
        e,
        t,
        n,
        r
      );
    }
    return n[o].exports;
  }
  var i = typeof require == "function" && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
})(
  {
    1: [
      function (require, module, exports) {
        "use strict";
        var createThunk = require("./lib/thunk.js");
        function Procedure() {
          this.argTypes = [];
          this.shimArgs = [];
          this.arrayArgs = [];
          this.arrayBlockIndices = [];
          this.scalarArgs = [];
          this.offsetArgs = [];
          this.offsetArgIndex = [];
          this.indexArgs = [];
          this.shapeArgs = [];
          this.funcName = "";
          this.pre = null;
          this.body = null;
          this.post = null;
          this.debug = false;
        }
        function compileCwise(user_args) {
          var proc = new Procedure();
          proc.pre = user_args.pre;
          proc.body = user_args.body;
          proc.post = user_args.post;
          var proc_args = user_args.args.slice(0);
          proc.argTypes = proc_args;
          for (var i = 0; i < proc_args.length; ++i) {
            var arg_type = proc_args[i];
            if (
              arg_type === "array" ||
              (typeof arg_type === "object" && arg_type.blockIndices)
            ) {
              proc.argTypes[i] = "array";
              proc.arrayArgs.push(i);
              proc.arrayBlockIndices.push(
                arg_type.blockIndices ? arg_type.blockIndices : 0
              );
              proc.shimArgs.push("array" + i);
              if (i < proc.pre.args.length && proc.pre.args[i].count > 0) {
                throw new Error(
                  "cwise: pre() block may not reference array args"
                );
              }
              if (i < proc.post.args.length && proc.post.args[i].count > 0) {
                throw new Error(
                  "cwise: post() block may not reference array args"
                );
              }
            } else if (arg_type === "scalar") {
              proc.scalarArgs.push(i);
              proc.shimArgs.push("scalar" + i);
            } else if (arg_type === "index") {
              proc.indexArgs.push(i);
              if (i < proc.pre.args.length && proc.pre.args[i].count > 0) {
                throw new Error(
                  "cwise: pre() block may not reference array index"
                );
              }
              if (i < proc.body.args.length && proc.body.args[i].lvalue) {
                throw new Error(
                  "cwise: body() block may not write to array index"
                );
              }
              if (i < proc.post.args.length && proc.post.args[i].count > 0) {
                throw new Error(
                  "cwise: post() block may not reference array index"
                );
              }
            } else if (arg_type === "shape") {
              proc.shapeArgs.push(i);
              if (i < proc.pre.args.length && proc.pre.args[i].lvalue) {
                throw new Error(
                  "cwise: pre() block may not write to array shape"
                );
              }
              if (i < proc.body.args.length && proc.body.args[i].lvalue) {
                throw new Error(
                  "cwise: body() block may not write to array shape"
                );
              }
              if (i < proc.post.args.length && proc.post.args[i].lvalue) {
                throw new Error(
                  "cwise: post() block may not write to array shape"
                );
              }
            } else if (typeof arg_type === "object" && arg_type.offset) {
              proc.argTypes[i] = "offset";
              proc.offsetArgs.push({
                array: arg_type.array,
                offset: arg_type.offset,
              });
              proc.offsetArgIndex.push(i);
            } else {
              throw new Error("cwise: Unknown argument type " + proc_args[i]);
            }
          }
          if (proc.arrayArgs.length <= 0) {
            throw new Error("cwise: No array arguments specified");
          }
          if (proc.pre.args.length > proc_args.length) {
            throw new Error("cwise: Too many arguments in pre() block");
          }
          if (proc.body.args.length > proc_args.length) {
            throw new Error("cwise: Too many arguments in body() block");
          }
          if (proc.post.args.length > proc_args.length) {
            throw new Error("cwise: Too many arguments in post() block");
          }
          proc.debug = !!user_args.printCode || !!user_args.debug;
          proc.funcName = user_args.funcName || "cwise";
          proc.blockSize = user_args.blockSize || 64;
          return createThunk(proc);
        }
        module.exports = compileCwise;
      },
      { "./lib/thunk.js": 3 },
    ],
    2: [
      function (require, module, exports) {
        "use strict";
        var uniq = require("uniq");
        function innerFill(order, proc, body) {
          var dimension = order.length,
            nargs = proc.arrayArgs.length,
            has_index = proc.indexArgs.length > 0,
            code = [],
            vars = [],
            idx = 0,
            pidx = 0,
            i,
            j;
          for (i = 0; i < dimension; ++i) {
            vars.push(["i", i, "=0"].join(""));
          }
          for (j = 0; j < nargs; ++j) {
            for (i = 0; i < dimension; ++i) {
              pidx = idx;
              idx = order[i];
              if (i === 0) {
                vars.push(["d", j, "s", i, "=t", j, "p", idx].join(""));
              } else {
                vars.push(
                  [
                    "d",
                    j,
                    "s",
                    i,
                    "=(t",
                    j,
                    "p",
                    idx,
                    "-s",
                    pidx,
                    "*t",
                    j,
                    "p",
                    pidx,
                    ")",
                  ].join("")
                );
              }
            }
          }
          code.push("var " + vars.join(","));
          for (i = dimension - 1; i >= 0; --i) {
            idx = order[i];
            code.push(
              ["for(i", i, "=0;i", i, "<s", idx, ";++i", i, "){"].join("")
            );
          }
          code.push(body);
          for (i = 0; i < dimension; ++i) {
            pidx = idx;
            idx = order[i];
            for (j = 0; j < nargs; ++j) {
              code.push(["p", j, "+=d", j, "s", i].join(""));
            }
            if (has_index) {
              if (i > 0) {
                code.push(["index[", pidx, "]-=s", pidx].join(""));
              }
              code.push(["++index[", idx, "]"].join(""));
            }
            code.push("}");
          }
          return code.join("\n");
        }
        function outerFill(matched, order, proc, body) {
          var dimension = order.length,
            nargs = proc.arrayArgs.length,
            blockSize = proc.blockSize,
            has_index = proc.indexArgs.length > 0,
            code = [];
          for (var i = 0; i < nargs; ++i) {
            code.push(["var offset", i, "=p", i].join(""));
          }
          for (var i = matched; i < dimension; ++i) {
            code.push(
              ["for(var j" + i + "=SS[", order[i], "]|0;j", i, ">0;){"].join("")
            );
            code.push(["if(j", i, "<", blockSize, "){"].join(""));
            code.push(["s", order[i], "=j", i].join(""));
            code.push(["j", i, "=0"].join(""));
            code.push(["}else{s", order[i], "=", blockSize].join(""));
            code.push(["j", i, "-=", blockSize, "}"].join(""));
            if (has_index) {
              code.push(["index[", order[i], "]=j", i].join(""));
            }
          }
          for (var i = 0; i < nargs; ++i) {
            var indexStr = ["offset" + i];
            for (var j = matched; j < dimension; ++j) {
              indexStr.push(["j", j, "*t", i, "p", order[j]].join(""));
            }
            code.push(["p", i, "=(", indexStr.join("+"), ")"].join(""));
          }
          code.push(innerFill(order, proc, body));
          for (var i = matched; i < dimension; ++i) {
            code.push("}");
          }
          return code.join("\n");
        }
        function countMatches(orders) {
          var matched = 0,
            dimension = orders[0].length;
          while (matched < dimension) {
            for (var j = 1; j < orders.length; ++j) {
              if (orders[j][matched] !== orders[0][matched]) {
                return matched;
              }
            }
            ++matched;
          }
          return matched;
        }
        function processBlock(block, proc, dtypes) {
          var code = block.body;
          var pre = [];
          var post = [];
          for (var i = 0; i < block.args.length; ++i) {
            var carg = block.args[i];
            if (carg.count <= 0) {
              continue;
            }
            var re = new RegExp(carg.name, "g");
            var ptrStr = "";
            var arrNum = proc.arrayArgs.indexOf(i);
            switch (proc.argTypes[i]) {
              case "offset":
                var offArgIndex = proc.offsetArgIndex.indexOf(i);
                var offArg = proc.offsetArgs[offArgIndex];
                arrNum = offArg.array;
                ptrStr = "+q" + offArgIndex;
              case "array":
                ptrStr = "p" + arrNum + ptrStr;
                var localStr = "l" + i;
                var arrStr = "a" + arrNum;
                if (proc.arrayBlockIndices[arrNum] === 0) {
                  if (carg.count === 1) {
                    if (dtypes[arrNum] === "generic") {
                      if (carg.lvalue) {
                        pre.push(
                          [
                            "var ",
                            localStr,
                            "=",
                            arrStr,
                            ".get(",
                            ptrStr,
                            ")",
                          ].join("")
                        );
                        code = code.replace(re, localStr);
                        post.push(
                          [arrStr, ".set(", ptrStr, ",", localStr, ")"].join("")
                        );
                      } else {
                        code = code.replace(
                          re,
                          [arrStr, ".get(", ptrStr, ")"].join("")
                        );
                      }
                    } else {
                      code = code.replace(
                        re,
                        [arrStr, "[", ptrStr, "]"].join("")
                      );
                    }
                  } else if (dtypes[arrNum] === "generic") {
                    pre.push(
                      [
                        "var ",
                        localStr,
                        "=",
                        arrStr,
                        ".get(",
                        ptrStr,
                        ")",
                      ].join("")
                    );
                    code = code.replace(re, localStr);
                    if (carg.lvalue) {
                      post.push(
                        [arrStr, ".set(", ptrStr, ",", localStr, ")"].join("")
                      );
                    }
                  } else {
                    pre.push(
                      ["var ", localStr, "=", arrStr, "[", ptrStr, "]"].join("")
                    );
                    code = code.replace(re, localStr);
                    if (carg.lvalue) {
                      post.push([arrStr, "[", ptrStr, "]=", localStr].join(""));
                    }
                  }
                } else {
                  var reStrArr = [carg.name],
                    ptrStrArr = [ptrStr];
                  for (
                    var j = 0;
                    j < Math.abs(proc.arrayBlockIndices[arrNum]);
                    j++
                  ) {
                    reStrArr.push("\\s*\\[([^\\]]+)\\]");
                    ptrStrArr.push("$" + (j + 1) + "*t" + arrNum + "b" + j);
                  }
                  re = new RegExp(reStrArr.join(""), "g");
                  ptrStr = ptrStrArr.join("+");
                  if (dtypes[arrNum] === "generic") {
                    throw new Error(
                      "cwise: Generic arrays not supported in combination with blocks!"
                    );
                  } else {
                    code = code.replace(
                      re,
                      [arrStr, "[", ptrStr, "]"].join("")
                    );
                  }
                }
                break;
              case "scalar":
                code = code.replace(re, "Y" + proc.scalarArgs.indexOf(i));
                break;
              case "index":
                code = code.replace(re, "index");
                break;
              case "shape":
                code = code.replace(re, "shape");
                break;
            }
          }
          return [pre.join("\n"), code, post.join("\n")].join("\n").trim();
        }
        function typeSummary(dtypes) {
          var summary = new Array(dtypes.length);
          var allEqual = true;
          for (var i = 0; i < dtypes.length; ++i) {
            var t = dtypes[i];
            var digits = t.match(/\d+/);
            if (!digits) {
              digits = "";
            } else {
              digits = digits[0];
            }
            if (t.charAt(0) === 0) {
              summary[i] = "u" + t.charAt(1) + digits;
            } else {
              summary[i] = t.charAt(0) + digits;
            }
            if (i > 0) {
              allEqual = allEqual && summary[i] === summary[i - 1];
            }
          }
          if (allEqual) {
            return summary[0];
          }
          return summary.join("");
        }
        function generateCWiseOp(proc, typesig) {
          var dimension =
            (typesig[1].length - Math.abs(proc.arrayBlockIndices[0])) | 0;
          var orders = new Array(proc.arrayArgs.length);
          var dtypes = new Array(proc.arrayArgs.length);
          for (var i = 0; i < proc.arrayArgs.length; ++i) {
            dtypes[i] = typesig[2 * i];
            orders[i] = typesig[2 * i + 1];
          }
          var blockBegin = [],
            blockEnd = [];
          var loopBegin = [],
            loopEnd = [];
          var loopOrders = [];
          for (var i = 0; i < proc.arrayArgs.length; ++i) {
            if (proc.arrayBlockIndices[i] < 0) {
              loopBegin.push(0);
              loopEnd.push(dimension);
              blockBegin.push(dimension);
              blockEnd.push(dimension + proc.arrayBlockIndices[i]);
            } else {
              loopBegin.push(proc.arrayBlockIndices[i]);
              loopEnd.push(proc.arrayBlockIndices[i] + dimension);
              blockBegin.push(0);
              blockEnd.push(proc.arrayBlockIndices[i]);
            }
            var newOrder = [];
            for (var j = 0; j < orders[i].length; j++) {
              if (loopBegin[i] <= orders[i][j] && orders[i][j] < loopEnd[i]) {
                newOrder.push(orders[i][j] - loopBegin[i]);
              }
            }
            loopOrders.push(newOrder);
          }
          var arglist = ["SS"];
          var code = ["'use strict'"];
          var vars = [];
          for (var j = 0; j < dimension; ++j) {
            vars.push(["s", j, "=SS[", j, "]"].join(""));
          }
          for (var i = 0; i < proc.arrayArgs.length; ++i) {
            arglist.push("a" + i);
            arglist.push("t" + i);
            arglist.push("p" + i);
            for (var j = 0; j < dimension; ++j) {
              vars.push(
                ["t", i, "p", j, "=t", i, "[", loopBegin[i] + j, "]"].join("")
              );
            }
            for (var j = 0; j < Math.abs(proc.arrayBlockIndices[i]); ++j) {
              vars.push(
                ["t", i, "b", j, "=t", i, "[", blockBegin[i] + j, "]"].join("")
              );
            }
          }
          for (var i = 0; i < proc.scalarArgs.length; ++i) {
            arglist.push("Y" + i);
          }
          if (proc.shapeArgs.length > 0) {
            vars.push("shape=SS.slice(0)");
          }
          if (proc.indexArgs.length > 0) {
            var zeros = new Array(dimension);
            for (var i = 0; i < dimension; ++i) {
              zeros[i] = "0";
            }
            vars.push(["index=[", zeros.join(","), "]"].join(""));
          }
          for (var i = 0; i < proc.offsetArgs.length; ++i) {
            var off_arg = proc.offsetArgs[i];
            var init_string = [];
            for (var j = 0; j < off_arg.offset.length; ++j) {
              if (off_arg.offset[j] === 0) {
                continue;
              } else if (off_arg.offset[j] === 1) {
                init_string.push(["t", off_arg.array, "p", j].join(""));
              } else {
                init_string.push(
                  [off_arg.offset[j], "*t", off_arg.array, "p", j].join("")
                );
              }
            }
            if (init_string.length === 0) {
              vars.push("q" + i + "=0");
            } else {
              vars.push(["q", i, "=", init_string.join("+")].join(""));
            }
          }
          var thisVars = uniq(
            []
              .concat(proc.pre.thisVars)
              .concat(proc.body.thisVars)
              .concat(proc.post.thisVars)
          );
          vars = vars.concat(thisVars);
          code.push("var " + vars.join(","));
          for (var i = 0; i < proc.arrayArgs.length; ++i) {
            code.push("p" + i + "|=0");
          }
          if (proc.pre.body.length > 3) {
            code.push(processBlock(proc.pre, proc, dtypes));
          }
          var body = processBlock(proc.body, proc, dtypes);
          var matched = countMatches(loopOrders);
          if (matched < dimension) {
            code.push(outerFill(matched, loopOrders[0], proc, body));
          } else {
            code.push(innerFill(loopOrders[0], proc, body));
          }
          if (proc.post.body.length > 3) {
            code.push(processBlock(proc.post, proc, dtypes));
          }
          if (proc.debug) {
            console.log(
              "-----Generated cwise routine for ",
              typesig,
              ":\n" + code.join("\n") + "\n----------"
            );
          }
          var loopName = [
            proc.funcName || "unnamed",
            "_cwise_loop_",
            orders[0].join("s"),
            "m",
            matched,
            typeSummary(dtypes),
          ].join("");
          var f = new Function(
            [
              "function ",
              loopName,
              "(",
              arglist.join(","),
              "){",
              code.join("\n"),
              "} return ",
              loopName,
            ].join("")
          );
          return f();
        }
        module.exports = generateCWiseOp;
      },
      { uniq: 4 },
    ],
    3: [
      function (require, module, exports) {
        "use strict";
        var compile = require("./compile.js");
        function createThunk(proc) {
          var code = ["'use strict'", "var CACHED={}"];
          var vars = [];
          var thunkName = proc.funcName + "_cwise_thunk";
          code.push(
            [
              "return function ",
              thunkName,
              "(",
              proc.shimArgs.join(","),
              "){",
            ].join("")
          );
          var typesig = [];
          var string_typesig = [];
          var proc_args = [
            [
              "array",
              proc.arrayArgs[0],
              ".shape.slice(",
              Math.max(0, proc.arrayBlockIndices[i]),
              proc.arrayBlockIndices[i] < 0
                ? "," + proc.arrayBlockIndices[i] + ")"
                : ")",
            ].join(""),
          ];
          for (var i = 0; i < proc.arrayArgs.length; ++i) {
            var j = proc.arrayArgs[i];
            vars.push(
              [
                "t",
                j,
                "=array",
                j,
                ".dtype,",
                "r",
                j,
                "=array",
                j,
                ".order",
              ].join("")
            );
            typesig.push("t" + j);
            typesig.push("r" + j);
            string_typesig.push("t" + j);
            string_typesig.push("r" + j + ".join()");
            proc_args.push("array" + j + ".data");
            proc_args.push("array" + j + ".stride");
            proc_args.push("array" + j + ".offset|0");
          }
          for (var i = 0; i < proc.scalarArgs.length; ++i) {
            proc_args.push("scalar" + proc.scalarArgs[i]);
          }
          vars.push(["type=[", string_typesig.join(","), "].join()"].join(""));
          vars.push("proc=CACHED[type]");
          code.push("var " + vars.join(","));
          code.push(
            [
              "if(!proc){",
              "CACHED[type]=proc=compile([",
              typesig.join(","),
              "])}",
              "return proc(",
              proc_args.join(","),
              ")}",
            ].join("")
          );
          if (proc.debug) {
            console.log(
              "-----Generated thunk:\n" + code.join("\n") + "\n----------"
            );
          }
          var thunk = new Function("compile", code.join("\n"));
          return thunk(compile.bind(undefined, proc));
        }
        module.exports = createThunk;
      },
      { "./compile.js": 2 },
    ],
    4: [
      function (require, module, exports) {
        "use strict";
        function unique_pred(list, compare) {
          var ptr = 1,
            len = list.length,
            a = list[0],
            b = list[0];
          for (var i = 1; i < len; ++i) {
            b = a;
            a = list[i];
            if (compare(a, b)) {
              if (i === ptr) {
                ptr++;
                continue;
              }
              list[ptr++] = a;
            }
          }
          list.length = ptr;
          return list;
        }
        function unique_eq(list) {
          var ptr = 1,
            len = list.length,
            a = list[0],
            b = list[0];
          for (var i = 1; i < len; ++i, b = a) {
            b = a;
            a = list[i];
            if (a !== b) {
              if (i === ptr) {
                ptr++;
                continue;
              }
              list[ptr++] = a;
            }
          }
          list.length = ptr;
          return list;
        }
        function unique(list, compare, sorted) {
          if (list.length === 0) {
            return list;
          }
          if (compare) {
            if (!sorted) {
              list.sort(compare);
            }
            return unique_pred(list, compare);
          }
          if (!sorted) {
            list.sort();
          }
          return unique_eq(list);
        }
        module.exports = unique;
      },
      {},
    ],
    5: [
      function (require, module, exports) {
        "use strict";
        var esprima = require("esprima");
        var uniq = require("uniq");
        var PREFIX_COUNTER = 0;
        function CompiledArgument(name, lvalue, rvalue) {
          this.name = name;
          this.lvalue = lvalue;
          this.rvalue = rvalue;
          this.count = 0;
        }
        function CompiledRoutine(body, args, thisVars, localVars) {
          this.body = body;
          this.args = args;
          this.thisVars = thisVars;
          this.localVars = localVars;
        }
        function isGlobal(identifier) {
          if (identifier === "eval") {
            throw new Error("cwise-parser: eval() not allowed");
          }
          if (typeof window !== "undefined") {
            return identifier in window;
          } else if (typeof GLOBAL !== "undefined") {
            return identifier in GLOBAL;
          } else if (typeof self !== "undefined") {
            return identifier in self;
          } else {
            return false;
          }
        }
        function getArgNames(ast) {
          var params = ast.body[0].expression.callee.params;
          var names = new Array(params.length);
          for (var i = 0; i < params.length; ++i) {
            names[i] = params[i].name;
          }
          return names;
        }
        function preprocess(func) {
          var src = ["(", func, ")()"].join("");
          var ast = esprima.parse(src, { range: true });
          var prefix = "_inline_" + PREFIX_COUNTER++ + "_";
          var argNames = getArgNames(ast);
          var compiledArgs = new Array(argNames.length);
          for (var i = 0; i < argNames.length; ++i) {
            compiledArgs[i] = new CompiledArgument(
              [prefix, "arg", i, "_"].join(""),
              false,
              false
            );
          }
          var exploded = new Array(src.length);
          for (var i = 0, n = src.length; i < n; ++i) {
            exploded[i] = src.charAt(i);
          }
          var localVars = [];
          var thisVars = [];
          var computedThis = false;
          function createLocal(id) {
            var nstr = prefix + id.replace(/\_/g, "__");
            localVars.push(nstr);
            return nstr;
          }
          function createThisVar(id) {
            var nstr = "this_" + id.replace(/\_/g, "__");
            thisVars.push(nstr);
            return nstr;
          }
          function rewrite(node, nstr) {
            var lo = node.range[0],
              hi = node.range[1];
            for (var i = lo + 1; i < hi; ++i) {
              exploded[i] = "";
            }
            exploded[lo] = nstr;
          }
          function escapeString(str) {
            return "'" + str.replace(/\_/g, "\\_").replace(/\'/g, "'") + "'";
          }
          function source(node) {
            return exploded.slice(node.range[0], node.range[1]).join("");
          }
          var LVALUE = 1;
          var RVALUE = 2;
          function getUsage(node) {
            if (node.parent.type === "AssignmentExpression") {
              if (node.parent.left === node) {
                if (node.parent.operator === "=") {
                  return LVALUE;
                }
                return LVALUE | RVALUE;
              }
            }
            if (node.parent.type === "UpdateExpression") {
              return LVALUE | RVALUE;
            }
            return RVALUE;
          }
          (function visit(node, parent) {
            node.parent = parent;
            if (node.type === "MemberExpression") {
              if (node.computed) {
                visit(node.object, node);
                visit(node.property, node);
              } else if (node.object.type === "ThisExpression") {
                rewrite(node, createThisVar(node.property.name));
              } else {
                visit(node.object, node);
              }
            } else if (node.type === "ThisExpression") {
              throw new Error("cwise-parser: Computed this is not allowed");
            } else if (node.type === "Identifier") {
              var name = node.name;
              var argNo = argNames.indexOf(name);
              if (argNo >= 0) {
                var carg = compiledArgs[argNo];
                var usage = getUsage(node);
                if (usage & LVALUE) {
                  carg.lvalue = true;
                }
                if (usage & RVALUE) {
                  carg.rvalue = true;
                }
                ++carg.count;
                rewrite(node, carg.name);
              } else if (isGlobal(name)) {
              } else {
                rewrite(node, createLocal(name));
              }
            } else if (node.type === "Literal") {
              if (typeof node.value === "string") {
                rewrite(node, escapeString(node.value));
              }
            } else if (node.type === "WithStatement") {
              throw new Error("cwise-parser: with() statements not allowed");
            } else {
              var keys = Object.keys(node);
              for (var i = 0, n = keys.length; i < n; ++i) {
                if (keys[i] === "parent") {
                  continue;
                }
                var value = node[keys[i]];
                if (value) {
                  if (value instanceof Array) {
                    for (var j = 0; j < value.length; ++j) {
                      if (value[j] && typeof value[j].type === "string") {
                        visit(value[j], node);
                      }
                    }
                  } else if (typeof value.type === "string") {
                    visit(value, node);
                  }
                }
              }
            }
          })(ast.body[0].expression.callee.body, undefined);
          uniq(localVars);
          uniq(thisVars);
          var routine = new CompiledRoutine(
            source(ast.body[0].expression.callee.body),
            compiledArgs,
            thisVars,
            localVars
          );
          return routine;
        }
        module.exports = preprocess;
      },
      { esprima: 6, uniq: 7 },
    ],
    6: [
      function (require, module, exports) {
        (function (root, factory) {
          "use strict";
          if (typeof define === "function" && define.amd) {
            define(["exports"], factory);
          } else if (typeof exports !== "undefined") {
            factory(exports);
          } else {
            factory((root.esprima = {}));
          }
        })(this, function (exports) {
          "use strict";
          var Token,
            TokenName,
            Syntax,
            PropertyKind,
            Messages,
            Regex,
            source,
            strict,
            index,
            lineNumber,
            lineStart,
            length,
            buffer,
            state,
            extra;
          Token = {
            BooleanLiteral: 1,
            EOF: 2,
            Identifier: 3,
            Keyword: 4,
            NullLiteral: 5,
            NumericLiteral: 6,
            Punctuator: 7,
            StringLiteral: 8,
          };
          TokenName = {};
          TokenName[Token.BooleanLiteral] = "Boolean";
          TokenName[Token.EOF] = "<end>";
          TokenName[Token.Identifier] = "Identifier";
          TokenName[Token.Keyword] = "Keyword";
          TokenName[Token.NullLiteral] = "Null";
          TokenName[Token.NumericLiteral] = "Numeric";
          TokenName[Token.Punctuator] = "Punctuator";
          TokenName[Token.StringLiteral] = "String";
          Syntax = {
            AssignmentExpression: "AssignmentExpression",
            ArrayExpression: "ArrayExpression",
            BlockStatement: "BlockStatement",
            BinaryExpression: "BinaryExpression",
            BreakStatement: "BreakStatement",
            CallExpression: "CallExpression",
            CatchClause: "CatchClause",
            ConditionalExpression: "ConditionalExpression",
            ContinueStatement: "ContinueStatement",
            DoWhileStatement: "DoWhileStatement",
            DebuggerStatement: "DebuggerStatement",
            EmptyStatement: "EmptyStatement",
            ExpressionStatement: "ExpressionStatement",
            ForStatement: "ForStatement",
            ForInStatement: "ForInStatement",
            FunctionDeclaration: "FunctionDeclaration",
            FunctionExpression: "FunctionExpression",
            Identifier: "Identifier",
            IfStatement: "IfStatement",
            Literal: "Literal",
            LabeledStatement: "LabeledStatement",
            LogicalExpression: "LogicalExpression",
            MemberExpression: "MemberExpression",
            NewExpression: "NewExpression",
            ObjectExpression: "ObjectExpression",
            Program: "Program",
            Property: "Property",
            ReturnStatement: "ReturnStatement",
            SequenceExpression: "SequenceExpression",
            SwitchStatement: "SwitchStatement",
            SwitchCase: "SwitchCase",
            ThisExpression: "ThisExpression",
            ThrowStatement: "ThrowStatement",
            TryStatement: "TryStatement",
            UnaryExpression: "UnaryExpression",
            UpdateExpression: "UpdateExpression",
            VariableDeclaration: "VariableDeclaration",
            VariableDeclarator: "VariableDeclarator",
            WhileStatement: "WhileStatement",
            WithStatement: "WithStatement",
          };
          PropertyKind = { Data: 1, Get: 2, Set: 4 };
          Messages = {
            UnexpectedToken: "Unexpected token %0",
            UnexpectedNumber: "Unexpected number",
            UnexpectedString: "Unexpected string",
            UnexpectedIdentifier: "Unexpected identifier",
            UnexpectedReserved: "Unexpected reserved word",
            UnexpectedEOS: "Unexpected end of input",
            NewlineAfterThrow: "Illegal newline after throw",
            InvalidRegExp: "Invalid regular expression",
            UnterminatedRegExp: "Invalid regular expression: missing /",
            InvalidLHSInAssignment: "Invalid left-hand side in assignment",
            InvalidLHSInForIn: "Invalid left-hand side in for-in",
            MultipleDefaultsInSwitch:
              "More than one default clause in switch statement",
            NoCatchOrFinally: "Missing catch or finally after try",
            UnknownLabel: "Undefined label '%0'",
            Redeclaration: "%0 '%1' has already been declared",
            IllegalContinue: "Illegal continue statement",
            IllegalBreak: "Illegal break statement",
            IllegalReturn: "Illegal return statement",
            StrictModeWith: "Strict mode code may not include a with statement",
            StrictCatchVariable:
              "Catch variable may not be eval or arguments in strict mode",
            StrictVarName:
              "Variable name may not be eval or arguments in strict mode",
            StrictParamName:
              "Parameter name eval or arguments is not allowed in strict mode",
            StrictParamDupe:
              "Strict mode function may not have duplicate parameter names",
            StrictFunctionName:
              "Function name may not be eval or arguments in strict mode",
            StrictOctalLiteral:
              "Octal literals are not allowed in strict mode.",
            StrictDelete: "Delete of an unqualified identifier in strict mode.",
            StrictDuplicateProperty:
              "Duplicate data property in object literal not allowed in strict mode",
            AccessorDataProperty:
              "Object literal may not have data and accessor property with the same name",
            AccessorGetSet:
              "Object literal may not have multiple get/set accessors with the same name",
            StrictLHSAssignment:
              "Assignment to eval or arguments is not allowed in strict mode",
            StrictLHSPostfix:
              "Postfix increment/decrement may not have eval or arguments operand in strict mode",
            StrictLHSPrefix:
              "Prefix increment/decrement may not have eval or arguments operand in strict mode",
            StrictReservedWord: "Use of future reserved word in strict mode",
          };
          Regex = {
            NonAsciiIdentifierStart: new RegExp(
              "[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]"
            ),
            NonAsciiIdentifierPart: new RegExp(
              "[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮ̀-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧԱ-Ֆՙա-և֑-ׇֽֿׁׂׅׄא-תװ-ײؐ-ؚؠ-٩ٮ-ۓە-ۜ۟-۪ۨ-ۼۿܐ-݊ݍ-ޱ߀-ߵߺࠀ-࠭ࡀ-࡛ࢠࢢ-ࢬࣤ-ࣾऀ-ॣ०-९ॱ-ॷॹ-ॿঁ-ঃঅ-ঌএঐও-নপ-রলশ-হ়-ৄেৈো-ৎৗড়ঢ়য়-ৣ০-ৱਁ-ਃਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹ਼ਾ-ੂੇੈੋ-੍ੑਖ਼-ੜਫ਼੦-ੵઁ-ઃઅ-ઍએ-ઑઓ-નપ-રલળવ-હ઼-ૅે-ૉો-્ૐૠ-ૣ૦-૯ଁ-ଃଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହ଼-ୄେୈୋ-୍ୖୗଡ଼ଢ଼ୟ-ୣ୦-୯ୱஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-்ௐௗ௦-௯ఁ-ఃఅ-ఌఎ-ఐఒ-నప-ళవ-హఽ-ౄె-ైొ-్ౕౖౘౙౠ-ౣ౦-౯ಂಃಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹ಼-ೄೆ-ೈೊ-್ೕೖೞೠ-ೣ೦-೯ೱೲംഃഅ-ഌഎ-ഐഒ-ഺഽ-ൄെ-ൈൊ-ൎൗൠ-ൣ൦-൯ൺ-ൿංඃඅ-ඖක-නඳ-රලව-ෆ්ා-ුූෘ-ෟෲෳก-ฺเ-๎๐-๙ກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ູົ-ຽເ-ໄໆ່-ໍ໐-໙ໜ-ໟༀ༘༙༠-༩༹༵༷༾-ཇཉ-ཬཱ-྄྆-ྗྙ-ྼ࿆က-၉ၐ-ႝႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ፝-፟ᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-᜔ᜠ-᜴ᝀ-ᝓᝠ-ᝬᝮ-ᝰᝲᝳក-៓ៗៜ៝០-៩᠋-᠍᠐-᠙ᠠ-ᡷᢀ-ᢪᢰ-ᣵᤀ-ᤜᤠ-ᤫᤰ-᤻᥆-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉ᧐-᧙ᨀ-ᨛᨠ-ᩞ᩠-᩿᩼-᪉᪐-᪙ᪧᬀ-ᭋ᭐-᭙᭫-᭳ᮀ-᯳ᰀ-᰷᱀-᱉ᱍ-ᱽ᳐-᳔᳒-ᳶᴀ-ᷦ᷼-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ‌‍‿⁀⁔ⁱⁿₐ-ₜ⃐-⃥⃜⃡-⃰ℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯ⵿-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⷠ-ⷿⸯ々-〇〡-〯〱-〵〸-〼ぁ-ゖ゙゚ゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘫꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ-꛱ꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠧꡀ-ꡳꢀ-꣄꣐-꣙꣠-ꣷꣻ꤀-꤭ꤰ-꥓ꥠ-ꥼꦀ-꧀ꧏ-꧙ꨀ-ꨶꩀ-ꩍ꩐-꩙ꩠ-ꩶꩺꩻꪀ-ꫂꫛ-ꫝꫠ-ꫯꫲ-꫶ꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯪ꯬꯭꯰-꯹가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻ︀-️︠-︦︳︴﹍-﹏ﹰ-ﹴﹶ-ﻼ０-９Ａ-Ｚ＿ａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]"
            ),
          };
          function assert(condition, message) {
            if (!condition) {
              throw new Error("ASSERT: " + message);
            }
          }
          function sliceSource(from, to) {
            return source.slice(from, to);
          }
          if (typeof "esprima"[0] === "undefined") {
            sliceSource = function sliceArraySource(from, to) {
              return source.slice(from, to).join("");
            };
          }
          function isDecimalDigit(ch) {
            return "0123456789".indexOf(ch) >= 0;
          }
          function isHexDigit(ch) {
            return "0123456789abcdefABCDEF".indexOf(ch) >= 0;
          }
          function isOctalDigit(ch) {
            return "01234567".indexOf(ch) >= 0;
          }
          function isWhiteSpace(ch) {
            return (
              ch === " " ||
              ch === "	" ||
              ch === "" ||
              ch === "\f" ||
              ch === " " ||
              (ch.charCodeAt(0) >= 5760 &&
                " ᠎             　\ufeff".indexOf(ch) >= 0)
            );
          }
          function isLineTerminator(ch) {
            return (
              ch === "\n" || ch === "\r" || ch === "\u2028" || ch === "\u2029"
            );
          }
          function isIdentifierStart(ch) {
            return (
              ch === "$" ||
              ch === "_" ||
              ch === "\\" ||
              (ch >= "a" && ch <= "z") ||
              (ch >= "A" && ch <= "Z") ||
              (ch.charCodeAt(0) >= 128 &&
                Regex.NonAsciiIdentifierStart.test(ch))
            );
          }
          function isIdentifierPart(ch) {
            return (
              ch === "$" ||
              ch === "_" ||
              ch === "\\" ||
              (ch >= "a" && ch <= "z") ||
              (ch >= "A" && ch <= "Z") ||
              (ch >= "0" && ch <= "9") ||
              (ch.charCodeAt(0) >= 128 && Regex.NonAsciiIdentifierPart.test(ch))
            );
          }
          function isFutureReservedWord(id) {
            switch (id) {
              case "class":
              case "enum":
              case "export":
              case "extends":
              case "import":
              case "super":
                return true;
            }
            return false;
          }
          function isStrictModeReservedWord(id) {
            switch (id) {
              case "implements":
              case "interface":
              case "package":
              case "private":
              case "protected":
              case "public":
              case "static":
              case "yield":
              case "let":
                return true;
            }
            return false;
          }
          function isRestrictedWord(id) {
            return id === "eval" || id === "arguments";
          }
          function isKeyword(id) {
            var keyword = false;
            switch (id.length) {
              case 2:
                keyword = id === "if" || id === "in" || id === "do";
                break;
              case 3:
                keyword =
                  id === "var" || id === "for" || id === "new" || id === "try";
                break;
              case 4:
                keyword =
                  id === "this" ||
                  id === "else" ||
                  id === "case" ||
                  id === "void" ||
                  id === "with";
                break;
              case 5:
                keyword =
                  id === "while" ||
                  id === "break" ||
                  id === "catch" ||
                  id === "throw";
                break;
              case 6:
                keyword =
                  id === "return" ||
                  id === "typeof" ||
                  id === "delete" ||
                  id === "switch";
                break;
              case 7:
                keyword = id === "default" || id === "finally";
                break;
              case 8:
                keyword =
                  id === "function" || id === "continue" || id === "debugger";
                break;
              case 10:
                keyword = id === "instanceof";
                break;
            }
            if (keyword) {
              return true;
            }
            switch (id) {
              case "const":
                return true;
              case "yield":
              case "let":
                return true;
            }
            if (strict && isStrictModeReservedWord(id)) {
              return true;
            }
            return isFutureReservedWord(id);
          }
          function skipComment() {
            var ch, blockComment, lineComment;
            blockComment = false;
            lineComment = false;
            while (index < length) {
              ch = source[index];
              if (lineComment) {
                ch = source[index++];
                if (isLineTerminator(ch)) {
                  lineComment = false;
                  if (ch === "\r" && source[index] === "\n") {
                    ++index;
                  }
                  ++lineNumber;
                  lineStart = index;
                }
              } else if (blockComment) {
                if (isLineTerminator(ch)) {
                  if (ch === "\r" && source[index + 1] === "\n") {
                    ++index;
                  }
                  ++lineNumber;
                  ++index;
                  lineStart = index;
                  if (index >= length) {
                    throwError({}, Messages.UnexpectedToken, "ILLEGAL");
                  }
                } else {
                  ch = source[index++];
                  if (index >= length) {
                    throwError({}, Messages.UnexpectedToken, "ILLEGAL");
                  }
                  if (ch === "*") {
                    ch = source[index];
                    if (ch === "/") {
                      ++index;
                      blockComment = false;
                    }
                  }
                }
              } else if (ch === "/") {
                ch = source[index + 1];
                if (ch === "/") {
                  index += 2;
                  lineComment = true;
                } else if (ch === "*") {
                  index += 2;
                  blockComment = true;
                  if (index >= length) {
                    throwError({}, Messages.UnexpectedToken, "ILLEGAL");
                  }
                } else {
                  break;
                }
              } else if (isWhiteSpace(ch)) {
                ++index;
              } else if (isLineTerminator(ch)) {
                ++index;
                if (ch === "\r" && source[index] === "\n") {
                  ++index;
                }
                ++lineNumber;
                lineStart = index;
              } else {
                break;
              }
            }
          }
          function scanHexEscape(prefix) {
            var i,
              len,
              ch,
              code = 0;
            len = prefix === "u" ? 4 : 2;
            for (i = 0; i < len; ++i) {
              if (index < length && isHexDigit(source[index])) {
                ch = source[index++];
                code = code * 16 + "0123456789abcdef".indexOf(ch.toLowerCase());
              } else {
                return "";
              }
            }
            return String.fromCharCode(code);
          }
          function scanIdentifier() {
            var ch, start, id, restore;
            ch = source[index];
            if (!isIdentifierStart(ch)) {
              return;
            }
            start = index;
            if (ch === "\\") {
              ++index;
              if (source[index] !== "u") {
                return;
              }
              ++index;
              restore = index;
              ch = scanHexEscape("u");
              if (ch) {
                if (ch === "\\" || !isIdentifierStart(ch)) {
                  return;
                }
                id = ch;
              } else {
                index = restore;
                id = "u";
              }
            } else {
              id = source[index++];
            }
            while (index < length) {
              ch = source[index];
              if (!isIdentifierPart(ch)) {
                break;
              }
              if (ch === "\\") {
                ++index;
                if (source[index] !== "u") {
                  return;
                }
                ++index;
                restore = index;
                ch = scanHexEscape("u");
                if (ch) {
                  if (ch === "\\" || !isIdentifierPart(ch)) {
                    return;
                  }
                  id += ch;
                } else {
                  index = restore;
                  id += "u";
                }
              } else {
                id += source[index++];
              }
            }
            if (id.length === 1) {
              return {
                type: Token.Identifier,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index],
              };
            }
            if (isKeyword(id)) {
              return {
                type: Token.Keyword,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index],
              };
            }
            if (id === "null") {
              return {
                type: Token.NullLiteral,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index],
              };
            }
            if (id === "true" || id === "false") {
              return {
                type: Token.BooleanLiteral,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index],
              };
            }
            return {
              type: Token.Identifier,
              value: id,
              lineNumber: lineNumber,
              lineStart: lineStart,
              range: [start, index],
            };
          }
          function scanPunctuator() {
            var start = index,
              ch1 = source[index],
              ch2,
              ch3,
              ch4;
            if (ch1 === ";" || ch1 === "{" || ch1 === "}") {
              ++index;
              return {
                type: Token.Punctuator,
                value: ch1,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index],
              };
            }
            if (ch1 === "," || ch1 === "(" || ch1 === ")") {
              ++index;
              return {
                type: Token.Punctuator,
                value: ch1,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index],
              };
            }
            ch2 = source[index + 1];
            if (ch1 === "." && !isDecimalDigit(ch2)) {
              return {
                type: Token.Punctuator,
                value: source[index++],
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index],
              };
            }
            ch3 = source[index + 2];
            ch4 = source[index + 3];
            if (ch1 === ">" && ch2 === ">" && ch3 === ">") {
              if (ch4 === "=") {
                index += 4;
                return {
                  type: Token.Punctuator,
                  value: ">>>=",
                  lineNumber: lineNumber,
                  lineStart: lineStart,
                  range: [start, index],
                };
              }
            }
            if (ch1 === "=" && ch2 === "=" && ch3 === "=") {
              index += 3;
              return {
                type: Token.Punctuator,
                value: "===",
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index],
              };
            }
            if (ch1 === "!" && ch2 === "=" && ch3 === "=") {
              index += 3;
              return {
                type: Token.Punctuator,
                value: "!==",
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index],
              };
            }
            if (ch1 === ">" && ch2 === ">" && ch3 === ">") {
              index += 3;
              return {
                type: Token.Punctuator,
                value: ">>>",
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index],
              };
            }
            if (ch1 === "<" && ch2 === "<" && ch3 === "=") {
              index += 3;
              return {
                type: Token.Punctuator,
                value: "<<=",
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index],
              };
            }
            if (ch1 === ">" && ch2 === ">" && ch3 === "=") {
              index += 3;
              return {
                type: Token.Punctuator,
                value: ">>=",
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index],
              };
            }
            if (ch2 === "=") {
              if ("<>=!+-*%&|^/".indexOf(ch1) >= 0) {
                index += 2;
                return {
                  type: Token.Punctuator,
                  value: ch1 + ch2,
                  lineNumber: lineNumber,
                  lineStart: lineStart,
                  range: [start, index],
                };
              }
            }
            if (ch1 === ch2 && "+-<>&|".indexOf(ch1) >= 0) {
              if ("+-<>&|".indexOf(ch2) >= 0) {
                index += 2;
                return {
                  type: Token.Punctuator,
                  value: ch1 + ch2,
                  lineNumber: lineNumber,
                  lineStart: lineStart,
                  range: [start, index],
                };
              }
            }
            if ("[]<>+-*%&|^!~?:=/".indexOf(ch1) >= 0) {
              return {
                type: Token.Punctuator,
                value: source[index++],
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index],
              };
            }
          }
          function scanNumericLiteral() {
            var number, start, ch;
            ch = source[index];
            assert(
              isDecimalDigit(ch) || ch === ".",
              "Numeric literal must start with a decimal digit or a decimal point"
            );
            start = index;
            number = "";
            if (ch !== ".") {
              number = source[index++];
              ch = source[index];
              if (number === "0") {
                if (ch === "x" || ch === "X") {
                  number += source[index++];
                  while (index < length) {
                    ch = source[index];
                    if (!isHexDigit(ch)) {
                      break;
                    }
                    number += source[index++];
                  }
                  if (number.length <= 2) {
                    throwError({}, Messages.UnexpectedToken, "ILLEGAL");
                  }
                  if (index < length) {
                    ch = source[index];
                    if (isIdentifierStart(ch)) {
                      throwError({}, Messages.UnexpectedToken, "ILLEGAL");
                    }
                  }
                  return {
                    type: Token.NumericLiteral,
                    value: parseInt(number, 16),
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index],
                  };
                } else if (isOctalDigit(ch)) {
                  number += source[index++];
                  while (index < length) {
                    ch = source[index];
                    if (!isOctalDigit(ch)) {
                      break;
                    }
                    number += source[index++];
                  }
                  if (index < length) {
                    ch = source[index];
                    if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
                      throwError({}, Messages.UnexpectedToken, "ILLEGAL");
                    }
                  }
                  return {
                    type: Token.NumericLiteral,
                    value: parseInt(number, 8),
                    octal: true,
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index],
                  };
                }
                if (isDecimalDigit(ch)) {
                  throwError({}, Messages.UnexpectedToken, "ILLEGAL");
                }
              }
              while (index < length) {
                ch = source[index];
                if (!isDecimalDigit(ch)) {
                  break;
                }
                number += source[index++];
              }
            }
            if (ch === ".") {
              number += source[index++];
              while (index < length) {
                ch = source[index];
                if (!isDecimalDigit(ch)) {
                  break;
                }
                number += source[index++];
              }
            }
            if (ch === "e" || ch === "E") {
              number += source[index++];
              ch = source[index];
              if (ch === "+" || ch === "-") {
                number += source[index++];
              }
              ch = source[index];
              if (isDecimalDigit(ch)) {
                number += source[index++];
                while (index < length) {
                  ch = source[index];
                  if (!isDecimalDigit(ch)) {
                    break;
                  }
                  number += source[index++];
                }
              } else {
                ch = "character " + ch;
                if (index >= length) {
                  ch = "<end>";
                }
                throwError({}, Messages.UnexpectedToken, "ILLEGAL");
              }
            }
            if (index < length) {
              ch = source[index];
              if (isIdentifierStart(ch)) {
                throwError({}, Messages.UnexpectedToken, "ILLEGAL");
              }
            }
            return {
              type: Token.NumericLiteral,
              value: parseFloat(number),
              lineNumber: lineNumber,
              lineStart: lineStart,
              range: [start, index],
            };
          }
          function scanStringLiteral() {
            var str = "",
              quote,
              start,
              ch,
              code,
              unescaped,
              restore,
              octal = false;
            quote = source[index];
            assert(
              quote === "'" || quote === '"',
              "String literal must starts with a quote"
            );
            start = index;
            ++index;
            while (index < length) {
              ch = source[index++];
              if (ch === quote) {
                quote = "";
                break;
              } else if (ch === "\\") {
                ch = source[index++];
                if (!isLineTerminator(ch)) {
                  switch (ch) {
                    case "n":
                      str += "\n";
                      break;
                    case "r":
                      str += "\r";
                      break;
                    case "t":
                      str += "	";
                      break;
                    case "u":
                    case "x":
                      restore = index;
                      unescaped = scanHexEscape(ch);
                      if (unescaped) {
                        str += unescaped;
                      } else {
                        index = restore;
                        str += ch;
                      }
                      break;
                    case "b":
                      str += "\b";
                      break;
                    case "f":
                      str += "\f";
                      break;
                    case "v":
                      str += "";
                      break;
                    default:
                      if (isOctalDigit(ch)) {
                        code = "01234567".indexOf(ch);
                        if (code !== 0) {
                          octal = true;
                        }
                        if (index < length && isOctalDigit(source[index])) {
                          octal = true;
                          code = code * 8 + "01234567".indexOf(source[index++]);
                          if (
                            "0123".indexOf(ch) >= 0 &&
                            index < length &&
                            isOctalDigit(source[index])
                          ) {
                            code =
                              code * 8 + "01234567".indexOf(source[index++]);
                          }
                        }
                        str += String.fromCharCode(code);
                      } else {
                        str += ch;
                      }
                      break;
                  }
                } else {
                  ++lineNumber;
                  if (ch === "\r" && source[index] === "\n") {
                    ++index;
                  }
                }
              } else if (isLineTerminator(ch)) {
                break;
              } else {
                str += ch;
              }
            }
            if (quote !== "") {
              throwError({}, Messages.UnexpectedToken, "ILLEGAL");
            }
            return {
              type: Token.StringLiteral,
              value: str,
              octal: octal,
              lineNumber: lineNumber,
              lineStart: lineStart,
              range: [start, index],
            };
          }
          function scanRegExp() {
            var str,
              ch,
              start,
              pattern,
              flags,
              value,
              classMarker = false,
              restore,
              terminated = false;
            buffer = null;
            skipComment();
            start = index;
            ch = source[index];
            assert(
              ch === "/",
              "Regular expression literal must start with a slash"
            );
            str = source[index++];
            while (index < length) {
              ch = source[index++];
              str += ch;
              if (ch === "\\") {
                ch = source[index++];
                if (isLineTerminator(ch)) {
                  throwError({}, Messages.UnterminatedRegExp);
                }
                str += ch;
              } else if (classMarker) {
                if (ch === "]") {
                  classMarker = false;
                }
              } else {
                if (ch === "/") {
                  terminated = true;
                  break;
                } else if (ch === "[") {
                  classMarker = true;
                } else if (isLineTerminator(ch)) {
                  throwError({}, Messages.UnterminatedRegExp);
                }
              }
            }
            if (!terminated) {
              throwError({}, Messages.UnterminatedRegExp);
            }
            pattern = str.substr(1, str.length - 2);
            flags = "";
            while (index < length) {
              ch = source[index];
              if (!isIdentifierPart(ch)) {
                break;
              }
              ++index;
              if (ch === "\\" && index < length) {
                ch = source[index];
                if (ch === "u") {
                  ++index;
                  restore = index;
                  ch = scanHexEscape("u");
                  if (ch) {
                    flags += ch;
                    str += "\\u";
                    for (; restore < index; ++restore) {
                      str += source[restore];
                    }
                  } else {
                    index = restore;
                    flags += "u";
                    str += "\\u";
                  }
                } else {
                  str += "\\";
                }
              } else {
                flags += ch;
                str += ch;
              }
            }
            try {
              value = new RegExp(pattern, flags);
            } catch (e) {
              throwError({}, Messages.InvalidRegExp);
            }
            return { literal: str, value: value, range: [start, index] };
          }
          function isIdentifierName(token) {
            return (
              token.type === Token.Identifier ||
              token.type === Token.Keyword ||
              token.type === Token.BooleanLiteral ||
              token.type === Token.NullLiteral
            );
          }
          function advance() {
            var ch, token;
            skipComment();
            if (index >= length) {
              return {
                type: Token.EOF,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [index, index],
              };
            }
            token = scanPunctuator();
            if (typeof token !== "undefined") {
              return token;
            }
            ch = source[index];
            if (ch === "'" || ch === '"') {
              return scanStringLiteral();
            }
            if (ch === "." || isDecimalDigit(ch)) {
              return scanNumericLiteral();
            }
            token = scanIdentifier();
            if (typeof token !== "undefined") {
              return token;
            }
            throwError({}, Messages.UnexpectedToken, "ILLEGAL");
          }
          function lex() {
            var token;
            if (buffer) {
              index = buffer.range[1];
              lineNumber = buffer.lineNumber;
              lineStart = buffer.lineStart;
              token = buffer;
              buffer = null;
              return token;
            }
            buffer = null;
            return advance();
          }
          function lookahead() {
            var pos, line, start;
            if (buffer !== null) {
              return buffer;
            }
            pos = index;
            line = lineNumber;
            start = lineStart;
            buffer = advance();
            index = pos;
            lineNumber = line;
            lineStart = start;
            return buffer;
          }
          function peekLineTerminator() {
            var pos, line, start, found;
            pos = index;
            line = lineNumber;
            start = lineStart;
            skipComment();
            found = lineNumber !== line;
            index = pos;
            lineNumber = line;
            lineStart = start;
            return found;
          }
          function throwError(token, messageFormat) {
            var error,
              args = Array.prototype.slice.call(arguments, 2),
              msg = messageFormat.replace(/%(\d)/g, function (whole, index) {
                return args[index] || "";
              });
            if (typeof token.lineNumber === "number") {
              error = new Error("Line " + token.lineNumber + ": " + msg);
              error.index = token.range[0];
              error.lineNumber = token.lineNumber;
              error.column = token.range[0] - lineStart + 1;
            } else {
              error = new Error("Line " + lineNumber + ": " + msg);
              error.index = index;
              error.lineNumber = lineNumber;
              error.column = index - lineStart + 1;
            }
            throw error;
          }
          function throwErrorTolerant() {
            try {
              throwError.apply(null, arguments);
            } catch (e) {
              if (extra.errors) {
                extra.errors.push(e);
              } else {
                throw e;
              }
            }
          }
          function throwUnexpected(token) {
            if (token.type === Token.EOF) {
              throwError(token, Messages.UnexpectedEOS);
            }
            if (token.type === Token.NumericLiteral) {
              throwError(token, Messages.UnexpectedNumber);
            }
            if (token.type === Token.StringLiteral) {
              throwError(token, Messages.UnexpectedString);
            }
            if (token.type === Token.Identifier) {
              throwError(token, Messages.UnexpectedIdentifier);
            }
            if (token.type === Token.Keyword) {
              if (isFutureReservedWord(token.value)) {
                throwError(token, Messages.UnexpectedReserved);
              } else if (strict && isStrictModeReservedWord(token.value)) {
                throwErrorTolerant(token, Messages.StrictReservedWord);
                return;
              }
              throwError(token, Messages.UnexpectedToken, token.value);
            }
            throwError(token, Messages.UnexpectedToken, token.value);
          }
          function expect(value) {
            var token = lex();
            if (token.type !== Token.Punctuator || token.value !== value) {
              throwUnexpected(token);
            }
          }
          function expectKeyword(keyword) {
            var token = lex();
            if (token.type !== Token.Keyword || token.value !== keyword) {
              throwUnexpected(token);
            }
          }
          function match(value) {
            var token = lookahead();
            return token.type === Token.Punctuator && token.value === value;
          }
          function matchKeyword(keyword) {
            var token = lookahead();
            return token.type === Token.Keyword && token.value === keyword;
          }
          function matchAssign() {
            var token = lookahead(),
              op = token.value;
            if (token.type !== Token.Punctuator) {
              return false;
            }
            return (
              op === "=" ||
              op === "*=" ||
              op === "/=" ||
              op === "%=" ||
              op === "+=" ||
              op === "-=" ||
              op === "<<=" ||
              op === ">>=" ||
              op === ">>>=" ||
              op === "&=" ||
              op === "^=" ||
              op === "|="
            );
          }
          function consumeSemicolon() {
            var token, line;
            if (source[index] === ";") {
              lex();
              return;
            }
            line = lineNumber;
            skipComment();
            if (lineNumber !== line) {
              return;
            }
            if (match(";")) {
              lex();
              return;
            }
            token = lookahead();
            if (token.type !== Token.EOF && !match("}")) {
              throwUnexpected(token);
            }
          }
          function isLeftHandSide(expr) {
            return (
              expr.type === Syntax.Identifier ||
              expr.type === Syntax.MemberExpression
            );
          }
          function parseArrayInitialiser() {
            var elements = [];
            expect("[");
            while (!match("]")) {
              if (match(",")) {
                lex();
                elements.push(null);
              } else {
                elements.push(parseAssignmentExpression());
                if (!match("]")) {
                  expect(",");
                }
              }
            }
            expect("]");
            return { type: Syntax.ArrayExpression, elements: elements };
          }
          function parsePropertyFunction(param, first) {
            var previousStrict, body;
            previousStrict = strict;
            body = parseFunctionSourceElements();
            if (first && strict && isRestrictedWord(param[0].name)) {
              throwErrorTolerant(first, Messages.StrictParamName);
            }
            strict = previousStrict;
            return {
              type: Syntax.FunctionExpression,
              id: null,
              params: param,
              defaults: [],
              body: body,
              rest: null,
              generator: false,
              expression: false,
            };
          }
          function parseObjectPropertyKey() {
            var token = lex();
            if (
              token.type === Token.StringLiteral ||
              token.type === Token.NumericLiteral
            ) {
              if (strict && token.octal) {
                throwErrorTolerant(token, Messages.StrictOctalLiteral);
              }
              return createLiteral(token);
            }
            return { type: Syntax.Identifier, name: token.value };
          }
          function parseObjectProperty() {
            var token, key, id, param;
            token = lookahead();
            if (token.type === Token.Identifier) {
              id = parseObjectPropertyKey();
              if (token.value === "get" && !match(":")) {
                key = parseObjectPropertyKey();
                expect("(");
                expect(")");
                return {
                  type: Syntax.Property,
                  key: key,
                  value: parsePropertyFunction([]),
                  kind: "get",
                };
              } else if (token.value === "set" && !match(":")) {
                key = parseObjectPropertyKey();
                expect("(");
                token = lookahead();
                if (token.type !== Token.Identifier) {
                  expect(")");
                  throwErrorTolerant(
                    token,
                    Messages.UnexpectedToken,
                    token.value
                  );
                  return {
                    type: Syntax.Property,
                    key: key,
                    value: parsePropertyFunction([]),
                    kind: "set",
                  };
                } else {
                  param = [parseVariableIdentifier()];
                  expect(")");
                  return {
                    type: Syntax.Property,
                    key: key,
                    value: parsePropertyFunction(param, token),
                    kind: "set",
                  };
                }
              } else {
                expect(":");
                return {
                  type: Syntax.Property,
                  key: id,
                  value: parseAssignmentExpression(),
                  kind: "init",
                };
              }
            } else if (
              token.type === Token.EOF ||
              token.type === Token.Punctuator
            ) {
              throwUnexpected(token);
            } else {
              key = parseObjectPropertyKey();
              expect(":");
              return {
                type: Syntax.Property,
                key: key,
                value: parseAssignmentExpression(),
                kind: "init",
              };
            }
          }
          function parseObjectInitialiser() {
            var properties = [],
              property,
              name,
              kind,
              map = {},
              toString = String;
            expect("{");
            while (!match("}")) {
              property = parseObjectProperty();
              if (property.key.type === Syntax.Identifier) {
                name = property.key.name;
              } else {
                name = toString(property.key.value);
              }
              kind =
                property.kind === "init"
                  ? PropertyKind.Data
                  : property.kind === "get"
                  ? PropertyKind.Get
                  : PropertyKind.Set;
              if (Object.prototype.hasOwnProperty.call(map, name)) {
                if (map[name] === PropertyKind.Data) {
                  if (strict && kind === PropertyKind.Data) {
                    throwErrorTolerant({}, Messages.StrictDuplicateProperty);
                  } else if (kind !== PropertyKind.Data) {
                    throwErrorTolerant({}, Messages.AccessorDataProperty);
                  }
                } else {
                  if (kind === PropertyKind.Data) {
                    throwErrorTolerant({}, Messages.AccessorDataProperty);
                  } else if (map[name] & kind) {
                    throwErrorTolerant({}, Messages.AccessorGetSet);
                  }
                }
                map[name] |= kind;
              } else {
                map[name] = kind;
              }
              properties.push(property);
              if (!match("}")) {
                expect(",");
              }
            }
            expect("}");
            return { type: Syntax.ObjectExpression, properties: properties };
          }
          function parseGroupExpression() {
            var expr;
            expect("(");
            expr = parseExpression();
            expect(")");
            return expr;
          }
          function parsePrimaryExpression() {
            var token = lookahead(),
              type = token.type;
            if (type === Token.Identifier) {
              return { type: Syntax.Identifier, name: lex().value };
            }
            if (type === Token.StringLiteral || type === Token.NumericLiteral) {
              if (strict && token.octal) {
                throwErrorTolerant(token, Messages.StrictOctalLiteral);
              }
              return createLiteral(lex());
            }
            if (type === Token.Keyword) {
              if (matchKeyword("this")) {
                lex();
                return { type: Syntax.ThisExpression };
              }
              if (matchKeyword("function")) {
                return parseFunctionExpression();
              }
            }
            if (type === Token.BooleanLiteral) {
              lex();
              token.value = token.value === "true";
              return createLiteral(token);
            }
            if (type === Token.NullLiteral) {
              lex();
              token.value = null;
              return createLiteral(token);
            }
            if (match("[")) {
              return parseArrayInitialiser();
            }
            if (match("{")) {
              return parseObjectInitialiser();
            }
            if (match("(")) {
              return parseGroupExpression();
            }
            if (match("/") || match("/=")) {
              return createLiteral(scanRegExp());
            }
            return throwUnexpected(lex());
          }
          function parseArguments() {
            var args = [];
            expect("(");
            if (!match(")")) {
              while (index < length) {
                args.push(parseAssignmentExpression());
                if (match(")")) {
                  break;
                }
                expect(",");
              }
            }
            expect(")");
            return args;
          }
          function parseNonComputedProperty() {
            var token = lex();
            if (!isIdentifierName(token)) {
              throwUnexpected(token);
            }
            return { type: Syntax.Identifier, name: token.value };
          }
          function parseNonComputedMember() {
            expect(".");
            return parseNonComputedProperty();
          }
          function parseComputedMember() {
            var expr;
            expect("[");
            expr = parseExpression();
            expect("]");
            return expr;
          }
          function parseNewExpression() {
            var expr;
            expectKeyword("new");
            expr = {
              type: Syntax.NewExpression,
              callee: parseLeftHandSideExpression(),
              arguments: [],
            };
            if (match("(")) {
              expr["arguments"] = parseArguments();
            }
            return expr;
          }
          function parseLeftHandSideExpressionAllowCall() {
            var expr;
            expr = matchKeyword("new")
              ? parseNewExpression()
              : parsePrimaryExpression();
            while (match(".") || match("[") || match("(")) {
              if (match("(")) {
                expr = {
                  type: Syntax.CallExpression,
                  callee: expr,
                  arguments: parseArguments(),
                };
              } else if (match("[")) {
                expr = {
                  type: Syntax.MemberExpression,
                  computed: true,
                  object: expr,
                  property: parseComputedMember(),
                };
              } else {
                expr = {
                  type: Syntax.MemberExpression,
                  computed: false,
                  object: expr,
                  property: parseNonComputedMember(),
                };
              }
            }
            return expr;
          }
          function parseLeftHandSideExpression() {
            var expr;
            expr = matchKeyword("new")
              ? parseNewExpression()
              : parsePrimaryExpression();
            while (match(".") || match("[")) {
              if (match("[")) {
                expr = {
                  type: Syntax.MemberExpression,
                  computed: true,
                  object: expr,
                  property: parseComputedMember(),
                };
              } else {
                expr = {
                  type: Syntax.MemberExpression,
                  computed: false,
                  object: expr,
                  property: parseNonComputedMember(),
                };
              }
            }
            return expr;
          }
          function parsePostfixExpression() {
            var expr = parseLeftHandSideExpressionAllowCall(),
              token;
            token = lookahead();
            if (token.type !== Token.Punctuator) {
              return expr;
            }
            if ((match("++") || match("--")) && !peekLineTerminator()) {
              if (
                strict &&
                expr.type === Syntax.Identifier &&
                isRestrictedWord(expr.name)
              ) {
                throwErrorTolerant({}, Messages.StrictLHSPostfix);
              }
              if (!isLeftHandSide(expr)) {
                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
              }
              expr = {
                type: Syntax.UpdateExpression,
                operator: lex().value,
                argument: expr,
                prefix: false,
              };
            }
            return expr;
          }
          function parseUnaryExpression() {
            var token, expr;
            token = lookahead();
            if (
              token.type !== Token.Punctuator &&
              token.type !== Token.Keyword
            ) {
              return parsePostfixExpression();
            }
            if (match("++") || match("--")) {
              token = lex();
              expr = parseUnaryExpression();
              if (
                strict &&
                expr.type === Syntax.Identifier &&
                isRestrictedWord(expr.name)
              ) {
                throwErrorTolerant({}, Messages.StrictLHSPrefix);
              }
              if (!isLeftHandSide(expr)) {
                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
              }
              expr = {
                type: Syntax.UpdateExpression,
                operator: token.value,
                argument: expr,
                prefix: true,
              };
              return expr;
            }
            if (match("+") || match("-") || match("~") || match("!")) {
              expr = {
                type: Syntax.UnaryExpression,
                operator: lex().value,
                argument: parseUnaryExpression(),
                prefix: true,
              };
              return expr;
            }
            if (
              matchKeyword("delete") ||
              matchKeyword("void") ||
              matchKeyword("typeof")
            ) {
              expr = {
                type: Syntax.UnaryExpression,
                operator: lex().value,
                argument: parseUnaryExpression(),
                prefix: true,
              };
              if (
                strict &&
                expr.operator === "delete" &&
                expr.argument.type === Syntax.Identifier
              ) {
                throwErrorTolerant({}, Messages.StrictDelete);
              }
              return expr;
            }
            return parsePostfixExpression();
          }
          function parseMultiplicativeExpression() {
            var expr = parseUnaryExpression();
            while (match("*") || match("/") || match("%")) {
              expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseUnaryExpression(),
              };
            }
            return expr;
          }
          function parseAdditiveExpression() {
            var expr = parseMultiplicativeExpression();
            while (match("+") || match("-")) {
              expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseMultiplicativeExpression(),
              };
            }
            return expr;
          }
          function parseShiftExpression() {
            var expr = parseAdditiveExpression();
            while (match("<<") || match(">>") || match(">>>")) {
              expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseAdditiveExpression(),
              };
            }
            return expr;
          }
          function parseRelationalExpression() {
            var expr, previousAllowIn;
            previousAllowIn = state.allowIn;
            state.allowIn = true;
            expr = parseShiftExpression();
            while (
              match("<") ||
              match(">") ||
              match("<=") ||
              match(">=") ||
              (previousAllowIn && matchKeyword("in")) ||
              matchKeyword("instanceof")
            ) {
              expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseShiftExpression(),
              };
            }
            state.allowIn = previousAllowIn;
            return expr;
          }
          function parseEqualityExpression() {
            var expr = parseRelationalExpression();
            while (match("==") || match("!=") || match("===") || match("!==")) {
              expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseRelationalExpression(),
              };
            }
            return expr;
          }
          function parseBitwiseANDExpression() {
            var expr = parseEqualityExpression();
            while (match("&")) {
              lex();
              expr = {
                type: Syntax.BinaryExpression,
                operator: "&",
                left: expr,
                right: parseEqualityExpression(),
              };
            }
            return expr;
          }
          function parseBitwiseXORExpression() {
            var expr = parseBitwiseANDExpression();
            while (match("^")) {
              lex();
              expr = {
                type: Syntax.BinaryExpression,
                operator: "^",
                left: expr,
                right: parseBitwiseANDExpression(),
              };
            }
            return expr;
          }
          function parseBitwiseORExpression() {
            var expr = parseBitwiseXORExpression();
            while (match("|")) {
              lex();
              expr = {
                type: Syntax.BinaryExpression,
                operator: "|",
                left: expr,
                right: parseBitwiseXORExpression(),
              };
            }
            return expr;
          }
          function parseLogicalANDExpression() {
            var expr = parseBitwiseORExpression();
            while (match("&&")) {
              lex();
              expr = {
                type: Syntax.LogicalExpression,
                operator: "&&",
                left: expr,
                right: parseBitwiseORExpression(),
              };
            }
            return expr;
          }
          function parseLogicalORExpression() {
            var expr = parseLogicalANDExpression();
            while (match("||")) {
              lex();
              expr = {
                type: Syntax.LogicalExpression,
                operator: "||",
                left: expr,
                right: parseLogicalANDExpression(),
              };
            }
            return expr;
          }
          function parseConditionalExpression() {
            var expr, previousAllowIn, consequent;
            expr = parseLogicalORExpression();
            if (match("?")) {
              lex();
              previousAllowIn = state.allowIn;
              state.allowIn = true;
              consequent = parseAssignmentExpression();
              state.allowIn = previousAllowIn;
              expect(":");
              expr = {
                type: Syntax.ConditionalExpression,
                test: expr,
                consequent: consequent,
                alternate: parseAssignmentExpression(),
              };
            }
            return expr;
          }
          function parseAssignmentExpression() {
            var token, expr;
            token = lookahead();
            expr = parseConditionalExpression();
            if (matchAssign()) {
              if (!isLeftHandSide(expr)) {
                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
              }
              if (
                strict &&
                expr.type === Syntax.Identifier &&
                isRestrictedWord(expr.name)
              ) {
                throwErrorTolerant(token, Messages.StrictLHSAssignment);
              }
              expr = {
                type: Syntax.AssignmentExpression,
                operator: lex().value,
                left: expr,
                right: parseAssignmentExpression(),
              };
            }
            return expr;
          }
          function parseExpression() {
            var expr = parseAssignmentExpression();
            if (match(",")) {
              expr = { type: Syntax.SequenceExpression, expressions: [expr] };
              while (index < length) {
                if (!match(",")) {
                  break;
                }
                lex();
                expr.expressions.push(parseAssignmentExpression());
              }
            }
            return expr;
          }
          function parseStatementList() {
            var list = [],
              statement;
            while (index < length) {
              if (match("}")) {
                break;
              }
              statement = parseSourceElement();
              if (typeof statement === "undefined") {
                break;
              }
              list.push(statement);
            }
            return list;
          }
          function parseBlock() {
            var block;
            expect("{");
            block = parseStatementList();
            expect("}");
            return { type: Syntax.BlockStatement, body: block };
          }
          function parseVariableIdentifier() {
            var token = lex();
            if (token.type !== Token.Identifier) {
              throwUnexpected(token);
            }
            return { type: Syntax.Identifier, name: token.value };
          }
          function parseVariableDeclaration(kind) {
            var id = parseVariableIdentifier(),
              init = null;
            if (strict && isRestrictedWord(id.name)) {
              throwErrorTolerant({}, Messages.StrictVarName);
            }
            if (kind === "const") {
              expect("=");
              init = parseAssignmentExpression();
            } else if (match("=")) {
              lex();
              init = parseAssignmentExpression();
            }
            return { type: Syntax.VariableDeclarator, id: id, init: init };
          }
          function parseVariableDeclarationList(kind) {
            var list = [];
            do {
              list.push(parseVariableDeclaration(kind));
              if (!match(",")) {
                break;
              }
              lex();
            } while (index < length);
            return list;
          }
          function parseVariableStatement() {
            var declarations;
            expectKeyword("var");
            declarations = parseVariableDeclarationList();
            consumeSemicolon();
            return {
              type: Syntax.VariableDeclaration,
              declarations: declarations,
              kind: "var",
            };
          }
          function parseConstLetDeclaration(kind) {
            var declarations;
            expectKeyword(kind);
            declarations = parseVariableDeclarationList(kind);
            consumeSemicolon();
            return {
              type: Syntax.VariableDeclaration,
              declarations: declarations,
              kind: kind,
            };
          }
          function parseEmptyStatement() {
            expect(";");
            return { type: Syntax.EmptyStatement };
          }
          function parseExpressionStatement() {
            var expr = parseExpression();
            consumeSemicolon();
            return {
              type: Syntax.ExpressionStatement,
              expression: expr,
            };
          }
          function parseIfStatement() {
            var test, consequent, alternate;
            expectKeyword("if");
            expect("(");
            test = parseExpression();
            expect(")");
            consequent = parseStatement();
            if (matchKeyword("else")) {
              lex();
              alternate = parseStatement();
            } else {
              alternate = null;
            }
            return {
              type: Syntax.IfStatement,
              test: test,
              consequent: consequent,
              alternate: alternate,
            };
          }
          function parseDoWhileStatement() {
            var body, test, oldInIteration;
            expectKeyword("do");
            oldInIteration = state.inIteration;
            state.inIteration = true;
            body = parseStatement();
            state.inIteration = oldInIteration;
            expectKeyword("while");
            expect("(");
            test = parseExpression();
            expect(")");
            if (match(";")) {
              lex();
            }
            return { type: Syntax.DoWhileStatement, body: body, test: test };
          }
          function parseWhileStatement() {
            var test, body, oldInIteration;
            expectKeyword("while");
            expect("(");
            test = parseExpression();
            expect(")");
            oldInIteration = state.inIteration;
            state.inIteration = true;
            body = parseStatement();
            state.inIteration = oldInIteration;
            return { type: Syntax.WhileStatement, test: test, body: body };
          }
          function parseForVariableDeclaration() {
            var token = lex();
            return {
              type: Syntax.VariableDeclaration,
              declarations: parseVariableDeclarationList(),
              kind: token.value,
            };
          }
          function parseForStatement() {
            var init, test, update, left, right, body, oldInIteration;
            init = test = update = null;
            expectKeyword("for");
            expect("(");
            if (match(";")) {
              lex();
            } else {
              if (matchKeyword("var") || matchKeyword("let")) {
                state.allowIn = false;
                init = parseForVariableDeclaration();
                state.allowIn = true;
                if (init.declarations.length === 1 && matchKeyword("in")) {
                  lex();
                  left = init;
                  right = parseExpression();
                  init = null;
                }
              } else {
                state.allowIn = false;
                init = parseExpression();
                state.allowIn = true;
                if (matchKeyword("in")) {
                  if (!isLeftHandSide(init)) {
                    throwErrorTolerant({}, Messages.InvalidLHSInForIn);
                  }
                  lex();
                  left = init;
                  right = parseExpression();
                  init = null;
                }
              }
              if (typeof left === "undefined") {
                expect(";");
              }
            }
            if (typeof left === "undefined") {
              if (!match(";")) {
                test = parseExpression();
              }
              expect(";");
              if (!match(")")) {
                update = parseExpression();
              }
            }
            expect(")");
            oldInIteration = state.inIteration;
            state.inIteration = true;
            body = parseStatement();
            state.inIteration = oldInIteration;
            if (typeof left === "undefined") {
              return {
                type: Syntax.ForStatement,
                init: init,
                test: test,
                update: update,
                body: body,
              };
            }
            return {
              type: Syntax.ForInStatement,
              left: left,
              right: right,
              body: body,
              each: false,
            };
          }
          function parseContinueStatement() {
            var token,
              label = null;
            expectKeyword("continue");
            if (source[index] === ";") {
              lex();
              if (!state.inIteration) {
                throwError({}, Messages.IllegalContinue);
              }
              return { type: Syntax.ContinueStatement, label: null };
            }
            if (peekLineTerminator()) {
              if (!state.inIteration) {
                throwError({}, Messages.IllegalContinue);
              }
              return { type: Syntax.ContinueStatement, label: null };
            }
            token = lookahead();
            if (token.type === Token.Identifier) {
              label = parseVariableIdentifier();
              if (
                !Object.prototype.hasOwnProperty.call(
                  state.labelSet,
                  label.name
                )
              ) {
                throwError({}, Messages.UnknownLabel, label.name);
              }
            }
            consumeSemicolon();
            if (label === null && !state.inIteration) {
              throwError({}, Messages.IllegalContinue);
            }
            return { type: Syntax.ContinueStatement, label: label };
          }
          function parseBreakStatement() {
            var token,
              label = null;
            expectKeyword("break");
            if (source[index] === ";") {
              lex();
              if (!(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
              }
              return { type: Syntax.BreakStatement, label: null };
            }
            if (peekLineTerminator()) {
              if (!(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
              }
              return { type: Syntax.BreakStatement, label: null };
            }
            token = lookahead();
            if (token.type === Token.Identifier) {
              label = parseVariableIdentifier();
              if (
                !Object.prototype.hasOwnProperty.call(
                  state.labelSet,
                  label.name
                )
              ) {
                throwError({}, Messages.UnknownLabel, label.name);
              }
            }
            consumeSemicolon();
            if (label === null && !(state.inIteration || state.inSwitch)) {
              throwError({}, Messages.IllegalBreak);
            }
            return { type: Syntax.BreakStatement, label: label };
          }
          function parseReturnStatement() {
            var token,
              argument = null;
            expectKeyword("return");
            if (!state.inFunctionBody) {
              throwErrorTolerant({}, Messages.IllegalReturn);
            }
            if (source[index] === " ") {
              if (isIdentifierStart(source[index + 1])) {
                argument = parseExpression();
                consumeSemicolon();
                return { type: Syntax.ReturnStatement, argument: argument };
              }
            }
            if (peekLineTerminator()) {
              return { type: Syntax.ReturnStatement, argument: null };
            }
            if (!match(";")) {
              token = lookahead();
              if (!match("}") && token.type !== Token.EOF) {
                argument = parseExpression();
              }
            }
            consumeSemicolon();
            return { type: Syntax.ReturnStatement, argument: argument };
          }
          function parseWithStatement() {
            var object, body;
            if (strict) {
              throwErrorTolerant({}, Messages.StrictModeWith);
            }
            expectKeyword("with");
            expect("(");
            object = parseExpression();
            expect(")");
            body = parseStatement();
            return { type: Syntax.WithStatement, object: object, body: body };
          }
          function parseSwitchCase() {
            var test,
              consequent = [],
              statement;
            if (matchKeyword("default")) {
              lex();
              test = null;
            } else {
              expectKeyword("case");
              test = parseExpression();
            }
            expect(":");
            while (index < length) {
              if (
                match("}") ||
                matchKeyword("default") ||
                matchKeyword("case")
              ) {
                break;
              }
              statement = parseStatement();
              if (typeof statement === "undefined") {
                break;
              }
              consequent.push(statement);
            }
            return {
              type: Syntax.SwitchCase,
              test: test,
              consequent: consequent,
            };
          }
          function parseSwitchStatement() {
            var discriminant, cases, clause, oldInSwitch, defaultFound;
            expectKeyword("switch");
            expect("(");
            discriminant = parseExpression();
            expect(")");
            expect("{");
            cases = [];
            if (match("}")) {
              lex();
              return {
                type: Syntax.SwitchStatement,
                discriminant: discriminant,
                cases: cases,
              };
            }
            oldInSwitch = state.inSwitch;
            state.inSwitch = true;
            defaultFound = false;
            while (index < length) {
              if (match("}")) {
                break;
              }
              clause = parseSwitchCase();
              if (clause.test === null) {
                if (defaultFound) {
                  throwError({}, Messages.MultipleDefaultsInSwitch);
                }
                defaultFound = true;
              }
              cases.push(clause);
            }
            state.inSwitch = oldInSwitch;
            expect("}");
            return {
              type: Syntax.SwitchStatement,
              discriminant: discriminant,
              cases: cases,
            };
          }
          function parseThrowStatement() {
            var argument;
            expectKeyword("throw");
            if (peekLineTerminator()) {
              throwError({}, Messages.NewlineAfterThrow);
            }
            argument = parseExpression();
            consumeSemicolon();
            return { type: Syntax.ThrowStatement, argument: argument };
          }
          function parseCatchClause() {
            var param;
            expectKeyword("catch");
            expect("(");
            if (match(")")) {
              throwUnexpected(lookahead());
            }
            param = parseVariableIdentifier();
            if (strict && isRestrictedWord(param.name)) {
              throwErrorTolerant({}, Messages.StrictCatchVariable);
            }
            expect(")");
            return {
              type: Syntax.CatchClause,
              param: param,
              body: parseBlock(),
            };
          }
          function parseTryStatement() {
            var block,
              handlers = [],
              finalizer = null;
            expectKeyword("try");
            block = parseBlock();
            if (matchKeyword("catch")) {
              handlers.push(parseCatchClause());
            }
            if (matchKeyword("finally")) {
              lex();
              finalizer = parseBlock();
            }
            if (handlers.length === 0 && !finalizer) {
              throwError({}, Messages.NoCatchOrFinally);
            }
            return {
              type: Syntax.TryStatement,
              block: block,
              guardedHandlers: [],
              handlers: handlers,
              finalizer: finalizer,
            };
          }
          function parseDebuggerStatement() {
            expectKeyword("debugger");
            consumeSemicolon();
            return { type: Syntax.DebuggerStatement };
          }
          function parseStatement() {
            var token = lookahead(),
              expr,
              labeledBody;
            if (token.type === Token.EOF) {
              throwUnexpected(token);
            }
            if (token.type === Token.Punctuator) {
              switch (token.value) {
                case ";":
                  return parseEmptyStatement();
                case "{":
                  return parseBlock();
                case "(":
                  return parseExpressionStatement();
                default:
                  break;
              }
            }
            if (token.type === Token.Keyword) {
              switch (token.value) {
                case "break":
                  return parseBreakStatement();
                case "continue":
                  return parseContinueStatement();
                case "debugger":
                  return parseDebuggerStatement();
                case "do":
                  return parseDoWhileStatement();
                case "for":
                  return parseForStatement();
                case "function":
                  return parseFunctionDeclaration();
                case "if":
                  return parseIfStatement();
                case "return":
                  return parseReturnStatement();
                case "switch":
                  return parseSwitchStatement();
                case "throw":
                  return parseThrowStatement();
                case "try":
                  return parseTryStatement();
                case "var":
                  return parseVariableStatement();
                case "while":
                  return parseWhileStatement();
                case "with":
                  return parseWithStatement();
                default:
                  break;
              }
            }
            expr = parseExpression();
            if (expr.type === Syntax.Identifier && match(":")) {
              lex();
              if (
                Object.prototype.hasOwnProperty.call(state.labelSet, expr.name)
              ) {
                throwError({}, Messages.Redeclaration, "Label", expr.name);
              }
              state.labelSet[expr.name] = true;
              labeledBody = parseStatement();
              delete state.labelSet[expr.name];
              return {
                type: Syntax.LabeledStatement,
                label: expr,
                body: labeledBody,
              };
            }
            consumeSemicolon();
            return { type: Syntax.ExpressionStatement, expression: expr };
          }
          function parseFunctionSourceElements() {
            var sourceElement,
              sourceElements = [],
              token,
              directive,
              firstRestricted,
              oldLabelSet,
              oldInIteration,
              oldInSwitch,
              oldInFunctionBody;
            expect("{");
            while (index < length) {
              token = lookahead();
              if (token.type !== Token.StringLiteral) {
                break;
              }
              sourceElement = parseSourceElement();
              sourceElements.push(sourceElement);
              if (sourceElement.expression.type !== Syntax.Literal) {
                break;
              }
              directive = sliceSource(token.range[0] + 1, token.range[1] - 1);
              if (directive === "use strict") {
                strict = true;
                if (firstRestricted) {
                  throwErrorTolerant(
                    firstRestricted,
                    Messages.StrictOctalLiteral
                  );
                }
              } else {
                if (!firstRestricted && token.octal) {
                  firstRestricted = token;
                }
              }
            }
            oldLabelSet = state.labelSet;
            oldInIteration = state.inIteration;
            oldInSwitch = state.inSwitch;
            oldInFunctionBody = state.inFunctionBody;
            state.labelSet = {};
            state.inIteration = false;
            state.inSwitch = false;
            state.inFunctionBody = true;
            while (index < length) {
              if (match("}")) {
                break;
              }
              sourceElement = parseSourceElement();
              if (typeof sourceElement === "undefined") {
                break;
              }
              sourceElements.push(sourceElement);
            }
            expect("}");
            state.labelSet = oldLabelSet;
            state.inIteration = oldInIteration;
            state.inSwitch = oldInSwitch;
            state.inFunctionBody = oldInFunctionBody;
            return { type: Syntax.BlockStatement, body: sourceElements };
          }
          function parseFunctionDeclaration() {
            var id,
              param,
              params = [],
              body,
              token,
              stricted,
              firstRestricted,
              message,
              previousStrict,
              paramSet;
            expectKeyword("function");
            token = lookahead();
            id = parseVariableIdentifier();
            if (strict) {
              if (isRestrictedWord(token.value)) {
                throwErrorTolerant(token, Messages.StrictFunctionName);
              }
            } else {
              if (isRestrictedWord(token.value)) {
                firstRestricted = token;
                message = Messages.StrictFunctionName;
              } else if (isStrictModeReservedWord(token.value)) {
                firstRestricted = token;
                message = Messages.StrictReservedWord;
              }
            }
            expect("(");
            if (!match(")")) {
              paramSet = {};
              while (index < length) {
                token = lookahead();
                param = parseVariableIdentifier();
                if (strict) {
                  if (isRestrictedWord(token.value)) {
                    stricted = token;
                    message = Messages.StrictParamName;
                  }
                  if (
                    Object.prototype.hasOwnProperty.call(paramSet, token.value)
                  ) {
                    stricted = token;
                    message = Messages.StrictParamDupe;
                  }
                } else if (!firstRestricted) {
                  if (isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictParamName;
                  } else if (isStrictModeReservedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                  } else if (
                    Object.prototype.hasOwnProperty.call(paramSet, token.value)
                  ) {
                    firstRestricted = token;
                    message = Messages.StrictParamDupe;
                  }
                }
                params.push(param);
                paramSet[param.name] = true;
                if (match(")")) {
                  break;
                }
                expect(",");
              }
            }
            expect(")");
            previousStrict = strict;
            body = parseFunctionSourceElements();
            if (strict && firstRestricted) {
              throwError(firstRestricted, message);
            }
            if (strict && stricted) {
              throwErrorTolerant(stricted, message);
            }
            strict = previousStrict;
            return {
              type: Syntax.FunctionDeclaration,
              id: id,
              params: params,
              defaults: [],
              body: body,
              rest: null,
              generator: false,
              expression: false,
            };
          }
          function parseFunctionExpression() {
            var token,
              id = null,
              stricted,
              firstRestricted,
              message,
              param,
              params = [],
              body,
              previousStrict,
              paramSet;
            expectKeyword("function");
            if (!match("(")) {
              token = lookahead();
              id = parseVariableIdentifier();
              if (strict) {
                if (isRestrictedWord(token.value)) {
                  throwErrorTolerant(token, Messages.StrictFunctionName);
                }
              } else {
                if (isRestrictedWord(token.value)) {
                  firstRestricted = token;
                  message = Messages.StrictFunctionName;
                } else if (isStrictModeReservedWord(token.value)) {
                  firstRestricted = token;
                  message = Messages.StrictReservedWord;
                }
              }
            }
            expect("(");
            if (!match(")")) {
              paramSet = {};
              while (index < length) {
                token = lookahead();
                param = parseVariableIdentifier();
                if (strict) {
                  if (isRestrictedWord(token.value)) {
                    stricted = token;
                    message = Messages.StrictParamName;
                  }
                  if (
                    Object.prototype.hasOwnProperty.call(paramSet, token.value)
                  ) {
                    stricted = token;
                    message = Messages.StrictParamDupe;
                  }
                } else if (!firstRestricted) {
                  if (isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictParamName;
                  } else if (isStrictModeReservedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                  } else if (
                    Object.prototype.hasOwnProperty.call(paramSet, token.value)
                  ) {
                    firstRestricted = token;
                    message = Messages.StrictParamDupe;
                  }
                }
                params.push(param);
                paramSet[param.name] = true;
                if (match(")")) {
                  break;
                }
                expect(",");
              }
            }
            expect(")");
            previousStrict = strict;
            body = parseFunctionSourceElements();
            if (strict && firstRestricted) {
              throwError(firstRestricted, message);
            }
            if (strict && stricted) {
              throwErrorTolerant(stricted, message);
            }
            strict = previousStrict;
            return {
              type: Syntax.FunctionExpression,
              id: id,
              params: params,
              defaults: [],
              body: body,
              rest: null,
              generator: false,
              expression: false,
            };
          }
          function parseSourceElement() {
            var token = lookahead();
            if (token.type === Token.Keyword) {
              switch (token.value) {
                case "const":
                case "let":
                  return parseConstLetDeclaration(token.value);
                case "function":
                  return parseFunctionDeclaration();
                default:
                  return parseStatement();
              }
            }
            if (token.type !== Token.EOF) {
              return parseStatement();
            }
          }
          function parseSourceElements() {
            var sourceElement,
              sourceElements = [],
              token,
              directive,
              firstRestricted;
            while (index < length) {
              token = lookahead();
              if (token.type !== Token.StringLiteral) {
                break;
              }
              sourceElement = parseSourceElement();
              sourceElements.push(sourceElement);
              if (sourceElement.expression.type !== Syntax.Literal) {
                break;
              }
              directive = sliceSource(token.range[0] + 1, token.range[1] - 1);
              if (directive === "use strict") {
                strict = true;
                if (firstRestricted) {
                  throwErrorTolerant(
                    firstRestricted,
                    Messages.StrictOctalLiteral
                  );
                }
              } else {
                if (!firstRestricted && token.octal) {
                  firstRestricted = token;
                }
              }
            }
            while (index < length) {
              sourceElement = parseSourceElement();
              if (typeof sourceElement === "undefined") {
                break;
              }
              sourceElements.push(sourceElement);
            }
            return sourceElements;
          }
          function parseProgram() {
            var program;
            strict = false;
            program = { type: Syntax.Program, body: parseSourceElements() };
            return program;
          }
          function addComment(type, value, start, end, loc) {
            assert(
              typeof start === "number",
              "Comment must have valid position"
            );
            if (extra.comments.length > 0) {
              if (extra.comments[extra.comments.length - 1].range[1] > start) {
                return;
              }
            }
            extra.comments.push({
              type: type,
              value: value,
              range: [start, end],
              loc: loc,
            });
          }
          function scanComment() {
            var comment, ch, loc, start, blockComment, lineComment;
            comment = "";
            blockComment = false;
            lineComment = false;
            while (index < length) {
              ch = source[index];
              if (lineComment) {
                ch = source[index++];
                if (isLineTerminator(ch)) {
                  loc.end = { line: lineNumber, column: index - lineStart - 1 };
                  lineComment = false;
                  addComment("Line", comment, start, index - 1, loc);
                  if (ch === "\r" && source[index] === "\n") {
                    ++index;
                  }
                  ++lineNumber;
                  lineStart = index;
                  comment = "";
                } else if (index >= length) {
                  lineComment = false;
                  comment += ch;
                  loc.end = { line: lineNumber, column: length - lineStart };
                  addComment("Line", comment, start, length, loc);
                } else {
                  comment += ch;
                }
              } else if (blockComment) {
                if (isLineTerminator(ch)) {
                  if (ch === "\r" && source[index + 1] === "\n") {
                    ++index;
                    comment += "\r\n";
                  } else {
                    comment += ch;
                  }
                  ++lineNumber;
                  ++index;
                  lineStart = index;
                  if (index >= length) {
                    throwError({}, Messages.UnexpectedToken, "ILLEGAL");
                  }
                } else {
                  ch = source[index++];
                  if (index >= length) {
                    throwError({}, Messages.UnexpectedToken, "ILLEGAL");
                  }
                  comment += ch;
                  if (ch === "*") {
                    ch = source[index];
                    if (ch === "/") {
                      comment = comment.substr(0, comment.length - 1);
                      blockComment = false;
                      ++index;
                      loc.end = { line: lineNumber, column: index - lineStart };
                      addComment("Block", comment, start, index, loc);
                      comment = "";
                    }
                  }
                }
              } else if (ch === "/") {
                ch = source[index + 1];
                if (ch === "/") {
                  loc = {
                    start: { line: lineNumber, column: index - lineStart },
                  };
                  start = index;
                  index += 2;
                  lineComment = true;
                  if (index >= length) {
                    loc.end = { line: lineNumber, column: index - lineStart };
                    lineComment = false;
                    addComment("Line", comment, start, index, loc);
                  }
                } else if (ch === "*") {
                  start = index;
                  index += 2;
                  blockComment = true;
                  loc = {
                    start: { line: lineNumber, column: index - lineStart - 2 },
                  };
                  if (index >= length) {
                    throwError({}, Messages.UnexpectedToken, "ILLEGAL");
                  }
                } else {
                  break;
                }
              } else if (isWhiteSpace(ch)) {
                ++index;
              } else if (isLineTerminator(ch)) {
                ++index;
                if (ch === "\r" && source[index] === "\n") {
                  ++index;
                }
                ++lineNumber;
                lineStart = index;
              } else {
                break;
              }
            }
          }
          function filterCommentLocation() {
            var i,
              entry,
              comment,
              comments = [];
            for (i = 0; i < extra.comments.length; ++i) {
              entry = extra.comments[i];
              comment = { type: entry.type, value: entry.value };
              if (extra.range) {
                comment.range = entry.range;
              }
              if (extra.loc) {
                comment.loc = entry.loc;
              }
              comments.push(comment);
            }
            extra.comments = comments;
          }
          function collectToken() {
            var start, loc, token, range, value;
            skipComment();
            start = index;
            loc = { start: { line: lineNumber, column: index - lineStart } };
            token = extra.advance();
            loc.end = { line: lineNumber, column: index - lineStart };
            if (token.type !== Token.EOF) {
              range = [token.range[0], token.range[1]];
              value = sliceSource(token.range[0], token.range[1]);
              extra.tokens.push({
                type: TokenName[token.type],
                value: value,
                range: range,
                loc: loc,
              });
            }
            return token;
          }
          function collectRegex() {
            var pos, loc, regex, token;
            skipComment();
            pos = index;
            loc = { start: { line: lineNumber, column: index - lineStart } };
            regex = extra.scanRegExp();
            loc.end = { line: lineNumber, column: index - lineStart };
            if (extra.tokens.length > 0) {
              token = extra.tokens[extra.tokens.length - 1];
              if (token.range[0] === pos && token.type === "Punctuator") {
                if (token.value === "/" || token.value === "/=") {
                  extra.tokens.pop();
                }
              }
            }
            extra.tokens.push({
              type: "RegularExpression",
              value: regex.literal,
              range: [pos, index],
              loc: loc,
            });
            return regex;
          }
          function filterTokenLocation() {
            var i,
              entry,
              token,
              tokens = [];
            for (i = 0; i < extra.tokens.length; ++i) {
              entry = extra.tokens[i];
              token = { type: entry.type, value: entry.value };
              if (extra.range) {
                token.range = entry.range;
              }
              if (extra.loc) {
                token.loc = entry.loc;
              }
              tokens.push(token);
            }
            extra.tokens = tokens;
          }
          function createLiteral(token) {
            return { type: Syntax.Literal, value: token.value };
          }
          function createRawLiteral(token) {
            return {
              type: Syntax.Literal,
              value: token.value,
              raw: sliceSource(token.range[0], token.range[1]),
            };
          }
          function createLocationMarker() {
            var marker = {};
            marker.range = [index, index];
            marker.loc = {
              start: { line: lineNumber, column: index - lineStart },
              end: { line: lineNumber, column: index - lineStart },
            };
            marker.end = function () {
              this.range[1] = index;
              this.loc.end.line = lineNumber;
              this.loc.end.column = index - lineStart;
            };
            marker.applyGroup = function (node) {
              if (extra.range) {
                node.groupRange = [this.range[0], this.range[1]];
              }
              if (extra.loc) {
                node.groupLoc = {
                  start: {
                    line: this.loc.start.line,
                    column: this.loc.start.column,
                  },
                  end: { line: this.loc.end.line, column: this.loc.end.column },
                };
              }
            };
            marker.apply = function (node) {
              if (extra.range) {
                node.range = [this.range[0], this.range[1]];
              }
              if (extra.loc) {
                node.loc = {
                  start: {
                    line: this.loc.start.line,
                    column: this.loc.start.column,
                  },
                  end: { line: this.loc.end.line, column: this.loc.end.column },
                };
              }
            };
            return marker;
          }
          function trackGroupExpression() {
            var marker, expr;
            skipComment();
            marker = createLocationMarker();
            expect("(");
            expr = parseExpression();
            expect(")");
            marker.end();
            marker.applyGroup(expr);
            return expr;
          }
          function trackLeftHandSideExpression() {
            var marker, expr;
            skipComment();
            marker = createLocationMarker();
            expr = matchKeyword("new")
              ? parseNewExpression()
              : parsePrimaryExpression();
            while (match(".") || match("[")) {
              if (match("[")) {
                expr = {
                  type: Syntax.MemberExpression,
                  computed: true,
                  object: expr,
                  property: parseComputedMember(),
                };
                marker.end();
                marker.apply(expr);
              } else {
                expr = {
                  type: Syntax.MemberExpression,
                  computed: false,
                  object: expr,
                  property: parseNonComputedMember(),
                };
                marker.end();
                marker.apply(expr);
              }
            }
            return expr;
          }
          function trackLeftHandSideExpressionAllowCall() {
            var marker, expr;
            skipComment();
            marker = createLocationMarker();
            expr = matchKeyword("new")
              ? parseNewExpression()
              : parsePrimaryExpression();
            while (match(".") || match("[") || match("(")) {
              if (match("(")) {
                expr = {
                  type: Syntax.CallExpression,
                  callee: expr,
                  arguments: parseArguments(),
                };
                marker.end();
                marker.apply(expr);
              } else if (match("[")) {
                expr = {
                  type: Syntax.MemberExpression,
                  computed: true,
                  object: expr,
                  property: parseComputedMember(),
                };
                marker.end();
                marker.apply(expr);
              } else {
                expr = {
                  type: Syntax.MemberExpression,
                  computed: false,
                  object: expr,
                  property: parseNonComputedMember(),
                };
                marker.end();
                marker.apply(expr);
              }
            }
            return expr;
          }
          function filterGroup(node) {
            var n, i, entry;
            n =
              Object.prototype.toString.apply(node) === "[object Array]"
                ? []
                : {};
            for (i in node) {
              if (
                node.hasOwnProperty(i) &&
                i !== "groupRange" &&
                i !== "groupLoc"
              ) {
                entry = node[i];
                if (
                  entry === null ||
                  typeof entry !== "object" ||
                  entry instanceof RegExp
                ) {
                  n[i] = entry;
                } else {
                  n[i] = filterGroup(entry);
                }
              }
            }
            return n;
          }
          function wrapTrackingFunction(range, loc) {
            return function (parseFunction) {
              function isBinary(node) {
                return (
                  node.type === Syntax.LogicalExpression ||
                  node.type === Syntax.BinaryExpression
                );
              }
              function visit(node) {
                var start, end;
                if (isBinary(node.left)) {
                  visit(node.left);
                }
                if (isBinary(node.right)) {
                  visit(node.right);
                }
                if (range) {
                  if (node.left.groupRange || node.right.groupRange) {
                    start = node.left.groupRange
                      ? node.left.groupRange[0]
                      : node.left.range[0];
                    end = node.right.groupRange
                      ? node.right.groupRange[1]
                      : node.right.range[1];
                    node.range = [start, end];
                  } else if (typeof node.range === "undefined") {
                    start = node.left.range[0];
                    end = node.right.range[1];
                    node.range = [start, end];
                  }
                }
                if (loc) {
                  if (node.left.groupLoc || node.right.groupLoc) {
                    start = node.left.groupLoc
                      ? node.left.groupLoc.start
                      : node.left.loc.start;
                    end = node.right.groupLoc
                      ? node.right.groupLoc.end
                      : node.right.loc.end;
                    node.loc = { start: start, end: end };
                  } else if (typeof node.loc === "undefined") {
                    node.loc = {
                      start: node.left.loc.start,
                      end: node.right.loc.end,
                    };
                  }
                }
              }
              return function () {
                var marker, node;
                skipComment();
                marker = createLocationMarker();
                node = parseFunction.apply(null, arguments);
                marker.end();
                if (range && typeof node.range === "undefined") {
                  marker.apply(node);
                }
                if (loc && typeof node.loc === "undefined") {
                  marker.apply(node);
                }
                if (isBinary(node)) {
                  visit(node);
                }
                return node;
              };
            };
          }
          function patch() {
            var wrapTracking;
            if (extra.comments) {
              extra.skipComment = skipComment;
              skipComment = scanComment;
            }
            if (extra.raw) {
              extra.createLiteral = createLiteral;
              createLiteral = createRawLiteral;
            }
            if (extra.range || extra.loc) {
              extra.parseGroupExpression = parseGroupExpression;
              extra.parseLeftHandSideExpression = parseLeftHandSideExpression;
              extra.parseLeftHandSideExpressionAllowCall =
                parseLeftHandSideExpressionAllowCall;
              parseGroupExpression = trackGroupExpression;
              parseLeftHandSideExpression = trackLeftHandSideExpression;
              parseLeftHandSideExpressionAllowCall =
                trackLeftHandSideExpressionAllowCall;
              wrapTracking = wrapTrackingFunction(extra.range, extra.loc);
              extra.parseAdditiveExpression = parseAdditiveExpression;
              extra.parseAssignmentExpression = parseAssignmentExpression;
              extra.parseBitwiseANDExpression = parseBitwiseANDExpression;
              extra.parseBitwiseORExpression = parseBitwiseORExpression;
              extra.parseBitwiseXORExpression = parseBitwiseXORExpression;
              extra.parseBlock = parseBlock;
              extra.parseFunctionSourceElements = parseFunctionSourceElements;
              extra.parseCatchClause = parseCatchClause;
              extra.parseComputedMember = parseComputedMember;
              extra.parseConditionalExpression = parseConditionalExpression;
              extra.parseConstLetDeclaration = parseConstLetDeclaration;
              extra.parseEqualityExpression = parseEqualityExpression;
              extra.parseExpression = parseExpression;
              extra.parseForVariableDeclaration = parseForVariableDeclaration;
              extra.parseFunctionDeclaration = parseFunctionDeclaration;
              extra.parseFunctionExpression = parseFunctionExpression;
              extra.parseLogicalANDExpression = parseLogicalANDExpression;
              extra.parseLogicalORExpression = parseLogicalORExpression;
              extra.parseMultiplicativeExpression =
                parseMultiplicativeExpression;
              extra.parseNewExpression = parseNewExpression;
              extra.parseNonComputedProperty = parseNonComputedProperty;
              extra.parseObjectProperty = parseObjectProperty;
              extra.parseObjectPropertyKey = parseObjectPropertyKey;
              extra.parsePostfixExpression = parsePostfixExpression;
              extra.parsePrimaryExpression = parsePrimaryExpression;
              extra.parseProgram = parseProgram;
              extra.parsePropertyFunction = parsePropertyFunction;
              extra.parseRelationalExpression = parseRelationalExpression;
              extra.parseStatement = parseStatement;
              extra.parseShiftExpression = parseShiftExpression;
              extra.parseSwitchCase = parseSwitchCase;
              extra.parseUnaryExpression = parseUnaryExpression;
              extra.parseVariableDeclaration = parseVariableDeclaration;
              extra.parseVariableIdentifier = parseVariableIdentifier;
              parseAdditiveExpression = wrapTracking(
                extra.parseAdditiveExpression
              );
              parseAssignmentExpression = wrapTracking(
                extra.parseAssignmentExpression
              );
              parseBitwiseANDExpression = wrapTracking(
                extra.parseBitwiseANDExpression
              );
              parseBitwiseORExpression = wrapTracking(
                extra.parseBitwiseORExpression
              );
              parseBitwiseXORExpression = wrapTracking(
                extra.parseBitwiseXORExpression
              );
              parseBlock = wrapTracking(extra.parseBlock);
              parseFunctionSourceElements = wrapTracking(
                extra.parseFunctionSourceElements
              );
              parseCatchClause = wrapTracking(extra.parseCatchClause);
              parseComputedMember = wrapTracking(extra.parseComputedMember);
              parseConditionalExpression = wrapTracking(
                extra.parseConditionalExpression
              );
              parseConstLetDeclaration = wrapTracking(
                extra.parseConstLetDeclaration
              );
              parseEqualityExpression = wrapTracking(
                extra.parseEqualityExpression
              );
              parseExpression = wrapTracking(extra.parseExpression);
              parseForVariableDeclaration = wrapTracking(
                extra.parseForVariableDeclaration
              );
              parseFunctionDeclaration = wrapTracking(
                extra.parseFunctionDeclaration
              );
              parseFunctionExpression = wrapTracking(
                extra.parseFunctionExpression
              );
              parseLeftHandSideExpression = wrapTracking(
                parseLeftHandSideExpression
              );
              parseLogicalANDExpression = wrapTracking(
                extra.parseLogicalANDExpression
              );
              parseLogicalORExpression = wrapTracking(
                extra.parseLogicalORExpression
              );
              parseMultiplicativeExpression = wrapTracking(
                extra.parseMultiplicativeExpression
              );
              parseNewExpression = wrapTracking(extra.parseNewExpression);
              parseNonComputedProperty = wrapTracking(
                extra.parseNonComputedProperty
              );
              parseObjectProperty = wrapTracking(extra.parseObjectProperty);
              parseObjectPropertyKey = wrapTracking(
                extra.parseObjectPropertyKey
              );
              parsePostfixExpression = wrapTracking(
                extra.parsePostfixExpression
              );
              parsePrimaryExpression = wrapTracking(
                extra.parsePrimaryExpression
              );
              parseProgram = wrapTracking(extra.parseProgram);
              parsePropertyFunction = wrapTracking(extra.parsePropertyFunction);
              parseRelationalExpression = wrapTracking(
                extra.parseRelationalExpression
              );
              parseStatement = wrapTracking(extra.parseStatement);
              parseShiftExpression = wrapTracking(extra.parseShiftExpression);
              parseSwitchCase = wrapTracking(extra.parseSwitchCase);
              parseUnaryExpression = wrapTracking(extra.parseUnaryExpression);
              parseVariableDeclaration = wrapTracking(
                extra.parseVariableDeclaration
              );
              parseVariableIdentifier = wrapTracking(
                extra.parseVariableIdentifier
              );
            }
            if (typeof extra.tokens !== "undefined") {
              extra.advance = advance;
              extra.scanRegExp = scanRegExp;
              advance = collectToken;
              scanRegExp = collectRegex;
            }
          }
          function unpatch() {
            if (typeof extra.skipComment === "function") {
              skipComment = extra.skipComment;
            }
            if (extra.raw) {
              createLiteral = extra.createLiteral;
            }
            if (extra.range || extra.loc) {
              parseAdditiveExpression = extra.parseAdditiveExpression;
              parseAssignmentExpression = extra.parseAssignmentExpression;
              parseBitwiseANDExpression = extra.parseBitwiseANDExpression;
              parseBitwiseORExpression = extra.parseBitwiseORExpression;
              parseBitwiseXORExpression = extra.parseBitwiseXORExpression;
              parseBlock = extra.parseBlock;
              parseFunctionSourceElements = extra.parseFunctionSourceElements;
              parseCatchClause = extra.parseCatchClause;
              parseComputedMember = extra.parseComputedMember;
              parseConditionalExpression = extra.parseConditionalExpression;
              parseConstLetDeclaration = extra.parseConstLetDeclaration;
              parseEqualityExpression = extra.parseEqualityExpression;
              parseExpression = extra.parseExpression;
              parseForVariableDeclaration = extra.parseForVariableDeclaration;
              parseFunctionDeclaration = extra.parseFunctionDeclaration;
              parseFunctionExpression = extra.parseFunctionExpression;
              parseGroupExpression = extra.parseGroupExpression;
              parseLeftHandSideExpression = extra.parseLeftHandSideExpression;
              parseLeftHandSideExpressionAllowCall =
                extra.parseLeftHandSideExpressionAllowCall;
              parseLogicalANDExpression = extra.parseLogicalANDExpression;
              parseLogicalORExpression = extra.parseLogicalORExpression;
              parseMultiplicativeExpression =
                extra.parseMultiplicativeExpression;
              parseNewExpression = extra.parseNewExpression;
              parseNonComputedProperty = extra.parseNonComputedProperty;
              parseObjectProperty = extra.parseObjectProperty;
              parseObjectPropertyKey = extra.parseObjectPropertyKey;
              parsePrimaryExpression = extra.parsePrimaryExpression;
              parsePostfixExpression = extra.parsePostfixExpression;
              parseProgram = extra.parseProgram;
              parsePropertyFunction = extra.parsePropertyFunction;
              parseRelationalExpression = extra.parseRelationalExpression;
              parseStatement = extra.parseStatement;
              parseShiftExpression = extra.parseShiftExpression;
              parseSwitchCase = extra.parseSwitchCase;
              parseUnaryExpression = extra.parseUnaryExpression;
              parseVariableDeclaration = extra.parseVariableDeclaration;
              parseVariableIdentifier = extra.parseVariableIdentifier;
            }
            if (typeof extra.scanRegExp === "function") {
              advance = extra.advance;
              scanRegExp = extra.scanRegExp;
            }
          }
          function stringToArray(str) {
            var length = str.length,
              result = [],
              i;
            for (i = 0; i < length; ++i) {
              result[i] = str.charAt(i);
            }
            return result;
          }
          function parse(code, options) {
            var program, toString;
            toString = String;
            if (typeof code !== "string" && !(code instanceof String)) {
              code = toString(code);
            }
            source = code;
            index = 0;
            lineNumber = source.length > 0 ? 1 : 0;
            lineStart = 0;
            length = source.length;
            buffer = null;
            state = {
              allowIn: true,
              labelSet: {},
              inFunctionBody: false,
              inIteration: false,
              inSwitch: false,
            };
            extra = {};
            if (typeof options !== "undefined") {
              extra.range = typeof options.range === "boolean" && options.range;
              extra.loc = typeof options.loc === "boolean" && options.loc;
              extra.raw = typeof options.raw === "boolean" && options.raw;
              if (typeof options.tokens === "boolean" && options.tokens) {
                extra.tokens = [];
              }
              if (typeof options.comment === "boolean" && options.comment) {
                extra.comments = [];
              }
              if (typeof options.tolerant === "boolean" && options.tolerant) {
                extra.errors = [];
              }
            }
            if (length > 0) {
              if (typeof source[0] === "undefined") {
                if (code instanceof String) {
                  source = code.valueOf();
                }
                if (typeof source[0] === "undefined") {
                  source = stringToArray(code);
                }
              }
            }
            patch();
            try {
              program = parseProgram();
              if (typeof extra.comments !== "undefined") {
                filterCommentLocation();
                program.comments = extra.comments;
              }
              if (typeof extra.tokens !== "undefined") {
                filterTokenLocation();
                program.tokens = extra.tokens;
              }
              if (typeof extra.errors !== "undefined") {
                program.errors = extra.errors;
              }
              if (extra.range || extra.loc) {
                program.body = filterGroup(program.body);
              }
            } catch (e) {
              throw e;
            } finally {
              unpatch();
              extra = {};
            }
            return program;
          }
          exports.version = "1.0.4";
          exports.parse = parse;
          exports.Syntax = (function () {
            var name,
              types = {};
            if (typeof Object.create === "function") {
              types = Object.create(null);
            }
            for (name in Syntax) {
              if (Syntax.hasOwnProperty(name)) {
                types[name] = Syntax[name];
              }
            }
            if (typeof Object.freeze === "function") {
              Object.freeze(types);
            }
            return types;
          })();
        });
      },
      {},
    ],
    7: [
      function (require, module, exports) {
        arguments[4][4][0].apply(exports, arguments);
      },
      { dup: 4 },
    ],
    cwise: [
      function (require, module, exports) {
        "use strict";
        var parse = require("cwise-parser");
        var compile = require("cwise-compiler");
        var REQUIRED_FIELDS = ["args", "body"];
        var OPTIONAL_FIELDS = [
          "pre",
          "post",
          "printCode",
          "funcName",
          "blockSize",
        ];
        function createCWise(user_args) {
          for (var id in user_args) {
            if (
              REQUIRED_FIELDS.indexOf(id) < 0 &&
              OPTIONAL_FIELDS.indexOf(id) < 0
            ) {
              console.warn(
                "cwise: Unknown argument '" +
                  id +
                  "' passed to expression compiler"
              );
            }
          }
          for (var i = 0; i < REQUIRED_FIELDS.length; ++i) {
            if (!user_args[REQUIRED_FIELDS[i]]) {
              throw new Error("cwise: Missing argument: " + REQUIRED_FIELDS[i]);
            }
          }
          return compile({
            args: user_args.args,
            pre: parse(user_args.pre || function () {}),
            body: parse(user_args.body),
            post: parse(user_args.post || function () {}),
            debug: !!user_args.printCode,
            funcName: user_args.funcName || user_args.body.name || "cwise",
            blockSize: user_args.blockSize || 64,
          });
        }
        module.exports = createCWise;
      },
      { "cwise-compiler": 1, "cwise-parser": 5 },
    ],
  },
  {},
  []
);
require = (function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw ((f.code = "MODULE_NOT_FOUND"), f);
      }
      var l = (n[o] = { exports: {} });
      t[o][0].call(
        l.exports,
        function (e) {
          var n = t[o][1][e];
          return s(n ? n : e);
        },
        l,
        l.exports,
        e,
        t,
        n,
        r
      );
    }
    return n[o].exports;
  }
  var i = typeof require == "function" && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
})(
  {
    1: [
      function (require, module, exports) {
        "use strict";
        var createThunk = require("./lib/thunk.js");
        function Procedure() {
          this.argTypes = [];
          this.shimArgs = [];
          this.arrayArgs = [];
          this.arrayBlockIndices = [];
          this.scalarArgs = [];
          this.offsetArgs = [];
          this.offsetArgIndex = [];
          this.indexArgs = [];
          this.shapeArgs = [];
          this.funcName = "";
          this.pre = null;
          this.body = null;
          this.post = null;
          this.debug = false;
        }
        function compileCwise(user_args) {
          var proc = new Procedure();
          proc.pre = user_args.pre;
          proc.body = user_args.body;
          proc.post = user_args.post;
          var proc_args = user_args.args.slice(0);
          proc.argTypes = proc_args;
          for (var i = 0; i < proc_args.length; ++i) {
            var arg_type = proc_args[i];
            if (
              arg_type === "array" ||
              (typeof arg_type === "object" && arg_type.blockIndices)
            ) {
              proc.argTypes[i] = "array";
              proc.arrayArgs.push(i);
              proc.arrayBlockIndices.push(
                arg_type.blockIndices ? arg_type.blockIndices : 0
              );
              proc.shimArgs.push("array" + i);
              if (i < proc.pre.args.length && proc.pre.args[i].count > 0) {
                throw new Error(
                  "cwise: pre() block may not reference array args"
                );
              }
              if (i < proc.post.args.length && proc.post.args[i].count > 0) {
                throw new Error(
                  "cwise: post() block may not reference array args"
                );
              }
            } else if (arg_type === "scalar") {
              proc.scalarArgs.push(i);
              proc.shimArgs.push("scalar" + i);
            } else if (arg_type === "index") {
              proc.indexArgs.push(i);
              if (i < proc.pre.args.length && proc.pre.args[i].count > 0) {
                throw new Error(
                  "cwise: pre() block may not reference array index"
                );
              }
              if (i < proc.body.args.length && proc.body.args[i].lvalue) {
                throw new Error(
                  "cwise: body() block may not write to array index"
                );
              }
              if (i < proc.post.args.length && proc.post.args[i].count > 0) {
                throw new Error(
                  "cwise: post() block may not reference array index"
                );
              }
            } else if (arg_type === "shape") {
              proc.shapeArgs.push(i);
              if (i < proc.pre.args.length && proc.pre.args[i].lvalue) {
                throw new Error(
                  "cwise: pre() block may not write to array shape"
                );
              }
              if (i < proc.body.args.length && proc.body.args[i].lvalue) {
                throw new Error(
                  "cwise: body() block may not write to array shape"
                );
              }
              if (i < proc.post.args.length && proc.post.args[i].lvalue) {
                throw new Error(
                  "cwise: post() block may not write to array shape"
                );
              }
            } else if (typeof arg_type === "object" && arg_type.offset) {
              proc.argTypes[i] = "offset";
              proc.offsetArgs.push({
                array: arg_type.array,
                offset: arg_type.offset,
              });
              proc.offsetArgIndex.push(i);
            } else {
              throw new Error("cwise: Unknown argument type " + proc_args[i]);
            }
          }
          if (proc.arrayArgs.length <= 0) {
            throw new Error("cwise: No array arguments specified");
          }
          if (proc.pre.args.length > proc_args.length) {
            throw new Error("cwise: Too many arguments in pre() block");
          }
          if (proc.body.args.length > proc_args.length) {
            throw new Error("cwise: Too many arguments in body() block");
          }
          if (proc.post.args.length > proc_args.length) {
            throw new Error("cwise: Too many arguments in post() block");
          }
          proc.debug = !!user_args.printCode || !!user_args.debug;
          proc.funcName = user_args.funcName || "cwise";
          proc.blockSize = user_args.blockSize || 64;
          return createThunk(proc);
        }
        module.exports = compileCwise;
      },
      { "./lib/thunk.js": 3 },
    ],
    2: [
      function (require, module, exports) {
        "use strict";
        var uniq = require("uniq");
        function innerFill(order, proc, body) {
          var dimension = order.length,
            nargs = proc.arrayArgs.length,
            has_index = proc.indexArgs.length > 0,
            code = [],
            vars = [],
            idx = 0,
            pidx = 0,
            i,
            j;
          for (i = 0; i < dimension; ++i) {
            vars.push(["i", i, "=0"].join(""));
          }
          for (j = 0; j < nargs; ++j) {
            for (i = 0; i < dimension; ++i) {
              pidx = idx;
              idx = order[i];
              if (i === 0) {
                vars.push(["d", j, "s", i, "=t", j, "p", idx].join(""));
              } else {
                vars.push(
                  [
                    "d",
                    j,
                    "s",
                    i,
                    "=(t",
                    j,
                    "p",
                    idx,
                    "-s",
                    pidx,
                    "*t",
                    j,
                    "p",
                    pidx,
                    ")",
                  ].join("")
                );
              }
            }
          }
          code.push("var " + vars.join(","));
          for (i = dimension - 1; i >= 0; --i) {
            idx = order[i];
            code.push(
              ["for(i", i, "=0;i", i, "<s", idx, ";++i", i, "){"].join("")
            );
          }
          code.push(body);
          for (i = 0; i < dimension; ++i) {
            pidx = idx;
            idx = order[i];
            for (j = 0; j < nargs; ++j) {
              code.push(["p", j, "+=d", j, "s", i].join(""));
            }
            if (has_index) {
              if (i > 0) {
                code.push(["index[", pidx, "]-=s", pidx].join(""));
              }
              code.push(["++index[", idx, "]"].join(""));
            }
            code.push("}");
          }
          return code.join("\n");
        }
        function outerFill(matched, order, proc, body) {
          var dimension = order.length,
            nargs = proc.arrayArgs.length,
            blockSize = proc.blockSize,
            has_index = proc.indexArgs.length > 0,
            code = [];
          for (var i = 0; i < nargs; ++i) {
            code.push(["var offset", i, "=p", i].join(""));
          }
          for (var i = matched; i < dimension; ++i) {
            code.push(
              ["for(var j" + i + "=SS[", order[i], "]|0;j", i, ">0;){"].join("")
            );
            code.push(["if(j", i, "<", blockSize, "){"].join(""));
            code.push(["s", order[i], "=j", i].join(""));
            code.push(["j", i, "=0"].join(""));
            code.push(["}else{s", order[i], "=", blockSize].join(""));
            code.push(["j", i, "-=", blockSize, "}"].join(""));
            if (has_index) {
              code.push(["index[", order[i], "]=j", i].join(""));
            }
          }
          for (var i = 0; i < nargs; ++i) {
            var indexStr = ["offset" + i];
            for (var j = matched; j < dimension; ++j) {
              indexStr.push(["j", j, "*t", i, "p", order[j]].join(""));
            }
            code.push(["p", i, "=(", indexStr.join("+"), ")"].join(""));
          }
          code.push(innerFill(order, proc, body));
          for (var i = matched; i < dimension; ++i) {
            code.push("}");
          }
          return code.join("\n");
        }
        function countMatches(orders) {
          var matched = 0,
            dimension = orders[0].length;
          while (matched < dimension) {
            for (var j = 1; j < orders.length; ++j) {
              if (orders[j][matched] !== orders[0][matched]) {
                return matched;
              }
            }
            ++matched;
          }
          return matched;
        }
        function processBlock(block, proc, dtypes) {
          var code = block.body;
          var pre = [];
          var post = [];
          for (var i = 0; i < block.args.length; ++i) {
            var carg = block.args[i];
            if (carg.count <= 0) {
              continue;
            }
            var re = new RegExp(carg.name, "g");
            var ptrStr = "";
            var arrNum = proc.arrayArgs.indexOf(i);
            switch (proc.argTypes[i]) {
              case "offset":
                var offArgIndex = proc.offsetArgIndex.indexOf(i);
                var offArg = proc.offsetArgs[offArgIndex];
                arrNum = offArg.array;
                ptrStr = "+q" + offArgIndex;
              case "array":
                ptrStr = "p" + arrNum + ptrStr;
                var localStr = "l" + i;
                var arrStr = "a" + arrNum;
                if (proc.arrayBlockIndices[arrNum] === 0) {
                  if (carg.count === 1) {
                    if (dtypes[arrNum] === "generic") {
                      if (carg.lvalue) {
                        pre.push(
                          [
                            "var ",
                            localStr,
                            "=",
                            arrStr,
                            ".get(",
                            ptrStr,
                            ")",
                          ].join("")
                        );
                        code = code.replace(re, localStr);
                        post.push(
                          [arrStr, ".set(", ptrStr, ",", localStr, ")"].join("")
                        );
                      } else {
                        code = code.replace(
                          re,
                          [arrStr, ".get(", ptrStr, ")"].join("")
                        );
                      }
                    } else {
                      code = code.replace(
                        re,
                        [arrStr, "[", ptrStr, "]"].join("")
                      );
                    }
                  } else if (dtypes[arrNum] === "generic") {
                    pre.push(
                      [
                        "var ",
                        localStr,
                        "=",
                        arrStr,
                        ".get(",
                        ptrStr,
                        ")",
                      ].join("")
                    );
                    code = code.replace(re, localStr);
                    if (carg.lvalue) {
                      post.push(
                        [arrStr, ".set(", ptrStr, ",", localStr, ")"].join("")
                      );
                    }
                  } else {
                    pre.push(
                      ["var ", localStr, "=", arrStr, "[", ptrStr, "]"].join("")
                    );
                    code = code.replace(re, localStr);
                    if (carg.lvalue) {
                      post.push([arrStr, "[", ptrStr, "]=", localStr].join(""));
                    }
                  }
                } else {
                  var reStrArr = [carg.name],
                    ptrStrArr = [ptrStr];
                  for (
                    var j = 0;
                    j < Math.abs(proc.arrayBlockIndices[arrNum]);
                    j++
                  ) {
                    reStrArr.push("\\s*\\[([^\\]]+)\\]");
                    ptrStrArr.push("$" + (j + 1) + "*t" + arrNum + "b" + j);
                  }
                  re = new RegExp(reStrArr.join(""), "g");
                  ptrStr = ptrStrArr.join("+");
                  if (dtypes[arrNum] === "generic") {
                    throw new Error(
                      "cwise: Generic arrays not supported in combination with blocks!"
                    );
                  } else {
                    code = code.replace(
                      re,
                      [arrStr, "[", ptrStr, "]"].join("")
                    );
                  }
                }
                break;
              case "scalar":
                code = code.replace(re, "Y" + proc.scalarArgs.indexOf(i));
                break;
              case "index":
                code = code.replace(re, "index");
                break;
              case "shape":
                code = code.replace(re, "shape");
                break;
            }
          }
          return [pre.join("\n"), code, post.join("\n")].join("\n").trim();
        }
        function typeSummary(dtypes) {
          var summary = new Array(dtypes.length);
          var allEqual = true;
          for (var i = 0; i < dtypes.length; ++i) {
            var t = dtypes[i];
            var digits = t.match(/\d+/);
            if (!digits) {
              digits = "";
            } else {
              digits = digits[0];
            }
            if (t.charAt(0) === 0) {
              summary[i] = "u" + t.charAt(1) + digits;
            } else {
              summary[i] = t.charAt(0) + digits;
            }
            if (i > 0) {
              allEqual = allEqual && summary[i] === summary[i - 1];
            }
          }
          if (allEqual) {
            return summary[0];
          }
          return summary.join("");
        }
        function generateCWiseOp(proc, typesig) {
          var dimension =
            (typesig[1].length - Math.abs(proc.arrayBlockIndices[0])) | 0;
          var orders = new Array(proc.arrayArgs.length);
          var dtypes = new Array(proc.arrayArgs.length);
          for (var i = 0; i < proc.arrayArgs.length; ++i) {
            dtypes[i] = typesig[2 * i];
            orders[i] = typesig[2 * i + 1];
          }
          var blockBegin = [],
            blockEnd = [];
          var loopBegin = [],
            loopEnd = [];
          var loopOrders = [];
          for (var i = 0; i < proc.arrayArgs.length; ++i) {
            if (proc.arrayBlockIndices[i] < 0) {
              loopBegin.push(0);
              loopEnd.push(dimension);
              blockBegin.push(dimension);
              blockEnd.push(dimension + proc.arrayBlockIndices[i]);
            } else {
              loopBegin.push(proc.arrayBlockIndices[i]);
              loopEnd.push(proc.arrayBlockIndices[i] + dimension);
              blockBegin.push(0);
              blockEnd.push(proc.arrayBlockIndices[i]);
            }
            var newOrder = [];
            for (var j = 0; j < orders[i].length; j++) {
              if (loopBegin[i] <= orders[i][j] && orders[i][j] < loopEnd[i]) {
                newOrder.push(orders[i][j] - loopBegin[i]);
              }
            }
            loopOrders.push(newOrder);
          }
          var arglist = ["SS"];
          var code = ["'use strict'"];
          var vars = [];
          for (var j = 0; j < dimension; ++j) {
            vars.push(["s", j, "=SS[", j, "]"].join(""));
          }
          for (var i = 0; i < proc.arrayArgs.length; ++i) {
            arglist.push("a" + i);
            arglist.push("t" + i);
            arglist.push("p" + i);
            for (var j = 0; j < dimension; ++j) {
              vars.push(
                ["t", i, "p", j, "=t", i, "[", loopBegin[i] + j, "]"].join("")
              );
            }
            for (var j = 0; j < Math.abs(proc.arrayBlockIndices[i]); ++j) {
              vars.push(
                ["t", i, "b", j, "=t", i, "[", blockBegin[i] + j, "]"].join("")
              );
            }
          }
          for (var i = 0; i < proc.scalarArgs.length; ++i) {
            arglist.push("Y" + i);
          }
          if (proc.shapeArgs.length > 0) {
            vars.push("shape=SS.slice(0)");
          }
          if (proc.indexArgs.length > 0) {
            var zeros = new Array(dimension);
            for (var i = 0; i < dimension; ++i) {
              zeros[i] = "0";
            }
            vars.push(["index=[", zeros.join(","), "]"].join(""));
          }
          for (var i = 0; i < proc.offsetArgs.length; ++i) {
            var off_arg = proc.offsetArgs[i];
            var init_string = [];
            for (var j = 0; j < off_arg.offset.length; ++j) {
              if (off_arg.offset[j] === 0) {
                continue;
              } else if (off_arg.offset[j] === 1) {
                init_string.push(["t", off_arg.array, "p", j].join(""));
              } else {
                init_string.push(
                  [off_arg.offset[j], "*t", off_arg.array, "p", j].join("")
                );
              }
            }
            if (init_string.length === 0) {
              vars.push("q" + i + "=0");
            } else {
              vars.push(["q", i, "=", init_string.join("+")].join(""));
            }
          }
          var thisVars = uniq(
            []
              .concat(proc.pre.thisVars)
              .concat(proc.body.thisVars)
              .concat(proc.post.thisVars)
          );
          vars = vars.concat(thisVars);
          code.push("var " + vars.join(","));
          for (var i = 0; i < proc.arrayArgs.length; ++i) {
            code.push("p" + i + "|=0");
          }
          if (proc.pre.body.length > 3) {
            code.push(processBlock(proc.pre, proc, dtypes));
          }
          var body = processBlock(proc.body, proc, dtypes);
          var matched = countMatches(loopOrders);
          if (matched < dimension) {
            code.push(outerFill(matched, loopOrders[0], proc, body));
          } else {
            code.push(innerFill(loopOrders[0], proc, body));
          }
          if (proc.post.body.length > 3) {
            code.push(processBlock(proc.post, proc, dtypes));
          }
          if (proc.debug) {
            console.log(
              "-----Generated cwise routine for ",
              typesig,
              ":\n" + code.join("\n") + "\n----------"
            );
          }
          var loopName = [
            proc.funcName || "unnamed",
            "_cwise_loop_",
            orders[0].join("s"),
            "m",
            matched,
            typeSummary(dtypes),
          ].join("");
          var f = new Function(
            [
              "function ",
              loopName,
              "(",
              arglist.join(","),
              "){",
              code.join("\n"),
              "} return ",
              loopName,
            ].join("")
          );
          return f();
        }
        module.exports = generateCWiseOp;
      },
      { uniq: 4 },
    ],
    3: [
      function (require, module, exports) {
        "use strict";
        var compile = require("./compile.js");
        function createThunk(proc) {
          var code = ["'use strict'", "var CACHED={}"];
          var vars = [];
          var thunkName = proc.funcName + "_cwise_thunk";
          code.push(
            [
              "return function ",
              thunkName,
              "(",
              proc.shimArgs.join(","),
              "){",
            ].join("")
          );
          var typesig = [];
          var string_typesig = [];
          var proc_args = [
            [
              "array",
              proc.arrayArgs[0],
              ".shape.slice(",
              Math.max(0, proc.arrayBlockIndices[i]),
              proc.arrayBlockIndices[i] < 0
                ? "," + proc.arrayBlockIndices[i] + ")"
                : ")",
            ].join(""),
          ];
          for (var i = 0; i < proc.arrayArgs.length; ++i) {
            var j = proc.arrayArgs[i];
            vars.push(
              [
                "t",
                j,
                "=array",
                j,
                ".dtype,",
                "r",
                j,
                "=array",
                j,
                ".order",
              ].join("")
            );
            typesig.push("t" + j);
            typesig.push("r" + j);
            string_typesig.push("t" + j);
            string_typesig.push("r" + j + ".join()");
            proc_args.push("array" + j + ".data");
            proc_args.push("array" + j + ".stride");
            proc_args.push("array" + j + ".offset|0");
          }
          for (var i = 0; i < proc.scalarArgs.length; ++i) {
            proc_args.push("scalar" + proc.scalarArgs[i]);
          }
          vars.push(["type=[", string_typesig.join(","), "].join()"].join(""));
          vars.push("proc=CACHED[type]");
          code.push("var " + vars.join(","));
          code.push(
            [
              "if(!proc){",
              "CACHED[type]=proc=compile([",
              typesig.join(","),
              "])}",
              "return proc(",
              proc_args.join(","),
              ")}",
            ].join("")
          );
          if (proc.debug) {
            console.log(
              "-----Generated thunk:\n" + code.join("\n") + "\n----------"
            );
          }
          var thunk = new Function("compile", code.join("\n"));
          return thunk(compile.bind(undefined, proc));
        }
        module.exports = createThunk;
      },
      { "./compile.js": 2 },
    ],
    4: [
      function (require, module, exports) {
        "use strict";
        function unique_pred(list, compare) {
          var ptr = 1,
            len = list.length,
            a = list[0],
            b = list[0];
          for (var i = 1; i < len; ++i) {
            b = a;
            a = list[i];
            if (compare(a, b)) {
              if (i === ptr) {
                ptr++;
                continue;
              }
              list[ptr++] = a;
            }
          }
          list.length = ptr;
          return list;
        }
        function unique_eq(list) {
          var ptr = 1,
            len = list.length,
            a = list[0],
            b = list[0];
          for (var i = 1; i < len; ++i, b = a) {
            b = a;
            a = list[i];
            if (a !== b) {
              if (i === ptr) {
                ptr++;
                continue;
              }
              list[ptr++] = a;
            }
          }
          list.length = ptr;
          return list;
        }
        function unique(list, compare, sorted) {
          if (list.length === 0) {
            return list;
          }
          if (compare) {
            if (!sorted) {
              list.sort(compare);
            }
            return unique_pred(list, compare);
          }
          if (!sorted) {
            list.sort();
          }
          return unique_eq(list);
        }
        module.exports = unique;
      },
      {},
    ],
    "ndarray-ops": [
      function (require, module, exports) {
        "use strict";
        var compile = require("cwise-compiler");
        var EmptyProc = { body: "", args: [], thisVars: [], localVars: [] };
        function fixup(x) {
          if (!x) {
            return EmptyProc;
          }
          for (var i = 0; i < x.args.length; ++i) {
            var a = x.args[i];
            if (i === 0) {
              x.args[i] = {
                name: a,
                lvalue: true,
                rvalue: !!x.rvalue,
                count: x.count || 1,
              };
            } else {
              x.args[i] = { name: a, lvalue: false, rvalue: true, count: 1 };
            }
          }
          if (!x.thisVars) {
            x.thisVars = [];
          }
          if (!x.localVars) {
            x.localVars = [];
          }
          return x;
        }
        function pcompile(user_args) {
          return compile({
            args: user_args.args,
            pre: fixup(user_args.pre),
            body: fixup(user_args.body),
            post: fixup(user_args.proc),
            funcName: user_args.funcName,
          });
        }
        function makeOp(user_args) {
          var args = [];
          for (var i = 0; i < user_args.args.length; ++i) {
            args.push("a" + i);
          }
          var wrapper = new Function(
            "P",
            [
              "return function ",
              user_args.funcName,
              "_ndarrayops(",
              args.join(","),
              ") {P(",
              args.join(","),
              ");return a0}",
            ].join("")
          );
          return wrapper(pcompile(user_args));
        }
        var assign_ops = {
          add: "+",
          sub: "-",
          mul: "*",
          div: "/",
          mod: "%",
          band: "&",
          bor: "|",
          bxor: "^",
          lshift: "<<",
          rshift: ">>",
          rrshift: ">>>",
        };
        (function () {
          for (var id in assign_ops) {
            var op = assign_ops[id];
            exports[id] = makeOp({
              args: ["array", "array", "array"],
              body: { args: ["a", "b", "c"], body: "a=b" + op + "c" },
              funcName: id,
            });
            exports[id + "eq"] = makeOp({
              args: ["array", "array"],
              body: { args: ["a", "b"], body: "a" + op + "=b" },
              rvalue: true,
              funcName: id + "eq",
            });
            exports[id + "s"] = makeOp({
              args: ["array", "array", "scalar"],
              body: { args: ["a", "b", "s"], body: "a=b" + op + "s" },
              funcName: id + "s",
            });
            exports[id + "seq"] = makeOp({
              args: ["array", "scalar"],
              body: { args: ["a", "s"], body: "a" + op + "=s" },
              rvalue: true,
              funcName: id + "seq",
            });
          }
        })();
        var unary_ops = { not: "!", bnot: "~", neg: "-", recip: "1.0/" };
        (function () {
          for (var id in unary_ops) {
            var op = unary_ops[id];
            exports[id] = makeOp({
              args: ["array", "array"],
              body: { args: ["a", "b"], body: "a=" + op + "b" },
              funcName: id,
            });
            exports[id + "eq"] = makeOp({
              args: ["array"],
              body: { args: ["a"], body: "a=" + op + "a" },
              rvalue: true,
              count: 2,
              funcName: id + "eq",
            });
          }
        })();
        var binary_ops = {
          and: "&&",
          or: "||",
          eq: "===",
          neq: "!==",
          lt: "<",
          gt: ">",
          leq: "<=",
          geq: ">=",
        };
        (function () {
          for (var id in binary_ops) {
            var op = binary_ops[id];
            exports[id] = makeOp({
              args: ["array", "array", "array"],
              body: { args: ["a", "b", "c"], body: "a=b" + op + "c" },
              funcName: id,
            });
            exports[id + "s"] = makeOp({
              args: ["array", "array", "scalar"],
              body: { args: ["a", "b", "s"], body: "a=b" + op + "s" },
              funcName: id + "s",
            });
            exports[id + "eq"] = makeOp({
              args: ["array", "array"],
              body: { args: ["a", "b"], body: "a=a" + op + "b" },
              rvalue: true,
              count: 2,
              funcName: id + "eq",
            });
            exports[id + "seq"] = makeOp({
              args: ["array", "scalar"],
              body: { args: ["a", "s"], body: "a=a" + op + "s" },
              rvalue: true,
              count: 2,
              funcName: id + "seq",
            });
          }
        })();
        var math_unary = [
          "abs",
          "acos",
          "asin",
          "atan",
          "ceil",
          "cos",
          "exp",
          "floor",
          "log",
          "round",
          "sin",
          "sqrt",
          "tan",
        ];
        (function () {
          for (var i = 0; i < math_unary.length; ++i) {
            var f = math_unary[i];
            exports[f] = makeOp({
              args: ["array", "array"],
              pre: { args: [], body: "this_f=Math." + f, thisVars: ["this_f"] },
              body: {
                args: ["a", "b"],
                body: "a=this_f(b)",
                thisVars: ["this_f"],
              },
              funcName: f,
            });
            exports[f + "eq"] = makeOp({
              args: ["array"],
              pre: { args: [], body: "this_f=Math." + f, thisVars: ["this_f"] },
              body: { args: ["a"], body: "a=this_f(a)", thisVars: ["this_f"] },
              rvalue: true,
              count: 2,
              funcName: f + "eq",
            });
          }
        })();
        var math_comm = ["max", "min", "atan2", "pow"];
        (function () {
          for (var i = 0; i < math_comm.length; ++i) {
            var f = math_comm[i];
            exports[f] = makeOp({
              args: ["array", "array", "array"],
              pre: { args: [], body: "this_f=Math." + f, thisVars: ["this_f"] },
              body: {
                args: ["a", "b", "c"],
                body: "a=this_f(b,c)",
                thisVars: ["this_f"],
              },
              funcName: f,
            });
            exports[f + "s"] = makeOp({
              args: ["array", "array", "scalar"],
              pre: { args: [], body: "this_f=Math." + f, thisVars: ["this_f"] },
              body: {
                args: ["a", "b", "c"],
                body: "a=this_f(b,c)",
                thisVars: ["this_f"],
              },
              funcName: f + "s",
            });
            exports[f + "eq"] = makeOp({
              args: ["array", "array"],
              pre: { args: [], body: "this_f=Math." + f, thisVars: ["this_f"] },
              body: {
                args: ["a", "b"],
                body: "a=this_f(a,b)",
                thisVars: ["this_f"],
              },
              rvalue: true,
              count: 2,
              funcName: f + "eq",
            });
            exports[f + "seq"] = makeOp({
              args: ["array", "scalar"],
              pre: { args: [], body: "this_f=Math." + f, thisVars: ["this_f"] },
              body: {
                args: ["a", "b"],
                body: "a=this_f(a,b)",
                thisVars: ["this_f"],
              },
              rvalue: true,
              count: 2,
              funcName: f + "seq",
            });
          }
        })();
        var math_noncomm = ["atan2", "pow"];
        (function () {
          for (var i = 0; i < math_noncomm.length; ++i) {
            var f = math_noncomm[i];
            exports[f + "op"] = makeOp({
              args: ["array", "array", "array"],
              pre: { args: [], body: "this_f=Math." + f, thisVars: ["this_f"] },
              body: {
                args: ["a", "b", "c"],
                body: "a=this_f(c,b)",
                thisVars: ["this_f"],
              },
              funcName: f + "op",
            });
            exports[f + "ops"] = makeOp({
              args: ["array", "array", "scalar"],
              pre: { args: [], body: "this_f=Math." + f, thisVars: ["this_f"] },
              body: {
                args: ["a", "b", "c"],
                body: "a=this_f(c,b)",
                thisVars: ["this_f"],
              },
              funcName: f + "ops",
            });
            exports[f + "opeq"] = makeOp({
              args: ["array", "array"],
              pre: { args: [], body: "this_f=Math." + f, thisVars: ["this_f"] },
              body: {
                args: ["a", "b"],
                body: "a=this_f(b,a)",
                thisVars: ["this_f"],
              },
              rvalue: true,
              count: 2,
              funcName: f + "opeq",
            });
            exports[f + "opseq"] = makeOp({
              args: ["array", "scalar"],
              pre: { args: [], body: "this_f=Math." + f, thisVars: ["this_f"] },
              body: {
                args: ["a", "b"],
                body: "a=this_f(b,a)",
                thisVars: ["this_f"],
              },
              rvalue: true,
              count: 2,
              funcName: f + "opseq",
            });
          }
        })();
        exports.any = compile({
          args: ["array"],
          pre: EmptyProc,
          body: {
            args: [{ name: "a", lvalue: false, rvalue: true, count: 1 }],
            body: "if(a){return true}",
            localVars: [],
            thisVars: [],
          },
          post: { args: [], localVars: [], thisVars: [], body: "return false" },
          funcName: "any",
        });
        exports.all = compile({
          args: ["array"],
          pre: EmptyProc,
          body: {
            args: [{ name: "x", lvalue: false, rvalue: true, count: 1 }],
            body: "if(!x){return false}",
            localVars: [],
            thisVars: [],
          },
          post: { args: [], localVars: [], thisVars: [], body: "return true" },
          funcName: "all",
        });
        exports.sum = compile({
          args: ["array"],
          pre: {
            args: [],
            localVars: [],
            thisVars: ["this_s"],
            body: "this_s=0",
          },
          body: {
            args: [{ name: "a", lvalue: false, rvalue: true, count: 1 }],
            body: "this_s+=a",
            localVars: [],
            thisVars: ["this_s"],
          },
          post: {
            args: [],
            localVars: [],
            thisVars: ["this_s"],
            body: "return this_s",
          },
          funcName: "sum",
        });
        exports.prod = compile({
          args: ["array"],
          pre: {
            args: [],
            localVars: [],
            thisVars: ["this_s"],
            body: "this_s=1",
          },
          body: {
            args: [{ name: "a", lvalue: false, rvalue: true, count: 1 }],
            body: "this_s*=a",
            localVars: [],
            thisVars: ["this_s"],
          },
          post: {
            args: [],
            localVars: [],
            thisVars: ["this_s"],
            body: "return this_s",
          },
          funcName: "prod",
        });
        exports.norm2squared = compile({
          args: ["array"],
          pre: {
            args: [],
            localVars: [],
            thisVars: ["this_s"],
            body: "this_s=0",
          },
          body: {
            args: [{ name: "a", lvalue: false, rvalue: true, count: 2 }],
            body: "this_s+=a*a",
            localVars: [],
            thisVars: ["this_s"],
          },
          post: {
            args: [],
            localVars: [],
            thisVars: ["this_s"],
            body: "return this_s",
          },
          funcName: "norm2squared",
        });
        exports.norm2 = compile({
          args: ["array"],
          pre: {
            args: [],
            localVars: [],
            thisVars: ["this_s"],
            body: "this_s=0",
          },
          body: {
            args: [{ name: "a", lvalue: false, rvalue: true, count: 2 }],
            body: "this_s+=a*a",
            localVars: [],
            thisVars: ["this_s"],
          },
          post: {
            args: [],
            localVars: [],
            thisVars: ["this_s"],
            body: "return Math.sqrt(this_s)",
          },
          funcName: "norm2",
        });
        exports.norminf = compile({
          args: ["array"],
          pre: {
            args: [],
            localVars: [],
            thisVars: ["this_s"],
            body: "this_s=0",
          },
          body: {
            args: [{ name: "a", lvalue: false, rvalue: true, count: 4 }],
            body: "if(-a>this_s){this_s=-a}else if(a>this_s){this_s=a}",
            localVars: [],
            thisVars: ["this_s"],
          },
          post: {
            args: [],
            localVars: [],
            thisVars: ["this_s"],
            body: "return this_s",
          },
          funcName: "norminf",
        });
        exports.norm1 = compile({
          args: ["array"],
          pre: {
            args: [],
            localVars: [],
            thisVars: ["this_s"],
            body: "this_s=0",
          },
          body: {
            args: [{ name: "a", lvalue: false, rvalue: true, count: 3 }],
            body: "this_s+=a<0?-a:a",
            localVars: [],
            thisVars: ["this_s"],
          },
          post: {
            args: [],
            localVars: [],
            thisVars: ["this_s"],
            body: "return this_s",
          },
          funcName: "norm1",
        });
        exports.sup = compile({
          args: ["array"],
          pre: {
            body: "this_h=-Infinity",
            args: [],
            thisVars: ["this_h"],
            localVars: [],
          },
          body: {
            body: "if(_inline_1_arg0_>this_h)this_h=_inline_1_arg0_",
            args: [
              {
                name: "_inline_1_arg0_",
                lvalue: false,
                rvalue: true,
                count: 2,
              },
            ],
            thisVars: ["this_h"],
            localVars: [],
          },
          post: {
            body: "return this_h",
            args: [],
            thisVars: ["this_h"],
            localVars: [],
          },
        });
        exports.inf = compile({
          args: ["array"],
          pre: {
            body: "this_h=Infinity",
            args: [],
            thisVars: ["this_h"],
            localVars: [],
          },
          body: {
            body: "if(_inline_1_arg0_<this_h)this_h=_inline_1_arg0_",
            args: [
              {
                name: "_inline_1_arg0_",
                lvalue: false,
                rvalue: true,
                count: 2,
              },
            ],
            thisVars: ["this_h"],
            localVars: [],
          },
          post: {
            body: "return this_h",
            args: [],
            thisVars: ["this_h"],
            localVars: [],
          },
        });
        exports.argmin = compile({
          args: ["index", "array", "shape"],
          pre: {
            body: "{this_v=Infinity;this_i=_inline_0_arg2_.slice(0)}",
            args: [
              {
                name: "_inline_0_arg0_",
                lvalue: false,
                rvalue: false,
                count: 0,
              },
              {
                name: "_inline_0_arg1_",
                lvalue: false,
                rvalue: false,
                count: 0,
              },
              {
                name: "_inline_0_arg2_",
                lvalue: false,
                rvalue: true,
                count: 1,
              },
            ],
            thisVars: ["this_i", "this_v"],
            localVars: [],
          },
          body: {
            body: "{if(_inline_1_arg1_<this_v){this_v=_inline_1_arg1_;for(var _inline_1_k=0;_inline_1_k<_inline_1_arg0_.length;++_inline_1_k){this_i[_inline_1_k]=_inline_1_arg0_[_inline_1_k]}}}",
            args: [
              {
                name: "_inline_1_arg0_",
                lvalue: false,
                rvalue: true,
                count: 2,
              },
              {
                name: "_inline_1_arg1_",
                lvalue: false,
                rvalue: true,
                count: 2,
              },
            ],
            thisVars: ["this_i", "this_v"],
            localVars: ["_inline_1_k"],
          },
          post: {
            body: "{return this_i}",
            args: [],
            thisVars: ["this_i"],
            localVars: [],
          },
        });
        exports.argmax = compile({
          args: ["index", "array", "shape"],
          pre: {
            body: "{this_v=-Infinity;this_i=_inline_0_arg2_.slice(0)}",
            args: [
              {
                name: "_inline_0_arg0_",
                lvalue: false,
                rvalue: false,
                count: 0,
              },
              {
                name: "_inline_0_arg1_",
                lvalue: false,
                rvalue: false,
                count: 0,
              },
              {
                name: "_inline_0_arg2_",
                lvalue: false,
                rvalue: true,
                count: 1,
              },
            ],
            thisVars: ["this_i", "this_v"],
            localVars: [],
          },
          body: {
            body: "{if(_inline_1_arg1_>this_v){this_v=_inline_1_arg1_;for(var _inline_1_k=0;_inline_1_k<_inline_1_arg0_.length;++_inline_1_k){this_i[_inline_1_k]=_inline_1_arg0_[_inline_1_k]}}}",
            args: [
              {
                name: "_inline_1_arg0_",
                lvalue: false,
                rvalue: true,
                count: 2,
              },
              {
                name: "_inline_1_arg1_",
                lvalue: false,
                rvalue: true,
                count: 2,
              },
            ],
            thisVars: ["this_i", "this_v"],
            localVars: ["_inline_1_k"],
          },
          post: {
            body: "{return this_i}",
            args: [],
            thisVars: ["this_i"],
            localVars: [],
          },
        });
        exports.random = makeOp({
          args: ["array"],
          pre: { args: [], body: "this_f=Math.random", thisVars: ["this_f"] },
          body: { args: ["a"], body: "a=this_f()", thisVars: ["this_f"] },
          funcName: "random",
        });
        exports.assign = makeOp({
          args: ["array", "array"],
          body: { args: ["a", "b"], body: "a=b" },
          funcName: "assign",
        });
        exports.assigns = makeOp({
          args: ["array", "scalar"],
          body: { args: ["a", "b"], body: "a=b" },
          funcName: "assigns",
        });
        exports.equals = compile({
          args: ["array", "array"],
          pre: EmptyProc,
          body: {
            args: [
              { name: "x", lvalue: false, rvalue: true, count: 1 },
              { name: "y", lvalue: false, rvalue: true, count: 1 },
            ],
            body: "if(x!==y){return false}",
            localVars: [],
            thisVars: [],
          },
          post: { args: [], localVars: [], thisVars: [], body: "return true" },
          funcName: "equals",
        });
      },
      { "cwise-compiler": 1 },
    ],
  },
  {},
  []
);
var baboon = require("baboon-image");
var lena = require("lena");
var savePixels = require("save-pixels");
var cwise = require("cwise");
var ops = require("ndarray-ops");
var shift = cwise({
  args: ["array", "array", { offset: [-100, 0], array: 0 }],
  body: function (a, b, c) {
    a = c;
  },
});
var shifted = shift(baboon, lena);
var pix = savePixels(baboon, "canvas");
document.body.appendChild(pix);