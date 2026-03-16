
import jwt from "jsonwebtoken"
import { loadConfig } from "#common/helpers/load-config.helper"
import { AgentWebsocket } from "./agent-websocket"
import type { IDEType } from "./command-factory"

type EnvMap = {
    AGENT_NAME: string
    IDE_TYPE: IDEType
    AGENT_HASH: string
}

const getEnv = <K extends keyof EnvMap>(key: K): EnvMap[K] => {
    const value = process.env[key]
    if (!value) throw new Error(`ENV ERROR: ${key} is required`)
    return value as EnvMap[K]
}

const { port, auth } = loadConfig()

const agentName = getEnv("AGENT_NAME")
const hash = getEnv("AGENT_HASH")
const token = jwt.sign({ agentName, hash }, auth.secret)

new AgentWebsocket({
    agentName,
    port,
    ideType: getEnv("IDE_TYPE"),
    remote: process.env.REMOTE === "true",
    token,
}).start()
