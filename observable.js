console.log("running in observable");

const onReject = (rejectMessage) => {
  // TODO: detect if this error is related to an import

  console.log("sending rejected message", rejectMessage);
  chrome.runtime.sendMessage({
    type: "node_rejected",
    rejectMessage,
  });
};

const messageHandler = (message) => {
  const messageData = message.data;

  if (messageData.type === "bundle") {
    messageData.messages.filter((m) => m.type === "rejected").forEach(onReject);
  }
};

window.addEventListener("message", messageHandler);

// FIXME: unused
const findNode = (nodeId) => {
  const containingDiv = document.querySelector("div[tabindex='-1']");

  if (!containingDiv) {
    console.log(`Couldn't finding containing div for ${nodeId}.`);
    return;
  }

  const nodeDiv = containingDiv.querySelector(`div[data-node-id="${nodeId}"]`);

  if (!nodeDiv) {
    console.log(`Couldn't find node div ${nodeId}`);
    return;
  }

  return nodeDiv;
};
