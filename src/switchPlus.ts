class s {
    checkStr: string;
    checked: boolean;
    constructor(str: string) {
        this.checked = false;
        this.checkStr = str;
    }
    c(val: RegExp | string | string[], callBack: Function) {
        if (!this.checked) {
            if (val instanceof RegExp) {
                if (val.test(this.checkStr)) {
                    this.checked = true;
                    callBack(this.checkStr);
                }
            } else if (typeof val == "string") {
                if (val == this.checkStr) {
                    this.checked = true;
                    callBack(this.checkStr);
                }
            } else if (val instanceof Array) {
                if (val.includes(this.checkStr)) {
                    this.checked = true;
                    callBack(this.checkStr);
                }
            }
        }
        return this;
    }
    d(callBack: Function) {
        if (!this.checked) {
            callBack();
        }
    }
}
export { s };
