import React, { useState } from "react";
import { Card, Input, Button, Table, Avatar, Tag, Popconfirm, message, Empty } from "antd";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import useUserStore from "../store/userStore.js";
import UserModal from "../components/UserModal.jsx";

export default function UsersPage() {
  const { searchKeyword, setSearchKeyword, getFilteredUsers, deleteUser, currentPage, pageSize, setCurrentPage } = useUserStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const filteredUsers = getFilteredUsers();

  const handleAdd = () => {
    setEditUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    deleteUser(id);
    message.success("用户已删除");
  };

  const columns = [
    {
      title: "用户",
      key: "user",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.avatar}
            onError={(e) => { e.target.src = "https://i.pravatar.cc/40"; }}
            size={36}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{record.name}</p>
            <p className="text-xs text-gray-500 truncate">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const colorMap = { 管理员: "blue", 编辑: "green", 访客: "default" };
        return <Tag color={colorMap[role] || "default"}>{role}</Tag>;
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "success" : "error"}>
          {status === "active" ? "启用" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Button
            type="text"
            size="small"
            icon={<Pencil size={14} />}
            onClick={() => handleEdit(record)}
            className="text-blue-500 hover:text-blue-600"
          />
          <Popconfirm
            title="确认删除该用户？"
            description="删除后无法恢复。"
            onConfirm={() => handleDelete(record.id)}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              size="small"
              icon={<Trash2 size={14} />}
              className="text-red-500 hover:text-red-600"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card
        className="rounded-xl border-0 shadow-md"
        title={
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-1">
            <div>
              <p className="text-base font-semibold text-gray-800">用户列表</p>
              <p className="text-xs text-gray-400 font-normal mt-0.5">共 {filteredUsers.length} 名用户</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:ml-auto">
              <Input
                prefix={<Search size={13} className="text-gray-400" />}
                placeholder="搜索姓名、邮箱、角色..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                allowClear
                className="sm:w-60"
                size="middle"
              />
              <Button type="primary" icon={<Plus size={14} />} onClick={handleAdd}>
                新增用户
              </Button>
            </div>
          </div>
        }
      >
        {/* 用户表格 */}
        <Table
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          size="middle"
          locale={{ emptyText: <Empty description="暂无用户" imageStyle={{ height: 40 }} /> }}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredUsers.length,
            onChange: setCurrentPage,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 600 }}
          rowClassName="hover:bg-blue-50/40 transition-colors"
        />
      </Card>

      <UserModal
        open={modalOpen}
        editUser={editUser}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
