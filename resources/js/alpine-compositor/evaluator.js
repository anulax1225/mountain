import setupHook from "./setupHook.js?raw"

export default function evaluateScriptSetup(code) {
    return new Function(['$host', '$shadow'], transformScriptSetup(code))
}

function transformScriptSetup(code) {
    return setupHook.replace("//user-hook", code);
}