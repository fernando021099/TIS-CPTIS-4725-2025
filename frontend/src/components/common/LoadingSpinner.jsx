export default function LoadingSpinner({ size = 'md', className = '' }) {
    const sizeClasses = {
      sm: 'h-6 w-6 border-2',
      md: 'h-8 w-8 border-3',
      lg: 'h-12 w-12 border-4'
    }
  
    return (
      <div className={`flex justify-center items-center ${className}`}>
        <div
          className={`animate-spin rounded-full border-t-transparent ${sizeClasses[size]} border-blue-500`}
        />
      </div>
    )
  }