import { forwardRef, memo, useCallback, useRef, useState } from "react";
import { Button } from "./components/Button";

// --- ForwardRef ---

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

const LabeledInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...rest }, ref) => {
    return (
      <div>
        <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
          {label}
        </label>
        <input ref={ref} {...rest} />
      </div>
    )
  }
)

LabeledInput.displayName = "LabeledInput"

// --- Memo ---

interface CounterDisplayProps {
  count: number
  onIncrement: () => void
  onDecrement: () => void
}

const CounterDisplay = memo<CounterDisplayProps>(({ count, onIncrement, onDecrement }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Button label="-" onClick={onDecrement} />
      <span>{count}</span>
      <Button label="+" onClick={onIncrement} />
    </div>
  )
})

CounterDisplay.displayName = "CounterDisplay"

// --- App ---

export default function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [count, setCount] = useState(0)

  const increment = useCallback(() => setCount((n) => n + 1), [])
  const decrement = useCallback(() => setCount((n) => n - 1), [])

  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div style={{ padding: "2rem", maxWidth: "480px" }}>
      <h2>Tooltify Playground</h2>

      <section>
        <h4>ForwardRef — LabeledInput</h4>
        <LabeledInput ref={inputRef} label="Username" placeholder="type something..." />
        <br />
        <Button label="Focus input" onClick={focusInput} />
      </section>

      <section>
        <h4>Memo — CounterDisplay</h4>
        <CounterDisplay count={count} onIncrement={increment} onDecrement={decrement} />
      </section>

      <section>
        <h4>ForwardRef — Button ref</h4>
        <Button
          ref={buttonRef}
          label="Ref Button"
          onClick={() => console.log("buttonRef", buttonRef.current)}
        />
      </section>
    </div>
  )
}
