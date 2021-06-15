const enableDebug = false;

const onReject = (rejectMessage) => {
  enableDebug && console.log("sending rejected message", rejectMessage);
  chrome.runtime.sendMessage(
    {
      type: "node_rejected",
      rejectMessage,
    },
    (suggestions) => {
      if (!suggestions) {
        // we have no idea what to suggest
        return;
      }

      // TODO: only supporting one suggestion at the moment.
      const [, suggestion] = suggestions[0];

      if (suggestion) {
        const node = findNode(rejectMessage.node_id);

        // get rid of any existing suggestion buttons
        node
          .querySelectorAll(".suggested-import")
          .forEach((n) => node.removeChild(n));

        // copy the jump to error style.
        const template = document.createElement("template");
        template.innerHTML =
          '<div class="suggested-import flex absolute top-0 right-0 dark-red hover-light-red bg-near-white items-center br-pill pea pointer" style="margin-top: 7px; font: 500 11px var(--sans-serif); padding: 3px 8px 4px;">Try suggested import</div>';
        const useSuggestionButton = template.content.childNodes[0];

        useSuggestionButton.addEventListener("click", () => {
          /* TODO: I'd like to try injecting code that will let us change
           * the code mirror text contents. See here:
           * https://stackoverflow.com/questions/32644906/accessing-all-the-window-variables-of-the-current-tab-in-chrome-extension */
          alert(`try using: ${suggestion}`);
          node.removeChild(useSuggestionButton);
        });

        node.appendChild(useSuggestionButton);
      }
    }
  );
};

const messageHandler = (message) => {
  const messageData = message.data;

  if (messageData.type === "bundle") {
    messageData.messages.filter((m) => m.type === "rejected").forEach(onReject);
  }
};

window.addEventListener("message", messageHandler);

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
