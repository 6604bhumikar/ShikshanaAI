import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MathJaxContext } from "better-react-mathjax";
import "./index.css";

const config = {
  loader: {
    load: ["input/tex", "output/chtml"],
  },
  tex: {
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    displayMath: [["$$", "$$"], ["\\[", "\\]"]],
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MathJaxContext config={config}>
      <App />
    </MathJaxContext>
  </React.StrictMode>
);

