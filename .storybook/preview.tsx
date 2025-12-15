import type { Preview } from "@storybook/react-vite";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { SocketProvider } from '@/contexts/SocketContext'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../src/main.css";
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
const customViewports = {
  iphoneSE: {
    name: 'iPhone SE (375x667)',
    styles: {
      width: '375px',
      height: '667px',
    },
    type: 'mobile',
  },
  largeMobile: {
    name: 'Large Mobile (414px)',
    styles: {
      width: '414px',
      height: '896px',
    },
    type: 'mobile',
  },
}
const preview: Preview = {
  parameters: {
     viewport: {
      viewports: {  
        options: INITIAL_VIEWPORTS,
        ...customViewports
      }
    },
    initialGlobals:{
      viewport: { value: 'mobile1', isRotated: false },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SocketProvider>
          <Story />
          </SocketProvider>
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
};

export default preview;