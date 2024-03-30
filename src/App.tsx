
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Pages/authentication/Login";
import Register from "./Pages/authentication/Register";
import Todo from "./Pages/todo/todo";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/"element={<Todo />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
