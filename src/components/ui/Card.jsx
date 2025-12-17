import React from 'react';
import { cn } from '../../utils/cn';

export function Card({ className, children, ...props }) {
    return (
        <div className={cn('bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-6', className)} {...props}>
            {children}
        </div>
    );
}

export function CardHeader({ className, children }) {
    return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ className, children }) {
    return <h2 className={cn('text-xl font-bold text-white', className)}>{children}</h2>;
}

export function CardContent({ className, children }) {
    return <div className={cn('', className)}>{children}</div>;
}
