"use client";

import nextDynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { PropertiesMap as PropertiesMapType } from "./PropertiesMap";

const PropertiesMap = nextDynamic(
  () => import("./PropertiesMap").then((mod) => mod.PropertiesMap),
  { ssr: false }
);

export function PropertiesMapLoader(props: ComponentProps<typeof PropertiesMapType>) {
  return <PropertiesMap {...props} />;
}
