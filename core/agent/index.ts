
import os from "os"
import { loadGlobalConfig } from "#common/helpers/load-config.helper"
import { AgentServer } from "./agent-websocket"

const globalConfig = loadGlobalConfig()
const { agentPort, auth, ideType, remote } = globalConfig

const agentName = os.userInfo().username

console.log(`[agent] starting as "${agentName}"`)

new AgentServer({
    port: agentPort,
    secret: auth.secret,
    ideType,
    remote,
}).start()
