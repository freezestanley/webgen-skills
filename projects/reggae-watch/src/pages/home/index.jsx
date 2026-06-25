import React, { useState } from "react";
import { pageContent } from "./content.js";

const navItems = [
  { label: "系列", href: "#collection" },
  { label: "工艺", href: "#craft" },
  { label: "场景", href: "#lifestyle" },
  { label: "态度", href: "#manifesto" },
  { label: "购买", href: "#buy" }
];

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="max-w-3xl">
      <p className="text-[11px] uppercase tracking-[0.32em] text-lime-300/80">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
        {description}
      </p>
    </div>
  );
}

function PrimaryButton({ href, children, secondary = false }) {
  return (
    <a
      href={href}
      className={[
        "inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold transition duration-300",
        secondary
          ? "border-zinc-700 bg-transparent text-zinc-100 hover:border-zinc-500 hover:bg-zinc-900"
          : "border-lime-300 bg-lime-300 text-zinc-950 hover:bg-lime-200 hover:border-lime-200",
      ].join(" ")}
    >
      {children}
    </a>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
      <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-zinc-50">{value}</div>
    </div>
  );
}

function ProductCard({ item, index }) {
  return (
    <article className="group rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 transition duration-300 hover:-translate-y-1 hover:border-lime-300/30 hover:bg-white/[0.05]">
      <div className="mb-5 flex items-center justify-between text-[11px] uppercase tracking-[0.26em] text-zinc-400">
        <span>0{index + 1}</span>
        <span className="text-lime-300">{item.tone}</span>
      </div>
      <div className="relative mb-5 aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(214,255,63,0.22),transparent_32%),linear-gradient(160deg,#121216,#060607_62%,#18181b)]">
        <div className="absolute inset-x-[18%] top-4 h-6 rounded-full border border-white/10 bg-white/5" />
        <div className="absolute inset-x-[18%] bottom-4 h-6 rounded-full border border-white/10 bg-white/5" />
        <div className="absolute inset-y-10 left-1/2 w-[52%] -translate-x-1/2 rounded-[2rem] border border-white/15 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.18),transparent_30%),linear-gradient(180deg,#0a0a0c,#1f2937)] shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-[18%] rounded-full border border-lime-300/30 bg-[radial-gradient(circle_at_center,rgba(214,255,63,0.08),rgba(0,0,0,0.78)_60%)]">
            <div className="absolute inset-0 rounded-full border border-white/5" />
            <div className="absolute left-1/2 top-[18%] h-[28%] w-px -translate-x-1/2 bg-lime-300/80" />
            <div className="absolute left-1/2 top-1/2 h-px w-[28%] -translate-y-1/2 -translate-x-1/2 bg-lime-300/80" />
            <div className="absolute inset-x-[19%] top-[18%] h-px bg-white/10" />
            <div className="absolute inset-x-[19%] bottom-[18%] h-px bg-white/10" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-50">{item.name}</h3>
          <p className="mt-2 max-w-[18rem] text-sm leading-6 text-zinc-300">
            {item.copy}
          </p>
        </div>
        <span className="rounded-full border border-lime-300/30 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-lime-300">
          Drop
        </span>
      </div>
    </article>
  );
}

function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="relative overflow-hidden bg-zinc-950 text-zinc-50">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[28rem] w-[28rem] rounded-full bg-lime-300/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-8%] top-[18%] h-[24rem] w-[24rem] rounded-full bg-rose-500/10 blur-[120px]" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <a href="#top" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-lime-300/30 bg-lime-300/10 text-sm font-black tracking-[0.3em] text-lime-300">
              R
            </span>
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-100">
                雷鬼
              </div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-400">
                Street watch
              </div>
            </div>
          </a>

          <nav className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-xs uppercase tracking-[0.26em] text-zinc-400 transition hover:text-zinc-100"
              >
                {item.label}
              </a>
            ))}
            <PrimaryButton href="#buy">立即选购</PrimaryButton>
          </nav>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-zinc-100 lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label="打开导航"
          >
            <span className="flex flex-col gap-1.5">
              <span className="h-px w-4 bg-current" />
              <span className="h-px w-3.5 bg-current" />
            </span>
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-white/10 bg-zinc-950 px-4 py-5 lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm uppercase tracking-[0.22em] text-zinc-200"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <section id="top" className="mx-auto max-w-7xl px-4 pb-16 pt-8 md:px-8 md:pb-24 md:pt-10">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.3em] text-lime-300/90">
              {pageContent.hero.eyebrow}
            </p>
            <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-[-0.06em] text-zinc-50 md:text-7xl xl:text-[7.25rem]">
              {pageContent.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 md:text-lg">
              {pageContent.hero.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <PrimaryButton href="#buy">{pageContent.cta.primary}</PrimaryButton>
              <PrimaryButton href="#story" secondary>
                {pageContent.cta.secondary}
              </PrimaryButton>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {pageContent.hero.stats.map((stat) => (
                <Metric key={stat.label} {...stat} />
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-10 bottom-6 h-28 rounded-full bg-lime-300/10 blur-3xl" />
            <div className="relative mx-auto aspect-square w-full max-w-[34rem] rounded-[2.5rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02)_30%,rgba(0,0,0,0.25)_65%)] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
              <div className="flex h-full flex-col justify-between rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(214,255,63,0.18),transparent_30%),linear-gradient(180deg,#09090b,#111115_54%,#040405)] p-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.34em] text-zinc-400">
                    42mm signature
                  </span>
                  <span className="rounded-full border border-lime-300/20 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-lime-300">
                    Drop 01
                  </span>
                </div>

                <div className="relative mx-auto grid aspect-square w-[88%] place-items-center">
                  <div className="absolute inset-x-1/2 top-0 h-[18%] w-12 -translate-x-1/2 rounded-full border border-white/10 bg-white/[0.06]" />
                  <div className="absolute inset-x-1/2 bottom-0 h-[18%] w-12 -translate-x-1/2 rounded-full border border-white/10 bg-white/[0.06]" />
                  <div className="relative aspect-square w-[72%] rounded-full border border-white/10 bg-[radial-gradient(circle_at_50%_38%,rgba(214,255,63,0.18),rgba(0,0,0,0.78)_58%)] shadow-[inset_0_0_0_18px_rgba(255,255,255,0.03)]">
                    <div className="absolute inset-[12%] rounded-full border border-lime-300/20" />
                    <div className="absolute inset-[18%] rounded-full border border-white/5" />
                    <div className="absolute left-1/2 top-[17%] h-[28%] w-1 -translate-x-1/2 rounded-full bg-lime-300/90" />
                    <div className="absolute left-1/2 top-1/2 h-1 w-[28%] -translate-y-1/2 -translate-x-1/2 rounded-full bg-lime-300/90" />
                    <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime-300/60 bg-zinc-950" />
                    <div className="absolute inset-x-[20%] top-[16%] h-px bg-white/10" />
                    <div className="absolute inset-x-[20%] bottom-[16%] h-px bg-white/10" />
                    <div className="absolute left-[16%] top-1/2 h-px w-[12%] -translate-y-1/2 bg-white/10" />
                    <div className="absolute right-[16%] top-1/2 h-px w-[12%] -translate-y-1/2 bg-white/10" />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-400">
                      Finish
                    </div>
                    <div className="mt-2 text-sm font-semibold text-zinc-100">
                      Matte black / steel edge
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-400">
                      Strap
                    </div>
                    <div className="mt-2 text-sm font-semibold text-zinc-100">
                      Black woven NATO
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-lime-300 px-4 py-3 text-zinc-950">
                    <div className="text-[10px] uppercase tracking-[0.28em] opacity-75">
                      Signal
                    </div>
                    <div className="mt-2 text-sm font-semibold">Street ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="collection" className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <SectionTitle
          eyebrow={pageContent.sections[0].eyebrow}
          title={pageContent.sections[0].title}
          description={pageContent.sections[0].description}
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {pageContent.sections[0].items.map((item, index) => (
            <ProductCard key={item.name} item={item} index={index} />
          ))}
        </div>
      </section>

      <section id="craft" className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <SectionTitle
          eyebrow={pageContent.sections[1].eyebrow}
          title={pageContent.sections[1].title}
          description={pageContent.sections[1].description}
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="grid gap-3">
              {pageContent.sections[1].items.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
                >
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">{item.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.26em] text-zinc-400">
                      {item.value}
                    </div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_18px_rgba(214,255,63,0.8)]" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(214,255,63,0.12),rgba(255,255,255,0.02)_30%,rgba(0,0,0,0.22)_70%)] p-6">
            <div className="grid h-full gap-4 md:grid-cols-[1fr_0.75fr]">
              <div className="rounded-[2rem] border border-white/10 bg-zinc-950/60 p-5">
                <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-400">
                  Anatomy
                </div>
                <div className="mt-4 text-2xl font-semibold tracking-tight text-zinc-50">
                  Street gear, engineered like a serious instrument.
                </div>
                <p className="mt-4 text-sm leading-7 text-zinc-300">
                  让材质、边角、刻度和夜光都服务同一个信号：它是一块能上街、能上镜、也能经得起近距离看的手表。
                </p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-black/25 p-5">
                <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-400">
                  Signal
                </div>
                <div className="mt-4 text-5xl font-black tracking-[-0.08em] text-lime-300">
                  100M
                </div>
                <div className="mt-2 text-sm uppercase tracking-[0.26em] text-zinc-300">
                  water resistance
                </div>
                <div className="mt-8 h-px w-full bg-white/10" />
                <div className="mt-4 text-sm leading-6 text-zinc-300">
                  从外观到性能都不能像玩具。雷鬼的街头感必须建立在可靠的基础上。
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="lifestyle" className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <SectionTitle
          eyebrow={pageContent.sections[2].eyebrow}
          title={pageContent.sections[2].title}
          description={pageContent.sections[2].description}
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {pageContent.sections[2].items.map((item, index) => (
            <article
              key={item.name}
              className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.05]"
            >
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-400">
                  0{index + 1}
                </div>
                <div className="rounded-full border border-lime-300/20 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-lime-300">
                  scene
                </div>
              </div>
              <div className="mt-8 aspect-[4/3] rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)),radial-gradient(circle_at_top_left,rgba(214,255,63,0.14),transparent_45%),linear-gradient(180deg,#16161b,#050506)]" />
              <h3 className="mt-5 text-xl font-semibold text-zinc-50">{item.name}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-300">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="manifesto" className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <SectionTitle
          eyebrow={pageContent.sections[3].eyebrow}
          title={pageContent.sections[3].title}
          description={pageContent.sections[3].description}
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <blockquote className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <p className="text-2xl font-semibold leading-tight tracking-tight text-zinc-50 md:text-4xl">
              不做温吞的安全牌，只做一眼能认出的街头物件。
            </p>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
              雷鬼把黑白、酸绿和红点当成品牌语法，像节拍一样稳定重复，却不失攻击性。
            </p>
          </blockquote>

          <div className="grid gap-4">
            {pageContent.sections[3].items.map((item) => (
              <div
                key={item.name}
                className="rounded-[2rem] border border-white/10 bg-black/25 p-6"
              >
                <div className="text-[10px] uppercase tracking-[0.3em] text-lime-300">
                  {item.name}
                </div>
                <p className="mt-4 text-sm leading-7 text-zinc-300">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <SectionTitle
          eyebrow={pageContent.sections[4].eyebrow}
          title={pageContent.sections[4].title}
          description={pageContent.sections[4].description}
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            {pageContent.sections[4].items.map((item) => (
              <div key={item.name} className="border-b border-white/8 py-4 last:border-0">
                <div className="text-xs uppercase tracking-[0.28em] text-zinc-400">
                  {item.name}
                </div>
                <div className="mt-2 text-lg font-semibold text-zinc-50">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(214,255,63,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.22))] p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {["表盘清晰", "夜光可读", "街头穿搭"].map((label) => (
                <div
                  key={label}
                  className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5"
                >
                  <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                    key note
                  </div>
                  <div className="mt-4 text-lg font-semibold text-zinc-50">{label}</div>
                  <div className="mt-3 text-sm leading-7 text-zinc-300">
                    购买决策更快，视觉印象更强。
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="buy" className="mx-auto max-w-7xl px-4 py-16 pb-24 md:px-8">
        <SectionTitle
          eyebrow={pageContent.sections[5].eyebrow}
          title={pageContent.sections[5].title}
          description={pageContent.sections[5].description}
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[2rem] border border-lime-300/20 bg-lime-300 p-8 text-zinc-950">
            <div className="text-[10px] uppercase tracking-[0.28em] opacity-75">
              Official Store
            </div>
            <div className="mt-4 text-3xl font-black tracking-[-0.05em] md:text-5xl">
              把街头节奏，戴进今天的穿搭。
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-7 opacity-80 md:text-base">
              现在下单，获得新品优先和官方售后支持。雷鬼不只是手表，是你每天都能用上的态度道具。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PrimaryButton href="#top">返回顶部</PrimaryButton>
              <PrimaryButton href="mailto:hello@reggae-watch.com" secondary>
                发送咨询
              </PrimaryButton>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-400">
              Channels
            </div>
            <div className="mt-6 grid gap-3">
              {pageContent.sections[5].items.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
                >
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">{item.name}</div>
                    <div className="mt-1 text-sm text-zinc-400">{item.value}</div>
                  </div>
                  <div className="text-lime-300">→</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
