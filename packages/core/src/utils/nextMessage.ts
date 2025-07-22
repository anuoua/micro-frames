export const nextMessage = (callback: () => void) => {
  const channel = new MessageChannel();
  channel.port2.onmessage = () => {
    callback();
  };
  channel.port1.postMessage("");
};
