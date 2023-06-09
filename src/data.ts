type errorMessage = {
    [keys in
        | "commandError$UnknownCommand"
        | "runCommandSyntaxError$NoPath"
        | "runCommandSyntaxError$CantFindFile"
        | "runCommandSyntaxError$NotFile"
        | "parserError$CantFindToken"
        | "parserError$NoReLine"
        | "parserError$NoSplitter"]: string;
};

const version: string = "2023.06.24.13.51-snapshot";
const errorMessages: errorMessage = {
    commandError$UnknownCommand: 
        "コマンドエラー:知らないコマンド「%s」です",
    runCommandSyntaxError$NoPath: 
        "コマンド構文エラー:実行するファイルのパスがありません",
    runCommandSyntaxError$CantFindFile: 
        "コマンド構文エラー:実行するファイルが見つかりません",
    runCommandSyntaxError$NotFile: 
        "コマンド構文エラー:ファイル以外は実行できません",
    parserError$CantFindToken: 
        "構文エラー:不明な構文が使用されています\n%s:%s:%s\n%s\n%s",
    parserError$NoReLine: 
        "構文エラー:改行やセミコロンが抜けています\n%s:%s:%s\n%s\n%s",
    parserError$NoSplitter: 
        "構文エラー:関数内の引数でコンマが抜けています\n%s:%s:%s\n%s\n%s",
};

type DictKeysToUnion<T extends Record<string, unknown>> = keyof T;

type errorMessageKeys = DictKeysToUnion<errorMessage>;

export { version, errorMessages, errorMessageKeys };
