import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-refresh';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
	base: './',
	resolve: {
		alias: [{ find: '@deep-sight/workflow', replacement: '/packages/workflow' }]
	},
	build: {
		lib: {
			entry: 'packages/workflow/index.ts',
			name: 'deep-workflow',
			fileName: (format) => `deep-workflow.${format}.js`
		},
		rollupOptions: {
			external: [
				'react',
				'react-dom',
				'@arco-design/web-react',
				'@xyflow/react',
				'mobx',
				'mobx-react-lite',
				'lodash',
				'classnames',
				'acorn',
				'acorn-walk'
			],
			output: {
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM',
					'@arco-design/web-react': 'ArcoDesign',
					'@xyflow/react': 'ReactFlow',
					mobx: 'mobx',
					'mobx-react-lite': 'mobxReactLite',
					lodash: '_',
					classnames: 'classNames',
					acorn: 'acorn',
					'acorn-walk': 'acornWalk'
				}
			}
		}
	},
	plugins: [react(), dts({ exclude: ['src', 'packages/defaultNodes', 'packages/base'] })],
	server: {
		port: 5175
	}
});
