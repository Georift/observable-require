console.log("running on observable worker");

const messageHandler = (event) => {
  const messageData = event.data;

  if (messageData.type === "bundle") {
    const { events } = messageData;

    events
      .filter(({ type }) => type === "modify_node")
      .forEach(({ node_id, new_node_value }) => {
        chrome.runtime.sendMessage({
          type: "modify_node",
          node_id,
          new_node_value,
        });
      });
  }
};

window.addEventListener("message", messageHandler);
