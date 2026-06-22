import React from "react";
import { Layout, Menu, Avatar, Dropdown } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Settings, Menu as MenuIcon,
  LogOut, ChevronLeft, ChevronRight
} from "lucide-react";
import useAppStore from "../store/appStore.js";
import NotificationDropdown from "../components/NotificationDropdown.jsx";

const { Sider, Header, Content } = Layout;

const NAV_ITEMS = [
  { key: "/dashboard", icon: <LayoutDashboard size={16} />, label: "仪表盘" },
  { key: "/users",     icon: <Users size={16} />,           label: "用户管理" },
  { key: "/settings",  icon: <Settings size={16} />,        label: "系统设置" },
];

const USER_MENU_ITEMS = [
  { key: "logout", icon: <LogOut size={14} />, label: "退出登录", danger: true },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { siderCollapsed, toggleSider, systemName } = useAppStore();

  const handleMenuClick = ({ key }) => navigate(key);

  return (
    <Layout className="min-h-screen">
      {/* 侧边栏 */}
      <Sider
        collapsed={siderCollapsed}
        collapsedWidth={80}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) useAppStore.getState().setSiderCollapsed(true);
        }}
        style={{ background: "#001529" }}
        className="fixed left-0 top-0 bottom-0 z-50 overflow-auto"
        width={200}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-5 border-b border-white/8">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          {!siderCollapsed && (
            <span className="text-white font-semibold text-sm ml-3 truncate">{systemName}</span>
          )}
        </div>

        {/* 导航菜单 */}
        <div className="px-3 pt-4 flex-1">
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={NAV_ITEMS}
            onClick={handleMenuClick}
            style={{ background: "transparent", border: "none" }}
          />
        </div>

        {/* 折叠按钮 */}
        <div
          className="flex items-center justify-center h-11 cursor-pointer text-white/40 hover:text-white/80 transition-colors border-t border-white/8 mx-3 mb-2 rounded-lg hover:bg-white/5"
          onClick={toggleSider}
        >
          {siderCollapsed ? <ChevronRight size={15} /> : (
            <div className="flex items-center gap-2 text-xs">
              <ChevronLeft size={15} />
              {!siderCollapsed && <span>收起</span>}
            </div>
          )}
        </div>
      </Sider>

      {/* 右侧主区域 */}
      <Layout style={{ marginLeft: siderCollapsed ? 80 : 200, transition: "margin-left 0.2s" }}>
        {/* 顶部 Header */}
        <Header
          className="flex items-center justify-between sticky top-0 z-40 border-b border-gray-100"
          style={{ background: "#fff", height: 60, padding: "0 24px" }}
        >
          {/* 左侧折叠按钮（移动端） */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={toggleSider}
          >
            <MenuIcon size={18} className="text-gray-500" />
          </button>

          <div className="flex-1" />

          {/* 右侧操作区 */}
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="w-px h-5 bg-gray-200" />
            <Dropdown
              menu={{
                items: USER_MENU_ITEMS,
                onClick: ({ key }) => {
                  if (key === "logout") window.location.reload();
                },
              }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <div className="flex items-center gap-2 cursor-pointer select-none px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                <Avatar src="https://i.pravatar.cc/40?img=10" size={30} />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-700 leading-none">管理员</p>
                  <p className="text-xs text-gray-400 mt-0.5">超级管理员</p>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* 页面内容 */}
        <Content className="p-6 min-h-[calc(100vh-60px)]" style={{ background: "#f7f8fc" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
