import React from "react";
import { Dropdown, Badge, List, Button, Empty } from "antd";
import { Bell } from "lucide-react";
import useNotifyStore from "../store/notifyStore.js";

export default function NotificationDropdown() {
  const { notifications, markAllRead, markRead } = useNotifyStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const overlay = (
    <div className="bg-white rounded-lg shadow-lg w-80 border border-gray-100">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="font-semibold text-gray-800">通知</span>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={markAllRead} className="p-0 text-xs">
            全部已读
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="py-8">
          <Empty description="暂无通知" imageStyle={{ height: 40 }} />
        </div>
      ) : (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!item.read ? "bg-blue-50" : ""}`}
              onClick={() => markRead(item.id)}
            >
              <div className="w-full min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800 truncate">{item.title}</span>
                  {!item.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 ml-2" />}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{item.desc}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Dropdown dropdownRender={() => overlay} trigger={["click"]} placement="bottomRight">
      <Badge count={unreadCount} size="small" className="cursor-pointer">
        <Bell size={20} className="text-gray-600 hover:text-blue-500 transition-colors" />
      </Badge>
    </Dropdown>
  );
}
