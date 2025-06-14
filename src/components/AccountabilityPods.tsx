import React, { useState } from 'react';
import { Users, MessageCircle, Trophy, Plus, CheckCircle, Clock, Flame } from 'lucide-react';

interface Pod {
  id: string;
  name: string;
  theme: string;
  members: {
    id: string;
    name: string;
    avatar: string;
    streak: number;
    todayComplete: boolean;
  }[];
  description: string;
  weeklyGoal: string;
  progress: number;
}

export default function AccountabilityPods() {
  const [selectedPod, setSelectedPod] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Handler functions for pod actions
  const handleShareProgress = (podId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Sharing progress to pod: ${podId}`);
    alert('📊 Opening progress sharing interface...');
  };

  const handleCelebrate = (podId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Celebrating in pod: ${podId}`);
    alert('🎉 Sending celebration message to your pod...');
  };

  const handleJoinPod = () => {
    console.log('Joining new pod...');
    alert('🤝 Opening pod matching interface to find your perfect accountability group...');
    setShowJoinModal(false);
  };

  const handleCompleteTodaysGoal = (podId: string) => {
    console.log(`Completing today's goal for pod: ${podId}`);
    alert('✅ Marking today\'s goal as complete and notifying your pod...');
  };

  const userPods: Pod[] = [
    {
      id: 'writers-pod',
      name: 'Morning Writers',
      theme: '✍️ Writing',
      description: 'Write 500 words every morning before 9 AM',
      weeklyGoal: 'Complete 5/7 writing sessions',
      progress: 71,
      members: [
        { id: '1', name: 'Sarah K.', avatar: '👩‍💻', streak: 12, todayComplete: true },
        { id: '2', name: 'Mike R.', avatar: '👨‍🎨', streak: 8, todayComplete: true },
        { id: '3', name: 'You', avatar: '🎯', streak: 15, todayComplete: false },
        { id: '4', name: 'Emma L.', avatar: '👩‍🚀', streak: 6, todayComplete: true },
        { id: '5', name: 'David C.', avatar: '👨‍💼', streak: 9, todayComplete: false }
      ]
    },
    {
      id: 'fitness-pod',
      name: 'Early Birds Fitness',
      theme: '💪 Fitness',
      description: '6 AM workout crew - no excuses!',
      weeklyGoal: 'Complete 4/7 workout sessions',
      progress: 85,
      members: [
        { id: '1', name: 'Alex M.', avatar: '🏃‍♂️', streak: 23, todayComplete: true },
        { id: '2', name: 'Lisa P.', avatar: '🏋️‍♀️', streak: 18, todayComplete: true },
        { id: '3', name: 'You', avatar: '🎯', streak: 11, todayComplete: true },
        { id: '4', name: 'Tom W.', avatar: '🚴‍♂️', streak: 7, todayComplete: false }
      ]
    }
  ];

  const availablePods: Pod[] = [
    {
      id: 'coders-pod',
      name: 'Code & Coffee',
      theme: '💻 Coding',
      description: 'Daily coding practice - 1 hour minimum',
      weeklyGoal: 'Code every weekday',
      progress: 0,
      members: [
        { id: '1', name: 'Jake S.', avatar: '👨‍💻', streak: 45, todayComplete: true },
        { id: '2', name: 'Nina R.', avatar: '👩‍💻', streak: 32, todayComplete: true },
        { id: '3', name: 'Chris L.', avatar: '🧑‍💻', streak: 28, todayComplete: false }
      ]
    },
    {
      id: 'meditation-pod',
      name: 'Mindful Mornings',
      theme: '🧘 Meditation',
      description: '10 minutes of daily meditation',
      weeklyGoal: 'Meditate 7/7 days',
      progress: 0,
      members: [
        { id: '1', name: 'Zen M.', avatar: '🧘‍♀️', streak: 67, todayComplete: true },
        { id: '2', name: 'Peace K.', avatar: '🧘‍♂️', streak: 34, todayComplete: true }
      ]
    }
  ];

  const renderPodCard = (pod: Pod, isJoined: boolean = false) => (
    <div 
      key={pod.id}
      className={`bg-white rounded-xl p-4 border-2 transition-all hover:shadow-lg ${
        selectedPod === pod.id ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      }`}
      onClick={() => setSelectedPod(selectedPod === pod.id ? null : pod.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">{pod.theme.split(' ')[0]}</span>
            <h3 className="font-semibold text-gray-900">{pod.name}</h3>
          </div>
          <p className="text-sm text-gray-600">{pod.description}</p>
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{pod.members.length}/5</span>
        </div>
      </div>

      {/* Members Preview */}
      <div className="flex items-center space-x-2 mb-3">
        {pod.members.slice(0, 4).map((member) => (
          <div key={member.id} className="relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              member.todayComplete ? 'bg-green-100 ring-2 ring-green-500' : 'bg-gray-100'
            }`}>
              {member.avatar}
            </div>
            {member.todayComplete && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-2 h-2 text-white" />
              </div>
            )}
          </div>
        ))}
        {pod.members.length > 4 && (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
            +{pod.members.length - 4}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isJoined && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">{pod.weeklyGoal}</span>
            <span className="font-medium text-blue-600">{pod.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${pod.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        {isJoined ? (
          <div className="flex space-x-2">
            <button 
              onClick={(e) => handleShareProgress(pod.id, e)}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              <span>Chat</span>
            </button>
            <button 
              onClick={(e) => handleCelebrate(pod.id, e)}
              className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
            >
              <CheckCircle className="w-3 h-3" />
              <span>Check In</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowJoinModal(true);
            }}
            className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Join Pod</span>
          </button>
        )}
        
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Trophy className="w-3 h-3" />
          <span>Top streak: {Math.max(...pod.members.map(m => m.streak))} days</span>
        </div>
      </div>

      {/* Expanded View */}
      {selectedPod === pod.id && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Pod Members</h4>
          <div className="space-y-2">
            {pod.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    member.todayComplete ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {member.avatar}
                  </div>
                  <span className="text-sm font-medium">{member.name}</span>
                  {member.todayComplete && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span>{member.streak} days</span>
                </div>
              </div>
            ))}
          </div>
          
          {isJoined && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Today's Challenge</h5>
              <p className="text-sm text-blue-800 mb-3">
                3 out of 5 members have completed today's goal. Don't let your pod down! 💪
              </p>
              <button 
                onClick={() => handleCompleteTodaysGoal(pod.id)}
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Complete Today's Goal
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Accountability Pods</h2>
          <p className="text-gray-600">Small groups, big accountability</p>
        </div>
        <button 
          onClick={() => setShowJoinModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Join Pod</span>
        </button>
      </div>

      {/* Your Pods */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Pods</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userPods.map(pod => renderPodCard(pod, true))}
        </div>
      </div>

      {/* Available Pods */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Discover Pods</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availablePods.map(pod => renderPodCard(pod, false))}
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Join an Accountability Pod</h3>
            <p className="text-gray-600 mb-6">
              Choose a pod that matches your goals. You'll get daily check-ins, peer support, and friendly competition!
            </p>
            
            <div className="space-y-3 mb-6">
              {availablePods.map(pod => (
                <div key={pod.id} className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span>{pod.theme.split(' ')[0]}</span>
                        <span className="font-medium">{pod.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">{pod.description}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {pod.members.length}/5 members
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => setShowJoinModal(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleJoinPod}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Join Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 