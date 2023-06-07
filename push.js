const childprocess = require("child_process");
const data = require("./bin/data");
console.log("git add");
childprocess.execSync("git add .");
console.log("git commit");
childprocess.execSync('git commit -m "' + data.version + '"');
console.log("git push");
childprocess.execSync("git push -u origin main");
