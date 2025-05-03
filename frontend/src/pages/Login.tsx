import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const App: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("/bk_background.jpg")' }}>
      <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="BK Logo" className="w-10 h-10" />
          <span className="font-bold">
            Ho Chi Minh City University of Technology – VNU (HCMUT)
          </span>
        </div>
        <button className="bg-white text-black px-3 py-1 rounded flex items-center gap-1">
          <span>👤</span> Login
        </button>
      </div>

      <div className="flex justify-center items-center mt-10">
        <div className="bg-white rounded-2xl shadow-xl px-10 py-8 text-center w-[350px]">
          <img src="/logo.jpg" alt="BK Logo" className="w-24 mx-auto mb-4" />
          <h2 className="text-blue-600 mb-4 font-semibold">Select an Option</h2>
          {["Student", "Manager", "Technician"].map((role) => (
            <button
              key={role}
              onClick={() => setSelected(role)}
              className={`w-full my-2 py-2 rounded text-white flex items-center justify-center gap-2 ${
                selected === role
                  ? role === "Manager"
                    ? "bg-black"
                    : "bg-blue-700"
                  : "bg-blue-500"
              }`}
            >
              {role === "Student" && "🧑‍🎓"}
              {role === "Manager" && "📄"}
              {role === "Technician" && "🛠️"}
              {role}
            </button>
          ))}
          {selected && (
            <div className="mt-4 space-y-2">
              <input
                type="text"
                placeholder="Username"
                className="w-full px-2 py-1 border rounded"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-2 py-1 border rounded"
              />


          <button
            onClick={() => navigate("/booking")} 
            className="bg-blue-500 text-white px-4 py-1 rounded"
          >
            Login
          </button>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;