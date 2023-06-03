import * as NovaData from "./data";

function error(errorID: NovaData.errorMessageKeys, ...datas: any) {
    let index: number = 0;
    console.error(
        NovaData.errorMessages[errorID]
            .split(/(%s)/)
            .map((value: string) => {
                if (value == "%s") {
                    index += 1;
                    return datas[index - 1];
                }
                return value;
            })
            .join("")
    );
    process.exit();
}

export { error };
