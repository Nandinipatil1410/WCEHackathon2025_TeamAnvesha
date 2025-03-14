import React from "react";
import "./WeatherForecast.css"; // Assuming you want a unified CSS file

const Card = ({ title, children }) => {
  return (
    <div className="card">
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-content">{children}</div>
    </div>
  );
};

export default Card;
