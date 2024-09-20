export default function InputBase({
  name,
  value,
  onChange,
  label,
  id,
  icon,
  suffix,
  type,
  placeholder
}) {
  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="mb-1 block text-lg">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={`block w-full rounded-lg border border-gray-300 bg-white py-2 ${
            icon ? 'pl-10' : 'pl-3'
          } pr-3 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          value={value}
          onChange={onChange}
          type={type}
          placeholder={placeholder}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}
