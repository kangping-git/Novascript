const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const chokidar = require("chokidar");

function build() {
    builds = false;
    childProcess.exec(
        "node " + path.join(__dirname, "./build.js"),
        (error, stdout, stderr) => {
            if (stderr) {
                console.log("buildFailed");
                console.error(stderr.toString());
            } else {
                console.log("buildSuccess!");
            }
            builds = true;
        }
    );
}
const watcher = chokidar.watch(path.join(__dirname, "/pages/"), {
    persistent: true,
    ignoreInitial: true,
});

watcher.on("all", (event, filePath) => {
    if (builds) {
        build();
    }
});

watcher.on("error", (error) => {
    console.error("Error occurred:", error);
});

let builds = true;

build();
