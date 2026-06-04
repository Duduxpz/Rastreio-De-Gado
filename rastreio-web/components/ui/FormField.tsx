interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({
  label,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-2">
        {label}
        {required && <span className="text-danger-DEFAULT ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
