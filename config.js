/**
 * webgen 全局配置
 * 修改此文件调整全局行为，禁止在 SKILL.md 或脚本中硬编码这些值
 */
module.exports = {
  // 子项目默认输出根目录（可被用户在会话中覆盖，但必须写回此文件）
  OUTPUT_DIR: "/Users/za-stanlexu/Desktop/ff/e/projects/",

  // .webgen 状态文件夹名（子项目内）
  WEBGEN_DIR: ".webgen",

  // Gate 状态文件名（.webgen/ 下）
  GATE_FILE: "gate.json",

  // 项目元信息文件名（.webgen/ 下）
  PROJECT_FILE: "project.json",

  // 设计方案文件名（.webgen/ 下）
  DESIGN_FILE: "design.md",

  // 需求文件名（.webgen/ 下）
  REQUIREMENTS_FILE: "requirements.md",

  // 自检报告文件名（.webgen/ 下）
  AUDIT_FILE: "audit.md",

  // impeccable 工作流产物文件名（.webgen/ 下）
  SHAPE_FILE: "shape-output.md",
  CRITIQUE_FILE: "critique-score.json",

  // design.md 标准章节定义，模板生成与 gate 校验必须共用
  DESIGN_SECTIONS: [
    {
      name: "区块树",
      description: "页面语义区块层级结构",
      aliases: ["区块树（Block Tree）", "Block Tree（区块树）", "Block Tree"]
    },
    {
      name: "核心设计变量",
      description: "颜色、间距、字体",
      aliases: ["核心设计变量（Design Tokens）", "Design Tokens"]
    },
    {
      name: "布局骨架",
      description: "响应式断点策略",
      aliases: ["布局骨架（响应式断点）"]
    },
    {
      name: "组件清单",
      description: "使用的 antd 组件 + 自定义组件"
    },
    {
      name: "路由设计",
      description: "react-router-dom 路由规划"
    },
    {
      name: "状态管理",
      description: "zustand store 设计",
      aliases: ["状态管理（zustand）"]
    },
    {
      name: "接口代理配置",
      description: "vite proxy 配置"
    }
  ],

  // Gate 工作流版本：v1 = 老项目（跳过 impeccable 校验），v2 = 新项目（强制校验）
  WORKFLOW_VERSION: "v2",

  // 技术栈（禁止修改）
  TECH_STACK: {
    bundler: "vite",
    css: "tailwindcss",
    ui: "antd",
    framework: "react",
    router: "react-router-dom",
    state: "zustand",
    http: "axios"
  },

  // 大文件阈值（字节），超过此值禁止一次性读写
  LARGE_FILE_THRESHOLD: 30000,

  // context 容量警告阈值
  CONTEXT_COMPACT_THRESHOLD: 0.80,

  // 图片素材搜索入口（仅供检索，禁止在页面中直接引用远程地址）
  IMAGE_SOURCES: {
    unsplash: "https://unsplash.com/s/photos/<keyword>",
    pexels: "https://www.pexels.com/search/<keyword>"
  }
};
