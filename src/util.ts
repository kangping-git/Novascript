import * as NovaData from "./data";

function error(errorID: NovaData.errorMessageKeys, ...data: any) {
    let index: number = 0;
    console.error(
        NovaData.errorMessages[errorID]
            .split(/(%s)/)
            .map((value: string) => {
                if (value == "%s") {
                    index += 1;
                    return data[index - 1];
                }
                return value;
            })
            .join("")
    );
    process.exit(1);
}

export { error };
