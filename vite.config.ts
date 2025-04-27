import { defineConfig, ConfigEnv, UserConfig } from 'vite';
import react from '@vitejs/plugin-react-refresh';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig((params: ConfigEnv): UserConfig => {
	const { command, mode, ...env } = params;
	const baseConfig = {
		base: './',
		resolve: {
			alias: [{ find: '@deep-sight/workflow', replacement: '/packages/workflow' }]
		},
		plugins: [react(), dts({ exclude: ['src', 'packages/defaultNodes', 'packages/base'] })],
		server: {
			port: 5175
		}
	};

	console.log('build package', params);
	// 当目标为 packages 时，使用库构建配置
	if (params.mode === 'lib') {
		return {
			...baseConfig,
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
						'acorn-walk',
						'dayjs'
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
							'acorn-walk': 'acornWalk',
							dayjs: 'dayjs'
						}
					}
				}
			}
		};
	}

	// 默认使用普通应用构建配置
	return {
		...baseConfig,
		build: {
			outDir: 'dist',
			sourcemap: true
		}
	};
});
