
interface TooltifyResponse<T = void> {
    ok: boolean
    message: string
    data: T
}

export { type TooltifyResponse }
