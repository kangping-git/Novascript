const childprocess = require("child_process");
const path = require("path");
const data = require(path.join(__dirname, "../bin/data"));
console.log("git add");
childprocess.execSync("cd " + __dirname + " & git add .");
console.log("git commit");
childprocess.execSync(
    'cd " + __dirname + " & git commit -m "' + data.version + '"'
);
console.log("git push");
childprocess.execSync("cd " + __dirname + " & git push -u origin docs");

childprocess.execSync(
    "cd " + path.join(__dirname, "./build/") + " & git add ."
);
childprocess.execSync(
    "cd " +
        path.join(__dirname, "./build/") +
        " & git commit -m " +
        data.version +
        ""
);

childprocess.execSync(
    "cd " + path.join(__dirname, "./build/") + " & git push -u origin page"
);
