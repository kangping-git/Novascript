import * as fs from "fs";
import { s } from "./switchPlus";
import * as util from "./util";

let debugMode: boolean = false;

interface token {
    type: "var" | "string" | "parentheses" | "reline" | "number";
    value: string;
    line: number;
    char: number;
    filePath: string;
}

interface ast {
    op: "" | "const" | "get" | "runFunction";
    left: string;
    right: any;
    line1: number;
    line2: number;
    char1: number;
    char2: number;
}

interface $parserReturn {
    ast: ast;
    tokens: token[];
}

function line(str: string) {
    let lineWidth: number = process.stdout.columns - str.length;
    debug(
        "-".repeat(Math.ceil(lineWidth / 2)) +
            str +
            "-".repeat(Math.floor(lineWidth / 2))
    );
}

function debug(...args: any) {
    if (debugMode) {
        console.log(...args);
    }
}

function runner(filePath: string, debugFlg: boolean) {
    debugMode = debugFlg;
    const $Code: string = fs.readFileSync(filePath, "utf-8");
    const $token: token[] = lexer($Code, filePath);
    if (debugMode) {
        fs.writeFileSync(
            filePath + ".tokens.json",
            JSON.stringify($token, null, "    ")
        );
    }
    const $ast: ast[] = parser($token, true);
    if (debugMode) {
        fs.writeFileSync(
            filePath + ".ast.json",
            JSON.stringify($ast, null, "    ")
        );
    }
}

function lexer(code: string, filePath: string): token[] {
    function add(token: token) {
        tokens.push(token);
    }
    let tokens: token[] = [];
    let $token: string[] = code.split(
        /(\r\n|\r|\n|"[^"]*"|[a-zA-Z_][a-zA-Z0-9_]*|[0-9]+\.[0-9]+|[0-9]+|\(|\)|;)/
    );
    let line: number = 0;
    let char: number = 0;
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
        new s(i)
            .c(";", (val: string) => {
                add({
                    type: "reline",
                    value: "",
                    line: line,
                    char: char,
                    filePath: filePath,
                });
            })
            .c(/^[a-zA-Z_][a-zA-Z0-9_]*$/, (val: string) => {
                add({
                    type: "var",
                    value: i,
                    line: line,
                    char: char,
                    filePath: filePath,
                });
            })
            .c(/^"[^"]*"$/, (val: string) => {
                add({
                    type: "string",
                    value: i,
                    line: line,
                    char: char,
                    filePath: filePath,
                });
            })
            .c(["(", ")"], (val: string) => {
                add({
                    type: "parentheses",
                    value: i,
                    line: line,
                    char: char,
                    filePath: filePath,
                });
            })
            .c(/^[0-9]+\.[0-9]+|[0-9]+$/, (val: string) => {
                add({
                    type: "number",
                    value: i,
                    line: line,
                    char: char,
                    filePath: filePath,
                });
            })
            .d(() => {
                util.error(
                    "parserError$CantFindToken",
                    filePath,
                    line + 1,
                    char + 1,
                    line + 1 + " | " + code.split(/\r\n|\r|\n/)[line],
                    " ".repeat(String(line + 1).length + 3 + char) +
                        "~".repeat(i.length)
                );
            });
        char += i.length;
    }
    return tokens;
}

function $parser(tokens: token[], mustNewLine: boolean = false): $parserReturn {
    const _firstIndex = tokens.findIndex((t) => t.type != "reline");
    tokens = tokens.slice(_firstIndex);
    const firstToken: token = tokens[0];
    let returnData: $parserReturn = {
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
                    let len: number = tokens.length;
                    let depth: number = 1;
                    let i: number = 0;
                    let _tokens: token[] = [];
                    let _char: number = 0;
                    for (i = 2; i < len; ++i) {
                        _char += tokens[i].value.length;
                        if (tokens[i].value == "(") {
                            ++depth;
                        } else if (tokens[i].value == ")") {
                            --depth;
                            if (depth == 0) {
                                break;
                            }
                        }
                        _tokens.push(tokens[i]);
                    }
                    let asts: ast[] = [];
                    while (_tokens.length > 0) {
                        let p = $parser(_tokens);
                        asts.push(p.ast);
                        _tokens = p.tokens;
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
    if (returnData.ast.op == "") {
        const code: string = fs.readFileSync(firstToken.filePath, "utf-8");
        util.error(
            "parserError$CantFindToken",
            firstToken.filePath,
            firstToken.line + 1,
            firstToken.char + 1,
            firstToken.line +
                1 +
                " | " +
                code.split(/\r\n|\r|\n/)[firstToken.line],
            " ".repeat(
                String(firstToken.line + 1).length + 3 + firstToken.char
            ) + "~".repeat(firstToken.value.length)
        );
    }
    if (mustNewLine) {
        if (tokens.length != 0) {
            if (tokens[0].type != "reline") {
                const code: string = fs.readFileSync(
                    firstToken.filePath,
                    "utf-8"
                );
                util.error(
                    "parserError$NoReLine",
                    tokens[0].filePath,
                    tokens[0].line + 1,
                    tokens[0].char + 1,
                    tokens[0].line +
                        1 +
                        " | " +
                        code.split(/\r\n|\r|\n/)[tokens[0].line],
                    " ".repeat(
                        String(tokens[0].line + 1).length + 3 + tokens[0].char
                    ) + "~".repeat(tokens[0].value.length)
                );
            } else {
                tokens.shift();
            }
        }
    }
    returnData.tokens = tokens;
    return returnData;
}

function parser(tokens: token[], mustNewLine: boolean = true): ast[] {
    let $parserR: $parserReturn;
    const returnAsts: ast[] = [];
    while (tokens.length > 0) {
        $parserR = $parser(tokens, mustNewLine);
        tokens = $parserR.tokens;
        returnAsts.push($parserR.ast);
    }
    return returnAsts;
}

export { runner };
