/**
 * Card Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

export default function Card({ children, className = '', ...props }: CardProps) {
    return (
        <div
            className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: CardProps) {
    return (
        <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
            {children}
        </div>
    );
}

export function CardContent({ children, className = '' }: CardProps) {
    return (
        <div className={`px-6 py-4 ${className}`}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = '' }: CardProps) {
    return (
        <div className={`flex items-center p-6 pt-0 ${className}`}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className = '' }: CardProps) {
    return (
        <h3 className={`font-semibold leading-none tracking-tight ${className}`}>
            {children}
        </h3>
    );
}

export function CardDescription({ children, className = '' }: CardProps) {
    return (
        <p className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
            {children}
        </p>
    );
}
