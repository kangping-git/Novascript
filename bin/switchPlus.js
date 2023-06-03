"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s = void 0;
class s {
    constructor(str) {
        this.checked = false;
        this.checkStr = str;
    }
    c(val, callBack) {
        if (!this.checked) {
            if (val instanceof RegExp) {
                if (val.test(this.checkStr)) {
                    this.checked = true;
                    callBack(this.checkStr);
                }
            }
            else if (typeof val == "string") {
                if (val == this.checkStr) {
                    this.checked = true;
                    callBack(this.checkStr);
                }
            }
            else if (val instanceof Array) {
                if (val.includes(this.checkStr)) {
                    this.checked = true;
                    callBack(this.checkStr);
                }
            }
        }
        return this;
    }
    d(callBack) {
        if (!this.checked) {
            callBack();
        }
    }
}
exports.s = s;
