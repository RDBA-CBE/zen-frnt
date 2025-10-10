import * as React from "react";
import { cn } from "@/lib/utils";
import { DOMAIN } from "@/utils/constant.utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  domain?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      error,
      type,
      domain = DOMAIN,
      title,
      required,
      ...props
    },
    ref
  ) => {
    const [localValue, setLocalValue] = React.useState("");

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalValue(value);

      // Create the synthetic event with the full email value
      const fullEmail = value + domain;
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: fullEmail,
        },
      };

      // Call the original onChange if provided
      if (props.onChange) {
        props.onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
      }
    };

    // If it's not an email type or no domain needed, use normal input
    if (type !== "email" || !domain) {
      return (
        <>
          {title && (
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {title} {required && <span className="text-red-500">*</span>}
            </label>
          )}
          <input
            type={type}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              error ? "border-red-500 focus-visible:ring-red-500" : "",
              className
            )}
            ref={ref}
            {...props}
          />
          {error && (
            <p className="text-sm text-red-600" id={`${props.name}-error`}>
              {error}
            </p>
          )}
        </>
      );
    }

    return (
      <div className="relative w-full">
         {title && (
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {title} {required && <span className="text-red-500">*</span>}
            </label>
          )}
        <div className="flex items-center border border-input rounded-md bg-transparent overflow-hidden focus-within:outline-none focus-within:ring-1 focus-within:ring-ring">
       
          <input
            type="text"
            value={localValue}
            onChange={handleInputChange}
            className={cn(
              "flex h-10 flex-1 bg-transparent px-3 py-2 text-base border-none outline-none shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              error ? "focus-visible:ring-red-500" : "",
              className
            )}

            // className={cn(
            //   "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            //   error && "border-red-500 focus-visible:ring-red-500", // Add error styling
            //   className
            // )}
            placeholder="username"
            ref={ref}
            {...props}
          />

          {/* Divider */}
          <div className="h-6 w-px bg-border" />

          {/* Domain display */}
          <div className="flex items-center px-3 py-1 text-muted-foreground text-sm bg-muted/30 h-9">
            {domain}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 mt-1" id={`${props.name}-error`}>
            {error}
          </p>
        )}

        {/* Hidden input to maintain form compatibility */}
        <input type="hidden" value={localValue + domain} name={props.name} />
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
