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
