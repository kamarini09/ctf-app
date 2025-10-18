// components/ui/Button.tsx
export function Button({ variant = "solid", size = "md", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "outline" | "ghost"; size?: "sm" | "md" }) {
  const base = "inline-flex items-center justify-center font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ctf-red)]";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2" }[size];
  const variants = {
    solid: "bg-[var(--ctf-red)] text-white hover:bg-[var(--ctf-red-600)]",
    outline: "border-2 border-[var(--ctf-red)] text-[var(--ctf-red)] hover:bg-[var(--ctf-red)]/5",
    ghost: "text-[var(--ctf-red)] hover:bg-[var(--ctf-red)]/5",
  }[variant];
  return <button className={`${base} ${sizes} ${variants} rounded-none ${className}`} {...props} />;
}

// components/ui/Input.tsx
export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`w-full border-2 border-gray-300 px-3 py-2 focus:border-[var(--ctf-red)] focus:outline-none rounded-none ${className}`} {...props} />;
}
