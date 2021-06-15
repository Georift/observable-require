const enableDebug = false;

const messageHandler = (event) => {
  const messageData = event.data;

  if (messageData.type === "bundle") {
    const { events } = messageData;

    events
      .filter(({ type }) => type === "modify_node")
      .forEach((m) => {
        enableDebug && console.log(m);
        const { node_id, new_node_value } = m;

        chrome.runtime.sendMessage({
          type: "modify_node",
          node_id,
          new_node_value,
        });
      });
  }
};

window.addEventListener("message", messageHandler);
