import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/base.css";
import "./styles/controls.css";
import "./styles/slider.css";
import "./styles/menu.css";
import "./styles/toast.css";
import "./styles/info.css";
import "./styles/empty.css";

createRoot(document.getElementById("root")!).render(<App />);
