import Link from 'next/link';

interface CourseCardProps {
  id: string;
  name: string;
  courseId: string;
  points: number;
  description: string;
  moduleCount: number;
  createdAt: string;
}

export default function CourseCard({
  id,
  name,
  courseId,
  points,
  description,
  moduleCount,
  createdAt
}: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{name}</h3>
        
        <div className="text-sm text-gray-600 mb-4">
          <div><span className="font-medium">Course ID:</span> {courseId}</div>
          <div><span className="font-medium">Points:</span> {points}</div>
          <div><span className="font-medium">Modules:</span> {moduleCount}</div>
          <div><span className="font-medium">Created:</span> {new Date(createdAt).toLocaleDateString()}</div>
        </div>
        
        {description && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Description:</h4>
            <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
          </div>
        )}
        
        <Link 
          href={`/courses/${id}`}
          className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View Course
        </Link>
      </div>
    </div>
  );
} 