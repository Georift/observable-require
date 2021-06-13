/**
 * Stores the last `modify_node` event that the worker saw for
 * each node.
 *
 * This event is sent to the worker when a cell is updated, so
 * it's a great way to prevent cell initialization triggering
 * the require helper prompt.
 */

let modifiedNodeContents = new Map();
window.modifiedNodeContents = modifiedNodeContents;

chrome.runtime.onMessage.addListener(function (message, callback) {
  console.log(message);

  if (message.type === "modify_node") {
    const { node_id, new_node_value } = message;
    modifiedNodeContents.set(node_id, new_node_value);
  } else if (message.type === "node_rejected") {
    // TODO: decide if this `node_rejected` event was caused by an import / require
  }
});
