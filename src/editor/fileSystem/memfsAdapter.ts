import { Volume } from "memfs";

export const fs = Volume.fromJSON({
  "/src/App.tsx": "export default function App() { return <h1>Hello</h1>; }",
  "/src/index.tsx": "import App from './App';",
  "/package.json": JSON.stringify({
    name: "orion-nexus-project",
    dependencies: {},
  }),
});
