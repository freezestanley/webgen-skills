import React from "react";
import { Card, Form, Input, Button, message } from "antd";
import useAppStore from "../store/appStore.js";

export default function SettingsPage() {
  const { systemName, themeColor, setSystemName, setThemeColor } = useAppStore();
  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue({ systemName, themeColor });
  }, [systemName, themeColor, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSystemName(values.systemName);
      setThemeColor(values.themeColor);
      message.success("设置已保存");
    } catch {
      // 表单校验失败
    }
  };

  const handleReset = () => {
    form.setFieldsValue({ systemName: "后台管理系统", themeColor: "#1677ff" });
    setSystemName("后台管理系统");
    setThemeColor("#1677ff");
    message.info("已恢复默认设置");
  };

  return (
    <div className="max-w-lg">
      <Card title="系统设置" className="rounded-lg shadow-sm">
        <Form form={form} layout="vertical">
          <Form.Item
            label="系统名称"
            name="systemName"
            rules={[{ required: true, message: "请输入系统名称" }, { max: 20, message: "不超过20个字符" }]}
          >
            <Input placeholder="请输入系统名称" maxLength={20} showCount />
          </Form.Item>

          <Form.Item
            label="Logo URL"
            name="logoUrl"
          >
            <Input placeholder="请输入 Logo 图片地址（可选）" />
          </Form.Item>

          <Form.Item
            label="主题色"
            name="themeColor"
            rules={[
              { required: true, message: "请输入主题色" },
              { pattern: /^#[0-9a-fA-F]{6}$/, message: "请输入合法的十六进制颜色，如 #1677ff" },
            ]}
          >
            <div className="flex items-center gap-3">
              <Form.Item name="themeColor" noStyle>
                <Input placeholder="#1677ff" className="flex-1" />
              </Form.Item>
              <Form.Item name="themeColor" noStyle>
                <input
                  type="color"
                  defaultValue={themeColor}
                  onChange={(e) => form.setFieldValue("themeColor", e.target.value)}
                  className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5"
                />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item className="mt-6">
            <div className="flex gap-3">
              <Button type="primary" onClick={handleSave}>
                保存设置
              </Button>
              <Button onClick={handleReset}>
                恢复默认
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
