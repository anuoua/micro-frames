import Framebus from "framebus";

export const framebus = new Framebus({
  channel: "MCF::Public",
});

export const Public = {
  framebus,
};
