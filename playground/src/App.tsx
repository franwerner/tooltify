import { useState } from "react";
import { Button } from "./components/Button";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      count: {count}
    </button>
  );
}

export default function App() {
  return (
    <div>
      <h1>Devtools Playground</h1>
      <Counter />
      <Button />
    </div>
  );
}
