import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Student {
  id: number;
  name: string;
  email: string;
  lastActive: string;
  progress: number;
  nextMeeting?: string;
}

interface Appointment {
  id: number;
  studentName: string;
  date: string;
  time: string;
  topic: string;
}

interface CounselorDashboardProps {
  userName: string;
}

export default function CounselorDashboard({ userName }: CounselorDashboardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    // Mock data - in a real app, this would come from an API
    setStudents([
      {
        id: 1,
        name: 'Rishi',
        email: 'Rishi@example.com',
        lastActive: '2024-03-15',
        progress: 100,
        nextMeeting: '2024-03-20'
      },
      {
        id: 2,
        name: 'Shrey Mehta',
        email: 'shreymehta@example.com',
        lastActive: '2024-03-14',
        progress: 60
      },
      {
        id: 3,
        name: 'Yash',
        email: 'yash@example.com',
        lastActive: '2024-03-13',
        progress: 90,
        nextMeeting: '2024-03-22'
      }
    ]);

    setAppointments([
      {
        id: 1,
        studentName: 'Rishi',
        date: '2024-03-20',
        time: '10:00 AM',
        topic: 'Career Path Discussion'
      },
      {
        id: 2,
        studentName: 'Shrey',
        date: '2024-03-22',
        time: '2:00 PM',
        topic: 'Resume Review'
      }
    ]);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left Column - Student List */}
      <div className="lg:col-span-2">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Your Students</h2>
            <Link 
              href="/students/add"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add New Student
            </Link>
          </div>
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.email}</p>
                  <p className="text-xs text-gray-500">Last active: {student.lastActive}</p>
                </div>
                <div className="text-right">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-600">Progress: {student.progress}%</span>
                    <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-2 bg-blue-600 rounded-full" 
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  {student.nextMeeting && (
                    <p className="text-xs text-gray-500">Next meeting: {student.nextMeeting}</p>
                  )}
                  <Link 
                    href={`/students/${student.id}`}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Appointments and Quick Actions */}
      <div className="space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {appointment.studentName}
                    </h3>
                    <p className="text-sm text-gray-600">{appointment.topic}</p>
                    <p className="text-sm text-gray-500">
                      {appointment.date} at {appointment.time}
                    </p>
                  </div>
                  <button className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Link 
            href="/appointments"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View All Appointments →
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/schedule" className="block p-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100">
              Schedule Appointment
            </Link>
            <Link href="/resources" className="block p-3 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100">
              Career Resources
            </Link>
            <Link href="/reports" className="block p-3 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100">
              Generate Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 