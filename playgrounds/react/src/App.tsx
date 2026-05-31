import { forwardRef, memo, useCallback, useRef, useState } from "react";
import styled from "styled-components";
import { Button } from "./components/Button";

// --- Styled Components ---

const Card = styled.section``

const StyledInput = styled.input``

const ButtonTest = () => {
  return <h6>Holadnaf</h6>
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
  const [modalOpen, setModalOpen] = useState(false)

  const increment = useCallback(() => setCount((n) => n + 1), [])
  const decrement = useCallback(() => setCount((n) => n - 1), [])

  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <>
      <StyledDialog />
      <button onClick={() => setModalOpen(true)}>Open modal</button>

      {modalOpen && (
        // Modal de prueba con backdrop full-screen para validar que los FABs de
        // Tooltify siguen clickeables con un modal abierto.
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{ background: "#fff", color: "#111", padding: "2rem", borderRadius: 8, minWidth: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Modal de prueba</h2>
            <p>Con esto abierto, probá clickear los FABs de Tooltify.</p>
            <button onClick={() => setModalOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  )
}
