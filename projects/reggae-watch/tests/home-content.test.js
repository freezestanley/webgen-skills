import test from "node:test";
import assert from "node:assert/strict";
import { pageContent } from "../src/pages/home/content.js";

test("home content models a street watch landing page", () => {
  assert.equal(pageContent.brand, "雷鬼");
  assert.match(pageContent.hero.title, /雷鬼/);
  assert.equal(pageContent.cta.primary, "立即选购");
  assert.equal(pageContent.cta.secondary, "预约咨询");
  assert.equal(pageContent.sections.length >= 6, true);
  assert.deepEqual(
    pageContent.sections.map((section) => section.title),
    [
      "核心系列",
      "材质工艺",
      "佩戴场景",
      "品牌态度",
      "细节参数",
      "购买入口"
    ]
  );
});
