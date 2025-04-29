import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'zh-CN',
  title: 'Deep Workflow',
  description: '类 dify、coze 的可视化流程图引擎',
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/guide/api' },
      { text: '节点扩展', link: '/guide/node-extension' },
      { text: 'GitHub', link: 'https://github.com/ideepSight/deep-workflow' }
    ],
    sidebar: {
      '/guide/': [
        { text: '快速开始', link: '/guide/getting-started' },
        { text: '原理与架构', link: '/guide/principle' },
        { text: '使用方式', link: '/guide/usage' },
        { text: '工作流API', link: '/guide/api' },
        { text: '节点扩展开发', link: '/guide/node-extension' },
        { text: '常见问题', link: '/guide/faq' }
      ]
    },
    outline: [2, 3],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ideepSight/deep-workflow' }
    ]
  }
}); 