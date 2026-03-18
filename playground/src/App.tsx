import { forwardRef, memo, useCallback, useRef, useState } from "react";
import styled from "styled-components";
import { Button } from "./components/Button";

// --- Styled Components ---

const Card = styled.section``

const StyledInput = styled.input``

const ButtonTest = () => {
  return <h6>Holadna</h6>
}
// styled wrapping a non-forwardRef component (triggers warning)
function DialogComponent(props: any) {
  return <ButtonTest {...props}></ButtonTest>
}
const StyledDialog = styled(DialogComponent)``

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
        <StyledInput ref={ref} {...rest} />
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
    <>
      <StyledDialog />
    </>

  )
}
