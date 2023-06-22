"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeSplitter = exports.lexer = exports.parser = exports.runner = void 0;
const fs = __importStar(require("fs"));
const switchPlus_1 = require("./switchPlus");
const util = __importStar(require("./util"));
let debugMode = false;
function line(str) {
    let lineWidth = process.stdout.columns - str.length;
    debug("-".repeat(Math.ceil(lineWidth / 2)) +
        str +
        "-".repeat(Math.floor(lineWidth / 2)));
}
function debug(...args) {
    if (debugMode) {
        console.log(...args);
    }
}
function runner(filePath, debugFlg) {
    debugMode = debugFlg;
    const $Code = fs.readFileSync(filePath, "utf-8");
    const $token = lexer($Code, filePath);
    if (debugMode) {
        fs.writeFileSync(filePath + ".tokens.json", JSON.stringify($token, null, "    "));
    }
    const $ast = parser($token, true);
    if (debugMode) {
        fs.writeFileSync(filePath + ".ast.json", JSON.stringify($ast, null, "    "));
    }
}
exports.runner = runner;
function codeSplitter(code) {
    let $token = code.split(/(\r\n|\r|\n|\+|-|\/\/[^\n]*|\*\*|\*|\/|"[^"]*"|,|[a-zA-Z_][a-zA-Z0-9_]*|[0-9]+\.[0-9]+|[0-9]+|\(|\)|;)/);
    return $token;
}
exports.codeSplitter = codeSplitter;
function lexer(code, filePath) {
    function add(token) {
        tokens.push(token);
    }
    let tokens = [];
    let $token = codeSplitter(code);
    let line = 0;
    let char = 0;
    for (let i of $token) {
        if (i == "") {
            continue;
        }
        if (i.match(/^\r\n|\r|\n$/)) {
            line += 1;
            char = 0;
            add({
                type: "reline",
                value: "",
                line: line,
                char: char,
                filePath: filePath,
            });
            continue;
        }
        new switchPlus_1.s(i)
            .c(";", (val) => {
            add({
                type: "reline",
                value: "",
                line: line,
                char: char,
                filePath: filePath,
            });
        })
            .c(/^[a-zA-Z_][a-zA-Z0-9_]*$/, (val) => {
            add({
                type: "var",
                value: i,
                line: line,
                char: char,
                filePath: filePath,
            });
        })
            .c(/^"[^"]*"$/, (val) => {
            add({
                type: "string",
                value: i,
                line: line,
                char: char,
                filePath: filePath,
            });
        })
            .c(["(", ")"], (val) => {
            add({
                type: "parentheses",
                value: i,
                line: line,
                char: char,
                filePath: filePath,
            });
        })
            .c(["+", "-", "*", "/", "**"], (val) => {
            add({
                type: "calc",
                value: i,
                line: line,
                char: char,
                filePath: filePath,
            });
        })
            .c(/^[0-9]+\.[0-9]+|[0-9]+$/, (val) => {
            add({
                type: "number",
                value: i,
                line: line,
                char: char,
                filePath: filePath,
            });
        })
            .c(",", (val) => {
            add({
                type: "splitter",
                value: i,
                line: line,
                char: char,
                filePath: filePath,
            });
        })
            .d(() => {
            util.error("parserError$CantFindToken", filePath, line + 1, char + 1, line + 1 + " | " + code.split(/\r\n|\r|\n/)[line], " ".repeat(String(line + 1).length + 3 + char) +
                "~".repeat(i.length));
        });
        char += i.length;
    }
    return tokens;
}
exports.lexer = lexer;
function $parser(tokens, mustNewLine = false, NoCalc = false) {
    function error(msg) {
        const code = fs.readFileSync(firstToken.filePath, "utf-8");
        util.error(msg, firstToken.filePath, firstToken.line + 1, firstToken.char + 1, firstToken.line +
            1 +
            " | " +
            code.split(/\r\n|\r|\n/)[firstToken.line], " ".repeat(String(firstToken.line + 1).length + 3 + firstToken.char) + "~".repeat(firstToken.value.length));
    }
    const _firstIndex = tokens.findIndex((t) => t.type != "reline");
    tokens = tokens.slice(_firstIndex);
    const firstToken = tokens[0];
    let returnData = {
        ast: {
            op: "",
            left: "",
            right: "",
            line1: firstToken.line,
            line2: firstToken.line,
            char1: firstToken.char,
            char2: firstToken.char,
        },
        tokens: tokens,
    };
    switch (firstToken.type) {
        case "var":
            let flg = true;
            if (tokens.length != 1) {
                if (tokens[1].type == "parentheses") {
                    returnData.ast.op = "runFunction";
                    let len = tokens.length;
                    let depth = 1;
                    let i = 0;
                    let _tokens = [];
                    let _char = 0;
                    for (i = 2; i < len; ++i) {
                        _char += tokens[i].value.length;
                        if (tokens[i].value == "(") {
                            ++depth;
                        }
                        else if (tokens[i].value == ")") {
                            --depth;
                            if (depth == 0) {
                                break;
                            }
                        }
                        _tokens.push(tokens[i]);
                    }
                    let asts = [];
                    while (_tokens.length > 0) {
                        let p = $parser(_tokens);
                        asts.push(p.ast);
                        _tokens = p.tokens;
                        if (_tokens.length > 0) {
                            if (_tokens[0].type != "splitter") {
                                error("parserError$NoSplitter");
                            }
                        }
                        _tokens = _tokens.slice(1);
                    }
                    tokens = tokens.slice(i + 1);
                    returnData.ast.left = firstToken.value;
                    returnData.ast.right = asts;
                    returnData.ast.line2 = firstToken.line;
                    returnData.ast.char2 =
                        firstToken.char + firstToken.value.length + 1 + _char;
                    flg = false;
                }
            }
            if (flg) {
                returnData.ast.op = "get";
                returnData.ast.left = firstToken.value;
                returnData.ast.line2 = firstToken.line;
                returnData.ast.char2 =
                    firstToken.char + firstToken.value.length;
            }
            break;
        case "string":
            returnData.ast.op = "const";
            returnData.ast.right = firstToken.value.slice(1, -1);
            returnData.ast.left = "string";
            returnData.ast.line2 = firstToken.line;
            returnData.ast.char2 = firstToken.char + firstToken.value.length;
            tokens = tokens.slice(1);
            break;
        case "number":
            returnData.ast.op = "const";
            returnData.ast.right = firstToken.value;
            returnData.ast.left = "number";
            returnData.ast.line2 = firstToken.line;
            returnData.ast.char2 = firstToken.char + firstToken.value.length;
            tokens = tokens.slice(1);
            break;
    }
    if (!NoCalc) {
        if (tokens.length > 0) {
            if (tokens[0].type == "calc") {
                returnData.ast.op = "calc";
                returnData.ast.right = [Object.assign({}, returnData.ast), tokens[0].value];
                tokens = tokens.slice(1);
                while (tokens.length > 0) {
                    let r = $parser(tokens, false, true);
                    tokens = r.tokens;
                    returnData.ast.right.push(r);
                    if (tokens.length > 0) {
                        if (tokens[0].type != "calc") {
                            break;
                        }
                    }
                    else {
                        break;
                    }
                    returnData.ast.right.push(tokens[0].value);
                }
            }
        }
    }
    if (returnData.ast.op == "") {
        const code = fs.readFileSync(firstToken.filePath, "utf-8");
        util.error("parserError$CantFindToken", firstToken.filePath, firstToken.line + 1, firstToken.char + 1, firstToken.line +
            1 +
            " | " +
            code.split(/\r\n|\r|\n/)[firstToken.line], " ".repeat(String(firstToken.line + 1).length + 3 + firstToken.char) + "~".repeat(firstToken.value.length));
    }
    if (mustNewLine) {
        if (tokens.length != 0) {
            if (tokens[0].type != "reline") {
                error("parserError$CantFindToken");
            }
            else {
                tokens.shift();
            }
        }
    }
    returnData.tokens = tokens;
    return returnData;
}
function parser(tokens, mustNewLine = true) {
    let $parserR;
    const returnAsts = [];
    while (tokens.length > 0) {
        $parserR = $parser(tokens, mustNewLine);
        tokens = $parserR.tokens;
        returnAsts.push($parserR.ast);
    }
    return returnAsts;
}
exports.parser = parser;
