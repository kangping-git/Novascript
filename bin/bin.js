#! /usr/bin/env node
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
const data = __importStar(require("./data"));
const util = __importStar(require("./util"));
const runner = __importStar(require("./runner"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function main(args) {
    if (args.length == 0) {
        console.log("NovaScript " + data.version);
        return;
    }
    if (args[0] == "-v") {
        let d = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "./data/buildData.json"), "utf-8"));
        console.log(`Novascript ${data.version}\nbuildTime:${d.time}`);
        return;
    }
    switch (args[0]) {
        case "run":
            if (args.length == 1) {
                util.error("runCommandSyntaxError$NoPath");
            }
            let debugFlg = args.includes("-d");
            let $path = args[1];
            if (fs.existsSync(path.join(process.cwd(), $path))) {
                $path = path.join(process.cwd(), $path);
            }
            else if (!fs.existsSync($path)) {
                util.error("runCommandSyntaxError$CantFindFile");
            }
            if (!fs.statSync($path).isFile()) {
                util.error("runCommandSyntaxError$NotFile");
            }
            runner.runner($path, debugFlg);
            break;
        default:
            util.error("commandError$UnknownCommand", args[0]);
    }
}
main(process.argv.slice(2));
