import React, { useEffect, useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import type { MenuProps, TableProps } from "antd";
import {
  Breadcrumb,
  Button,
  Col,
  DatePicker,
  Input,
  Layout,
  Menu,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  message,
  theme,
} from "antd";
import axios from "axios";

const { Header, Content, Sider } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;

const items2: MenuProps["items"] = [UserOutlined].map((icon, index) => {
  const key = String(index + 1);

  return {
    key: `sub${key}`,
    icon: React.createElement(icon),
    label: `Dashboard`,

    children: new Array(1).fill(null).map((_, j) => {
      const subKey = index * 4 + j + 1;
      return {
        key: subKey,
        label: `Todo`,
      };
    }),
  };
});

interface DataType {
  _id: string;
  todoName: string;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

const Todo: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [data, setData] = useState<DataType[]>([]);
  const [isModalAdd, setIsModalAdd] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDetail, setIsModalDetail] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<DataType | null>(null);
  const [status, setStatus] = useState<boolean | null>(null);
  const [todoName, setTodoName] = useState<string>("");
  const [selectedTodoDetail, setSelectedTodoDetail] = useState<DataType | null>(
    null
  );

  function formatDate(tanggalString: string) {
    const options: any = {
      weekday: "long",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    };
    const tanggal = new Date(tanggalString);
    const tanggalFormat = tanggal.toLocaleDateString("id-ID", options);
    const [tanggalPart, bulanPart, tahunPart] = tanggalFormat.split("/");
    const formattedTanggal = `${tanggalPart}-${bulanPart.padStart(
      2,
      "0"
    )}-${tahunPart}`;
    return formattedTanggal;
  }

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsModalAdd(false);
    setIsModalDetail(false);
  };

  const handleStatusChange = (value: boolean) => {
    setStatus(value);
  };

  const fetchDataAll = async () => {
    const url = "https://calm-plum-jaguar-tutu.cyclic.app/todos";
    try {
      const response = await axios.get(url);
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchData = async () => {
    let url = "https://calm-plum-jaguar-tutu.cyclic.app/todos";
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      url = `https://calm-plum-jaguar-tutu.cyclic.app/todos/from/${startDate}/to/${endDate}`;
    }
    try {
      const response = await axios.get(url);
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchTodoDetail = async (id: string) => {
    const url = `https://calm-plum-jaguar-tutu.cyclic.app/todos/${id}`;
    try {
      const response = await axios.get(url);
      return response.data.data; // Mengembalikan data detail tugas dari respons API
    } catch (error) {
      console.error("Error fetching todo detail:", error);
      return null;
    }
  };

  const showDetailModal = async (record: DataType) => {
    setSelectedTodo(record);
    setIsModalDetail(true);
    const todoDetail = await fetchTodoDetail(record._id);
    if (todoDetail) {
      console.log("Todo Detail:", todoDetail);
      setSelectedTodoDetail(todoDetail);
    } else {
      console.error("Failed to fetch todo detail.");
    }
  };

  const showModalAdd = () => {
    setIsModalAdd(true);
  };

  const handleAddData = () => {
    if (todoName && status !== null) {
      const url = "https://calm-plum-jaguar-tutu.cyclic.app/todos";
      const newData = { todoName, isComplete: status };

      axios
        .post(url, newData)
        .then((response) => {
          setData([...data, response.data]);
          setIsModalAdd(false);
          fetchData();
          message.success("Todo added successfully!");
        })
        .catch((error) => {
          console.error("Error adding data:", error);
        });
    }
  };

  const showModalEdit = (record: DataType) => {
    setSelectedTodo(record);
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    if (selectedTodo && status !== null) {
      const url = `https://calm-plum-jaguar-tutu.cyclic.app/todos/${selectedTodo._id}`;
      const updatedTodo = { ...selectedTodo, isComplete: status };
      axios
        .put(url, updatedTodo)
        .then((response) => {
          console.log(response);
          const updatedData = data.map((item) => {
            if (item._id === selectedTodo._id) {
              return updatedTodo;
            }
            return item;
          });
          setData(updatedData);
          setIsModalOpen(false);
          message.success("Todo edited successfully!");
        })
        .catch((error) => {
          console.error("Error editing data:", error);
        });
    }
  };

  const handleDelete = (_id: string) => {
    Modal.confirm({
      title: "Confirm",
      content: "Are you sure you want to delete this item?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        const url = `https://calm-plum-jaguar-tutu.cyclic.app/todos/${_id}`;
        axios
          .delete(url)
          .then((response) => {
            console.log(response);
            setData((prevData) => prevData.filter((item) => item._id !== _id));
            message.success("Todo deleted successfully!");
          })
          .catch((error) => {
            console.error("Error deleting data:", error);
          });
      },
    });
  };

  useEffect(() => {
    fetchData();
    fetchDataAll();
  }, [dateRange]);

  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    setDateRange(dateStrings);
  };

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "Name",
      dataIndex: "todoName",
      key: "todoName",
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => <span>{formatDate(text)}</span>,
    },
    {
      title: "Status",
      dataIndex: "isComplete",
      key: "isComplete",
      render: (isComplete: boolean) => (
        <Tag color={isComplete ? "green" : "red"}>
          {isComplete ? "Complete" : "Incomplete"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record: DataType) => (
        <Space size="middle">
          <a style={{ color: "green" }} onClick={() => showDetailModal(record)}>
            Detail
          </a>
          <a style={{ color: "blue" }} onClick={() => showModalEdit(record)}>
            Edit
          </a>
          <a style={{ color: "red" }} onClick={() => handleDelete(record._id)}>
            Delete
          </a>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <div className="demo-logo" />
        <Menu theme="dark" mode="horizontal" style={{ flex: 1, minWidth: 0 }} />
      </Header>
      <Layout>
        <Sider width={200} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            defaultOpenKeys={["sub1"]}
            style={{ height: "100%", borderRight: 0 }}
            items={items2}
          />
        </Sider>
        <Layout style={{ padding: "0 24px 24px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>Todo</Breadcrumb.Item>
          </Breadcrumb>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Row justify="space-between" align="middle">
              <Col>
                <h1 style={{ fontWeight: "bold" }}>To Do List</h1>
              </Col>
              <Col>
                <Button
                  type="primary"
                  style={{ background: "#1890ff", borderColor: "#1890ff" }}
                  onClick={() => showModalAdd()}
                >
                  Add New
                </Button>
              </Col>
            </Row>
            <Row style={{ marginBottom: 16 }}>
              <Col>
                <h1 style={{ fontWeight: "bold" }}>Filter</h1>
                <RangePicker onChange={handleDateRangeChange} />
              </Col>
            </Row>
            <Table columns={columns} dataSource={data} />
          </Content>
        </Layout>
      </Layout>
      <Modal
        title="Edit"
        visible={isModalOpen}
        onOk={handleEdit}
        onCancel={handleCancel}
      >
        <p>Name: {selectedTodo?.todoName}</p>
        <Select
          style={{ width: "100%" }}
          placeholder="Select Status"
          onChange={(value: boolean) => handleStatusChange(value)}
          value={status}
        >
          <Option value={true}>Completed</Option>
          <Option value={false}>Incomplete</Option>
        </Select>
      </Modal>
      <Modal
        title="Add New"
        open={isModalAdd}
        onOk={handleAddData}
        onCancel={handleCancel}
      >
        <h2>Nama Todo</h2>
        <Input
          style={{ width: "100%", marginTop: "6px" }}
          placeholder="Enter Todo Name"
          value={todoName}
          onChange={(e) => setTodoName(e.target.value)}
        />
        <h2 className="mt-2">Status</h2>
        <Select
          style={{ width: "100%", marginTop: "6px" }}
          placeholder="Select Status"
          onChange={handleStatusChange}
          value={status}
        >
          <Option value={true}>Completed</Option>
          <Option value={false}>Incompleted</Option>
        </Select>
      </Modal>
      <Modal
        title="Detail"
        open={isModalDetail}
        onOk={handleCancel}
        onCancel={handleCancel}
      >
        <h2>Nama Todo</h2>
        <Input
          style={{ width: "100%", marginTop: "6px" }}
          placeholder="Enter Todo Name"
          value={selectedTodoDetail?.todoName}
          readOnly
        />
        <h2 className="mt-2">Create Todo</h2>
        <Input
          style={{ width: "100%", marginTop: "6px" }}
          placeholder="Enter Todo Name"
          value={selectedTodoDetail ? formatDate(selectedTodoDetail.createdAt) : ""}
          readOnly
        />
        <h2 className="mt-2">Status Todo</h2>
        <Select
          style={{ width: "100%", marginTop: "6px" }}
          placeholder="Select Status"
          onChange={handleStatusChange}
          value={selectedTodoDetail?.isComplete}
          disabled
        >
          <Option value={true}>Completed</Option>
          <Option value={false}>Incompleted</Option>
        </Select>
      </Modal>
      ;
    </Layout>
  );
};

export default Todo;
