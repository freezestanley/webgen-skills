# Gate 控制

---

## Gate 表

| Gate | 阶段 | 准入条件 | 准出条件（客观可验证） |
| :--- | :--- | :--- | :--- |
| **G0_SETUP** | 项目初始化 | 用户发起项目请求 | `PRODUCT.md` + `DESIGN.md` 存在且字段非空（脚本检测） |
| **G1_REQ** | 需求澄清 | G0 通过 | `requirements.md` 模板填写完整，Git commit 注明 `req-confirmed` |
| **G2_DESIGN** | 设计定义 | G1 通过 | `.webgen/shape-output.md` 存在，`critique-score.json` 中 `passed: true` |
| **G3_BUILD** | 代码构建 | G2 通过 | `npm run lint` 零 error，`npm run type-check` 零 error，Dev server 无 console.error |
| **G4_AUDIT** | 质量审计 | G3 通过 | `.webgen/audit.md` 存在，P0/P1 数量 = 0 |
| **G5_SHIP** | 交付上线 | G4 通过 + `polish` 执行完毕 | Lighthouse Performance ≥ 90，Accessibility ≥ 95，Best Practices ≥ 90 |

---

## Gate 检查脚本

所有 Gate 准出通过**脚本**执行，输出 exit code 0/1，禁止手动跳过：

```bash
# .webgen/gate-check.sh（G0 示例）
[ -f PRODUCT.md ] && grep -q "用户故事" PRODUCT.md || exit 1
[ -f DESIGN.md ]  && grep -q "primary:"  DESIGN.md  || exit 1
[ -f .webgen/live.config.js ]                       || exit 1

# G3 示例
npm run lint -- --max-warnings=0   || exit 1
npm run type-check                 || exit 1
node -e "require('./.webgen/dev-check')" || exit 1
```

> Gate 不强制与 CI/CD 绑定，但必须可本地独立运行。exit code 1 时禁止继续，修复后重跑。

---

## 异常路径

| 场景 | 处理方式 |
| :--- | :--- |
| audit 连续 3 次仍有 P0/P1 | 判断根因：设计问题 → 回退 G2；技术债（SDK/性能/兼容性）→ `.webgen/audit.md` 登记 `accepted-risk`（原因 + 预计解决时间），不回退设计阶段 |
| 紧急 hotfix | 跳过 G2/G3，修复后必须补跑 G4_AUDIT，不得遗留新 P0 |
| 需求中途变更 | `requirements.md` 追加变更记录（版本号 + 内容），重新执行 G1 准出，Block Tree 标注受影响区块 |
