import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Token from "./pages/Token";

function Home() {
  return <h2>Home</h2>;
}

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/token/123">Token 123</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/token/:tokenId" element={<Token  />} />
      </Routes>
    </Router>
  );
}

export default App;
