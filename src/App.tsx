import { Dashboard } from "./pages/Dashboard";
import { Simulate } from "./pages/Simulate";
import {DebrisMap} from "./pages/DebrisMap";
import { RiskMonitorPage } from "./pages/RiskMonitorPage"; // NOUVEAU

function App() {
  if (window.location.pathname === "/simulate") return <Simulate />;
  if (window.location.pathname === "/debris-map") return <DebrisMap />;
  // NOUVEAU / FIX: la route /risk-monitor n'existait pas → la page tombait sur le Dashboard
  if (window.location.pathname === "/risk-monitor") return <RiskMonitorPage />;
  return <Dashboard />;
}

export default App;