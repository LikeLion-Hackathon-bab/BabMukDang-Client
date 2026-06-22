import { stackflow } from '@stackflow/react'
import { basicRendererPlugin } from '@stackflow/plugin-renderer-basic'
import { historySyncPlugin } from '@stackflow/plugin-history-sync'
import { NavigationActivityShell } from './NavigationActivityShell'
import { createStackflowActivityComponents, stackflowConfig } from './routes'

const stackflowActivityComponents = createStackflowActivityComponents(
    NavigationActivityShell
)

const stackflowResult = stackflow({
    config: stackflowConfig,
    components: stackflowActivityComponents,
    plugins: [
        basicRendererPlugin(),
        historySyncPlugin({
            config: stackflowConfig,
            fallbackActivity: () => 'RootActivity'
        })
    ]
})

export const StackflowStack = stackflowResult.Stack
export const stackflowActions = stackflowResult.actions
