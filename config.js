/**
 * webgen 全局配置
 * 修改此文件调整全局行为，禁止在 SKILL.md 或脚本中硬编码这些值
 */
module.exports = {
  // 子项目默认输出根目录（可被用户在会话中覆盖，但必须写回此文件）
  OUTPUT_DIR: "/Users/za-stanlexu/Desktop/ff/d/projects",

  // .webgen 状态文件夹名（子项目内）
  WEBGEN_DIR: ".webgen",

  // Gate 状态文件名（.webgen/ 下）
  GATE_FILE: "gate.json",

  // 设计方案文件名（.webgen/ 下）
  DESIGN_FILE: "design.md",

  // 需求文件名（.webgen/ 下）
  REQUIREMENTS_FILE: "requirements.md",

  // 自检报告文件名（.webgen/ 下）
  AUDIT_FILE: "audit.md",

  // impeccable 工作流产物文件名（.webgen/ 下）
  SHAPE_FILE: "shape-output.md",
  CRITIQUE_FILE: "critique-score.json",

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

  // 图片素材 CDN（禁止下载到本地）
  IMAGE_SOURCES: {
    unsplash: "https://unsplash.com/s/photos/<keyword>",
    pexels: "https://www.pexels.com/search/<keyword>"
  }
};
