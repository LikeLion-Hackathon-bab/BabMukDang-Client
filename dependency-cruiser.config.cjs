/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: 'no-api-in-components',
            from: { path: '^src/components' },
            to: { path: '^src/apis' },
            severity: 'warn'
        },
        {
            name: 'no-store-in-shared-components',
            from: { path: '^src/components/shared' },
            to: { path: '^src/store' },
            severity: 'error'
        },
        {
            name: 'no-context-in-ui-components',
            from: { path: '^src/components/(shared|ui)' },
            to: { path: '^src/contexts' },
            severity: 'error'
        },
        {
            name: 'no-pages-imported-by-components',
            from: { path: '^src/components' },
            to: { path: '^src/pages' },
            severity: 'error'
        },
        {
            name: 'no-socket-context-in-components',
            from: { path: '^src/components' },
            to: { path: '^src/contexts/SocketContext' },
            severity: 'warn'
        },
        {
            name: 'no-socket-io-in-components',
            from: { path: '^src/components' },
            to: { path: 'socket.io-client' },
            severity: 'error'
        },
        {
            name: 'no-store-in-shared-components',
            from: { path: '^src/components/shared' },
            to: { path: '^src/store' },
            severity: 'error'
        },
        {
            name: 'no-room-socket-in-ui',
            from: { path: '^src/components/(shared|ui)' },
            to: { path: '^src/features/rooms/socket' },
            severity: 'error'
        }
    ],

    options: {
        doNotFollow: {
            path: 'node_modules'
        },

        includeOnly: '^src',

        tsPreCompilationDeps: true,

        tsConfig: {
            fileName: 'tsconfig.json'
        },

        enhancedResolveOptions: {
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
            conditionNames: ['import', 'require', 'node', 'default']
        },

        reporterOptions: {
            dot: {
                collapsePattern:
                    'node_modules/[^/]+|src/[^/]+/(dto|dtos|entities|entity|types|interfaces|constants|schemas)'
            },
            archi: {
                collapsePattern:
                    'node_modules/[^/]+|src/[^/]+/(dto|dtos|entities|entity|types|interfaces|constants|schemas)'
            }
        }
    }
}
