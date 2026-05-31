
import os from "os"
import { loadGlobalConfig } from "#common/helpers/load-config.helper"
import { AgentServer } from "./agent-websocket"

const globalConfig = loadGlobalConfig()
const { agentPort, ideType, remote } = globalConfig

const agentName = os.userInfo().username

console.log(`[agent] starting as "${agentName}"`)

// TODO(batch-2): rewrite as multi-connection client using HomeToken scan
new AgentServer({
    port: agentPort,
    secret: "placeholder",
    ideType,
    remote,
}).start()
