import path from "path";
import { copyLibFiles } from "@qwik.dev/partytown/utils";
import type { GatsbyNode } from "gatsby";

export const onPreBootstrap: GatsbyNode["onPreBootstrap"] = async () => {
  await copyLibFiles(path.join(process.cwd(), "static", "~partytown"));
};
