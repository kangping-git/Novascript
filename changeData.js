const childprocess = require("child_process");
const fs = require("fs");
fs.watch(".", (e, path) => {
    if (
        e == "change" &&
        (path.slice(-2) == "ts" || path.slice(-6) == "errors")
    ) {
        change();
    }
});
fs.watch("./src/", (e, path) => {
    if (
        e == "change" &&
        (path.slice(-2) == "ts" || path.slice(-6) == "errors") &&
        path != "data.ts"
    ) {
        change();
    }
});
function change() {
    let fileData = fs
        .readFileSync("./errors.errors", "utf-8")
        .split(/\r\n|\r|\n/);
    let errorData = {};
    let nowDict = [];
    let depth = 0;
    let value = [];
    let version = "v1.0.0";
    for (let i of fileData) {
        depth = Math.floor(i.match(/ */)[0].length / 4);
        nowDict = nowDict.slice(0, depth);
        value = value.slice(0, depth);
        if (i.endsWith(":")) {
            nowDict.push(i.slice(depth * 4, -1));
        } else if (i.slice(depth * 4, depth * 4 + 3) == ">>>") {
            let v = i.slice(depth * 4 + 4);
            errorData[nowDict.join("$")] = value.join(":") + ":" + v;
        } else if (i.slice(depth * 4, depth * 4 + 2) == ">>") {
            let v = i.slice(depth * 4 + 3);
            value.push(v);
        } else if (i.startsWith("#")) {
            let command = i.split(/ +/);
            switch (command[0]) {
                case "#novaVersion":
                    version = command.slice(1).join(" ");
                    break;
            }
        }
    }
    let keys = Object.keys(errorData);
    let file = `type errorMessage = {
    [keys in
        | ${keys.map((value) => `"${value}"`).join("\n        | ")}]: string;
};

const version: string = "${version}";
const errorMessages: errorMessage = {
${keys
    .map((value) => {
        return (
            "    " +
            value +
            ': \n        "' +
            errorData[value].replace(/;/g, "\\n") +
            '",'
        );
    })
    .join("\n")}
};

type DictKeysToUnion<T extends Record<string, unknown>> = keyof T;

type errorMessageKeys = DictKeysToUnion<errorMessage>;

export { version, errorMessages, errorMessageKeys };
`;
    fs.writeFileSync("./src/data.ts", file);
    file = `{
    "name": "nova-script",
    "version": "${version}",
    "keywords": [
        "language",
        "kangping"
    ],
    "description": "Novascript is Kangping's programming language",
    "bin": {
        "nova": "./bin/bin.js"
    },
    "repository": {
        "type": "git",
        "url": "git+https://github.com/kangping-git/Novascript.git"
    },
    "author": "kangping",
    "license": "MIT",
    "devDependencies": {
        "@types/node": "^18.15.9",
        "electron": "^24.0.0"
    },
    "dependencies": {
        "@webgpu/types": "^0.1.32"
    }
}    
`;
    fs.writeFileSync("./package.json", file);
    childprocess.exec("tsc --removeComments", (error, stdout, stderr) => {
        if (error) {
            console.log(
                "build failed at " +
                    new Date()
                        .toISOString()
                        .split("T")
                        .join(" ")
                        .replace(/-/g, "/")
                        .replace(/Z/, "")
            );
        } else {
            fs.writeFileSync(
                "./data/buildData.json",
                JSON.stringify({
                    time: new Date()
                        .toISOString()
                        .split("T")
                        .join(" ")
                        .replace(/-/g, "/")
                        .replace(/Z/, ""),
                })
            );
            console.log(
                "build success at " +
                    new Date()
                        .toISOString()
                        .split("T")
                        .join(" ")
                        .replace(/-/g, "/")
                        .replace(/Z/, "")
            );
        }
    });
}
change();

childprocess.exec("node ./docs/autoBuild.js", (error, stdout, stderr) => {});
