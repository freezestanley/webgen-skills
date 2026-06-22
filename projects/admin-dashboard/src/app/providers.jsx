import React from "react";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";

/**
 * 全局 Provider 层
 * 新增全局 context（主题、权限、国际化等）在此统一注入
 */
export default function Providers({ children }) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: "#1677FF",
          borderRadius: 8,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
