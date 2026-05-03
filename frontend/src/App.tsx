import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router";
import { Signin } from "./screens/Signin";
import { Signup } from "./screens/Signup";
import { Landing } from "./screens/Landing";
import { VideoPage } from "./screens/VideoPage";
import { Upload } from "./screens/Upload";

export function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element= {< Signin />} />
          <Route path="/signup" element= {< Signup />} />
          <Route path="/" element={< Landing /> } />
          <Route path="/watch" element={< VideoPage /> } />
          <Route path="/upload" element={< Upload /> } />
          <Route />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
