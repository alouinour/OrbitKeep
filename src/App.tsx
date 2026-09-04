import { Dashboard } from "./pages/Dashboard";
import { Simulate } from "./pages/Simulate";
import {DebrisMap} from "./pages/DebrisMap";

function App() {
  if (window.location.pathname === "/simulate") return <Simulate />;
  if (window.location.pathname === "/debris-map") return <DebrisMap />;
  return <Dashboard />;
}

export default App;
