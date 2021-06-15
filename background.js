// packaged using bundle.run and save locally
// exposes `detectImportRequire` globally
import "./detect-import-require-v2.0.0.js";
// TODO: what's the correct way to handle dependencies in chrome extensions?

const lookupUrl =
  "https://raw.githubusercontent.com/Georift/observable-require/main/lookup.json";

/**
 * Stores the last `modify_node` event that the worker saw for
 * each node.
 *
 * This event is sent to the worker when a cell is updated, so
 * it's a great way to prevent cell initialization triggering
 * the require helper prompt.
 *
 * TODO: how will this work when we have multiple tabs open,
 * 			 we're going to need to correlate it by notebook id.
 */
let modifiedNodeContents = new Map();
window.modifiedNodeContents = modifiedNodeContents;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "modify_node") {
    const { node_id, new_node_value } = message;
    modifiedNodeContents.set(node_id, new_node_value);
  } else if (message.type === "node_rejected") {
    const nodeContents = modifiedNodeContents.get(
      message.rejectMessage.node_id
    );

    // if we don't have a cell modify value then it probably wasn't triggered by the user.
    const wasUserModification = !!nodeContents;

    if (!wasUserModification) {
      return;
    }

    console.warn("Detected a node_rejected event", message, nodeContents);
    const packages = findRequiredPackage(nodeContents);

    if (!Array.isArray(packages) || packages.length === 0) {
      // nothing we can do to help the user here.
      return;
    }

    fetch(lookupUrl)
      .then((res) => res.json())
      .then((lookups) => {
        const suggestedImports = packages
          .map((packageName) => {
            return [packageName, lookups[packageName]];
          })
          .filter(([, suggestion]) => !!suggestion);

        if (suggestedImports.length > 0) {
          sendResponse(suggestedImports);
        }
      })
      .catch((err) => console.error(`couldn't fetch ${lookupUrl}`, err));

    // we will be returning a message asynchronously
    return true;
  }
});

const findRequiredPackage = (nodeContents) => {
  /* import { vl } from "pkg"
   * has a node content of:
   * { href: "pkg", module: "pkg", imports: [...] } */
  if (nodeContents.href || nodeContents.module) {
    return [nodeContents.module];
  }

  if (nodeContents.features && nodeContents.features.dynamicImport) {
    /* TODO: at the moment this is only supporting `require('string')` syntax,
     * it might be something I'm doing wrong as the library states it handles
     * import() also. */
    console.warn("Don't yet support import() syntax.");
    return;
  }

  /* use the body property which contains extra stuff like "use string"..
   * but seem to always be present, while `_input` only exists for require. */
  return detectImportRequire(nodeContents.body);
};
