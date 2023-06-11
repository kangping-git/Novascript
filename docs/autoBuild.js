const path = require("path");
const fs = require("fs");
const chokidar = require("chokidar");

function build(filePath) {
    try {
        const r = require("./build");
        fs.mkdirSync(
            path.dirname(
                path.join(
                    __dirname,
                    "./build/",
                    path.relative(
                        path.join(__dirname, "./pages/"),
                        filePath.split(".").slice(0, -1).join(".")
                    )
                )
            ),
            {
                recursive: true,
            }
        );
        fs.writeFileSync(
            path.join(
                __dirname,
                "./build/",
                path.relative(
                    path.join(__dirname, "./pages/"),
                    filePath.split(".").slice(0, -1).join(".") + ".html"
                )
            ),
            r.build(fs.readFileSync(filePath, "utf-8"), filePath)
        );
        console.log("build success!!");
    } catch (e) {
        console.log(e);
        console.log("build error");
    }
}
const watcher = chokidar.watch(path.join(__dirname, "/pages/"), {
    persistent: true,
    ignoreInitial: true,
});

watcher.on("all", (event, filePath) => {
    if (builds) {
        build(filePath);
    }
});

watcher.on("error", (error) => {
    console.error("Error occurred:", error);
});

let builds = true;
