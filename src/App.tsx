import { Dashboard } from "./pages/Dashboard";
import { Simulate } from "./pages/Simulate";

function App() {
  return window.location.pathname === "/simulate" ? <Simulate /> : <Dashboard />;
}

export default App;
