window.addEventListener("load", () => {
    const textarea = document.getElementById("input");
    const outputPre = document.getElementById("out");
    let line = [];
    function getCaretCoordinates(textarea, caretPos) {
        var content = textarea.value.substring(0, caretPos);
        var dummy = document.createElement("div");
        dummy.style.position = "absolute";
        dummy.style.top = "0";
        dummy.style.left = "0";
        dummy.style.visibility = "hidden";
        dummy.innerHTML =
            "&ZeroWidthSpace;" +
            content
                .replace(/ /g, "&nbsp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, "<br>") +
            "&ZeroWidthSpace;";
        outputPre.appendChild(dummy);
        dummy.appendChild(document.createElement("span"));
        var caretX = dummy.querySelector("span").getClientRects()[0].x + 100;
        var caretY = dummy.querySelector("span").getClientRects()[0].y;
        outputPre.removeChild(dummy);

        return {
            x: caretX + textarea.scrollLeft,
            y: caretY + textarea.scrollTop,
        };
    }

    function BS(c) {
        let l = 0;
        let r = line.length;
        while (r - l > 1) {
            let mid = Math.floor((r - l) / 2) + l;
            if (line[mid] > c) {
                r = mid;
            } else {
                l = mid;
            }
        }
        return l;
    }

    function caretUpdate() {
        caretStart = textarea.selectionStart;
        caretEnd = textarea.selectionEnd;
        let SPos = getCaretCoordinates(textarea, textarea.selectionStart);
        let EPos = getCaretCoordinates(textarea, textarea.selectionEnd);
        if (caretStart == caretEnd) {
            document.getElementById("active").style.top = SPos.y - 1 + "px";
        } else {
            document.getElementById("active").style.top = "-10000000px";
        }
        let text = textarea.value[textarea.selectionStart];
        if (text == void 0 || text == "\n" || text == " ") {
            document.getElementById("select").innerHTML = "&nbsp;";
        } else {
            document.getElementById("select").innerText = text;
        }
        document.getElementById("select").style.top = SPos.y + "px";
        document.getElementById("select").style.left = SPos.x + "px";
        let Sl = BS(textarea.selectionStart);
        let El = BS(textarea.selectionEnd) + 1;
        let selectOut = document.getElementById("selectOut");
        selectOut.innerHTML = "";
        for (let i = Sl; i < El; ++i) {
            let s = i == Sl;
            let l = i == El - 1;
            if (s && l) {
                let elm = document.createElement("div");
                elm.classList.add("select2");
                elm.style.position = "absolute";
                elm.style.top = SPos.y + "px";
                elm.style.left = SPos.x + "px";
                elm.style.width = EPos.x - SPos.x + 10 + "px";
                elm.style.zIndex = -10;
                elm.innerText = "s";
                selectOut.appendChild(elm);
            } else if (s) {
                let Pos = getCaretCoordinates(textarea, line[i + 1] - 1);
                let elm = document.createElement("div");
                elm.classList.add("select2");
                elm.style.position = "absolute";
                elm.style.top = SPos.y + "px";
                elm.style.left = SPos.x + "px";
                elm.style.width = Pos.x - SPos.x + 10 + "px";
                elm.style.zIndex = -10;
                elm.innerText = "s";
                selectOut.appendChild(elm);
            } else if (l) {
                let Pos = getCaretCoordinates(textarea, line[i]);
                let elm = document.createElement("div");
                elm.classList.add("select2");
                elm.style.position = "absolute";
                elm.style.top = Pos.y + "px";
                elm.style.left = Pos.x + "px";
                elm.style.width = EPos.x - Pos.x + 10 + "px";
                elm.style.zIndex = -10;
                elm.innerText = "s";
                selectOut.appendChild(elm);
            } else {
                let Pos = getCaretCoordinates(textarea, line[i + 1] - 1);
                let elm = document.createElement("div");
                elm.classList.add("select2");
                elm.style.position = "absolute";
                elm.style.top = Pos.y + "px";
                elm.style.left = "100px";
                elm.style.width = Pos.x - 100 + 10 + "px";
                elm.style.zIndex = -10;
                elm.innerText = "s";
                selectOut.appendChild(elm);
            }
        }
    }

    function nextToken(tokens) {
        let i = tokens
            .slice(1)
            .findIndex(
                (value) => value[0] != " " && value != void 0 && value != ""
            );
        return tokens[i + 1];
    }
    function codeSplitter(code) {
        let $token = code.split(
            /(\r\n|\r|\n|\+|-|\/\/[^\n]*|\*\*|\*|\/|"[^"]*"|,|[a-zA-Z_][a-zA-Z0-9_]*|[0-9]+\.[0-9]+|[0-9]+|\(|\)|;)/
        );
        return $token;
    }
    function escapeHTML(code) {
        return code
            .replace(/ /g, "&nbsp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function updateOutput() {
        if (lastInput !== textarea.value) {
            let l = 0;
            line = [];
            let o = "";
            let lines = textarea.value.split("\n");
            for (let i = 0; i < lines.length; ++i) {
                o += "<span class='line'>";
                let token = codeSplitter(lines[i]);
                while (token.length > 0) {
                    let t = token[0];
                    if (t.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
                        if ("any string number".split(" ").includes(t)) {
                            o +=
                                "<span class='token type'>" +
                                escapeHTML(t) +
                                "</span>";
                        } else if (nextToken(token) == "(") {
                            o +=
                                "<span class='token func'>" +
                                escapeHTML(t) +
                                "</span>";
                        } else {
                            o +=
                                "<span class='token var'>" +
                                escapeHTML(t) +
                                "</span>";
                        }
                    } else if (t.match(/^"[^"]*"$/)) {
                        o +=
                            "<span class='token str'>" +
                            escapeHTML(t) +
                            "</span>";
                    } else if (t.match(/^\d+\.\d+$/) || t.match(/^\d+$/)) {
                        o +=
                            "<span class='token num'>" +
                            escapeHTML(t) +
                            "</span>";
                    } else if (t.slice(0, 2) == "//") {
                        o +=
                            "<span class='token comment'>" +
                            escapeHTML(t) +
                            "</span>";
                    } else {
                        o += "<span class='token'>" + escapeHTML(t) + "</span>";
                    }
                    token = token.slice(1);
                }
                line.push(l);
                l += lines[i].length + 1;
                o += "</span>";
            }
            outputPre.innerHTML = o;
            lastInput = textarea.value;
            caretUpdate();
        }
        if (
            caretStart !== textarea.selectionStart ||
            caretEnd !== textarea.selectionEnd
        ) {
            caretUpdate();
        }
        requestAnimationFrame(updateOutput);
    }

    let lastInput = null;
    let caretStart = -1;
    let caretEnd = -1;

    textarea.addEventListener("input", () => {
        updateOutput();
    });
    textarea.addEventListener("scroll", () => {
        document.getElementById("output").scrollTop = textarea.scrollTop;
        document.getElementById("output").scrollLeft = textarea.scrollLeft;
    });
    textarea.addEventListener("focus", caretUpdate);
    textarea.addEventListener("blur", () => {
        document.getElementById("select").innerHTML = "";
        document.getElementById("selectOut").innerHTML = "";
    });

    updateOutput();
});
