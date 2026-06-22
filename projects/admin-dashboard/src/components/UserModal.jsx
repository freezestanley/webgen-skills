import React, { useEffect } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import useUserStore from "../store/userStore.js";

const { Option } = Select;

/**
 * 新增 / 编辑用户 Modal
 * @param {boolean} open - 是否显示
 * @param {object|null} editUser - 编辑时传入用户对象，新增时为 null
 * @param {function} onClose - 关闭回调
 */
export default function UserModal({ open, editUser, onClose }) {
  const [form] = Form.useForm();
  const { addUser, updateUser } = useUserStore();
  const isEdit = !!editUser;

  useEffect(() => {
    if (open) {
      if (isEdit) {
        form.setFieldsValue(editUser);
      } else {
        form.resetFields();
      }
    }
  }, [open, editUser, isEdit, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (isEdit) {
        updateUser(editUser.id, values);
        message.success("用户已更新");
      } else {
        addUser(values);
        message.success("用户已添加");
      }
      onClose();
    } catch {
      // 表单校验失败，不关闭
    }
  };

  return (
    <Modal
      title={isEdit ? "编辑用户" : "新增用户"}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText={isEdit ? "保存" : "添加"}
      cancelText="取消"
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          label="姓名"
          name="name"
          rules={[{ required: true, message: "请输入姓名" }]}
        >
          <Input placeholder="请输入姓名" maxLength={20} />
        </Form.Item>
        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            { required: true, message: "请输入邮箱" },
            { type: "email", message: "邮箱格式不正确" },
          ]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>
        <Form.Item
          label="角色"
          name="role"
          rules={[{ required: true, message: "请选择角色" }]}
        >
          <Select placeholder="请选择角色">
            <Option value="管理员">管理员</Option>
            <Option value="编辑">编辑</Option>
            <Option value="访客">访客</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="状态"
          name="status"
          rules={[{ required: true, message: "请选择状态" }]}
        >
          <Select placeholder="请选择状态">
            <Option value="active">启用</Option>
            <Option value="inactive">禁用</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
