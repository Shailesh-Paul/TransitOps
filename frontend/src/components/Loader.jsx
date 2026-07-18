import { FiLoader } from 'react-icons/fi';

export default function Loader({ message = 'Loading...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4 text-primary-600">
      <FiLoader className="w-10 h-10 animate-spin" />
      {message && <p className="text-sm font-medium animate-pulse">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="p-8 flex justify-center">{content}</div>;
}
