import Alpine from "../alpinejs";

export default function evaluateScriptSetup(el, code, params, context) {
    return Alpine.evaluate(el, transformScriptSetup(code), { scope: context, params });
    //return new Function(['$host', '$shadow'], transformScriptSetup(code))
}

function transformScriptSetup(code) {
    return `(() => {
            ${code}
        })()
    `;
}