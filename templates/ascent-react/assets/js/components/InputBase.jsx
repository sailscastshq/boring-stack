import '~/css/forms.css'

export default function InputBase({
  name,
  label,
  id,
  icon,
  suffix,
  type,
  placeholder,
  ...props
}) {
  return (
    <label htmlFor={id} className="relative block">
      <span className="block text-lg"> {label}</span>
      <span className="absolute left-2 top-[55%]">{icon}</span>
      <input
        id={id}
        className="block w-full rounded-lg border border-gray/50 bg-white py-3 pl-10 pr-3 shadow-sm placeholder:text-lg placeholder:text-gray focus:outline-none focus:ring-1 focus:ring-gray-100"
        type={type}
        placeholder={placeholder}
        {...props}
      />
      {suffix ? suffix : null}
    </label>
  )
}
