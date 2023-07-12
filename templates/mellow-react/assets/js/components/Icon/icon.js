// @ts-nocheck
import React from "react";
import PropTypes from "prop-types";

const Icon = ({src, className, alt, size = 16, ...props}) => {
  return ( 
    <div className={`${className ? className : ""} inline-flex`}>
      <img 
        src={src}
        className="items-center justify-center"
        alt={alt ? alt : "Icon"}
        width={size}
        height={size}
        style={{
          maxWidth: "100%",
          height: "auto"
        }}
        {...props}
      />
    </div>
  );
}
 
export default Icon;

Icon.propTypes = {
  size: PropTypes.number
}