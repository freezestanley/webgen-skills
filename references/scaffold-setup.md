# 脚手架使用说明

## 模板位置

```
templates/scaffold/          ← 标准脚手架模板
  index.html
  main.js
  styles/
    main.css
  sections/
    .gitkeep
  js/
    .gitkeep
  docs/
    .gitkeep
  tailwind.config.js
  vite.config.js
  package.json
```

## 初始化步骤

```bash
# 1. 复制模板
cp -r <skill目录>/templates/scaffold/ ./<项目名>/

# 2. 进入项目目录
cd <项目名>

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev
# 默认端口：5173

# 5. 构建
npm run build
# 产物在 ./dist/
```

## package.json 标准配置

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

## tailwind.config.js 主题扩展位置

```js
// tailwind.config.js
export default {
  content: ['./**/*.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        // 在这里写入 GATE-2 方案中确定的主题色
        primary: '#<hex>',
        secondary: '#<hex>',
      },
      fontFamily: {
        // 在这里写入 GATE-2 方案中确定的字体
        heading: ['<FontName>', 'sans-serif'],
        body: ['<FontName>', 'sans-serif'],
      }
    }
  }
}
```

## 文件命名约定

```
sections/<区块英文名>.html    ← 每个区块一个文件
js/<区块英文名>.js            ← 每个区块的交互逻辑
styles/main.css               ← 只写 @tailwind 指令 + CSS 变量
docs/design-plan.md           ← GATE-2 方案文档
docs/qa-report.md             ← GATE-4 自检报告
```

## 禁止项

- 禁止在 index.html 中直接写大段区块 HTML（超过 50 行就应该拆 section）
- 禁止内联 `style="..."` 属性（用 Tailwind class 或 CSS 变量）
- 禁止 `<script>` 标签写业务逻辑（放 js/ 目录）
- 禁止修改 vite.config.js 的构建目标（保持 ES2015+）
