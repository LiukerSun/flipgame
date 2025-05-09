import type { NextConfig } from "next";

const config: NextConfig = {
  output: 'export',
  // 禁用API路由
  rewrites: () => Promise.resolve([]),
  // 禁用服务器端特性
  typescript: {
    ignoreBuildErrors: false,
  },
  // 如果您的项目中用到了图片，建议添加以下配置
  images: {
    unoptimized: true,
  },
  // 确保应用可以在任何路径下运行
  basePath: '',
  // 添加trailingSlash配置
  trailingSlash: true,
  // 配置静态导出
  distDir: 'out',
};

export default config;
