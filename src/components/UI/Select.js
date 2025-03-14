import React from "react";

const Select = ({ value, onChange, options }) => {
  return (
    <select
      className="border border-gray-300 rounded-md p-2 text-black"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
