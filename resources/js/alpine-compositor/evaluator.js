import { evaluate } from "alpinejs";
import { injectMagics } from "alpinejs/src/magics.js"
import { injectDataProviders } from "alpinejs/src/datas.js"

export default function evaluateScriptSetup(el, code, params, context) {
    let magicContext = {}
    injectMagics(magicContext, el)

    let dataProviderContext = {}
    injectDataProviders(dataProviderContext, magicContext)
    return evaluate(el, transformScriptSetup(code), { scope: {  ...context, ...dataProviderContext }, params });
    //return new Function(['$host', '$shadow'], transformScriptSetup(code))
}

function transformScriptSetup(code) {
    return `
        ($host, $shadow) => {
            ${code}
        }
    `;
}