// from https://github.com/racha/alpinejs-jsz - src/index.js

export default (el, _, { evaluate, effect }) => {
    const unescapeIt = (str) => {
      let textarea = document.createElement("textarea");
      textarea.innerHTML = str;
      return textarea.value;
    }
    const finder = new RegExp(`{{([^{}]*)}}`, "g");

    const evaluateIt = (str) => {
        console.log("x-format starting match with " + str);
      str.match(finder)?.map((match) => {
        console.log("x-format matched with ");
        str = str.replace(match, evaluate(unescapeIt(match.replace(finder, "$1"))) || "");
      });
      return str || "";
    }

    let targetEl = !el.shadowRoot ? el : el.shadowRoot;
    let template = el.innerHTML;

    if (el.tagName === "TEMPLATE") {
      targetEl = targetEl.content.firstElementChild.cloneNode();
      template =  targetEl.innerHTML;
      el.after(targetEl);
    }
    effect(() => {
      targetEl.innerHTML = evaluateIt(template);
    })
}