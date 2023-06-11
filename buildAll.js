const path = require("path");
const fs = require("fs");
const showFiles = (dirpath, callback) => {
    fs.readdir(dirpath, { withFileTypes: true }, (err, dirents) => {
        if (err) {
            console.error(err);
            return;
        }

        for (const dirent of dirents) {
            const fp = path.join(dirpath, dirent.name);
            if (dirent.isDirectory()) {
                showFiles(fp, callback);
            } else {
                callback(fp);
            }
        }
    });
};

showFiles(path.join(__dirname, "./pages/"), (file) => {
    build(file);
});

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
