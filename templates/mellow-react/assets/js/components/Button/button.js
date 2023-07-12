import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

const Button = ({ className, children, fullwidth, inactive, href, ...props }) => {
  const styles = {
    primary: `bg-brand text-white ${
      inactive ? "bg-neutral-200 text-zinc-500 pointer-events-none" : ""
    }`,
    outline: `border border-brand text-brand ${
      inactive ? "bg-neutral-200 text-zinc-500 pointer-events-none" : ""
    }`
  };

  const rootClass = clsx(
    className,
    props.variant === "primary" && styles.primary,
    props.variant === "outline" && styles.outline,
    fullwidth ? "w-full" : "min-w-[10rem]",
    inactive && "border-none bg-neutral-200 text-zinc-500 pointer-events-none",
    "text-sm leading-normal font-medium py-2.5 px-6 rounded-[7px] flex items-center justify-center focus:outline-none focus-visible:ring-brand"
  );

  if (href) {
    return (
      <a className={rootClass} href={href} {...props}>
        { children }
      </a>
    )
  };

  return ( 
    <button className={rootClass} {...props}>
      { children }
    </button>
  );
}

export default Button;

Button.propTypes = {
  variant: PropTypes.oneOf(["primary", "outline"]),
  fullwidth: PropTypes.bool,
  inactive: PropTypes.bool,
  href: PropTypes.string,
};