import React from "react";
import { ConfigProvider, theme } from "antd";
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
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#d6ff3f",
          colorBgBase: "#09090b",
          colorTextBase: "#f4f4f5",
          borderRadius: 18,
          fontFamily: '"Manrope", "Arial", sans-serif'
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
