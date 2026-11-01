import { createFileRoute } from "@tanstack/react-router";
import { FarmApp } from "@/components/farm/farm-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <FarmApp />;
}
