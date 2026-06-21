import { stackflow } from '@stackflow/react'
import { basicRendererPlugin } from '@stackflow/plugin-renderer-basic'
import { historySyncPlugin } from '@stackflow/plugin-history-sync'
import { stackflowActivityComponents } from './activityComponents'
import { stackflowConfig } from './stackflow.config'

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
