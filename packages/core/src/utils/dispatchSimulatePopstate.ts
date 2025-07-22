import { nextMessage } from "./nextMessage";

export const dispatchSimulatePopstate = (state: any) => {
  const event = new PopStateEvent("popstate", {
    state,
  });

  // @ts-expect-error
  event.isSimulate = true;
  nextMessage(() => {
    window.dispatchEvent(event);
  });
};
