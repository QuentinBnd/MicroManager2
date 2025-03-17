import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function ThemeSwitch() {
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  return (
    <div className="">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
          className="sr-only"
        />
        <div className="relative w-14 h-8 bg-gray-300 dark:bg-gray-700 rounded-full">
          <div
            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
              darkMode ? "transform translate-x-6 bg-yellow-400" : ""
            }`}
          ></div>
        </div>
        <span className={`ml-3 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
          {darkMode ? "Dark Mode" : "Light Mode"}
        </span>
      </label>
    </div>
  );
}

export default ThemeSwitch;