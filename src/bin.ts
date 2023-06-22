#! /usr/bin/env node

import * as data from "./data";
import * as util from "./util";
import * as runner from "./runner";
import * as fs from "fs";
import * as path from "path";

function main(args: string[]) {
    if (args.length == 0) {
        console.log("NovaScript " + data.version);
        return;
    }
    if (args[0] == "-v") {
        let d = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, "..", "./data/buildData.json"),
                "utf-8"
            )
        );
        console.log(`Novascript ${data.version}\nbuildTime:${d.time}`);
        return;
    }
    switch (args[0]) {
        case "run":
            if (args.length == 1) {
                util.error("runCommandSyntaxError$NoPath");
            }

            let debugFlg: boolean = args.includes("-d");
            let $path: string = args[1];

            if (fs.existsSync(path.join(process.cwd(), $path))) {
                $path = path.join(process.cwd(), $path);
            } else if (!fs.existsSync($path)) {
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
